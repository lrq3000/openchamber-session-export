import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, type Page } from 'playwright';
import { parseGuestMessage } from '@openchamber/sdk/schemas';
import { createService } from '../../src/service.js';
import { capture, diskCapture, temporary } from '../fixtures.js';

const tokens = {
  background: '#ffffff', foreground: '#1f2937', elevated: '#ffffff', elevatedForeground: '#1f2937', muted: '#64748b', mutedSurface: '#f1f5f9', subtle: '#f8fafc', border: '#dbe2ea', hover: '#e2e8f0', active: '#dbeafe', primary: '#2563eb', primaryForeground: '#ffffff', primaryText: '#1f2937', successText: '#15754a', warningText: '#925f13', errorText: '#b91c1c', infoText: '#245fae', font: 'system-ui', mono: 'monospace', radius: '6px',
};

/** Exercise the controlled SDK selector itself: a changed description alone cannot prove that its value was synchronized. */
async function assertExportMode(page: Page, screenshot: string): Promise<void> {
  const frame = page.frameLocator('iframe');
  const mode = frame.getByRole('button', { name: 'Export mode', exact: true });
  const history = frame.getByRole('checkbox', { name: /^Keep earlier conversation for reference only/ });
  assert.equal(await mode.innerText(), 'Complete');
  assert.equal(await history.isVisible(), false);
  await mode.click();
  assert.equal(await frame.getByRole('option', { name: 'Complete', exact: true }).getAttribute('aria-selected'), 'true');
  await frame.getByRole('option', { name: 'Resume snapshot', exact: true }).click();
  await history.waitFor({ state: 'visible' });
  await page.screenshot({ path: screenshot, fullPage: true });
  assert.equal(await mode.innerText(), 'Resume snapshot', `The selector label must reflect the profile already used by the panel; evidence: ${screenshot}`);
  await mode.click();
  assert.equal(await frame.getByRole('option', { name: 'Resume snapshot', exact: true }).getAttribute('aria-selected'), 'true');
  assert.equal(await frame.getByRole('option', { name: 'Complete', exact: true }).getAttribute('aria-selected'), 'false');
  await frame.getByRole('listbox').press('Escape');
  await history.check();
  const files = frame.getByRole('checkbox', { name: 'Include referenced local files', exact: true });
  await files.check(); await files.uncheck();
  assert.equal(await mode.innerText(), 'Resume snapshot', 'Unrelated control refreshes must preserve the profile');
  await mode.click(); await frame.getByRole('option', { name: 'Complete', exact: true }).click();
  assert.equal(await mode.innerText(), 'Complete');
  assert.equal(await history.isVisible(), false);
  await mode.click();
  assert.equal(await frame.getByRole('option', { name: 'Complete', exact: true }).getAttribute('aria-selected'), 'true');
  await frame.getByRole('option', { name: 'Resume snapshot', exact: true }).click();
  assert.equal(await mode.innerText(), 'Resume snapshot');
  assert.equal(await history.isChecked(), true, 'Switching modes must not change the existing history preference');
  await history.uncheck();
  await mode.click(); await frame.getByRole('option', { name: 'Complete', exact: true }).click();
  assert.equal(await history.isVisible(), false);
}

test('the real SDK export panel', { timeout: 45000 }, async t => {
  const root = await temporary('ui');
  const image = join(root, 'generated-image.png'); await writeFile(image, 'fixture image bytes');
  let blocked = false, release!: () => void, observed!: () => void, coverageWarning = '';
  let gate = Promise.resolve(); let observation = Promise.resolve();
  const targets: string[] = [];
  let chooserCalls = 0, chooserResult: any = { state: 'cancelled' };
  let chooserGate = Promise.resolve(), chooserRelease!: () => void;
  const service = createService('ui-fixture-secret', { capture: async target => {
    targets.push(target.sessionID); observed?.(); if (blocked) await gate;
    const data = capture(); data.target = target; data.sessions[0].info.id = target.sessionID;
    if (coverageWarning) data.warnings.push(coverageWarning);
    data.sessions[0].messages[0].files = [{ name: 'generated-image.png', source: { type: 'file', path: image } }];
    return diskCapture(data);
  } }, { picker: { choose: async (_name, signal) => {
    chooserCalls++;
    await Promise.race([chooserGate, new Promise<void>(resolve => signal.addEventListener('abort', () => resolve(), { once: true }))]);
    return signal.aborted ? { state: 'cancelled' } : chooserResult;
  } } });
  await new Promise<void>(resolve => service.listen(0, '127.0.0.1', resolve));
  const serviceURL = `http://127.0.0.1:${(service.address() as any).port}`;
  const seen: string[] = [];
  const host = createServer(async (req, res) => {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.end(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Session Export SDK QA</title></head><body style="margin:0"><iframe title="Session Export" sandbox="allow-scripts" src="/panel" style="border:0;width:100%;height:900px"></iframe><script>
      window.copied='';window.calls=[];
      window.changeSession=(title='Another session')=>{const f=document.querySelector('iframe');f.contentWindow.postMessage({channel:'openchamber.sdk',v:1,type:'session',payload:{session:{id:'ses_other',title,busy:false}}},'*')};
      addEventListener('message',async e=>{const m=e.data;if(!m.channel)return;
      const answer=(type,payload)=>e.source.postMessage({channel:m.channel,v:m.v,type,id:m.id,ok:true,payload},'*');
      if(m.type==='hello'){const coarse=matchMedia('(pointer:coarse)').matches;answer('ready',{directory:'/project',session:{id:'ses_root',title:'Export fixture',busy:false},surface:'panel',locale:'en',device:{formFactor:coarse?'phone':'desktop',pointer:coarse?'coarse':'fine',insets:{top:0,right:0,bottom:0,left:0},keyboard:0},connection:{connected:false,account:''},settings:{},item:null,theme:{mode:'light',tokens:${JSON.stringify(tokens)}}});return;}
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
    } else if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); }
    else { res.writeHead(404); res.end(); }
  });
  await new Promise<void>(resolve => host.listen(0, '127.0.0.1', resolve));
  // Reuse an explicitly selected installed Chromium without downloading a browser or changing the normal Chrome default.
  const browser = await chromium.launch({ ...(process.env.SESSION_EXPORT_BROWSER ? { executablePath: process.env.SESSION_EXPORT_BROWSER } : { channel: 'chrome' }), headless: true }).catch(async error => {
    await new Promise<void>(resolve => host.close(() => resolve()));
    await new Promise<void>(resolve => service.close(() => resolve()));
    throw error;
  });
  try {
    await t.test('export mode stays synchronized across browser, touch and Electron-user-agent contexts', async () => {
      const contexts = [
        { name: 'browser', options: { viewport: { width: 480, height: 920 } } },
        { name: 'phone', options: { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36' } },
        { name: 'electron-ua', options: { viewport: { width: 480, height: 920 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenChamber/2.7.1 Chrome/130.0 Electron/40.0.0' } },
      ];
      for (const context of contexts) {
        const page = await browser.newPage(context.options), errors: string[] = [];
        page.setDefaultTimeout(5000); page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()); });
        try {
          const url = `http://127.0.0.1:${(host.address() as any).port}/`;
          await page.goto(url);
          assert.equal(page.url(), url); assert.equal(await page.title(), 'Session Export SDK QA');
          await page.frameLocator('iframe').getByRole('heading', { name: 'Session Export', exact: true }).waitFor();
          await assertExportMode(page, join(root, `panel-resume-${context.name}.png`));
          assert.deepEqual(errors, []);
        } finally { await page.close(); }
      }
      console.log(`Selector UI browser: ${browser.version()}; evidence: ${root}`);
    });
    await t.test('archive export flow reviews files and preserves the clicked target across focus changes', async () => {
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
    assert.equal(chooserCalls, 0, 'A browser must not open a dialog on the server');
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
    assert.equal(await frame.getByRole('button', { name: 'Export mode', exact: true }).isDisabled(), true);
    await page.evaluate(() => (window as any).changeSession());
    await frame.getByText('Another session', { exact: true }).waitFor();
    assert.equal(await frame.getByRole('checkbox', { name: 'Include referenced local files', exact: true }).isChecked(), false);
    release(); blocked = false;
    await frame.getByRole('button', { name: 'Export session', exact: true }).waitFor({ state: 'visible' });
    await frame.locator('#profile-control button:enabled').waitFor();
    assert.equal(await frame.getByRole('button', { name: 'Export mode', exact: true }).isDisabled(), false);
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
    // Exercise actual touch layout and the full existing options flow, not only a narrow desktop screenshot.
    const phone = await browser.newPage({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36' });
    const phoneErrors: string[] = [];
    phone.setDefaultTimeout(5000); phone.on('pageerror', error => phoneErrors.push(error.message));
    await phone.goto(`http://127.0.0.1:${(host.address() as any).port}/`);
    const mobile = phone.frameLocator('iframe'), chooserBeforePhone = chooserCalls;
    await mobile.getByLabel('Output directory', { exact: true }).fill(root);
    assert.ok((await mobile.getByRole('button', { name: 'Export session', exact: true }).boundingBox())!.height >= 44, 'Touch action needs a 44px hit target');
    await mobile.getByRole('button', { name: 'Export session', exact: true }).tap();
    await mobile.getByRole('status').filter({ hasText: 'Archive saved' }).waitFor();
    assert.equal(await mobile.getByLabel('Output directory', { exact: true }).inputValue(), root, 'Keep the visible destination synchronized when controls refresh');
    coverageWarning = 'Durable log unavailable for ses_' + 'A'.repeat(200);
    await mobile.getByRole('checkbox', { name: 'Include referenced local files', exact: true }).tap();
    await mobile.getByRole('button', { name: 'Review files', exact: true }).tap();
    const includeImage = mobile.getByRole('checkbox', { name: /^Include generated-image\.png/ });
    await includeImage.waitFor(); assert.equal(await includeImage.isChecked(), false);
    await includeImage.tap();
    await phone.screenshot({ path: join(root, 'panel-phone-review.png') });
    await mobile.getByRole('button', { name: 'Create archive', exact: true }).tap();
    await mobile.getByRole('status').filter({ hasText: 'Archive saved' }).waitFor().catch(async error => {
      await phone.screenshot({ path: join(root, 'panel-phone-failure.png'), fullPage: true });
      throw new Error(`${error.message}; mobile state: ${await mobile.locator('body').ariaSnapshot()}; recent routes: ${seen.slice(-12).join(', ')}; evidence: ${root}`);
    });
    assert.equal(await mobile.locator('#warnings').innerText(), coverageWarning);
    assert.equal(await mobile.locator('body').evaluate(body => window.innerWidth === 360 && body.scrollWidth <= window.innerWidth), true, 'Long coverage warnings must not widen the phone panel');
    await mobile.getByRole('button', { name: 'Copy path', exact: true }).tap();
    assert.ok((await phone.evaluate(() => (window as any).copied)).endsWith('.zip'));
    coverageWarning = '';
    await phone.evaluate(() => (window as any).changeSession('LongTitleWithoutBreaks'.repeat(25)));
    await mobile.locator('#session-title').filter({ hasText: 'LongTitleWithoutBreaks' }).waitFor();
    assert.equal(await mobile.locator('body').evaluate(body => window.innerWidth === 360 && body.scrollWidth <= window.innerWidth), true, 'A long session title must not widen the phone panel');
    assert.equal(chooserCalls, chooserBeforePhone, 'Mobile must not open a chooser on its host');
    assert.equal(await mobile.getByRole('checkbox', { name: 'Include referenced local files', exact: true }).isChecked(), false);
    await mobile.locator('body').evaluate(() => { scrollTo(0, 0); return new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))); });
    await phone.evaluate(() => scrollTo(0, 0));
    await phone.screenshot({ path: join(root, 'panel-phone-long-title.png') });
    await phone.close();
    const phoneWithDesktopUA = await browser.newPage({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenChamber/2.7.1 Chrome/130.0 Electron/40.0.0' });
    await phoneWithDesktopUA.goto(`http://127.0.0.1:${(host.address() as any).port}/`);
    await phoneWithDesktopUA.frameLocator('iframe').getByLabel('Output directory', { exact: true }).waitFor({ state: 'visible', timeout: 5000 });
    await phoneWithDesktopUA.close();
    assert.deepEqual(phoneErrors, []);
    assert.deepEqual(errors, []);
    // Exercise the local-desktop routing heuristic with a controlled Electron UA, not a claim that Chrome is Electron.
    const desktop = await browser.newPage({ viewport: { width: 480, height: 920 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OpenChamber/2.6.1 Chrome/130.0 Electron/40.0.0' });
    desktop.setDefaultTimeout(5000);
    await desktop.goto(`http://127.0.0.1:${(host.address() as any).port}/`);
    const native = desktop.frameLocator('iframe');
    await native.getByRole('button', { name: 'Export session', exact: true }).waitFor();
    const exportsBefore = seen.filter(path => path === '/export').length;
    await native.getByRole('button', { name: 'Export session', exact: true }).click();
    await native.getByRole('status').filter({ hasText: 'cancelled' }).waitFor();
    assert.equal(chooserCalls, 1); assert.equal(seen.filter(path => path === '/export').length, exportsBefore);
    chooserResult = { state: 'selected', path: join(root, 'desktop-chosen.zip') };
    chooserGate = new Promise(resolve => chooserRelease = resolve);
    await native.getByRole('button', { name: 'Export session', exact: true }).click();
    await native.getByRole('status').filter({ hasText: 'Windows Save As' }).waitFor();
    assert.equal(await native.getByRole('button', { name: 'Export session', exact: true }).isDisabled(), true);
    // A job is permitted to span more than fifteen minutes; request-level timeouts are unchanged.
    await native.locator('body').evaluate(() => { const now = Date.now; Date.now = () => now() + 16 * 60 * 1000; });
    chooserRelease();
    await native.getByRole('status').filter({ hasText: 'Archive saved' }).waitFor();
    assert.equal(await native.locator('#result-path').innerText(), join(root, 'desktop-chosen.zip'));
    chooserGate = Promise.resolve(); chooserResult = { state: 'unavailable', error: 'No interactive desktop.' };
    const afterSelection = seen.filter(path => path === '/export').length;
    await native.getByRole('button', { name: 'Export session', exact: true }).click();
    await native.getByRole('alert').filter({ hasText: 'manual' }).waitFor();
    assert.equal(seen.filter(path => path === '/export').length, afterSelection, 'Unavailable picker must not silently export');
    await native.getByLabel('Output directory', { exact: true }).fill(root);
    await native.getByRole('button', { name: 'Export session', exact: true }).click();
    await native.getByRole('status').filter({ hasText: 'Archive saved' }).waitFor();
    assert.notEqual(await native.locator('#result-path').innerText(), join(root, 'desktop-chosen.zip'), 'A new export must not expose the preceding success as its own result');
    assert.equal(await native.getByRole('button', { name: 'Export session', exact: true }).isDisabled(), false);
    await desktop.screenshot({ path: join(root, 'panel-native-fallback.png'), fullPage: true });
    await desktop.reload();
    chooserResult = { state: 'selected', path: join(root, 'must-not-be-created.zip') };
    chooserGate = new Promise(resolve => chooserRelease = resolve);
    await native.getByRole('button', { name: 'Export session', exact: true }).click();
    await native.getByRole('status').filter({ hasText: 'Windows Save As' }).waitFor();
    const beforeFocus = seen.filter(path => path === '/export').length;
    await desktop.evaluate(() => (window as any).changeSession());
    chooserRelease();
    await native.getByRole('status').filter({ hasText: 'cancelled' }).waitFor();
    assert.equal(seen.filter(path => path === '/export').length, beforeFocus);
    assert.equal(existsSync(join(root, 'must-not-be-created.zip')), false);
    await desktop.close();
    console.log(`UI browser: ${browser.version()}; panel screenshots: ${root}`);
    });
  } finally {
    release?.(); chooserRelease?.(); await browser.close();
    await new Promise<void>(resolve => host.close(() => resolve()));
    await new Promise<void>(resolve => service.close(() => resolve()));
  }
});
