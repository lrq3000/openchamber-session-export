import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, readdir, stat } from 'node:fs/promises';
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
  // Read the real ACL without triggering module discovery through ConvertTo-Json or pipeline cmdlets.
  const script = `
$ErrorActionPreference = 'Stop'
$PSModuleAutoLoadingPreference = 'None'
$sidType = [Security.Principal.SecurityIdentifier]
$sections = [Security.AccessControl.AccessControlSections]::Owner -bor [Security.AccessControl.AccessControlSections]::Access
$acl = [IO.Directory]::GetAccessControl($env:SESSION_EXPORT_PRIVATE_DIR, $sections)
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
[Console]::WriteLine($identity.User.Value)
[Console]::WriteLine($identity.Owner.Value)
[Console]::WriteLine($acl.GetOwner($sidType).Value)
[Console]::WriteLine($acl.AreAccessRulesProtected)
foreach ($rule in $acl.GetAccessRules($true, $true, $sidType)) {
  [Console]::WriteLine(@($rule.IdentityReference.Value, [int]$rule.FileSystemRights, $rule.AccessControlType, [int]$rule.InheritanceFlags, [int]$rule.PropagationFlags, $rule.IsInherited) -join '|')
}
`;
  const systemRoot = process.env.SystemRoot ?? 'C:\\Windows';
  const executable = join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const result = await exec(executable, ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], {
    windowsHide: true, timeout: 10000, env: { SystemRoot: systemRoot, SESSION_EXPORT_PRIVATE_DIR: directory },
  });
  const [current, defaultOwner, owner, protectedDacl, ...rules] = result.stdout.trim().split(/\r?\n/);
  assert.match(current, /^S-\d+(?:-\d+)+$/);
  // A newly created child inherits the parent's DACL, not its owner. Windows uses the token's default owner, which may be Administrators on a CI runner; hardening explicitly sets ownership to the current user.
  assert.equal(owner, inherited ? defaultOwner : current);
  assert.equal(protectedDacl, inherited ? 'False' : 'True');
  assert.deepEqual(rules, [`${current}|2032127|Allow|3|0|${inherited ? 'True' : 'False'}`]);
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

test('Windows private directory hardening does not require PowerShell on PATH', { skip: process.platform !== 'win32', timeout: 30000 }, async () => {
  const directory = join(await temporary('private-acl-no-path'), 'private café 🧪');
  const run = 'import { privateDirectory } from "./src/private-channel.ts"; await privateDirectory(process.env.SESSION_EXPORT_PRIVATE_DIR);';
  await exec(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', run], {
    windowsHide: true, timeout: 15000,
    env: { Path: '', SystemRoot: process.env.SystemRoot, SESSION_EXPORT_PRIVATE_DIR: directory },
  });
  await assertPrivateAccess(directory);
});

test('a malformed Windows system root aborts before writing private upload state', { skip: process.platform !== 'win32', timeout: 15000 }, async () => {
  const directory = join(await temporary('private-acl-invalid-root'), 'uploads');
  const run = 'import { UploadStore } from "./src/upload.ts"; process.env.SystemRoot = "relative-root"; await new UploadStore(process.env.SESSION_EXPORT_PRIVATE_DIR).start("fixture.zip", 22);';
  await assert.rejects(exec(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', run], {
    windowsHide: true, timeout: 10000,
    env: { SystemRoot: process.env.SystemRoot, SESSION_EXPORT_PRIVATE_DIR: directory },
  }), /absolute local SystemRoot/);
  assert.deepEqual(await readdir(directory), []);
});
