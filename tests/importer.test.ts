import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Importer } from '../src/importer.js';
import type { PluginClient } from '../src/plugin-client.js';
import { temporary } from './fixtures.js';

/** Minimal stored ZIP builder deliberately permits unsafe metadata for rejection tests. */
function zip(entries: { name: string; data?: string; mode?: number; flags?: number; declaredSize?: number }[]): Buffer {
  const local: Buffer[] = [], central: Buffer[] = []; let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name), data = Buffer.from(entry.data ?? ''), header = Buffer.alloc(30), index = Buffer.alloc(46);
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    crc = (crc ^ 0xffffffff) >>> 0;
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(entry.flags ?? 0, 6);
    header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(entry.declaredSize ?? data.length, 22); header.writeUInt16LE(name.length, 26);
    index.writeUInt32LE(0x02014b50); index.writeUInt16LE(0x0314, 4); index.writeUInt16LE(20, 6); index.writeUInt16LE(entry.flags ?? 0, 8);
    index.writeUInt32LE(crc, 16); index.writeUInt32LE(data.length, 20); index.writeUInt32LE(entry.declaredSize ?? data.length, 24); index.writeUInt16LE(name.length, 28);
    index.writeUInt32LE(((entry.mode ?? 0o100600) << 16) >>> 0, 38); index.writeUInt32LE(offset, 42);
    local.push(header, name, data); central.push(index, name); offset += header.length + name.length + data.length;
  }
  const end = Buffer.alloc(22), directory = Buffer.concat(central);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

async function fixture() {
  const root = await temporary('safe-import'), destination = join(root, 'project'), requests: string[] = [];
  await mkdir(destination);
  const plugin = { root: join(root, 'bridge'), request: async (path: string) => { requests.push(path); return { warnings: [] }; } } as unknown as PluginClient;
  return { root, destination, requests, importer: new Importer(async () => plugin) };
}
function sessionArchive(id: string, warnings: string[] = []): Buffer {
  const source = JSON.stringify({ info: { id }, messages: [] });
  return zip([
    { name: 'session.json', data: source },
    { name: 'manifest.json', data: JSON.stringify({
      schema: 'openchamber-session-export/2', target: { sessionID: id }, sessions: [{ id, messages: 0 }], warnings,
      entries: [{ path: 'session.json', size: Buffer.byteLength(source), sha256: createHash('sha256').update(source).digest('hex') }],
    }) },
  ]);
}

test('rejects traversal, case collisions, links, encryption, device names and expansion bombs before native preparation', async () => {
  const f = await fixture();
  const cases = [
    [{ name: '../escape', data: 'no' }], [{ name: '/absolute', data: 'no' }],
    [{ name: 'a\\b', data: 'no' }], [{ name: 'NUL.txt' }], [{ name: 'a:stream' }],
    [{ name: 'a.', data: 'no' }], [{ name: 'A' }, { name: 'a' }],
    [{ name: 'file' }, { name: 'file/child' }], [{ name: 'file/child' }, { name: 'file' }],
    [{ name: 'linked', mode: 0o120777, data: 'target' }],
    [{ name: 'encrypted', flags: 1 }], [{ name: 'bomb', declaredSize: 0xffffffff }],
  ];
  for (const [number, entries] of cases.entries()) {
    const path = join(f.root, `unsafe-${number}.zip`); await writeFile(path, zip(entries));
    await assert.rejects(f.importer.prepare(path, f.destination), `Unsafe case ${number} was accepted`);
  }
  assert.deepEqual(f.requests, []);
});

test('verifies manifest checksums and rejects undeclared entries; legacy format remains explicitly readable', async () => {
  const f = await fixture(), path = join(f.root, 'legacy.zip');
  const session = JSON.stringify({ info: { id: 'ses_legacy' }, messages: [] });
  const manifest = {
    schema: 'openchamber-session-export/1', target: { sessionID: 'ses_legacy' }, sessions: [{ id: 'ses_legacy', messages: 0 }],
    entries: [{ path: 'session.json', size: Buffer.byteLength(session), sha256: createHash('sha256').update(session).digest('hex') }],
  };
  const entries = [{ name: 'session.json', data: session }, { name: 'manifest.json', data: JSON.stringify(manifest) }];
  await writeFile(path, zip(entries));
  assert.equal((await f.importer.prepare(path, f.destination)).sessionCount, 1);
  assert.equal(f.requests.length, 1);
  await writeFile(path, zip([...entries, { name: 'undeclared.txt', data: 'private' }]));
  await assert.rejects(f.importer.prepare(path, f.destination), /undeclared/);
  await writeFile(path, zip([{ ...entries[0], data: session.replace('legacy', 'tamper') }, entries[1]]));
  await assert.rejects(f.importer.prepare(path, f.destination), /checksums/);
  assert.equal(f.requests.length, 1, 'Rejected archives must not reach native preparation');
});

test('cancellation does not change the user-supplied archive or submit native work', async () => {
  const f = await fixture(), path = join(f.root, 'cancelled.zip'), bytes = zip([{ name: 'large', data: 'a'.repeat(65536) }]);
  await writeFile(path, bytes);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(f.importer.prepare(path, f.destination, controller.signal), /abort/i);
  assert.deepEqual(await readFile(path), bytes); assert.deepEqual(f.requests, []);
});

test('a lost plugin acknowledgement and a service restart cannot hide native creations or replay submission', async () => {
  const f = await fixture(), path = join(f.root, 'lost-response.zip');
  const source = JSON.stringify({ info: { id: 'ses_lost' }, messages: [] });
  await writeFile(path, zip([
    { name: 'session.json', data: source },
    { name: 'manifest.json', data: JSON.stringify({
      schema: 'openchamber-session-export/2', target: { sessionID: 'ses_lost' }, sessions: [{ id: 'ses_lost', messages: 0 }],
      entries: [{ path: 'session.json', size: Buffer.byteLength(source), sha256: createHash('sha256').update(source).digest('hex') }],
    }) },
  ]));
  let calls = 0, submitted = false;
  const plugin = { root: join(f.root, 'lost-bridge'), instanceID: 'fixture-instance', request: async (path: string) => {
    if (path.endsWith('/start')) { calls++; submitted = true; throw new Error('Acknowledgement lost after acceptance'); }
    return path.endsWith('/status') ? { state: submitted ? 'ready' : 'prepared', sessions: submitted ? ['ses_confirmed_created'] : [], progress: 'Native result' } : { warnings: [] };
  } } as unknown as PluginClient;
  const importer = new Importer(async () => plugin), preview = await importer.prepare(path, f.destination);
  const starts = await Promise.allSettled([importer.start(preview.id), importer.start(preview.id)]);
  assert.equal(starts.filter(value => value.status === 'fulfilled').length, 1);
  let status: any;
  for (let attempt = 0; attempt < 100; attempt++) {
    status = await importer.status(preview.id);
    if (status.state === 'ready') break; await new Promise(resolve => setTimeout(resolve, 5));
  }
  assert.equal(status.state, 'ready'); assert.deepEqual(status.sessions, ['ses_confirmed_created']);
  const restarted = new Importer(async () => plugin);
  assert.deepEqual((await restarted.status(preview.id)).sessions, ['ses_confirmed_created']);
  await assert.rejects(restarted.start(preview.id), /already started/); assert.equal(calls, 1);
});

test('journal write/read failures after accepted submission cannot suppress native results, and warning metadata stays bounded', async () => {
  const f = await fixture(), path = join(f.root, 'journal-failure.zip'), bridge = join(f.root, 'broken-journal-bridge');
  await writeFile(path, sessionArchive('ses_journal_failure', ['x'.repeat(180000)]));
  let submitted = false, statusReads = 0;
  const plugin = { root: bridge, instanceID: 'fixture-instance', request: async (path: string) => {
    const id = path.split('/')[2], journal = join(bridge, 'jobs', id, 'file-restoration-state.json');
    if (path.endsWith('/start')) {
      submitted = true;
      assert.ok((await stat(journal)).size < 128 * 1024);
      await rename(journal, journal + '.retained');
      await mkdir(journal); // Fail atomic rename and status read without deleting retained evidence.
    }
    if (path.endsWith('/status')) { statusReads++; return { state: submitted ? 'ready' : 'prepared', sessions: submitted ? ['ses_created_despite_journal_failure'] : [], progress: 'Native result' }; }
    return { warnings: [] };
  } } as unknown as PluginClient;
  const importer = new Importer(async () => plugin), preview = await importer.prepare(path, f.destination);
  assert.ok(Buffer.byteLength(JSON.stringify(preview.warnings)) < 16 * 1024);
  await importer.start(preview.id);
  let state: any;
  for (let attempt = 0; attempt < 100; attempt++) {
    state = await importer.status(preview.id);
    if (state.state === 'ready') break; await new Promise(resolve => setTimeout(resolve, 5));
  }
  assert.equal(state.state, 'ready'); assert.deepEqual(state.sessions, ['ses_created_despite_journal_failure']); assert.ok(statusReads > 0);
  assert.match(state.journalWarning, /unavailable|journal/);
});

test('stable locators recover recorded outcomes offline and do not query a replacement host instance', async () => {
  const f = await fixture(), path = join(f.root, 'offline.zip'), bridge = join(f.root, 'old-host'), locators = join(f.root, 'stable-journals');
  await writeFile(path, sessionArchive('ses_offline'));
  let submitted = false;
  const native = { instanceID: 'original-plugin', state: 'ready', sessions: ['ses_recorded_on_old_host'], progress: 'Recorded native result', warnings: [] };
  const original = { root: bridge, instanceID: 'original-plugin', request: async (path: string) => {
    if (path.endsWith('/start')) { submitted = true; await writeFile(join(bridge, 'jobs', path.split('/')[2], 'state.json'), JSON.stringify(native)); }
    return path.endsWith('/status') ? { ...native, state: submitted ? 'ready' : 'prepared' } : { warnings: [] };
  } } as unknown as PluginClient;
  const importer = new Importer(async () => original, locators), preview = await importer.prepare(path, f.destination);
  await importer.start(preview.id);
  for (let attempt = 0; attempt < 100 && (await importer.status(preview.id)).state !== 'ready'; attempt++) await new Promise(resolve => setTimeout(resolve, 5));
  const offline = new Importer(async () => { throw new Error('The original host is stopped'); }, locators);
  const state = await offline.status(preview.id);
  assert.equal(state.state, 'ready'); assert.equal(state.offlineJournal, true); assert.deepEqual(state.sessions, native.sessions);
  let replacementReads = 0;
  const replacement = { root: join(f.root, 'new-host-pid'), instanceID: 'replacement-plugin', request: async () => { replacementReads++; throw new Error('Wrong instance'); } } as unknown as PluginClient;
  const reconnected = new Importer(async () => replacement, locators);
  assert.deepEqual((await reconnected.status(preview.id)).sessions, native.sessions); assert.equal(replacementReads, 0);
  await assert.rejects(reconnected.start(preview.id)); assert.equal(replacementReads, 0);
});
