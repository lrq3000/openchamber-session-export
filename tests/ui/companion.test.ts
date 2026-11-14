import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { chromium } from 'playwright';
import { Companion } from '../../src/companion.js';
import { temporary } from '../fixtures.js';

test('the actual companion page redeems its fragment, keeps authorization HttpOnly and downloads unchanged bytes', { timeout: 30000 }, async () => {
  const root = await temporary('companion-ui'), path = join(root, 'session archive 🧪.zip'), bytes = Buffer.alloc(2 * 1024 * 1024, 137);
  await writeFile(path, bytes);
  const companion = new Companion(), server = createServer(async (request, response) => {
    if (!await companion.handle(request, response, new URL(request.url!, 'http://localhost').pathname)) response.writeHead(404).end();
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as any).port, grant = await companion.issue(path, port);
  const browser = await chromium.launch({ ...(process.env.SESSION_EXPORT_BROWSER ? { executablePath: process.env.SESSION_EXPORT_BROWSER } : { channel: 'chrome' }), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 720, height: 600 }, acceptDownloads: true }), errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(grant.url);
    await page.getByRole('link', { name: 'Download ZIP', exact: true }).waitFor();
    assert.equal(await page.title(), 'Download session archive');
    assert.equal(new URL(page.url()).hash, '');
    assert.equal(await page.evaluate(() => document.cookie), '');
    const cookies = await page.context().cookies();
    assert.equal(cookies.length, 1); assert.equal(cookies[0].httpOnly, true); assert.equal(cookies[0].sameSite, 'Strict');
    await page.screenshot({ path: join(root, 'companion-ready.png') });
    const pending = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download ZIP', exact: true }).click();
    const download = await pending, saved = join(root, 'downloaded.zip');
    assert.equal(download.suggestedFilename(), basename(path));
    await download.saveAs(saved);
    assert.equal(createHash('sha256').update(await readFile(saved)).digest('hex'), createHash('sha256').update(bytes).digest('hex'));
    assert.deepEqual(errors, []);
    console.log(`Companion browser evidence: ${root}`);
  } finally {
    await browser.close();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
