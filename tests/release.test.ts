import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('standalone source release retains private development packaging and synchronized attribution records', () => {
  const root = JSON.parse(readFileSync('package.json', 'utf8'));
  const ui = JSON.parse(readFileSync('openchamber/package.json', 'utf8'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  assert.equal(root.version, '0.2.1');
  assert.equal(root.private, true, 'this extraction does not authorize npm publication');
  assert.deepEqual(root.repository, { type: 'git', url: 'git+https://github.com/lrq3000/openchamber-session-export.git' });
  assert.equal(root.homepage, 'https://github.com/lrq3000/openchamber-session-export#readme');
  assert.equal(root.bugs.url, 'https://github.com/lrq3000/openchamber-session-export/issues');
  for (const version of [ui.version, root.metadata.version, ui.metadata.version, lock.version, lock.packages[''].version]) assert.equal(version, root.version);
  for (const metadata of [root.metadata, ui.metadata]) {
    assert.equal(metadata.creation, '2026-11-07');
    assert.equal(metadata.last_updated, '2026-11-12');
  }
  assert.equal(readFileSync('AUTHOR.txt', 'utf8').trim(), 'Stephen Karl Larroque <LRQ3000@gmail.com>');
  assert.match(readFileSync('LICENSE.txt', 'utf8'), /Apache License/);
});
