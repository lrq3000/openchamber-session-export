import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, mkdir, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { MarkdownRenderer } from '../src/markdown.js';
import { AttachmentInventory } from '../src/attachments.js';
import { capture, collectText, diskCapture, temporary } from './fixtures.js';
import { CaptureStore } from '../src/capture-store.js';
import type { AssetCandidate } from '../src/types.js';

async function render(input = capture()) { return collectText(new MarkdownRenderer().render(await diskCapture(input))); }
async function assets(input = capture()) {
  const snapshot = await diskCapture(input), store = new CaptureStore(snapshot.root), result: AssetCandidate[] = [];
  for await (const asset of new AttachmentInventory().discover(snapshot)) {
    if (asset.sessionIndex) for await (const origin of store.records<{ sessionID: string }>(asset.sessionIndex)) asset.sessions.push(origin.sessionID);
    result.push(asset);
  }
  return result;
}

test('renders recorded reasoning, tool arguments/results and unfinished state in their original order', async () => {
  const text = await render();
  assert.ok(text.indexOf('Check the saved evidence') < text.indexOf('tool_read'));
  assert.ok(text.indexOf('tool_read') < text.indexOf('The result is available'));
  assert.match(text, /"path"\s*:\s*"a\.ts"/);
  assert.ok(text.includes('````text\n```\n<script>untrusted</script>\n```\n````'));
  assert.ok(text.includes('Unfinished'));
  assert.ok(text.includes('café 🧪'));
  assert.ok(text.includes('Keep unknown fields'));
});

test('keeps descendants as distinct sections without inventing parent/child interleaving', async () => {
  const data = capture();
  data.sessions.push({ ...data.sessions[0], info: { id: 'ses_child', parentID: 'ses_root', title: 'Child evidence' }, messages: [{ id: 'child_u', type: 'skill', name: 'Inspection', text: 'Child-only evidence' }] });
  const text = await render(data);
  assert.ok(text.includes('Child evidence'));
  assert.ok(text.includes('Child-only evidence'));
  assert.ok(text.indexOf('Child evidence') > text.indexOf('Keep unknown fields'));
});

test('fences large tool text without exceeding the JavaScript argument limit', async () => {
  const input = capture();
  const evidence = '`x'.repeat(200000);
  input.sessions[0].messages[1].content[1].state.content[0].text = evidence;
  const result = await render(input);
  assert.ok(result.includes(evidence));
});

test('fences a backtick run spanning streamed chunks without corrupting Unicode', async () => {
  const input = capture(), evidence = `café 🧪 ${'`'.repeat(70000)}\nend 🧪`;
  input.sessions[0].messages[1].content[1].state.content[0].text = evidence;
  const result = await render(input), marker = '`'.repeat(70001);
  assert.ok(result.includes(`${marker}text\n${evidence}\n${marker}`));
});

test('discovers explicit local attachments but never treats source-code paths or remote URLs as copy instructions', async () => {
  const root = await temporary('inventory');
  const image = join(root, 'image.png'); await writeFile(image, 'image bytes');
  const input = capture();
  input.sessions[0].messages.push({ id: 'attached', type: 'user', text: `Source file: ${join(root, 'secret.ts')}\n![Remote](https://example.invalid/pixel.png)`, files: [{ name: 'image.png', source: { type: 'file', path: image } }] });
  const inventory = await assets(input);
  assert.equal(inventory.length, 1);
  assert.equal(inventory[0].path, image);
  assert.equal(inventory[0].size, 11);
  assert.equal(inventory[0].status, 'available');
});

test('reports missing files and rejects directories and symbolic links', async () => {
  const root = await temporary('asset-types');
  const directory = join(root, 'directory'); await mkdir(directory);
  const target = join(root, 'target.txt'); await writeFile(target, 'private');
  const link = join(root, 'linked'); await symlink(directory, link, 'junction');
  const input = capture();
  input.sessions[0].messages.push({ id: 'files', type: 'user', text: '', files: [join(root, 'missing'), directory, link].map(path => ({ source: { type: 'file', path } })) });
  const inventory = await assets(input);
  assert.equal(inventory.find(file => file.path.endsWith('missing'))?.status, 'missing');
  assert.equal(inventory.find(file => file.path === directory)?.status, 'refused');
  assert.equal(inventory.find(file => file.path === link)?.status, 'refused');
});
