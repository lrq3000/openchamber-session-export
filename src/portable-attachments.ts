import { readFile, stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { MAX_IMPORT_JSON_BYTES, portableFileKey, type PortableSession } from './portable-session.js';
import type { RecordData } from './types.js';

const mimeTypes: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.pdf': 'application/pdf', '.txt': 'text/plain', '.md': 'text/markdown' };

/** Legacy projected attachments sometimes contain only a path, but native import requires bytes. */
export async function hydrateAttachments(sources: PortableSession[], contents: Map<string, string>, destinations: Map<string, string>, sourceBytes: number): Promise<void> {
  const index = new Map([...contents].map(([source, path]) => [portableFileKey(source), { source, path }]));
  let budget = sourceBytes;
  const hydrate = async (file: RecordData) => {
    if (file.type === 'text') return;
    let reference = file.source?.path;
    const uri = file.source?.uri ?? file.uri;
    if (!reference && typeof uri === 'string' && index.has(portableFileKey(uri))) reference = uri;
    if (!reference && typeof uri === 'string' && uri.startsWith('file:')) {
      const url = new URL(uri);
      if (url.host && url.host !== 'localhost') throw new Error('Network attachment references are not restored.');
      reference = decodeURIComponent(url.pathname);
    }
    const entry = typeof reference === 'string' ? index.get(portableFileKey(reference)) : undefined;
    if (typeof file.data !== 'string') {
      if (!entry) throw new Error('An attachment has no embedded bytes or selected archived file. Export it with that file selected; no source path or remote URL will be read during import.');
      const size = (await stat(entry.path)).size, encodedSize = Math.ceil(size / 3) * 4;
      if (budget + encodedSize > MAX_IMPORT_JSON_BYTES) throw new Error('Hydrated attachments exceed the 64 MiB import JSON safety budget.');
      budget += encodedSize; file.data = (await readFile(entry.path)).toString('base64');
    }
    if (typeof file.mime !== 'string') file.mime = mimeTypes[extname(String(file.name ?? reference ?? '')).toLowerCase()] ?? 'application/octet-stream';
    if (entry) file.source = { type: 'uri', uri: pathToFileURL(destinations.get(entry.source)!).href };
    else if (!['uri', 'inline'].includes(file.source?.type)) file.source = { type: 'inline' };
  };
  for (const source of sources) for (const message of source.messages) {
    for (const file of message.files ?? []) await hydrate(file);
  }
}
