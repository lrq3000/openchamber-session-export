import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { lstat, mkdir, open, realpath, statfs } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import yauzl, { type ZipFile } from 'yauzl';
import { samePath } from './attachments.js';
import { PluginClient } from './plugin-client.js';
import { MAX_IMPORT_JSON_BYTES, portableFileKey } from './portable-session.js';
import { privateDirectory, readJsonFile, UUID, writePrivateJson } from './private-channel.js';
import type { RecordData } from './types.js';
import { MAX_UPLOAD_BYTES } from './upload.js';
import { boundedStrings } from './control-metadata.js';

const MAX_EXPANDED_BYTES = 2 * 1024 * 1024 * 1024, MAX_ENTRIES = 10000;
interface Extracted { name: string; path: string; size: number; sha256: string }
export interface ImportPreview { id: string; sourcePath: string; directory: string; restoredDirectory: string; profile: string; compressedBytes: number; uncompressedBytes: number; sessionCount: number; messageCount: number; fileCount: number; warnings: string[]; dependencies: string[]; importJsonLimit: number }
interface Preparation { preview: ImportPreview; files: { source: string; destination: string }[]; started: boolean; instanceID: string }
interface JobLocation { jobRoot: string; instanceID: string }

export class Importer {
  private running = new Map<string, { controller: AbortController; state: RecordData }>();
  private starting = new Set<string>();
  constructor(private plugin: () => Promise<PluginClient>, private journalDirectory?: string) {}

  async prepare(sourcePath: string, destination: string, signal?: AbortSignal): Promise<ImportPreview> {
    const client = await this.plugin();
    if (typeof sourcePath !== 'string' || sourcePath.length > 4096 || !isAbsolute(sourcePath) || /^[\\/]{2}/.test(sourcePath) || sourcePath.includes('\0')) throw new Error('Provide an absolute ZIP path on this OpenChamber server.');
    const source = await lstat(sourcePath), canonical = await realpath(sourcePath);
    if (!source.isFile() || source.isSymbolicLink() || !samePath(canonical, resolve(sourcePath))) throw new Error('The ZIP must be a regular local file without symbolic-link ancestors.');
    if (source.size > MAX_UPLOAD_BYTES) throw new Error('ZIP exceeds the 8 GiB staging safety limit.');
    if (typeof destination !== 'string' || destination.length > 4096 || !isAbsolute(destination) || /^[\\/]{2}/.test(destination) || destination.includes('\0')) throw new Error('Choose an absolute working directory on this server.');
    const directory = await realpath(destination);
    if (!samePath(directory, resolve(destination)) || !(await lstat(directory)).isDirectory()) throw new Error('Choose an existing canonical working directory without symbolic links.');
    const id = randomUUID(), root = join(client.root, 'jobs', id);
    await privateDirectory(root);
    if (this.journalDirectory) {
      // This small locator is stable across managing-host PID changes. It grants
      // offline read access to one extension-owned journal, never mutation replay.
      await privateDirectory(this.journalDirectory);
      await writePrivateJson(join(this.journalDirectory, `${id}.json`), { jobRoot: root, instanceID: client.instanceID } satisfies JobLocation);
    }
    const stagingSpace = await statfs(root);
    if (stagingSpace.bavail * stagingSpace.bsize < source.size + 16 * 1024 * 1024) throw new Error('Not enough private staging space for the ZIP copy.');
    const frozen = join(root, 'source.zip');
    const handle = await open(canonical, 'r');
    try {
      const before = await handle.stat();
      if (before.dev !== source.dev || before.ino !== source.ino) throw new Error('The ZIP changed while it was being opened.');
      await pipeline(handle.createReadStream({ autoClose: false }), createWriteStream(frozen, { flags: 'wx', mode: 0o600 }), { signal });
      const after = await handle.stat(), current = await lstat(sourcePath);
      if ([after, current].some(value => value.size !== before.size || value.mtimeMs !== before.mtimeMs || value.ino !== before.ino || value.dev !== before.dev)) throw new Error('The ZIP changed during preparation. Wait for the external transfer to finish.');
    } finally { await handle.close(); }
    const extracted = await extract(frozen, root, signal);
    const manifestEntry = extracted.get('manifest.json');
    if (!manifestEntry) throw new Error('The ZIP has no Session Export manifest.');
    const manifest = await readJsonFile(manifestEntry.path, 8 * 1024 * 1024);
    if (!['openchamber-session-export/1', 'openchamber-session-export/2'].includes(manifest.schema) || !Array.isArray(manifest.entries) || !Array.isArray(manifest.sessions)) throw new Error('Unsupported or invalid Session Export archive.');
    if (manifest.profile !== undefined && !['complete', 'resume'].includes(manifest.profile)) throw new Error('Unsupported archive profile.');
    const declared = new Set<string>(['manifest.json']);
    for (const entry of manifest.entries) {
      const actual = extracted.get(entry.path);
      if (declared.has(entry.path) || !actual || actual.size !== entry.size || actual.sha256 !== entry.sha256) throw new Error('Archive entries do not match the manifest checksums.');
      declared.add(entry.path);
    }
    if (declared.size !== extracted.size) throw new Error('The archive contains undeclared entries.');
    const restored = join(directory, '.openchamber-imports', id), assets: [string, string][] = [], assetContents: [string, string][] = [], files: Preparation['files'] = [];
    let assetBytes = 0; const assetSources = new Set<string>();
    for (const decision of manifest.assets?.decisions ?? []) {
      if (decision.status !== 'included') continue;
      const entry = extracted.get(decision.archivePath);
      if (!entry || !entry.name.startsWith('assets/') || typeof decision.path !== 'string') throw new Error('Invalid archived asset reference.');
      const sourceKey = portableFileKey(decision.path);
      if (assetSources.has(sourceKey)) throw new Error('Duplicate or ambiguous archived asset mapping.');
      assetSources.add(sourceKey);
      // Generated destination filenames avoid Windows device names, Unicode/case
      // collisions and writes to historical absolute paths from another machine.
      const target = join(restored, `asset-${files.length}${safeExtension(entry.name)}`);
      files.push({ source: entry.path, destination: target }); assets.push([decision.path, target]); assetContents.push([decision.path, entry.path]); assetBytes += entry.size;
    }
    let jsonBytes = 0, messageCount = 0;
    const sourceFiles: string[] = [], seen = new Set<string>();
    for (const session of manifest.sessions) {
      if (typeof session.id !== 'string' || !/^ses_[a-zA-Z0-9_-]{1,200}$/.test(session.id) || seen.has(session.id)) throw new Error('Invalid or duplicate archived session identity.');
      seen.add(session.id);
      const entry = extracted.get(session.id === manifest.target?.sessionID ? 'session.json' : `subsessions/${session.id}.json`);
      if (!entry) throw new Error('An archived session is missing.');
      jsonBytes += entry.size;
      if (jsonBytes > MAX_IMPORT_JSON_BYTES) throw new Error('Session JSON exceeds the 64 MiB import safety limit. The ZIP remains available for consultation.');
      const payload = await readJsonFile(entry.path, MAX_IMPORT_JSON_BYTES);
      if (payload.info?.id !== session.id || !Array.isArray(payload.messages) || payload.messages.length !== session.messages) throw new Error('Session content/count mismatch.');
      const instructions = extracted.get(`context/${session.id}/instructions.json`);
      if (instructions) { jsonBytes += instructions.size; if (jsonBytes > MAX_IMPORT_JSON_BYTES) throw new Error('Instructions exceed the import safety budget.'); payload.instructions = await readJsonFile(instructions.path, 2 * 1024 * 1024); }
      const name = `source-${sourceFiles.length}.json`; await writePrivateJson(join(root, name), payload); sourceFiles.push(name); messageCount += payload.messages.length;
    }
    if (!sourceFiles.length || !seen.has(manifest.target?.sessionID)) throw new Error('The archive has no main session.');
    const total = [...extracted.values()].reduce((size, entry) => size + entry.size, 0), space = await statfs(directory);
    if (space.bavail * space.bsize < assetBytes + 1024 * 1024) throw new Error('Not enough disk space for restored files.');
    await writePrivateJson(join(root, 'spec.json'), { directory, files: sourceFiles, assets, assetContents, mainSourceID: manifest.target.sessionID });
    const prepared = await client.request(`/imports/${id}/prepare`, 'POST', {});
    const preview: ImportPreview = {
      id, sourcePath, directory, restoredDirectory: restored, profile: manifest.profile ?? 'complete', compressedBytes: source.size, uncompressedBytes: total,
      sessionCount: sourceFiles.length, messageCount, fileCount: files.length, importJsonLimit: MAX_IMPORT_JSON_BYTES,
      warnings: boundedStrings([
        'Native import restores supported projected messages and captured session instructions. Event logs and optional historical text remain archive-only; unfamiliar API fields are not guaranteed to survive native import.',
        ...(Array.isArray(manifest.warnings) ? manifest.warnings : []), ...(prepared.warnings ?? []),
      ]),
      dependencies: boundedStrings(Array.isArray(manifest.dependencies) ? manifest.dependencies : ['Legacy archive: portable instructions and dependency coverage may be incomplete.'], 10),
    };
    signal?.throwIfAborted();
    const preparation = { preview, files, started: false, instanceID: client.instanceID } satisfies Preparation;
    if (Buffer.byteLength(JSON.stringify(preparation)) > 2 * 1024 * 1024) throw new Error('Import file mapping exceeds the 2 MiB control-metadata safety limit.');
    await writePrivateJson(join(root, 'import.json'), preparation);
    return preview;
  }

  async start(id: string): Promise<RecordData> {
    if (!UUID.test(id)) throw new Error('Invalid import identity.');
    if (this.starting.has(id) || this.running.has(id)) throw new Error('This import is already running.');
    if (this.starting.size + this.running.size >= 2) throw new Error('Wait for the current import operations to finish.');
    this.starting.add(id);
    try {
      const client = await this.plugin(), root = join(client.root, 'jobs', id);
      const preparation = await readJsonFile(join(root, 'import.json'), 2 * 1024 * 1024) as Preparation;
      if (preparation.started) throw new Error('This import has already started. Inspect its recorded result; do not blindly retry a mutation.');
      if (preparation.instanceID !== client.instanceID) throw new Error('The plugin instance changed after preview. No import was submitted.');
      const reservation = await open(join(root, 'start.lock'), 'wx', 0o600); await reservation.close();
      preparation.started = true; await writePrivateJson(join(root, 'import.json'), preparation);
      const controller = new AbortController(), state: RecordData = {
        state: 'running', phase: 'files', progress: 'Restoring selected files', sessions: [], warnings: preparation.preview.warnings,
        restoredDirectory: preparation.preview.restoredDirectory, restoredFileCount: 0, restoredFiles: [],
      };
      const persist = () => writePrivateJson(join(root, 'file-restoration-state.json'), state);
      await persist(); this.running.set(id, { controller, state });
      void (async () => {
        try {
          if (!samePath(await realpath(preparation.preview.directory), preparation.preview.directory)) throw new Error('The working directory changed after preview.');
          if (preparation.files.length) {
            const base = join(preparation.preview.directory, '.openchamber-imports');
            await privateDirectory(base); await mkdir(join(base, id), { mode: 0o700 });
            for (const [number, file] of preparation.files.entries()) {
              controller.signal.throwIfAborted();
              state.activeFile = file.destination; await persist();
              await pipeline(createReadStream(file.source), createWriteStream(file.destination, { flags: 'wx', mode: 0o600 }), { signal: controller.signal });
              await writePrivateJson(join(root, `restored-file-${number}.json`), { path: file.destination, completed: true });
              state.restoredFileCount++; if (state.restoredFiles.length < 25) state.restoredFiles.push(file.destination);
              delete state.activeFile; await persist();
            }
          }
          controller.signal.throwIfAborted();
          // Persist BEFORE dispatch: a lost response must not be mistaken for a
          // failure during file copies, which would hide native creations.
          state.phase = 'submitting'; state.progress = 'Submitting prepared sessions'; await persist();
          try { await client.request(`/imports/${id}/start`, 'POST', {}); state.phase = 'submitted'; }
          catch { state.progress = 'Submission acknowledgement lost; inspect the native job status. No request was replayed.'; }
          await persist();
        } catch (error) {
          if (state.phase === 'submitting' || state.phase === 'submitted') {
            // A local journal error after dispatch says nothing about whether
            // native sessions exist. Keep native status authoritative.
            state.journalWarning = 'The local submission journal could not be finalized. Native status must be inspected; no mutation was replayed.';
            try { await persist(); } catch { /* The native journal remains the outcome authority. */ }
          } else {
            state.state = controller.signal.aborted ? 'cancelled' : 'failed'; state.progress = 'File restoration stopped; source files were not changed';
            state.error = error instanceof Error ? error.message : 'File restoration failed.'; await persist();
          }
        } finally { this.running.delete(id); }
      })().catch(() => { this.running.delete(id); });
      return { ...state };
    } finally { this.starting.delete(id); }
  }
  async status(id: string): Promise<RecordData> {
    if (!UUID.test(id)) throw new Error('Invalid import identity.');
    if (this.running.has(id)) return { ...this.running.get(id)!.state };
    let client: PluginClient | undefined, location: JobLocation | undefined;
    if (this.journalDirectory) {
      try { location = await readJsonFile(join(this.journalDirectory, `${id}.json`), 8192); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    }
    try { client = await this.plugin(); } catch { /* A retained journal can be inspected without a live plugin. */ }
    location ??= client ? { jobRoot: join(client.root, 'jobs', id), instanceID: client.instanceID } : undefined;
    if (!location) throw new Error('No live plugin or retained locator is available for this job ID. Inspect the private bridge journals manually.');
    const { jobRoot } = location;
    let local: RecordData = {};
    try {
      local = await readJsonFile(join(jobRoot, 'file-restoration-state.json'), 256 * 1024);
    } catch { local.journalWarning = 'Local file-restoration status is unavailable or invalid; native results are checked independently.'; }
    let native: RecordData | undefined, live = false;
    if (client && client.instanceID === location.instanceID && join(client.root, 'jobs', id) === jobRoot) {
      try { native = await client.request(`/imports/${id}/status`); live = true; } catch { /* Read the durable journal without replaying its mutation. */ }
    }
    if (!native) {
      try { native = await readJsonFile(join(jobRoot, 'state.json'), 256 * 1024); }
      catch { /* A missing native journal is not proof that dispatch failed. */ }
    }
    if (native && !['prepared', 'preparing'].includes(native.state)) {
      if (!live && native.state === 'running') native = { ...native, state: 'failed', progress: 'The original plugin is unavailable. Inspect the recorded created/candidate IDs; no mutation was replayed.', uncertainSessions: native.inFlight?.phase === 'import' && !native.sessions?.includes(native.inFlight.sessionID) ? [native.inFlight.sessionID] : native.uncertainSessions };
      return { ...local, ...native, ...(!live && native.state === 'ready' ? { progress: 'Recorded completed import from the original plugin journal. Availability in the current instance has not been verified.' } : {}), offlineJournal: !live, journalPath: jobRoot };
    }
    if (local.phase === 'files' || (local.state === 'failed' || local.state === 'cancelled') && !['submitting', 'submitted'].includes(local.phase)) return { ...local, state: local.state === 'cancelled' ? 'cancelled' : 'failed', progress: 'File restoration stopped or was interrupted; inspect its journal and restored directory before another import.' };
    return { ...local, state: 'failed', progress: 'Submission outcome requires inspection; the native result is unavailable or still prepared. No automatic resubmission occurred.', uncertainJobID: id, journalPath: jobRoot };
  }
  async cancel(id: string): Promise<void> {
    if (!UUID.test(id)) throw new Error('Invalid import identity.');
    this.running.get(id)?.controller.abort();
    await (await this.plugin()).request(`/imports/${id}/cancel`, 'POST', {});
  }
  close(): void { for (const job of this.running.values()) job.controller.abort(); }
}

function safeExtension(name: string): string { return /\.[a-zA-Z0-9]{1,12}$/.exec(name)?.[0].toLowerCase() ?? '.bin'; }
function validName(name: string): boolean {
  return typeof name === 'string' && name.length <= 1024 && !/[\\:\u0000-\u001f\u007f]/.test(name) && !name.startsWith('/')
    && name.split('/').every(part => part && part !== '.' && part !== '..' && !/[. ]$/.test(part) && !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(part));
}

/** Extract to opaque private filenames, never to paths supplied by a ZIP member. */
async function extract(path: string, root: string, signal?: AbortSignal): Promise<Map<string, Extracted>> {
  const zip = await new Promise<ZipFile>((resolve, reject) => yauzl.open(path, { lazyEntries: true, autoClose: false, validateEntrySizes: true, strictFileNames: true }, (error, value) => error ? reject(error) : resolve(value!)));
  const entries = new Map<string, Extracted>(), names = new Map<string, boolean>(), directories = new Set<string>(); let expanded = 0, count = 0;
  try {
    await new Promise<void>((resolve, reject) => {
      zip.on('error', reject); zip.once('end', resolve);
      zip.on('entry', entry => { void (async () => {
        signal?.throwIfAborted();
        if (++count > MAX_ENTRIES || !validName(entry.fileName.replace(/\/$/, ''))) throw new Error('Unsafe ZIP entry name or too many entries.');
        const name = entry.fileName.replace(/\/$/, '').normalize('NFC').toLowerCase(), directory = entry.fileName.endsWith('/');
        if (names.has(name) || !directory && directories.has(name)) throw new Error('Duplicate or case-colliding ZIP entries.');
        const parts = name.split('/');
        for (let index = 1; index < parts.length; index++) {
          const parent = parts.slice(0, index).join('/');
          if (names.get(parent) === false) throw new Error('ZIP file/directory entry collision.');
          directories.add(parent);
        }
        names.set(name, directory);
        const mode = (entry.externalFileAttributes >>> 16) & 0o170000;
        if (entry.generalPurposeBitFlag & 1 || ![0, 0o100000, 0o040000].includes(mode) || ![0, 8].includes(entry.compressionMethod)) throw new Error('Encrypted, linked or unsupported ZIP entry.');
        if (entry.fileName.endsWith('/')) { zip.readEntry(); return; }
        expanded += entry.uncompressedSize;
        if (!Number.isSafeInteger(expanded) || expanded > MAX_EXPANDED_BYTES || entry.uncompressedSize > Math.max(1, entry.compressedSize) * 10000) throw new Error('ZIP expansion exceeds the documented 2 GiB or compression-ratio safety limit.');
        const space = await statfs(root);
        if (space.bavail * space.bsize < entry.uncompressedSize + 16 * 1024 * 1024) throw new Error('Not enough private staging space to expand this ZIP entry.');
        const input = await new Promise<NodeJS.ReadableStream>((resolve, reject) => zip.openReadStream(entry, (error, stream) => error ? reject(error) : resolve(stream!)));
        const target = join(root, `entry-${randomUUID()}`), hash = createHash('sha256'); let bytes = 0;
        const verifier = new Transform({ transform(chunk: Buffer, _encoding, next) {
          bytes += chunk.length;
          if (bytes > entry.uncompressedSize) { next(new Error('ZIP entry exceeds its declared size.')); return; }
          hash.update(chunk); next(null, chunk);
        } });
        await pipeline(input as any, verifier, createWriteStream(target, { flags: 'wx', mode: 0o600 }), { signal });
        if (bytes !== entry.uncompressedSize) throw new Error('Truncated ZIP entry.');
        entries.set(entry.fileName, { name: entry.fileName, path: target, size: bytes, sha256: hash.digest('hex') });
        zip.readEntry();
      })().catch(reject); });
      zip.readEntry();
    });
    return entries;
  } finally { zip.close(); }
}
