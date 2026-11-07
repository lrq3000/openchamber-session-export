# OpenChamber Session Export

## Intent and approved scope

Add an independently installable OpenChamber extension that exports the focused conversation for reading, private archival and technical analysis. The user approved implementation, dependency installation, isolated tests, installation into the current OpenChamber profile and a final local squash merge onto `main`. No push, branch deletion, worktree deletion, unrelated configuration changes or paid model calls are authorized. All source, comments, documentation and extension labels must use idiomatic English.

The repository is `C:/Ai-Apps/MyGPTs/AGENTS-MD`. Implementation takes place only in `.worktrees/openchamber-session-export`, on `feat/openchamber-session-export`. Preserve the main checkout's existing untracked archives and experimental files. The initial release is `0.1.0`, with creation and last-update dates `2026-11-07`.

## User experience

Provide a native extension side panel with an `Export session` button and a session-menu action opening the same panel. Follow the focused session through the OpenChamber SDK. Freeze the target session and directory when an operation starts; never silently switch an in-progress export to another chat. Display the target title and identifier, progress, warnings and the resulting archive path. Provide `Copy path`. Use the SDK UI kit and host theme rather than an unrelated visual style.

`Include referenced local files` is OFF by default and resets to OFF on a target change. When enabled, prepare an inventory of explicit file references, show paths and sizes, and require selection before copying files. Do not recursively scan directories, execute content, download remote resources or interpret arbitrary prose as a request to copy files. Structured attachments, file tool content, Markdown image references and explicit tool-artifact paths are candidates, not blanket filesystem permission. Files that are missing, changed, too large, non-regular or symbolic links must be accounted for. The initial per-file limit is 100 MiB and aggregate selected-file limit is 500 MiB; expose these limits and report refused files instead of truncating them.

The initial destination is `~/Downloads/OpenChamber-Exports`. A user can choose a different absolute output directory. Create unique archive names and never overwrite an existing archive. Save archives on the machine hosting the extension service; this is not a browser download API. An ordinary ZIP does not provide encryption. Warn that transcripts and tool outputs can contain secrets.

## Architecture and connection

Create `plugins/openchamber-session-export/` as a TypeScript development package and its independently installable `openchamber/` subdirectory, following Context Churn Monitor's packaging convention without depending on its runtime. Bundle the panel as a classic IIFE and its local service as CommonJS. The installed extension needs no separately installed Node packages. No new OpenCode backend plugin or permanent recorder is planned.

The sandboxed panel communicates through `connectHost().serviceRequest`. Requests and responses carry JSON text. Operations that may exceed the SDK's 20-second limit run as asynchronous jobs; return only identifiers, bounded inventories, progress and filesystem paths through the bridge. Bind the service to the host-provided loopback port and authenticate every request using the host-provided bearer secret. Never return credentials to the iframe or archive.

Connect to the OpenCode server actually used by the OpenChamber instance. Inspection found OpenChamber 2.6.1 running managed OpenCode 2.2.5 separately from the terminal's OpenCode 2.2.1. Do not guess ports, scan listeners, scrape credentials from process command lines, start a replacement server, or modify generated managed configuration. Use the verified managed-server connection contract, fail closed on ambiguity, validate loopback destinations and verify the target session's directory. If a new backend component, configuration mutation or secret is necessary, stop and obtain approval for that expanded scope.

## Archive contract

Each ZIP contains `conversation.md`, `session.json`, `manifest.json`, optional `subsessions/<session-id>.json`, available durable logs under `events/<session-id>.jsonl`, and explicitly selected external files under `assets/`. Preserve projected OpenCode objects without dropping unknown fields. `session.json` contains the session information and the complete paginated projected-message snapshot, including unfinished messages when the message API exposes them; it is not falsely described as a byte-identical native transfer export. The manifest identifies this schema and the source APIs. Existing embedded attachment data remains in these objects even when external-file collection is OFF.

Read all message pages in ascending order, detect cursor loops and duplicate IDs, and traverse child sessions with cycle detection and paginated child listings. Preserve the recorded order of assistant content, including `text`, `reasoning` and `tool`. Render tool arguments, results, errors and unfamiliar content safely using fences longer than any fence in the source. Include non-conversation projected records rather than silently dropping them. Sub-sessions receive separate sections and JSON files, not invented interleaving with their parent.

A failed transcript page, inconsistent pagination or failed descendant enumeration aborts preparation; no successful archive is published from that capture. Durable logs and explicitly optional external assets may be unavailable, but their omissions must be prominent. This fail-closed rule resolves the independent builder check without weakening the user's request for a complete conversation export.

Read the experimental durable session log with `follow=false`; preserve events through its captured watermark and record the `log.synced` marker. If unavailable, retain the transcript and disclose the missing log. This is not the provider's wire traffic, hidden reasoning, or an unbounded live capture. No API can recover data never exposed or retained by the host. Record capture times, active-session status, before/after session revisions, unavailable records, asset decisions, file checksums and archive-entry checksums. A changing session is explicitly a non-atomic snapshot, not an assertion of exhaustive coverage.

Build archives with an established streaming ZIP library, not a custom ZIP implementation. Keep source-page data and archive construction away from the iframe and do not send large archives through the bounded SDK bridge. Use unique staging directories; failed jobs never publish a successful final archive. Retain temporary artifacts for manual cleanup, in accordance with the standing policy.

## Installation and integration

Copy the built extension into the new stable directory `C:/Users/33632/.config/openchamber/extensions/session-export`; refuse to overwrite any pre-existing installation without comparison and approval. Register the folder through OpenChamber's supported native installer (`POST /api/guests`, path body) and approve only its declared capabilities through the native workflow. Back up the extension registry under the approved temporary root before installation, preserve existing extensions and report native discovery separately from test-fixture success. Do not edit OpenChamber's generated OpenCode configuration.

Update the root README catalog and INSTALL guide. Keep reproducible tests and source evidence in Git; exclude generated bundles, dependency directories, ZIP files and runtime data. Use small local conventional commits. After independent review and successful final checks, squash onto local `main` with a self-contained intention-transfer message including motivation, achieved behavior, architecture and trade-offs, full source-commit descriptions, agentic stack and verification evidence. Preserve the source branch and worktree; no push is authorized.

## Validation and anti-goals

Test pagination, unknown content, Unicode, reasoning/tool ordering, interrupted records, durable-log coverage, nested/archived children, missing or ambiguous connections, loopback confinement, credential non-disclosure, default-OFF file collection, explicitly selected regular files, file-size and symlink handling, unique ZIP names, ZIP byte integrity, errors and changing focus. Use real SDK contracts in a headless Chrome fixture and isolated OpenCode sessions without paid providers. Verify native OpenChamber installation where its current connection contract permits. Clearly report any unverified native behavior.

Do not build a model-powered summarizer, universal backup system, automatic redactor, global filesystem crawler, server lifecycle manager or hidden-reasoning extractor. Do not promise native transfer import compatibility for unfinished snapshot records. A future remote-download or forensic-capture feature needs a separate design and approval.
