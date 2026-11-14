import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { lstat, mkdir, readFile, realpath, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

export interface BridgeDescriptor { schema: 1; hostPID: number; pid: number; instanceID: string; packageKey: string; port: number; token: string; version: string }
export const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const exec = promisify(execFile);

export async function channelPath(packageDirectory: string, hostPID = process.ppid, home = homedir()): Promise<{ root: string; packageKey: string }> {
  if (!Number.isInteger(hostPID) || hostPID <= 0) throw new Error('A managed host process identity is required.');
  const canonical = await realpath(packageDirectory);
  const packageKey = createHash('sha256').update(process.platform === 'win32' ? canonical.toLowerCase() : canonical).digest('hex');
  return { root: join(home, '.openchamber-session-export', 'bridges', packageKey, String(hostPID)), packageKey };
}

/** A descriptor contains a capability. Never place it in package assets or a world-readable temp folder. */
export async function privateDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const metadata = await lstat(directory);
  const canonical = resolve(await realpath(directory)), supplied = resolve(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || (process.platform === 'win32' ? canonical.toLowerCase() !== supplied.toLowerCase() : canonical !== supplied)) throw new Error('The private transfer directory is not a regular canonical directory.');
  if (process.platform !== 'win32') {
    if (metadata.uid !== process.getuid?.() || (metadata.mode & 0o077) !== 0) throw new Error('The private transfer directory must belong to this user and have mode 0700.');
  } else {
    // mode:0700 does not set Windows DACLs. Replace inheritance with a grant to the current SID; the path is passed as data, never interpolated into code.
    // Persist only the modified Owner/Access sections: PowerShell 5.1's Set-Acl provider can request Audit privileges again once a directory's DACL is protected.
    const script = "$ErrorActionPreference='Stop';$p=$env:SESSION_EXPORT_PRIVATE_DIR;$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User;$a=New-Object Security.AccessControl.DirectorySecurity;$a.SetOwner($sid);$a.SetAccessRuleProtection($true,$false);$r=New-Object Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow');$a.AddAccessRule($r);[System.IO.Directory]::SetAccessControl($p,$a)";
    await exec('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], {
      windowsHide: true, timeout: 10000, env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, SESSION_EXPORT_PRIVATE_DIR: directory },
    });
  }
}

export async function writePrivateJson(path: string, value: unknown): Promise<void> {
  const temporary = `${path}.${randomUUID()}.partial`;
  await writeFile(temporary, JSON.stringify(value), { flag: 'wx', mode: 0o600 });
  await rename(temporary, path);
}

export async function readJsonFile(path: string, limit: number): Promise<any> {
  const metadata = await lstat(path);
  if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size > limit) throw new Error('A transfer control file is unsafe or exceeds its documented size limit.');
  return JSON.parse(await readFile(path, 'utf8'));
}
