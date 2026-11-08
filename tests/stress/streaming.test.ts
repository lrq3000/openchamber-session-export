import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('exports and verifies 256 MiB including a 160 MiB individual tool value with a 96 MiB V8 heap', { timeout: 600000 }, async () => {
  const child = spawn(process.execPath, ['--max-old-space-size=96', '--import', 'tsx', fileURLToPath(new URL('./large-session.ts', import.meta.url))], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '', error = '';
  child.stdout.on('data', bytes => { output = (output + bytes).slice(-16000); });
  child.stderr.on('data', bytes => { error = (error + bytes).slice(-16000); });
  const code = await new Promise<number | null>((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
  assert.equal(code, 0, error || output);
  const result = JSON.parse(output.trim().split('\n').at(-1)!);
  assert.equal(result.inputBytes, 256 * 1024 * 1024);
  assert.equal(result.messages, 3);
  assert.ok(result.peakHeapBytes < 96 * 1024 * 1024);
  console.log(`256 MiB stress verified; peak heap ${Math.ceil(result.peakHeapBytes / 1024 / 1024)} MiB; peak RSS ${Math.ceil(result.peakRSSBytes / 1024 / 1024)} MiB; evidence: ${result.root}`);
});
