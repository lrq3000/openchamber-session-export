import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import type { RecordData } from './types.js';

export { IMPORT_NOTICE } from './constants.js';
export const MAX_IMPORT_JSON_BYTES = 64 * 1024 * 1024;
export interface PortableSession { info: RecordData; messages: RecordData[]; instructions?: RecordData[] }
export interface PreparedSession extends PortableSession { sourceID: string }
const messageTypes = new Set(['user', 'assistant', 'synthetic', 'system', 'skill', 'shell', 'compaction', 'idle', 'agent-switched', 'model-switched', 'location-switched']);
const fresh = (prefix: string) => prefix + randomUUID().replaceAll('-', '');
const referenceKeys = new Set(['sessionID', 'sessionId', 'messageID', 'messageId', 'parentID', 'keepID']);
export function portableFileKey(path: string): string {
  const value = path.replaceAll('\\', '/').replace(/^\/([a-zA-Z]:\/)/, '$1');
  return /^[a-zA-Z]:\//.test(value) ? value.toLowerCase() : value;
}

/** This is a copy adapter, not an update API. Never mutate an archive's original records. */
export function prepareSessionCopies(sources: PortableSession[], directory: string, assets: Map<string, string> = new Map()): { sessions: PreparedSession[]; warnings: string[] } {
  const ids = new Map<string, string>(), warnings: string[] = [];
  const assetPaths = new Map([...assets].map(([path, destination]) => [portableFileKey(path), destination]));
  const register = (id: unknown, prefix: string) => {
    if (typeof id !== 'string' || !id.startsWith(prefix) || ids.has(id)) throw new Error('Missing or duplicate session/message identity in the archive.');
    ids.set(id, fresh(prefix));
  };
  for (const source of sources) {
    register(source.info?.id, 'ses_');
    if (!Array.isArray(source.messages)) throw new Error('A session transcript is not an array.');
    for (const message of source.messages) register(message.id, 'msg_');
    for (const message of source.messages) {
      if (message.type === 'shell' && typeof message.shellID === 'string' && !ids.has(message.shellID)) register(message.shellID, 'sh_');
      for (const part of message.type === 'assistant' ? message.content ?? [] : []) if (part.type === 'tool' && typeof part.id === 'string' && !ids.has(part.id)) ids.set(part.id, fresh('tool_'));
    }
    const instructionKeys = new Set<string>();
    for (const entry of source.instructions ?? []) {
      if (!entry || typeof entry.key !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(entry.key) || entry.value === undefined) throw new Error('An archived instruction key/value is not supported by the native API.');
      if (instructionKeys.has(entry.key)) throw new Error('Duplicate archived instruction keys would overwrite one another.');
      instructionKeys.add(entry.key);
      if (Buffer.byteLength(JSON.stringify(entry.value)) > 256 * 1024) throw new Error('An instruction (including a pinned message) exceeds the native 256 KiB entry limit. Keep a complete archive for consultation.');
    }
  }
  const rewriteReferences = (value: unknown, pins = false): any => {
    if (typeof value === 'string') return pins ? ids.get(value) ?? value : value;
    if (Array.isArray(value)) return value.map(item => rewriteReferences(item, pins));
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      pins ? ids.get(key) ?? key : key, pins || referenceKeys.has(key) ? rewriteReferences(item, true) : rewriteReferences(item),
    ]));
  };
  const rewriteFile = (file: RecordData) => {
    const path = file?.source?.path;
    if (typeof path === 'string' && assetPaths.has(portableFileKey(path))) file.source.path = assetPaths.get(portableFileKey(path));
    for (const target of [file, file?.source]) if (typeof target?.uri === 'string') {
      const direct = assetPaths.get(portableFileKey(target.uri));
      if (direct) { target.uri = pathToFileURL(direct).href; continue; }
      if (!target.uri.startsWith('file:')) continue;
      // Match Windows source paths on a Linux destination (and vice versa), but
      // only inside explicit file-reference fields, never arbitrary prose.
      try {
        const url = new URL(target.uri);
        if (url.host && url.host !== 'localhost') continue;
        const original = portableFileKey(decodeURIComponent(url.pathname));
        const mapped = assetPaths.get(original);
        if (mapped) target.uri = pathToFileURL(mapped).href;
      } catch { /* Keep embedded data's provenance when a source URI is unfamiliar. */ }
    }
  };
  const sessions = sources.map(source => {
    const copied = structuredClone(source), info = copied.info;
    info.id = ids.get(source.info.id)!;
    if (source.info.parentID) {
      if (!ids.has(source.info.parentID)) warnings.push('An external parent was detached; only archived sessions can be restored.');
      info.parentID = ids.get(source.info.parentID);
    }
    // Source permission approvals, revert/fork cursors and execution state must not
    // authorize actions or point into another session on the destination.
    for (const key of ['permissions', 'revert', 'fork', 'subpath']) delete info[key];
    info.location = { directory };
    info.title = `${source.info.title ?? 'Session'} (imported)`;
    if (info.time) { delete info.time.busy; delete info.time.archived; }
    info.metadata = rewriteReferences(info.metadata ?? {});
    const pins = info.metadata?.openchamber?.context_obligatory_messages;
    if (pins) info.metadata.openchamber.context_obligatory_messages = rewriteReferences(pins, true);
    info.metadata.session_export = { sourceSessionID: source.info.id, importedAt: new Date().toISOString() };
    let unfinished = 0;
    for (const message of copied.messages) {
      if (!messageTypes.has(message.type)) throw new Error(`Unsupported message type: ${String(message.type).slice(0, 80)}. The original ZIP has not been changed.`);
      message.id = ids.get(message.id)!;
      message.metadata = rewriteReferences(message.metadata);
      if (Array.isArray(message.files)) for (const file of message.files) rewriteFile(file);
      if (message.type === 'location-switched') message.location = { directory };
      if (message.type === 'shell') {
        message.shellID = ids.get(message.shellID) ?? fresh('sh_');
        if (message.status === 'running') {
          message.metadata = { ...message.metadata, session_export: { originallyRunning: true, originalTime: message.time } };
          message.status = 'killed'; message.time = { ...message.time, completed: Date.now() };
          warnings.push('A running shell record will be preserved as an interrupted copy. No process is resumed.');
        }
      }
      if (message.type === 'compaction' && message.status === 'running') {
        warnings.push('A running compaction will be preserved as a failed/interrupted copy; its partial summary remains in metadata and the original archive.');
        message.metadata = { ...message.metadata, session_export: { originallyRunning: true, partialSummary: message.summary } };
        message.status = 'failed'; message.error = { type: 'unknown', message: 'Compaction interrupted in the source session.' };
        delete message.summary;
      }
      if (message.type === 'assistant') {
        for (const part of message.content ?? []) {
          if (!['text', 'reasoning', 'tool'].includes(part.type)) throw new Error('An unfamiliar assistant content type cannot be restored by the official importer.');
          if (part.type !== 'tool') continue;
          part.id = ids.get(part.id) ?? fresh('tool_');
          for (const item of part.state?.content ?? []) if (item?.type === 'file') rewriteFile(item);
          if (['running', 'streaming'].includes(part.state?.status)) {
            message.metadata = { ...message.metadata, session_export: { ...message.metadata?.session_export, interruptedTools: [...(message.metadata?.session_export?.interruptedTools ?? []), { id: part.id, state: part.state, time: part.time }] } };
            part.state = { ...part.state, status: 'error', input: typeof part.state.input === 'object' ? part.state.input : {}, error: { type: 'aborted', message: 'This tool was interrupted in the source session; it was not executed during import.' } };
            part.time = { ...part.time, completed: Date.now() };
          }
        }
        if (message.time?.completed === undefined) {
          // The native importer truncates at the first unfinished assistant. Seal
          // the COPY as interrupted so later messages are not silently discarded.
          unfinished++;
          message.metadata = { ...message.metadata, session_export: { ...message.metadata?.session_export, originallyUnfinished: true, originalTime: message.time } };
          message.time = { ...message.time, completed: Date.now() };
          // OpenCode retains aborted assistant text in model-facing conversion;
          // an unknown/provider error would discard text after the last tool.
          message.error = { type: 'aborted', message: 'Interrupted in the source session; sealed for import without resuming execution.' };
          delete message.retry;
        }
      }
    }
    if (unfinished) warnings.push(`${unfinished} unfinished assistant message(s) will be sealed as interrupted copies. Original records remain in the ZIP.`);
    return { ...copied, sourceID: source.info.id };
  });
  // Topological order is mandatory: OpenCode refuses a child whose new parent does not yet exist.
  const ordered: PreparedSession[] = [], pending = [...sessions], imported = new Set<string>();
  while (pending.length) {
    const index = pending.findIndex(session => !session.info.parentID || imported.has(session.info.parentID));
    if (index < 0) throw new Error('The archived session tree contains a cycle.');
    const [session] = pending.splice(index, 1); ordered.push(session); imported.add(session.info.id);
  }
  return { sessions: ordered, warnings };
}
