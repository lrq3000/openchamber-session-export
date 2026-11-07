import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { lstat, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { Connection } from './opencode.js';

/** Discover only the HTTP proxy owned by the process that launched this extension service. */
export class ConnectionResolver {
  constructor(private options: { settingsPath?: string; ownerPID?: number; portOwner?: (port: number) => Promise<number> } = {}) {}

  async resolve(): Promise<Connection> {
    const settings = this.options.settingsPath ?? join(homedir(), '.config', 'openchamber', 'settings.json');
    const metadata = await lstat(settings);
    if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size > 2 * 1024 * 1024) throw new Error('The local OpenChamber settings file cannot be safely inspected.');
    let port: unknown;
    try { ({ desktopLocalPort: port } = JSON.parse(await readFile(settings, 'utf8'))); }
    catch { throw new Error('The local OpenChamber settings file is not valid JSON.'); }
    if (typeof port !== 'number' || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('No supported local OpenChamber proxy is configured.');
    const owner = await (this.options.portOwner ?? portOwner)(port);
    if (owner !== (this.options.ownerPID ?? process.ppid)) throw new Error('The configured proxy is not owned by the OpenChamber process that launched this service.');
    const url = `http://127.0.0.1:${port}`;
    const request = async (path: string) => {
      const result = await fetch(url + path, { redirect: 'error', signal: AbortSignal.timeout(5000), cache: 'no-store' });
      if (!result.ok) { await result.body?.cancel(); throw new Error(result.status === 401 ? 'AUTH_REQUIRED: the local proxy requires UI authentication.' : 'The owning OpenChamber proxy is unavailable.'); }
      const text = await result.text();
      if (text.length > 1024 * 1024) throw new Error('Unexpected discovery response size.');
      return JSON.parse(text);
    };
    const auth = await request('/auth/session');
    if (auth.disabled !== true || auth.authenticated !== true) throw new Error('AUTH_REQUIRED: UI authentication is enabled. This extension does not inherit or extract UI credentials.');
    const info = await request('/api/info');
    const version = info.version ?? info.data?.version;
    if (typeof version !== 'string' || !/^2\./.test(version)) throw new Error('The owning proxy is not a compatible OpenCode v2 instance.');
    return { url, version };
  }
}

async function portOwner(port: number): Promise<number> {
  if (process.platform !== 'win32') throw new Error('Automatic proxy-owner verification is currently supported on Windows only.');
  // This queries one known port, not a listener scan. The interpolated value has already passed integer/range validation.
  const script = `ConvertTo-Json -Compress -InputObject @(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction Stop | Select-Object -ExpandProperty OwningProcess -Unique)`;
  const { stdout } = await promisify(execFile)('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { windowsHide: true, timeout: 10000, maxBuffer: 16384 });
  const owners = JSON.parse(stdout.trim());
  if (!Array.isArray(owners) || owners.length !== 1 || !Number.isInteger(owners[0])) throw new Error('The local proxy has no unambiguous owning process.');
  return owners[0];
}
