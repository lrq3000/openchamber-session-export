import { createHash } from 'node:crypto';
import { appendFile, mkdir, mkdtemp, open, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import type { CaptureSnapshot, SessionRecord } from './types.js';

const CONTROL_BYTES = 64 * 1024;

/** Per-job evidence/control storage. Identity checks use files, not a Set that grows with chat length. */
export class CaptureStore {
  constructor(readonly root: string) {}

  static async create(): Promise<CaptureStore> {
    const base = process.env.SESSION_EXPORT_TEST_TMP ?? join(tmpdir(), 'opencode');
    await mkdir(base, { recursive: true });
    return new CaptureStore(await mkdtemp(join(base, 'session-export-capture-')));
  }

  file(name: string): string {
    if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error('Invalid capture-store index name.');
    return join(this.root, `${name}.jsonl`);
  }

  async claim(namespace: string, identity: string): Promise<boolean> {
    if (!/^[a-z0-9_-]+$/i.test(namespace)) throw new Error('Invalid identity namespace.');
    const hash = createHash('sha256').update(identity).digest('hex');
    const path = join(this.root, 'identities', namespace, hash.slice(0, 2), hash);
    await mkdir(dirname(path), { recursive: true });
    try { await writeFile(path, identity, { flag: 'wx', mode: 0o600 }); return true; }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false; throw error; }
  }

  /** Records contain only small backend descriptors; full projected evidence belongs in streamed JSON files. */
  async append(name: string, value: unknown): Promise<void> {
    const text = JSON.stringify(value) + '\n';
    if (Buffer.byteLength(text) > CONTROL_BYTES) throw new Error('A capture control record exceeds its metadata size limit.');
    await mkdir(this.root, { recursive: true });
    await appendFile(this.file(name), text, { encoding: 'utf8', mode: 0o600 });
  }

  /** Required indexes exist even for legitimate empty sessions; absence is never a substitute for captured emptiness. */
  async initialize(name: string): Promise<void> {
    await mkdir(this.root, { recursive: true });
    await writeFile(this.file(name), '', { flag: 'wx', mode: 0o600 });
  }

  async *records<T>(name: string, options: { required?: boolean } = {}): AsyncGenerator<T> {
    let file;
    try { file = await open(this.file(name), 'r'); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        if (options.required) throw new Error(`Required capture index ${name} is missing. Prepare the export again.`);
        return;
      }
      throw error;
    }
    const bytes = Buffer.alloc(CONTROL_BYTES), decoder = new TextDecoder();
    let position = 0, remaining = '';
    try {
      // A demand-driven reader observes queue records appended while its consumer handles the previous record.
      for (;;) {
        const { bytesRead } = await file.read(bytes, 0, bytes.length, position);
        if (!bytesRead) break;
        position += bytesRead; remaining += decoder.decode(bytes.subarray(0, bytesRead), { stream: true });
        let boundary;
        while ((boundary = remaining.indexOf('\n')) !== -1) {
          const line = remaining.slice(0, boundary); remaining = remaining.slice(boundary + 1);
          if (line) yield JSON.parse(line) as T;
        }
        if (Buffer.byteLength(remaining) > CONTROL_BYTES) throw new Error('A stored control record exceeds its metadata limit.');
      }
      if (remaining.trim()) throw new Error('A stored control record ended incompletely.');
    } finally { await file.close(); }
  }

  /** Validate descriptors on every consumer pass, so cleanup or truncation cannot turn captured evidence into a successful empty archive. */
  async *sessions(capture: CaptureSnapshot): AsyncGenerator<SessionRecord> {
    let sessions = 0, messages = 0, roots = 0;
    for await (const session of this.records<SessionRecord>('sessions', { required: true })) {
      if (!Number.isSafeInteger(session.messageCount) || session.messageCount < 0) throw new Error('Invalid capture message count. Prepare the export again.');
      sessions++; messages += session.messageCount; if (session.id === capture.target.sessionID) roots++;
      yield session;
    }
    if (sessions !== capture.sessionCount || messages !== capture.messageCount || roots !== 1) throw new Error('Capture session index/count mismatch. Prepare the export again.');
  }

  async *messages(session: SessionRecord): AsyncGenerator<{ path: string; id: string }> {
    let count = 0;
    for await (const message of this.records<{ path: string; id: string }>(session.messageIndex, { required: true })) { count++; yield message; }
    if (count !== session.messageCount) throw new Error('Capture message index/count mismatch. Prepare the export again.');
  }

  /** A byte cursor avoids rescanning the entire inventory for every UI page. Only bounded control records are decoded. */
  async page<T>(name: string, offset = 0, limit = 100): Promise<{ records: T[]; next: number | null }> {
    if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Invalid inventory cursor or page size.');
    let file;
    try { file = await open(this.file(name), 'r'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT' && offset === 0) return { records: [], next: null }; throw error; }
    const records: T[] = [];
    try {
      const size = (await file.stat()).size;
      if (offset > size) throw new Error('Invalid inventory cursor.');
      if (offset > 0) { const prior = Buffer.alloc(1); await file.read(prior, 0, 1, offset - 1); if (prior[0] !== 10) throw new Error('Invalid inventory cursor.'); }
      const bytes = Buffer.alloc(CONTROL_BYTES); let position = offset, cursor = offset, pending = Buffer.alloc(0);
      for (;;) {
        const { bytesRead } = await file.read(bytes, 0, bytes.length, position);
        if (!bytesRead) break;
        position += bytesRead; pending = Buffer.concat([pending, bytes.subarray(0, bytesRead)]);
        let boundary;
        while ((boundary = pending.indexOf(10)) !== -1) {
          const line = pending.subarray(0, boundary); pending = pending.subarray(boundary + 1); cursor += boundary + 1;
          if (line.length > CONTROL_BYTES) throw new Error('An inventory control record exceeds its metadata limit.');
          if (line.length) records.push(JSON.parse(line.toString('utf8')) as T);
          if (records.length === limit) return { records, next: cursor < size ? cursor : null };
        }
        if (pending.length > CONTROL_BYTES) throw new Error('An inventory control record exceeds its metadata limit.');
      }
      if (pending.length) throw new Error('An inventory control record ended incompletely.');
      return { records, next: null };
    } finally { await file.close(); }
  }
}
