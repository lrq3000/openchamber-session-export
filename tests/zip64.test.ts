import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import yazl from 'yazl';
import { MarkdownRenderer } from '../src/markdown.js';
import { diskCapture, temporary } from './fixtures.js';
import { unzip } from './zip-fixture.js';

// A format interoperability check, not a claim that a >4 GiB archive was generated in the unit suite.
test('the reused streaming ZIP writer supports ZIP64 entries and an independently readable ZIP64 directory', async () => {
  const root = await temporary('zip64'), path = join(root, 'forced.zip'), zip = new yazl.ZipFile();
  const completed = pipeline(zip.outputStream, createWriteStream(path, { flags: 'wx' }));
  zip.on('error', error => (zip.outputStream as Readable).destroy(error));
  zip.addReadStream(Readable.from(new MarkdownRenderer().render(await diskCapture()), { objectMode: false }), 'conversation.md', { forceZip64Format: true });
  zip.end({ forceZip64Format: true, comment: '' }); await completed;
  const bytes = await readFile(path);
  assert.ok(bytes.includes(Buffer.from([0x50, 0x4b, 0x06, 0x06])));
  const files = await unzip(path);
  assert.ok(files.get('conversation.md')!.includes(Buffer.from('café 🧪')));
});
