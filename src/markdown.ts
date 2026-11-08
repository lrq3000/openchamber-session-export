import { join } from 'node:path';
import { CaptureStore } from './capture-store.js';
import { JsonDocument, type JsonPath } from './json-stream.js';
import type { CaptureSnapshot, SessionRecord } from './types.js';

const label = (value: unknown) => String(value ?? '').replace(/[\r\n`<>]/g, ' ');

/** Readable rendering uses disk-backed values and bounded chunks, including the two passes needed for safe fences. */
export class MarkdownRenderer {
  async *render(capture: CaptureSnapshot): AsyncGenerator<string> {
    const store = new CaptureStore(capture.root);
    yield `# ${label(capture.target.title ?? capture.target.sessionID)}\n\n`;
    yield `Captured ${capture.startedAt}–${capture.endedAt}. OpenCode ${label(capture.serverVersion)}.\n\n`;
    yield '> Private archive: messages and tool output may contain secrets. Reasoning means only content exposed and retained by the host.\n\n';
    for await (const warning of store.records<{ text: string }>('warnings')) yield `> Warning: ${label(warning.text)}\n\n`;
    for await (const session of store.sessions(capture)) {
      yield `## ${session.id === capture.target.sessionID ? 'Session' : 'Sub-session'}: ${label(session.title)}\n\nID: ${label(session.id)}\n\n`;
      if (session.active || session.changed) yield '> Non-atomic snapshot: this session was active or changed during capture.\n\n';
      for await (const message of store.messages(session)) yield* this.message(new JsonDocument(message.path), message.id, capture.root);
    }
  }

  private async *message(document: JsonDocument, id: string, root: string): AsyncGenerator<string> {
    const type = String(await document.scalar(['type']) ?? 'unknown');
    yield `### ${label(type)} · ${label(id)}\n\n`;
    if (type === 'assistant') {
      if (!await document.scalar(['time', 'completed'])) yield '**Unfinished — retained as exposed by the message API.**\n\n';
      if (await document.kind(['content']) === 'array') for await (const content of document.array(['content'], join(root, 'markdown-parts'))) {
        const kind = await content.scalar(['type']);
        if (kind === 'text') { yield* content.text(['text']); yield '\n\n'; }
        else if (kind === 'reasoning') { yield '#### Reasoning\n\n'; yield* this.fence(() => content.text(['text']), 'text'); }
        else if (kind === 'tool') {
          yield `#### Tool: ${label(await content.scalar(['name']))} · ${label(await content.scalar(['id']))}\n\n`;
          yield `Status: ${label(await content.scalar(['state', 'status']) ?? 'unknown')}\n\n**Arguments**\n\n`;
          if (await content.kind(['state', 'input'])) yield* this.fence(() => content.json(['state', 'input'])); else yield '```json\nnull\n```\n\n';
          if (await content.kind(['state', 'content']) === 'array') for await (const output of content.array(['state', 'content'], join(root, 'markdown-outputs'))) {
            if (await output.scalar(['type']) === 'text') yield* this.fence(() => output.text(['text']), 'text');
            else yield* this.fence(() => output.json());
          }
          yield* this.optional(content, ['state', 'error'], '**Error**');
          yield* this.optional(content, ['state', 'metadata'], '**Tool metadata**');
        } else { yield '#### Unrecognized content\n\n'; yield* this.fence(() => content.json()); }
      }
      yield* this.optional(document, ['error'], '**Message error**');
    } else if (['user', 'system', 'synthetic', 'skill'].includes(type)) {
      const name = await document.scalar(['name']); if (name) yield `Name: ${label(name)}\n\n`;
      if (await document.kind(['text']) === 'string') yield* document.text(['text']);
      yield '\n\n';
      if (await document.kind(['files']) === 'array') { yield '**Attachment records**\n\n'; yield* this.fence(() => document.json(['files'])); }
    } else yield* this.fence(() => document.json());
  }

  private async *optional(document: JsonDocument, path: JsonPath, heading: string): AsyncGenerator<string> {
    const kind = await document.kind(path);
    if (!kind || kind === 'null') return;
    yield `${heading}\n\n`; yield* this.fence(() => document.json(path));
  }

  private async *fence(source: () => AsyncIterable<string>, language = 'json'): AsyncGenerator<string> {
    let width = 3, carried = 0;
    for await (const text of source()) {
      if (!text) continue;
      for (const match of text.matchAll(/`+/g)) {
        const run = match.index === 0 ? carried + match[0].length : match[0].length;
        width = Math.max(width, run + 1);
        carried = match.index! + match[0].length === text.length ? run : 0;
      }
      if (!text.endsWith('`')) carried = 0;
    }
    yield* this.marker(width); yield `${language}\n`;
    yield* source(); yield '\n'; yield* this.marker(width); yield '\n\n';
  }

  private async *marker(width: number): AsyncGenerator<string> {
    const block = '`'.repeat(Math.min(width, 64 * 1024));
    for (let remaining = width; remaining > 0; remaining -= block.length) yield remaining >= block.length ? block : block.slice(0, remaining);
  }
}
