import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { isAbsolute, join } from 'node:path';
import { AttachmentInventory } from './attachments.js';
import { ArchiveWriter } from './archive.js';
import type { AssetCandidate, Capture, ExportOptions, ExportTarget, JobStatus, PreparedExport } from './types.js';

export class Exporter {
  private prepared = new Map<string, { capture: Capture; preview: PreparedExport; inspected: boolean; at: number }>();
  private jobs = new Map<string, JobStatus>();

  constructor(private source: { capture(target: ExportTarget): Promise<Capture> }, private inventory: { discover(capture: Capture): Promise<AssetCandidate[]> } = new AttachmentInventory()) {}

  async prepare(target: ExportTarget, inspectFiles = false): Promise<PreparedExport> {
    const capture = await this.source.capture({ ...target });
    // OFF means no external file inspection, not merely skipping copies at the end.
    const assets = inspectFiles ? await this.inventory.discover(capture) : [];
    const preview: PreparedExport = { id: randomUUID(), target: { ...target }, assets, warnings: [...capture.warnings] };
    if (this.prepared.size >= 3) this.prepared.delete(this.prepared.keys().next().value!);
    this.prepared.set(preview.id, { capture, preview, inspected: inspectFiles, at: Date.now() });
    return preview;
  }

  start(preparedID: string, options: ExportOptions): JobStatus {
    const item = this.prepared.get(preparedID);
    if (!item || Date.now() - item.at > 10 * 60 * 1000) throw new Error('The prepared export is missing or expired. Prepare it again.');
    if (options.includeFiles && !item.inspected) throw new Error('Preview the file inventory before enabling file collection.');
    const selected = options.includeFiles ? options.selectedAssetIDs ?? [] : [];
    if (!Array.isArray(selected) || selected.some(id => !item.preview.assets.some(asset => asset.id === id))) throw new Error('The selection contains a file outside the prepared inventory.');
    const directory = options.outputDirectory || join(homedir(), 'Downloads', 'OpenChamber-Exports');
    if (!isAbsolute(directory) || /^[\\/]{2}/.test(directory) || directory.includes('\0')) throw new Error('Choose an absolute local output directory; network and device paths are not supported.');
    if ([...this.jobs.values()].some(job => job.state === 'running')) throw new Error('An export is already running. Wait for it to finish.');
    const job: JobStatus = { id: randomUUID(), target: { ...item.preview.target }, state: 'running', progress: 'Writing archive' };
    if (this.jobs.size >= 32) this.jobs.delete(this.jobs.keys().next().value!);
    this.jobs.set(job.id, job);
    const frozen = { ...options, selectedAssetIDs: [...selected] };
    void new ArchiveWriter().write(item.capture, options.includeFiles ? item.preview.assets : [], frozen, directory).then(result => {
      Object.assign(job, result, { state: 'ready', progress: 'Archive saved' });
    }).catch(() => { Object.assign(job, { state: 'failed', progress: 'Export failed', error: 'Archive creation failed. Check local permissions and disk space; incomplete staging files were retained.' }); });
    return { ...job };
  }

  status(id: string): JobStatus {
    const job = this.jobs.get(id);
    if (!job) throw new Error('Unknown export job.');
    return { ...job };
  }
}
