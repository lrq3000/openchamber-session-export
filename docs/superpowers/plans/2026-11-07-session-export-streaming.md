# Session Export Streaming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for implementation in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export long sessions without a cumulative memory-size ceiling and request a ZIP destination on local Windows desktop while preserving web/manual paths and native export.

**Architecture:** A disk-backed capture store and unpacked streaming JSON operations replace whole-chat arrays/strings. The existing authenticated async service exposes bounded metadata, archive jobs and a native-dialog job; the panel never receives archive/evidence bytes.

**Tech Stack:** TypeScript/Node, `@openchamber/sdk`, `stream-json`, `yazl`/`yauzl`, Node tests, Playwright/installed Chrome, Windows PowerShell STA/WinForms for local Save As.

**Spec:** `docs/superpowers/specs/2026-11-07-session-export-streaming-design.md`

## Global Constraints

- Release `0.2.0`; creation `2026-11-07`, updated `2026-11-08` after explicit refreshed approval; English source/docs/UI. Configuration files inherit the plugin release.
- Worktree `.worktrees/session-export-streaming`, branch `feat/session-export-streaming`, starting from `ca61a35`; no installed OpenChamber/app.asar patches.
- Keep archive schema `/1`, full projected evidence, source order, optional-log warnings, core-capture failure boundaries, default-OFF assets, 100 MiB/file and 500 MiB/selection limits.
- No total transcript/page/log size guard or fixed total-operation polling cutoff. Bound active buffers and metadata delivery; preserve actual input/network/disk error detection.
- Only authorized host service, fixed native executable, conservative local-client decision, browser manual path fallback; cancellation must not write.
- Synthetic artifacts only for tests; no model calls or private-chat exports. Retain temporary evidence/manual cleanup; preserve unrelated files, extensions and old worktrees.
- Approved final actions: backed-up update of `C:/Users/33632/.config/openchamber/extensions/session-export`, targeted native reload, squash main and atomic non-forced origin publication of `feat/session-export-streaming` and `main`.

## Review Focus

- A single huge JSON string or backtick run must not be reassembled just because the whole-session arrays disappeared; verify large-value and cross-chunk fencing tests in Task 1/2.
- A remote/browser client must not accidentally open a Windows dialog on the host; verify conservative dispatch and uncertain-client/manual fallback in Task 3.
- A long dialog or capture must outlive individual SDK requests and the old fifteen-minute polling cutoff; verify acknowledged jobs and simulated elapsed time in Task 3.
- Optional-file discovery and duplicate/cursor indexes must not grow as unbounded evidence arrays; inspect disk-backed paths and many-reference/identity tests in Task 2.
- Native export must remain separately available, including desktop menu ordering differences; verify both native and contributed rows in Task 4, not only the custom action.

---

### Task 1: Streaming JSON and disk capture primitives

**Files:** Add `src/json-stream.ts`, `src/capture-store.ts`, focused tests; update package/lock and build/type configuration only as needed. Record decisions in the adjacent validation document.

**Interfaces:** `JsonDocument` provides asynchronous selection of JSON subvalues, scalar metadata and chunked text/JSON output without whole-value packing. `CaptureStore` owns disk paths, streamed session/message/event evidence and identity/inventory indexes. Concrete typed descriptors remain backend-only and replace large in-memory data, not bridge payloads.

- [x] Write tests for lossless streamed JSON, large values/Unicode, disk identity checks and selectable subvalue/text streams; observe failure before implementation.
- [x] Install pinned dependencies with `npm install --ignore-scripts --no-audit --no-fund`; implement the primitives with backpressure and explicit stream failure propagation.
- [x] Run typecheck and focused primitive tests; expected all pass with no whole-input allocation. Commit the coherent working primitives.

### Task 2: Progressive capture, rendering, inventory and ZIP

**Files:** Update `src/opencode.ts`, `src/markdown.ts`, `src/attachments.ts`, `src/archive.ts`, `src/exporter.ts`, `src/types.ts`; update/add capture/archive/core/stress tests and fixtures.

**Interfaces:** `SessionSource.capture` produces a file-backed snapshot for production. `ArchiveWriter`/`MarkdownRenderer` consume progressive evidence. `Exporter.prepare/start/status` retain bounded descriptors and bridge-compatible metadata; preserve fixture adapters only where genuinely needed by existing tests.

- [x] Add an expected-success regression exceeding the old evidence budget and observe failure against the original implementation.
- [x] Implement paginated capture to disk, incremental Markdown/JSON/log generation, progressive selected-asset discovery and streaming checksum/ZIP publication; remove cumulative limits without simply relocating the allocation.
- [x] Exercise one huge string, split Unicode/backticks, cursor/identity failures, optional-log watermarks, unchanged OFF/no-inspection behavior, many references and safe failed publication.
- [x] Add a memory-limited child stress test over at least 256 MiB and streaming archive verification; expected successful capture/export with correct bytes/counts/checksums. Test forced ZIP64 independently.
- [x] Run typecheck/build and the full unit/stress/native-API suites as applicable; expected zero failures and zero provider calls. Commit.

### Task 3: Desktop destination and persistent async UI

**Files:** Add `src/save-dialog.ts`; update `src/service.ts`, `src/service-entry.ts`, `src/panel.ts`, `src/types.ts`, panel markup and service/UI/native-dialog tests.

**Interfaces:** Native destination requests return a job ID immediately; status distinguishes pending, selected, cancelled and unavailable/error. Selected destinations remain server-side validated and frozen. The panel sends native requests only for conservatively identified local desktop context and otherwise keeps `outputDirectory`.

- [x] Write failing tests for local desktop Save As, unavailable/ambiguous/browser fallback, cancellation without write, duplicate dialog prevention and slow chooser acknowledgement.
- [x] Implement the fixed PowerShell STA dialog with data-only parameters and controlled child lifetime; remove the fixed total polling deadline without removing transport/error checks.
- [x] Verify focus/selection behavior, busy guards and long-running job polling through the real SDK fixture; expected no unintended export after cancel or target switch.
- [x] Run typecheck/build, service/unit/UI tests and an isolated actual Windows dialog check. Record any client-detection/focus limitation rather than claiming an SDK guarantee. Commit.

### Task 4: Native coexistence, review, deployment and publication

**Files:** Update native smoke/installer tests, `scripts/install.mjs`, package/runtime release labels, plugin README, root README/INSTALL and this plan/validation record. Keep generated bundles and runtime artifacts untracked.

- [x] Verify native Export Markdown and Export complete session coexist in actual menus; allow Mini Chat/other-extension ordering and record whether the reported disappearance reproduces.
- [x] Apply the approved `0.2.0` release mirrors/dates once; validate schemas and absence of independent configuration metadata. Add guarded existing-installation update/backup coverage if needed.
- [x] Run the full verification commands and the stress test; inspect relevant screenshots and native dialog evidence. Complete one independent whole-branch review and fix material findings with regression checks.
- [x] Back up the existing extension/registry, update only its built files after precondition checks, reload only this extension and verify native discovery/service/UI behavior plus web fallback.
- [ ] Commit evidence, recheck main/origin synchronization and unchanged approval, then squash locally with standalone intention and full source descriptions. Publish both approved refs atomically, verify remote hashes, retain all branches/worktrees/backups and report actual limits.

The final checkbox is deliberately a live publication handoff: the committed execution record is a pre-publication snapshot, and the final chat report records the verified remote hashes after the atomic push. Do not claim a commit verified its own future publication.
