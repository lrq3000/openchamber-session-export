import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { link, lstat, mkdir, mkdtemp, open, realpath, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import yazl from 'yazl';
import { MAX_TOTAL_FILE_BYTES, samePath } from './attachments.js';
import { CaptureStore } from './capture-store.js';
import { MarkdownRenderer } from './markdown.js';
import type { AssetCandidate, CaptureSnapshot, ExportOptions, RecordData, SessionRecord } from './types.js';

interface Entry { path: string; size: number; sha256: string; source: string }

/** Each entry is staged/hashed progressively; the archive manifest and evidence are never whole-chat JavaScript strings. */
export class ArchiveWriter {
  async write(capture: CaptureSnapshot, assets: AsyncIterable<AssetCandidate>, options: ExportOptions, directory: string): Promise<{ path: string; size: number; warnings: string[]; warningCount: number }> {
    await mkdir(directory, { recursive: true });
    const staging = await mkdtemp(join(directory, '.session-export-')), archive = new CaptureStore(staging), evidence = new CaptureStore(capture.root);
    const warnings = [...capture.warnings]; let warningCount = capture.warningCount;
    const warn = async (text: string) => { await archive.append('warnings', { text }); warningCount++; if (warnings.length < 25) warnings.push(text); };
    const selected = new Set(options.includeFiles ? options.selectedAssetIDs ?? [] : []);
    let selectedBytes = 0;
    for await (const asset of assets) {
      const decision: RecordData = { id: asset.id, path: asset.path, size: asset.size, selected: selected.has(asset.id), availability: asset.status, reason: asset.reason, sessionIndex: asset.sessionIndex, sessions: asset.sessions, status: selected.has(asset.id) ? 'pending' : asset.status === 'available' ? 'not-selected' : 'unavailable' };
      if (asset.status !== 'available' && !selected.has(asset.id)) await warn(`Unavailable ${asset.name}: ${asset.reason ?? asset.status}`);
      if (selected.has(asset.id)) {
        try {
          if (asset.status !== 'available' || !asset.fingerprint) throw new Error(asset.reason ?? 'The referenced file is unavailable.');
          if (selectedBytes + asset.size > MAX_TOTAL_FILE_BYTES) throw new Error('Selected files exceed the 500 MiB aggregate limit.');
          const entry = await this.asset(asset, staging);
          await archive.append('entries', entry); selectedBytes += entry.size;
          decision.status = 'included'; decision.archivePath = entry.path;
        } catch (error) {
          // A selected external file is optional. Do not disguise archive-staging disk errors as an unavailable source file.
          if (['ENOSPC', 'EDQUOT'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
          decision.status = 'omitted'; decision.reason = error instanceof Error ? error.message : 'File collection failed.';
          await warn(`Omitted ${asset.name}: ${decision.reason}`);
        }
      }
      await archive.append('decisions', decision);
    }
    await this.entry('conversation.md', this.markdown(capture, archive), archive);
    for await (const session of evidence.sessions(capture)) {
      const name = session.id === capture.target.sessionID ? 'session.json' : `subsessions/${session.id}.json`;
      async function* projected() { yield '{"info":'; yield* createReadStream(session.infoPath); yield ',"messages":'; yield* createReadStream(session.messagesPath); yield '}\n'; }
      await this.entry(name, projected(), archive);
      if (session.log.available && session.eventsPath) await this.entry(`events/${session.id}.jsonl`, createReadStream(session.eventsPath), archive);
    }
    // The manifest is deliberately not in its own checksum list.
    await this.entry('manifest.json', this.manifest(capture, archive, Boolean(options.includeFiles)), archive);
    const zip = new yazl.ZipFile(), partial = join(staging, 'archive.zip.partial');
    const output = zip.outputStream as Readable;
    zip.on('error', error => output.destroy(error));
    let failure: unknown;
    const completed = pipeline(output, createWriteStream(partial, { flags: 'wx', mode: 0o600 })).catch(error => { failure = error; });
    try {
      for await (const entry of archive.records<Entry>('entries', { required: true })) zip.addFile(entry.source, entry.path, { mode: 0o100600 });
      zip.end(); await completed; if (failure) throw failure;
    } catch (error) { output.destroy(); await completed; throw error; }
    const slug = String(capture.target.title ?? 'session').normalize('NFKC').replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0, 60) || 'session';
    const destination = options.outputFile ?? join(directory, `${slug}-${capture.target.sessionID}-${randomUUID()}.zip`);
    // Exclusive publication cannot overwrite another archive. Failed/private staging is retained for manual cleanup.
    await link(partial, destination);
    return { path: destination, size: (await stat(destination)).size, warnings, warningCount };
  }

  private async entry(name: string, content: AsyncIterable<string | Uint8Array>, archive: CaptureStore): Promise<void> {
    const source = join(archive.root, `entry-${randomUUID()}`), digest = createHash('sha256'); let size = 0;
    const hash = new Transform({ transform(chunk: Buffer, _encoding, callback) { size += chunk.length; digest.update(chunk); callback(null, chunk); } });
    await pipeline(Readable.from(content, { objectMode: false }), hash, createWriteStream(source, { flags: 'wx', mode: 0o600 }));
    await archive.append('entries', { path: name, size, sha256: digest.digest('hex'), source });
  }

  private async asset(asset: AssetCandidate, staging: string): Promise<Entry> {
    const metadata = await lstat(asset.path);
    if (metadata.isSymbolicLink() || !metadata.isFile() || !samePath(await realpath(asset.path), asset.path)) throw new Error('The referenced file changed or is a symbolic link.');
    const file = await open(asset.path, 'r');
    try {
      const before = await file.stat();
      const matches = (value: typeof before) => Object.entries(asset.fingerprint!).every(([key, expected]) => value[key as keyof typeof value] === expected);
      if (!matches(before)) throw new Error('The file changed after its preview.');
      const source = join(staging, `asset-${asset.id}`), digest = createHash('sha256'); let copied = 0;
      const hash = new Transform({ transform(chunk: Buffer, _encoding, callback) {
        copied += chunk.length;
        if (copied > asset.size) return callback(new Error('The file grew during collection.'));
        digest.update(chunk); callback(null, chunk);
      } });
      await pipeline(file.createReadStream({ autoClose: false }), hash, createWriteStream(source, { flags: 'wx', mode: 0o600 }));
      if (!matches(await file.stat()) || copied !== asset.size) throw new Error('The file changed during collection.');
      const name = asset.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || 'attachment';
      return { path: `assets/${asset.id}-${name}`, size: copied, sha256: digest.digest('hex'), source };
    } finally { await file.close(); }
  }

  private async *markdown(capture: CaptureSnapshot, archive: CaptureStore): AsyncGenerator<string> {
    yield* new MarkdownRenderer().render(capture);
    let first = true;
    for await (const item of archive.records<RecordData>('decisions')) {
      if (first) { yield '\n## Referenced local files\n\n'; first = false; }
      yield item.archivePath ? `- [${item.id}](${item.archivePath}) — ${item.size} bytes\n` : `- ${item.id}: ${item.status}${item.reason ? ` — ${item.reason}` : ''}\n`;
    }
    for await (const warning of archive.records<{ text: string }>('warnings')) yield `\n> Asset warning: ${warning.text.replace(/[\r\n<>]/g, ' ')}\n`;
  }

  private async *manifest(capture: CaptureSnapshot, archive: CaptureStore, includeFiles: boolean): AsyncGenerator<string> {
    const evidence = new CaptureStore(capture.root);
    let stable = true; for await (const session of evidence.sessions(capture)) if (session.active !== false || session.changed) stable = false;
    yield JSON.stringify({ schema: 'openchamber-session-export/1', version: '0.3.0', target: capture.target, startedAt: capture.startedAt, endedAt: capture.endedAt, serverVersion: capture.serverVersion, source: 'OpenCode v2 projected message pages and optional durable log; not the native settled-only transfer export' }).slice(0, -1);
    yield `,"coverage":{"hiddenReasoning":"not available","providerWireTraffic":"not captured","atomic":false,"observedStable":${stable},"logs":[`;
    let comma = false;
    for await (const session of evidence.sessions(capture)) { if (comma) yield ','; comma = true; yield JSON.stringify({ sessionID: session.id, ...session.log }); }
    yield ']},"sessions":['; comma = false;
    for await (const session of evidence.sessions(capture)) {
      if (comma) yield ','; comma = true;
      yield JSON.stringify({ id: session.id, parentID: session.parentID, messages: session.messageCount, active: session.active, changed: session.changed });
    }
    yield `],"assets":{"collectionEnabled":${includeFiles},"inspected":${includeFiles},"decisions":[`; comma = false;
    for await (const decision of archive.records<RecordData>('decisions')) {
      if (comma) yield ','; comma = true;
      const { sessionIndex, sessions, ...visible } = decision;
      yield JSON.stringify(visible).slice(0, -1); yield ',"sessions":[';
      let originComma = false;
      if (sessionIndex) for await (const origin of evidence.records<{ sessionID: string }>(sessionIndex)) { if (originComma) yield ','; originComma = true; yield JSON.stringify(origin.sessionID); }
      else for (const id of sessions ?? []) { if (originComma) yield ','; originComma = true; yield JSON.stringify(id); }
      yield ']}';
    }
    yield ']},"warnings":['; comma = false;
    for (const store of [evidence, archive]) for await (const warning of store.records<{ text: string }>('warnings')) { if (comma) yield ','; comma = true; yield JSON.stringify(warning.text); }
    yield '],"checksumScope":"All entries except manifest.json itself; SHA-256 of uncompressed bytes.","entries":['; comma = false;
    for await (const item of archive.records<Entry>('entries')) { if (comma) yield ','; comma = true; const { source: _source, ...entry } = item; yield JSON.stringify(entry); }
    yield ']}\n';
  }
}
