import { mkdir, mkdtemp, readFile, realpath, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { Capture, CaptureSnapshot, SessionRecord } from '../src/types.js';
import { CaptureStore } from '../src/capture-store.js';

export const tempRoot = process.env.SESSION_EXPORT_TEST_TMP ?? join(tmpdir(), 'opencode');
export const temporary = async (name: string) => { await mkdir(tempRoot, { recursive: true }); return mkdtemp(join(await realpath(tempRoot), `session-export-${name}-`)); };

/** Literal API-shaped evidence; it deliberately includes an unfinished assistant and unfamiliar content. */
export function capture(): Capture {
  return {
    target: { sessionID: 'ses_root', directory: '/project', title: 'Export fixture' },
    startedAt: '2026-11-07T12:00:00.000Z', endedAt: '2026-11-07T12:00:01.000Z',
    serverVersion: '2.2.5', warnings: [],
    sessions: [{
      info: { id: 'ses_root', title: 'Export fixture', location: { directory: '/project' }, time: { updated: 1 } },
      messages: [
        { id: 'msg_user', type: 'user', text: 'Explain café 🧪', time: { created: 1 } },
        { id: 'msg_assistant', type: 'assistant', time: { created: 2 }, content: [
          { type: 'reasoning', text: 'Check the saved evidence first.' },
          { type: 'tool', id: 'tool_read', name: 'read', state: { status: 'completed', input: { path: 'a.ts' }, content: [{ type: 'text', text: '```\n<script>untrusted</script>\n```' }] } },
          { type: 'text', text: 'The result is available.' },
          { type: 'future-content', custom: 'Keep unknown fields' },
        ] },
      ], changed: false, active: false,
      events: [{ type: 'session.created', data: { sessionID: 'ses_root' } }, { type: 'log.synced', aggregateID: 'ses_root', seq: 5 }],
      log: { available: true, watermark: 5 },
    }],
  };
}

/** Test-only adapter for small literal fixtures; production never materializes a complete capture. */
export async function diskCapture(input: Capture = capture()): Promise<CaptureSnapshot> {
  const store = await CaptureStore.create();
  let messageCount = 0;
  for (const [index, session] of input.sessions.entries()) {
    const infoPath = join(store.root, `info-${index}.json`), messagesPath = join(store.root, `messages-${index}.json`), messageIndex = `messages-${index}`;
    await store.initialize(messageIndex);
    await writeFile(infoPath, JSON.stringify(session.info)); await writeFile(messagesPath, JSON.stringify(session.messages));
    for (const [messageNumber, message] of session.messages.entries()) {
      const path = join(store.root, `message-${index}-${messageNumber}.json`);
      await writeFile(path, JSON.stringify(message)); await store.append(messageIndex, { path, id: message.id });
    }
    const record: SessionRecord = { id: session.info.id, parentID: session.info.parentID, title: session.info.title ?? session.info.id, infoPath, messagesPath, messageIndex, messageCount: session.messages.length, active: session.active, changed: session.changed, log: session.log };
    if (session.log.available) { record.eventsPath = join(store.root, `events-${index}.jsonl`); await writeFile(record.eventsPath, session.events.map(event => JSON.stringify(event)).join('\n') + '\n'); }
    await store.append('sessions', record); messageCount += session.messages.length;
  }
  for (const text of input.warnings) await store.append('warnings', { text });
  return { root: store.root, target: input.target, startedAt: input.startedAt, endedAt: input.endedAt, serverVersion: input.serverVersion, sessionCount: input.sessions.length, messageCount, warnings: input.warnings.slice(0, 25), warningCount: input.warnings.length };
}

/** Used only for small unit/native fixtures, never by the large-session stress verifier. */
export async function materialize(snapshot: CaptureSnapshot): Promise<Capture> {
  const sessions: Capture['sessions'] = [], store = new CaptureStore(snapshot.root);
  for await (const record of store.records<SessionRecord>('sessions')) sessions.push({
    info: JSON.parse(await readFile(record.infoPath, 'utf8')),
    messages: JSON.parse(await readFile(record.messagesPath, 'utf8')),
    events: record.eventsPath ? (await readFile(record.eventsPath, 'utf8')).trim().split('\n').filter(Boolean).map(line => JSON.parse(line)) : [],
    log: record.log, changed: record.changed, active: record.active,
  });
  const warnings: string[] = []; for await (const item of store.records<{ text: string }>('warnings')) warnings.push(item.text);
  return { target: snapshot.target, startedAt: snapshot.startedAt, endedAt: snapshot.endedAt, serverVersion: snapshot.serverVersion, sessions, warnings };
}

export async function collectText(source: AsyncIterable<string | Uint8Array>): Promise<string> {
  let result = ''; for await (const chunk of source) result += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'); return result;
}
