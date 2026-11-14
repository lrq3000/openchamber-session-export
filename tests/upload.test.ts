import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UploadStore } from '../src/upload.js';
import { temporary } from './fixtures.js';

test('upload blocks are bounded, idempotent and resumable without appending duplicate bytes', async () => {
  const root = await temporary('upload'), uploads = new UploadStore(join(root, 'uploads'));
  const bytes = Buffer.alloc(65549, 137), hash = createHash('sha256').update(bytes).digest('hex');
  const upload = await uploads.start('device.zip', bytes.length);
  const first = bytes.subarray(0, 32768).toString('base64');
  assert.equal((await uploads.chunk(upload.id, 0, first)).received, 32768);
  assert.equal((await uploads.chunk(upload.id, 0, first)).received, 32768);
  await assert.rejects(uploads.chunk(upload.id, 9, first), /offset/i);
  const resumed = new UploadStore(join(root, 'uploads'));
  assert.equal((await resumed.status(upload.id)).received, 32768);
  for (let offset = 32768; offset < bytes.length; offset += 32768) await resumed.chunk(upload.id, offset, bytes.subarray(offset, offset + 32768).toString('base64'));
  assert.equal((await resumed.finish(upload.id, hash)).sha256, hash);
  assert.deepEqual(await readFile(await resumed.path(upload.id)), bytes);
  await assert.rejects(resumed.chunk(upload.id, 0, first), /invalid/i);
});

test('finalization recovers a rename-before-journal restart and refuses an incorrectly sized final file', async () => {
  const root = join(await temporary('upload-restart'), 'uploads'), uploads = new UploadStore(root), bytes = Buffer.alloc(100, 7);
  const upload = await uploads.start('restart.zip', bytes.length);
  await uploads.chunk(upload.id, 0, bytes.toString('base64'));
  await rename(join(root, upload.id, 'archive.partial'), join(root, upload.id, 'archive.zip'));
  const restarted = new UploadStore(root);
  assert.equal((await restarted.finish(upload.id)).state, 'ready');
  const broken = await restarted.start('wrong.zip', bytes.length);
  await restarted.chunk(broken.id, 0, bytes.toString('base64'));
  await writeFile(join(root, broken.id, 'archive.partial'), 'short');
  await assert.rejects(restarted.finish(broken.id), /size/);
});

test('cancel only removes the upload-owned partial file and rejects incomplete or malformed uploads', async () => {
  const uploads = new UploadStore(join(await temporary('upload-cancel'), 'uploads'));
  await assert.rejects(uploads.start('../bad.txt', 200), /ZIP/);
  const upload = await uploads.start('archive.zip', 100);
  await assert.rejects(uploads.finish(upload.id), /incomplete/);
  await assert.rejects(uploads.chunk(upload.id, 0, 'not base64'), /Invalid/);
  await uploads.cancel(upload.id);
  assert.equal((await uploads.status(upload.id)).state, 'cancelled');
  await assert.rejects(uploads.path(upload.id), /Finish/);
});
