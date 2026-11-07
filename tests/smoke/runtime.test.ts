import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createServer as createPortReservation } from 'node:net';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { SessionSource } from '../../src/opencode.js';
import { capture, temporary } from '../fixtures.js';

test('captures real OpenCode v2 projected reasoning and tools without a provider call', { timeout: 90000 }, async () => {
  const root = await temporary('native');
  const project = join(root, 'project'); await mkdir(project);
  let providerCalls = 0;
  const trap = createServer((_request, response) => { providerCalls++; response.writeHead(500); response.end('No generation is permitted in this test.'); });
  await new Promise<void>(resolve => trap.listen(0, '127.0.0.1', resolve));
  const config = {
    model: 'fixture/test', plugins: [], mcp: { servers: {} },
    providers: { fixture: { env: ['SESSION_EXPORT_FIXTURE_KEY'], package: '@opencode/ai/providers/openai-compatible', settings: { baseURL: `http://127.0.0.1:${(trap.address() as any).port}/v1` }, models: { test: { limit: { context: 32000, output: 4096 }, capabilities: { tools: true } } } } },
  };
  const configPath = join(project, 'opencode.json'); await writeFile(configPath, JSON.stringify(config));
  const reservation = createPortReservation(); await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as any).port; await new Promise<void>(resolve => reservation.close(() => resolve()));
  const bundled = 'C:/Users/33632/AppData/Local/Programs/@openchamberelectron/resources/opencode-cli/opencode.exe';
  const binary = process.env.SESSION_EXPORT_OPENCODE ?? (existsSync(bundled) ? bundled : 'opencode');
  const child = spawn(binary, ['serve', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: project, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, XDG_CONFIG_HOME: join(root, 'config'), XDG_DATA_HOME: join(root, 'data'), XDG_CACHE_HOME: join(root, 'cache'), XDG_STATE_HOME: join(root, 'state'), OPENCODE_CONFIG: configPath, OPENCODE_CONFIG_CONTENT: JSON.stringify(config), OPENCODE_DISABLE_AUTOUPDATE: '1', OPENCHAMBER_AGENT_TOOL_URL: '', OPENCHAMBER_AGENT_TOOL_TOKEN: '', SESSION_EXPORT_FIXTURE_KEY: 'isolated-fixture-only' },
  });
  let output = ''; child.stdout.on('data', chunk => output += chunk); child.stderr.on('data', chunk => output += chunk);
  const base = `http://127.0.0.1:${port}`;
  let proxy: ReturnType<typeof createServer> | undefined;
  const sanitize = (text: string) => text.replace(/server password\s+[^\s]+/gi, 'server password [redacted]');
  try {
    let password = '', version = '';
    for (let attempt = 0; attempt < 200; attempt++) {
      if (child.exitCode !== null) break;
      password = /server password\s+([^\s]+)/i.exec(output)?.[1] ?? '';
      if (password) {
        try {
          const response = await fetch(base + '/api/info', { headers: { Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}` }, signal: AbortSignal.timeout(1000) });
          if (response.ok) { const info = await response.json() as any; version = info.version ?? info.data?.version; break; }
        } catch { /* Only the port reserved for this child is retried during startup. */ }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(password && version, sanitize(output).slice(-3000));
    const headers = { Authorization: `Basic ${Buffer.from(`opencode:${password}`).toString('base64')}`, 'Content-Type': 'application/json' };
    const request = async (path: string, body: unknown) => {
      const response = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });
      assert.equal(response.ok, true, `${path}: ${response.status} ${await response.clone().text()}`);
      return response.json() as Promise<any>;
    };
    const created = await request('/api/session', { location: { directory: project }, title: 'Session export isolated smoke' });
    const info = created.data ?? created;
    const id = `ses_${randomUUID().replaceAll('-', '')}`;
    const messages = capture().sessions[0].messages.map(message => ({ ...message }));
    messages[1] = { ...messages[1], agent: 'build', model: { id: 'test', providerID: 'fixture' }, time: { created: 2, completed: 3 }, content: messages[1].content.filter((item: any) => item.type !== 'future-content').map((item: any) => item.type === 'tool' ? { ...item, time: { created: 2, completed: 3 } } : item) };
    await request('/api/experimental/session/import', { info: { ...info, id, title: 'Native export evidence' }, messages, location: { directory: project } });
    // An isolated proxy mirrors OpenChamber's credential injection without adding a test-only credential path to production code.
    proxy = createServer(async (incoming, outgoing) => {
      try {
        const response = await fetch(base + incoming.url, { headers });
        if (!response.ok) console.error(`Native fixture query rejected (${response.status}): ${incoming.url} ${(await response.clone().text()).slice(0, 2000)}`);
        outgoing.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') ?? 'application/json' });
        if (response.body) await pipeline(Readable.fromWeb(response.body as any), outgoing); else outgoing.end();
      } catch { outgoing.destroy(); }
    });
    await new Promise<void>(resolve => proxy!.listen(0, '127.0.0.1', resolve));
    const result = await new SessionSource({ url: `http://127.0.0.1:${(proxy.address() as any).port}`, version }).capture({ sessionID: id, title: 'Native export evidence', directory: project });
    assert.equal(result.sessions[0].messages.length, 2);
    assert.equal(result.sessions[0].messages[1].content[0].type, 'reasoning');
    assert.equal(result.sessions[0].messages[1].content[1].state.input.path, 'a.ts');
    assert.equal(result.sessions[0].log.available, true, result.sessions[0].log.error ?? 'Native durable log unavailable');
    assert.equal(providerCalls, 0);
    await writeFile(join(root, 'capture.json'), JSON.stringify(result, null, 2));
    console.log(`Native OpenCode ${version}; provider calls: ${providerCalls}; evidence: ${root}`);
  } finally {
    if (proxy) await new Promise<void>(resolve => proxy!.close(() => resolve()));
    child.kill('SIGTERM');
    await writeFile(join(root, 'server.log'), sanitize(output));
    await new Promise<void>(resolve => trap.close(() => resolve()));
  }
});
