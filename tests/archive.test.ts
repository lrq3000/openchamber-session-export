import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import yauzl from 'yauzl';
import { Exporter } from '../src/exporter.js';
import { capture, temporary } from './fixtures.js';

export async function unzip(path: string): Promise<Map<string, Buffer>> {
  return new Promise((resolve, reject) => yauzl.open(path, { lazyEntries: true }, (error, zip) => {
    if (error || !zip) return reject(error);
    const files = new Map<string, Buffer>();
    zip.on('error', reject); zip.on('end', () => resolve(files));
    zip.on('entry', entry => zip.openReadStream(entry, (error, stream) => {
      if (error || !stream) return reject(error);
      const chunks: Buffer[] = []; stream.on('data', chunk => chunks.push(chunk)); stream.on('error', reject);
      stream.on('end', () => { files.set(entry.fileName, Buffer.concat(chunks)); zip.readEntry(); });
    })); zip.readEntry();
  }));
}

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
  const source = { capture: async () => capture() };
  const exporter = new Exporter(source, { discover: async () => { throw new Error('External files were inspected while OFF'); } });
  const prepared = await exporter.prepare(capture().target);
  const result = await finish(exporter, exporter.start(prepared.id, { outputDirectory: directory }).id);
  const files = await unzip(result.path!);
  assert.ok(files.has('conversation.md')); assert.ok(files.has('session.json')); assert.ok(files.has('events/ses_root.jsonl'));
  assert.ok(![...files.keys()].some(name => name.startsWith('assets/')));
  assert.equal(JSON.parse(files.get('session.json')!.toString()).messages[1].content[3].custom, 'Keep unknown fields');
  const manifest = JSON.parse(files.get('manifest.json')!.toString());
  assert.equal(manifest.assets.collectionEnabled, false);
  for (const entry of manifest.entries) assert.equal(createHash('sha256').update(files.get(entry.path)!).digest('hex'), entry.sha256);
  assert.ok((await stat(result.path!)).size > 0);
  assert.equal(files.get('conversation.md')!.includes(Buffer.from('café 🧪')), true);
});

test('requires explicit asset selection and excludes a file changed after preview', async () => {
  const directory = await temporary('selected');
  const path = join(directory, 'image.png'); await writeFile(path, 'original bytes');
  const input = capture(); input.sessions[0].messages[0].files = [{ source: { type: 'file', path } }];
  const exporter = new Exporter({ capture: async () => input });
  const preview = await exporter.prepare(input.target, true);
  assert.equal(preview.assets.length, 1);
  const chosen = { includeFiles: true, selectedAssetIDs: [preview.assets[0].id], outputDirectory: directory };
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
  const exporter = new Exporter({ capture: async () => capture() });
  const prepared = await exporter.prepare(capture().target);
  assert.throws(() => exporter.start(prepared.id, { includeFiles: true }), /preview|inventory/i);
  assert.throws(() => exporter.start('unknown', {}), /prepar/i);
  assert.throws(() => exporter.start(prepared.id, { outputDirectory: '\\\\network\\share' }), /local|absolute/i);
  const preview = await exporter.prepare(capture().target, true);
  assert.throws(() => exporter.start(preview.id, { includeFiles: true, selectedAssetIDs: ['unknown'] }), /selection/i);
});

test('retains unavailable-asset reasons even when disabled candidates cannot be selected', async () => {
  const directory = await temporary('omission');
  const exporter = new Exporter({ capture: async () => capture() }, { discover: async () => [
    { id: 'missing', name: 'missing.pdf', path: '/missing.pdf', sessions: ['ses_root'], size: 0, status: 'missing', reason: 'The referenced file is unavailable.' },
    { id: 'oversized', name: 'large.pdf', path: '/large.pdf', sessions: ['ses_root'], size: 200000000, status: 'refused', reason: 'File exceeds the 100 MiB per-file limit.' },
  ] });
  const preview = await exporter.prepare(capture().target, true);
  const result = await finish(exporter, exporter.start(preview.id, { includeFiles: true, selectedAssetIDs: [], outputDirectory: directory }).id);
  const files = await unzip(result.path!); const manifest = JSON.parse(files.get('manifest.json')!.toString());
  assert.equal(manifest.assets.decisions[0].availability, 'missing');
  assert.equal(manifest.assets.decisions[1].reason, 'File exceeds the 100 MiB per-file limit.');
  assert.equal(manifest.assets.decisions[1].selected, false);
  assert.ok(manifest.warnings.some((text: string) => text.includes('large.pdf')));
  assert.equal(manifest.coverage.atomic, false);
});
