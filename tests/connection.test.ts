import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { ConnectionResolver } from '../src/connection.js';
import { temporary } from './fixtures.js';

test('discovers only the owning OpenChamber proxy and refuses another listener before making requests', async () => {
  const root = await temporary('connection'); let requests = 0;
  const server = createServer((req, res) => {
    requests++; res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(req.url === '/auth/session' ? { authenticated: true, disabled: true } : { version: '2.2.5' }));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as any).port;
  const settingsPath = join(root, 'settings.json'); await writeFile(settingsPath, JSON.stringify({ desktopLocalPort: port, unrelatedSecret: 'must-not-leave-the-resolver' }));
  try {
    await assert.rejects(new ConnectionResolver({ settingsPath, ownerPID: 123, portOwner: async () => 456 }).resolve(), /owned|owner|owning/i);
    assert.equal(requests, 0);
    const result = await new ConnectionResolver({ settingsPath, ownerPID: 123, portOwner: async () => 123 }).resolve();
    assert.deepEqual(result, { url: `http://127.0.0.1:${port}`, version: '2.2.5' });
    assert.ok(!JSON.stringify(result).includes('must-not-leave'));
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('fails closed when UI authentication is enabled instead of reusing a service token or scraping credentials', async () => {
  const root = await temporary('ui-auth');
  const server = createServer((_req, res) => { res.setHeader('Content-Type', 'application/json'); res.end('{"authenticated":false,"disabled":false}'); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const settingsPath = join(root, 'settings.json'); await writeFile(settingsPath, JSON.stringify({ desktopLocalPort: (server.address() as any).port }));
  try { await assert.rejects(new ConnectionResolver({ settingsPath, portOwner: async () => process.ppid }).resolve(), /AUTH_REQUIRED/); }
  finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('does not expose malformed local settings in a parser error', async () => {
  const root = await temporary('invalid-settings'), settingsPath = join(root, 'settings.json');
  await writeFile(settingsPath, 'fixture-private-value');
  await assert.rejects(new ConnectionResolver({ settingsPath }).resolve(), error => !String(error).includes('fixture'));
});
