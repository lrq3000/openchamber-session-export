import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Companion } from '../src/companion.js';
import { temporary } from './fixtures.js';

test('companion requires one-time redemption and a scoped cookie, supports ranges and refuses changed archives', async () => {
  const root = await temporary('companion'), path = join(root, 'private 🧪.zip'), bytes = Buffer.from('0123456789abcdef');
  await writeFile(path, bytes);
  const companion = new Companion(), server = createServer(async (request, response) => {
    if (!await companion.handle(request, response, new URL(request.url!, 'http://localhost').pathname)) response.writeHead(404).end();
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as any).port, origin = `http://127.0.0.1:${port}`;
  try {
    const issued = await companion.issue(path, port), url = new URL(issued.url), ticket = url.hash.slice(1);
    const page = await fetch(origin + '/companion');
    assert.match(page.headers.get('content-security-policy')!, /frame-ancestors 'none'/);
    const html = await page.text(); assert.ok(!html.includes(ticket)); assert.match(html, /history.replaceState/);
    const redeem = (value: string, from = origin) => fetch(origin + '/companion/redeem', { method: 'POST', headers: { Origin: from, 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket: value }) });
    assert.equal((await redeem(ticket, 'https://untrusted.invalid')).status, 401);
    const response = await redeem(ticket); assert.equal(response.status, 200);
    const cookieHeader = response.headers.get('set-cookie')!, cookie = cookieHeader.split(';')[0];
    const { id } = await response.json() as any, download = origin + `/companion/${id}/archive.zip`;
    assert.match(cookieHeader, /HttpOnly/); assert.match(cookieHeader, /SameSite=Strict/);
    assert.equal((await redeem(ticket)).status, 401);
    assert.equal((await fetch(download)).status, 401);
    const full = await fetch(download, { headers: { Cookie: cookie } }); assert.deepEqual(Buffer.from(await full.arrayBuffer()), bytes);
    assert.match(full.headers.get('content-disposition')!, /filename\*=UTF-8/);
    const range = await fetch(download, { headers: { Cookie: cookie, Range: 'bytes=2-5' } });
    assert.equal(range.status, 206); assert.equal(range.headers.get('content-range'), 'bytes 2-5/16'); assert.equal(await range.text(), '2345');
    const suffix = await fetch(download, { headers: { Cookie: cookie, Range: 'bytes=-3' } }); assert.equal(await suffix.text(), 'def');
    assert.equal((await fetch(download, { headers: { Cookie: cookie, Range: 'bytes=20-30' } })).status, 416);
    assert.equal((await fetch(download, { headers: { Cookie: cookie, Range: 'bytes=0-1,3-4' } })).status, 416);
    const head = await fetch(download, { method: 'HEAD', headers: { Cookie: cookie } }); assert.equal(head.status, 200); assert.equal(await head.text(), '');
    await writeFile(path, 'changed');
    assert.equal((await fetch(download, { headers: { Cookie: cookie } })).status, 401);
    await assert.rejects(companion.issue(path, port, 'http://public.invalid/companion'), /HTTPS/);
    const expired = await companion.issue(path, port), now = Date.now;
    // Advance only this test's clock; production expiry still uses wall time.
    Date.now = () => now() + 6 * 60 * 1000;
    try { assert.equal((await redeem(new URL(expired.url).hash.slice(1))).status, 401); } finally { Date.now = now; }
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});
