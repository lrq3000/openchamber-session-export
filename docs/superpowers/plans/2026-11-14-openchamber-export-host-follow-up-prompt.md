# Standalone prompt: native complete-export support in OpenChamber

## Receiving task and scope

Work in the **OpenChamber repository**, separately from the Session Export plugin. Inspect the current implementation first, then propose the smallest native changes and obtain the operator's approval before editing. The user wants the Session Export extension to produce complete session archives from Windows, Linux and macOS desktop or standalone/headless hosts and let a phone download the resulting ZIP, including through native and relay clients. This prompt records a deferred task, not authorization to install, push, publish, merge or mutate a live host. Do not modify the Session Export repository in this host task without separate approval.

## Existing plugin and why this host task exists

The independent plugin source is https://github.com/lrq3000/openchamber-session-export. Its 0.3.0 implementation opts the existing `panel/index.html` into phones with `contributes.panel.mobile: true`; the session action is `export-session` / “Export complete session”. The host owns its mobile workspace/dialog presentation. All existing options remain in that panel: selected-session identification, external-file inclusion OFF by default, explicit file review/selection, host output directory, progress, archive location and Copy path. Windows Save As is only an optional local-desktop convenience; Linux/macOS/headless/mobile use a host-side directory.

The approved service declares `provides: ["opencode"]`, so native approval requests `service` and implicit `opencode`. It receives `OPENCHAMBER_OPENCODE_URL` and authenticates with `OPENCHAMBER_SERVICE_TOKEN`. It performs GETs only, follows no redirects and never reads OpenChamber settings, scans listeners, starts another server or extracts UI/upstream credentials. The upstream version is `null` because the native allowlist excludes `/api/info`. An old service-only installation cannot be silently reapproved by the plugin's update script.

The archive pipeline is already disk-backed and progressive: Markdown, exact projected JSON fields, descendants (including archived children), optional durable event logs through `log.synced`, explicitly selected local assets, and a manifest with coverage warnings and SHA-256 checksums. There is no successful partial core transcript: failed message pages/descendant enumeration/cursors abort preparation. Optional logs/files may be unavailable only with explicit recorded reasons. Publication uses a no-overwrite hard link; staging/capture evidence is deliberately retained for manual cleanup. ZIP bytes never currently enter the iframe and the archive is not encrypted.

The plugin-only work deliberately deferred these host gaps:

1. The native OpenCode read bridge limits each response. Even paginated message access cannot export one message/tool string larger than that limit; reducing the page count alone cannot solve it. The plugin aborts failed/terminated core reads rather than silently truncate them.
2. The bridge allowlist excludes `GET /api/experimental/session/<id>/log?follow=false`. Existing denied-log exports record warnings rather than inventing events.
3. The SDK's `serviceRequest` is a bounded text metadata bridge. The served extension document has an opaque-origin sandbox without `allow-downloads`. There is no supported general binary artifact-save method for the plugin across browser, native and relay clients. An archive path on the host is not a device download.

These limits were inspected in the published SDK 2.7.1 and upstream main identifying itself as OpenChamber 2.7.1 on 2026-11-14; this is not proof that your current checkout or packaged host is identical. Some service-document mobile-support paragraphs were stale relative to `API.md`; follow tested source/runtime behavior and correct contradictory documentation. Recheck current capabilities before designing anything new.

## Discover and reuse first

Inspect the current SDK contract, manifest parser, protocol schemas, service process spawn/proxy, OpenCode read-connection provider, host bridge, runtime file-download adapters and relay authentication. Known relevant paths in the inspected tree were:

- `packages/sdk/GUEST_SERVICES.md`, especially “OpenCode access”, and `packages/sdk/API.md`.
- SDK source counterparts of `contract`, `host`, `protocol`, `manifest` and `parse` (locate current exact filenames before editing).
- `packages/web/server/lib/guests/service.js`: `openGuestServiceRequest`, `proxyGuestServiceRequest`, and the provider's `environmentFor` call. Locate the OpenCode provider from `OPENCHAMBER_OPENCODE_URL`; do not guess its module path.
- `packages/web/server/lib/guests/routes.js` and `DOCUMENTATION.md`: authenticated service routes and guest-asset serving/sandbox.
- `packages/ui/src/lib/guests/host-bridge.ts`, `service.ts`, `open-url.ts` and the native/relay runtime download code they connect to.
- `packages/web/server/lib/fs/routes.js`: existing authenticated disk-streaming/range mechanics. Do not give a sandbox guest generic access to these routes or reuse the UI session token as its credential.

Reuse an already-supported equivalent if current OpenChamber now provides one. Do not add a second exposed HTTP listener, an OS-specific export mechanism, filesystem crawling, a backend plugin or a workaround that bypasses the SDK sandbox. Keep unrelated services' ordinary metadata caps and approval scopes unchanged.

## Required outcome A: complete, restricted evidence streaming

Provide a supported, explicitly approved service path to the complete evidence needed for session export while keeping OpenCode/upstream authentication in the host. Preserve the GET allowlist: add only justified export reads, not configuration, credential, write, prompt, plugin-RPC or arbitrary directory-scoped access. Directory-scoped reads must not inadvertently start that directory's MCP servers. Expose the actual OpenCode version through a narrow safe metadata contract if available; do not relabel the OpenChamber version as OpenCode's.

Support complete paginated session/message/descendant reads and individual huge strings with bounded host/service memory and real backpressure. Remove the export limitation without merely raising a fixed arbitrary cap or buffering an entire response in `text()`, `json()`, a string, base64 or a Blob. Keep ordinary SDK metadata caps for other callers. Allow finite durable-log capture with `follow=false` and an explicit `log.synced` watermark; do not substitute a live recorder or events the host never retained.

Each export must either stay pinned to the originally selected backend identity or fail explicitly if the host switches OpenCode during capture; it must not silently combine pages from different backends. Describe whether you implement a scoped connection lease, identity/revision check or equivalent existing mechanism. Sequential API reads are still not a transaction; do not claim atomicity merely because the connection is pinned. Preserve upstream errors and abort/idle semantics; an interrupted stream must never become an empty/partial successful response. Recheck approval/policy and backend identity during streams, including revocation and shutdown.

## Required outcome B: authenticated native artifact delivery

Expose a narrowly scoped host/SDK artifact registration and download operation, or reuse its supported equivalent. The service should register exactly one completed archive it owns, and the user should invoke a host-rendered “Download ZIP” action. Validate/open the exact regular file without following a swapped symlink, traversing a user-supplied path, reading unrelated service files or handing an iframe a broad filesystem capability. Revalidate file identity/size as necessary across registration and opening; support Unicode/long filenames and never overwrite an existing archive as part of downloading.

Transfer ZIP bytes from disk through the host/runtime/relay to the selected device destination with bounded memory, backpressure and cancellation. Implement correct MIME, filename/Content-Disposition and, where useful, range/resume behavior. Use native authenticated browser/runtime download helpers, not `host.openUrl` to localhost on the phone, an external system browser that loses the native app's session, or base64 chunks reassembled into a whole ZIP in iframe memory. The existing text metadata bridge remains metadata-only.

Authentication and authorization must bind the extension installation, artifact, originating host/runtime and current approval. Do not expose UI session tokens, service bearer tokens, upstream credentials or durable reusable credentials in URLs, iframe messages, logs, browser history or archives. If existing delivery requires a capability link, keep it single-artifact, narrowly scoped and short-lived, and document/refuse unsafe cross-origin, expired, replayed or revoked uses; prefer host-owned authenticated delivery with an opaque artifact ID. Do not publish a guessable or unauthenticated download endpoint. Apply the same protection to direct connections, UI-password/reverse-proxy authentication, private relay, mobile web/PWA and native mobile clients.

Cancelled destination selection or transfer must not trigger another export or a silent fallback download. Do not retry mutations blindly; reconcile unknown outcomes. Disabling/uninstalling/reinstalling the extension, revoking capabilities or switching servers must invalidate relevant handles consistently. Retain the plugin's existing archive and manual host-directory option; downloading is additive and should not automatically delete retained archives, private staging evidence or any unrelated files. Make privacy/retention implications visible.

## Acceptance and regression evidence

- Windows/Linux/macOS desktop and headless hosts use the same native connection/delivery contracts, with no PowerShell/lsof/ss discovery requirement.
- Mobile web/PWA, native mobile and relay clients can download and independently verify a ZIP; desktop delivery and existing filesystem downloads do not regress. Test real native/runtime authentication boundaries, not only an unsandboxed iframe.
- Verify core evidence across pages, archived descendants, unfamiliar JSON, unfinished records, Unicode and a synthetic individual tool string larger than the old response cap. Verify a large archive under a deliberately small heap, progressively rather than loading it whole.
- Verify durable logs stop at a valid watermark, report truly unavailable data, and never create a permanent recorder. Verify a safe real upstream version or explicit unknown.
- Confirm zero provider calls, no prompts, no arbitrary conversation-tool execution and no unintended MCP startup during export.
- Test wrong-origin/untrusted URLs, redirects, malformed requests, unauthorized/revoked grants, backend changes mid-capture/transfer, expired or replayed handles, path traversal, symlink replacement and changed files. Sensitive bytes and credentials must not enter logs or error messages.
- Test cancellation, dropped connections, stalled streams, insufficient disk space, already-existing destinations and multi-gigabyte/ZIP64-compatible streaming as practical. State exact tested limits rather than implying infinity.
- Add SDK/host contract tests and migration/feature-discovery documentation. Old hosts must reject or hide unavailable download/read features clearly; never quietly fall back to a partial successful export.

## Deliverables and operator boundary

Propose a minimal native design and exact affected files after inspection, get operator approval, implement focused testable commits in an isolated worktree, and run the repository's canonical relevant checks. Supply an independent review and a concise SDK integration example for Session Export's next release, with minimum supported host/SDK versions and new approval requirements. Report remaining native-runtime coverage gaps explicitly. Prepare a PR only if separately authorized. This handoff does not authorize changes to the installed host or to the plugin repository today.
