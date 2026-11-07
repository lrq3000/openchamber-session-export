import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import type { Capture } from '../src/types.js';

export const tempRoot = process.env.SESSION_EXPORT_TEST_TMP ?? 'C:/Users/33632/AppData/Local/Temp/opencode';
export const temporary = (name: string) => mkdtemp(join(tempRoot, `session-export-${name}-`));

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
