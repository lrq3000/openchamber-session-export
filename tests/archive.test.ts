import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, stat, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { Exporter } from '../src/exporter.js';
import { ArchiveWriter } from '../src/archive.js';
import { capture, diskCapture, temporary } from './fixtures.js';
import { unzip } from './zip-fixture.js';
import { CaptureStore } from '../src/capture-store.js';
import type { SessionRecord } from '../src/types.js';

async function finish(exporter: Exporter, id: string) {
  for (let i = 0; i < 1000; i++) {
    const result = exporter.status(id);
    if (result.state !== 'running') { assert.equal(result.state, 'ready', result.error ?? 'Export did not become ready'); return result; }
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  throw new Error('Export did not finish');
}

test('default export never inspects external files and creates independently readable, checksummed ZIP entries', async () => {
  const directory = await temporary('archive');
  const source = { capture: async () => diskCapture() };
  const exporter = new Exporter(source, { discover: async function* () { throw new Error('External files were inspected while OFF'); } });
  const prepared = await exporter.prepare(capture().target);
  const result = await finish(exporter, exporter.start(prepared.id, { outputDirectory: directory }).id);
  const files = await unzip(result.path!);
  assert.ok(files.has('conversation.md')); assert.ok(files.has('session.json')); assert.ok(files.has('events/ses_root.jsonl'));
  assert.ok(![...files.keys()].some(name => name.startsWith('assets/')));
  assert.equal(JSON.parse(files.get('session.json')!.toString()).messages[1].content[3].custom, 'Keep unknown fields');
  const manifest = JSON.parse(files.get('manifest.json')!.toString());
  assert.equal(manifest.version, JSON.parse(await readFile('package.json', 'utf8')).version);
  assert.equal(manifest.assets.collectionEnabled, false);
  for (const entry of manifest.entries) assert.equal(createHash('sha256').update(files.get(entry.path)!).digest('hex'), entry.sha256);
  assert.ok((await stat(result.path!)).size > 0);
  assert.equal(files.get('conversation.md')!.includes(Buffer.from('café 🧪')), true);
});

test('paginates a large inventory without losing any referring sessions in the archive', async () => {
  const directory = await temporary('inventory-pages'), file = join(directory, 'shared.txt'); await writeFile(file, 'shared');
  const input = capture();
  input.sessions[0].messages[0].files = [file, ...Array.from({ length: 101 }, (_, index) => join(directory, `missing-${index}`))].map(path => ({ source: { path } }));
  for (let index = 0; index < 30; index++) input.sessions.push({ ...input.sessions[0], info: { ...input.sessions[0].info, id: `ses_origin_${index}` }, messages: [{ id: `origin_${index}`, type: 'user', text: '', files: [{ source: { path: file } }] }] });
  const exporter = new Exporter({ capture: async () => diskCapture(input) });
  const preview = await exporter.prepare(input.target, true), first = await exporter.inventory(preview.id), second = await exporter.inventory(preview.id, first.next!);
  assert.equal(preview.assets.length, 0); assert.equal(preview.assetCount, 102);
  assert.equal(first.assets.length, 100); assert.equal(second.assets.length, 2); assert.equal(second.next, null);
  assert.equal(new Set([...first.assets, ...second.assets].map(asset => asset.id)).size, 102);
  assert.equal(first.assets[0].sessions.length, 25); assert.equal(first.assets[0].additionalSessionCount, 6);
  await assert.rejects(exporter.inventory(preview.id, 1), /cursor/i);
  const result = await finish(exporter, exporter.start(preview.id, { includeFiles: true, selectedAssetIDs: [], outputDirectory: directory }).id);
  const files = await unzip(result.path!), manifest = JSON.parse(files.get('manifest.json')!.toString());
  assert.equal(manifest.assets.decisions.length, 102);
  assert.equal(manifest.assets.decisions[0].sessions.length, 31);
  assert.equal(manifest.warnings.length, 101);
  assert.equal(result.warnings!.length, 25); assert.equal(result.warningCount, 101);
});

test('fails explicitly instead of publishing an archive into an unwritable staging destination', async () => {
  const root = await temporary('staging-failure'), occupied = join(root, 'not-a-directory'); await writeFile(occupied, 'retain me');
  await assert.rejects(new ArchiveWriter().write(await diskCapture(), (async function* () {})(), {}, occupied), error => ['EEXIST', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? ''));
  assert.equal(await readFile(occupied, 'utf8'), 'retain me');
});

test('refuses missing or shortened core indexes rather than publishing an incomplete successful archive', async () => {
  for (const damaged of ['sessions-missing', 'sessions-short', 'messages-missing', 'messages-short']) {
    const snapshot = await diskCapture(), store = new CaptureStore(snapshot.root), directory = await temporary('missing-core');
    const session = (await store.page<SessionRecord>('sessions')).records[0];
    const path = store.file(damaged.startsWith('sessions') ? 'sessions' : session.messageIndex);
    // Keep the original evidence available for manual diagnosis rather than deleting it during the regression.
    await rename(path, path + '.retained');
    if (damaged.endsWith('short')) await writeFile(path, '');
    await assert.rejects(new ArchiveWriter().write(snapshot, (async function* () {})(), {}, directory), /missing|index|capture|prepar|ENOENT|count/i);
  }
});

test('preserves a legitimate zero-message session with explicit empty evidence indexes', async () => {
  const input = capture(); input.sessions[0].messages = [];
  const directory = await temporary('empty-session'), snapshot = await diskCapture(input);
  const result = await new ArchiveWriter().write(snapshot, (async function* () {})(), {}, directory);
  const files = await unzip(result.path), manifest = JSON.parse(files.get('manifest.json')!.toString());
  assert.equal(JSON.parse(files.get('session.json')!.toString()).messages.length, 0);
  assert.equal(manifest.sessions.length, 1); assert.equal(manifest.sessions[0].messages, 0);
});

test('requires explicit asset selection and excludes a file changed after preview', async () => {
  const directory = await temporary('selected');
  const path = join(directory, 'image.png'); await writeFile(path, 'original bytes');
  const input = capture(); input.sessions[0].messages[0].files = [{ source: { type: 'file', path } }];
  const exporter = new Exporter({ capture: async () => diskCapture(input) });
  const preview = await exporter.prepare(input.target, true);
  const inventory = await exporter.inventory(preview.id);
  assert.equal(inventory.assets.length, 1);
  const chosen = { includeFiles: true, selectedAssetIDs: [inventory.assets[0].id], outputDirectory: directory };
  const first = await finish(exporter, exporter.start(preview.id, chosen).id);
  const files = await unzip(first.path!);
  const assets = [...files.keys()].filter(name => name.startsWith('assets/'));
  assert.equal(assets.length, 1); assert.equal(files.get(assets[0])!.toString(), 'original bytes');
  await writeFile(path, 'changed bytes with a different size');
  const second = await finish(exporter, exporter.start(preview.id, chosen).id);
  assert.notEqual(first.path, second.path);
  const changed = await unzip(second.path!);
  assert.equal([...changed.keys()].filter(name => name.startsWith('assets/')).length, 0);
  assert.ok(JSON.parse(changed.get('manifest.json')!.toString()).warnings.some((text: string) => /changed/i.test(text)));
  assert.equal((await readFile(first.path!)).equals(await readFile(second.path!)), false);
});

test('rejects unpreviewed file collection, unknown selections, network output paths and unknown preparation IDs', async () => {
  const exporter = new Exporter({ capture: async () => diskCapture() });
  const prepared = await exporter.prepare(capture().target);
  assert.throws(() => exporter.start(prepared.id, { includeFiles: true }), /preview|inventory/i);
  assert.throws(() => exporter.start('unknown', {}), /prepar/i);
  assert.throws(() => exporter.start(prepared.id, { outputDirectory: '\\\\network\\share' }), /local|absolute/i);
  const preview = await exporter.prepare(capture().target, true);
  assert.throws(() => exporter.start(preview.id, { includeFiles: true, selectedAssetIDs: ['unknown'] }), /selection/i);
});

test('retains unavailable-asset reasons even when disabled candidates cannot be selected', async () => {
  const directory = await temporary('omission');
  const exporter = new Exporter({ capture: async () => diskCapture() }, { discover: async function* () {
    yield { id: 'missing', name: 'missing.pdf', path: '/missing.pdf', sessions: ['ses_root'], size: 0, status: 'missing' as const, reason: 'The referenced file is unavailable.' };
    yield { id: 'oversized', name: 'large.pdf', path: '/large.pdf', sessions: ['ses_root'], size: 200000000, status: 'refused' as const, reason: 'File exceeds the 100 MiB per-file limit.' };
  } });
  const preview = await exporter.prepare(capture().target, true);
  const result = await finish(exporter, exporter.start(preview.id, { includeFiles: true, selectedAssetIDs: [], outputDirectory: directory }).id);
  const files = await unzip(result.path!); const manifest = JSON.parse(files.get('manifest.json')!.toString());
  assert.equal(manifest.assets.decisions[0].availability, 'missing');
  assert.equal(manifest.assets.decisions[1].reason, 'File exceeds the 100 MiB per-file limit.');
  assert.equal(manifest.assets.decisions[1].selected, false);
  assert.ok(manifest.warnings.some((text: string) => text.includes('large.pdf')));
  assert.equal(manifest.coverage.atomic, false);
});
