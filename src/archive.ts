import { createHash, randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { link, lstat, mkdir, mkdtemp, open, realpath, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import yazl from 'yazl';
import { MAX_TOTAL_FILE_BYTES, samePath } from './attachments.js';
import { MarkdownRenderer } from './markdown.js';
import type { AssetCandidate, Capture, ExportOptions, RecordData } from './types.js';

/** Stage evidence before ZIP publication. The final name is created exclusively, never by an overwriting rename. */
export class ArchiveWriter {
  async write(capture: Capture, assets: AssetCandidate[], options: ExportOptions, directory: string): Promise<{ path: string; size: number; warnings: string[] }> {
    await mkdir(directory, { recursive: true });
    const staging = await mkdtemp(join(directory, '.session-export-'));
    const warnings = [...capture.warnings], entries: { path: string; size: number; sha256: string; source: string }[] = [];
    const decisions: RecordData[] = [];
    const text = async (name: string, value: string) => {
      const source = join(staging, `entry-${entries.length}`);
      await writeFile(source, value, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
      entries.push({ path: name, size: Buffer.byteLength(value), sha256: createHash('sha256').update(value).digest('hex'), source });
    };
    const selected = new Set(options.includeFiles ? options.selectedAssetIDs ?? [] : []);
    let selectedBytes = 0;
    for (const asset of assets) {
      const decision: RecordData = { id: asset.id, path: asset.path, size: asset.size, selected: selected.has(asset.id), availability: asset.status, reason: asset.reason, status: selected.has(asset.id) ? 'pending' : asset.status === 'available' ? 'not-selected' : 'unavailable' };
      decisions.push(decision);
      if (asset.status !== 'available' && !selected.has(asset.id)) warnings.push(`Unavailable ${asset.name}: ${asset.reason ?? asset.status}`);
      if (!selected.has(asset.id)) continue;
      try {
        if (asset.status !== 'available' || !asset.fingerprint) throw new Error(asset.reason ?? 'The referenced file is unavailable.');
        if (selectedBytes + asset.size > MAX_TOTAL_FILE_BYTES) throw new Error('Selected files exceed the 500 MiB aggregate limit.');
        const metadata = await lstat(asset.path);
        if (metadata.isSymbolicLink() || !metadata.isFile() || !samePath(await realpath(asset.path), asset.path)) throw new Error('The referenced file changed or is a symbolic link.');
        const file = await open(asset.path, 'r');
        try {
          const before = await file.stat();
          const matches = (value: typeof before) => Object.entries(asset.fingerprint!).every(([key, expected]) => value[key as keyof typeof value] === expected);
          if (!matches(before)) throw new Error('The file changed after its preview.');
          const source = join(staging, `asset-${asset.id}`), digest = createHash('sha256');
          let copied = 0;
          const hash = new Transform({ transform(chunk, _encoding, callback) {
            copied += chunk.length;
            if (copied > asset.size) return callback(new Error('The file grew during collection.'));
            digest.update(chunk); callback(null, chunk);
          } });
          await pipeline(file.createReadStream({ autoClose: false }), hash, createWriteStream(source, { flags: 'wx', mode: 0o600 }));
          if (!matches(await file.stat()) || copied !== asset.size) throw new Error('The file changed during collection.');
          const extension = asset.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || 'attachment';
          const name = `assets/${asset.id}-${extension}`;
          entries.push({ path: name, size: copied, sha256: digest.digest('hex'), source });
          selectedBytes += copied; decision.status = 'included'; decision.archivePath = name;
        } finally { await file.close(); }
      } catch (error) {
        decision.status = 'omitted'; decision.reason = error instanceof Error ? error.message : 'File collection failed.';
        warnings.push(`Omitted ${asset.name}: ${decision.reason}`);
      }
    }
    let markdown = new MarkdownRenderer().render(capture);
    if (decisions.length) markdown += '\n## Referenced local files\n\n' + decisions.map(item => item.archivePath ? `- [${item.id}](${item.archivePath}) — ${item.size} bytes` : `- ${item.id}: ${item.status}${item.reason ? ` — ${item.reason}` : ''}`).join('\n') + '\n';
    for (const warning of warnings.filter(item => !capture.warnings.includes(item))) markdown += `\n> Asset warning: ${warning.replace(/[\r\n<>]/g, ' ')}\n`;
    await text('conversation.md', markdown);
    for (const session of capture.sessions) {
      const name = session.info.id === capture.target.sessionID ? 'session.json' : `subsessions/${session.info.id}.json`;
      await text(name, JSON.stringify({ info: session.info, messages: session.messages }, null, 2) + '\n');
      if (session.log.available) await text(`events/${session.info.id}.jsonl`, session.events.map(event => JSON.stringify(event)).join('\n') + '\n');
    }
    const manifest = {
      schema: 'openchamber-session-export/1', version: '0.1.0',
      target: capture.target, startedAt: capture.startedAt, endedAt: capture.endedAt, serverVersion: capture.serverVersion,
      source: 'OpenCode v2 projected message pages and optional durable log; not the native settled-only transfer export',
      coverage: { hiddenReasoning: 'not available', providerWireTraffic: 'not captured', atomic: false, observedStable: capture.sessions.every(session => session.active === false && !session.changed), logs: capture.sessions.map(session => ({ sessionID: session.info.id, ...session.log })) },
      sessions: capture.sessions.map(session => ({ id: session.info.id, parentID: session.info.parentID, messages: session.messages.length, active: session.active, changed: session.changed })),
      assets: { collectionEnabled: Boolean(options.includeFiles), inspected: Boolean(options.includeFiles), decisions }, warnings,
      checksumScope: 'All entries except manifest.json itself; SHA-256 of uncompressed bytes.',
      entries: entries.map(({ source: _source, ...entry }) => entry),
    };
    await text('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
    const zip = new yazl.ZipFile();
    for (const entry of entries) zip.addFile(entry.source, entry.path, { mode: 0o100600 });
    const partial = join(staging, 'archive.zip.partial');
    const completed = pipeline(zip.outputStream, createWriteStream(partial, { flags: 'wx', mode: 0o600 }));
    zip.end(); await completed;
    const slug = String(capture.target.title ?? 'session').normalize('NFKC').replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0, 60) || 'session';
    const destination = join(directory, `${slug}-${capture.target.sessionID}-${randomUUID()}.zip`);
    // A hard-link publication is atomic and fails if the destination exists. Staging is intentionally retained for manual cleanup.
    await link(partial, destination);
    return { path: destination, size: (await stat(destination)).size, warnings };
  }
}
