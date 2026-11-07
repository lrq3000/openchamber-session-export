import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { temporary } from './fixtures.js';

test('installs a stable folder with native service-only approval and preserves existing registrations', async () => {
  const root = await temporary('install');
  const registry = join(root, 'extensions.json'); const original = '{"existing":"untouched"}\n'; await writeFile(registry, original);
  const destination = join(root, 'session-export'); const changes: any[] = [];
  const other = { id: 'other', path: '/other-extension' }; let installed: any;
  const server = createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json');
    const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined;
    const reply = (value: unknown, status = 200) => { response.writeHead(status); response.end(JSON.stringify(value)); };
    if (request.url === '/auth/session') return reply({ disabled: true, authenticated: true });
    if (request.url === '/api/info') return reply({ version: '2.2.5' });
    if (request.url === '/api/guests' && request.method === 'GET') return reply({ guests: [other, ...(installed ? [installed] : [])] });
    if (request.url === '/api/guests' && request.method === 'POST') {
      changes.push({ method: 'POST', body });
      installed = { id: 'session-export', path: body.path, enabled: true, capabilities: { requested: ['service'], granted: [] }, service: { granted: false } };
      return reply({ guest: installed }, 201);
    }
    if (request.url === '/api/guests/session-export/capabilities' && request.method === 'PUT') {
      changes.push({ method: 'PUT', body }); installed.capabilities.granted = body.granted; installed.service.granted = true; return reply({ guest: installed });
    }
    if (request.url === '/api/guests/session-export/service/request' && request.method === 'POST') return reply({ status: 200, body: JSON.stringify(body.path === '/connection' ? { version: '2.2.5' } : { ok: true, version: '0.1.0' }) });
    reply({ error: 'Unexpected installer request' }, 404);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const installer = resolve('scripts/install.mjs');
  const run = (destinationArgument = destination) => new Promise<{ code: number | null; output: string; error: string }>(resolveRun => {
    const child = spawn(process.execPath, [installer, '--yes', '--host', `http://127.0.0.1:${(server.address() as any).port}`, '--destination', destinationArgument, '--registry', registry, '--temp-root', root], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', error = ''; child.stdout.on('data', chunk => output += chunk); child.stderr.on('data', chunk => error += chunk);
    child.on('close', code => resolveRun({ code, output, error }));
  });
  try {
    const relative = await run('relative-folder'); assert.notEqual(relative.code, 0); assert.equal(changes.length, 0);
    const result = await run(); assert.equal(result.code, 0, result.error);
    assert.deepEqual(changes, [{ method: 'POST', body: { path: destination } }, { method: 'PUT', body: { granted: ['service'] } }]);
    assert.equal((await readFile(join(destination, 'package.json'))).equals(await readFile('openchamber/package.json')), true);
    assert.equal(await readFile(registry, 'utf8'), original);
    const metadata = JSON.parse(result.output); assert.equal(await readFile(metadata.backup, 'utf8'), original);
    assert.equal(metadata.connectionVersion, '2.2.5'); assert.equal(other.id, 'other');
    const repeated = await run(); assert.notEqual(repeated.code, 0); assert.equal(changes.length, 2);
    assert.equal(await readFile(registry, 'utf8'), original);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});
