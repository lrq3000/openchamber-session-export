import { createReadStream, createWriteStream } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { once } from 'node:events';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { finished, pipeline } from 'node:stream/promises';
import { samePath } from './attachments.js';
import { CaptureStore } from './capture-store.js';
import { JsonDocument, type JsonPath } from './json-stream.js';
import type { CaptureSnapshot, ExportTarget, SessionRecord } from './types.js';

export interface Connection { url: string; version: string }

/** GET-only projected capture. No cumulative evidence limit: page values, session records and logs are staged on disk. */
export class SessionSource {
  constructor(private connection: Connection) {}

  async capture(target: ExportTarget): Promise<CaptureSnapshot> {
    if (!/^ses_[a-zA-Z0-9_-]{1,200}$/.test(target.sessionID) || !target.directory) throw new Error('A valid session and directory are required.');
    const store = await CaptureStore.create();
    const snapshot: CaptureSnapshot = { root: store.root, target: { ...target }, startedAt: new Date().toISOString(), endedAt: '', serverVersion: this.connection.version, sessionCount: 0, messageCount: 0, warnings: [], warningCount: 0 };
    const warn = async (text: string) => {
      await store.append('warnings', { text }); snapshot.warningCount++;
      if (snapshot.warnings.length < 25) snapshot.warnings.push(text);
    };
    let active: JsonDocument | undefined, activeRoot: JsonPath = [];
    try { active = await this.document('/api/session/active', {}, store); activeRoot = await this.bodyPath(active); }
    catch { await warn('Session activity could not be checked; the capture may be non-atomic.'); }
    await store.append('queue', { id: target.sessionID });
    for await (const queued of store.records<{ id: string }>('queue')) {
      const id = queued.id;
      if (!await store.claim('sessions', id)) throw new Error('A cycle or duplicate descendant was found. Retry after the session tree settles.');
      const key = createHash('sha256').update(id).digest('hex').slice(0, 24), path = `/api/session/${encodeURIComponent(id)}`;
      const before = await this.document(path, {}, store), root = await this.bodyPath(before);
      if (await before.scalar([...root, 'id']) !== id) throw new Error('The server returned a different session identity.');
      if (id === target.sessionID && !samePath(String(await before.scalar([...root, 'location', 'directory']) ?? ''), target.directory)) throw new Error('The focused session directory does not match this OpenChamber server.');
      const infoPath = join(store.root, `info-${key}.json`), messagesPath = join(store.root, `messages-${key}.json`), messageIndex = `messages-${key}`;
      await this.write(before.json(root), infoPath);
      await store.initialize(messageIndex);
      let messageCount = 0;
      const pages = this.pages(`${path}/message`, { order: 'asc', limit: '100' }, store, `message-${key}`);
      async function* messages() {
        yield '[';
        for await (const item of pages) {
          const messageID = await item.scalar(['id']);
          await store.append(messageIndex, { path: item.path, id: messageID });
          if (messageCount++) yield ',';
          yield* createReadStream(item.path);
        }
        yield ']';
      }
      await this.write(messages(), messagesPath);
      for (const archived of ['false', 'true']) {
        for await (const child of this.pages('/api/session', { parentID: id, archived, order: 'asc', limit: '100' }, store, `child-${key}-${archived}`)) {
          const childID = await child.scalar(['id']);
          if (typeof childID !== 'string' || !/^ses_[a-zA-Z0-9_-]{1,200}$/.test(childID)) throw new Error('Invalid descendant session identity.');
          await store.append('queue', { id: childID });
        }
      }
      const after = await this.document(path, {}, store), afterRoot = await this.bodyPath(after);
      const changed = await before.scalar([...root, 'time', 'updated']) !== await after.scalar([...afterRoot, 'time', 'updated']);
      const activityKind = active ? await active.kind([...activeRoot, id]) : undefined;
      const activity = active ? activityKind === 'object' || activityKind === 'array' || Boolean(await active.scalar([...activeRoot, id])) : null;
      if (activity || changed) await warn(`${id} was active or changed during capture; this is a non-atomic snapshot.`);
      const record: SessionRecord = { id, title: String(await before.scalar([...root, 'title']) ?? id), infoPath, messagesPath, messageIndex, messageCount, active: activity, changed, log: { available: false } };
      const parentID = await before.scalar([...root, 'parentID']); if (typeof parentID === 'string') record.parentID = parentID;
      await store.append('core-sessions', record);
      snapshot.sessionCount++; snapshot.messageCount += messageCount;
    }
    // Optional log failures cannot discard the already-complete primary transcript.
    for await (const record of store.records<SessionRecord>('core-sessions')) {
      try {
        const log = await this.log(record.id, store);
        record.eventsPath = log.path; record.log = { available: true, watermark: log.watermark };
      } catch (error) {
        record.log = { available: false, error: error instanceof Error ? error.message : 'Log unavailable.' };
        await warn(`Durable log unavailable for ${record.id}: ${record.log.error}`);
      }
      await store.append('sessions', record);
    }
    snapshot.endedAt = new Date().toISOString();
    return snapshot;
  }

  private async bodyPath(document: JsonDocument): Promise<JsonPath> { return await document.kind(['data']) === 'object' ? ['data'] : []; }

  private async *pages(path: string, query: Record<string, string>, store: CaptureStore, namespace: string): AsyncGenerator<JsonDocument> {
    let cursor: string | undefined;
    do {
      const pageQuery: Record<string, string> = { ...query, ...(cursor ? { cursor } : {}) };
      if (cursor) delete pageQuery.order;
      const page = await this.document(path, pageQuery, store);
      for await (const item of page.array(['data'], join(store.root, 'items'))) {
        const identity = await item.scalar(['id']);
        if (typeof identity !== 'string' || !identity || !await store.claim(namespace, identity)) throw new Error(`Missing or duplicate identity in ${path}.`);
        yield item;
      }
      const cursorKind = await page.kind(['cursor']), nextKind = await page.kind(['cursor', 'next']);
      if (cursorKind && cursorKind !== 'object' && cursorKind !== 'null' || nextKind && nextKind !== 'string' && nextKind !== 'null') throw new Error(`Invalid cursor in ${path}.`);
      const next = await page.scalar(['cursor', 'next']);
      cursor = next === undefined || next === null ? undefined : typeof next === 'string' ? next : (() => { throw new Error(`Invalid cursor in ${path}.`); })();
      if (cursor && !await store.claim(`cursor-${namespace}`, cursor)) throw new Error(`Repeated cursor in ${path}.`);
    } while (cursor);
  }

  private async response(path: string, query: Record<string, string> = {}): Promise<Response> {
    const base = new URL(this.connection.url);
    if (!['127.0.0.1', '[::1]', 'localhost'].includes(base.hostname) || base.protocol !== 'http:' || base.username || base.password) throw new Error('Only a verified local OpenChamber proxy is supported.');
    const url = new URL(path, base);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { redirect: 'error', signal: controller.signal, cache: 'no-store' });
      if (!response.ok) { await response.body?.cancel(); throw new Error(`OpenCode GET ${path} returned ${response.status}.`); }
      return response;
    } finally { clearTimeout(timer); }
  }

  /** Protect an idle connection, not total capture size or elapsed export time. Disk backpressure does not consume this idle budget. */
  private async *body(response: Response): AsyncGenerator<Uint8Array> {
    if (!response.body) throw new Error('The server returned an empty response body.');
    const reader = response.body.getReader();
    try {
      for (;;) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const idle = new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error('The OpenCode response stopped making progress.')), 30000); });
        try {
          const { done, value } = await Promise.race([reader.read(), idle]);
          if (done) return;
          yield value;
        } finally { clearTimeout(timer); }
      }
    } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  }

  private async document(path: string, query: Record<string, string>, store: CaptureStore): Promise<JsonDocument> {
    const response = await this.response(path, query);
    return JsonDocument.capture(this.body(response), join(store.root, `response-${randomUUID()}.json`));
  }

  private async write(source: AsyncIterable<string | Uint8Array>, path: string): Promise<void> {
    await pipeline(Readable.from(source, { objectMode: false }), createWriteStream(path, { flags: 'wx', mode: 0o600 }));
  }

  private async log(id: string, store: CaptureStore): Promise<{ path: string; watermark?: number }> {
    const response = await this.response(`/api/experimental/session/${encodeURIComponent(id)}/log`, { follow: 'false' });
    const path = join(store.root, `events-${randomUUID()}.jsonl`);
    let synced = false, watermark: number | undefined;
    const frames = this.frames(this.body(response), store);
    async function* events() {
      for await (const document of frames) {
        const type = await document.scalar(['type']);
        if (typeof type !== 'string') throw new Error('Unsupported durable log event envelope.');
        yield* createReadStream(document.path); yield '\n';
        if (type === 'log.synced') {
          const seq = await document.scalar(['seq']);
          if (typeof seq !== 'number' || !Number.isSafeInteger(seq) || seq < 0) throw new Error('The durable log returned an invalid watermark.');
          synced = true; watermark = seq;
          break;
        }
      }
    }
    await this.write(events(), path);
    if (!synced) throw new Error('The durable log ended without a captured watermark.');
    return { path, watermark };
  }

  /** SSE data lines may themselves be enormous. Only the field prefix is buffered; event JSON is normalized on disk. */
  private async *frames(source: AsyncIterable<Uint8Array>, store: CaptureStore): AsyncGenerator<JsonDocument> {
    let prefix = '', state: 'prefix' | 'data' | 'ignore' = 'prefix', skipSpace = false, hasData = false;
    let writer: ReturnType<typeof createWriteStream> | undefined, rawPath = '', done: Promise<void> | undefined, failure: unknown;
    const decoder = new TextDecoder();
    const append = async (text: string) => { if (text && writer && !writer.write(text)) await once(writer, 'drain'); };
    const finish = async () => {
      if (!writer) return undefined;
      writer.end(); await done; if (failure) throw failure;
      writer = undefined; done = undefined; hasData = false;
      const raw = new JsonDocument(rawPath), normalizedPath = join(store.root, `event-${randomUUID()}.json`);
      return JsonDocument.capture(raw.json(), normalizedPath);
    };
    try {
      for await (const bytes of source) {
        const text = decoder.decode(bytes, { stream: true }); let offset = 0;
        while (offset < text.length) {
          const newline = text.indexOf('\n', offset), endLine = newline !== -1;
          let fragment = text.slice(offset, endLine ? newline : text.length); offset = endLine ? newline + 1 : text.length;
          if (state === 'prefix') {
            const colon = fragment.indexOf(':');
            if (colon !== -1) {
              prefix += fragment.slice(0, colon); fragment = fragment.slice(colon + 1);
              state = prefix === 'data' ? 'data' : 'ignore'; prefix = '';
              if (state === 'data') {
                if (!writer) {
                  rawPath = join(store.root, `event-raw-${randomUUID()}.json`); writer = createWriteStream(rawPath, { flags: 'wx', mode: 0o600 });
                  // Network/idle failures destroy a partially written frame. Close without finish must settle cleanup too.
                  failure = undefined; done = finished(writer, { cleanup: true }).catch(error => { failure = error; });
                }
                if (hasData) await append('\n'); hasData = true; skipSpace = true;
              }
            } else {
              prefix += fragment;
              if (prefix.length > 8) { state = 'ignore'; prefix = ''; }
              fragment = '';
            }
          }
          if (state === 'data') {
            if (skipSpace && fragment) { if (fragment.startsWith(' ')) fragment = fragment.slice(1); skipSpace = false; }
            await append(fragment);
          }
          if (endLine) {
            if (state === 'prefix' && !prefix.trim() && hasData) { const event = await finish(); if (event) yield event; }
            state = 'prefix'; prefix = ''; skipSpace = false;
          }
          if (failure) throw failure;
        }
      }
      if (hasData) { const event = await finish(); if (event) yield event; }
    } finally { writer?.destroy(); await done; }
  }
}
