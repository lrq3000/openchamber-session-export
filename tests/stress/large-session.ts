import assert from 'node:assert/strict';
import { createServer, type ServerResponse } from 'node:http';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import yauzl from 'yauzl';
import { SessionSource } from '../../src/opencode.js';
import { ArchiveWriter } from '../../src/archive.js';
import { JsonDocument } from '../../src/json-stream.js';
import { temporary } from '../fixtures.js';

const root = await temporary('large-session'), MiB = 1024 * 1024;
const chunk = 'x'.repeat(64 * 1024), sizes = [48 * MiB, 160 * MiB, 48 * MiB];
const target = { sessionID: 'ses_stress', directory: root, title: 'Synthetic 256 MiB export' };
let heap = 0, rss = 0, requests = 0;
const sample = () => { const memory = process.memoryUsage(); heap = Math.max(heap, memory.heapUsed); rss = Math.max(rss, memory.rss); };
const monitor = setInterval(sample, 25);
const send = async (response: ServerResponse, text: string) => { if (!response.write(text)) await once(response, 'drain'); };
const expected = sizes.map(size => { const hash = createHash('sha256'); for (let count = 0; count < size; count += chunk.length) hash.update(chunk); return hash.digest('hex'); });
const server = createServer(async (request, response) => {
  requests++;
  try {
    assert.equal(request.method, 'GET');
    const url = new URL(request.url!, 'http://localhost');
    response.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/api/session/active') response.end('{"data":{}}');
    else if (url.pathname === '/api/session/ses_stress') response.end(JSON.stringify({ data: { id: target.sessionID, title: target.title, location: { directory: root }, time: { updated: 1 } } }));
    else if (url.pathname === '/api/session') response.end('{"data":[],"cursor":{}}');
    else if (url.pathname.endsWith('/message')) {
      const index = Number(url.searchParams.get('cursor') ?? 0);
      assert.ok(index === 0 || !url.searchParams.has('order'));
      await send(response, index === 1 ? `{"data":[{"id":"msg_${index}","type":"assistant","content":[{"type":"tool","name":"large_tool","id":"tool_stress","state":{"status":"completed","input":{},"content":[{"type":"text","text":"` : `{"data":[{"id":"msg_${index}","type":"user","text":"`);
      for (let count = 0; count < sizes[index]; count += chunk.length) await send(response, chunk);
      await send(response, index === 1 ? '"}]}}]}' : '"}');
      response.end(`],"cursor":${index < 2 ? `{"next":"${index + 1}"}` : '{}'}}`);
    } else if (url.pathname.endsWith('/log')) {
      response.setHeader('Content-Type', 'text/event-stream');
      response.end('data: {"type":"log.synced","seq":7}\n\n');
    } else { response.writeHead(404); response.end(); }
  } catch (error) { response.destroy(error as Error); }
});
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
try {
  const source = new SessionSource({ url: `http://127.0.0.1:${(server.address() as any).port}`, version: 'synthetic' });
  const snapshot = await source.capture(target);
  assert.equal(snapshot.messageCount, 3);
  const archive = await new ArchiveWriter().write(snapshot, (async function* () {})(), {}, root);
  const entries = new Map<string, { path: string; size: number; sha256: string }>();
  await new Promise<void>((resolve, reject) => yauzl.open(archive.path, { lazyEntries: true }, (error, zip) => {
    if (error || !zip) return reject(error);
    zip.once('error', reject); zip.once('end', resolve);
    zip.on('entry', entry => zip.openReadStream(entry, (error, stream) => {
      if (error || !stream) return reject(error);
      const path = join(root, `verified-${entries.size}`), hash = createHash('sha256'); let size = 0;
      stream.on('data', (bytes: Buffer) => { hash.update(bytes); size += bytes.length; });
      void pipeline(stream, createWriteStream(path, { flags: 'wx' })).then(() => {
        assert.equal(size, entry.uncompressedSize);
        entries.set(entry.fileName, { path, size, sha256: hash.digest('hex') }); zip.readEntry();
      }).catch(reject);
    })); zip.readEntry();
  }));
  const manifest = JSON.parse(await readFile(entries.get('manifest.json')!.path, 'utf8'));
  assert.equal(manifest.sessions[0].messages, 3);
  for (const entry of manifest.entries) {
    assert.equal(entries.get(entry.path)?.size, entry.size);
    assert.equal(entries.get(entry.path)?.sha256, entry.sha256);
  }
  const projected = new JsonDocument(entries.get('session.json')!.path);
  for (let index = 0; index < sizes.length; index++) {
    const path = index === 1 ? ['messages', index, 'content', 0, 'state', 'content', 0, 'text'] : ['messages', index, 'text'];
    const hash = createHash('sha256'); let size = 0;
    for await (const text of projected.text(path as (string | number)[])) { hash.update(text); size += Buffer.byteLength(text); }
    assert.equal(size, sizes[index]); assert.equal(hash.digest('hex'), expected[index]);
  }
  // Count literal fixture bytes independently in the streamed Markdown, without loading/extracting it into RAM.
  let textBytes = 0; for await (const bytes of createReadStream(entries.get('conversation.md')!.path)) for (const byte of bytes as Buffer) if (byte === 120) textBytes++;
  assert.ok(textBytes >= 256 * MiB);
  assert.ok(entries.get('session.json')!.size > 256 * MiB);
  sample();
  const result = { inputBytes: sizes.reduce((a, b) => a + b, 0), messages: 3, entryCount: entries.size, peakHeapBytes: heap, peakRSSBytes: rss, requests, root, archive: archive.path };
  await writeFile(join(root, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally {
  clearInterval(monitor);
  await new Promise<void>(resolve => server.close(() => resolve()));
}
