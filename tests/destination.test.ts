import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, realpath, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname } from 'node:path';
import { createService } from '../src/service.js';
import { Exporter } from '../src/exporter.js';
import { isLocalDesktop } from '../src/client-context.js';
import { capture, diskCapture, temporary } from './fixtures.js';

test('requests a native picker only for Windows Electron with an unambiguous loopback parent', () => {
  const desktop = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenChamber/2.6.1 Chrome/130 Electron/40.0.0';
  assert.equal(isLocalDesktop(desktop, ['http://127.0.0.1:57123']), true);
  for (const [ua, origins] of [[desktop.replace(' Electron/40.0.0', ''), ['http://127.0.0.1:57123']], [desktop, ['https://remote.example']], [desktop, []], [desktop, ['null']], [desktop, ['http://127.0.0.1.example']], [desktop.replace('Windows NT 10.0', 'Macintosh'), ['http://127.0.0.1:57123']]] as [string, string[]][]) assert.equal(isLocalDesktop(ua, origins), false);
});

test('test evidence uses the OS temporary root or explicit override and creates its missing base', async () => {
  const root = await temporary('portable-temp');
  const run = async (override?: string) => {
    const { stdout } = await promisify(execFile)(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', 'import { tempRoot, temporary } from "./tests/fixtures.ts"; console.log(JSON.stringify({ root: tempRoot, path: await temporary("portable-child") }));'], { env: { ...process.env, TMPDIR: root, TMP: root, TEMP: root, SESSION_EXPORT_TEST_TMP: override }, windowsHide: true, timeout: 10000 });
    return JSON.parse(stdout);
  };
  const automatic = await run();
  assert.equal(automatic.root, join(root, 'opencode')); assert.equal(dirname(automatic.path), join(root, 'opencode'));
  const explicit = join(root, 'explicit-override');
  const selected = await run(explicit);
  assert.equal(selected.root, explicit); assert.equal(dirname(selected.path), explicit);
  // macOS commonly exposes its temporary directory through /var -> /private/var; fixture paths must be canonical for attachment safety checks.
  const alias = join(root, 'system-temp-alias');
  await symlink(root, alias, process.platform === 'win32' ? 'junction' : 'dir');
  const aliased = await run(alias);
  assert.equal(aliased.root, alias); assert.equal(dirname(aliased.path), await realpath(alias));
});

test('opens only one chooser when two request bodies finish concurrently', async () => {
  const picker = { choose: async (_name: string, signal: AbortSignal) => new Promise<any>(resolve => signal.addEventListener('abort', () => resolve({ state: 'cancelled' }), { once: true })) };
  const server = createService('race-fixture', { capture: async () => diskCapture() }, { picker });
  let arrivals = 0, bothEntered!: () => void;
  const entered = new Promise<void>(resolve => bothEntered = resolve);
  server.on('request', request => { if (request.url === '/destination' && ++arrivals === 2) bothEntered(); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}`, headers = { Authorization: 'Bearer race-fixture', 'Content-Type': 'application/json' };
  try {
    const response = await fetch(base + '/prepare', { method: 'POST', headers, body: JSON.stringify({ target: capture().target }) });
    const started = await response.json() as any;
    let ready: any;
    do { ready = await (await fetch(base + '/job?id=' + started.id, { headers })).json(); if (ready.state === 'running') await new Promise(resolve => setTimeout(resolve, 5)); } while (ready.state === 'running');
    const text = JSON.stringify({ preparedID: ready.prepared.id });
    const partial = () => {
      let request!: ReturnType<typeof httpRequest>;
      const completed = new Promise<number | undefined>((resolve, reject) => {
        request = httpRequest(base + '/destination', { method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(text) } }, response => { response.resume(); response.once('end', () => resolve(response.statusCode)); });
        request.once('error', reject); request.flushHeaders(); request.write(text.slice(0, 1));
      });
      return { request, completed };
    };
    const a = partial(), b = partial();
    // Both route handlers have entered their body-read before either is allowed to complete.
    await entered;
    a.request.end(text.slice(1)); b.request.end(text.slice(1));
    assert.deepEqual((await Promise.all([a.completed, b.completed])).sort(), [202, 409]);
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('keeps a prepared export usable after a long chooser and publishes the exact chosen ZIP without overwrite', async () => {
  const directory = await temporary('destination-publication'), chosen = join(directory, 'chosen name café.zip');
  const exporter = new Exporter({ capture: async () => diskCapture() }), prepared = await exporter.prepare(capture().target);
  const now = Date.now; Date.now = () => now() + 16 * 60 * 1000;
  let started;
  try { started = exporter.start(prepared.id, { outputFile: chosen }); }
  finally { Date.now = now; }
  let result = started;
  while (result.state === 'running') { await new Promise(resolve => setTimeout(resolve, 5)); result = exporter.status(started.id); }
  assert.equal(result.state, 'ready', result.error ?? 'Archive failed'); assert.equal(result.path, chosen);
  const original = await readFile(chosen);
  assert.throws(() => exporter.start(prepared.id, { outputFile: chosen }), /exist|overwrite/i);
  assert.deepEqual(await readFile(chosen), original);
});

test('acknowledges a slow chooser, binds its selection once, and never writes after cancellation or unavailability', async () => {
  const directory = await temporary('destination-service'), selected = join(directory, 'selected.zip');
  let release!: (value: any) => void;
  const picker = { choose: async (_name: string, signal: AbortSignal) => new Promise<any>(resolve => { release = resolve; signal.addEventListener('abort', () => resolve({ state: 'cancelled' }), { once: true }); }) };
  const server = createService('destination-fixture', { capture: async () => diskCapture() }, { picker });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}`, headers = { Authorization: 'Bearer destination-fixture', 'Content-Type': 'application/json' };
  const post = (path: string, data: unknown) => fetch(base + path, { method: 'POST', headers, body: JSON.stringify(data) });
  const job = async (id: string) => (await (await fetch(base + '/job?id=' + id, { headers })).json() as any);
  const finish = async (id: string) => { let value = await job(id); while (value.state === 'running') { await new Promise(resolve => setTimeout(resolve, 5)); value = await job(id); } return value; };
  try {
    const prep = await post('/prepare', { target: capture().target });
    const ready = await finish((await prep.json() as any).id), preparedID = ready.prepared.id;
    const started = await post('/destination', { preparedID });
    assert.equal(started.status, 202); const pending = await started.json() as any;
    assert.equal((await job(pending.id)).state, 'running');
    assert.equal((await post('/destination', { preparedID })).status, 409);
    release({ state: 'cancelled' });
    assert.equal((await finish(pending.id)).destination, 'cancelled');
    assert.equal((await post('/export', { preparedID, destinationID: pending.id, options: { outputDirectory: directory } })).status, 400);
    assert.deepEqual(await readdir(directory), []);
    const unavailable = await post('/destination', { preparedID }), unavailableID = (await unavailable.json() as any).id;
    release({ state: 'unavailable', error: 'No interactive desktop.' });
    assert.equal((await finish(unavailableID)).destination, 'unavailable'); assert.deepEqual(await readdir(directory), []);
    const aborted = await post('/destination', { preparedID }), abortedID = (await aborted.json() as any).id;
    await post('/destination/cancel', { id: abortedID }); assert.equal((await finish(abortedID)).destination, 'cancelled');
    const selection = await post('/destination', { preparedID }), selectionID = (await selection.json() as any).id;
    release({ state: 'selected', path: selected }); await finish(selectionID);
    const other = await post('/prepare', { target: capture().target }), otherID = (await finish((await other.json() as any).id)).prepared.id;
    assert.equal((await post('/export', { preparedID: otherID, destinationID: selectionID })).status, 400);
    const exported = await post('/export', { preparedID, destinationID: selectionID }); assert.equal(exported.status, 202);
    assert.equal((await finish((await exported.json() as any).id)).path, selected);
    assert.equal((await post('/export', { preparedID, destinationID: selectionID })).status, 400);
    await writeFile(join(directory, 'unchanged'), 'untouched');
  } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
