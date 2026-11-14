import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { copyFile, mkdir } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { Script } from 'node:vm';
import { pathToFileURL } from 'node:url';
import { requestedGuestCapabilities } from '@openchamber/sdk';
import { parseManifest } from '@openchamber/sdk/schemas';
import { temporary } from './fixtures.js';

test('standalone source release retains private development packaging and synchronized attribution records', () => {
  const root = JSON.parse(readFileSync('package.json', 'utf8'));
  const ui = JSON.parse(readFileSync('openchamber/package.json', 'utf8'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  assert.equal(root.private, true, 'this extraction does not authorize npm publication');
  assert.deepEqual(root.repository, { type: 'git', url: 'git+https://github.com/lrq3000/openchamber-session-export.git' });
  assert.equal(root.homepage, 'https://github.com/lrq3000/openchamber-session-export#readme');
  assert.equal(root.bugs.url, 'https://github.com/lrq3000/openchamber-session-export/issues');
  for (const version of [ui.version, root.metadata.version, ui.metadata.version, lock.version, lock.packages[''].version]) assert.equal(version, root.version);
  for (const metadata of [root.metadata, ui.metadata]) {
    assert.equal(metadata.creation, '2026-11-07');
    assert.equal(metadata.last_updated, '2026-11-14');
  }
  assert.equal(readFileSync('AUTHOR.txt', 'utf8').trim(), 'Stephen Karl Larroque <LRQ3000@gmail.com>');
  assert.match(readFileSync('LICENSE.txt', 'utf8'), /Apache License/);
});

test('the published SDK accepts the native read role, bundled plugin and explicit navigation capability', () => {
  const parsed = parseManifest(JSON.parse(readFileSync('openchamber/package.json', 'utf8')));
  assert.ok(parsed.ok, JSON.stringify(parsed));
  assert.equal(parsed.manifest.engines?.openchamber, '>=2.7.1');
  assert.deepEqual(parsed.manifest.contributes.service?.provides, ['opencode']);
  assert.deepEqual(requestedGuestCapabilities(parsed.manifest.contributes).sort(), ['opencode', 'opencodePlugin', 'service', 'sessions']);
  assert.equal(JSON.parse(readFileSync('package.json', 'utf8')).dependencies['@openchamber/sdk'], '2.7.1');
});

test('the installed manifest exposes its existing panel and session action on mobile without changing desktop routing', () => {
  const parsed = parseManifest(JSON.parse(readFileSync('openchamber/package.json', 'utf8')));
  assert.ok(parsed.ok, JSON.stringify(parsed));
  assert.equal(parsed.manifest.contributes.panel.mobile, true);
  assert.equal(parsed.manifest.contributes.panel.entry, 'panel/index.html');
  assert.equal(parsed.manifest.contributes.attach, undefined);
  assert.equal(parsed.manifest.contributes.actions?.[0].id, 'export-session');
});

test('the repository root is an API-version-1 extension with the same contributions as the standalone folder', () => {
  const root = parseManifest(JSON.parse(readFileSync('package.json', 'utf8')));
  const folder = parseManifest(JSON.parse(readFileSync('openchamber/package.json', 'utf8')));
  assert.ok(root.ok, JSON.stringify(root));
  assert.ok(folder.ok, JSON.stringify(folder));
  assert.equal(root.manifest.contributes.panel.entry, 'openchamber/panel/index.html');
  assert.equal(root.manifest.contributes.service?.entry, 'openchamber/service.cjs');
  // Package-relative paths differ, but identity, host requirements and approvals must not.
  const normalized = structuredClone(root.manifest);
  normalized.contributes.panel.entry = 'panel/index.html';
  normalized.contributes.service!.entry = 'service.cjs';
  normalized.contributes.opencodePlugin = 'plugin';
  assert.deepEqual(normalized, folder.manifest);
  assert.deepEqual(requestedGuestCapabilities(root.manifest.contributes).sort(), ['opencode', 'opencodePlugin', 'service', 'sessions']);
});

test('shipped bundles retain the full copyright and license notices of their bundled dependencies', () => {
  const dependencies = new Map([
    ['openchamber/panel/app.js', ['@openchamber/sdk']],
    ['openchamber/service.cjs', ['yazl', 'yauzl', 'pend', 'buffer-crc32', 'stream-json', 'stream-chain']],
  ]);
  for (const [bundle, packages] of dependencies) {
    const code = readFileSync(bundle, 'utf8').replace(/\r\n/g, '\n');
    for (const name of packages) {
      const license = readFileSync(`node_modules/${name}/LICENSE`, 'utf8').replace(/\r\n/g, '\n').trim();
      assert.ok(code.includes(`${name}\n${license}`), `${bundle} must retain ${name}'s complete upstream license notice`);
    }
  }
});

test('Git-tracked packages include built panel assets and a dependency-free working service', async () => {
  // Local ignored build outputs previously masked what a Git install actually receives.
  const tracked = new Set(execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean));
  for (const file of ['openchamber/panel/app.js', 'openchamber/service.cjs']) assert.ok(tracked.has(file), `${file} must ship in Git, not just exist after a local build`);
  const checkout = await temporary('git-package');
  const pluginFiles = ['openchamber/plugin/package.json', 'openchamber/plugin/index.js'];
  for (const file of pluginFiles) {
    assert.ok(existsSync(file), `${file} must be shipped with the extension`);
    // CI must not mistake a generated, uncommitted artifact for a shipped file.
    // Local implementation checkouts can contain new files before a commit is authorized.
    if (process.env.CI) assert.ok(tracked.has(file), `${file} must be committed, not merely generated by a CI build`);
  }
  for (const file of new Set(['package.json', ...[...tracked].filter(file => file.startsWith('openchamber/')), ...pluginFiles])) {
    await mkdir(dirname(join(checkout, file)), { recursive: true });
    await copyFile(file, join(checkout, file));
  }
  assert.equal(existsSync(join(checkout, 'node_modules')), false);
  for (const directory of [checkout, join(checkout, 'openchamber')]) {
    const parsed = parseManifest(JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')));
    assert.ok(parsed.ok, JSON.stringify(parsed));
    assert.ok(parsed.manifest.contributes.panel.entry, 'the package must expose its existing panel');
    const page = join(directory, parsed.manifest.contributes.panel.entry);
    const html = readFileSync(page, 'utf8');
    const scripts = [...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)];
    assert.ok(scripts.length > 0, 'the installed page must load its built panel');
    for (const [, source] of scripts) {
      const script = join(dirname(page), source!);
      assert.equal(script.endsWith('.js'), true);
      assert.doesNotThrow(() => new Script(readFileSync(script, 'utf8'), { filename: script }), 'the shipped panel must be a self-contained classic script');
    }
    await assertPackagedService(directory, parsed.manifest.contributes.service!.entry);
    const plugin = join(directory, parsed.manifest.contributes.opencodePlugin!, 'index.js');
    execFileSync(process.execPath, ['--input-type=module', '-e', 'const entry = await import(process.argv[1]); if (typeof entry.default?.setup !== "function") process.exit(1);', pathToFileURL(plugin).href], { cwd: directory });
  }
});

/** Start only the copied production bundle, with synthetic host credentials and no development loader. */
async function assertPackagedService(directory: string, entry: string): Promise<void> {
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as import('node:net').AddressInfo).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const child = spawn(process.execPath, [resolve(directory, entry)], {
    cwd: directory, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'],
    env: { ...process.env, NODE_OPTIONS: undefined, NODE_PATH: undefined, OPENCHAMBER_SERVICE_PORT: String(port), OPENCHAMBER_SERVICE_TOKEN: 'packaged-fixture-token' },
  });
  const stopped = once(child, 'exit');
  let stderr = ''; child.stderr.on('data', chunk => stderr += chunk);
  const url = `http://127.0.0.1:${port}/health`;
  try {
    let response: Response | undefined;
    for (let attempt = 0; attempt < 100 && child.exitCode === null; attempt++) {
      response = await fetch(url, { headers: { Authorization: 'Bearer packaged-fixture-token' }, signal: AbortSignal.timeout(500) }).catch(() => undefined);
      if (response) break;
      await delay(25);
    }
    assert.ok(response, `The shipped service did not start without node_modules: ${stderr}`);
    assert.equal(response.status, 200);
    assert.equal((await response.json() as { ok: boolean }).ok, true);
    assert.equal((await fetch(url)).status, 401, 'the shipped service must preserve host-token authentication');
  } finally {
    if (child.exitCode === null) child.kill();
    await stopped;
  }
}
