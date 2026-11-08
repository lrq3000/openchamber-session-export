import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

export type DestinationResult = { state: 'selected'; path: string } | { state: 'cancelled' } | { state: 'unavailable'; error: string };
export interface DestinationPicker { choose(defaultName: string, signal: AbortSignal): Promise<DestinationResult> }

// This program is fixed code. All variable filenames enter through UTF-8 JSON on stdin, never executable interpolation.
const SCRIPT = `
$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$inputData = [Console]::In.ReadToEnd() | ConvertFrom-Json
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.SaveFileDialog
try {
  $dialog.Title = 'Save complete session archive'
  $dialog.Filter = 'ZIP archives (*.zip)|*.zip'
  $dialog.DefaultExt = 'zip'
  $dialog.AddExtension = $true
  $dialog.CheckPathExists = $true
  $dialog.OverwritePrompt = $true
  $dialog.RestoreDirectory = $true
  $dialog.FileName = [string]$inputData.defaultName
  if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    @{ state = 'selected'; path = $dialog.FileName } | ConvertTo-Json -Compress
  } else { @{ state = 'cancelled' } | ConvertTo-Json -Compress }
} finally { $dialog.Dispose() }
`;

export function validateOutputFile(path: string): void {
  if (typeof path !== 'string' || path.length > 4096 || path.includes('\0') || !isAbsolute(path) || /^[\\/]{2}/.test(path) || !/\.zip$/i.test(path)) throw new Error('Choose an absolute local ZIP path; network and device paths are not supported.');
  if (existsSync(path)) throw new Error('The chosen archive already exists. Choose a new filename; existing files are never overwritten.');
}

/** A chooser may outlive ordinary SDK requests. Its lifetime is owned by a service job and its abort signal. */
export class WindowsSaveDialog implements DestinationPicker {
  async choose(defaultName: string, signal: AbortSignal): Promise<DestinationResult> {
    if (signal.aborted) return { state: 'cancelled' };
    if (process.platform !== 'win32' || !/^[^\\/\0]{1,240}\.zip$/i.test(defaultName)) return { state: 'unavailable', error: 'A local Windows desktop is required for Save As.' };
    const executable = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    return new Promise(resolve => {
      const child = spawn(executable, ['-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand', Buffer.from(SCRIPT, 'utf16le').toString('base64')], { shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
      let output = '', bytes = 0, overflow = false, settled = false;
      const cancel = () => { child.kill(); finish({ state: 'cancelled' }); };
      const finish = (result: DestinationResult) => { if (settled) return; settled = true; signal.removeEventListener('abort', cancel); resolve(result); };
      signal.addEventListener('abort', cancel, { once: true });
      if (signal.aborted) cancel();
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => { bytes += Buffer.byteLength(chunk); if (bytes > 32768) { overflow = true; child.kill(); } else output += chunk; });
      // PowerShell failures are reported as bounded generic metadata, not logs containing paths or environment data.
      child.stderr.resume();
      child.stdin.on('error', () => {});
      child.once('error', () => finish({ state: 'unavailable', error: 'The Windows Save As dialog could not be started. Use the manual output directory.' }));
      child.once('close', code => {
        if (signal.aborted) return finish({ state: 'cancelled' });
        try {
          if (code !== 0 || overflow) throw new Error();
          const result = JSON.parse(output.replace(/^\uFEFF/, '').trim());
          if (result.state === 'cancelled') return finish({ state: 'cancelled' });
          if (result.state !== 'selected') throw new Error();
          validateOutputFile(result.path);
          finish({ state: 'selected', path: result.path });
        } catch (error) {
          finish({ state: 'unavailable', error: error instanceof Error && /already exists/.test(error.message) ? error.message : 'The Windows Save As dialog did not return a usable destination. Use the manual output directory.' });
        }
      });
      child.stdin.end(JSON.stringify({ defaultName }));
    });
  }
}
