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
    else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) { if (key.startsWith('msg_')) result.add(key); visit(item, depth + 1); }
  };
  visit(pins); return result;
}

/** The engine's context endpoint already resolves compaction and retained recent text. */
export async function applyProfile(snapshot: CaptureSnapshot, options: CaptureOptions = {}): Promise<CaptureSnapshot> {
  if (options.profile !== 'resume') return { ...snapshot, profile: 'complete' };
  const source = new CaptureStore(snapshot.root), store = await CaptureStore.create();
  const original = (await source.page<SessionRecord>('sessions')).records.find(record => record.id === snapshot.target.sessionID);
  if (!original?.contextPath || !original.instructionsPath) throw new Error('The effective context and session instructions are required for a resume snapshot.');
  const originalRecord: SessionRecord = original, originalInstructions = original.instructionsPath;
  const record: SessionRecord = { ...original, messagesPath: join(store.root, 'messages.json'), messageIndex: 'resume-messages', messageCount: 0, eventsPath: undefined, log: { available: false, error: 'Historical events are intentionally excluded from resume snapshots.' } };
  await store.initialize('context-messages');
  const context = new JsonDocument(original.contextPath), pins = pinnedMessageIDs(await readJsonFile(original.infoPath, 2 * 1024 * 1024));
  const contextIDs = new Set<string>(), warnings = [...snapshot.warnings], pinFiles: { id: string; path: string }[] = [];
  let compaction = false;
  for await (const message of context.array([], join(store.root, 'context'))) {
    options.signal?.throwIfAborted();
    const id = String(await message.scalar(['id'])), type = await message.scalar(['type']);
    if (!/^msg_[a-zA-Z0-9_-]+$/.test(id) || contextIDs.has(id)) throw new Error('The effective context contains a missing or duplicate message identity.');
    contextIDs.add(id);
    let path = message.path;
    if (type === 'compaction' && await message.scalar(['status']) === 'completed') {
      compaction = true; path = join(store.root, `compaction-${randomUUID()}.json`);
      // The context contains metadata.recent assembled by OpenCode. keepID
      // refers to omitted history; retaining it could recompute a different tail.
      await write(path, message.jsonExcluding([['metadata', 'keepID']]));
      if (await message.kind(['native', 'messages'])) warnings.push('This snapshot includes a provider-native checkpoint. Resume with the original provider/model; a different model may require earlier history.');
    }
    await store.append('context-messages', { id, path }); record.messageCount++;
  }
  let lastContextID: string | undefined;
  for await (const message of source.messages(original)) {
    options.signal?.throwIfAborted();
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
  for await (const item of store.records('context-messages')) await store.append(record.messageIndex, item);
  // Native context can omit an unfinished assistant and everything following it.
  // Retain the original trailing records, not a guessed chronological window.
  // The importer seals only its own copies, preserving these source records.
  let trailing = lastContextID === undefined;
  for await (const message of source.messages(original)) {
    options.signal?.throwIfAborted();
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
  const instructions = join(store.root, 'instructions.json');
  async function* entries() {
    yield '['; let comma = false;
    for await (const item of new JsonDocument(originalInstructions).array([], join(store.root, 'instruction-items'))) { if (comma) yield ','; comma = true; yield* item.json(); }
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
  await store.append('sessions', record);
  if (!compaction) warnings.push('No reusable compaction is present; the snapshot retains the available effective context and may not be much smaller.');
  const extras: CaptureSnapshot['extras'] = [];
  if (options.retainHistory) {
    const history = join(store.root, 'history.md');
    async function* olderText() {
      yield '# Earlier conversation — reference only\n\nThis document is not restored into active context.\n\n';
      for await (const item of source.messages(originalRecord)) {
        if (contextIDs.has(item.id) || pins.has(item.id)) continue;
        const document = new JsonDocument(item.path), type = await document.scalar(['type']);
        if (!['user', 'assistant'].includes(String(type))) continue;
        yield `## ${type}\n\n`; yield* messageText(document); yield '\n\n';
      }
    }
    await write(history, olderText()); extras.push({ name: 'history/conversation.md', path: history });
  }
  // Put every warning in the new evidence index, not only the UI's bounded preview.
  for await (const warning of source.records<{ text: string }>('warnings')) await store.append('warnings', warning);
  for (const text of warnings.slice(snapshot.warnings.length)) await store.append('warnings', { text });
  return { ...snapshot, root: store.root, profile: 'resume', retainHistory: Boolean(options.retainHistory), extras, sessionCount: 1, messageCount: record.messageCount, warnings: warnings.slice(0, 25), warningCount: snapshot.warningCount + warnings.length - snapshot.warnings.length };
}

/** Only visible user/assistant text belongs in optional historical consultation. */
async function* messageText(document: JsonDocument): AsyncGenerator<string> {
  if (await document.kind(['text']) === 'string') yield* document.text(['text']);
  else if (await document.kind(['content']) === 'array') {
    for await (const item of document.array(['content'], join(dirname(document.path), 'text-items'))) if (await item.scalar(['type']) === 'text') { yield* item.text(['text']); yield '\n'; }
  }
}
