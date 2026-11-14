import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { SessionSource } from '../src/opencode.js';
import { capture, materialize } from './fixtures.js';

export async function fixtureServer(handler: (path: URL) => unknown) {
  const calls: string[] = [];
  const server = createServer((req, res) => {
    calls.push(`${req.method} ${req.url}`);
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    try {
      const result = handler(new URL(req.url!, 'http://localhost'));
      if (result === undefined) { res.writeHead(404); res.end(); }
      else if (typeof result === 'string') { res.setHeader('Content-Type', 'text/event-stream'); res.end(result); }
      else { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(result)); }
    } catch { res.writeHead(500); res.end(); }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${(server.address() as any).port}`, calls, close: () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) };
}

function route(url: URL): unknown {
  if (url.searchParams.has('cursor') && url.searchParams.has('order')) throw new Error('A native OpenCode cursor already encodes its order.');
  const fixture = capture().sessions[0];
  if (url.pathname === '/api/session/active') return { data: {} };
  if (url.pathname === '/api/session/ses_root') return { data: fixture.info };
  if (url.pathname === '/api/session/ses_child') return { data: { id: 'ses_child', parentID: 'ses_root', title: 'Child', location: { directory: '/project' }, time: { updated: 1 } } };
  if (url.pathname.endsWith('/message')) {
    if (url.pathname.includes('ses_child')) return { data: [{ id: 'child_user', type: 'user', text: 'Child evidence' }], cursor: {} };
    return url.searchParams.has('cursor') ? { data: [fixture.messages[1]], cursor: {} } : { data: [fixture.messages[0]], cursor: { next: 'page2' } };
  }
  if (url.pathname === '/api/session') return { data: url.searchParams.get('parentID') === 'ses_root' && url.searchParams.get('archived') === 'true' ? [{ id: 'ses_child' }] : [], cursor: {} };
  if (url.pathname.endsWith('/log')) return 'data: {"type":"session.created","seq":1}\n\ndata: {"type":"log.synced","aggregateID":"ses_root","seq":5}\n\n';
}

test('captures every message page, unfinished content, archived descendants and durable watermark using GET only', async () => {
  const server = await fixtureServer(route);
  try {
    const result = await materialize(await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target));
    assert.equal(result.sessions.length, 2);
    assert.equal(result.sessions[0].messages.length, 2);
    assert.equal(result.sessions[0].messages[1].content[0].text, 'Check the saved evidence first.');
    assert.equal(result.sessions[0].messages[1].time.completed, undefined);
    assert.equal(result.sessions[0].log.watermark, 5);
    assert.equal(result.sessions[0].events.at(-1)?.type, 'log.synced');
    assert.ok(server.calls.every(call => call.startsWith('GET ')));
  } finally { await server.close(); }
});

test('fails closed on cursor loops and never silently returns a partial transcript', async () => {
  const server = await fixtureServer(url => url.pathname.endsWith('/message') ? { data: [{ id: 'new', type: 'user', text: 'x' }], cursor: { next: 'loop' } } : route(url));
  try { await assert.rejects(new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target), /cursor|duplicate/i); }
  finally { await server.close(); }
});

test('refuses a different project directory and a failed child listing', async () => {
  const server = await fixtureServer(route);
  try { await assert.rejects(new SessionSource({ url: server.url, version: '2.2.5' }).capture({ ...capture().target, directory: '/another-project' }), /directory/i); }
  finally { await server.close(); }
  const broken = await fixtureServer(url => url.pathname === '/api/session' ? undefined : route(url));
  try { await assert.rejects(new SessionSource({ url: broken.url, version: '2.2.5' }).capture(capture().target), /404/); }
  finally { await broken.close(); }
});

test('discloses unavailable logs and a changing session instead of inventing completeness', async () => {
  let revision = 0;
  const server = await fixtureServer(url => {
    if (url.pathname.endsWith('/log')) return undefined;
    if (url.pathname === '/api/session/ses_root') return { data: { ...capture().sessions[0].info, time: { updated: ++revision } } };
    return route(url);
  });
  try {
    const result = await materialize(await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target));
    assert.equal(result.sessions[0].changed, true);
    assert.equal(result.sessions[0].log.available, false);
    assert.ok(result.warnings.some(warning => /log/i.test(warning)));
  } finally { await server.close(); }
});

test('captures every page beyond the former cumulative memory budget instead of refusing the transcript', async () => {
  let pages = 0;
  const server = await fixtureServer(url => {
    if (url.pathname.endsWith('/message')) {
      pages++;
      return { data: pages <= 3 ? [{ id: `page_${pages}`, type: 'user', text: 'x'.repeat(1200) }] : [], cursor: pages < 3 ? { next: `page${pages + 1}` } : {} };
    }
    if (url.pathname === '/api/session') return { data: [], cursor: {} };
    return route(url);
  });
  try {
    const result = await materialize(await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target));
    assert.equal(result.sessions[0].messages.length, 3);
    assert.equal(pages, 3);
  } finally { await server.close(); }
});

test('preserves uncertainty when the active-session check is unavailable', async () => {
  const server = await fixtureServer(url => url.pathname === '/api/session/active' ? undefined : route(url));
  try {
    const result = await materialize(await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target));
    assert.equal(result.sessions[0].active, null);
  } finally { await server.close(); }
});

test('distinguishes inactive false/null records from active state objects', async () => {
  for (const [value, expected] of [[false, false], [null, false], [{ type: 'busy' }, true]] as const) {
    const server = await fixtureServer(url => url.pathname === '/api/session/active' ? { data: { ses_root: value } } : route(url));
    try {
      const result = await materialize(await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target));
      assert.equal(result.sessions[0].active, expected, `Activity value ${JSON.stringify(value)}`);
    } finally { await server.close(); }
  }
});

test('does not claim an available durable log without a valid watermark', async () => {
  for (const event of [{ type: 'log.synced' }, { type: 'log.synced', seq: -1 }, { type: 'log.synced', seq: 1.5 }]) {
    const server = await fixtureServer(url => url.pathname.endsWith('/log') ? `data: ${JSON.stringify(event)}\n\n` : route(url));
    try {
      const result = await materialize(await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target));
      assert.equal(result.sessions[0].log.available, false);
      assert.match(result.sessions[0].log.error!, /watermark/i);
      assert.equal(result.sessions[0].messages.length, 2);
    } finally { await server.close(); }
  }
});

test('preserves CRLF, multiline SSE, escaped Unicode and the watermark boundary', async () => {
  const server = await fixtureServer(url => url.pathname.endsWith('/log') ? ': comment\r\nevent: ignored\r\ndata: {"type":"message.updated",\r\ndata: "text":"café 🧪","seq":1}\r\n\r\ndata: {"type":"log.synced","seq":2}\r\n\r\ndata: {"type":"after","seq":3}\r\n\r\n' : route(url));
  try {
    const result = await materialize(await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target));
    assert.equal(result.sessions[0].log.available, true, result.sessions[0].log.error ?? 'Durable log unavailable');
    assert.equal(result.sessions[0].events[0].text, 'café 🧪');
    assert.equal(result.sessions[0].events.length, 2);
    assert.equal(result.sessions[0].log.watermark, 2);
  } finally { await server.close(); }
});

for (const mode of ['reset', 'idle'] as const) test(`an SSE frame interrupted by ${mode} becomes an optional-log omission without blocking core evidence`, async context => {
  let inLog = false;
  if (mode === 'idle') {
    const timer = globalThis.setTimeout;
    // Accelerate only the production idle timer after this fixture enters its log, not the response/header or test deadline.
    context.mock.method(globalThis, 'setTimeout', ((callback: (...args: any[]) => void, delay?: number, ...args: any[]) => timer(callback, inLog && delay === 30000 ? 100 : delay, ...args)) as typeof setTimeout);
  }
  const server = createServer((request, response) => {
    const url = new URL(request.url!, 'http://localhost');
    if (url.pathname.endsWith('/log')) {
      inLog = true; response.setHeader('Content-Type', 'text/event-stream');
      response.write('data: {"type":"message.updated","text":"partial');
      if (mode === 'reset') setTimeout(() => response.destroy(new Error('Fixture reset')), 30);
    } else {
      const result = url.pathname === '/api/session' ? { data: [], cursor: {} } : route(url);
      response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(result));
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  let deadline: ReturnType<typeof setTimeout> | undefined;
  try {
    const snapshot = await Promise.race([
      new SessionSource({ url: `http://127.0.0.1:${(server.address() as any).port}`, version: '2.2.5' }).capture(capture().target),
      new Promise<never>((_resolve, reject) => { deadline = setTimeout(() => reject(new Error('Interrupted SSE cleanup blocked the completed core capture')), 1500); }),
    ]);
    const result = await materialize(snapshot);
    assert.equal(result.sessions[0].messages.length, 2);
    assert.equal(result.sessions[0].log.available, false);
    if (mode === 'idle') assert.match(result.sessions[0].log.error!, /stopped making progress/i);
    assert.ok(result.warnings.some(text => /Durable log unavailable/.test(text)));
  } finally { clearTimeout(deadline); server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('rejects object and array continuation cursors instead of accepting a partial capture', async () => {
  for (const next of [{ token: 'page2' }, ['page2']]) {
    const server = await fixtureServer(url => url.pathname.endsWith('/message') ? { data: [capture().sessions[0].messages[0]], cursor: { next } } : route(url));
    try { await assert.rejects(new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target), /cursor/i); }
    finally { await server.close(); }
  }
});

test('authenticates every native read and reports denied durable logs without exposing the token', async () => {
  const token = 'fixture-private-opencode-bearer';
  const server = createServer((request, response) => {
    if (request.headers.authorization !== `Bearer ${token}`) { response.writeHead(401); response.end(); return; }
    const url = new URL(request.url!, 'http://localhost');
    if (url.pathname.endsWith('/log')) { response.writeHead(403); response.end('NOT_A_LISTED_READ'); return; }
    response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(route(url)));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const snapshot = await new SessionSource({ url: `http://127.0.0.1:${(server.address() as any).port}`, version: null, token }).capture(capture().target);
    const result = await materialize(snapshot);
    assert.equal(result.serverVersion, null);
    assert.equal(result.sessions.length, 2); assert.equal(result.sessions[0].messages.length, 2);
    assert.equal(result.sessions[0].log.available, false);
    assert.ok(result.warnings.some(warning => /Durable log unavailable.*403/.test(warning)));
    assert.equal(JSON.stringify(result).includes(token), false); assert.equal(JSON.stringify(snapshot).includes(token), false);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

for (const status of [401, 403, 413]) test(`a native core read rejected with ${status} never becomes a successful partial capture`, async () => {
  const server = createServer((request, response) => {
    const url = new URL(request.url!, 'http://localhost');
    if (url.pathname.endsWith('/message')) { response.writeHead(status); response.end('fixture-private-upstream-error'); return; }
    response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(route(url)));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await assert.rejects(new SessionSource({ url: `http://127.0.0.1:${(server.address() as any).port}`, version: null, token: 'fixture-bearer' }).capture(capture().target), error => String(error).includes(String(status)) && !String(error).includes('fixture-private')); }
  finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});

test('never follows a native redirect or forwards its bearer to another listener', async () => {
  let leakedRequests = 0;
  const other = createServer((_request, response) => { leakedRequests++; response.end('{}'); });
  await new Promise<void>(resolve => other.listen(0, '127.0.0.1', resolve));
  const server = createServer((_request, response) => { response.writeHead(302, { Location: `http://127.0.0.1:${(other.address() as any).port}/` }); response.end(); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await assert.rejects(new SessionSource({ url: `http://127.0.0.1:${(server.address() as any).port}`, version: null, token: 'fixture-private' }).capture(capture().target));
    assert.equal(leakedRequests, 0);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); await new Promise<void>(resolve => other.close(() => resolve())); }
});
