import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nativeFixture } from '../native-fixture.js';

test('official import preserves compaction recent text, instructions, pins and interrupted records without generation', { timeout: 90000 }, async () => {
  const fixture = await nativeFixture();
  try {
    const seed = await fixture.request('/api/session', 'POST', { location: { directory: fixture.project }, title: 'Contract fixture' });
    const info = { ...seed, id: 'ses_contract_source', metadata: { openchamber: { context_obligatory_messages: ['msg_old_pin'] } } };
    const messages = [
      { id: 'msg_old_pin', type: 'user', text: 'Pinned policy: preserve original files.', time: { created: 1 } },
      { id: 'msg_recent', type: 'user', text: 'Recent text before compaction.', time: { created: 2 } },
      { id: 'msg_checkpoint', type: 'compaction', status: 'completed', reason: 'manual', summary: 'Existing summary.', metadata: { keepID: 'msg_recent' }, time: { created: 3 } },
      { id: 'msg_after', type: 'user', text: 'Continue after compaction.', time: { created: 4 } },
      { id: 'msg_interrupted', type: 'assistant', agent: 'build', model: { id: 'test', providerID: 'fixture' }, time: { created: 5 }, content: [{ type: 'text', text: 'Unfinished evidence.' }] },
    ];
    await fixture.request('/api/experimental/session/import', 'POST', { info, messages, location: { directory: fixture.project } });
    const context = await fixture.request('/api/session/ses_contract_source/context');
    assert.equal(context[0].type, 'compaction');
    assert.match(context[0].metadata.recent, /Recent text before compaction/);
    assert.equal(context.at(-1).id, 'msg_after', 'The native context preview stops before an unfinished assistant.');
    const transcript = await fixture.request('/api/session/ses_contract_source/message?order=asc&limit=100');
    assert.equal(transcript.at(-1).id, 'msg_after', 'The official importer truncates at the first unfinished assistant.');
    const sealed = structuredClone(messages);
    for (const message of sealed) { message.id += '_sealed'; if (message.metadata?.keepID) message.metadata.keepID += '_sealed'; }
    Object.assign(sealed.at(-1)!, { time: { created: 5, completed: 6 }, metadata: { session_export: { originallyUnfinished: true } }, error: { type: 'unknown', message: 'Interrupted in the source; sealed for import.' } });
    await fixture.request('/api/experimental/session/import', 'POST', { info: { ...info, id: 'ses_contract_sealed' }, messages: sealed, location: { directory: fixture.project } });
    const preserved = await fixture.request('/api/session/ses_contract_sealed/message?order=asc&limit=100');
    assert.equal(preserved.at(-1).content[0].text, 'Unfinished evidence.');
    await fixture.request('/api/experimental/session/ses_contract_source/instructions/entries/policy', 'PUT', { value: 'A fixture instruction.' });
    const instructions = await fixture.request('/api/experimental/session/ses_contract_source/instructions/entries');
    assert.equal(instructions[0].value, 'A fixture instruction.');
    // The active context already contains the engine's retained recent text.
    // Removing keepID prevents the destination from recomputing it from omitted history.
    const resumed = structuredClone(context);
    for (const message of resumed) message.id += '_resume';
    delete resumed[0].metadata.keepID;
    await fixture.request('/api/experimental/session/import', 'POST', { info: { ...info, id: 'ses_contract_resume' }, messages: resumed, location: { directory: fixture.project } });
    const restored = await fixture.request('/api/session/ses_contract_resume/context');
    assert.equal(restored[0].metadata.recent, context[0].metadata.recent);
    assert.equal(restored.at(-1).text, 'Continue after compaction.');
    const duplicate = await fetch(fixture.url + '/api/experimental/session/import', {
      method: 'POST', headers: fixture.headers, body: JSON.stringify({ info, messages, location: { directory: fixture.project } }),
    });
    assert.equal(duplicate.status, 409);
  } finally { await fixture.close(); }
});
