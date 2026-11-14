import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, mkdtemp, readFile, realpath, rename } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const requiredCapabilities = ['service', 'opencode'];
const hasRequiredCapabilities = value => Array.isArray(value) && value.length === requiredCapabilities.length && requiredCapabilities.every(capability => value.includes(capability));

/** New installs register through native controls. Updates require exact fingerprints and preserve unrelated files and grants. */
async function main() {
  const args = process.argv.slice(2);
  const get = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  if (!args.includes('--yes') || !get('--host') || !get('--destination')) throw new Error('Usage: node scripts/install.mjs --yes --host http://127.0.0.1:PORT --destination ABSOLUTE_PATH');
  const host = new URL(get('--host'));
  if (host.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(host.hostname) || host.username || host.password || host.pathname !== '/' || host.search || host.hash) throw new Error('Installation requires an explicitly selected loopback OpenChamber host.');
  const suppliedDestination = get('--destination');
  if (!isAbsolute(suppliedDestination) || /^[\\/]{2}/.test(suppliedDestination) || suppliedDestination.includes('\0')) throw new Error('Choose an absolute local installation destination.');
  const destination = resolve(suppliedDestination);
  const updating = args.includes('--update');
  try { await lstat(destination); if (!updating) throw new Error('The destination already exists; compare it before planning an update.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const source = fileURLToPath(new URL('../openchamber/', import.meta.url));
  const files = ['package.json', 'panel/index.html', 'panel/app.js', 'service.cjs'];
  for (const file of files) if (!(await lstat(join(source, file))).isFile()) throw new Error('Build the complete extension before installing it.');
  const request = async (path, method = 'GET', body) => {
    const response = await fetch(new URL(path, host), { method, redirect: 'error', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      throw Object.assign(new Error(`Native extension operation ${method} ${path} returned ${response.status}; no automatic rollback or mutation retry was attempted.`), { status: response.status, nativeCode: detail.error, nativeMessage: detail.message });
    }
    return response.json();
  };
  const auth = await request('/auth/session');
  if (auth.disabled !== true || auth.authenticated !== true) throw new Error('This installer does not obtain or bypass UI authentication. Use the native extension settings instead.');
  const before = await request('/api/guests');
  if (!Array.isArray(before.guests)) throw new Error('The extension catalog is invalid.');
  if (!updating && before.guests.some(guest => guest.id === 'session-export')) throw new Error('The extension ID is already registered.');
  const registry = get('--registry') ?? join(homedir(), '.config', 'openchamber', 'extensions.json');
  const temporary = get('--temp-root') ?? process.env.SESSION_EXPORT_TEST_TMP ?? 'C:/Users/33632/AppData/Local/Temp/opencode';
  if (updating) return update({ destination, source, files, before, registry, temporary, request, expectedVersion: get('--expected-version'), expectedHashesPath: get('--expected-hashes') });
  const backupDirectory = await mkdtemp(join(temporary, 'session-export-install-'));
  const backup = join(backupDirectory, 'extensions.before.json');
  await copyFile(registry, backup, constants.COPYFILE_EXCL);
  await mkdir(dirname(destination), { recursive: true }); await mkdir(destination);
  for (const file of files) { await mkdir(dirname(join(destination, file)), { recursive: true }); await copyFile(join(source, file), join(destination, file), constants.COPYFILE_EXCL); }
  const installed = await request('/api/guests', 'POST', { path: destination });
  const guest = installed.guest;
  if (guest?.id !== 'session-export' || !hasRequiredCapabilities(guest.capabilities?.requested)) throw new Error('The native installer returned unexpected permissions. Approval was not granted.');
  await request('/api/guests/session-export/capabilities', 'PUT', { granted: requiredCapabilities });
  const catalog = await request('/api/guests');
  for (const existing of before.guests) if (!catalog.guests.some(guest => guest.id === existing.id && guest.path === existing.path)) throw new Error('An existing extension changed during installation; inspect the retained registry backup.');
  const bridge = async path => {
    const result = await request('/api/guests/session-export/service/request', 'POST', { method: 'GET', path });
    if (result.status !== 200) throw new Error(`The installed extension failed ${path}; inspect its service status. Files and registry backup were retained.`);
    return JSON.parse(result.body);
  };
  await bridge('/health'); const connection = await bridge('/connection');
  console.log(JSON.stringify({ installed: destination, id: 'session-export', backup, connectionVersion: connection.version, existingExtensionsPreserved: before.guests.map(guest => guest.id) }, null, 2));
}

async function update({ destination, source, files, before, registry, temporary, request, expectedVersion, expectedHashesPath }) {
  const same = (a, b) => process.platform === 'win32' ? resolve(a).toLowerCase() === resolve(b).toLowerCase() : resolve(a) === resolve(b);
  const guest = before.guests.find(value => value.id === 'session-export');
  if (!guest || !same(guest.path, destination) || guest.enabled !== true || !hasRequiredCapabilities(guest.capabilities?.requested) || !hasRequiredCapabilities(guest.capabilities?.granted)) throw new Error('Update requires the explicitly selected, enabled installation with service and OpenCode access already approved through native controls. Existing grants are never widened by an update.');
  if (!expectedVersion || !expectedHashesPath) throw new Error('Updates require --expected-version and --expected-hashes pointing to a reviewed SHA-256 map of all four managed files.');
  const metadata = await lstat(destination);
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || !same(await realpath(destination), destination)) throw new Error('The update destination must be a regular local directory without symbolic-link ancestors.');
  const expected = JSON.parse(await readFile(expectedHashesPath, 'utf8'));
  const verify = async () => {
    const manifest = JSON.parse(await readFile(join(destination, 'package.json'), 'utf8'));
    if (manifest.version !== expectedVersion || manifest.name !== 'openchamber-session-export' || manifest.openchamber?.contributes?.panel?.id !== 'session-export') throw new Error('The existing extension identity/version differs from the reviewed update target.');
    for (const file of files) {
      const path = join(destination, file), stat = await lstat(path);
      if (!stat.isFile() || stat.isSymbolicLink() || !same(await realpath(path), path) || !/^[a-f0-9]{64}$/.test(expected[file] ?? '') || createHash('sha256').update(await readFile(path)).digest('hex') !== expected[file]) throw new Error(`The existing ${file} differs from the reviewed fingerprint; nothing was replaced.`);
    }
  };
  await verify();
  const backupDirectory = await mkdtemp(join(temporary, 'session-export-update-')), backup = join(backupDirectory, 'extensions.before.json');
  await copyFile(registry, backup, constants.COPYFILE_EXCL);
  for (const file of files) {
    await mkdir(dirname(join(backupDirectory, 'extension', file)), { recursive: true });
    await copyFile(join(destination, file), join(backupDirectory, 'extension', file), constants.COPYFILE_EXCL);
    // Stage complete files outside the live watched folder before pausing only this extension.
    await mkdir(dirname(join(backupDirectory, 'replacement', file)), { recursive: true });
    await copyFile(join(source, file), join(backupDirectory, 'replacement', file), constants.COPYFILE_EXCL);
  }
  await verify();
  try {
    await request('/api/guests/session-export/enabled', 'PUT', { enabled: false });
    // Manifest last: package watchers must not advertise the new release before its complete bundles are present.
    for (const file of [...files.filter(file => file !== 'package.json'), 'package.json']) await rename(join(backupDirectory, 'replacement', file), join(destination, file));
    await request('/api/guests/session-export/enabled', 'PUT', { enabled: true });
    const after = await request('/api/guests');
    for (const existing of before.guests) {
      const next = after.guests?.find(value => value.id === existing.id);
      if (!next || next.path !== existing.path || next.enabled !== existing.enabled || JSON.stringify(next.capabilities?.granted) !== JSON.stringify(existing.capabilities?.granted)) throw new Error('An extension path, enabled state or grant changed unexpectedly.');
    }
    const bridge = async path => {
      const result = await request('/api/guests/session-export/service/request', 'POST', { method: 'GET', path });
      if (result.status !== 200) throw new Error(`The updated extension failed ${path}.`);
      return JSON.parse(result.body);
    };
    const release = JSON.parse(await readFile(join(source, 'package.json'), 'utf8')).version;
    let stableSince, lastTransient;
    const deadline = Date.now() + 15000;
    for (;;) {
      try {
        const health = await bridge('/health');
        if (health.version !== release) throw new Error('The running service does not match the built release.');
        stableSince ??= Date.now();
        if (Date.now() - stableSince >= 1500) break;
      } catch (error) {
        // Only these read-only readiness probes are repeatable. Never retry a pause/resume, registration, file replacement or export.
        const restarting = error.status === 502 && error.nativeCode === 'REQUEST_FAILED' || error.status === 400 && error.nativeCode === 'NO_SERVICE' && error.nativeMessage === 'The service was stopped before it became ready.';
        if (!restarting) throw error;
        stableSince = undefined; lastTransient = error;
      }
      if (Date.now() >= deadline) throw lastTransient ?? new Error('The updated service did not remain stable after the native folder watcher settled.');
      // OpenChamber 2.6.1 polls changed package files at 500 ms and confirms a stable fingerprint on its next check.
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const connection = await bridge('/connection');
    console.log(JSON.stringify({ updated: destination, version: release, backupDirectory, backup, connectionVersion: connection.version, existingExtensionsPreserved: before.guests.map(value => value.id) }, null, 2));
  } catch (error) { throw new Error(`${error.message} Update outcome needs inspection; this extension may remain paused. Backups retained at ${backupDirectory}. No automatic rollback or retry was attempted.`); }
}

main().catch(error => { console.error(error instanceof Error ? error.message : 'Installation failed.'); process.exitCode = 1; });
