import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { requestedGuestCapabilities } from '@openchamber/sdk';
import { parseManifest } from '@openchamber/sdk/schemas';

test('standalone source release retains private development packaging and synchronized attribution records', () => {
  const root = JSON.parse(readFileSync('package.json', 'utf8'));
  const ui = JSON.parse(readFileSync('openchamber/package.json', 'utf8'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  assert.equal(root.version, '0.3.0');
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

test('the published SDK accepts the native read role and requests exactly its two capabilities', () => {
  const parsed = parseManifest(JSON.parse(readFileSync('openchamber/package.json', 'utf8')));
  assert.ok(parsed.ok, JSON.stringify(parsed));
  assert.equal(parsed.manifest.engines?.openchamber, '>=2.7.1');
  assert.deepEqual(parsed.manifest.contributes.service?.provides, ['opencode']);
  assert.deepEqual(requestedGuestCapabilities(parsed.manifest.contributes).sort(), ['opencode', 'service']);
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
