import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PluginImports, type NativeRequest, type ImportState } from '../src/plugin-imports.js';
import { readJsonFile } from '../src/private-channel.js';
import { temporary } from './fixtures.js';
import type { PortableSession } from '../src/portable-session.js';

async function fixture(options: { loseAck?: boolean; omitMessage?: boolean; gate?: Promise<void>; submitted?: () => void; sources?: PortableSession[] } = {}) {
  const root = await temporary('plugin-journal'), id = randomUUID(), directory = join(root, 'jobs', id), records = new Map<string, any>();
  await mkdir(directory, { recursive: true });
  const sources = options.sources ?? [{ info: { id: 'ses_source', title: 'Fixture', location: { directory: root } }, messages: [{ id: 'msg_fixture', type: 'user', text: 'Evidence', time: { created: 1 } }] }];
  for (const [number, source] of sources.entries()) await writeFile(join(directory, `source-${number}.json`), JSON.stringify(source));
  await writeFile(join(directory, 'spec.json'), JSON.stringify({ directory: root, files: sources.map((_, number) => `source-${number}.json`), assets: [] }));
  let mutations = 0;
  const native: NativeRequest = async (path, method, body) => {
    if (method === 'POST') {
      mutations++; const value = JSON.parse(body!); records.set(value.info.id, value);
      options.submitted?.(); await options.gate;
      if (options.loseAck) throw new Error('Synthetic lost native acknowledgement');
      return Response.json({ data: value.info });
    }
    const id = path.includes('/experimental/') ? path.split('/')[4] : path.split('/')[3], value = records.get(id);
    if (path.includes('/message?')) return Response.json({ data: options.omitMessage ? [] : value.messages });
    if (method === 'PUT') { (value.instructions ??= []).push({ key: path.split('/').at(-1), value: JSON.parse(body!).value }); return Response.json({}); }
    if (path.includes('/instructions/entries')) return Response.json({ data: value.instructions ?? [] });
    if (!value) throw new Error('Unknown native session');
    return Response.json({ data: value.info });
  };
  const imports = new PluginImports(root, 'fixture-instance', native);
  return { root, id, directory, records, imports, native, mutations: () => mutations };
}
async function terminal(imports: PluginImports, id: string): Promise<ImportState> {
  for (let attempt = 0; attempt < 200; attempt++) {
    const state = await imports.status(id); if (state.state !== 'running') return state;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  throw new Error('Native job did not become terminal');
}

test('persisted cancellation cannot be discarded by start and concurrent preparations cannot remap the same job', async () => {
  const f = await fixture(), results = await Promise.allSettled([f.imports.prepare(f.id), f.imports.prepare(f.id)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  await f.imports.cancel(f.id);
  await assert.rejects(f.imports.start(f.id), /no longer/);
  assert.equal((await f.imports.status(f.id)).state, 'cancelled'); assert.equal(f.mutations(), 0);
  await assert.rejects(new PluginImports(f.root, 'new-instance', f.native).prepare(f.id), /EEXIST/);
});

test('lost native acknowledgements reconcile the exact fresh session without replay', async () => {
  const f = await fixture({ loseAck: true }); await f.imports.prepare(f.id); await f.imports.start(f.id);
  const state = await terminal(f.imports, f.id);
  assert.equal(state.state, 'failed'); assert.equal(state.sessions.length, 1);
  assert.ok(f.records.has(state.sessions[0])); assert.equal(f.mutations(), 1);
  await assert.rejects(f.imports.start(f.id), /no longer/);
  assert.equal((await readJsonFile(join(f.directory, 'state.json'), 256 * 1024)).sessions.length, 1);
});

test('concurrent starts reserve the job and cancellation during the final mutation reports partial completion', async () => {
  let release!: () => void, observed!: () => void;
  const gate = new Promise<void>(resolve => release = resolve), submitted = new Promise<void>(resolve => observed = resolve);
  const f = await fixture({ gate, submitted: observed });
  await f.imports.prepare(f.id);
  const starts = await Promise.allSettled([f.imports.start(f.id), f.imports.start(f.id)]);
  assert.equal(starts.filter(result => result.status === 'fulfilled').length, 1);
  await submitted; await f.imports.cancel(f.id); release();
  const state = await terminal(f.imports, f.id);
  assert.equal(state.state, 'cancelled'); assert.equal(state.sessions.length, 1); assert.deepEqual(state.finalized, []);
  assert.equal(f.mutations(), 1);
});

test('restart exposes in-flight candidates as uncertain and refuses replay on a different instance', async () => {
  const f = await fixture(); await f.imports.prepare(f.id);
  const prepared = await readJsonFile(join(f.directory, 'prepared-0.json'), 1024 * 1024);
  const state = await f.imports.status(f.id);
  await writeFile(join(f.directory, 'state.json'), JSON.stringify({ ...state, state: 'running', inFlight: { sessionID: prepared.info.id, phase: 'import' } }));
  const restarted = new PluginImports(f.root, 'restarted-instance', f.native), recovered = await restarted.status(f.id);
  assert.equal(recovered.state, 'failed'); assert.deepEqual(recovered.uncertainSessions, [prepared.info.id]);
  await assert.rejects(restarted.start(f.id), /no longer/); assert.equal(f.mutations(), 0);
});

test('read-back detects silent transcript loss; unsupported instructions fail before any native import', async () => {
  const f = await fixture({ omitMessage: true }); await f.imports.prepare(f.id); await f.imports.start(f.id);
  const state = await terminal(f.imports, f.id);
  assert.equal(state.state, 'failed'); assert.match(state.error!, /count/); assert.equal(state.sessions.length, 1);
  const invalid = await fixture({ sources: [{ info: { id: 'ses_bad' }, messages: [], instructions: [{ key: 'invalid/key', value: 'No mutation' }] }] });
  await assert.rejects(invalid.imports.prepare(invalid.id), /instruction key/); assert.equal(invalid.mutations(), 0);
  const json = await fixture({ sources: [{ info: { id: 'ses_json' }, messages: [], instructions: [{ key: 'json-value', value: { nested: ['supported', true] } }] }] });
  await json.imports.prepare(json.id); await json.imports.start(json.id); assert.equal((await terminal(json.imports, json.id)).state, 'ready');
});
