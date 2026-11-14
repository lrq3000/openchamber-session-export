import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { ConnectionResolver } from '../src/connection.js';
import { tempRoot } from './fixtures.js';

// A legacy resolver would inspect this nonexistent file. Native resolution must neither read it nor contact a listener.
const environment = (values: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({ settingsPath: join(tempRoot, 'never-inspect-session-export-settings.json'), ...values });
const token = 'fixture-native-service-token';

test('resolves only the host-injected authenticated connection without OS discovery or a version probe', async () => {
  for (const url of ['http://127.0.0.1:57123', 'http://[::1]:57123/']) {
    const result = await new ConnectionResolver(environment({ OPENCHAMBER_OPENCODE_URL: url, OPENCHAMBER_SERVICE_TOKEN: token })).resolve();
    assert.deepEqual(result, { url: new URL(url).href, version: null, token });
  }
});

test('missing or unsafe host connection data fails closed without reflecting its values', async () => {
  const urls = ['', 'not-a-url', 'https://127.0.0.1:57123', 'http://localhost:57123', 'http://127.0.0.1', 'http://127.0.0.1:0', 'http://127.0.0.1:65536', 'http://127.0.0.1:57123/api', 'http://127.0.0.1:57123/?secret=fixture-private', 'http://127.0.0.1:57123/#fixture-private', 'http://fixture-private@127.0.0.1:57123', 'http://remote.example:57123', 'http://127.0.0.1.example:57123', 'http://127.1:57123', ' http://127.0.0.1:57123', 'http://127.0.0.1:57123\n'];
  const cases = [environment(), environment({ OPENCHAMBER_OPENCODE_URL: 'http://127.0.0.1:57123' }), ...urls.map(url => environment({ OPENCHAMBER_OPENCODE_URL: url, OPENCHAMBER_SERVICE_TOKEN: token })), ...['', 'fixture-private\r\nheader', 'fixture-private\0', 'fixture private', 'x'.repeat(8193)].map(value => environment({ OPENCHAMBER_OPENCODE_URL: 'http://127.0.0.1:57123', OPENCHAMBER_SERVICE_TOKEN: value }))];
  for (const env of cases) await assert.rejects(new ConnectionResolver(env).resolve(), error => /OpenChamber|host|connection/i.test(String(error)) && !/fixture-private|fixture-native|remote\.example|never-inspect/.test(String(error)));
});
