# Resume Selector Implementation Plan

> **For agentic workers:** Use `executing-plans` for this one-task change; track execution in this retained checklist.

**Goal:** Keep the visible export mode synchronized with the selected profile.

**Architecture:** The panel owns `profile`; the SDK selector is controlled through `SelectHandle.update`. Refresh must forward both the selected value and disabled state. Keep existing export behavior and SDK controls.

**Tech Stack:** TypeScript, OpenChamber SDK 2.7.1, Node test runner, Playwright with installed Chrome.

**Spec:** `docs/superpowers/specs/2026-11-14-resume-selector-design.md`.

## Global Constraints

- Work only on `fix/resume-selector` under `.worktrees/fix-resume-selector`, based on `origin/main` at `c44af02`.
- No push, merge, installation update, private-session export, dependency change, or evidence cleanup.
- Keep the separately requested Windows ACL fix out of the selector commit.

## Review Focus

- Reopening the popup must mark the selected profile, not the initial default.
- Complete must remain selectable after Resume, including repeated round trips.
- Unrelated checkbox changes must not reset the selector presentation.
- Existing busy-state disabling must remain intact.
- Browser, touch, and Electron-user-agent contexts must exercise the same real bundled SDK control; do not claim native desktop verification.

## Task 1: Synchronize the controlled profile selector

**Files:** `src/panel.ts`, `tests/ui/panel.test.ts`, `openchamber/panel/app.js`, and the directly related design/checklist.

**Interfaces:** Consume existing `profile: ExportProfile`, `refresh(): void`, and `SelectHandle.update`; preserve all service request payloads and public APIs.

- [x] Create the isolated worktree, fast-forward from upstream, and install pinned development dependencies without lifecycle scripts.
- [x] Run the upstream baseline: 74/75 unit tests pass; the upload-restart ACL failure reproduces alone before source changes. User approved continuing and requested that failure be fixed in a separate commit.
- [x] Add rendered assertions that catch omission of `value` from selector updates: label, selected popup option, history visibility, round trips, refresh persistence, and existing busy-state disabling.
- [x] Run `node --import tsx --test tests/ui/panel.test.ts`; Resume history was visible while the label incorrectly remained Complete. RED evidence: `C:/Users/33632/AppData/Local/Temp/opencode/session-export-ui-zbU4wV/panel-resume-browser.png`.
- [x] In `ExportPanel.refresh(): void`, forward `value: this.profile` alongside the existing disabled state, with a concise rationale comment.
- [x] Build and typecheck pass. With the installed Edge override, `node --import tsx --test --test-skip-pattern="archive export flow" tests/ui/panel.test.ts` passes 2/2, exercising real selector round trips in browser, touch, and Electron-user-agent contexts. GREEN screenshots: `C:/Users/33632/AppData/Local/Temp/opencode/session-export-ui-FU3vfU/`.
- [ ] Run final unit/full-UI verification and fresh-context whole-branch review after the separately requested ACL and touch-test fixes.
- [x] Review the selector diff and prepare its isolated local commit with conventional message and harness/model attribution.

## Execution ledger

Pre-flight: one task, no shared interfaces. The committed checklist is the progress record; avoid extra shell-managed scratch infrastructure for this small Windows task. Retain all temporary evidence for manual cleanup as requested.

Browser environment: the Browser plugin described by the frontend skill is unavailable, and Chrome is not installed. Use the repository-supported `SESSION_EXPORT_BROWSER=C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` override for installed Chromium-based Edge, without downloading a browser. The SDK history checkbox includes its description in its accessible name, so its regression locator matches the label prefix rather than incorrectly requiring an exact label-only name.

The broader existing archive-flow test reached a touch interaction failure after the selector checks passed: the generated-image checkbox remained unchecked and Create archive did not publish an archive. The user requested that issue be fixed in a third commit, after the ACL fix. The selector checks are a separate subtest using the same host fixture, allowing targeted GREEN verification without silently suppressing the broader failure. A synthetic favicon response avoids an unrelated fixture-only 404 in the selector console-health check. Busy-state assertions remain in the archive-flow subtest and need the final full run.
