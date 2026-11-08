import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { JsonDocument } from '../src/json-stream.js';
import { CaptureStore } from '../src/capture-store.js';
import { temporary } from './fixtures.js';

async function collect(source: AsyncIterable<string | Uint8Array>): Promise<string> {
  let text = ''; for await (const chunk of source) text += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'); return text;
}

test('selects projected JSON without losing unfamiliar fields, Unicode or integer precision', async () => {
  const root = await temporary('json-document'), path = join(root, 'page.json');
  await writeFile(path, '{"data":[{"id":"m1","text":"café 🧪","future":{"integer":9007199254740993}}],"cursor":{"next":"page2"}}');
  const document = new JsonDocument(path);
  assert.equal(await document.kind(['data']), 'array');
  assert.equal(await document.kind(['data', 0]), 'object');
  assert.equal(await document.kind(['data', 0, 'text']), 'string');
  assert.equal(await document.kind(['missing']), undefined);
  assert.equal(await document.scalar(['cursor', 'next']), 'page2');
  assert.equal(await document.scalar(['missing']), undefined);
  const selected: string[] = [];
  for await (const value of document.stringsWhere(stack => stack.at(-1) === 'text')) selected.push(value);
  assert.deepEqual(selected, ['café 🧪']);
  assert.equal(await collect(document.text(['data', 0, 'text'])), 'café 🧪');
  assert.ok((await collect(document.json(['data', 0]))).includes('9007199254740993'));
  const values: JsonDocument[] = [];
  for await (const value of document.array(['data'], join(root, 'items'))) values.push(value);
  assert.equal(values.length, 1);
  assert.equal(await values[0].scalar(['id']), 'm1');
  assert.deepEqual(JSON.parse(await collect(values[0].json())), { id: 'm1', text: 'café 🧪', future: { integer: 9007199254740992 } });
});

test('streams a large individual string and byte-fragmented Unicode without a packed value', async () => {
  const root = await temporary('json-large'), path = join(root, 'large.json');
  const chunk = 'café 🧪 ` tool evidence\n'.repeat(200), repetitions = 300;
  const expected = createHash('sha256');
  for (let index = 0; index < repetitions; index++) expected.update(chunk);
  async function* input() {
    yield Buffer.from('{"text":"');
    for (let index = 0; index < repetitions; index++) {
      const encoded = Buffer.from(JSON.stringify(chunk).slice(1, -1));
      // Splits in the middle of UTF-8 sequences are intentional.
      yield encoded.subarray(0, 4); yield encoded.subarray(4, 13); yield encoded.subarray(13);
    }
    yield Buffer.from('"}');
  }
  const document = await JsonDocument.capture(input(), path);
  const actual = createHash('sha256'); let bytes = 0, largestChunk = 0;
  for await (const text of document.text(['text'])) { actual.update(text); bytes += Buffer.byteLength(text); largestChunk = Math.max(largestChunk, Buffer.byteLength(text)); }
  assert.equal(actual.digest('hex'), expected.digest('hex'));
  assert.equal(bytes, Buffer.byteLength(chunk) * repetitions);
  assert.ok(largestChunk < 1024 * 1024, `A large string was packed into ${largestChunk} bytes`);
});

test('rejects invalid JSON and does not silently accept a non-array page', async () => {
  const root = await temporary('json-invalid');
  await assert.rejects(JsonDocument.capture((async function* () { yield '{"data":['; })(), join(root, 'broken.json')), error => error instanceof Error && !error.message.includes('not implemented') && /JSON|parse|expected|ended/i.test(error.message));
  const path = join(root, 'not-array.json'); await writeFile(path, '{"data":{}}');
  await assert.rejects(async () => { for await (const _ of new JsonDocument(path).array(['data'], join(root, 'items'))) { /* Must reject rather than yield a partial page. */ } }, error => error instanceof Error && !error.message.includes('not implemented') && /array/i.test(error.message));
});

test('keeps identity and appendable control-record indexes on disk, including records appended during traversal', async () => {
  const root = await temporary('capture-store'), store = new CaptureStore(root);
  assert.equal(await store.claim('messages', 'msg_a'), true);
  assert.equal(await store.claim('messages', 'msg_a'), false);
  assert.equal(await store.claim('sessions', 'msg_a'), true);
  await store.append('queue', { id: 'ses_root' });
  const found: string[] = [];
  for await (const record of store.records<{ id: string }>('queue')) {
    found.push(record.id);
    if (record.id === 'ses_root') await store.append('queue', { id: 'ses_child' });
  }
  assert.deepEqual(found, ['ses_root', 'ses_child']);
  const first = await store.page<{ id: string }>('queue', 0, 1);
  assert.deepEqual(first.records, [{ id: 'ses_root' }]);
  assert.equal(typeof first.next, 'number');
  const second = await store.page<{ id: string }>('queue', first.next!, 1);
  assert.deepEqual(second.records, [{ id: 'ses_child' }]);
  assert.equal(second.next, null);
  await assert.rejects(store.page('queue', 1, 1), /cursor/i);
});
