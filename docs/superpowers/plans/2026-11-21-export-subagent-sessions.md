# Export Subagent Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make subagent inclusion independent of Complete versus Resume export.

**Architecture:** Pass an opt-in `includeSubagents` boolean through the existing preparation request. Gate API traversal in `SessionSource`, then apply Resume per captured session before inventory and ZIP production.

**Tech Stack:** TypeScript, OpenChamber SDK controls, Node test runner, installed Chromium with Playwright, and the existing isolated OpenCode fixture.

**Spec:** [Export subagent sessions design](../specs/2026-11-21-export-subagent-sessions-design.md)

## Global Constraints

- Reuse the existing dependencies and archive layout; do not change native import behavior.
- Use synthetic fixtures, isolated native servers, and no live installation.

## Review Focus

- Unchecked Complete must not enumerate descendants; checked resumes must traverse nested and archived children.
- Checkpoint, instruction, and message indexes must not be shared across sessions.
- Changing inclusion must invalidate exact-size evidence and reset on target change.
- Optional historical material and final parent/child restore must retain their existing boundaries.

### Task 1: Carry scope from the panel through capture and ZIP

**Files:** `src/panel.ts`, `src/service.ts`, `src/types.ts`, `src/opencode.ts`, `src/profiles.ts`, `src/archive.ts`, `README.md`, affected tests, and rebuilt panel/service artifacts.

**Interfaces:** `CaptureOptions.includeSubagents?: boolean` defaults to `false`; the panel sends an explicit boolean to `POST /prepare`; new export manifests record the choice.

- [x] Add tests for the four scope/mode combinations, invalid request types, per-session Resume records and ZIP restore, and browser checkbox/preview behavior.
- [x] Run focused tests before implementation. The new scope assertions, per-session Resume assertions, and checkbox interaction failed on the baseline as expected.
- [x] Implement scope-aware capture and per-session Resume assembly. Keep optional earlier history tied to the selected root only. Share the UI preparation request between preview and direct export.
- [x] Rebuild and run typecheck, unit tests, existing Chromium UI tests, and isolated native smoke tests. Review the resulting diff and commit the single cohesive change.

**Validation:** The Windows host's installed Chromium passed the SDK panel tests, including emulated touch and Electron user agents. The isolated OpenCode 2.3.2 server shipped with OpenChamber passed the native transfer and projected-capture tests when run serially under Node, without starting the live host or inheriting provider credentials. The real Windows chooser and installed-panel tests remained opt-in and were not run.
