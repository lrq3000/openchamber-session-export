import { constants } from 'node:fs';
import { copyFile, lstat, mkdir, mkdtemp } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

/** Install a new stable folder through the native registry API; never edit or replace existing registry entries. */
async function main() {
  const args = process.argv.slice(2);
  const get = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
  if (!args.includes('--yes') || !get('--host') || !get('--destination')) throw new Error('Usage: node scripts/install.mjs --yes --host http://127.0.0.1:PORT --destination ABSOLUTE_PATH');
  const host = new URL(get('--host'));
  if (host.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(host.hostname) || host.username || host.password || host.pathname !== '/' || host.search || host.hash) throw new Error('Installation requires an explicitly selected loopback OpenChamber host.');
  const suppliedDestination = get('--destination');
  if (!isAbsolute(suppliedDestination) || /^[\\/]{2}/.test(suppliedDestination) || suppliedDestination.includes('\0')) throw new Error('Choose an absolute local installation destination.');
  const destination = resolve(suppliedDestination);
  try { await lstat(destination); throw new Error('The destination already exists; compare it before planning an update.'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const source = fileURLToPath(new URL('../openchamber/', import.meta.url));
  const files = ['package.json', 'panel/index.html', 'panel/app.js', 'service.cjs'];
  for (const file of files) if (!(await lstat(join(source, file))).isFile()) throw new Error('Build the complete extension before installing it.');
  const request = async (path, method = 'GET', body) => {
    const response = await fetch(new URL(path, host), { method, redirect: 'error', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Native extension operation ${method} ${path} returned ${response.status}; no automatic rollback or retry was attempted.`);
    return response.json();
  };
  const auth = await request('/auth/session');
  if (auth.disabled !== true || auth.authenticated !== true) throw new Error('This installer does not obtain or bypass UI authentication. Use the native extension settings instead.');
  const before = await request('/api/guests');
  if (!Array.isArray(before.guests) || before.guests.some(guest => guest.id === 'session-export')) throw new Error('The extension ID is already registered or the catalog is invalid.');
  const registry = get('--registry') ?? join(homedir(), '.config', 'openchamber', 'extensions.json');
  const temporary = get('--temp-root') ?? process.env.SESSION_EXPORT_TEST_TMP ?? 'C:/Users/33632/AppData/Local/Temp/opencode';
  const backupDirectory = await mkdtemp(join(temporary, 'session-export-install-'));
  const backup = join(backupDirectory, 'extensions.before.json');
  await copyFile(registry, backup, constants.COPYFILE_EXCL);
  await mkdir(dirname(destination), { recursive: true }); await mkdir(destination);
  for (const file of files) { await mkdir(dirname(join(destination, file)), { recursive: true }); await copyFile(join(source, file), join(destination, file), constants.COPYFILE_EXCL); }
  const installed = await request('/api/guests', 'POST', { path: destination });
  const guest = installed.guest;
  if (guest?.id !== 'session-export' || !Array.isArray(guest.capabilities?.requested) || guest.capabilities.requested.length !== 1 || guest.capabilities.requested[0] !== 'service') throw new Error('The native installer returned unexpected permissions. Approval was not granted.');
  await request('/api/guests/session-export/capabilities', 'PUT', { granted: ['service'] });
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

main().catch(error => { console.error(error instanceof Error ? error.message : 'Installation failed.'); process.exitCode = 1; });
