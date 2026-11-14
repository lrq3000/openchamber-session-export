import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { link, lstat, mkdir, mkdtemp, realpath, stat, writeFile } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join } from 'node:path';
import { AttachmentInventory, samePath } from './attachments.js';
import { ArchiveWriter } from './archive.js';
import { CaptureStore } from './capture-store.js';
import { validateOutputFile } from './save-dialog.js';
import { applyProfile } from './profiles.js';
import type { AssetCandidate, CaptureOptions, CaptureSnapshot, ExportOptions, ExportTarget, JobStatus, PreparedExport, SessionRecord } from './types.js';

interface Preparation { capture: CaptureSnapshot; preview: PreparedExport; inspected: boolean; exact?: { key: string; path: string; size: number; warnings: string[]; warningCount: number } }

export class Exporter {
  private prepared = new Map<string, Preparation>();
  private jobs = new Map<string, JobStatus>();
  private controllers = new Map<string, AbortController>();

  constructor(private source: { capture(target: ExportTarget, options?: CaptureOptions): Promise<CaptureSnapshot> }, private inventorySource: { discover(capture: CaptureSnapshot): AsyncIterable<AssetCandidate> } = new AttachmentInventory()) {}

  async prepare(target: ExportTarget, inspectFiles = false, options: CaptureOptions = {}): Promise<PreparedExport> {
    const capture = await applyProfile(await this.source.capture({ ...target }, options), options), store = new CaptureStore(capture.root);
    let assetCount = 0;
    // OFF means no external-file inspection at all, not merely skipping copies at publication.
    if (inspectFiles) {
      await mkdir(join(capture.root, 'asset-index'), { recursive: true });
      for await (const asset of this.inventorySource.discover(capture)) {
        if (!/^[a-zA-Z0-9_-]{1,100}$/.test(asset.id)) throw new Error('The inventory returned an invalid asset identity.');
        await store.append('assets', asset);
        await writeFile(join(capture.root, 'asset-index', `${asset.id}.json`), JSON.stringify(asset), { flag: 'wx', mode: 0o600 });
        assetCount++;
      }
    }
    const preview: PreparedExport = { id: randomUUID(), target: { ...target }, assets: [], assetCount, warnings: [...capture.warnings], warningCount: capture.warningCount, profile: capture.profile };
    if (this.prepared.size >= 3) this.prepared.delete(this.prepared.keys().next().value!);
    this.prepared.set(preview.id, { capture, preview, inspected: inspectFiles });
    return preview;
  }

  async inventory(id: string, offset = 0): Promise<{ assets: AssetCandidate[]; total: number; next: number | null }> {
    const item = this.preparation(id), store = new CaptureStore(item.capture.root), page = await store.page<AssetCandidate>('assets', offset);
    const assets: AssetCandidate[] = [];
    for (const asset of page.records) {
      const { sessionIndex, ...visible } = asset;
      if (sessionIndex) {
        const origins = await store.page<{ sessionID: string }>(sessionIndex, 0, 25);
        visible.sessions = origins.records.map(record => record.sessionID);
        visible.additionalSessionCount = Math.max(0, (asset.sourceSessionCount ?? visible.sessions.length) - visible.sessions.length);
      }
      assets.push(visible);
    }
    return { assets, total: item.preview.assetCount ?? 0, next: page.next };
  }

  start(preparedID: string, options: ExportOptions): JobStatus {
    const item = this.preparation(preparedID);
    if (options.includeFiles && !item.inspected) throw new Error('Preview the file inventory before enabling file collection.');
    const selected = options.includeFiles ? options.selectedAssetIDs ?? [] : [];
    if (!Array.isArray(selected) || selected.length > 1000 || selected.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || !existsSync(join(item.capture.root, 'asset-index', `${id}.json`)))) throw new Error('The selection contains a file outside the prepared inventory.');
    if (options.outputFile !== undefined) validateOutputFile(options.outputFile);
    const directory = options.outputFile ? dirname(options.outputFile) : options.outputDirectory || join(homedir(), 'Downloads', 'OpenChamber-Exports');
    if (!isAbsolute(directory) || /^[\\/]{2}/.test(directory) || directory.includes('\0')) throw new Error('Choose an absolute local output directory; network and device paths are not supported.');
    if ([...this.jobs.values()].some(job => job.state === 'running')) throw new Error('An export is already running. Wait for it to finish.');
    const job: JobStatus = { id: randomUUID(), target: { ...item.preview.target }, state: 'running', progress: 'Writing archive' };
    if (this.jobs.size >= 32) this.jobs.delete(this.jobs.keys().next().value!);
    this.jobs.set(job.id, job);
    const controller = new AbortController(); this.controllers.set(job.id, controller);
    const store = new CaptureStore(item.capture.root);
    const assets = options.includeFiles ? store.records<AssetCandidate>('assets') : (async function* () {})();
    const frozen = { ...options, selectedAssetIDs: [...selected], signal: controller.signal };
    const create = async () => {
      if (item.exact?.key === this.selectionKey(frozen)) {
        await this.validateSelected(item, selected);
        await mkdir(directory, { recursive: true });
        const staging = await mkdtemp(join(directory, '.session-export-')), partial = join(staging, 'prepared.zip');
        // Copy the already-compressed archive to the destination filesystem, then
        // publish exclusively. A cross-volume hard link would fail on Windows/Linux.
        await pipeline(createReadStream(item.exact.path), createWriteStream(partial, { flags: 'wx', mode: 0o600 }), { signal: controller.signal });
        const path = options.outputFile ?? join(directory, `${item.capture.target.sessionID}-${randomUUID()}.zip`);
        await this.validateSelected(item, selected);
        controller.signal.throwIfAborted(); await link(partial, path); return { ...item.exact, path };
      }
      return new ArchiveWriter().write(item.capture, assets, frozen, directory);
    };
    void create().then(result => {
      Object.assign(job, result, { state: 'ready', progress: 'Archive saved' });
    }).catch(error => {
      const code = typeof error?.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? ` (${error.code})` : '';
      const changedSelection = error instanceof Error && error.message === 'A selected file changed after preparation. Review the files again.';
      Object.assign(job, { state: 'failed', progress: controller.signal.aborted ? 'Export cancelled' : 'Export failed', error: controller.signal.aborted ? 'Export cancelled; source sessions and files were not changed.' : changedSelection ? error.message : `Archive creation failed${code}. Check local permissions and disk space; incomplete staging files were retained.` });
    }).finally(() => this.controllers.delete(job.id));
    return { ...job };
  }

  status(id: string): JobStatus {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Unknown export job.');
    return { ...job };
  }

  target(id: string): ExportTarget { return { ...this.preparation(id).preview.target }; }

  cancel(id: string): void {
    const controller = this.controllers.get(id);
    if (!controller) throw new Error('This export job is not running.');
    controller.abort();
  }
  close(): void { for (const controller of this.controllers.values()) controller.abort(); }

  async size(id: string, options: ExportOptions, exact = false): Promise<Record<string, unknown>> {
    const item = this.preparation(id), store = new CaptureStore(item.capture.root);
    if (options.includeFiles && !item.inspected) throw new Error('Review the file inventory before including files.');
    const selected = options.includeFiles ? options.selectedAssetIDs ?? [] : [];
    await this.validateSelected(item, selected);
    let transcript = 0, files = 0, context = 0, history = 0, subsessions = 0;
    for await (const session of store.sessions(item.capture)) {
      let size = (await stat(session.infoPath)).size + (await stat(session.messagesPath)).size;
      if (session.eventsPath && session.log.available) size += (await stat(session.eventsPath)).size;
      if (session.id === item.capture.target.sessionID) transcript += size; else subsessions += size;
      for (const path of [session.instructionsPath, item.capture.profile === 'resume' ? undefined : session.contextPath]) if (path) context += (await stat(path)).size;
    }
    for (const extra of item.capture.extras ?? []) history += (await stat(extra.path)).size;
    for (const id of selected) files += (await readAsset(item, id)).size;
    // Markdown and ZIP headers are generated later. Keep known source bytes
    // separate from heuristic totals; an estimate is not a compressed measurement.
    const conversation = transcript + subsessions, knownSourceBytes = conversation + context + history + files;
    const result: Record<string, unknown> = {
      knownSourceBytes, uncompressedEstimate: knownSourceBytes + conversation * 0.75 + 8192,
      estimatedZipBytes: Math.ceil((conversation * 1.75 + context + history) * 0.35 + files * 0.95 + 8192), sessionCount: item.capture.sessionCount, messageCount: item.capture.messageCount,
      breakdown: { transcript, subsessions, context, history, files }, estimateNotice: 'Estimated sizes are not guarantees. Exact ZIP size requires compression.',
    };
    if (exact) {
      const key = this.selectionKey(options);
      if (item.exact?.key !== key) {
        const measured = await new ArchiveWriter().write(item.capture, options.includeFiles ? store.records<AssetCandidate>('assets') : (async function* () {})(), { includeFiles: options.includeFiles, selectedAssetIDs: options.selectedAssetIDs, signal: options.signal }, join(item.capture.root, `measurement-${randomUUID()}`));
        item.exact = { ...measured, key };
      }
      result.exactZipBytes = item.exact.size;
    }
    return result;
  }

  private selectionKey(options: ExportOptions): string { return JSON.stringify([Boolean(options.includeFiles), [...(options.selectedAssetIDs ?? [])].sort()]); }
  private async validateSelected(item: Preparation, selected: string[]): Promise<void> {
    if (!Array.isArray(selected) || selected.length > 1000 || selected.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id))) throw new Error('Invalid file selection.');
    if (selected.length && !item.inspected) throw new Error('Review the file inventory first.');
    for (const id of selected) {
      const asset = await readAsset(item, id), current = await lstat(asset.path);
      if (asset.status !== 'available' || current.isSymbolicLink() || !current.isFile() || !samePath(await realpath(asset.path), asset.path) || !asset.fingerprint || Object.entries(asset.fingerprint).some(([key, value]) => current[key as keyof typeof current] !== value)) throw new Error('A selected file changed after preparation. Review the files again.');
    }
  }

  private preparation(id: string): Preparation {
    const item = this.prepared.get(id);
    if (!item) throw new Error('The prepared export is missing. Prepare it again.');
    return item;
  }
}

async function readAsset(item: Preparation, id: string): Promise<AssetCandidate> {
  const { readJsonFile } = await import('./private-channel.js');
  return readJsonFile(join(item.capture.root, 'asset-index', `${id}.json`), 64 * 1024);
}
