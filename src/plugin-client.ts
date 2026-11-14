import { lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { channelPath, readJsonFile, UUID, type BridgeDescriptor } from './private-channel.js';
import type { Connection } from './opencode.js';
import type { RecordData } from './types.js';

/** A private plugin capability is backend-only; it is never returned through the SDK. */
export class PluginClient {
  private constructor(readonly root: string, private descriptor: BridgeDescriptor) {}
  static async connect(packageDirectory: string, hostPID = process.ppid, home?: string): Promise<PluginClient> {
    const { root, packageKey } = await channelPath(packageDirectory, hostPID, home);
    const directory = await lstat(root);
    if (!directory.isDirectory() || directory.isSymbolicLink() || process.platform !== 'win32' && (directory.uid !== process.getuid?.() || (directory.mode & 0o077))) throw new Error('The bundled plugin channel is not private.');
    const descriptor = await readJsonFile(join(root, 'connection.json'), 8192) as BridgeDescriptor;
    if (descriptor.schema !== 1 || descriptor.hostPID !== hostPID || descriptor.packageKey !== packageKey || !UUID.test(descriptor.instanceID)
      || !Number.isInteger(descriptor.port) || descriptor.port < 1 || descriptor.port > 65535 || !/^[a-f0-9]{64}$/.test(descriptor.token)) throw new Error('The bundled plugin belongs to a different or unsupported host instance.');
    const client = new PluginClient(root, descriptor), identity = await client.request('/identity');
    if (identity.instanceID !== descriptor.instanceID || identity.pid !== descriptor.pid || identity.hostPID !== hostPID) throw new Error('The bundled plugin process changed. Prepare the operation again.');
    return client;
  }
  connection(): Connection { return { url: `http://127.0.0.1:${this.descriptor.port}`, token: this.descriptor.token, version: this.descriptor.version }; }
  get instanceID(): string { return this.descriptor.instanceID; }
  async request(path: string, method = 'GET', body?: unknown): Promise<RecordData> {
    const response = await fetch(this.connection().url + path, {
      method, redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${this.descriptor.token}`, 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    if (Buffer.byteLength(text) > 1024 * 1024) throw new Error('Plugin metadata exceeded its safety limit.');
    let value: RecordData; try { value = text ? JSON.parse(text) : {}; } catch { throw new Error('The bundled plugin returned invalid metadata.'); }
    if (!response.ok) throw new Error(value.error ?? `The bundled plugin returned HTTP ${response.status}.`);
    return value;
  }
}
