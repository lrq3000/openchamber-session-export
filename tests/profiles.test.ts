import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { capture, diskCapture } from './fixtures.js';
import { CaptureStore } from '../src/capture-store.js';
import { applyProfile } from '../src/profiles.js';
import type { SessionRecord } from '../src/types.js';

test('resume snapshots preserve native recent text and pins while keeping consultation history inactive', async () => {
  const input = capture();
  input.sessions[0].info.metadata = { openchamber: { context_obligatory_messages: [{ id: 'msg_user', createdAt: 1, role: 'user', sessionID: 'ses_root' }] } };
  input.sessions[0].messages.push(
    { id: 'msg_old', type: 'assistant', time: { created: 3 }, content: [{ type: 'text', text: 'Earlier visible reply.' }, { type: 'tool', state: { content: [{ type: 'text', text: 'OLD TOOL OUTPUT MUST NOT LEAK' }] } }] },
    { id: 'msg_checkpoint', type: 'compaction', status: 'completed', reason: 'manual', summary: 'Existing summary 🧪', metadata: { keepID: 'msg_old', recent: 'Engine-retained recent conversation.' }, time: { created: 4 } },
    { id: 'msg_after', type: 'user', text: 'Recent request.', time: { created: 5 } },
    { id: 'msg_interrupted', type: 'assistant', content: [{ type: 'text', text: 'Interrupted latest evidence.' }], time: { created: 6 } },
    { id: 'msg_latest', type: 'user', text: 'Continue without losing this.', time: { created: 7 } },
  );
  input.sessions.push({ ...input.sessions[0], info: { ...input.sessions[0].info, id: 'ses_child' }, messages: [] });
  const snapshot = await diskCapture(input), store = new CaptureStore(snapshot.root);
  const records = (await store.page<SessionRecord>('sessions')).records, root = records[0];
  root.contextPath = join(snapshot.root, 'effective.json'); root.instructionsPath = join(snapshot.root, 'instructions.json');
  await writeFile(root.contextPath, JSON.stringify(input.sessions[0].messages.slice(-4, -2)));
  await writeFile(root.instructionsPath, JSON.stringify([{ key: 'policy', value: 'Keep source files.' }]));
  await writeFile(store.file('sessions'), records.map(record => JSON.stringify(record)).join('\n') + '\n');
  const before = await readFile(root.messagesPath, 'utf8');
  const result = await applyProfile(snapshot, { profile: 'resume', retainHistory: true });
  assert.equal(result.sessionCount, 1);
  const resumed = (await new CaptureStore(result.root).page<SessionRecord>('sessions')).records[0];
  const messages = JSON.parse(await readFile(resumed.messagesPath, 'utf8'));
  assert.deepEqual(messages.map((message: any) => message.id), ['msg_user', 'msg_checkpoint', 'msg_after', 'msg_interrupted', 'msg_latest']);
  assert.equal(messages[1].metadata.keepID, undefined);
  assert.equal(messages[1].summary, 'Existing summary 🧪');
  assert.equal(messages[1].metadata.recent, 'Engine-retained recent conversation.');
  const entries = JSON.parse(await readFile(resumed.instructionsPath!, 'utf8'));
  assert.ok(entries.some((entry: any) => entry.value.includes('Explain café 🧪')));
  const history = await readFile(result.extras![0].path, 'utf8');
  assert.match(history, /Earlier visible reply/);
  assert.ok(!history.includes('OLD TOOL OUTPUT MUST NOT LEAK'));
  assert.equal(await readFile(root.messagesPath, 'utf8'), before);
});

test('resume snapshots fail closed without effective context rather than guessing a timestamp cut', async () => {
  await assert.rejects(applyProfile(await diskCapture(), { profile: 'resume' }), /effective context/);
});
