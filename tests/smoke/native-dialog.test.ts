import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { WindowsSaveDialog } from '../../src/save-dialog.js';
import { ArchiveWriter } from '../../src/archive.js';
import { diskCapture, temporary } from '../fixtures.js';

// UI Automation is confined to the titled dialog of a PowerShell child owned by this test process. No unrelated window receives input.
const AUTOMATE = `
$ErrorActionPreference = 'Stop'
[Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$data = [Console]::In.ReadToEnd() | ConvertFrom-Json
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class TestOwnedDialog {
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr SendMessage(IntPtr hWnd, uint message, IntPtr wParam, string text);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hWnd, uint message, IntPtr wParam, IntPtr lParam);
}
'@
$condition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty, 'Save complete session archive')
$dialog = $null
for ($i = 0; $i -lt 100 -and $null -eq $dialog; $i++) {
  $windows = [System.Windows.Automation.AutomationElement]::RootElement.FindAll([System.Windows.Automation.TreeScope]::Children, $condition)
  foreach ($window in $windows) {
    $owner = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $window.Current.ProcessId)
    if ($owner.ParentProcessId -eq $data.parentPID -and $owner.Name -eq 'powershell.exe') { $dialog = $window; break }
  }
  if ($null -eq $dialog) { Start-Sleep -Milliseconds 100 }
}
if ($null -eq $dialog) { throw 'The test-owned Save As dialog was not found.' }
if ($data.path) {
  $fieldCondition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty, '1001')
  $fields = $dialog.FindAll([System.Windows.Automation.TreeScope]::Descendants, $fieldCondition)
  $editable = @()
  foreach ($field in $fields) {
    if ($field.Current.Name -eq $data.defaultName -and $field.Current.NativeWindowHandle -ne 0) { $editable += $field }
  }
  if ($editable.Count -ne 1) { throw 'The unique test-owned filename HWND was not found.' }
  # This Windows build exposes the legacy filename HWND as a Pane without ValuePattern. WM_SETTEXT targets that verified child only.
  [void][TestOwnedDialog]::SendMessage([IntPtr]$editable[0].Current.NativeWindowHandle, 12, [IntPtr]::Zero, [string]$data.path)
}
Start-Sleep -Milliseconds $data.holdMs
$buttonCondition = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty, [string]$data.button)
$buttons = $dialog.FindAll([System.Windows.Automation.TreeScope]::Descendants, $buttonCondition)
$button = @($buttons | Where-Object { $_.Current.ClassName -eq 'Button' -and $_.Current.NativeWindowHandle -ne 0 })
if ($button.Count -ne 1) { throw 'The unique test-owned dialog button HWND was not found.' }
if (-not [TestOwnedDialog]::PostMessage([IntPtr]$button[0].Current.NativeWindowHandle, 245, [IntPtr]::Zero, [IntPtr]::Zero)) { throw 'The test-owned button could not be invoked.' }
Write-Output 'Test-owned native dialog handled.'
`;

async function automate(path?: string, holdMs = 0): Promise<void> {
  const executable = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
  const child = spawn(executable, ['-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand', Buffer.from(AUTOMATE, 'utf16le').toString('base64')], { windowsHide: true, timeout: 45000, stdio: ['pipe', 'pipe', 'pipe'] });
  let output = ''; child.stdout.on('data', bytes => output = (output + bytes).slice(-4000)); child.stderr.on('data', bytes => output = (output + bytes).slice(-4000));
  child.stdin.end(JSON.stringify({ parentPID: process.pid, path, holdMs, defaultName: "Literal ' ; test.zip", button: path ? '1' : '2' }));
  const code = await new Promise<number | null>((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
  assert.equal(code, 0, output);
}

test('the real Windows Save As survives 20 seconds, selects Unicode paths and cancels without writing', { skip: process.env.SESSION_EXPORT_NATIVE_DIALOG !== '1' || process.platform !== 'win32', timeout: 60000 }, async context => {
  const root = await temporary('native-dialog'), path = join(root, 'chosen café.zip'), picker = new WindowsSaveDialog(), controller = new AbortController();
  context.signal.addEventListener('abort', () => controller.abort(), { once: true });
  try {
    const selection = picker.choose("Literal ' ; test.zip", controller.signal);
    const [result] = await Promise.all([selection, automate(path, 21000)]);
    assert.deepEqual(result, { state: 'selected', path });
    assert.equal(existsSync(path), false, 'Choosing a path does not itself create an archive');
    const archive = await new ArchiveWriter().write(await diskCapture(), (async function* () {})(), { outputFile: path }, root);
    assert.equal(archive.path, path); assert.equal(existsSync(path), true);
    const cancelled = picker.choose('cancelled.zip', controller.signal);
    const [cancelResult] = await Promise.all([cancelled, automate()]);
    assert.deepEqual(cancelResult, { state: 'cancelled' });
    assert.equal(existsSync(join(root, 'cancelled.zip')), false);
    console.log(`Native Windows dialog selected/cancelled; >20 second hold; evidence: ${root}`);
  } finally { controller.abort(); }
});
