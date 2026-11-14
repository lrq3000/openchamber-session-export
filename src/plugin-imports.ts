import { open, stat } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { hydrateAttachments } from './portable-attachments.js';
import { MAX_IMPORT_JSON_BYTES, prepareSessionCopies, type PortableSession, type PreparedSession } from './portable-session.js';
import { readJsonFile, writePrivateJson } from './private-channel.js';
import type { RecordData } from './types.js';

export type NativeRequest = (path: string, method?: string, body?: string) => Promise<Response>;
export interface ImportState {
  instanceID: string; state: 'preparing' | 'prepared' | 'running' | 'ready' | 'failed' | 'cancelled';
  progress: string; sessions: string[]; warnings: string[]; error?: string; cancelRequested?: boolean;
  inFlight?: { sessionID: string; phase: 'import' | 'instructions' | 'verify'; key?: string };
  uncertainSessions?: string[]; finalized?: string[];
  mainSessionID?: string;
}

/** The journal, not a retry loop, is the authority for mutation outcomes. */
export class PluginImports {
  private states = new Map<string, ImportState>();
  private locks = new Set<string>();
  private tasks = new Set<string>();
  private writes = new Map<string, Promise<void>>();
  constructor(private root: string, private instanceID: string, private native: NativeRequest) {}
  private directory(id: string) { return join(this.root, 'jobs', id); }
  private persist(id: string, state: ImportState): Promise<void> {
    const snapshot = structuredClone(state);
    const next = (this.writes.get(id) ?? Promise.resolve()).catch(() => {}).then(() => writePrivateJson(join(this.directory(id), 'state.json'), snapshot));
    this.writes.set(id, next);
    void next.finally(() => { if (this.writes.get(id) === next) this.writes.delete(id); }).catch(() => {});
    return next;
  }
  private remember(id: string, state: ImportState) {
    if (this.states.size >= 32) {
      const evicted = [...this.states.keys()].find(key => !this.tasks.has(key) && !this.locks.has(key));
      if (evicted) this.states.delete(evicted); else throw new Error('Too many active native import jobs.');
    }
    this.states.set(id, state);
  }
  async status(id: string): Promise<ImportState> {
    const state = this.states.get(id) ?? await readJsonFile(join(this.directory(id), 'state.json'), 256 * 1024) as ImportState;
    if (state.instanceID !== this.instanceID || state.state === 'running' && !this.tasks.has(id) || state.state === 'preparing' && !this.locks.has(id)) {
      // A new process cannot safely replay a previous process's pending mutation.
      // Keep candidate IDs visible even when the old instance cannot be queried.
      return { ...state, state: 'failed', uncertainSessions: state.inFlight?.phase === 'import' ? [state.inFlight.sessionID] : state.uncertainSessions,
        error: 'The plugin restarted or its instance changed. Inspect the recorded created/candidate session IDs; no mutation was replayed.', progress: 'Interrupted import requires inspection' };
    }
    if (this.tasks.has(id) && state.state !== 'running') return { ...structuredClone(state), state: 'running', progress: 'Recording the final import outcome' };
    return structuredClone(state);
  }
  async prepare(id: string): Promise<ImportState> {
    if (this.locks.has(id)) throw new Error('An operation for this import is already in progress.');
    this.locks.add(id);
    try {
      // Exclusive reservation survives restart. Never overwrite previously
      // generated mappings, even if the process lost its in-memory job cache.
      const reservation = await open(join(this.directory(id), 'prepare.lock'), 'wx', 0o600); await reservation.close();
      const state: ImportState = { instanceID: this.instanceID, state: 'preparing', progress: 'Preparing import copies', sessions: [], warnings: [], finalized: [] };
      this.remember(id, state); await this.persist(id, state);
      try {
        const directory = this.directory(id), spec = await readJsonFile(join(directory, 'spec.json'), 512 * 1024);
        if (typeof spec.directory !== 'string' || !Array.isArray(spec.files) || !spec.files.length || spec.files.length > 512 || !Array.isArray(spec.assets)) throw new Error('Invalid private import specification.');
        const sources: PortableSession[] = []; let bytes = 0;
        for (const file of spec.files) {
          if (!/^source-[0-9]+\.json$/.test(file)) throw new Error('Invalid private session filename.');
          bytes += (await stat(join(directory, file))).size;
          if (bytes > MAX_IMPORT_JSON_BYTES) throw new Error('Session JSON exceeds the 64 MiB import safety limit.');
          sources.push(await readJsonFile(join(directory, file), MAX_IMPORT_JSON_BYTES));
        }
        const contents = new Map<string, string>(spec.assetContents ?? []), assets = new Map<string, string>(spec.assets);
        for (const path of contents.values()) if (dirname(path) !== directory || !/^entry-[a-f0-9-]+$/.test(basename(path))) throw new Error('Invalid private archived file source.');
        await hydrateAttachments(sources, contents, assets, bytes);
        const prepared = prepareSessionCopies(sources, spec.directory, assets);
        state.mainSessionID = prepared.sessions.find(session => session.sourceID === spec.mainSourceID)?.info.id ?? prepared.sessions[0].info.id;
        let preparedBytes = 0;
        for (const [number, session] of prepared.sessions.entries()) {
          // Check the representation actually sent to the engine, after fresh
          // IDs, path expansion, attachment hydration and interruption metadata.
          preparedBytes += Buffer.byteLength(JSON.stringify(session));
          if (preparedBytes > MAX_IMPORT_JSON_BYTES || Buffer.byteLength(this.payload(session)) > MAX_IMPORT_JSON_BYTES) throw new Error('Adapted session JSON exceeds the 64 MiB import safety limit.');
          await writePrivateJson(join(directory, `prepared-${number}.json`), session);
        }
        await writePrivateJson(join(directory, 'prepared-index.json'), { count: prepared.sessions.length, instanceID: this.instanceID });
        state.state = 'prepared'; state.progress = 'Ready for confirmation'; state.warnings = prepared.warnings.slice(0, 25);
        await this.persist(id, state); return structuredClone(state);
      } catch (error) {
        state.state = 'failed'; state.error = error instanceof Error ? error.message : 'Preparation failed.'; await this.persist(id, state); throw error;
      }
    } finally { this.locks.delete(id); }
  }
  async start(id: string): Promise<ImportState> {
    if (this.locks.has(id)) throw new Error('An operation for this import is already in progress.');
    this.locks.add(id);
    try {
      const state = this.states.get(id) ?? await this.status(id);
      if (state.instanceID !== this.instanceID || state.state !== 'prepared' || state.cancelRequested) throw new Error('This import is no longer a confirmed, prepared job on the same plugin instance.');
      if (this.tasks.size >= 2) throw new Error('Wait for the current native imports to finish.');
      state.state = 'running'; state.progress = 'Importing new sessions';
      this.remember(id, state); this.tasks.add(id);
      try { await this.persist(id, state); } catch (error) { this.tasks.delete(id); throw error; }
      void this.run(id, state).finally(() => this.tasks.delete(id));
      return structuredClone(state);
    } finally { this.locks.delete(id); }
  }
  async cancel(id: string): Promise<ImportState> {
    if (this.locks.has(id)) throw new Error('Wait for the current job transition before cancelling.');
    this.locks.add(id);
    try {
      const state = this.states.get(id) ?? await this.status(id);
      if (state.instanceID !== this.instanceID) throw new Error('The original plugin instance is unavailable; inspect its journal.');
      state.cancelRequested = true;
      if (state.state === 'prepared') { state.state = 'cancelled'; state.progress = 'Cancelled before native import'; }
      this.remember(id, state); await this.persist(id, state); return structuredClone(state);
    } finally { this.locks.delete(id); }
  }
  close() { for (const state of this.states.values()) state.cancelRequested = true; }
  private payload(session: PreparedSession) { return JSON.stringify({ info: session.info, messages: session.messages, location: session.info.location }); }
  private async run(id: string, state: ImportState): Promise<void> {
    const directory = this.directory(id);
    try {
      const index = await readJsonFile(join(directory, 'prepared-index.json'), 8192);
      if (index.instanceID !== this.instanceID) throw new Error('The prepared import belongs to a different plugin instance.');
      for (let number = 0; number < index.count; number++) {
        if (state.cancelRequested) break;
        const session: PreparedSession = await readJsonFile(join(directory, `prepared-${number}.json`), MAX_IMPORT_JSON_BYTES);
        state.progress = `Importing session ${number + 1} of ${index.count}`;
        state.inFlight = { sessionID: session.info.id, phase: 'import' }; await this.persist(id, state);
        if (state.cancelRequested) { delete state.inFlight; break; }
        try {
          const result = await this.native('/api/experimental/session/import', 'POST', this.payload(session)); await result.body?.cancel();
          state.sessions.push(session.info.id);
        } catch (error) {
          // A failed acknowledgement is not evidence that the transaction failed.
          // Reconcile only the exact fresh ID against this same live instance.
          try {
            const result = await this.native(`/api/session/${session.info.id}`), info = await result.json() as any;
            if ((info.data ?? info).id === session.info.id) state.sessions.push(session.info.id);
            else state.uncertainSessions = [session.info.id];
          } catch { state.uncertainSessions = [session.info.id]; }
          throw error;
        }
        state.inFlight = { sessionID: session.info.id, phase: 'verify' }; await this.persist(id, state);
        await this.verify(session);
        for (const [entryNumber, entry] of (session.instructions ?? []).entries()) {
          if (state.cancelRequested) break;
          state.inFlight = { sessionID: session.info.id, phase: 'instructions', key: entry.key }; await this.persist(id, state);
          if (state.cancelRequested) break;
          const result = await this.native(`/api/experimental/session/${session.info.id}/instructions/entries/${entry.key}`, 'PUT', JSON.stringify({ value: entry.value })); await result.body?.cancel();
          // Persist each finalized key separately, so large instruction sets do
          // not make the bounded public job state grow without limit.
          await writePrivateJson(join(directory, `instruction-${number}-${entryNumber}.json`), { sessionID: session.info.id, key: entry.key, completed: true });
        }
        if (!state.cancelRequested) {
          if (session.instructions?.length) {
            const result = await this.native(`/api/experimental/session/${session.info.id}/instructions/entries`), entries = await result.json() as any;
            const values = new Map<string, unknown>((entries.data ?? entries).map((entry: RecordData) => [entry.key, entry.value]));
            for (const entry of session.instructions) if (!isDeepStrictEqual(values.get(entry.key), entry.value)) throw new Error('Instruction read-back does not match the prepared copy.');
          }
          state.finalized!.push(session.info.id);
        }
        delete state.inFlight; await this.persist(id, state);
      }
      state.state = state.cancelRequested ? 'cancelled' : 'ready';
      state.progress = state.cancelRequested ? 'Cancelled; already-created sessions and files were preserved. Instruction finalization may be incomplete.' : 'New sessions imported and verified';
    } catch (error) {
      state.state = 'failed'; state.error = error instanceof Error ? error.message : 'Native import failed.';
      state.progress = 'Import stopped; inspect created and uncertain session IDs before preparing another import';
    }
    try { await this.persist(id, state); } catch { state.state = 'failed'; state.error = 'The final import journal could not be saved. Inspect the recorded session IDs before another import.'; }
  }
  private async verify(session: PreparedSession): Promise<void> {
    const response = await this.native(`/api/session/${session.info.id}`), body = await response.json() as any, info = body.data ?? body;
    if (info.id !== session.info.id || info.parentID !== session.info.parentID || info.location?.directory !== session.info.location.directory
      || !isDeepStrictEqual(info.metadata?.openchamber?.context_obligatory_messages, session.info.metadata?.openchamber?.context_obligatory_messages)) throw new Error('Imported session identity, location, parent or pins did not match the prepared copy.');
    let cursor: string | undefined, count = 0; const seen = new Set<string>();
    do {
      const query = cursor ? `cursor=${encodeURIComponent(cursor)}&limit=100` : 'order=asc&limit=100';
      const result = await this.native(`/api/session/${session.info.id}/message?${query}`), page = await result.json() as any;
      const messages = page.data ?? page;
      if (!Array.isArray(messages)) throw new Error('Imported transcript verification returned an unsupported page.');
      for (const actual of messages) {
        const expected = session.messages[count++];
        if (!expected || actual.id !== expected.id || actual.type !== expected.type) throw new Error('The official importer omitted or reordered a message. Created sessions were preserved for inspection.');
        for (const field of ['text', 'summary', 'content', 'files', 'output', 'time', 'agent', 'model', 'status', 'reason', 'error', 'native', 'tokens', 'cost', 'shellID', 'command', 'exit', 'agents', 'skills', 'description', 'metadata']) if (expected[field] !== undefined && !isDeepStrictEqual(actual[field], expected[field])) throw new Error(`The official importer changed message ${field}. Inspect the new session and original ZIP.`);
      }
      cursor = page.cursor?.next;
      if (cursor && seen.has(cursor)) throw new Error('Imported transcript verification repeated a cursor.');
      if (cursor) seen.add(cursor);
    } while (cursor);
    if (count !== session.messages.length) throw new Error('Imported transcript count does not match the prepared copy.');
  }
}
