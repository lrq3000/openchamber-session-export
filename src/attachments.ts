import { createHash, randomUUID } from 'node:crypto';
import { lstat, realpath } from 'node:fs/promises';
import { basename, isAbsolute, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CaptureStore } from './capture-store.js';
import { JsonDocument, type JsonPath } from './json-stream.js';
import type { AssetCandidate, CaptureSnapshot, SessionRecord } from './types.js';

export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_TOTAL_FILE_BYTES = 500 * 1024 * 1024;

/** Optional discovery scans captured evidence, never arbitrary filesystem trees. Candidates and all origin identities stay on disk. */
export class AttachmentInventory {
  async *discover(capture: CaptureSnapshot): AsyncGenerator<AssetCandidate> {
    const store = new CaptureStore(capture.root);
    for await (const session of store.sessions(capture)) {
      const info = new JsonDocument(session.infoPath);
      const directory = String(await info.scalar(['location', 'directory']) ?? capture.target.directory);
      for await (const message of store.messages(session)) {
        for await (const reference of this.references(new JsonDocument(message.path), store)) {
          const path = localPath(reference, directory); if (!path) continue;
          const id = createHash('sha256').update(path).digest('hex').slice(0, 24), sessionIndex = `asset-origins-${id}`;
          if (await store.claim('assets', path)) await store.append('discovered-assets', { ...await this.inspect(path, id), sessionIndex });
          if (await store.claim(`asset-origin-${id}`, session.id)) await store.append(sessionIndex, { sessionID: session.id });
        }
      }
    }
    for await (const asset of store.records<AssetCandidate>('discovered-assets')) {
      let count = 0; for await (const _ of store.records(asset.sessionIndex!)) count++;
      yield { ...asset, sourceSessionCount: count };
    }
  }

  private async inspect(path: string, id: string): Promise<AssetCandidate> {
    const candidate: AssetCandidate = { id, path, name: basename(path), sessions: [], size: 0, status: 'available' };
    try {
      const stat = await lstat(path); candidate.size = stat.size;
      if (!stat.isFile() || stat.isSymbolicLink() || !samePath(await realpath(path), path)) {
        candidate.status = 'refused'; candidate.reason = 'Only regular files without symbolic-link ancestors may be collected.';
      } else if (stat.size > MAX_FILE_BYTES) {
        candidate.status = 'refused'; candidate.reason = 'File exceeds the 100 MiB per-file limit.';
      } else candidate.fingerprint = { dev: stat.dev, ino: stat.ino, size: stat.size, mtimeMs: stat.mtimeMs };
    } catch (error) {
      candidate.status = (error as NodeJS.ErrnoException).code === 'ENOENT' ? 'missing' : 'refused';
      candidate.reason = candidate.status === 'missing' ? 'The referenced file is unavailable.' : 'The referenced file cannot be inspected.';
    }
    return candidate;
  }

  private async *references(message: JsonDocument, store: CaptureStore): AsyncGenerator<string> {
    if (await message.kind(['text']) === 'string') yield* this.inText(message.text(['text']));
    if (await message.kind(['files']) === 'array') for await (const file of message.array(['files'], join(store.root, 'attachment-records'))) {
      for (const path of [['source', 'path'], ['source', 'uri'], ['uri']]) yield* this.smallString(file, path);
    }
    if (await message.kind(['content']) !== 'array') return;
    for await (const content of message.array(['content'], join(store.root, 'attachment-parts'))) {
      if (await content.kind(['text']) === 'string') yield* this.inText(content.text(['text']));
      const type = await content.scalar(['type']);
      if (type === 'file') yield* this.smallString(content, ['uri']);
      if (type !== 'tool' || await content.kind(['state', 'content']) !== 'array') continue;
      const generated = /image|render|screenshot/i.test(String(await content.scalar(['name']) ?? ''));
      for await (const output of content.array(['state', 'content'], join(store.root, 'attachment-output'))) {
        const kind = await output.scalar(['type']);
        if (kind === 'file') yield* this.smallString(output, ['uri']);
        if (kind !== 'text' || await output.kind(['text']) !== 'string') continue;
        yield* this.inText(output.text(['text']));
        if (!generated) continue;
        try {
          const document = await JsonDocument.capture(output.text(['text']), join(store.root, `generated-${randomUUID()}.json`));
          yield* document.stringsWhere(path => {
            const key = path.at(-1), parent = path.at(-2);
            return typeof key === 'string' && ['path', 'file_path', 'filepath', 'saved_path'].includes(key) || typeof key === 'number' && typeof parent === 'string' && ['paths', 'images', 'files'].includes(parent);
          });
        } catch (error) {
          if (typeof (error as NodeJS.ErrnoException).code === 'string') throw error;
          // Unstructured prose is not a structured generated-artifact result. The original text is still captured.
        }
      }
    }
  }

  private async *smallString(document: JsonDocument, path: JsonPath): AsyncGenerator<string> {
    if (await document.kind(path) !== 'string') return;
    let text = '', bytes = 0;
    for await (const chunk of document.text(path)) {
      bytes += Buffer.byteLength(chunk); if (bytes > 4096) return;
      text += chunk;
      if (/^(data|https?):/i.test(text)) return;
    }
    if (text) yield text;
  }

  /** Bounded reference recognition across text chunks; large prose/embedded data is never assembled. */
  private async *inText(source: AsyncIterable<string>): AsyncGenerator<string> {
    let pending = '';
    const scan = function* (text: string, final: boolean) {
      for (const match of text.matchAll(/!\[[^\]]*\]\((?:<([^>]+)>|([^\r\n)]+))\)/g)) yield (match[1] ?? match[2]).replace(/\s+["'][^"']*["']$/, '');
      const artifact = final ? /full output saved to\s+([^\r\n\]]+)(?:\r?\n|\]|$)/gi : /full output saved to\s+([^\r\n\]]+)(?:\r?\n|\])/gi;
      for (const match of text.matchAll(artifact)) yield match[1].trim();
    };
    for await (const chunk of source) {
      pending += chunk;
      // Repeated matches are deduplicated on disk. The overlap retains path-sized tokens; unfinished artifact lines wait for EOF.
      yield* scan(pending, false);
      if (pending.length > 16384) pending = pending.slice(-8192);
    }
    yield* scan(pending, true);
  }
}

export function samePath(a: string, b: string): boolean {
  const normalized = (value: string) => process.platform === 'win32' ? normalize(value).toLowerCase() : normalize(value);
  return normalized(a) === normalized(b);
}

export function localPath(value: unknown, directory: string): string | undefined {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0') || value.length > 4096) return;
  let path = value.trim();
  if (/^file:/i.test(path)) {
    try { const url = new URL(path); if (url.host && url.host !== 'localhost') return; path = fileURLToPath(url); } catch { return; }
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(path) && !/^[a-z]:[\\/]/i.test(path)) return;
  if (/^[\\/]{2}/.test(path)) return;
  return isAbsolute(path) ? resolve(path) : resolve(directory, path);
}
