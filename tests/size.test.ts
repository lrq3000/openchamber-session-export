import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { Exporter } from '../src/exporter.js';
import { ArchiveWriter } from '../src/archive.js';
import { capture, diskCapture, temporary } from './fixtures.js';

test('exact size requires real compression and the same prepared ZIP is reused without recompression', async () => {
  const write = ArchiveWriter.prototype.write; let compressions = 0;
  ArchiveWriter.prototype.write = function (...args) { compressions++; return write.apply(this, args); };
  try {
  const exporter = new Exporter({ capture: async () => diskCapture() }), prepared = await exporter.prepare(capture().target);
  const estimate = await exporter.size(prepared.id, {});
  assert.ok(Number(estimate.knownSourceBytes) > 0); assert.equal(estimate.exactZipBytes, undefined);
  const measured = await exporter.size(prepared.id, {}, true);
  assert.ok(Number(measured.exactZipBytes) > 0);
  const job = exporter.start(prepared.id, { outputDirectory: await temporary('measured-publication') });
  for (let attempt = 0; attempt < 200; attempt++) {
    const result = exporter.status(job.id);
    if (result.state === 'ready') { assert.equal((await stat(result.path!)).size, measured.exactZipBytes); assert.equal(compressions, 1); return; }
    if (result.state === 'failed') assert.fail(result.error);
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.fail('Publication did not finish');
  } finally { ArchiveWriter.prototype.write = write; }
});
