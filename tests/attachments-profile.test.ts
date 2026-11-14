import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AttachmentInventory } from '../src/attachments.js';
import { CaptureStore } from '../src/capture-store.js';
import { capture, diskCapture, temporary } from './fixtures.js';
import type { AssetCandidate, SessionRecord } from '../src/types.js';

test('file recommendations use actual pinned and effective-context references, without selecting files automatically', async () => {
  const root = await temporary('recommended-files'), pinned = join(root, 'pinned.txt'), recent = join(root, 'recent.txt');
  await writeFile(pinned, 'Pinned evidence'); await writeFile(recent, 'Recent evidence');
  const input = capture();
  input.sessions[0].info.metadata = { openchamber: { context_obligatory_messages: [{ id: 'msg_user', createdAt: 1, role: 'user', sessionID: 'ses_root' }] } };
  input.sessions[0].messages[0].files = [{ source: { path: pinned } }];
  input.sessions[0].messages.push({ id: 'msg_recent_file', type: 'user', text: 'Recent reference', files: [{ source: { path: recent } }] });
  const snapshot = await diskCapture(input), store = new CaptureStore(snapshot.root), records = (await store.page<SessionRecord>('sessions')).records;
  records[0].contextPath = join(snapshot.root, 'effective.json');
  await writeFile(records[0].contextPath, JSON.stringify(input.sessions[0].messages.slice(-1)));
  await writeFile(store.file('sessions'), records.map(record => JSON.stringify(record)).join('\n') + '\n');
  const files: AssetCandidate[] = [];
  for await (const file of new AttachmentInventory().discover(snapshot)) files.push(file);
  assert.deepEqual(files.find(file => file.path === pinned)!.recommendations, ['pinned']);
  assert.deepEqual(files.find(file => file.path === recent)!.recommendations, ['recent']);
  assert.ok(files.every(file => !('selected' in file)));
});
