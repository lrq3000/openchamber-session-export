import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { temporary } from './fixtures.js';
import { PluginClient } from '../src/plugin-client.js';

/** Never discover a shared service or inherit provider credentials in native tests. */
export async function nativeFixture(plugins: string[] = [], overrides: Record<string, unknown> = {}) {
  const root = await temporary('import-contract'), project = join(root, 'project');
  await mkdir(project);
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as any).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const password = randomBytes(32).toString('hex');
  const config = { plugins, mcp: { servers: {} }, ...overrides }, configPath = join(root, 'config.json');
  await writeFile(configPath, JSON.stringify(config));
  const child = spawn(process.env.SESSION_EXPORT_OPENCODE ?? 'opencode', ['serve', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: project, stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, WINDIR: process.env.WINDIR,
      HOME: join(root, 'home'), USERPROFILE: join(root, 'home'), TMPDIR: root, TEMP: root, TMP: root,
      XDG_CONFIG_HOME: join(root, 'config'), XDG_DATA_HOME: join(root, 'data'),
      XDG_CACHE_HOME: join(root, 'cache'), XDG_STATE_HOME: join(root, 'state'),
      OPENCODE_CONFIG: configPath, OPENCODE_CONFIG_CONTENT: JSON.stringify(config),
      OPENCODE_PASSWORD: password, OPENCODE_SERVER_PASSWORD: password, OPENCODE_DISABLE_AUTOUPDATE: '1',
      SESSION_EXPORT_FIXTURE_KEY: 'isolated-fixture-only',
    },
  });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; }); child.stderr.on('data', chunk => { output += chunk; });
  const url = `http://127.0.0.1:${port}`, headers = { Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}`, 'Content-Type': 'application/json' };
  const close = async () => {
    if (child.exitCode === null) {
      const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
      child.kill('SIGTERM'); await exited;
    }
    await writeFile(join(root, 'server.log'), output.replaceAll(password, '[redacted]'));
  };
  const request = async (path: string, method = 'GET', input?: unknown) => {
    const response = await fetch(url + path, { method, headers, ...(input === undefined ? {} : { body: JSON.stringify(input) }), signal: AbortSignal.timeout(15000) });
    const text = await response.text();
    if (!response.ok) throw new Error(`Native fixture ${method} ${path}: ${response.status} ${text.slice(0, 2000)}`);
    const value = text ? JSON.parse(text) : undefined;
    return value?.data ?? value;
  };
  try {
    for (let attempt = 0; attempt < 250; attempt++) {
      if (child.exitCode !== null) throw new Error('The isolated OpenCode process exited before readiness.');
      try { const info = await request('/api/info'); return { root, project, url, headers, request, close, version: String(info.version) }; } catch { /* Retry only our explicitly reserved child port. */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('The isolated OpenCode process did not become ready.');
  } catch (error) { await close(); throw error; }
}

/** Plugin loading follows project initialization and may complete after /api/plugin responds. */
export async function connectFixturePlugin(fixture: Awaited<ReturnType<typeof nativeFixture>>): Promise<PluginClient> {
  const listing = await fixture.request('/api/plugin?directory=' + encodeURIComponent(fixture.project));
  await writeFile(join(fixture.root, 'plugins.json'), JSON.stringify(listing, null, 2));
  let failure: unknown;
  for (let attempt = 0; attempt < 150; attempt++) {
    try { return await PluginClient.connect(resolve('openchamber'), process.pid, join(fixture.root, 'home')); }
    catch (error) { failure = error; await new Promise(resolve => setTimeout(resolve, 50)); }
  }
  throw new Error(`${String(failure)}; plugin evidence: ${fixture.root}/plugins.json`);
}
