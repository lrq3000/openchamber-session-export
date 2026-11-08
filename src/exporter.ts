import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join } from 'node:path';
import { AttachmentInventory } from './attachments.js';
import { ArchiveWriter } from './archive.js';
import { CaptureStore } from './capture-store.js';
import { validateOutputFile } from './save-dialog.js';
import type { AssetCandidate, CaptureSnapshot, ExportOptions, ExportTarget, JobStatus, PreparedExport } from './types.js';

interface Preparation { capture: CaptureSnapshot; preview: PreparedExport; inspected: boolean }

export class Exporter {
  private prepared = new Map<string, Preparation>();
  private jobs = new Map<string, JobStatus>();

  constructor(private source: { capture(target: ExportTarget): Promise<CaptureSnapshot> }, private inventorySource: { discover(capture: CaptureSnapshot): AsyncIterable<AssetCandidate> } = new AttachmentInventory()) {}

  async prepare(target: ExportTarget, inspectFiles = false): Promise<PreparedExport> {
    const capture = await this.source.capture({ ...target }), store = new CaptureStore(capture.root);
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
    const preview: PreparedExport = { id: randomUUID(), target: { ...target }, assets: [], assetCount, warnings: [...capture.warnings], warningCount: capture.warningCount };
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
    const store = new CaptureStore(item.capture.root);
    const assets = options.includeFiles ? store.records<AssetCandidate>('assets') : (async function* () {})();
    const frozen = { ...options, selectedAssetIDs: [...selected] };
    void new ArchiveWriter().write(item.capture, assets, frozen, directory).then(result => {
      Object.assign(job, result, { state: 'ready', progress: 'Archive saved' });
    }).catch(error => {
      const code = typeof error?.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? ` (${error.code})` : '';
      Object.assign(job, { state: 'failed', progress: 'Export failed', error: `Archive creation failed${code}. Check local permissions and disk space; incomplete staging files were retained.` });
    });
    return { ...job };
  }

  status(id: string): JobStatus {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Unknown export job.');
    return { ...job };
  }

  target(id: string): ExportTarget { return { ...this.preparation(id).preview.target }; }

  private preparation(id: string): Preparation {
    const item = this.prepared.get(id);
    if (!item) throw new Error('The prepared export is missing. Prepare it again.');
    return item;
  }
}
