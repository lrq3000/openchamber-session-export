import { createReadStream, createWriteStream } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { CaptureStore } from './capture-store.js';
import { JsonDocument } from './json-stream.js';
import { readJsonFile } from './private-channel.js';
import type { CaptureOptions, CaptureSnapshot, RecordData, SessionRecord } from './types.js';

async function write(path: string, content: AsyncIterable<string | Uint8Array>) {
  await pipeline(Readable.from(content), createWriteStream(path, { flags: 'wx', mode: 0o600 }));
}
export function pinnedMessageIDs(info: RecordData): Set<string> {
  const pins = info.metadata?.openchamber?.context_obligatory_messages;
  const result = new Set<string>();
  const visit = (value: unknown, depth = 0) => {
    if (depth > 8) throw new Error('Pinned-message metadata exceeds its supported depth.');
    if (typeof value === 'string' && value.startsWith('msg_')) result.add(value);
    else if (Array.isArray(value)) value.forEach(item => visit(item, depth + 1));
    else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      // OpenCode inherits parent metadata on child creation. Keep foreign pin references in info, but only assemble pins from the owning transcript. Legacy pins without an owner are treated as local.
      if (typeof record.id === 'string' && typeof record.sessionID === 'string' && record.sessionID && record.sessionID !== info.id) return;
      for (const [key, item] of Object.entries(record)) { if (key.startsWith('msg_')) result.add(key); visit(item, depth + 1); }
    }
  };
  visit(pins); return result;
}

/** The engine's context endpoint already resolves compaction and retained recent text. */
export async function applyProfile(snapshot: CaptureSnapshot, options: CaptureOptions = {}): Promise<CaptureSnapshot> {
  if (options.profile !== 'resume') return { ...snapshot, profile: 'complete' };
  const source = new CaptureStore(snapshot.root), store = await CaptureStore.create();
  const warnings = [...snapshot.warnings], extras: NonNullable<CaptureSnapshot['extras']> = [];
  let warningCount = snapshot.warningCount, messageCount = 0, index = 0;
  // Keep all warnings in the evidence index; only the panel preview is bounded.
  for await (const warning of source.records<{ text: string }>('warnings')) await store.append('warnings', warning);
  const warn = async (text: string) => {
    await store.append('warnings', { text }); warningCount++;
    if (warnings.length < 25) warnings.push(text);
  };
  for await (const original of source.sessions(snapshot)) {
    options.signal?.throwIfAborted();
    const keepHistory = Boolean(options.retainHistory && original.id === snapshot.target.sessionID);
    const { record, history } = await resumeSession(original, source, store, `resume-${index++}`, keepHistory, warn, options.signal);
    await store.append('sessions', record);
    messageCount += record.messageCount;
    if (history) extras.push({ name: 'history/conversation.md', path: history });
  }
  return { ...snapshot, root: store.root, profile: 'resume', retainHistory: Boolean(options.retainHistory), extras, messageCount, warnings, warningCount };
}

/** Each session has its own compaction boundary, pins, and on-disk message indexes. */
async function resumeSession(original: SessionRecord, source: CaptureStore, store: CaptureStore, key: string, keepHistory: boolean, warn: (text: string) => Promise<void>, signal?: AbortSignal): Promise<{ record: SessionRecord; history?: string }> {
  const { contextPath, instructionsPath } = original;
  if (!contextPath || !instructionsPath) throw new Error(`The effective context and session instructions for ${original.id} are required for a resume snapshot.`);
  const record: SessionRecord = { ...original, messagesPath: join(store.root, `${key}-messages.json`), messageIndex: `${key}-messages`, messageCount: 0, eventsPath: undefined, log: { available: false, error: 'Historical events are intentionally excluded from resume snapshots.' } };
  const contextIndex = `${key}-context`;
  await store.initialize(contextIndex);
  const context = new JsonDocument(contextPath), sourceInstructions = new JsonDocument(instructionsPath);
  const pins = pinnedMessageIDs(await readJsonFile(original.infoPath, 2 * 1024 * 1024));
  const contextIDs = new Set<string>(), pinFiles: { id: string; path: string }[] = [];
  let compaction = false;
  for await (const message of context.array([], join(store.root, 'context'))) {
    signal?.throwIfAborted();
    const id = String(await message.scalar(['id'])), type = await message.scalar(['type']);
    if (!/^msg_[a-zA-Z0-9_-]+$/.test(id) || contextIDs.has(id)) throw new Error('The effective context contains a missing or duplicate message identity.');
    contextIDs.add(id);
    let path = message.path;
    if (type === 'compaction' && await message.scalar(['status']) === 'completed') {
      compaction = true; path = join(store.root, `compaction-${randomUUID()}.json`);
      // The context contains metadata.recent assembled by OpenCode. keepID
      // refers to omitted history; retaining it could recompute a different tail.
      await write(path, message.jsonExcluding([['metadata', 'keepID']]));
      if (await message.kind(['native', 'messages'])) await warn(`${original.id} includes a provider-native checkpoint. Resume with the original provider/model; a different model may require earlier history.`);
    }
    await store.append(contextIndex, { id, path }); record.messageCount++;
  }
  let lastContextID: string | undefined;
  for await (const message of source.messages(original)) {
    signal?.throwIfAborted();
    if (pins.has(message.id)) pinFiles.push(message);
    if (contextIDs.has(message.id)) lastContextID = message.id;
  }
  if (contextIDs.size && !lastContextID) throw new Error('Effective context does not match the captured transcript. Capture again after the session settles.');
  if (pinFiles.length !== pins.size) throw new Error('Some pinned messages could not be captured; a faithful resume snapshot cannot be prepared.');
  const olderPins = pinFiles.filter(pin => !contextIDs.has(pin.id));
  // Include original pinned records for human inspection and metadata binding.
  // A separate durable instruction below keeps older pins active across compaction.
  await store.initialize(record.messageIndex);
  for (const pin of pinFiles) if (!contextIDs.has(pin.id)) { await store.append(record.messageIndex, pin); record.messageCount++; }
  for await (const item of store.records(contextIndex, { required: true })) await store.append(record.messageIndex, item);
  // Native context can omit an unfinished assistant and everything following it.
  // Retain the original trailing records, not a guessed chronological window.
  // The importer seals only its own copies, preserving these source records.
  let trailing = lastContextID === undefined;
  for await (const message of source.messages(original)) {
    signal?.throwIfAborted();
    if (trailing && !contextIDs.has(message.id) && !pins.has(message.id)) {
      await store.append(record.messageIndex, message); contextIDs.add(message.id); record.messageCount++;
    }
    if (message.id === lastContextID) trailing = true;
  }
  async function* messages() {
    yield '['; let comma = false;
    for await (const message of store.messages(record)) { if (comma) yield ','; comma = true; yield* createReadStream(message.path); }
    yield ']';
  }
  await write(record.messagesPath, messages());
  const instructions = join(store.root, `${key}-instructions.json`);
  async function* entries() {
    yield '['; let comma = false;
    for await (const item of sourceInstructions.array([], join(store.root, 'instruction-items'))) { signal?.throwIfAborted(); if (comma) yield ','; comma = true; yield* item.json(); }
    for (const pin of olderPins) {
      if (comma) yield ','; comma = true;
      // Native instruction keys are slash-free lowercase identifiers, not paths.
      const key = `session-export-pinned-${createHash('sha256').update(pin.id).digest('hex').slice(0, 32)}`;
      yield `{"key":${JSON.stringify(key)},"value":"Pinned source message:\\n`;
      for await (const text of messageText(new JsonDocument(pin.path))) yield JSON.stringify(text).slice(1, -1);
      yield '"}';
    }
    yield ']';
  }
  await write(instructions, entries()); record.instructionsPath = instructions;
  if (!compaction) await warn(`${original.id} has no reusable compaction; the snapshot retains its available effective context and may not be much smaller.`);
  if (keepHistory) {
    const history = join(store.root, 'history.md');
    async function* olderText() {
      yield '# Earlier conversation — reference only\n\nThis document is not restored into active context.\n\n';
      for await (const item of source.messages(original)) {
        signal?.throwIfAborted();
        if (contextIDs.has(item.id) || pins.has(item.id)) continue;
        const document = new JsonDocument(item.path), type = await document.scalar(['type']);
        if (!['user', 'assistant'].includes(String(type))) continue;
        yield `## ${type}\n\n`; yield* messageText(document); yield '\n\n';
      }
    }
    await write(history, olderText());
    return { record, history };
  }
  return { record };
}

/** Only visible user/assistant text belongs in optional historical consultation. */
async function* messageText(document: JsonDocument): AsyncGenerator<string> {
  if (await document.kind(['text']) === 'string') yield* document.text(['text']);
  else if (await document.kind(['content']) === 'array') {
    for await (const item of document.array(['content'], join(dirname(document.path), 'text-items'))) if (await item.scalar(['type']) === 'text') { yield* item.text(['text']); yield '\n'; }
  }
}
