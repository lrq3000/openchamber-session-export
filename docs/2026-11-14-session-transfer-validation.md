# Session transfer implementation and validation

Date: 2026-11-14. Source version: 0.4.0, implemented from standalone 0.3.0 baseline `9339f4204a07932ba6f7b52b2da86488a761c226`. These are local development results, not evidence of a published release, remote CI run, or live installation.

## Delivered scope

- One OpenChamber package with a classic-script panel, Node service and self-contained ESM OpenCode plugin. Root/folder manifests and version labels are aligned; plugin files and ZIP-reader licenses are included in packaging checks.
- Complete and Resume exports, native effective compaction/recent-context handling, interrupted-tail retention, real object-shaped pins, durable API instruction entries, optional inactive historical text, and explicit file recommendations/selection.
- Known-size/category previews, clearly labelled compressed estimates, exact measurement through real compression, and cache reuse without a second compression for an unchanged preparation.
- Server-path import, bounded device-file upload, Files navigation/copy-path, optional scoped companion download, and separate preview/confirmation with the exact required italic notice.
- Safe archive staging/checksums/resource budgets, fresh session/message/tool/shell IDs, topological import, attachment hydration, copy-only interruption adaptation, native read-back verification, and explicit partial outcomes.
- Persistent mutation journals, per-job reservations, cancellation boundaries, uncertain-ID reconciliation, bounded control metadata, and stable job locators for offline inspection across host PID changes. Status reads never replay mutations.

## Environment

Linux, Node 24, published SDK 2.7.1 and isolated OpenCode 2.3.0 child processes. Native fixtures use private homes/configuration and synthetic process passwords; they do not discover another service or inherit provider credentials. A provider trap recorded zero calls in the native capture smoke.

Browser QA used Playwright 1.64.1 and Chromium Headless Shell 156.0.8078.4, selected explicitly from `/tmp/opencode/session-file-transfer-investigation/`. The guide's Browser plugin/`browser` skill was not available; no personal browser or live OpenChamber instance was used. Viewports included 720, 480 and 360 pixels, with separate touch/mobile emulation and controlled Electron user agents. Emulation is not real Android or Electron validation.

## Checks

| Command | Result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm run build` | Passed, including panel/service/plugin bundles; no former CJS `import.meta` warning. |
| `npm test` | 75 passed, 0 failed. |
| `npm run test:smoke` | 4 passed, 0 failed; 2 explicitly opt-in installed-interface/Windows-dialog cases skipped. |
| `npm run test:ui` | 3 passed, 0 failed. |
| `npm run test:stress` | Passed: 256 MiB evidence, one 160 MiB tool value, 96 MiB V8 heap limit; measured peak heap 44 MiB, peak RSS 297 MiB. |
| `git diff --check` | Passed. |

The four built panel/service/plugin artifacts were rebuilt again and compared by SHA-256; all reproduced byte-for-byte. The final focused native round trips and all three UI cases also passed after the last adapter/UI corrections.

The stress case tests the progressive export pipeline, not unrestricted native import. A separate ZIP64 fixture tests interoperability, not a real >4 GiB transfer. Package tests exercise copied production assets without `node_modules`; CI also requires the new plugin assets to be committed. Validation initially ran before those files were committed; the separately approved Git integration includes the required generated artifacts and rechecks tracked packaging before publication.

### Native round trips

`tests/smoke/restore.test.ts` imports a Complete ZIP into a different working directory, preserving an existing destination session and source ZIP/files. It verifies fresh parent/child IDs, actual pin objects, imported instructions, selected legacy-attachment hydration, an unfinished assistant followed by later text, interrupted shell and compaction records, exact restored bytes, negative channel authentication/allowlist cases, and duplicate-start refusal.

`tests/smoke/resume.test.ts` captures through the packaged plugin, exports the effective context, then restores it through the official importer. The compaction summary and engine-assembled recent text match; earlier visible conversation remains consultable only in the historical document; obsolete tool output is absent from Resume messages/history; pins and durable instructions survive. No model generates a replacement summary.

The assistant interruption representation uses the engine's `aborted` semantics to retain text through native model-facing conversion. The suite verifies native projected context/transcript preservation without generating a new answer; it does not compare provider-tokenized prompts.

### Adversarial and recovery cases

Unit tests reject unsafe ZIP names, traversal, absolute paths, Windows devices/streams, case and file/directory collisions, links, encryption, declared expansion bombs, undeclared entries and checksum mismatches. Schema 1 remains explicitly readable. Companion tests cover one-time redemption, Origin checks, scoped cookies, replay/expiry, changed archives, HEAD and valid/invalid byte ranges.

Recovery tests cover concurrent prepare/start calls, cancellation before start and during the final mutation, lost native/plugin acknowledgements, interrupted-instance journals, native read-back loss detection, invalid instruction keys/JSON values, upload replay/resume and rename-before-ready recovery. Reproductions from independent review became regressions for journal write/read failures after native acceptance, oversized archive warnings and offline status inspection after a managing-host identity change.

Native API mutation outcomes are not made transactional across several sessions. A failure can leave confirmed sessions, incomplete finalization and copied/partial files. The implementation reports those outcomes, retains journals and never deletes created work to pretend rollback.

### Rendered UI evidence

The export UI suite checks target changes, explicit file inclusion, manual/native-chooser routing, cancellation/unavailability and narrow/touch layouts. The import UI suite checks exact-measurement reuse, both server-path and uploaded-file previews, no creation before confirmation, fresh IDs on repeat restoration, Files navigation, imported-session navigation, repeat status reads and the notice's exact text, `<em>` tag, computed italic style and visibility. A third UI test runs the actual companion page, checks fragment removal and HttpOnly authorization, downloads 2 MiB through the browser and compares SHA-256 hashes. Page identity/content, console errors, wrapping and screenshots were checked. The native import boundary is simulated in the UI fixture; actual native writes are tested separately above.

Retained final-run evidence:

- `/tmp/opencode/opencode/session-export-import-ui-1XC0Ln/`: import desktop/narrow screenshots and a focused phone-width import result.
- `/tmp/opencode/opencode/session-export-ui-1KextB/`: export desktop/narrow/touch screenshots.
- `/tmp/opencode/opencode/session-export-companion-ui-gDr7En/`: companion page and checksum-verified browser download.
- `/tmp/opencode/session-export-import-contract-cpDJVq/`: native capture/log evidence.
- `/tmp/opencode/session-export-large-session-aNtrMw/`: progressive stress evidence.

Earlier isolated probes/tests also left temporary directories under `/tmp/opencode/`. They contain synthetic but potentially voluminous uncompressed evidence and were intentionally retained for manual cleanup. No system packages or user's normal browser configuration were changed.

## Compatibility and remaining limits

- Real Windows/Electron execution, Windows private-directory ACL behavior, native Save As, real Android/iOS execution and remote-platform CI were not run here. The two opt-in smoke skips are explicit, not passes. The earlier tunnel proof used actual native scanner/client/server components, not an Electron application run.
- Managed instance binding currently assumes plugin/service processes share an OpenChamber parent PID. Unsupported wrappers/external servers fail closed. Offline journal reads expose recorded outcomes, not proof that the same sessions exist in a newly selected database.
- Import safety limits are 8 GiB compressed staging/upload, 2 GiB expanded ZIP, 10,000 entries, 512 sessions and 64 MiB aggregate adapted session JSON. Instruction-list input is bounded at 2 MiB per session; each native instruction value is at most 256 KiB. Large path/file mappings also have explicit control-file limits. These are implementation safety budgets, not a benchmark of the native import endpoint's ultimate maximum.
- Only captured session instructions, active projected context and portable pins are restored. External repository/worktree state, knowledge stores, global configuration, skills, MCP services, models and credentials must exist independently at the destination. Archives and previews state these dependencies. Opaque provider checkpoints may require the original provider/model.
- Optional external files remain limited to 100 MiB each and 500 MiB selected total. Historical prose/tool arguments are not blindly rewritten. Missing legacy attachment bytes require a selected archived copy; no remote URL or historical disk path is fetched during import.
- ZIPs are unencrypted. Checksums do not establish provenance, and active imported instructions can affect later agent behavior. Import only trusted archives and retain a source copy.

## Operational boundary

The implementation/validation phase performed no live extension installation, service restart, host-source modification, direct SQLite write, infrastructure change, commit, push or publication. The user subsequently approved a separate Git integration: preserve the implementation on `archive/feat/session-transfer`, squash into linear `main` with a self-contained intention message, and push both refs without force. No branch/worktree/cache deletion, live installation or deployment is included. Further platform validation or deployment requires a separately approved environment and operation.

## Finishing review

Independent read-only review identified concrete recovery, cancellation, interruption-fidelity, attachment and file-handle issues; the relevant fixes and regression cases are described above. The finishing pass checked the source entrypoints, root/folder manifests, generated plugin packaging contract, installer approvals, schemas, release mirrors, documentation and test coverage. There are no `SKILL.md` files or separate agent-skill release units in this repository. Generated bundles were checked for reproducibility and execution rather than reviewed as handwritten source; lockfiles were checked for release/dependency consistency. No extra feature or dependency was added merely to satisfy review.

The functional release owner remains the root package, with the existing nested extension manifest as a synchronized mirror. The generated private backend package and compiler/CI configuration inherit that release; they do not introduce independently versioned products. Version 0.4.0 is the single minor increment from the 0.3.0 baseline for this coherent feature revision. Existing creation date 2026-11-07 is preserved from the release records, and the update date remains 2026-11-14. No further metadata change or publication is proposed by this pass.
