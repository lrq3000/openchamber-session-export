# OpenChamber Session Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native implementation in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export the focused OpenChamber session into a readable and inspectable ZIP, with optional explicitly selected local files OFF by default.

**Architecture:** An independent OpenChamber panel delegates authenticated, asynchronous jobs to a bundled local service. A read-only OpenCode client captures projected messages, descendant sessions and available durable events; deterministic renderers and a streaming ZIP writer produce the archive.

**Tech Stack:** TypeScript, Node-compatible local service, `@openchamber/sdk`, a maintained streaming ZIP library, Node test runner and Playwright/Chrome.

**Spec:** `docs/superpowers/specs/2026-11-07-openchamber-session-export-design.md`

## Global Constraints

- Release `0.1.0`; creation and last update `2026-11-07`; idiomatic English throughout the package.
- All development and test writes stay in the new worktree or `C:/Users/33632/AppData/Local/Temp/opencode`; everyday installation is limited to the approved extension directory and native registration.
- Local file collection is OFF by default; selected regular files only, 100 MiB per file and 500 MiB aggregate, with explicit refusal reporting.
- Initial output directory `~/Downloads/OpenChamber-Exports`; unique output names; no archive overwrite, external downloads, model calls, new OpenCode plugin, generated-config edits, push or cleanup.
- Bind the host-provided loopback port and require its bearer token; never expose connection credentials in the panel, logs, tests or archives.

## Review Focus

- A managed OpenCode instance differs from the terminal service: connection tests must select the verified instance or fail closed.
- A chat changes while a job is pending: UI tests must retain the original export target and reset file inclusion for the new target.
- An interrupted assistant message lacks completion time: message snapshot tests must preserve it rather than inherit the transfer-export filter.
- An attachment points outside its apparent root or changes after preview: asset tests must refuse symlinks and detect changed metadata before copying.
- A long export exceeds the SDK response/time limits: service tests must return a job immediately and poll bounded metadata rather than transfer ZIP bytes.

---

### Task 1: Deterministic transcript and attachment core

**Files:** Create `plugins/openchamber-session-export/package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, `src/types.ts`, `src/markdown.ts`, `src/attachments.ts`, `tests/core.test.ts` and `tests/fixtures.ts`.

**Interfaces:** `MarkdownRenderer.render(capture: Capture): string`; `AttachmentInventory.discover(capture: Capture): Promise<AssetCandidate[]>`; shared JSON-shaped `Capture`, `CapturedSession`, `AssetCandidate` and `ExportOptions` interfaces.

- [x] Write `core.test.ts` first: assert reasoning-before-tool ordering, exact argument/output text, safe variable fences, unfamiliar-content fallback, unfinished records, and descendant sections.
- [x] Add attachment discovery tests proving only explicit attachment/artifact/image references become candidates, remote URIs are not fetched, symlinks/non-regular files are refused, and sizes are reported. OFF/no-read behavior belongs to the Task 2 export orchestrator and remains to test there.
- [x] Install pinned dependencies without lifecycle scripts, then run the focused tests and observe their missing-module failure followed by four behavior assertion failures against empty scaffolding.
- [x] Implement the shared types, deterministic renderer and inventory with source comments explaining non-trivial trust boundaries.
- [x] Run typecheck and core tests; commit the coherent deliverable.

### Task 2: Read-only capture and ZIP jobs

**Files:** Create `src/connection.ts`, `src/opencode.ts`, `src/exporter.ts`, `src/archive.ts`, `tests/capture.test.ts`, `tests/archive.test.ts` and bounded HTTP fixtures.

**Interfaces:** `SessionSource.capture(target: ExportTarget): Promise<Capture>`; `Exporter.prepare(target: ExportTarget): Promise<PreparedExport>`; `Exporter.start(preparedID: string, options: ExportOptions): Job`; `Exporter.status(jobID: string): JobStatus`.

- [x] Write tests for multi-page messages/children, cursor cycles, unavailable durable logs, log watermarks, partial records, changing revisions and zero mutation/provider calls.
- [x] Write ZIP tests that reopen the generated archive and verify contents, checksums, unique filenames and selected-file bytes; exercise changed files and no accidental inspection/copying when OFF. Further size-boundary cases remain in final review coverage.
- [x] Run tests and confirm failures before implementing the capture client and archive builder.
- [x] Implement verified owning-proxy discovery without guessed credentials or service startup; fail closed for unsupported connection layouts and enabled UI authentication.
- [x] Implement asynchronous export jobs, staging, streaming ZIP publication and explicit manifest omissions. Bounded bridge replies are tested in Task 3.
- [x] Run typecheck and all core/capture/archive tests; commit.

### Task 3: Native extension panel and service bridge

**Files:** Create `src/service.ts`, `src/panel.ts`, `scripts/build.mjs`, `openchamber/package.json`, `openchamber/panel/index.html`, `tests/service.test.ts` and `tests/ui/panel.test.ts`.

**Interfaces:** Authenticated service routes `GET /health`, `POST /prepare`, `GET /job`, `GET /inventory`, `POST /export`; all bridge bodies are JSON text. The panel uses `connectHost`, theme tokens and SDK controls.

- [x] Write bridge tests for mandatory authentication, target validation, immediate job creation and bounded polling; reject malformed target identities and unknown job IDs.
- [x] Write SDK-shaped browser tests for focus updates, default-OFF file collection, explicit preview selection, switching focus during preparation and copy-path behavior. Additional no-session and concurrent-operation cases remain part of final review coverage.
- [x] Confirm the tests fail, then implement the English-language panel, native session action, local service and build scripts.
- [x] Run `npm run build`, `npm run test:ui` and the focused service tests; capture desktop and narrow-panel screenshots under the approved temporary root.
- [x] Commit after inspecting the diff and test results.

### Task 4: Native verification, documentation and installation

**Files:** Create `README.md`, installation/verification helpers and `tests/smoke/runtime.test.ts` inside the new package; update root `README.md` and `INSTALL.md`; create `docs/superpowers/specs/2026-11-07-openchamber-session-export-validation.md`.

- [x] Add an isolated native OpenCode smoke test that supplies synthetic sessions without a paid provider and validates capture against the actual server schema.
- [x] Run typecheck, unit tests, build, browser tests and native smoke; record exact host versions and distinguish fixture from native evidence.
- [x] Obtain independent fresh-context review, address still-valid findings and run second-pass plugin review without widening scope. Honor the user's explicit decision that configuration-only files inherit the functional plugin's version.
- [x] Back up the everyday OpenChamber extension registry, install the built package into `C:/Users/33632/.config/openchamber/extensions/session-export`, and use native registration/grants without altering other entries.
- [x] Verify native discovery and available UI behavior; document any runtime restriction, remaining temporary artifacts and archive confidentiality.
- [x] Commit the verified implementation and documentation milestones.

### Task 5: Final local squash integration

**Files:** Update this checklist and verification evidence; no unrelated source changes.

- [x] Recheck the main checkout for concurrent changes; merge updated local `main` into the feature branch if necessary and rerun relevant checks.
- [x] Inspect the complete task diff and source commit descriptions; commit every completed deliverable before integration.
- [x] Run final verification and save the exact evidence used for completion claims.
- Final integration gate: squash `feat/openchamber-session-export` onto local `main` and commit using the standing self-contained intention-transfer template, including full source-commit descriptions and OpenCode / OpenAI GPT-6.1 Sol attribution. Its actual outcome is recorded by the containing squash commit, not pre-claimed in a source checkbox.
- The user subsequently approved `git fetch origin` and atomic, non-forced publication of `main` and `feat/openchamber-session-export`. Preserve feature branch/worktree and unrelated untracked files; report the resulting commit, stable installation path, verified behavior and limitations.
