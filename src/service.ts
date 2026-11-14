import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { Exporter } from './exporter.js';
import { WindowsSaveDialog, validateOutputFile, type DestinationPicker } from './save-dialog.js';
import type { CaptureSnapshot, ExportTarget, JobStatus, RecordData } from './types.js';
import type { CaptureOptions } from './types.js';
import { TransferService } from './transfer-service.js';
import { PluginClient } from './plugin-client.js';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RELEASE_VERSION } from './constants.js';

/** The SDK carries bounded metadata/upload blocks; downloads use separately scoped capabilities. */
export function createService(token: string, source: { capture(target: ExportTarget, options?: CaptureOptions): Promise<CaptureSnapshot>; connection?(): Promise<RecordData> }, options: { picker?: DestinationPicker; plugin?: () => Promise<PluginClient>; dataDirectory?: string } = {}): Server {
  const expected = createHash('sha256').update(`Bearer ${token}`).digest();
  const exporter = new Exporter(source), jobs = new Map<string, JobStatus>();
  const controllers = new Map<string, AbortController>();
  const transfers = new TransferService(exporter, options.plugin ?? (async () => { throw new Error('Approve the bundled OpenCode plugin in Settings → Extensions to import sessions.'); }), options.dataDirectory ?? join(tmpdir(), 'opencode', `session-transfer-${randomUUID()}`));
  const picker = options.picker ?? new WindowsSaveDialog();
  const destinations = new Map<string, { job: JobStatus; preparedID: string; controller: AbortController; path?: string; used: boolean }>();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (await transfers.companion.handle(request, response, url.pathname)) return;
    const header = request.headers.authorization;
    if (typeof header !== 'string' || !timingSafeEqual(createHash('sha256').update(header).digest(), expected)) return respond(response, 401, { error: 'Authentication required.' });
    try {
      if (await transfers.handle(request, response, url)) return;
      if (url.pathname === '/health' && request.method === 'GET') return respond(response, 200, { ok: true, version: RELEASE_VERSION });
      if (url.pathname === '/connection' && request.method === 'GET' && source.connection) return respond(response, 200, await source.connection());
      if (url.pathname === '/prepare' && request.method === 'POST') {
        const input = await body(request), value = input.target;
        if ([...destinations.values()].some(value => value.job.state === 'running')) return respond(response, 409, { error: 'Finish or cancel the open Save As dialog first.' });
        if ([...jobs.values()].some(job => job.state === 'running')) return respond(response, 409, { error: 'A preparation is already running.' });
        if (!value || typeof value.sessionID !== 'string' || !/^ses_[a-zA-Z0-9_-]{1,200}$/.test(value.sessionID) || typeof value.directory !== 'string' || !value.directory || value.directory.length > 4096 || value.directory.includes('\0')) throw new Error('Choose a valid session and directory.');
        const target: ExportTarget = { sessionID: value.sessionID, directory: value.directory, title: typeof value.title === 'string' ? value.title.slice(0, 500) : undefined };
        if (input.inspectFiles !== undefined && typeof input.inspectFiles !== 'boolean') throw new Error('Invalid file-inventory option.');
        if (input.profile !== undefined && !['complete', 'resume'].includes(input.profile) || input.retainHistory !== undefined && typeof input.retainHistory !== 'boolean') throw new Error('Invalid export profile.');
        const job: JobStatus = { id: randomUUID(), target, state: 'running', progress: 'Reading session evidence' }, controller = new AbortController();
        if (jobs.size >= 32) jobs.delete(jobs.keys().next().value!);
        jobs.set(job.id, job);
        controllers.set(job.id, controller);
        void exporter.prepare(target, input.inspectFiles === true, { profile: input.profile, retainHistory: input.retainHistory, signal: controller.signal }).then(preview => {
          Object.assign(job, { state: 'ready', progress: 'Evidence prepared', prepared: preview });
        }).catch(error => { Object.assign(job, { state: 'failed', progress: controller.signal.aborted ? 'Preparation cancelled' : 'Preparation failed', error: safeError(error) }); }).finally(() => controllers.delete(job.id));
        return respond(response, 202, job);
      }
      if (url.pathname === '/cancel' && request.method === 'POST') {
        const input = await body(request);
        if (controllers.has(input.id)) controllers.get(input.id)!.abort(); else exporter.cancel(input.id);
        return respond(response, 200, { cancelled: true });
      }
      if (url.pathname === '/job' && request.method === 'GET') {
        const id = url.searchParams.get('id') ?? '';
        const job = jobs.get(id) ?? destinations.get(id)?.job;
        if (job) return respond(response, 200, bounded(job));
        try { return respond(response, 200, bounded(exporter.status(id))); }
        catch { return respond(response, 404, { error: 'Unknown export job.' }); }
      }
      if (url.pathname === '/destination' && request.method === 'POST') {
        const input = await body(request);
        // Reserve the single dialog after the last await; two partial request bodies must not both pass the busy check.
        if ([...destinations.values()].some(value => value.job.state === 'running')) return respond(response, 409, { error: 'A Save As dialog is already open.' });
        if (typeof input.preparedID !== 'string') throw new Error('Invalid prepared export.');
        const target = exporter.target(input.preparedID), controller = new AbortController();
        const job: JobStatus = { id: randomUUID(), target, state: 'running', progress: 'Choose a ZIP destination in the Windows Save As dialog' };
        const record = { job, preparedID: input.preparedID, controller, path: undefined as string | undefined, used: false };
        if (destinations.size >= 32) destinations.delete(destinations.keys().next().value!);
        destinations.set(job.id, record);
        void picker.choose(`${target.sessionID}.zip`, controller.signal).then(result => {
          if (controller.signal.aborted) result = { state: 'cancelled' };
          if (result.state === 'selected') { validateOutputFile(result.path); record.path = result.path; }
          Object.assign(job, { state: 'ready', destination: result.state, progress: result.state === 'selected' ? 'Destination selected' : result.state === 'cancelled' ? 'Export cancelled; no archive was written' : 'Save As unavailable; choose a manual output directory', ...(result.state === 'unavailable' ? { error: result.error } : {}) });
        }).catch(() => Object.assign(job, { state: 'ready', destination: 'unavailable', progress: 'Save As unavailable; no archive was written', error: 'The Save As dialog failed. Choose a manual output directory and export again.' }));
        return respond(response, 202, job);
      }
      if (url.pathname === '/destination/cancel' && request.method === 'POST') {
        const input = await body(request), record = destinations.get(input.id);
        if (!record) throw new Error('Unknown destination job.');
        record.controller.abort(); record.path = undefined;
        Object.assign(record.job, { state: 'ready', destination: 'cancelled', progress: 'Export cancelled; no archive was written' });
        return respond(response, 200, record.job);
      }
      if (url.pathname === '/inventory' && request.method === 'GET') {
        const offset = Number(url.searchParams.get('offset') ?? 0);
        if (!Number.isSafeInteger(offset) || offset < 0) throw new Error('Invalid inventory offset.');
        try { return respond(response, 200, await exporter.inventory(url.searchParams.get('id') ?? '', offset)); }
        catch (error) { if (error instanceof Error && error.message.startsWith('The prepared export is missing')) return respond(response, 404, { error: 'The prepared inventory is unavailable.' }); throw error; }
      }
      if (url.pathname === '/export' && request.method === 'POST') {
        const input = await body(request), value = input.options ?? {};
        if (typeof input.preparedID !== 'string' || input.preparedID.length > 128 || typeof value !== 'object' || value === null) throw new Error('Invalid prepared export.');
        if (value.includeFiles !== undefined && typeof value.includeFiles !== 'boolean') throw new Error('Invalid file-collection option.');
        if (value.outputDirectory !== undefined && (typeof value.outputDirectory !== 'string' || value.outputDirectory.length > 4096)) throw new Error('Invalid output directory.');
        if (value.selectedAssetIDs !== undefined && (!Array.isArray(value.selectedAssetIDs) || value.selectedAssetIDs.length > 1000 || value.selectedAssetIDs.some((id: unknown) => typeof id !== 'string'))) throw new Error('Invalid file selection.');
        let destination;
        if (input.destinationID !== undefined) {
          destination = destinations.get(input.destinationID);
          if (!destination || destination.used || destination.controller.signal.aborted || destination.preparedID !== input.preparedID || destination.job.destination !== 'selected' || !destination.path) throw new Error('The selected destination is unavailable, cancelled, used or belongs to another export.');
        }
        const job = exporter.start(input.preparedID, { includeFiles: value.includeFiles === true, selectedAssetIDs: value.selectedAssetIDs, outputDirectory: value.outputDirectory, outputFile: destination?.path });
        if (destination) destination.used = true;
        return respond(response, 202, job);
      }
      respond(response, 404, { error: 'Unknown extension route.' });
    } catch (error) { respond(response, 400, { error: safeError(error) }); }
  });
  server.once('close', () => { transfers.close(); exporter.close(); for (const controller of controllers.values()) controller.abort(); for (const record of destinations.values()) record.controller.abort(); });
  return server;
}

function bounded(job: JobStatus): RecordData {
  const warnings = job.warnings ?? job.prepared?.warnings;
  const count = job.warningCount ?? job.prepared?.warningCount ?? warnings?.length ?? 0;
  return { ...job, ...(job.prepared ? { prepared: { ...job.prepared, warnings: job.prepared.warnings.slice(0, 25) } } : {}), ...(warnings ? { warnings: warnings.slice(0, 25), additionalWarningCount: Math.max(0, count - 25) } : {}) };
}

function respond(response: ServerResponse, status: number, value: unknown): void {
  const text = JSON.stringify(value);
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if (Buffer.byteLength(text) > 1024 * 1024) { response.writeHead(413); response.end('{"error":"Extension metadata exceeds the response safety limit."}'); return; }
  response.writeHead(status); response.end(text);
}

async function body(request: IncomingMessage): Promise<RecordData> {
  let bytes = 0; const chunks: Buffer[] = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 64000) throw new Error('The request exceeds the 64 KB bridge limit.');
    chunks.push(Buffer.from(chunk));
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new Error('The request must contain a JSON object.'); }
}

function safeError(error: unknown): string {
  return error instanceof Error ? error.message.slice(0, 1000) : 'The operation failed.';
}
