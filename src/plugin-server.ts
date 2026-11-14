import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { createServer, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { channelPath, privateDirectory, readJsonFile, UUID, writePrivateJson, type BridgeDescriptor } from './private-channel.js';
import { PluginImports } from './plugin-imports.js';

const instances = new Map<string, Promise<{ release(): () => Promise<void> }>>();
const readRoute = /^\/api\/(?:info|session(?:\/active|\/ses_[a-zA-Z0-9_-]+(?:\/(?:message|context))?)?|experimental\/session\/ses_[a-zA-Z0-9_-]+\/(?:log|instructions\/entries))$/;

/** A location can load the same package many times in one OpenCode process. */
export async function startPluginBridge(packageDirectory: string, version: string): Promise<() => Promise<void>> {
  const { root, packageKey } = await channelPath(packageDirectory);
  let instance = instances.get(root);
  if (!instance) { instance = start(root, packageKey, version); instances.set(root, instance); instance.catch(() => instances.delete(root)); }
  const running = await instance;
  // Plugin instances share one listener; reference counts are held in the start closure.
  return running.release();
}

async function start(root: string, packageKey: string, version: string): Promise<any> {
  const index = process.argv.indexOf('--port'), port = index >= 0 ? Number(process.argv[index + 1]) : NaN;
  const password = process.env.OPENCODE_PASSWORD || process.env.OPENCODE_SERVER_PASSWORD;
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !password) throw new Error('Session transfer requires an explicitly managed OpenCode port and authentication. No discovery fallback was attempted.');
  // The plugin calls only the HTTP server it is running inside. The secret is
  // captured here and never written to the private descriptor or passed to UI.
  const upstream = `http://127.0.0.1:${port}`, authorization = `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}`;
  await privateDirectory(root); await privateDirectory(join(root, 'jobs'));
  const token = randomBytes(32).toString('hex'), expected = createHash('sha256').update(`Bearer ${token}`).digest();
  const instanceID = randomUUID();
  let references = 0;
  const native = async (path: string, method = 'GET', body?: string | Readable) => {
    const response = await fetch(upstream + path, {
      method, headers: { Authorization: authorization, 'Content-Type': 'application/json' }, redirect: 'error',
      signal: AbortSignal.timeout(120000),
      ...(body === undefined ? {} : { body, duplex: 'half' } as any),
    });
    if (!response.ok) { await response.body?.cancel(); throw new Error(`The official OpenCode API refused ${method} (HTTP ${response.status}). No automatic retry was attempted.`); }
    return response;
  };
  const imports = new PluginImports(root, instanceID, native);
  const server = createServer(async (request, response) => {
    const supplied = typeof request.headers.authorization === 'string' ? request.headers.authorization : '';
    if (request.headers.origin !== undefined || !timingSafeEqual(createHash('sha256').update(supplied).digest(), expected)) return json(response, 401, { error: 'A private plugin capability is required.' });
    try {
      const url = new URL(request.url ?? '/', upstream);
      if (url.pathname === '/identity' && request.method === 'GET') return json(response, 200, descriptor);
      if (request.method === 'GET' && readRoute.test(url.pathname)) {
        if (url.pathname.endsWith('/log') && url.searchParams.get('follow') !== 'false') throw new Error('Only finite durable-log capture is supported.');
        const result = await native(url.pathname + url.search);
        response.writeHead(200, { 'Content-Type': result.headers.get('content-type') ?? 'application/json', 'Cache-Control': 'no-store' });
        if (result.body) await pipeline(Readable.fromWeb(result.body as any), response); else response.end();
        return;
      }
      const match = /^\/imports\/([a-f0-9-]+)\/(prepare|start|status|cancel)$/.exec(url.pathname);
      if (!match || !UUID.test(match[1])) return json(response, 404, { error: 'Unknown plugin operation.' });
      const [, id, action] = match;
      if (action === 'status' && request.method === 'GET') return json(response, 200, await imports.status(id));
      if (request.method === 'POST' && action === 'cancel') return json(response, 200, await imports.cancel(id));
      if (request.method === 'POST' && action === 'prepare') return json(response, 200, await imports.prepare(id));
      if (request.method === 'POST' && action === 'start') return json(response, 202, await imports.start(id));
      json(response, 405, { error: 'Unsupported plugin method.' });
    } catch (error) { if (!response.headersSent) json(response, 400, { error: error instanceof Error ? error.message : 'Plugin operation failed.' }); else response.destroy(); }
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const descriptor: BridgeDescriptor = { schema: 1, hostPID: process.ppid, pid: process.pid, instanceID, packageKey, port: (server.address() as any).port, token, version };
  await writePrivateJson(join(root, 'connection.json'), descriptor);
  return {
    release() {
      references++;
      return async () => {
        if (--references) return;
        instances.delete(root); imports.close();
        // Remove only our own capability; another process must not lose its descriptor.
        try { const current = await readJsonFile(join(root, 'connection.json'), 8192); if (current.instanceID === descriptor.instanceID) await rm(join(root, 'connection.json')); } catch { /* Already revoked. */ }
        server.closeAllConnections();
        await new Promise<void>(resolve => server.close(() => resolve()));
      };
    },
  };
}

function json(response: ServerResponse, status: number, value: any): void {
  // The descriptor's capability must never leave the private channel.
  const result = { ...value }; delete result.token;
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(result));
}
