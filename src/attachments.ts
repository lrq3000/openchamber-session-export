import { createHash } from 'node:crypto';
import { lstat, realpath } from 'node:fs/promises';
import { basename, isAbsolute, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AssetCandidate, Capture, RecordData } from './types.js';

export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_TOTAL_FILE_BYTES = 500 * 1024 * 1024;

/** References are evidence, not executable instructions. In particular, arbitrary absolute paths in prose are not attachments. */
export class AttachmentInventory {
  async discover(capture: Capture): Promise<AssetCandidate[]> {
    const found = new Map<string, Set<string>>();
    for (const session of capture.sessions) {
      const directory = String(session.info.location?.directory ?? capture.target.directory);
      const add = (value: unknown) => {
        const path = localPath(value, directory);
        if (!path) return;
        const sessions = found.get(path) ?? new Set<string>();
        sessions.add(String(session.info.id)); found.set(path, sessions);
      };
      const images = (text: unknown) => {
        if (typeof text !== 'string') return;
        for (const match of text.matchAll(/!\[[^\]]*\]\((?:<([^>]+)>|([^\r\n)]+))\)/g)) add((match[1] ?? match[2]).replace(/\s+["'][^"']*["']$/, ''));
      };
      for (const message of session.messages) {
        images(message.text);
        for (const file of message.files ?? []) {
          add(file.source?.path); add(file.source?.uri); add(file.uri);
        }
        for (const content of message.content ?? []) {
          images(content.text);
          if (content.type === 'file') add(content.uri);
          if (content.type !== 'tool') continue;
          for (const output of content.state?.content ?? []) {
            if (output.type === 'file') add(output.uri);
            if (output.type !== 'text') continue;
            images(output.text);
            // Host-truncated results explicitly identify an artifact; generic read/shell inputs do not.
            for (const match of String(output.text).matchAll(/full output saved to\s+([^\r\n\]]+)/gi)) add(match[1].trim());
            if (/image|render|screenshot/i.test(String(content.name))) {
              try { this.generated(JSON.parse(output.text), add); } catch { /* Plain prose is not a structured artifact result. */ }
            }
          }
        }
      }
    }
    return Promise.all([...found].map(async ([path, sessions]) => {
      const candidate: AssetCandidate = { id: createHash('sha256').update(path).digest('hex').slice(0, 24), path, name: basename(path), sessions: [...sessions], size: 0, status: 'available' };
      try {
        const stat = await lstat(path);
        candidate.size = stat.size;
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
    }));
  }

  private generated(value: unknown, add: (path: unknown) => void): void {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { for (const entry of value) this.generated(entry, add); return; }
    for (const [key, entry] of Object.entries(value as RecordData)) {
      if (['path', 'file_path', 'filepath', 'saved_path'].includes(key)) add(entry);
      else if (['paths', 'images', 'files'].includes(key) && Array.isArray(entry)) for (const item of entry) { if (typeof item === 'string') add(item); else this.generated(item, add); }
      else if (entry && typeof entry === 'object') this.generated(entry, add);
    }
  }
}

export function samePath(a: string, b: string): boolean {
  const normalized = (value: string) => process.platform === 'win32' ? normalize(value).toLowerCase() : normalize(value);
  return normalized(a) === normalized(b);
}

export function localPath(value: unknown, directory: string): string | undefined {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0')) return;
  let path = value.trim();
  if (/^file:/i.test(path)) {
    try { const url = new URL(path); if (url.host && url.host !== 'localhost') return; path = fileURLToPath(url); } catch { return; }
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(path) && !/^[a-z]:[\\/]/i.test(path)) return;
  if (/^[\\/]{2}/.test(path)) return;
  return isAbsolute(path) ? resolve(path) : resolve(directory, path);
}
