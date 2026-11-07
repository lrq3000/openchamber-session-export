import type { Capture, RecordData } from './types.js';

/** Tool evidence must not be able to close its own fence and impersonate the surrounding transcript. */
export function fence(value: unknown, language = 'json'): string {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? 'null';
  let width = 3;
  for (const match of text.matchAll(/`+/g)) width = Math.max(width, match[0].length + 1);
  const marker = '`'.repeat(width);
  return `${marker}${language}\n${text}\n${marker}`;
}

const label = (value: unknown) => String(value ?? '').replace(/[\r\n`<>]/g, ' ');

export class MarkdownRenderer {
  render(capture: Capture): string {
    const result = [
      `# ${label(capture.target.title ?? capture.target.sessionID)}`,
      `Captured ${capture.startedAt}–${capture.endedAt}. OpenCode ${label(capture.serverVersion)}.`,
      '> Private archive: messages and tool output may contain secrets. Reasoning means only content exposed and retained by the host.',
      ...capture.warnings.map(warning => `> Warning: ${label(warning)}`),
    ];
    for (const session of capture.sessions) {
      result.push(`## ${session.info.id === capture.target.sessionID ? 'Session' : 'Sub-session'}: ${label(session.info.title ?? session.info.id)}`, `ID: ${label(session.info.id)}`);
      if (session.active || session.changed) result.push('> Non-atomic snapshot: this session was active or changed during capture.');
      for (const message of session.messages) result.push(this.message(message));
    }
    return result.join('\n\n') + '\n';
  }

  private message(message: RecordData): string {
    const type = String(message.type ?? 'unknown');
    const result = [`### ${label(type)} · ${label(message.id)}`];
    if (type === 'assistant') {
      if (!message.time?.completed) result.push('**Unfinished — retained as exposed by the message API.**');
      for (const content of Array.isArray(message.content) ? message.content : []) {
        if (content.type === 'text') result.push(String(content.text ?? ''));
        else if (content.type === 'reasoning') result.push('#### Reasoning', fence(content.text ?? '', 'text'));
        else if (content.type === 'tool') {
          result.push(`#### Tool: ${label(content.name)} · ${label(content.id)}`, `Status: ${label(content.state?.status ?? 'unknown')}`, '**Arguments**', fence(content.state?.input));
          for (const output of content.state?.content ?? []) result.push(output.type === 'text' ? fence(output.text ?? '', 'text') : fence(output));
          if (content.state?.error) result.push('**Error**', fence(content.state.error));
          if (content.state?.metadata) result.push('**Tool metadata**', fence(content.state.metadata));
        } else result.push('#### Unrecognized content', fence(content));
      }
      if (message.error) result.push('**Message error**', fence(message.error));
    } else if (['user', 'system', 'synthetic', 'skill'].includes(type)) {
      if (message.name) result.push(`Name: ${label(message.name)}`);
      result.push(String(message.text ?? ''));
      if (message.files?.length) result.push('**Attachment records**', fence(message.files));
    } else result.push(fence(message));
    return result.join('\n\n');
  }
}
