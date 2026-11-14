# Panel Touch Fixture Implementation Plan

> **For agentic workers:** Use `executing-plans` and retain this checklist as the execution ledger.

**Goal:** Exercise actual touch taps without parent/iframe scroll-coordinate interference in the synthetic panel fixture.

**Architecture:** Keep product code and SDK unchanged. Make the fake host's iframe viewport-sized, require real post-tap state, and retain bounded diagnostic events for failures.

**Tech Stack:** Node test runner, Playwright, installed Chromium-based Edge 130.

**Spec:** `docs/superpowers/specs/2026-11-14-panel-touch-fixture-design.md`.

## Global Constraints

- Third local commit, after the selector and ACL commits.
- Only `tests/ui/panel.test.ts`, related design/checklist, and synthetic temporary evidence may change.
- Keep actual `.tap()` interactions; no retries, forced input, arbitrary sleeps, timeout increases, dependency changes, installation, publication, or cleanup.

## Review Focus

- Controls below the initial viewport must still receive real touch/click activation.
- The synthetic parent document must not introduce an extra scroll owner.
- File selection must be asserted before export, not inferred from a later result.
- Busy-state and cross-session target checks must remain intact.
- Phone screenshots and long-warning/title overflow checks must still exercise the real panel.

## Task 1: Bound the synthetic iframe to its host viewport

**Files:** `tests/ui/panel.test.ts` and directly related design/checklist.

**Interfaces:** Preserve the SDK host message fixture, service bridge, all product code, and actual touch calls.

- [x] Reproduce the archive-flow failure after the ACL commit. Full UI baseline: selector/import/companion checks pass, archive flow and its parent fail; log: `C:/Users/33632/AppData/Local/Temp/opencode/session-export-ui-before-touch.log`.
- [x] Add touch/click diagnostics and immediate checked-state assertion. RED: touchstart/touchend reached the file checkbox, but no compatibility click followed and it remained unchecked.
- [x] Test one explicit center-scroll hypothesis; it still failed, with a click at iframe y=509 targeting Create archive after touch events near y=450. Remove that experiment.
- [x] Replace only the fixture's 900px iframe height with `100dvh;display:block`. GREEN: the touch/click events agree near y=390 and the full archive flow passes 2/2 with the selector subtest omitted. Evidence: `C:/Users/33632/AppData/Local/Temp/opencode/session-export-ui-LwPeQb/`.
- [x] Retain immediate selection and parent-overflow assertions plus synthetic touch evidence, without noisy routine event logging.
- [x] Full UI suite passes 5/5 twice, including both panel subtests; typecheck passes. Logs: `C:/Users/33632/AppData/Local/Temp/opencode/session-export-ui-touch-green-1.log` and `session-export-ui-touch-green-2.log`. Phone review and Resume screenshots were inspected. Prepare the separately requested third commit with the test correction and final ledgers.
- [x] Final unit suite passes 76/76 (`C:/Users/33632/AppData/Local/Temp/opencode/session-export-final-unit.log`). Independent read-only whole-branch review reports no Critical, Important, or Minor findings and confirms the third milestone is ready to commit. No deferred review findings.

## Execution ledger

Pre-flight: one task; no product interfaces change. The evidence identifies a fixture geometry issue rather than a selector/SDK state defect. The successful fixture correction preserves real touch input and uses existing actionability checks, not pacing or retry workarounds.

Final review scope decisions: native Electron/mobile clients, native dialogs, installed-extension behavior, runtime POSIX permissions, and live Windows ACL/SACL behavior remain untested by this isolated change; no corresponding runtime guarantees are claimed. Unchanged native import, Resume assembly, recovery, and archive-content contracts were not independently recertified beyond the executed existing unit/UI suites. The reviewer did not inspect current remote freshness; the implementer's separate `git ls-remote origin refs/heads/main` still returned `c44af02d4ee333d8d453c05d857302d11b6b33dc` after implementation. Later upstream movement would require a new synchronization check before integration. Keep branch/worktree and synthetic temporary evidence; publication, integration, installed-extension update, and cleanup remain unauthorized.
