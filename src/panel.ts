import { connectHost, isGuestSessionItem, type HostClient, type SessionSnapshot } from '@openchamber/sdk';
import { applyHostReady, mountButton, mountCheckbox, mountTextField, mountSelect, type ButtonHandle, type CheckboxHandle, type TextFieldHandle, type SelectHandle } from '@openchamber/sdk/ui';
import { isLocalDesktop } from './client-context.js';
import type { AssetCandidate, ExportTarget, JobStatus, PreparedExport, RecordData } from './types.js';
import type { ExportProfile } from './types.js';
import { ImportPanel } from './import-panel.js';
import { formatBytes } from './panel-api.js';

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
  private profile: ExportProfile = 'complete';
  private retainHistory = false;
  private profileControl: SelectHandle;
  private historyControl: CheckboxHandle;
  private estimate: ButtonHandle;
  private exact: ButtonHandle;
  private cancel: ButtonHandle;
  private download: ButtonHandle;
  private files: ButtonHandle;
  private activeJob?: { id: string; transfer: boolean };
  private exportJob = '';
  private downloadGrant?: { url: string; expiresAt: number };
  private nativeCompanion = /Electron\//.test(navigator.userAgent);
  private companionUrl = '';
  private companionControl: TextFieldHandle;

  constructor(private host: HostClient) {
    document.querySelector('#app')!.innerHTML = `
      <header><h1>Session Export</h1><p class="muted">Archive the selected conversation.</p></header>
      <section class="target" aria-label="Selected session"><strong id="session-title">No session selected</strong><code id="session-id"></code></section>
      <div id="profile-control"></div><div id="history-control"></div>
      <p id="profile-description" class="note"></p>
      <p class="muted small">If the bundled plugin is unavailable, Complete export uses the host read bridge with its response/log limits. Failed transcript reads stop the export; missing coverage is reported.</p>
      <div id="include-files"></div><p class="muted small">External files are not inspected unless enabled. Embedded data already stored in the transcript remains in JSON.</p>
      <p id="destination-note" class="muted small"></p><div id="output-directory"></div>
      <div class="buttons"><span id="export-button"></span><span id="estimate-button"></span><span id="exact-button"></span><span id="cancel-button"></span></div><p id="size-preview" class="small"></p>
      <section id="inventory" hidden><h2>Review local files</h2><p class="muted small">Select files explicitly. Limits: 100 MiB per file, 500 MiB in total. Symbolic links and remote resources are not collected.</p><div id="asset-list"></div><div class="buttons"><span id="more-button"></span><span id="create-button"></span></div></section>
      <p id="status" role="status" aria-live="polite"></p><p id="error" role="alert"></p>
      <section id="result" hidden><h2>Saved archive</h2><code id="result-path"></code><div class="buttons"><span id="copy-button"></span><span id="files-button"></span><span id="download-button"></span></div><p class="muted small">Use Files to download this ZIP, or move it with another tool. Navigate to the directory shown above if needed.</p></section>
      <details><summary>Optional private companion endpoint</summary><div id="companion-url"></div><p class="small muted">Only use a private HTTPS URL you control, ending in /companion. Its proxy must already route to this service; this setting does not configure networking. Desktop can use its existing loopback tunnel without this setting.</p></details>
      <p id="warnings" class="small warning"></p>
      <footer class="muted small">Archives are saved on the selected OpenChamber server. They may contain private information. An ordinary ZIP is not encrypted.</footer>
      <section id="import-panel"></section>`;
    this.profileControl = mountSelect(this.element('profile-control'), { label: 'Export mode', value: 'complete', options: [{ id: 'complete', label: 'Complete' }, { id: 'resume', label: 'Resume snapshot' }], onChange: value => { this.profile = value as ExportProfile; this.clearPreview(); this.refresh(); } });
    this.historyControl = mountCheckbox(this.element('history-control'), { label: 'Keep earlier conversation for reference only', checked: false, description: 'Earlier main-conversation text stays outside active context. Old tool output and sub-agent history are excluded.', onChange: checked => { this.retainHistory = checked; this.clearPreview(); this.refresh(); } });
    this.estimate = mountButton(this.element('estimate-button'), { label: 'Preview size', variant: 'outline', onClick: () => void this.previewSize(false) });
    this.exact = mountButton(this.element('exact-button'), { label: 'Measure exact ZIP size', variant: 'outline', onClick: () => void this.previewSize(true) });
    this.cancel = mountButton(this.element('cancel-button'), { label: 'Cancel', variant: 'outline', disabled: true, onClick: () => void this.cancelJob() });
    this.files = mountButton(this.element('files-button'), { label: 'Open Files', variant: 'outline', onClick: () => { void this.host.openSurface('file').catch(() => this.text('error', 'Open Files manually and navigate to the archive path.')); } });
    this.download = mountButton(this.element('download-button'), { label: 'Download via companion page', variant: 'outline', disabled: true, onClick: () => {
      // Mint before the final click: awaiting a network request here can consume
      // browser user activation and make an otherwise valid tab open fail.
      if (this.downloadGrant && Date.now() < this.downloadGrant.expiresAt) void host.openUrl(this.downloadGrant.url).catch(() => this.text('error', 'Open the archive in Files if the companion page cannot be opened.'));
      else void this.prepareDownload().then(() => this.text('status', 'The download link was refreshed. Click Download via companion page again.')).catch(() => this.text('error', 'The companion is unavailable. Use Files and the archive path instead.'));
    } });
    this.companionControl = mountTextField(this.element('companion-url'), { label: 'Private HTTPS companion URL (optional)', value: '', placeholder: 'https://your-private-host/transfer/companion', onChange: value => { this.companionUrl = value; this.downloadGrant = undefined; this.refresh(); } });
    new ImportPanel(host, this.element('import-panel'));
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
    host.onReady(context => {
      // A host-reported phone/tablet overrides a desktop-looking UA: never open a server-side chooser from a mobile view.
      if (context.device && context.device.formFactor !== 'desktop') { this.nativeDestination = false; this.nativeCompanion = false; }
      applyHostReady(context, document.documentElement); this.context(context.directory ?? '', context.session);
    });
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
    this.output.update({ disabled: this.busy, value: this.outputDirectory });
    this.profileControl.update({ disabled: this.busy });
    this.text('profile-description', this.profile === 'resume'
      ? 'Resume keeps the engine’s effective checkpoint, retained recent context, subsequent exchanges, pins and captured session instructions. Older tool output and sub-agent history are excluded. No new summary is generated.'
      : 'Complete keeps readable Markdown, projected JSON, sub-sessions and available durable events. Only host-exposed reasoning can be exported.');
    this.historyControl.update({ checked: this.retainHistory, disabled: this.busy }); this.element('history-control').hidden = this.profile !== 'resume';
    for (const control of [this.estimate, this.exact]) control.update({ disabled: this.busy || !this.session || !this.directory });
    this.cancel.update({ disabled: !this.busy });
    this.companionControl.update({ disabled: this.busy });
    this.download.update({ disabled: !this.exportJob }); this.element('download-button').hidden = !this.nativeCompanion && !this.companionUrl;
    this.element('output-directory').hidden = this.nativeDestination;
    this.text('destination-note', this.nativeDestination ? 'A Windows Save As dialog will open for each archive. Cancel closes it without writing a ZIP.' : 'The output path is on the OpenChamber server, not necessarily this device.');
  }

  private clearPreview(): void {
    this.preview = undefined; this.selected.clear(); this.next = null;
    for (const control of this.assetControls) control.dispose(); this.assetControls = [];
    this.element('asset-list').replaceChildren(); this.element('inventory').hidden = true;
    this.text('size-preview', '');
  }

  private begin(): void {
    this.activeJob = undefined;
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
    if (this.preview) {
      const preview = this.preview, selected = [...this.selected]; this.begin();
      try { await this.exportPrepared(preview.id, preview.target, this.includeFiles, selected); this.clearPreview(); }
      catch (error) { this.text('error', error instanceof Error ? error.message : 'Export failed.'); }
      finally { this.activeJob = undefined; this.busy = false; this.refresh(); }
      return;
    }
    const target = this.target(), epoch = this.epoch, includeFiles = this.includeFiles;
    this.clearPreview(); this.begin();
    try {
      const started = await this.request('/prepare', 'POST', { target, inspectFiles: includeFiles, profile: this.profile, retainHistory: this.profile === 'resume' && this.retainHistory });
      this.activeJob = { id: started.id, transfer: false };
      const ready = await this.poll(started.id);
      if (includeFiles) {
        if (epoch !== this.epoch) { this.text('status', 'The previous session was prepared. Review files again for the newly selected session.'); return; }
        this.preview = ready.prepared!; this.next = 0; await this.loadMore();
        this.element('inventory').hidden = false;
        this.text('status', `${ready.prepared!.assetCount ?? 0} referenced local file(s). Select files, then create the archive.`);
      } else await this.exportPrepared(ready.prepared!.id, target, false, []);
    } catch (error) { this.text('error', error instanceof Error ? error.message : 'Export preparation failed.'); }
    finally { this.activeJob = undefined; this.busy = false; this.refresh(); }
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
        description: `${asset.path} · ${(asset.size / 1024).toFixed(1)} KiB${asset.recommendations?.length ? ` · Recommended: ${asset.recommendations.join(', ')} context` : ''}${asset.reason ? ` · ${asset.reason}` : ''}`,
        onChange: checked => { if (checked) this.selected.add(asset.id); else this.selected.delete(asset.id); control.update({ checked }); this.text('size-preview', 'Selection changed. Preview or measure the size again.'); },
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
    this.activeJob = { id: started.id, transfer: false };
    const result = await this.poll(started.id);
    this.exportJob = started.id; this.downloadGrant = undefined;
    this.resultPath = result.path ?? ''; this.text('result-path', this.resultPath); this.element('result').hidden = false;
    this.text('status', `Archive saved for ${target.title ?? target.sessionID}${target.sessionID !== this.session?.id ? ' (previously selected session)' : ''}.`);
    this.text('warnings', [...(result.warnings ?? []), ...(result.additionalWarningCount ? [`${result.additionalWarningCount} additional warning(s) are recorded in the archive manifest.`] : [])].join('\n'));
    if (this.nativeCompanion || this.companionUrl) await this.prepareDownload().catch(() => this.text('status', 'Archive saved. Use Files if the companion download is unavailable.'));
  }

  private async prepareDownload() {
    if (!this.exportJob) return;
    const result = await this.request('/downloads/start', 'POST', { jobID: this.exportJob, privateUrl: this.companionUrl || undefined });
    this.downloadGrant = { url: result.url, expiresAt: result.expiresAt }; this.refresh();
  }
  private async previewSize(exact: boolean) {
    if (this.busy) return;
    const epoch = this.epoch; this.begin();
    try {
      if (!this.preview) {
        const started = await this.request('/prepare', 'POST', { target: this.target(), inspectFiles: this.includeFiles, profile: this.profile, retainHistory: this.profile === 'resume' && this.retainHistory });
        this.activeJob = { id: started.id, transfer: false };
        const ready = await this.poll(started.id);
        if (epoch !== this.epoch) return;
        this.preview = ready.prepared!;
        if (this.includeFiles) { this.next = 0; await this.loadMore(); this.element('inventory').hidden = false; }
      }
      const started = await this.request('/size', 'POST', { preparedID: this.preview.id, options: { includeFiles: this.includeFiles, selectedAssetIDs: [...this.selected] }, exact });
      this.activeJob = { id: started.id, transfer: true };
      for (;;) {
        const job = await this.request('/transfer/job', 'GET', undefined, { id: started.id });
        if (['failed', 'cancelled'].includes(job.state)) throw new Error(job.error ?? job.progress);
        if (job.state === 'ready') {
          if (epoch !== this.epoch) { this.text('status', 'The size preview belongs to the previously selected session. Preview again for the current session.'); return; }
          const value = job.result;
          const parts = Object.entries(value.breakdown as Record<string, number>).map(([name, size]) => `${name}: ${formatBytes(size)}`).join(' · ');
          this.text('size-preview', `${value.sessionCount} session(s), ${value.messageCount} message(s). Known source data: ${formatBytes(value.knownSourceBytes)} · Estimated ZIP: ${formatBytes(value.estimatedZipBytes)}${value.exactZipBytes !== undefined ? ` · Exact ZIP: ${formatBytes(value.exactZipBytes)}` : ''}. Exact size requires compression. ${parts}.`);
          this.text('status', 'Size preview ready. No session was imported and no final export was published.'); break;
        }
        this.text('status', job.progress); await new Promise(resolve => setTimeout(resolve, 250));
      }
    } catch (error) { this.text('error', error instanceof Error ? error.message : 'Size preview failed.'); }
    finally { this.activeJob = undefined; this.busy = false; this.refresh(); }
  }
  private async cancelJob() {
    try {
      if (this.destinationJob) await this.request('/destination/cancel', 'POST', { id: this.destinationJob });
      else if (this.activeJob) await this.request(this.activeJob.transfer ? '/transfer/cancel' : '/cancel', 'POST', { id: this.activeJob.id });
    } catch (error) { this.text('error', error instanceof Error ? error.message : 'Cancellation failed.'); }
  }
}

new ExportPanel(connectHost());
