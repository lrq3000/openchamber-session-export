import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { parseGuestMessage } from '@openchamber/sdk/schemas';
import { createService } from '../../src/service.js';
import { capture, temporary } from '../fixtures.js';

const tokens = {
  background: '#ffffff', foreground: '#1f2937', elevated: '#ffffff', elevatedForeground: '#1f2937', muted: '#64748b', mutedSurface: '#f1f5f9', subtle: '#f8fafc', border: '#dbe2ea', hover: '#e2e8f0', active: '#dbeafe', primary: '#2563eb', primaryForeground: '#ffffff', primaryText: '#1f2937', successText: '#15754a', warningText: '#925f13', errorText: '#b91c1c', infoText: '#245fae', font: 'system-ui', mono: 'monospace', radius: '6px',
};

test('the real SDK panel exports, reviews files and preserves the clicked target across focus changes', { timeout: 45000 }, async () => {
  const root = await temporary('ui');
  const image = join(root, 'generated-image.png'); await writeFile(image, 'fixture image bytes');
  let blocked = false, release!: () => void, observed!: () => void;
  let gate = Promise.resolve(); let observation = Promise.resolve();
  const targets: string[] = [];
  const service = createService('ui-fixture-secret', { capture: async target => {
    targets.push(target.sessionID); observed?.(); if (blocked) await gate;
    const data = capture(); data.target = target; data.sessions[0].info.id = target.sessionID;
    data.sessions[0].messages[0].files = [{ name: 'generated-image.png', source: { type: 'file', path: image } }];
    return data;
  } });
  await new Promise<void>(resolve => service.listen(0, '127.0.0.1', resolve));
  const serviceURL = `http://127.0.0.1:${(service.address() as any).port}`;
  const seen: string[] = [];
  const host = createServer(async (req, res) => {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.end(`<html><head><title>Session Export SDK QA</title></head><body style="margin:0"><iframe title="Session Export" sandbox="allow-scripts" src="/panel" style="border:0;width:100%;height:900px"></iframe><script>
      window.copied='';window.calls=[];
      window.changeSession=()=>{const f=document.querySelector('iframe');f.contentWindow.postMessage({channel:'openchamber.sdk',v:1,type:'session',payload:{session:{id:'ses_other',title:'Another session',busy:false}}},'*')};
      addEventListener('message',async e=>{const m=e.data;if(!m.channel)return;
      const answer=(type,payload)=>e.source.postMessage({channel:m.channel,v:m.v,type,id:m.id,ok:true,payload},'*');
      if(m.type==='hello'){answer('ready',{directory:'/project',session:{id:'ses_root',title:'Export fixture',busy:false},surface:'panel',locale:'en',connection:{connected:false,account:''},settings:{},item:null,theme:{mode:'light',tokens:${JSON.stringify(tokens)}}});return;}
      window.calls.push(m.type);
      if(m.type==='service-request'){const r=await fetch('/bridge',{method:'POST',body:JSON.stringify(m)});answer('result',{status:r.status,body:await r.text()});}
      else {if(m.type==='clipboard-write')window.copied=m.payload.text;answer('result',{});}});
      </script></body></html>`);
    } else if (req.url === '/panel') {
      res.setHeader('Content-Type', 'text/html'); res.end(existsSync('openchamber/panel/index.html') ? readFileSync('openchamber/panel/index.html') : '<html><body></body></html>');
    } else if (req.url === '/app.js') {
      res.setHeader('Content-Type', 'application/javascript'); res.end(existsSync('openchamber/panel/app.js') ? readFileSync('openchamber/panel/app.js') : '');
    } else if (req.url === '/bridge') {
      const chunks: Buffer[] = []; for await (const part of req) chunks.push(Buffer.from(part));
      const message = parseGuestMessage(JSON.parse(Buffer.concat(chunks).toString()));
      if (message?.type !== 'service-request') { res.writeHead(400); res.end(); return; }
      const payload = message.payload; seen.push(payload.path);
      const url = new URL(payload.path, serviceURL); for (const [key, value] of Object.entries(payload.query ?? {})) url.searchParams.set(key, value);
      const response = await fetch(url, { method: payload.method, headers: { Authorization: 'Bearer ui-fixture-secret' }, body: payload.body });
      res.writeHead(response.status, { 'Content-Type': 'application/json' }); res.end(await response.text());
    } else { res.writeHead(404); res.end(); }
  });
  await new Promise<void>(resolve => host.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 480, height: 920 } });
    page.setDefaultTimeout(3000); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${(host.address() as any).port}/`);
    const frame = page.frameLocator('iframe');
    await frame.getByRole('heading', { name: 'Session Export', exact: true }).waitFor();
    assert.equal(await frame.getByRole('checkbox', { name: 'Include referenced local files', exact: true }).isChecked(), false);
    await frame.getByLabel('Output directory', { exact: true }).fill(root);
    await frame.getByRole('button', { name: 'Export session', exact: true }).click();
    await frame.getByRole('status').filter({ hasText: 'Archive saved' }).waitFor();
    await frame.getByRole('button', { name: 'Copy path', exact: true }).click();
    assert.ok((await page.evaluate(() => (window as any).copied)).endsWith('.zip'));
    assert.ok(!seen.includes('/inventory'));
    await frame.getByRole('checkbox', { name: 'Include referenced local files', exact: true }).check();
    await frame.getByRole('button', { name: 'Review files', exact: true }).click();
    await frame.getByRole('checkbox', { name: /^Include generated-image\.png/ }).waitFor();
    assert.equal(await frame.getByRole('checkbox', { name: /^Include generated-image\.png/ }).isChecked(), false);
    await frame.getByRole('checkbox', { name: /^Include generated-image\.png/ }).check();
    await frame.getByRole('button', { name: 'Create archive', exact: true }).click();
    await frame.getByRole('status').filter({ hasText: 'Archive saved' }).waitFor();
    blocked = true; gate = new Promise(resolve => release = resolve); observation = new Promise(resolve => observed = resolve);
    await frame.getByRole('button', { name: 'Review files', exact: true }).click();
    await observation;
    await page.evaluate(() => (window as any).changeSession());
    await frame.getByText('Another session', { exact: true }).waitFor();
    assert.equal(await frame.getByRole('checkbox', { name: 'Include referenced local files', exact: true }).isChecked(), false);
    release(); blocked = false;
    await frame.getByRole('button', { name: 'Export session', exact: true }).waitFor({ state: 'visible' });
    await frame.getByRole('button', { name: 'Export session', exact: true }).click();
    await frame.getByRole('status').filter({ hasText: 'Archive saved' }).waitFor();
    assert.equal(targets.at(-2), 'ses_root'); assert.equal(targets.at(-1), 'ses_other');
    assert.equal(await frame.getByRole('checkbox', { name: /^Include generated-image\.png/ }).count(), 0);
    assert.ok(!(await page.evaluate(() => (window as any).calls)).includes('generate'));
    assert.deepEqual(errors, []);
    await page.screenshot({ path: join(root, 'panel-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 360, height: 840 });
    await frame.getByRole('heading', { name: 'Session Export', exact: true }).waitFor();
    await frame.locator('body').evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    assert.equal(await frame.locator('body').evaluate(body => body.scrollWidth <= window.innerWidth), true);
    await page.screenshot({ path: join(root, 'panel-narrow.png'), fullPage: true });
    console.log(`Panel screenshots: ${root}`);
  } finally {
    release?.(); await browser.close();
    await new Promise<void>(resolve => host.close(() => resolve()));
    await new Promise<void>(resolve => service.close(() => resolve()));
  }
});
