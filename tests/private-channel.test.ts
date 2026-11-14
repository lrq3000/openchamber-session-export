import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { privateDirectory } from '../src/private-channel.js';
import { temporary } from './fixtures.js';

const exec = promisify(execFile);

/** Read only Owner/Access: testing privacy must not itself require permission to inspect the audit SACL. */
async function assertPrivateAccess(directory: string, inherited = false): Promise<void> {
  if (process.platform !== 'win32') {
    const metadata = await stat(directory);
    assert.equal(metadata.uid, process.getuid!());
    assert.equal(metadata.mode & 0o777, 0o700);
    return;
  }
  const script = "$ErrorActionPreference='Stop';$sections=[Security.AccessControl.AccessControlSections]::Owner -bor [Security.AccessControl.AccessControlSections]::Access;$a=[IO.Directory]::GetAccessControl($env:SESSION_EXPORT_PRIVATE_DIR,$sections);[pscustomobject]@{owner=$a.GetOwner([Security.Principal.SecurityIdentifier]).Value;current=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value;protected=$a.AreAccessRulesProtected;rules=@($a.GetAccessRules($true,$true,[Security.Principal.SecurityIdentifier])|ForEach-Object{[pscustomobject]@{sid=$_.IdentityReference.Value;rights=[int]$_.FileSystemRights;type=$_.AccessControlType.ToString();inheritance=[int]$_.InheritanceFlags;propagation=[int]$_.PropagationFlags;inherited=$_.IsInherited}})}|ConvertTo-Json -Depth 4 -Compress";
  const result = await exec('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], {
    windowsHide: true, timeout: 10000, env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, SESSION_EXPORT_PRIVATE_DIR: directory },
  });
  const acl = JSON.parse(result.stdout);
  assert.equal(acl.owner, acl.current);
  assert.equal(acl.protected, !inherited);
  assert.deepEqual(acl.rules, [{ sid: acl.current, rights: 2032127, type: 'Allow', inheritance: 3, propagation: 0, inherited }]);
}

test('private directories retain owner-only access across repeated hardening and child creation', { timeout: 30000 }, async () => {
  const directory = join(await temporary('private-acl'), 'private café 🧪');
  await privateDirectory(directory);
  await assertPrivateAccess(directory);
  await privateDirectory(directory);
  await assertPrivateAccess(directory);
  const child = join(directory, 'child');
  if (process.platform === 'win32') {
    await mkdir(child);
    await assertPrivateAccess(child, true);
  }
  await privateDirectory(child);
  await privateDirectory(child);
  await assertPrivateAccess(child);
  await privateDirectory(directory);
  await assertPrivateAccess(directory);
});
