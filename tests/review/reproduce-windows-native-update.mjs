import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = fileURLToPath(new URL('../../', import.meta.url));

async function main() {
  const [desktop, older, newer] = process.argv.slice(2);
  assert.equal(process.platform, 'win32', 'This check needs the Windows filesystem and Windows Desktop build.');
  assert.ok(process.argv.length === 5 && isAbsolute(desktop ?? '') && older && newer, 'Usage: node tests/review/reproduce-windows-native-update.mjs ABSOLUTE_DESKTOP_DIRECTORY OLDER_GIT_REF NEWER_GIT_REF');
  const executable = join(desktop, 'OpenChamber.exe');
  await fs.access(executable);
  const base = resolve(process.env.SESSION_EXPORT_TEST_TMP ?? join(tmpdir(), 'opencode'));
  await fs.mkdir(base, { recursive: true });
  const root = await fs.mkdtemp(join(base, 'session-export-native-update-'));
  console.log(`Isolated evidence: ${root}`);
  const home = join(root, 'home');
  await fs.mkdir(home);
  const { Path, SystemRoot, ComSpec, PATHEXT } = process.env;
  // Run the shipped host modules and bundled engine without the user's configuration, credentials, or running services.
  const env = {
    Path, SystemRoot, ComSpec, PATHEXT, HOME: home, USERPROFILE: home, APPDATA: home, LOCALAPPDATA: home, PROGRAMDATA: home,
    TEMP: root, TMP: root, XDG_CONFIG_HOME: join(root, 'config'), XDG_DATA_HOME: join(root, 'data'),
    XDG_CACHE_HOME: join(root, 'cache'), XDG_STATE_HOME: join(root, 'state'),
    OPENCHAMBER_DATA_DIR: root, OPENCHAMBER_HOST_CALLBACK_URL: 'http://127.0.0.1:1',
    ELECTRON_RUN_AS_NODE: '1', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(home, 'gitconfig'),
  };
  const child = spawn(executable, [fileURLToPath(import.meta.url), '--isolated-child', desktop, older, newer], {
    cwd: root, env, stdio: ['ignore', 'inherit', 'inherit', 'ipc'], windowsHide: true,
  });
  // Let the fixture stop its own children rather than terminating the Electron parent and orphaning the engine.
  const cancel = () => { if (child.connected) child.send('cancel', () => {}); };
  const deadline = setTimeout(cancel, 90_000);
  process.on('SIGINT', cancel);
  process.on('SIGTERM', cancel);
  try {
    process.exitCode = await new Promise((done, fail) => { child.once('error', fail); child.once('close', (code) => done(code ?? 1)); });
  } finally {
    clearTimeout(deadline);
    process.off('SIGINT', cancel);
    process.off('SIGTERM', cancel);
  }
}

function git(...args) {
  const result = spawnSync('git', args, { encoding: 'utf8', timeout: 20_000, windowsHide: true });
  assert.equal(result.status, 0, `git ${args[0]} failed: ${result.error ?? result.stderr}`);
  return result.stdout.trim();
}

async function isolatedChild(signal) {
  const [, desktop, older, newer] = process.argv.slice(2);
  const root = process.cwd(), home = join(root, 'home'), persistPath = join(root, 'extensions.json');
  const web = join(desktop, 'resources/app.asar/node_modules/@openchamber/web');
  const engineEntry = join(desktop, 'resources/opencode-server/serve.mjs');
  assert.equal(process.env.OPENCHAMBER_DATA_DIR, root);
  assert.equal(process.env.USERPROFILE, home);
  assert.equal(process.env.GIT_CONFIG_GLOBAL, join(home, 'gitconfig'));
  assert.equal(process.env.ELECTRON_RUN_AS_NODE, '1');
  assert.ok(process.connected, 'Start this fixture with the documented launcher.');
  signal.throwIfAborted();
  await fs.access(engineEntry);
  const version = JSON.parse(await fs.readFile(join(web, 'package.json'), 'utf8')).version;
  const load = (name) => import(pathToFileURL(join(web, 'build/server/lib/guests', `${name}.js`)).href);
  const { listInstalledGuests } = await load('catalog');
  const { checkAllGuestUpdates, updateGuest } = await load('updates');
  const { setGuestEnabled, stopAllGuestServices, proxyGuestServiceRequest, readServicePid } = await load('service');
  const { installGuestFromGitSource } = await load('install');
  const { readExtensionStore, setCapabilityGrants } = await load('persist');
  const { guestDataDir } = await load('storage');
  const origin = join(root, 'remote.git');
  const target = (ref) => git('-C', repo, 'rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`);
  const oldCommit = target(older), newCommit = target(newer);
  const packageVersion = (commit) => JSON.parse(git('-C', repo, 'show', `${commit}:package.json`)).version;
  const expectedVersion = packageVersion(newCommit);
  assert.notEqual(expectedVersion, packageVersion(oldCommit), 'Use two different published versions with the bundled plugin.');
  git('init', '--quiet', '--bare', '--initial-branch=main', origin);
  git('-C', origin, 'fetch', '--quiet', '--no-tags', '--depth', '1', '--', repo, oldCommit, newCommit);
  git('-C', origin, 'update-ref', 'refs/heads/main', oldCommit);
  signal.throwIfAborted();

  const installed = await installGuestFromGitSource(origin, persistPath, { openchamberVersion: version });
  assert.equal(installed.ok, true, JSON.stringify(installed));
  const granted = installed.guest.capabilities.requested;
  await setCapabilityGrants(installed.guest.id, persistPath, granted);
  const readGuest = async () => (await listInstalledGuests({ persistPath })).find((guest) => guest.id === installed.guest.id);
  const before = await readGuest();
  const store = await readExtensionStore(persistPath);
  assert.ok(before?.opencodePlugin && before.service, 'The older Git revision must ship both the plugin and the service.');
  const dataDir = guestDataDir(persistPath, before.id);
  await fs.mkdir(dataDir, { recursive: true });
  const marker = join(dataDir, 'fixture-marker.txt');
  await fs.writeFile(marker, 'synthetic data must survive the update');
  const plugin = pathToFileURL(join(before.packageRoot, before.opencodePlugin)).href;
  const config = join(root, 'managed.json'), project = join(root, 'project');
  await fs.mkdir(project);
  const writeOptions = (enabled) => fs.writeFile(config, JSON.stringify({ plugins: enabled ? [plugin] : [], mcp: { servers: {} }, providers: {} }));

  // The health path needs no OpenCode access. The real OpenCode plugin runs separately under the same isolated parent.
  const health = async (guest) => {
    const result = await proxyGuestServiceRequest({
      guestId: guest.id, guestName: guest.name, packageRoot: guest.packageRoot, service: { ...guest.service, provides: [] },
      granted, persistPath, method: 'GET', path: '/health',
    });
    assert.equal(result.status, 200);
    assert.equal(JSON.parse(result.body).version, guest.version);
  };

  let engine, output = '', password, engineUrl, engineRun = 0;
  const inventoryHasPlugin = async () => {
    const response = await fetch(`${engineUrl}/api/plugin?directory=${encodeURIComponent(project)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}` },
      signal: AbortSignal.any([signal, AbortSignal.timeout(1000)]),
    });
    assert.equal(response.status, 200);
    const inventory = await response.json();
    const plugins = Array.isArray(inventory) ? inventory : inventory.data ?? inventory.plugins;
    assert.ok(Array.isArray(plugins), `Unexpected plugin inventory fields: ${Object.keys(inventory).join(', ')}`);
    return plugins.some((item) => item.id === 'openchamber-session-export');
  };
  const bridgeInstance = async () => {
    const bridge = join(home, '.openchamber-session-export/bridges');
    for (const file of await fs.readdir(bridge, { recursive: true }).catch(() => [])) {
      if (!file.endsWith('connection.json')) continue;
      try {
        const value = JSON.parse(await fs.readFile(join(bridge, file), 'utf8'));
        if (value.pid === engine.pid && value.hostPID === process.pid) return value.instanceID;
      } catch { /* The private fixture descriptor can change during reload. */ }
    }
  };
  const observe = async (probe, message) => {
    const end = Date.now() + 20_000;
    let lastError;
    while (Date.now() < end && engine.exitCode === null && !engine.signalCode) {
      signal.throwIfAborted();
      try { const result = await probe(); if (result) return result; } catch (error) { lastError = error; }
      await delay(100, undefined, { signal });
    }
    throw new Error(message, { cause: lastError });
  };
  const startEngine = async () => {
    signal.throwIfAborted();
    const reservation = createServer();
    await new Promise((done, fail) => { reservation.once('error', fail); reservation.listen(0, '127.0.0.1', done); });
    const { port } = reservation.address();
    await new Promise((done, fail) => reservation.close((error) => error ? fail(error) : done()));
    engineUrl = `http://127.0.0.1:${port}`;
    password = randomUUID();
    output = '';
    engineRun++;
    engine = spawn(process.execPath, [engineEntry, 'serve', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: project, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, OPENCODE_CONFIG: config, OPENCODE_PASSWORD: password, OPENCODE_SERVER_PASSWORD: password, OPENCODE_DISABLE_AUTOUPDATE: '1' },
    });
    engine.stdout.on('data', (chunk) => { output += chunk; });
    engine.stderr.on('data', (chunk) => { output += chunk; });
    await new Promise((done, fail) => { engine.once('error', fail); engine.once('spawn', done); });
  };
  const stopEngine = async () => {
    if (!engine) return;
    if (engine.pid && engine.exitCode === null && !engine.signalCode) {
      await new Promise((done, fail) => {
        const timer = setTimeout(() => fail(new Error(`Isolated engine ${engine.pid} did not exit.`)), 5_000);
        engine.once('close', () => { clearTimeout(timer); done(); });
        if (!engine.kill('SIGKILL') && engine.exitCode === null && !engine.signalCode) {
          clearTimeout(timer);
          fail(new Error(`Could not stop isolated engine ${engine.pid}.`));
        }
      });
    }
    await fs.writeFile(join(root, `engine-${engineRun}.log`), output.replaceAll(password, '[redacted]'));
    engine = undefined;
  };

  // Log the actual filesystem error for this disposable directory; OpenChamber reports only the translated swap failure.
  const rename = fs.rename;
  let swapError;
  fs.rename = async (from, to) => {
    try { return await rename(from, to); }
    catch (error) {
      if (from === before.packageRoot) swapError = error.code;
      throw error;
    }
  };
  const update = async () => {
    signal.throwIfAborted();
    swapError = undefined;
    const guest = await readGuest();
    const result = await updateGuest({ guest, origin: guest.gitOrigin, persistPath, openchamberVersion: version });
    console.log('Native update:', JSON.stringify(result), swapError ?? '');
    return result;
  };

  try {
    await writeOptions(true);
    await startEngine();
    const originalBridge = await observe(async () => await inventoryHasPlugin() && await bridgeInstance(), 'The older plugin did not start.');
    await health(before);
    git('-C', origin, 'update-ref', 'refs/heads/main', newCommit);
    assert.deepEqual(await checkAllGuestUpdates({ persistPath, force: true }), { [before.id]: { version: expectedVersion } });
    console.log(`OpenChamber ${version}, extension ${before.version} → ${expectedVersion}; plugin initially loaded.`);
    const assertLocked = async () => {
      assert.deepEqual(await update(), { ok: false, code: 'swap-failed' });
      assert.ok(['EPERM', 'EBUSY', 'EACCES'].includes(swapError), `Unexpected swap error: ${swapError}`);
      assert.equal((await readGuest()).version, before.version);
    };
    await assertLocked();
    assert.deepEqual(await readExtensionStore(persistPath), store);

    // Mirror the native managed-config deactivation in the isolated profile. An inventory change alone may leave old handles alive.
    await setGuestEnabled(before.id, persistPath, false);
    await writeOptions(false);
    await observe(async () => !(await inventoryHasPlugin()) && !(await bridgeInstance()), 'OpenCode did not unload the paused plugin.');
    await assertLocked();

    await stopEngine();
    await startEngine();
    await observe(async () => !(await inventoryHasPlugin()), 'The restarted engine must start with the plugin disabled.');
    assert.deepEqual(await update(), { ok: true, id: before.id });
    assert.equal((await readGuest()).enabled, false, 'The update must preserve the paused state.');
    await setGuestEnabled(before.id, persistPath, true);
    await writeOptions(true);
    const after = await readGuest();
    assert.equal(after.version, expectedVersion);
    assert.equal(after.packageRoot, before.packageRoot);
    assert.deepEqual(await readExtensionStore(persistPath), store);
    assert.equal(await fs.readFile(marker, 'utf8'), 'synthetic data must survive the update');
    await observe(async () => {
      const instance = await bridgeInstance();
      return instance && instance !== originalBridge && await inventoryHasPlugin();
    }, 'The new plugin instance did not start.');
    await health(after);
    console.log(`Verified ${after.version}: registration, grants, storage identity and synthetic data preserved; service and plugin started.`);
  } finally {
    fs.rename = rename;
    const servicePID = readServicePid(before.id);
    const cleanup = await Promise.allSettled([stopEngine(), stopAllGuestServices()]);
    const failures = cleanup.filter((result) => result.status === 'rejected');
    if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'Fixture cleanup failed.');
    if (servicePID) {
      // Windows signal 0 probes liveness, without sending a signal or acting on an unverified PID.
      assert.throws(() => process.kill(servicePID, 0), { code: 'ESRCH' }, `Isolated service ${servicePID} did not exit.`);
    }
  }
}

if (process.argv[2] === '--isolated-child') {
  const controller = new AbortController();
  const cancel = () => controller.abort(new Error('The isolated update reproduction was cancelled.'));
  process.on('disconnect', cancel);
  process.on('message', (message) => { if (message === 'cancel') cancel(); });
  try { await isolatedChild(controller.signal); }
  finally { if (process.connected) process.disconnect(); }
} else {
  await main();
}
