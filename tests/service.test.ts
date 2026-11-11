import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/service.js';
import { capture, diskCapture, temporary } from './fixtures.js';

test('authenticates the service bridge and returns preparation jobs before slow capture finishes', async () => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => release = resolve);
  let calls = 0;
  const server = createService('fixture-secret', { capture: async target => { calls++; await gate; return diskCapture({ ...capture(), target }); }, connection: async () => ({ version: '2.2.5' }) });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(server.address() as any).port}`;
  const headers = { Authorization: 'Bearer fixture-secret', 'Content-Type': 'application/json' };
  try {
    assert.equal((await fetch(url + '/health')).status, 401);
    assert.equal((await (await fetch(url + '/health', { headers })).json() as any).version, '0.2.1');
    assert.equal(calls, 0);
    const connection = await fetch(url + '/connection', { headers });
    assert.equal(connection.status, 200);
    assert.deepEqual(await connection.json(), { version: '2.2.5' });
    const started = await fetch(url + '/prepare', { method: 'POST', headers, body: JSON.stringify({ target: capture().target, inspectFiles: false }) });
    assert.equal(started.status, 202);
    const job = await started.json() as any;
    assert.equal(job.state, 'running');
    assert.equal((await (await fetch(url + `/job?id=${job.id}`, { headers })).json() as any).state, 'running');
    release();
    let ready: any;
    for (let i = 0; i < 100; i++) {
      ready = await (await fetch(url + `/job?id=${job.id}`, { headers })).json();
      if (ready.state !== 'running') break;
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.equal(ready.state, 'ready'); assert.equal(ready.prepared.assetCount, 0);
    assert.ok(!JSON.stringify(ready).includes('fixture-secret'));
    assert.equal((await fetch(url + '/job?id=unknown', { headers })).status, 404);
    assert.equal((await fetch(url + '/prepare', { method: 'POST', headers, body: JSON.stringify({ target: { sessionID: '../../secret', directory: '/project' } }) })).status, 400);
    const directory = await temporary('service-archive');
    const exported = await fetch(url + '/export', { method: 'POST', headers, body: JSON.stringify({ preparedID: ready.prepared.id, options: { outputDirectory: directory } }) });
    assert.equal(exported.status, 202);
    assert.ok((await exported.text()).length < 10000);
  } finally { release(); await new Promise<void>(resolve => server.close(() => resolve())); }
});
