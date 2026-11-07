import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { temporary } from '../fixtures.js';

/** Opt-in native UI inspection never clicks Export or sends a prompt. Its browser profile is isolated from the user's tabs. */
test('the installed extension renders through the native OpenChamber sandbox', { skip: !process.env.SESSION_EXPORT_NATIVE_URL, timeout: 45000 }, async () => {
  const url = new URL(process.env.SESSION_EXPORT_NATIVE_URL!);
  assert.equal(url.hostname, '127.0.0.1');
  const root = await temporary('native-ui');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors: string[] = [];
  const failedResponses: { path: string; status: number }[] = [];
  const redact = (value: string) => value.replace(/guest-files\/[^/]+\//g, 'guest-files/[redacted]/');
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.on('pageerror', error => errors.push(redact(error.message)));
    page.on('console', message => { if (message.type() === 'error') errors.push(redact(message.text())); });
    page.on('response', response => { if (response.status() >= 400) failedResponses.push({ path: redact(new URL(response.url()).pathname), status: response.status() }); });
    await page.goto(url.toString());
    await page.getByRole('button', { name: 'Session Export', exact: true }).click();
    const frame = page.frameLocator('iframe[title="Session Export"]');
    try { await frame.getByRole('heading', { name: 'Session Export', exact: true }).waitFor({ timeout: 15000 }); }
    catch { throw new Error(`Native panel did not render. Browser evidence: ${errors.slice(0, 10).join(' | ')}`); }
    assert.equal(await frame.getByRole('checkbox', { name: 'Include referenced local files', exact: true }).isChecked(), false);
    assert.ok(await frame.getByRole('button', { name: 'Export session', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Open session actions', exact: true }).click();
    await page.getByRole('menu').getByRole('menuitem', { name: /Export complete session/ }).click();
    await frame.getByRole('heading', { name: 'Session Export', exact: true }).waitFor();
    await page.screenshot({ path: join(root, 'native-panel.png'), fullPage: true });
    console.log(`Native panel screenshot: ${join(root, 'native-panel.png')}`);
    if (failedResponses.length) console.log(`Native host response diagnostics: ${JSON.stringify(failedResponses)}`);
    // The host's source-control binding can be unconfigured for a project; do not misattribute that unrelated 422 to this extension.
    const unrelatedBindingFailure = failedResponses.some(item => item.path === '/api/source-control/binding' && item.status === 422);
    assert.deepEqual(failedResponses.filter(item => item.path !== '/api/source-control/binding' || item.status !== 422), []);
    assert.deepEqual(errors.filter(message => !(unrelatedBindingFailure && message === 'Failed to load resource: the server responded with a status of 422 (Unprocessable Entity)')), []);
  } finally { await browser.close(); }
});
