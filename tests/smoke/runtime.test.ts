import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { SessionSource } from '../../src/opencode.js';
import { capture, materialize } from '../fixtures.js';
import { nativeFixture } from '../native-fixture.js';

test('captures real OpenCode v2 projected reasoning and tools without a provider call', { timeout: 90000 }, async () => {
  let providerCalls = 0;
  const trap = createServer((_request, response) => { providerCalls++; response.writeHead(500); response.end('No generation is permitted in this test.'); });
  await new Promise<void>(resolve => trap.listen(0, '127.0.0.1', resolve));
  const config = {
    model: 'fixture/test', plugins: [], mcp: { servers: {} },
    providers: { fixture: { env: ['SESSION_EXPORT_FIXTURE_KEY'], package: '@opencode/ai/providers/openai-compatible', settings: { baseURL: `http://127.0.0.1:${(trap.address() as any).port}/v1` }, models: { test: { limit: { context: 32000, output: 4096 }, capabilities: { tools: true } } } } },
  };
  const fixture = await nativeFixture([], config), { root, project, headers, version } = fixture, base = fixture.url;
  let proxy: ReturnType<typeof createServer> | undefined;
  try {
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
    const result = await materialize(await new SessionSource({ url: `http://127.0.0.1:${(proxy.address() as any).port}`, version }).capture({ sessionID: id, title: 'Native export evidence', directory: project }));
    assert.equal(result.sessions[0].messages.length, 2);
    assert.equal(result.sessions[0].messages[1].content[0].type, 'reasoning');
    assert.equal(result.sessions[0].messages[1].content[1].state.input.path, 'a.ts');
    assert.equal(result.sessions[0].log.available, true, result.sessions[0].log.error ?? 'Native durable log unavailable');
    assert.equal(providerCalls, 0);
    await writeFile(join(root, 'capture.json'), JSON.stringify(result, null, 2));
    console.log(`Native OpenCode ${version}; provider calls: ${providerCalls}; evidence: ${root}`);
  } finally {
    if (proxy) await new Promise<void>(resolve => proxy!.close(() => resolve()));
    await fixture.close();
    await new Promise<void>(resolve => trap.close(() => resolve()));
  }
});
