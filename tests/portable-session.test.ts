import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareSessionCopies } from '../src/portable-session.js';
import { capture } from './fixtures.js';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

test('adapts independent copies, remaps pins and parents, and seals unfinished assistants explicitly', () => {
  const source = capture().sessions[0];
  source.messages[1].content.pop();
  source.info.metadata = { openchamber: { context_obligatory_messages: ['msg_user'] } };
  const child = { info: { ...source.info, id: 'ses_child', parentID: 'ses_root' }, messages: [] };
  const before = JSON.stringify(source);
  const result = prepareSessionCopies([child, source], '/destination');
  assert.equal(JSON.stringify(source), before);
  assert.equal(result.sessions[1].info.parentID, result.sessions[0].info.id);
  assert.notEqual(result.sessions[0].messages[0].id, 'msg_user');
  assert.equal(result.sessions[0].info.metadata.openchamber.context_obligatory_messages[0], result.sessions[0].messages[0].id);
  assert.ok(result.sessions[0].messages[1].time.completed);
  assert.match(result.warnings.join(), /interrupted/);
  assert.notEqual(prepareSessionCopies([source], '/destination').sessions[0].info.id, result.sessions[0].info.id);
});

test('rewrites only selected Windows/file/plain-path references and leaves historical prose unchanged', () => {
  const source = capture().sessions[0], destination = join(process.cwd(), 'synthetic-restored', 'asset.txt');
  source.messages[1].content.pop();
  source.messages[0].text = 'Historical C:\\Work\\File.txt is not an execution-time path mapping.';
  source.messages[0].files = [{ data: 'eA==', mime: 'text/plain', source: { type: 'uri', uri: 'file:///C:/WORK/File.txt' } }];
  source.messages[1].content[1].state.content = [{ type: 'file', uri: 'C:\\Work\\File.txt', mime: 'text/plain' }];
  const copied = prepareSessionCopies([source], process.cwd(), new Map([['C:\\Work\\File.txt', destination]])).sessions[0];
  assert.equal(copied.messages[0].files[0].source.uri, pathToFileURL(destination).href);
  assert.equal(copied.messages[1].content[1].state.content[0].uri, pathToFileURL(destination).href);
  assert.equal(copied.messages[0].text, source.messages[0].text);
});

test('refuses cycles and unsupported content instead of silently dropping evidence', () => {
  const source = capture().sessions[0];
  assert.throws(() => prepareSessionCopies([source], '/destination'), /unfamiliar/);
  source.messages = []; source.info.parentID = source.info.id;
  assert.throws(() => prepareSessionCopies([source], '/destination'), /cycle/);
  delete source.info.parentID;
  assert.throws(() => prepareSessionCopies([{ ...source, instructions: [{ key: 'duplicate', value: 'first' }, { key: 'duplicate', value: 'second' }] }], '/destination'), /Duplicate archived instruction/);
});
