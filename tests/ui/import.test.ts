import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { parseGuestMessage } from '@openchamber/sdk/schemas';
import { createService } from '../../src/service.js';
import { prepareSessionCopies } from '../../src/portable-session.js';
import { readJsonFile } from '../../src/private-channel.js';
import type { PluginClient } from '../../src/plugin-client.js';
import { IMPORT_NOTICE } from '../../src/constants.js';
import { capture, diskCapture, temporary } from '../fixtures.js';

test('rendered imports preview both paths, keep the notice italic, require confirmation and reuse an exact export', { timeout: 60000 }, async () => {
  const root = await temporary('import-ui'), bridge = join(root, 'bridge'), states = new Map<string, any>();
  await mkdir(bridge);
  let captures = 0, imports = 0;
  const plugin = { root: bridge, request: async (path: string) => {
    const [, , id, operation] = path.split('/');
    if (operation === 'prepare') {
      const spec = await readJsonFile(join(bridge, 'jobs', id, 'spec.json'), 512 * 1024), sources = [];
      for (const file of spec.files) sources.push(await readJsonFile(join(bridge, 'jobs', id, file), 1024 * 1024));
      const prepared = prepareSessionCopies(sources, spec.directory);
      states.set(id, { state: 'prepared', progress: 'Ready for confirmation', sessions: [], warnings: prepared.warnings, ids: prepared.sessions.map(session => session.info.id) });
    }
    const state = states.get(id);
    if (operation === 'start') { imports++; state.state = 'ready'; state.progress = 'New sessions imported'; state.sessions = state.ids; }
    if (operation === 'cancel') { state.state = 'cancelled'; state.progress = 'Import cancelled'; }
    return state;
  } } as unknown as PluginClient;
  const service = createService('ui-transfer-secret', { capture: async target => {
    captures++;
    const input = capture(); input.target = target; input.sessions[0].info.id = target.sessionID; input.sessions[0].info.location.directory = root;
    input.sessions[0].messages[1].content.pop();
    return diskCapture(input);
  } }, { plugin: async () => plugin, dataDirectory: join(root, 'data') });
  await new Promise<void>(resolve => service.listen(0, '127.0.0.1', resolve));
  const serviceURL = `http://127.0.0.1:${(service.address() as any).port}`, seen: string[] = [];
  const host = createServer(async (request, response) => {
    if (request.url === '/') {
      response.setHeader('Content-Type', 'text/html');
      response.end(`<html><title>Session transfer QA</title><meta name="viewport" content="width=device-width,initial-scale=1"><iframe title="Session Export" sandbox="allow-scripts" src="/panel" style="border:0;width:100%;height:1600px"></iframe><script>
      window.calls=[];addEventListener('message',async event=>{const m=event.data;if(!m.channel)return;const answer=payload=>event.source.postMessage({channel:m.channel,v:m.v,type:m.type==='hello'?'ready':'result',id:m.id,ok:true,payload},'*');
      if(m.type==='hello'){answer({directory:${JSON.stringify(root)},session:{id:'ses_root',title:'Transfer fixture',busy:false},surface:'panel',locale:'en',settings:{},connection:{connected:false,account:''},item:null,theme:{mode:'light',tokens:{background:'#fff',foreground:'#18202b',muted:'#64748b',border:'#dbe2ea',primary:'#2563eb',primaryForeground:'#fff',font:'system-ui'}}});return;}
      window.calls.push(m);if(m.type==='service-request'){const r=await fetch('/bridge',{method:'POST',body:JSON.stringify(m)});answer({status:r.status,body:await r.text()});}else answer({});});</script></html>`);
    } else if (request.url === '/panel' || request.url === '/app.js') {
      response.setHeader('Content-Type', request.url === '/panel' ? 'text/html' : 'application/javascript');
      response.end(await readFile(request.url === '/panel' ? 'openchamber/panel/index.html' : 'openchamber/panel/app.js'));
    } else if (request.url === '/bridge') {
      const chunks = []; for await (const chunk of request) chunks.push(chunk);
      const message = parseGuestMessage(JSON.parse(Buffer.concat(chunks).toString()));
      if (message?.type !== 'service-request') { response.writeHead(400).end(); return; }
      const payload = message.payload; seen.push(payload.path);
      const url = new URL(payload.path, serviceURL); for (const [key, value] of Object.entries(payload.query ?? {})) url.searchParams.set(key, value);
      const result = await fetch(url, { method: payload.method, headers: { Authorization: 'Bearer ui-transfer-secret' }, body: payload.body });
      response.writeHead(result.status, { 'Content-Type': 'application/json' }); response.end(await result.text());
    } else response.writeHead(404).end();
  });
  await new Promise<void>(resolve => host.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ ...(process.env.SESSION_EXPORT_BROWSER ? { executablePath: process.env.SESSION_EXPORT_BROWSER } : { channel: 'chrome' }), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 720, height: 1000 } }), errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message)); page.setDefaultTimeout(10000);
    const url = `http://127.0.0.1:${(host.address() as any).port}/`; await page.goto(url);
    assert.equal(page.url(), url); assert.equal(await page.title(), 'Session transfer QA');
    const frame = page.frameLocator('iframe');
    await frame.getByRole('heading', { name: 'Session Export', exact: true }).waitFor();
    await frame.getByLabel('Output directory', { exact: true }).fill(root);
    await frame.getByRole('button', { name: 'Measure exact ZIP size', exact: true }).click();
    await frame.locator('#size-preview').filter({ hasText: 'Exact ZIP:' }).waitFor();
    const measured = await frame.locator('#size-preview').innerText();
    assert.equal(captures, 1);
    await frame.getByRole('button', { name: 'Export session', exact: true }).click();
    await frame.locator('#status').filter({ hasText: 'Archive saved' }).waitFor();
    assert.equal(captures, 1, 'Export must reuse the measured preparation');
    const path = await frame.locator('#result-path').innerText(), bytes = await readFile(path);
    assert.ok(measured.includes('Exact ZIP:')); assert.ok(bytes.length > 22);
    await frame.getByRole('button', { name: 'Open Files', exact: true }).click();
    await page.waitForFunction(() => (window as any).calls.some((call: any) => call.type === 'open-surface'));
    const assertNotice = async () => {
      assert.equal(await frame.locator('#import-notice').innerText(), IMPORT_NOTICE);
      assert.equal(await frame.locator('#import-notice').evaluate(element => element.tagName), 'EM');
      assert.equal(await frame.locator('#import-notice').evaluate(element => getComputedStyle(element).fontStyle), 'italic');
      assert.equal(await frame.locator('#import-notice').isVisible(), true);
    };
    await assertNotice();
    assert.equal(await frame.getByRole('button', { name: 'Import as new session', exact: true }).isDisabled(), true);
    await frame.getByLabel('ZIP path on this server', { exact: true }).fill(path);
    await frame.getByRole('button', { name: 'Preview import', exact: true }).click();
    await frame.locator('#import-preview').filter({ hasText: '1 session(s)' }).waitFor();
    assert.equal(imports, 0, 'Preview must not invoke native import'); await assertNotice();
    await frame.getByRole('button', { name: 'Import as new session', exact: true }).click();
    await frame.locator('#import-status').filter({ hasText: '1 new session(s) created' }).waitFor();
    assert.equal(imports, 1);
    await frame.getByRole('button', { name: 'Open imported session', exact: true }).click();
    await page.waitForFunction(() => (window as any).calls.some((call: any) => call.type === 'open-session' && call.payload.sessionId !== 'ses_root'));
    await frame.locator('#import-file').setInputFiles({ name: 'device.zip', mimeType: 'application/zip', buffer: bytes });
    await frame.getByRole('button', { name: 'Upload selected ZIP', exact: true }).click();
    await frame.locator('#import-status').filter({ hasText: 'Uploaded device.zip' }).waitFor();
    assert.equal(imports, 1); assert.ok(seen.includes('/uploads/chunk'));
    await frame.getByRole('button', { name: 'Preview import', exact: true }).click();
    await frame.locator('#import-status').filter({ hasText: 'Review the preview' }).waitFor();
    await assertNotice(); assert.equal(imports, 1);
    await page.screenshot({ path: join(root, 'import-preview-desktop.png'), fullPage: true });
    await frame.getByRole('button', { name: 'Import as new session', exact: true }).click();
    await frame.locator('#import-status').filter({ hasText: '1 new session(s) created' }).waitFor();
    assert.equal(imports, 2);
    assert.equal(new Set([...states.values()].flatMap(state => state.ids)).size, 2, 'Each restoration uses distinct new sessions');
    await page.setViewportSize({ width: 360, height: 840 }); await assertNotice();
    assert.equal(await frame.locator('body').evaluate(body => body.scrollWidth <= innerWidth), true);
    const height = await frame.locator('body').evaluate(body => body.scrollHeight);
    await page.locator('iframe').evaluate((element, height) => { element.style.height = `${height + 40}px`; }, height);
    await page.screenshot({ path: join(root, 'import-narrow.png'), fullPage: true });
    await frame.locator('#import-panel').screenshot({ path: join(root, 'import-result-phone-width.png') });
    await frame.getByRole('button', { name: 'Check import result', exact: true }).click();
    await frame.getByRole('button', { name: 'Check import result', exact: true }).waitFor({ state: 'visible' });
    assert.equal(imports, 2, 'Repeated status checks must not resubmit the import');
    assert.deepEqual(errors, []); assert.equal(await frame.locator('#import-error').innerText(), '');
    console.log(`Import UI evidence: ${root}`);
  } finally {
    await browser.close();
    await new Promise<void>(resolve => host.close(() => resolve()));
    await new Promise<void>(resolve => service.close(() => resolve()));
  }
});
