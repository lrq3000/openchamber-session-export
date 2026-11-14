import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, open, rename, rm, statfs } from 'node:fs/promises';
import { join } from 'node:path';
import { privateDirectory, readJsonFile, UUID, writePrivateJson } from './private-channel.js';

export const UPLOAD_CHUNK_BYTES = 32768;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 * 1024;
interface Upload { id: string; name: string; size: number; received: number; state: 'uploading' | 'ready' | 'cancelled'; updated: number; sha256?: string; last?: { offset: number; hash: string; length: number } }

/** Only opaque, extension-owned staging IDs cross the SDK boundary. */
export class UploadStore {
  private active = new Set<string>();
  constructor(readonly root: string) {}
  private directory(id: string): string { if (!UUID.test(id)) throw new Error('Invalid upload identity.'); return join(this.root, id); }
  private async load(id: string): Promise<Upload> {
    const upload = await readJsonFile(join(this.directory(id), 'state.json'), 8192) as Upload;
    if (upload.id !== id || Date.now() - upload.updated > 24 * 60 * 60 * 1000) throw new Error('This upload expired. Choose the ZIP again.');
    return upload;
  }
  async start(name: string, size: number): Promise<Upload> {
    if (typeof name !== 'string' || !name.toLowerCase().endsWith('.zip') || !Number.isSafeInteger(size) || size < 22 || size > MAX_UPLOAD_BYTES) throw new Error('Choose a ZIP between 22 bytes and 8 GiB.');
    await privateDirectory(this.root);
    const space = await statfs(this.root);
    if (space.bavail * space.bsize < size + 16 * 1024 * 1024) throw new Error('Not enough disk space to stage this upload.');
    const upload: Upload = { id: randomUUID(), name: name.slice(-255), size, received: 0, state: 'uploading', updated: Date.now() };
    const directory = this.directory(upload.id); await privateDirectory(directory);
    const file = await open(join(directory, 'archive.partial'), 'wx', 0o600); await file.close();
    await writePrivateJson(join(directory, 'state.json'), upload);
    return upload;
  }
  async chunk(id: string, offset: number, base64: string, sha256?: string): Promise<Upload> {
    if (this.active.has(id)) throw new Error('Another chunk for this upload is still being written.');
    this.active.add(id);
    try {
      const upload = await this.load(id);
      if (upload.state !== 'uploading' || !Number.isSafeInteger(offset) || typeof base64 !== 'string' || base64.length > 43692 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw new Error('Invalid upload chunk.');
      const bytes = Buffer.from(base64, 'base64'), hash = createHash('sha256').update(bytes).digest('hex');
      if (bytes.toString('base64') !== base64 || !bytes.length || bytes.length > UPLOAD_CHUNK_BYTES || sha256 !== undefined && sha256 !== hash) throw new Error('Upload chunk integrity check failed.');
      // A lost acknowledgement may resend the last block. Acknowledge identical
      // bytes without appending twice; all other out-of-order writes are refused.
      if (upload.last?.offset === offset && upload.last.hash === hash && upload.last.length === bytes.length) return upload;
      if (offset !== upload.received || offset + bytes.length > upload.size) throw new Error('Upload offset mismatch. Read the acknowledged offset before resuming.');
      const file = await open(join(this.directory(id), 'archive.partial'), 'r+');
      try {
        if ((await file.stat()).size < offset) throw new Error('The staged upload was truncated.');
        let written = 0;
        while (written < bytes.length) {
          const result = await file.write(bytes, written, bytes.length - written, offset + written);
          if (!result.bytesWritten) throw new Error('The upload write stopped making progress.');
          written += result.bytesWritten;
        }
        await file.sync();
      } finally { await file.close(); }
      upload.received += bytes.length; upload.updated = Date.now(); upload.last = { offset, hash, length: bytes.length };
      await writePrivateJson(join(this.directory(id), 'state.json'), upload); return upload;
    } finally { this.active.delete(id); }
  }
  async finish(id: string, expectedHash?: string): Promise<Upload> {
    if (this.active.has(id)) throw new Error('Wait for the current chunk to finish.');
    this.active.add(id);
    try {
      const upload = await this.load(id);
      if (upload.state === 'ready') return upload;
      if (upload.state !== 'uploading' || upload.received !== upload.size) throw new Error('The ZIP upload is incomplete.');
      const partial = join(this.directory(id), 'archive.partial'), finalized = join(this.directory(id), 'archive.zip');
      const finalMetadata = await lstat(finalized).catch(error => { if (error.code === 'ENOENT') return undefined; throw error; });
      // A crash can happen after rename and before the ready-state journal.
      // Re-hash that exact final file instead of requiring a vanished partial.
      const hash = createHash('sha256'), path = finalMetadata ? finalized : partial;
      const metadata = await lstat(path);
      if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size !== upload.size) throw new Error('The staged ZIP size does not match its upload declaration.');
      for await (const bytes of createReadStream(path)) hash.update(bytes);
      upload.sha256 = hash.digest('hex');
      if (expectedHash !== undefined && expectedHash !== upload.sha256) throw new Error('ZIP checksum mismatch.');
      if (!finalMetadata) await rename(path, finalized);
      upload.state = 'ready'; upload.updated = Date.now();
      await writePrivateJson(join(this.directory(id), 'state.json'), upload); return upload;
    } finally { this.active.delete(id); }
  }
  status(id: string): Promise<Upload> { return this.load(id); }
  async path(id: string): Promise<string> { if ((await this.load(id)).state !== 'ready') throw new Error('Finish uploading this ZIP first.'); return join(this.directory(id), 'archive.zip'); }
  async cancel(id: string): Promise<void> {
    if (this.active.has(id)) throw new Error('Wait for the current upload operation to finish before cancelling.');
    this.active.add(id);
    try {
      const upload = await this.load(id);
      // This directory was allocated by start(); never delete a path supplied by a client.
      if (upload.state === 'uploading') await rm(join(this.directory(id), 'archive.partial'), { force: true });
      upload.state = 'cancelled'; upload.updated = Date.now(); await writePrivateJson(join(this.directory(id), 'state.json'), upload);
    } finally { this.active.delete(id); }
  }
}
