import type { HostClient } from '@openchamber/sdk';
import { mountButton, mountTextField, type ButtonHandle, type TextFieldHandle } from '@openchamber/sdk/ui';
import { IMPORT_NOTICE } from './constants.js';
import { formatBytes, pause, serviceRequest } from './panel-api.js';
import type { RecordData } from './types.js';

/** Both input methods converge on an explicit preview/confirmation, never an automatic import. */
export class ImportPanel {
  private path = ''; private directory = ''; private directoryEdited = false; private busy = false; private cancelled = false;
  private preview?: RecordData; private uploadID = ''; private uploaded = false; private file?: File;
  private operation?: { kind: 'transfer' | 'import'; id: string };
  private pathControl: TextFieldHandle; private directoryControl: TextFieldHandle;
  private upload: ButtonHandle; private inspect: ButtonHandle; private confirm: ButtonHandle; private cancel: ButtonHandle; private open: ButtonHandle;
  private sessions: string[] = [];
  private lastImportID = '';
  private jobIDControl: TextFieldHandle;
  private check: ButtonHandle;
  constructor(private host: HostClient, root: HTMLElement) {
    root.innerHTML = `<h2>Import a session archive</h2>
      <p><em id="import-notice">${IMPORT_NOTICE}</em></p>
      <p class="small">Import only trusted archives. Restored instructions and pinned content can influence the agent when you continue the new session.</p>
      <p class="muted small">Choose a ZIP on this device, or provide a ZIP path on the selected OpenChamber server after moving it with Files, SFTP, or another tool.</p>
      <label class="small" for="import-file">ZIP on this device</label><input id="import-file" type="file" accept=".zip,application/zip">
      <div id="upload-button" class="buttons"></div><div id="import-path"></div><div id="import-directory"></div>
      <div class="buttons"><span id="inspect-import"></span><span id="confirm-import"></span><span id="cancel-import"></span></div>
      <pre id="import-preview" class="small"></pre><p id="import-status" role="status" aria-live="polite"></p><p id="import-error" role="alert"></p><div id="open-imported" class="buttons"></div>
      <div id="import-job-id"></div><div id="check-import" class="buttons"></div>`;
    const get = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
    const fileInput = root.querySelector<HTMLInputElement>('#import-file')!;
    fileInput.onchange = () => { this.file = fileInput.files?.[0]; this.uploadID = ''; this.uploaded = false; this.invalidate(); };
    this.pathControl = mountTextField(get('import-path'), { label: 'ZIP path on this server', value: '', mono: true, onChange: value => { this.path = value; this.uploaded = false; this.invalidate(); } });
    this.directoryControl = mountTextField(get('import-directory'), { label: 'Destination working directory on this server', value: '', mono: true, onChange: value => { this.directoryEdited = true; this.directory = value; this.invalidate(); } });
    this.upload = mountButton(get('upload-button'), { label: 'Upload selected ZIP', onClick: () => void this.uploadFile() });
    this.inspect = mountButton(get('inspect-import'), { label: 'Preview import', onClick: () => void this.inspectArchive() });
    this.confirm = mountButton(get('confirm-import'), { label: 'Import as new session', disabled: true, onClick: () => void this.importArchive() });
    this.cancel = mountButton(get('cancel-import'), { label: 'Cancel', variant: 'outline', disabled: true, onClick: () => void this.cancelOperation() });
    this.open = mountButton(get('open-imported'), { label: 'Open imported session', disabled: true, onClick: () => { if (this.sessions[0]) void host.openSession(this.sessions[0]); } });
    this.jobIDControl = mountTextField(get('import-job-id'), { label: 'Import job ID (status only)', value: '', mono: true, onChange: value => { this.lastImportID = value.trim(); this.refresh(); } });
    this.check = mountButton(get('check-import'), { label: 'Check import result', variant: 'outline', disabled: true, onClick: () => void this.run(() => this.pollImport(this.lastImportID)) });
    const setDirectory = (directory: string | null) => { if (!this.directoryEdited && !this.busy && this.directory !== (directory ?? '')) { this.directory = directory ?? ''; this.directoryControl.update({ value: this.directory }); this.invalidate(); } };
    host.onReady(context => setDirectory(context.directory)); host.onDirectory(setDirectory);
    this.refresh();
  }
  private text(id: string, text: string) { document.getElementById(id)!.textContent = text; }
  private invalidate() { this.preview = undefined; this.text('import-preview', ''); this.refresh(); }
  private refresh() {
    this.pathControl.update({ disabled: this.busy }); this.directoryControl.update({ disabled: this.busy });
    (document.getElementById('import-file') as HTMLInputElement).disabled = this.busy;
    this.upload.update({ disabled: this.busy || !this.file });
    this.inspect.update({ disabled: this.busy || !this.directory || !this.path && !this.uploaded });
    this.confirm.update({ disabled: this.busy || !this.preview });
    this.cancel.update({ disabled: !this.busy }); this.open.update({ disabled: !this.sessions.length });
    this.jobIDControl.update({ disabled: this.busy }); this.check.update({ disabled: this.busy || !this.lastImportID });
  }
  private async run(work: () => Promise<void>) {
    if (this.busy) return;
    this.busy = true; this.cancelled = false; this.text('import-error', ''); this.refresh();
    try { await work(); } catch (error) { this.text('import-error', error instanceof Error ? error.message : 'Import operation failed.'); }
    finally { this.operation = undefined; this.busy = false; this.refresh(); }
  }
  private async pollTransfer(id: string): Promise<RecordData> {
    this.operation = { kind: 'transfer', id };
    for (;;) {
      const value = await serviceRequest(this.host, '/transfer/job', 'GET', undefined, { id });
      if (value.state === 'ready') return value.result;
      if (['failed', 'cancelled'].includes(value.state)) throw new Error(value.error ?? value.progress);
      this.text('import-status', value.progress); await pause();
    }
  }
  private async uploadFile() {
    const file = this.file; if (!file) return;
    await this.run(async () => {
      // Keep a failed upload's opaque ID so the same selected File can resume
      // from the server's acknowledged offset without replaying an import.
      const current = this.uploadID ? await serviceRequest(this.host, '/uploads/status', 'GET', undefined, { id: this.uploadID })
        : await serviceRequest(this.host, '/uploads/start', 'POST', { name: file.name, size: file.size });
      this.uploadID = current.id;
      for (let offset = current.received; offset < file.size;) {
        if (this.cancelled) { await serviceRequest(this.host, '/uploads/cancel', 'POST', { id: this.uploadID }); this.uploadID = ''; throw new Error('Upload cancelled; no session was imported.'); }
        const bytes = new Uint8Array(await file.slice(offset, offset + 32768).arrayBuffer());
        let binary = ''; for (const byte of bytes) binary += String.fromCharCode(byte);
        const digest = crypto.subtle ? await crypto.subtle.digest('SHA-256', bytes) : undefined;
        const sha256 = digest ? Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('') : undefined;
        const ack = await serviceRequest(this.host, '/uploads/chunk', 'POST', { id: this.uploadID, offset, base64: btoa(binary), sha256 });
        offset = ack.received; this.text('import-status', `Uploading ${file.name}: ${Math.floor(offset / file.size * 100)}%`);
      }
      if (this.cancelled) { await serviceRequest(this.host, '/uploads/cancel', 'POST', { id: this.uploadID }); this.uploadID = ''; throw new Error('Upload cancelled; no session was imported.'); }
      const completed = await serviceRequest(this.host, '/uploads/finish', 'POST', { id: this.uploadID });
      const upload = await this.pollTransfer(completed.id);
      this.uploaded = true; this.preview = undefined;
      this.text('import-status', `Uploaded ${file.name} (${formatBytes(upload.size)}). Preview the archive before importing.`);
    });
  }
  private async inspectArchive() {
    await this.run(async () => {
      this.preview = undefined;
      const started = await serviceRequest(this.host, '/imports/prepare', 'POST', { directory: this.directory, ...(this.uploaded ? { uploadID: this.uploadID } : { path: this.path }) });
      const preview = await this.pollTransfer(started.id);
      if (this.cancelled) throw new Error('Preparation cancelled; no session was imported.');
      this.preview = preview;
      this.text('import-preview', [
        `Profile: ${preview.profile}\n${preview.sessionCount} session(s), ${preview.messageCount} message(s), ${preview.fileCount} file(s)`,
        `ZIP: ${formatBytes(preview.compressedBytes)} · Expanded: ${formatBytes(preview.uncompressedBytes)}`,
        `Working directory: ${preview.directory}`, `Restored files: ${preview.restoredDirectory}`, `Import job ID: ${preview.id}`, 'Existing sessions and files will not be overwritten.',
        ...(preview.dependencies ?? []),
        ...(preview.warnings ?? []),
      ].join('\n\n'));
      this.text('import-status', 'Review the preview, then confirm creation of a new session.');
    });
  }
  private async importArchive() {
    const preview = this.preview; if (!preview) return;
    await this.run(async () => {
      // Invalidate confirmation before dispatch. If its acknowledgement is lost,
      // only status may be retried, never the mutation behind this button.
      this.preview = undefined; this.sessions = []; this.lastImportID = preview.id;
      this.jobIDControl.update({ value: preview.id }); this.operation = { kind: 'import', id: preview.id };
      await serviceRequest(this.host, '/imports/start', 'POST', { id: preview.id }).catch(() => this.text('import-status', 'Submission acknowledgement unavailable. Checking the job without resubmitting…'));
      await this.pollImport(preview.id);
    });
  }
  private async pollImport(id: string) {
    this.operation = { kind: 'import', id };
    for (;;) {
      const state = await serviceRequest(this.host, '/imports/status', 'GET', undefined, { id });
      this.sessions = state.sessions ?? [];
      if (this.sessions.includes(state.mainSessionID)) this.sessions = [state.mainSessionID, ...this.sessions.filter(session => session !== state.mainSessionID)];
      this.open.update({ disabled: !this.sessions.length });
      const details = [state.progress, this.sessions.length ? `${this.sessions.length} new session(s) created` : '', state.restoredFileCount ? `${state.restoredFileCount} file(s) restored in ${state.restoredDirectory}` : '',
        state.activeFile ? `Possibly partial file: ${state.activeFile}` : '', state.uncertainSessions?.length ? `Uncertain session IDs: ${state.uncertainSessions.join(', ')}` : ''].filter(Boolean);
      this.text('import-status', details.join(' · '));
      if (state.state === 'ready') return;
      if (['failed', 'cancelled', 'prepared'].includes(state.state)) throw new Error(`${state.error ?? state.progress} Already-created sessions and files were preserved. Check this job again before another import.`);
      await pause();
    }
  }
  private async cancelOperation() {
    this.cancelled = true;
    const operation = this.operation;
    if (!operation) { this.text('import-status', 'Cancelling after the current upload block…'); return; }
    try { await serviceRequest(this.host, operation.kind === 'import' ? '/imports/cancel' : '/transfer/cancel', 'POST', { id: operation.id }); }
    catch (error) { this.text('import-error', error instanceof Error ? error.message : 'Cancellation failed.'); }
  }
}
