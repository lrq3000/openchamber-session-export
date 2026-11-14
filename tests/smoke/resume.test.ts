import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { nativeFixture, connectFixturePlugin } from '../native-fixture.js';
import { SessionSource } from '../../src/opencode.js';
import { Exporter } from '../../src/exporter.js';
import { Importer } from '../../src/importer.js';
import { unzip } from '../zip-fixture.js';

test('Resume ZIP round-trip preserves native recent text, real pin objects and durable instructions without old tools', { timeout: 90000 }, async () => {
  const fixture = await nativeFixture([resolve('openchamber/plugin')]);
  try {
    const seed = await fixture.request('/api/session', 'POST', { location: { directory: fixture.project }, title: 'Resume source' });
    const info = { ...seed, id: 'ses_resume_source', metadata: { openchamber: { context_obligatory_messages: [{ id: 'msg_resume_pin', createdAt: 1, role: 'user', sessionID: 'ses_resume_source' }] } } };
    const messages = [
      { id: 'msg_resume_pin', type: 'user', text: 'PINNED: preserve all source files.', time: { created: 1 } },
      { id: 'msg_resume_old', type: 'assistant', agent: 'build', model: { providerID: 'fixture', id: 'test' }, time: { created: 2, completed: 3 }, content: [
        { type: 'text', text: 'Earlier visible conversation for consultation.' },
        { type: 'tool', id: 'tool_resume_old', name: 'read', time: { created: 2, completed: 3 }, state: { status: 'completed', input: {}, content: [{ type: 'text', text: 'OBSOLETE_TOOL_OUTPUT' }] } },
      ] },
      { id: 'msg_resume_recent', type: 'user', text: 'Recent text kept by the engine before compaction.', time: { created: 4 } },
      { id: 'msg_resume_checkpoint', type: 'compaction', status: 'completed', reason: 'manual', summary: 'Existing reusable summary 🧪', metadata: { keepID: 'msg_resume_recent' }, time: { created: 5 } },
      { id: 'msg_resume_after', type: 'user', text: 'Continue from the existing summary.', time: { created: 6 } },
    ];
    await fixture.request('/api/experimental/session/import', 'POST', { info, messages, location: { directory: fixture.project } });
    await fixture.request('/api/experimental/session/ses_resume_source/instructions/entries/policy', 'PUT', { value: 'Durable instruction from source.' });
    const expected = await fixture.request('/api/session/ses_resume_source/context'), client = await connectFixturePlugin(fixture);
    const exporter = new Exporter(new SessionSource(client.connection()));
    const preview = await exporter.prepare({ sessionID: info.id, directory: fixture.project }, false, { profile: 'resume', retainHistory: true });
    const job = exporter.start(preview.id, { outputDirectory: join(fixture.root, 'exports') });
    let archive: any;
    for (let attempt = 0; attempt < 300; attempt++) {
      archive = exporter.status(job.id); if (archive.state !== 'running') break; await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.equal(archive.state, 'ready', archive.error);
    const entries = await unzip(archive.path), history = entries.get('history/conversation.md')!.toString();
    assert.match(history, /Earlier visible conversation/); assert.ok(!history.includes('OBSOLETE_TOOL_OUTPUT'));
    const payload = JSON.parse(entries.get('session.json')!.toString());
    assert.ok(!JSON.stringify(payload.messages).includes('OBSOLETE_TOOL_OUTPUT'));
    const importer = new Importer(async () => client), imported = await importer.prepare(archive.path, fixture.project);
    await importer.start(imported.id);
    let result: any;
    for (let attempt = 0; attempt < 300; attempt++) {
      result = await importer.status(imported.id); if (!['running', 'prepared'].includes(result.state)) break; await new Promise(resolve => setTimeout(resolve, 20));
    }
    assert.equal(result.state, 'ready', JSON.stringify(result)); assert.equal(result.sessions.length, 1);
    const id = result.sessions[0], context = await fixture.request(`/api/session/${id}/context`);
    const checkpoint = context.find((message: any) => message.type === 'compaction');
    assert.equal(checkpoint.summary, expected[0].summary);
    assert.equal(checkpoint.metadata.recent, expected[0].metadata.recent);
    assert.equal(context.at(-1).text, messages.at(-1)!.text);
    const restored = await fixture.request(`/api/session/${id}`), transcript = await fixture.request(`/api/session/${id}/message?order=asc&limit=100`);
    assert.equal(restored.metadata.openchamber.context_obligatory_messages[0].sessionID, id);
    assert.ok(transcript.some((message: any) => message.id === restored.metadata.openchamber.context_obligatory_messages[0].id));
    const instructions = await fixture.request(`/api/experimental/session/${id}/instructions/entries`);
    assert.ok(instructions.some((entry: any) => entry.value === 'Durable instruction from source.'));
    assert.ok(instructions.some((entry: any) => entry.value.includes('PINNED: preserve all source files.')));
    assert.ok(!JSON.stringify(context).includes('Earlier visible conversation for consultation.'));
    assert.equal((await fixture.request('/api/session/ses_resume_source')).id, info.id);
  } finally { await fixture.close(); }
});
