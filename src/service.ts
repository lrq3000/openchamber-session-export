import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { Exporter } from './exporter.js';
import type { Capture, ExportTarget, JobStatus, PreparedExport, RecordData } from './types.js';

/** Text-only, bounded SDK bridge. ZIP bytes and conversation bodies never pass through the iframe. */
export function createService(token: string, source: { capture(target: ExportTarget): Promise<Capture>; connection?(): Promise<RecordData> }): Server {
  const expected = createHash('sha256').update(`Bearer ${token}`).digest();
  const exporter = new Exporter(source), jobs = new Map<string, JobStatus>(), previews = new Map<string, PreparedExport>();
  return createServer(async (request, response) => {
    const header = request.headers.authorization;
    if (typeof header !== 'string' || !timingSafeEqual(createHash('sha256').update(header).digest(), expected)) return respond(response, 401, { error: 'Authentication required.' });
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      if (url.pathname === '/health' && request.method === 'GET') return respond(response, 200, { ok: true, version: '0.1.0' });
      if (url.pathname === '/connection' && request.method === 'GET' && source.connection) return respond(response, 200, await source.connection());
      if (url.pathname === '/prepare' && request.method === 'POST') {
        if ([...jobs.values()].some(job => job.state === 'running')) return respond(response, 409, { error: 'A preparation is already running.' });
        const input = await body(request), value = input.target;
        if (!value || typeof value.sessionID !== 'string' || !/^ses_[a-zA-Z0-9_-]{1,200}$/.test(value.sessionID) || typeof value.directory !== 'string' || !value.directory || value.directory.length > 4096 || value.directory.includes('\0')) throw new Error('Choose a valid session and directory.');
        const target: ExportTarget = { sessionID: value.sessionID, directory: value.directory, title: typeof value.title === 'string' ? value.title.slice(0, 500) : undefined };
        if (input.inspectFiles !== undefined && typeof input.inspectFiles !== 'boolean') throw new Error('Invalid file-inventory option.');
        const job: JobStatus = { id: randomUUID(), target, state: 'running', progress: 'Reading session evidence' };
        if (jobs.size >= 32) jobs.delete(jobs.keys().next().value!);
        jobs.set(job.id, job);
        void exporter.prepare(target, input.inspectFiles === true).then(preview => {
          if (previews.size >= 3) previews.delete(previews.keys().next().value!);
          previews.set(preview.id, preview);
          Object.assign(job, { state: 'ready', progress: 'Evidence prepared', prepared: { ...preview, assets: [], assetCount: preview.assets.length } });
        }).catch(error => { Object.assign(job, { state: 'failed', progress: 'Preparation failed', error: safeError(error) }); });
        return respond(response, 202, job);
      }
      if (url.pathname === '/job' && request.method === 'GET') {
        const id = url.searchParams.get('id') ?? '';
        const job = jobs.get(id);
        if (job) return respond(response, 200, bounded(job));
        try { return respond(response, 200, bounded(exporter.status(id))); }
        catch { return respond(response, 404, { error: 'Unknown export job.' }); }
      }
      if (url.pathname === '/inventory' && request.method === 'GET') {
        const preview = previews.get(url.searchParams.get('id') ?? '');
        if (!preview) return respond(response, 404, { error: 'The prepared inventory is unavailable.' });
        const offset = Number(url.searchParams.get('offset') ?? 0);
        if (!Number.isSafeInteger(offset) || offset < 0) throw new Error('Invalid inventory offset.');
        const assets = preview.assets.slice(offset, offset + 100);
        return respond(response, 200, { assets, total: preview.assets.length, next: offset + 100 < preview.assets.length ? offset + 100 : null });
      }
      if (url.pathname === '/export' && request.method === 'POST') {
        const input = await body(request), value = input.options ?? {};
        if (typeof input.preparedID !== 'string' || input.preparedID.length > 128 || typeof value !== 'object' || value === null) throw new Error('Invalid prepared export.');
        if (value.includeFiles !== undefined && typeof value.includeFiles !== 'boolean') throw new Error('Invalid file-collection option.');
        if (value.outputDirectory !== undefined && (typeof value.outputDirectory !== 'string' || value.outputDirectory.length > 4096)) throw new Error('Invalid output directory.');
        if (value.selectedAssetIDs !== undefined && (!Array.isArray(value.selectedAssetIDs) || value.selectedAssetIDs.length > 1000 || value.selectedAssetIDs.some((id: unknown) => typeof id !== 'string'))) throw new Error('Invalid file selection.');
        return respond(response, 202, exporter.start(input.preparedID, { includeFiles: value.includeFiles === true, selectedAssetIDs: value.selectedAssetIDs, outputDirectory: value.outputDirectory }));
      }
      respond(response, 404, { error: 'Unknown extension route.' });
    } catch (error) { respond(response, 400, { error: safeError(error) }); }
  });
}

function bounded(job: JobStatus): RecordData {
  const warnings = job.warnings ?? job.prepared?.warnings;
  return { ...job, ...(job.prepared ? { prepared: { ...job.prepared, warnings: job.prepared.warnings.slice(0, 25) } } : {}), ...(warnings ? { warnings: warnings.slice(0, 25), additionalWarningCount: Math.max(0, warnings.length - 25) } : {}) };
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
