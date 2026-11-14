import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstat, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { nativeFixture, connectFixturePlugin } from '../native-fixture.js';
import { capture, diskCapture } from '../fixtures.js';
import { ArchiveWriter } from '../../src/archive.js';
import { PluginClient } from '../../src/plugin-client.js';
import { Importer } from '../../src/importer.js';
import { CaptureStore } from '../../src/capture-store.js';
import type { SessionRecord } from '../../src/types.js';

test('a packaged plugin restores a ZIP into fresh parent/child sessions and instructions without overwriting originals', { timeout: 90000 }, async () => {
    const fixture = await nativeFixture([resolve('openchamber/plugin')]);
  try {
    const seed = await fixture.request('/api/session', 'POST', { location: { directory: fixture.project }, title: 'Existing session — do not replace' });
    const client = await connectFixturePlugin(fixture);
    const bridge = client.connection(), authorization = { Authorization: `Bearer ${bridge.token}` };
    assert.equal((await fetch(bridge.url + '/identity')).status, 401);
    assert.equal((await fetch(bridge.url + '/identity', { headers: { ...authorization, Origin: 'https://untrusted.invalid' } })).status, 401);
    assert.equal((await fetch(bridge.url + '/api/config', { headers: authorization })).status, 404);
    assert.equal((await fetch(bridge.url + '/api/experimental/session/import', { method: 'POST', headers: authorization })).status, 404);
    const destination = join(fixture.root, 'another-project'); await mkdir(destination);
    const attachment = join(fixture.project, 'legacy attachment.txt'), attachmentBytes = Buffer.from('Portable attachment contents 🧪');
    await writeFile(attachment, attachmentBytes);
    const input = capture();
    input.target = { sessionID: 'ses_restore_root', directory: fixture.project };
    input.sessions = [
      { ...input.sessions[0], info: { ...seed, id: input.target.sessionID, metadata: { openchamber: { context_obligatory_messages: [{ id: 'msg_restore_user', createdAt: 1, role: 'user', sessionID: input.target.sessionID }] } } }, messages: [
        { id: 'msg_restore_user', type: 'user', text: 'Portable user evidence 🧪', files: [{ name: 'legacy attachment.txt', source: { type: 'file', path: attachment } }], time: { created: 1 } },
        { id: 'msg_restore_assistant', type: 'assistant', agent: 'build', model: { providerID: 'fixture', id: 'test' }, content: [{ type: 'text', text: 'Unfinished text must survive.' }], time: { created: 2 } },
      ] },
      { ...input.sessions[0], info: { ...seed, id: 'ses_restore_child', parentID: input.target.sessionID, title: 'Child evidence' }, messages: [
        { id: 'msg_restore_child', type: 'user', text: 'Child text', time: { created: 3 } },
      ] },
    ];
    input.sessions[0].messages.push(
      { id: 'msg_restore_later', type: 'user', text: 'Later request must survive the interruption.', time: { created: 3 } },
      { id: 'msg_restore_shell', type: 'shell', shellID: 'sh_original', command: 'do-not-run', status: 'running', output: { output: 'Partial shell evidence', cursor: 22, size: 22, truncated: false }, time: { created: 4 } },
      { id: 'msg_restore_compaction', type: 'compaction', status: 'running', reason: 'manual', summary: 'Partial compaction evidence', time: { created: 5 } },
    );
    const snapshot = await diskCapture(input), store = new CaptureStore(snapshot.root);
    const records = (await store.page<SessionRecord>('sessions')).records;
    records[0].instructionsPath = join(snapshot.root, 'instructions.json');
    await writeFile(records[0].instructionsPath, JSON.stringify([{ key: 'portable-policy', value: 'Preserve source files.' }]));
    await writeFile(store.file('sessions'), records.map(record => JSON.stringify(record)).join('\n') + '\n');
    const output = join(fixture.root, 'exports'); await mkdir(output);
    const metadata = await lstat(attachment);
    const archive = await new ArchiveWriter().write(snapshot, (async function* () { yield {
      id: 'legacy', path: attachment, name: 'legacy attachment.txt', sessions: [input.target.sessionID], size: metadata.size, status: 'available' as const,
      fingerprint: { dev: metadata.dev, ino: metadata.ino, size: metadata.size, mtimeMs: metadata.mtimeMs },
    }; })(), { includeFiles: true, selectedAssetIDs: ['legacy'] }, output);
    const before = createHash('sha256').update(await readFile(archive.path)).digest('hex');
    const importer = new Importer(async () => client), preview = await importer.prepare(archive.path, destination);
    assert.equal(preview.sessionCount, 2); assert.match(preview.warnings.join(), /interrupted/);
    assert.equal((await fixture.request('/api/session/' + seed.id)).title, 'Existing session — do not replace');
    await importer.start(preview.id);
    let result: any;
    for (let attempt = 0; attempt < 200; attempt++) {
      result = await importer.status(preview.id);
      if (result.state !== 'running' && result.state !== 'prepared') break;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert.equal(result.state, 'ready', JSON.stringify(result));
    assert.equal(result.sessions.length, 2); assert.notEqual(result.sessions[0], input.target.sessionID);
    const messages = await fixture.request(`/api/session/${result.sessions[0]}/message?order=asc&limit=100`);
    assert.equal(messages[1].content[0].text, 'Unfinished text must survive.');
    assert.ok(messages[1].time.completed);
    assert.equal(messages[1].error.type, 'aborted');
    assert.equal(messages[2].text, 'Later request must survive the interruption.');
    assert.equal(messages[3].status, 'killed'); assert.notEqual(messages[3].shellID, 'sh_original');
    assert.equal(messages[4].status, 'failed'); assert.equal(messages[4].metadata.session_export.partialSummary, 'Partial compaction evidence');
    assert.equal(Buffer.from(messages[0].files[0].data, 'base64').toString(), attachmentBytes.toString());
    assert.ok(messages[0].files[0].source.uri.includes('.openchamber-imports'));
    assert.deepEqual(await readFile(attachment), attachmentBytes);
    assert.equal(result.restoredFileCount, 1); assert.deepEqual(await readFile(result.restoredFiles[0]), attachmentBytes);
    const root = await fixture.request('/api/session/' + result.sessions[0]), child = await fixture.request('/api/session/' + result.sessions[1]);
    assert.equal(root.location.directory, destination);
    assert.equal(child.parentID, root.id);
    assert.equal(root.metadata.openchamber.context_obligatory_messages[0].id, messages[0].id);
    assert.equal(root.metadata.openchamber.context_obligatory_messages[0].sessionID, root.id);
    const instructions = await fixture.request(`/api/experimental/session/${root.id}/instructions/entries`);
    assert.equal(instructions[0].value, 'Preserve source files.');
    assert.equal(createHash('sha256').update(await readFile(archive.path)).digest('hex'), before);
    await assert.rejects(importer.start(preview.id), /already started/);
    const wrongHost = await PluginClient.connect(resolve('openchamber'), process.pid + 10000000, join(fixture.root, 'home')).then(() => true, () => false);
    assert.equal(wrongHost, false);
  } finally { await fixture.close(); }
});
