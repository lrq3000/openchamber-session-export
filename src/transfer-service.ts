import type { IncomingMessage, ServerResponse } from 'node:http';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Exporter } from './exporter.js';
import { Importer } from './importer.js';
import { PluginClient } from './plugin-client.js';
import { UploadStore } from './upload.js';
import { Companion } from './companion.js';
import { readBody, sendJson } from './http.js';
import type { RecordData } from './types.js';

/** All SDK operations return bounded control metadata; ZIP bytes use owned staging or the companion. */
export class TransferService {
  readonly companion = new Companion();
  private uploads: UploadStore;
  private importer: Importer;
  private jobs = new Map<string, { status: RecordData; controller: AbortController }>();
  constructor(private exporter: Exporter, private plugin: () => Promise<PluginClient>, dataDirectory: string) {
    this.uploads = new UploadStore(join(dataDirectory, 'uploads')); this.importer = new Importer(plugin, join(dataDirectory, 'import-journals'));
  }
  private start(progress: string, work: (signal: AbortSignal) => Promise<unknown>): RecordData {
    if ([...this.jobs.values()].filter(job => job.status.state === 'running').length >= 2) throw new Error('Wait for the current transfer operations to finish.');
    if (this.jobs.size >= 32) {
      const expired = [...this.jobs].find(([, job]) => job.status.state !== 'running');
      if (expired) this.jobs.delete(expired[0]); else throw new Error('Too many active transfer jobs.');
    }
    const id = randomUUID(), controller = new AbortController(), status: RecordData = { id, state: 'running', progress };
    this.jobs.set(id, { controller, status });
    void work(controller.signal).then(result => Object.assign(status, controller.signal.aborted ? { state: 'cancelled', progress: 'Cancelled; no session was imported' } : { state: 'ready', result, progress: 'Ready' })).catch(error => Object.assign(status, {
      state: controller.signal.aborted ? 'cancelled' : 'failed', error: error instanceof Error ? error.message : 'Transfer operation failed.',
      progress: controller.signal.aborted ? 'Cancelled; source sessions and files were not changed' : 'Operation failed',
    }));
    return status;
  }
  close(): void { for (const job of this.jobs.values()) job.controller.abort(); this.importer.close(); }
  async handle(request: IncomingMessage, response: ServerResponse, url: URL): Promise<boolean> {
    if (!/^\/(?:transfer|uploads|imports|downloads|size)(?:\/|$)/.test(url.pathname)) return false;
    try {
      if (url.pathname === '/transfer/job' && request.method === 'GET') {
        const job = this.jobs.get(url.searchParams.get('id') ?? '');
        if (!job) throw new Error('Unknown transfer operation.');
        sendJson(response, 200, job.status); return true;
      }
      if (url.pathname === '/imports/status' && request.method === 'GET') {
        sendJson(response, 200, await this.importer.status(url.searchParams.get('id') ?? '')); return true;
      }
      if (url.pathname === '/uploads/status' && request.method === 'GET') {
        sendJson(response, 200, await this.uploads.status(url.searchParams.get('id') ?? '')); return true;
      }
      if (request.method !== 'POST') { sendJson(response, 405, { error: 'Unsupported transfer method.' }); return true; }
      const input = await readBody(request);
      switch (url.pathname) {
        case '/transfer/cancel':
          if (this.jobs.has(input.id)) this.jobs.get(input.id)!.controller.abort(); else this.exporter.cancel(input.id);
          sendJson(response, 200, { cancelled: true }); break;
        case '/size': {
          const options = { includeFiles: input.options?.includeFiles === true, selectedAssetIDs: input.options?.selectedAssetIDs };
          sendJson(response, 202, this.start(input.exact ? 'Compressing to measure exact ZIP size' : 'Estimating archive size', signal => this.exporter.size(input.preparedID, { ...options, signal }, input.exact === true))); break;
        }
        case '/uploads/start': sendJson(response, 200, await this.uploads.start(input.name, input.size)); break;
        case '/uploads/chunk': sendJson(response, 200, await this.uploads.chunk(input.id, input.offset, input.base64, input.sha256)); break;
        case '/uploads/finish': sendJson(response, 202, this.start('Verifying uploaded ZIP', () => this.uploads.finish(input.id, input.sha256))); break;
        case '/uploads/cancel': await this.uploads.cancel(input.id); sendJson(response, 200, { cancelled: true }); break;
        case '/imports/prepare':
          sendJson(response, 202, this.start('Validating archive and preparing new sessions', async signal => this.importer.prepare(input.uploadID ? await this.uploads.path(input.uploadID) : input.path, input.directory, signal))); break;
        case '/imports/start': sendJson(response, 202, { id: input.id, ...await this.importer.start(input.id) }); break;
        case '/imports/cancel': await this.importer.cancel(input.id); sendJson(response, 200, { cancelled: true }); break;
        case '/downloads/start': {
          const job = this.exporter.status(input.jobID);
          if (job.state !== 'ready' || !job.path) throw new Error('Finish exporting the archive first.');
          sendJson(response, 200, await this.companion.issue(job.path, request.socket.localPort!, input.privateUrl)); break;
        }
        default: sendJson(response, 404, { error: 'Unknown transfer route.' });
      }
    } catch (error) { sendJson(response, 400, { error: error instanceof Error ? error.message : 'Transfer operation failed.' }); }
    return true;
  }
}
