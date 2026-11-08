import { connectHost, isGuestSessionItem, type HostClient, type SessionSnapshot } from '@openchamber/sdk';
import { applyHostReady, mountButton, mountCheckbox, mountTextField, type ButtonHandle, type CheckboxHandle, type TextFieldHandle } from '@openchamber/sdk/ui';
import { isLocalDesktop } from './client-context.js';
import type { AssetCandidate, ExportTarget, JobStatus, PreparedExport, RecordData } from './types.js';

/** The host owns navigation; each user action owns an immutable export target. */
class ExportPanel {
  private directory = '';
  private session: SessionSnapshot | null = null;
  private epoch = 0;
  private busy = false;
  private includeFiles = false;
  private outputDirectory = '';
  private preview?: PreparedExport;
  private selected = new Set<string>();
  private assetControls: CheckboxHandle[] = [];
  private next: number | null = null;
  private resultPath = '';
  private primary: ButtonHandle;
  private create: ButtonHandle;
  private copy: ButtonHandle;
  private more: ButtonHandle;
  private inclusion: CheckboxHandle;
  private output: TextFieldHandle;
  private nativeDestination = isLocalDesktop(navigator.userAgent, Array.from(location.ancestorOrigins ?? []));
  private destinationJob = '';

  constructor(private host: HostClient) {
    document.querySelector('#app')!.innerHTML = `
      <header><h1>Session Export</h1><p class="muted">Archive the selected conversation.</p></header>
      <section class="target" aria-label="Selected session"><strong id="session-title">No session selected</strong><code id="session-id"></code></section>
      <p class="note">ZIP includes readable Markdown, projected JSON, sub-sessions and available durable events. Only host-exposed reasoning can be exported.</p>
      <div id="include-files"></div><p class="muted small">External files are not inspected unless enabled. Embedded data already stored in the transcript remains in JSON.</p>
      <p id="destination-note" class="muted small"></p><div id="output-directory"></div>
      <div class="buttons"><span id="export-button"></span></div>
      <section id="inventory" hidden><h2>Review local files</h2><p class="muted small">Select files explicitly. Limits: 100 MiB per file, 500 MiB in total. Symbolic links and remote resources are not collected.</p><div id="asset-list"></div><div class="buttons"><span id="more-button"></span><span id="create-button"></span></div></section>
      <p id="status" role="status" aria-live="polite"></p><p id="error" role="alert"></p>
      <section id="result" hidden><h2>Saved archive</h2><code id="result-path"></code><div class="buttons" id="copy-button"></div></section>
      <p id="warnings" class="small warning"></p>
      <footer class="muted small">Archives are saved on the OpenChamber server machine. They may contain secrets. An ordinary ZIP is not encrypted.</footer>`;
    this.inclusion = mountCheckbox(this.element('include-files'), { label: 'Include referenced local files', checked: false, onChange: checked => {
      this.includeFiles = checked; this.clearPreview(); this.refresh();
    } });
    this.output = mountTextField(this.element('output-directory'), { label: 'Output directory', value: '', placeholder: 'Default: Downloads/OpenChamber-Exports', mono: true, onChange: value => { this.outputDirectory = value; } });
    this.primary = mountButton(this.element('export-button'), { label: 'Export session', disabled: true, onClick: () => void this.prepare() });
    this.create = mountButton(this.element('create-button'), { label: 'Create archive', onClick: () => void this.createArchive() });
    this.copy = mountButton(this.element('copy-button'), { label: 'Copy path', variant: 'outline', onClick: () => {
      if (this.resultPath) void this.host.writeClipboard(this.resultPath).catch(() => this.text('error', 'The archive is saved, but its path could not be copied.'));
    } });
    this.more = mountButton(this.element('more-button'), { label: 'Load more files', variant: 'outline', onClick: () => void this.loadMore() });
    host.onReady(context => { applyHostReady(context, document.documentElement); this.context(context.directory ?? '', context.session); });
    host.onDirectory(directory => { if ((directory ?? '') !== this.directory) this.context(directory ?? '', null); });
    host.onSession(session => this.context(this.directory, session));
    host.onItem(item => {
      if (isGuestSessionItem(item) && item.action === 'export-session') this.context(item.directory ?? '', { id: item.sessionId, title: item.sessionTitle, busy: false });
    });
  }

  private element(id: string): HTMLElement { return document.getElementById(id)!; }
  private text(id: string, value: string): void { this.element(id).textContent = value; }

  private context(directory: string, session: SessionSnapshot | null): void {
    if (directory !== this.directory || session?.id !== this.session?.id) {
      if (this.destinationJob) void this.request('/destination/cancel', 'POST', { id: this.destinationJob }).catch(() => {});
      this.epoch++; this.includeFiles = false; this.clearPreview(); this.resultPath = '';
      this.element('result').hidden = true;
      for (const id of ['status', 'error', 'warnings']) this.text(id, '');
    }
    this.directory = directory; this.session = session;
    this.text('session-title', session?.title ?? 'No session selected'); this.text('session-id', session?.id ?? '');
    this.refresh();
  }

  private target(): ExportTarget {
    if (!this.session || !this.directory) throw new Error('Select a session with a working directory first.');
    return { sessionID: this.session.id, title: this.session.title, directory: this.directory };
  }

  private refresh(): void {
    this.primary.update({ label: this.includeFiles ? 'Review files' : 'Export session', disabled: this.busy || !this.session || !this.directory, loading: this.busy });
    this.inclusion.update({ checked: this.includeFiles, disabled: this.busy || !this.session });
    this.create.update({ disabled: this.busy || !this.preview }); this.copy.update({ disabled: !this.resultPath });
    this.more.update({ disabled: this.busy || this.next === null });
    this.output.update({ disabled: this.busy });
    this.element('output-directory').hidden = this.nativeDestination;
    this.text('destination-note', this.nativeDestination ? 'A Windows Save As dialog will open for each archive. Cancel closes it without writing a ZIP.' : 'The output path is on the OpenChamber server, not necessarily this device.');
  }

  private clearPreview(): void {
    this.preview = undefined; this.selected.clear(); this.next = null;
    for (const control of this.assetControls) control.dispose(); this.assetControls = [];
    this.element('asset-list').replaceChildren(); this.element('inventory').hidden = true;
  }

  private begin(): void {
    this.busy = true; this.resultPath = ''; this.element('result').hidden = true;
    this.text('error', ''); this.text('warnings', ''); this.text('status', 'Preparing export…'); this.refresh();
  }

  private async request(path: string, method: 'GET' | 'POST', data?: unknown, query?: Record<string, string>): Promise<RecordData> {
    const response = await this.host.serviceRequest({ path, method, query, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    let result: RecordData;
    try { result = JSON.parse(response.body); } catch { throw new Error('The extension service returned invalid metadata.'); }
    if (response.status < 200 || response.status >= 300) throw new Error(result.error ?? 'The extension service is unavailable.');
    return result;
  }

  private async poll(id: string): Promise<JobStatus & RecordData> {
    for (;;) {
      const job = await this.request('/job', 'GET', undefined, { id });
      if (job.state === 'failed') throw new Error(job.error ?? 'The operation failed.');
      if (job.state === 'ready') return job as JobStatus & RecordData;
      this.text('status', String(job.progress ?? 'Working…'));
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  private async prepare(): Promise<void> {
    if (this.busy) return;
    const target = this.target(), epoch = this.epoch, includeFiles = this.includeFiles;
    this.clearPreview(); this.begin();
    try {
      const started = await this.request('/prepare', 'POST', { target, inspectFiles: includeFiles });
      const ready = await this.poll(started.id);
      if (includeFiles) {
        if (epoch !== this.epoch) { this.text('status', 'The previous session was prepared. Review files again for the newly selected session.'); return; }
        this.preview = ready.prepared!; this.next = 0; await this.loadMore();
        this.element('inventory').hidden = false;
        this.text('status', `${ready.prepared!.assetCount ?? 0} referenced local file(s). Select files, then create the archive.`);
      } else await this.exportPrepared(ready.prepared!.id, target, false, []);
    } catch (error) { this.text('error', error instanceof Error ? error.message : 'Export preparation failed.'); }
    finally { this.busy = false; this.refresh(); }
  }

  private async loadMore(): Promise<void> {
    if (!this.preview || this.next === null) return;
    const previewID = this.preview.id, epoch = this.epoch;
    const result = await this.request('/inventory', 'GET', undefined, { id: previewID, offset: String(this.next) });
    if (epoch !== this.epoch || this.preview?.id !== previewID) return;
    for (const asset of result.assets as AssetCandidate[]) {
      const root = document.createElement('div'); root.className = 'asset'; this.element('asset-list').append(root);
      const control: CheckboxHandle = mountCheckbox(root, {
        label: `Include ${asset.name}`, checked: false, disabled: asset.status !== 'available',
        description: `${asset.path} · ${(asset.size / 1024).toFixed(1)} KiB${asset.reason ? ` · ${asset.reason}` : ''}`,
        onChange: checked => { if (checked) this.selected.add(asset.id); else this.selected.delete(asset.id); control.update({ checked }); },
      });
      this.assetControls.push(control);
    }
    this.next = result.next; this.more.update({ disabled: this.next === null });
  }

  private async createArchive(): Promise<void> {
    if (this.busy || !this.preview) return;
    const preview = this.preview, selected = [...this.selected];
    this.begin();
    try { await this.exportPrepared(preview.id, { ...preview.target }, true, selected); this.clearPreview(); }
    catch (error) { this.text('error', error instanceof Error ? error.message : 'Archive creation failed.'); }
    finally { this.busy = false; this.refresh(); }
  }

  private async exportPrepared(preparedID: string, target: ExportTarget, includeFiles: boolean, selectedAssetIDs: string[]): Promise<void> {
    const epoch = this.epoch, outputDirectory = this.outputDirectory;
    let destinationID: string | undefined;
    if (this.nativeDestination) {
      const started = await this.request('/destination', 'POST', { preparedID });
      this.destinationJob = started.id;
      try {
        if (epoch !== this.epoch) await this.request('/destination/cancel', 'POST', { id: started.id });
        const destination = await this.poll(started.id);
        if (epoch !== this.epoch || destination.destination === 'cancelled') { this.text('status', 'Export cancelled; no archive was written.'); return; }
        if (destination.destination !== 'selected') {
          this.nativeDestination = false; this.refresh();
          throw new Error(`${destination.error ?? 'Save As is unavailable.'} Choose a manual output directory and export again. No archive was written.`);
        }
        destinationID = started.id;
      } catch (error) {
        await this.request('/destination/cancel', 'POST', { id: started.id }).catch(() => {});
        throw error;
      } finally { this.destinationJob = ''; }
    }
    const started = await this.request('/export', 'POST', { preparedID, destinationID, options: { includeFiles, selectedAssetIDs, outputDirectory: outputDirectory || undefined } });
    const result = await this.poll(started.id);
    this.resultPath = result.path ?? ''; this.text('result-path', this.resultPath); this.element('result').hidden = false;
    this.text('status', `Archive saved for ${target.title ?? target.sessionID}${target.sessionID !== this.session?.id ? ' (previously selected session)' : ''}.`);
    this.text('warnings', [...(result.warnings ?? []), ...(result.additionalWarningCount ? [`${result.additionalWarningCount} additional warning(s) are recorded in the archive manifest.`] : [])].join('\n'));
  }
}

new ExportPanel(connectHost());
