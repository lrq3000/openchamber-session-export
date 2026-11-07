import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { SessionSource } from '../src/opencode.js';
import { capture } from './fixtures.js';

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
    const result = await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target);
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
    const result = await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target);
    assert.equal(result.sessions[0].changed, true);
    assert.equal(result.sessions[0].log.available, false);
    assert.ok(result.warnings.some(warning => /log/i.test(warning)));
  } finally { await server.close(); }
});

test('enforces the capture budget during pagination rather than after retaining every page', async () => {
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
    await assert.rejects(new SessionSource({ url: server.url, version: '2.2.5' }, { maxCaptureBytes: 2200 }).capture(capture().target), /budget|limit/i);
    assert.ok(pages <= 2, `Retained/read too many transcript pages: ${pages}`);
  } finally { await server.close(); }
});

test('preserves uncertainty when the active-session check is unavailable', async () => {
  const server = await fixtureServer(url => url.pathname === '/api/session/active' ? undefined : route(url));
  try {
    const result = await new SessionSource({ url: server.url, version: '2.2.5' }).capture(capture().target);
    assert.equal(result.sessions[0].active, null);
  } finally { await server.close(); }
});
