# OpenChamber Session Export

Export a complete conversation or a lightweight **Resume snapshot** to ZIP, move it between OpenChamber instances, and import it as new sessions. The extension never generates a summary, sends a prompt, resumes a process or executes a conversation tool.

The canonical source is [lrq3000/openchamber-session-export](https://github.com/lrq3000/openchamber-session-export). See [HISTORY.md](HISTORY.md) for extraction provenance and historical paths. Current source version `0.4.1` fixes export-mode selection and repeated Windows private-directory hardening; `0.4.0` introduced import and transfer support. Changing the source version does not publish or deploy a release. The development package remains private to npm.

## Compatibility and installation units

Install **one OpenChamber extension** through **Settings → Extensions → Add**, using the repository URL or the complete `openchamber/` folder. It contains a prebuilt panel, service and bundled OpenCode plugin declared with `contributes.opencodePlugin`. OpenChamber manages plugin loading after approval; do not manually add the root package to OpenCode's `plugins` array.

The manifest requires OpenChamber >=2.7.1 and SDK 2.7.1; development uses Node >=22.13. Import and Resume contracts are tested against **OpenCode 2.3.0**, not every earlier or later version. The panel retains its mobile opt-in and touch controls. Real Windows/Electron, Android and iOS execution is not established by desktop Chromium or a CI matrix; see the [validation record](docs/2026-11-14-session-transfer-validation.md).

Approval requests are **service**, **OpenCode access**, **adding a plugin to OpenCode**, and **sessions** (navigation to imported sessions). The service and plugin run with your user rights; capability declarations are not an OS sandbox. PowerShell provides optional local Windows Save As and Windows private-directory ACLs. No OpenChamber/OpenCode source patch, SQLite write, service restart or infrastructure change is required by the extension.

The plugin channel requires an explicitly managed OpenCode `--port`, its process authentication and a shared OpenChamber parent-process identity with the service. Wrapped/external configurations that cannot establish this binding fail closed; the extension does not guess a port or fall back to a separately installed terminal server. Complete export can fall back to the host's GET-only connection when the plugin is unavailable, with its existing response limits and explicit missing-context/log warnings. Resume and import require the bundled plugin.

For development, rebuild from this directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm run build
npm test
npm run test:ui
npm run test:smoke
npm run test:stress
```

OpenChamber does not install npm dependencies or compile TypeScript for an extension installation. Ship the built `openchamber/panel/app.js`, `openchamber/service.cjs`, `openchamber/plugin/index.js` and plugin package manifest alongside their sources. Dependency license notices are embedded in bundles, including the ZIP reader. CI checks that plugin artifacts are tracked and that all rebuilt bundles match their sources. Root and nested manifests differ only in package-relative entry paths. See [OpenChamber's packaging contract](https://docs.openchamber.dev/sdk/).

`test:ui` uses an installed Chrome through Playwright; set `SESSION_EXPORT_BROWSER` to an existing compatible Chromium executable when Chrome is unavailable. It does not download a browser. `test:smoke` starts isolated OpenCode servers and imports synthetic evidence without invoking a provider. Set `SESSION_EXPORT_OPENCODE` to an explicit OpenCode v2 executable; otherwise it uses `opencode` on PATH, never a personal Windows installation path. `test:stress` separately exports/verifies 256 MiB, including one 160 MiB tool string, in a child with a 96 MiB V8 heap; archive entries and values are checked progressively, not loaded as a whole ZIP. This tests the archive pipeline, not unlimited native import or fallback-host response sizes. It can take minutes and retains roughly gigabytes of intermediate evidence. A separate forced-ZIP64 unit case checks interoperability, not a real >4 GiB export. Test artifacts are retained under `SESSION_EXPORT_TEST_TMP`, or an `opencode` folder under Node's OS temporary directory. Missing bases are created and fixture paths are canonicalized for macOS temporary-directory aliases. Remove retained evidence manually when no longer needed. CI runs typecheck, build and unit tests on Windows, Linux and macOS; a configured matrix is not evidence of remote execution.

The actual Windows chooser smoke is separately opt-in: set `SESSION_EXPORT_NATIVE_DIALOG=1` using your shell's syntax, then run `npm run test:smoke`. It displays and automatically handles only its own titled test dialog, holds it beyond twenty seconds, chooses a synthetic Unicode ZIP path, verifies exact publication and cancels another chooser without writing. It requires an interactive Windows desktop. Normal unit/UI tests inject a chooser at the OS boundary; they do not display dialogs.

The installed-interface smoke case is opt-in: set `SESSION_EXPORT_NATIVE_URL` only for an explicitly authorized local OpenChamber session URL. It inspects the installed panel/session-menu action without clicking Export or sending a prompt. Historical installed-interface evidence concerned earlier versions; it is not evidence of a live 0.4.1 installation. The current implementation was tested with isolated synthetic sessions, not private everyday conversations.

For folder installation, copy the complete `openchamber/` directory to a stable location before registering it. A folder install references its source; never select a disposable worktree that will later be removed. Approve the declared capabilities only after reviewing the package.

For an explicitly authorized new local installation with UI authentication disabled, `scripts/install.mjs` copies six managed files, backs up the registry, registers the folder through native APIs and grants exactly the four capabilities above. **`--approve-bundled-plugin` is mandatory for a fresh CLI install**. It refuses an existing destination or extension ID, never sets `replace`, and does not replay or roll back uncertain mutations. The connection probe checks injected configuration, not full import readiness. Use native Settings when UI authentication is enabled.

```sh
node scripts/install.mjs --yes --approve-bundled-plugin --host http://127.0.0.1:PORT --destination ABSOLUTE_NEW_FOLDER
```

Installer backups use `--temp-root`, then `SESSION_EXPORT_TEST_TMP`, then Node's OS temporary directory plus `opencode`; the base is created if missing. Set `--registry` to the actual `extensions.json` when the host does not use `~/.config/openchamber/extensions.json`. These CLI overrides affect this installation run, not host settings.

For updates, staging must share the installation's filesystem. The installer checks the device before copying replacements or pausing the extension and rejects a different device with an actionable `--temp-root` error (for example when Linux `/tmp` is tmpfs). This preflight avoids a known cross-device failure; it does not guarantee every later rename or permission check will succeed, so the retained-backup/manual-recovery rules still apply.

For an explicitly approved update, record reviewed SHA-256 fingerprints of all six managed files: `package.json`, `panel/index.html`, `panel/app.js`, `service.cjs`, `plugin/package.json`, `plugin/index.js`. Run `node scripts/install.mjs --yes --update --expected-version OLD_VERSION --expected-hashes ABSOLUTE_HASH_MAP --host http://127.0.0.1:PORT --destination ABSOLUTE_EXISTING_FOLDER`. The updater refuses changed hashes, versions, identities, links or grants, backs up files and registry, pauses only this extension through native controls, replaces complete files with the manifest last, and checks readiness after resuming it. Mutations are never retried. Failures retain backups for manual recovery; unrelated files and registrations are untouched.

An older installation cannot gain the new plugin/navigation approvals through the updater. All four capabilities must already be requested and approved. Use native Settings for a permission transition, including 0.3.x → 0.4.0; the script refuses permission widening before touching an installation. Host upgrades and any live installation remain separate operator decisions.

## Export and move a ZIP

1. Open **Session Export** on the right-hand rail, or choose **Export complete session** in a session's menu. On mobile, `panel.mobile: true` exposes the same controls in OpenChamber's workspace view; the host owns its presentation, without a separate limited mobile form or a desktop dialog-mode change.
2. Check the displayed session title and ID. The panel follows the focused session; an explicitly clicked session-menu action selects its target.
3. Choose **Complete** for the main transcript, descendant sessions and available logs, or **Resume snapshot** for the engine's effective compacted context, retained recent conversation, useful subsequent records, pins and captured session instructions. No new model summary is generated.
4. For Resume, optionally keep **earlier conversation for reference only**. This creates `history/conversation.md`, excludes old tool output and subagent history, and does not place that history back into active context. An older pinned message remains available and is added as a durable instruction when needed across the compaction boundary.
5. Leave **Include referenced local files** OFF to avoid external-file inspection/copying. Otherwise, review the inventory and explicitly select files. Pinned/recent-context references are recommended, never automatically selected. Missing/refused files remain visible. Existing attachment bytes already embedded in messages remain part of the transcript.
6. **Preview size** reports counts, known source bytes, a category breakdown and a clearly labelled ZIP estimate. **Measure exact ZIP size** actually compresses a prepared archive; exporting the unchanged selection reuses that ZIP. Source fingerprints are revalidated. An estimate is not an exact compressed or generated-Markdown size.
7. Choose **Export session** or **Create archive**. Local Windows Desktop can use Save As; cancelling never silently writes elsewhere. Other contexts use an absolute directory on the selected server, defaulting to `~/Downloads/OpenChamber-Exports`. If the native chooser is unavailable, another explicit click is required after choosing a manual directory. Existing ZIPs are never overwritten.
8. **Copy path** and **Open Files** remain available. Navigate to the displayed directory and download using native Files, or move the ZIP with SFTP/SCP/FTP or another trusted tool. Files navigation does not claim to select a particular ZIP automatically.

The sandbox SDK exposes neither generic binary Save As nor a trustworthy local-client identity. Routing uses a deliberately conservative Windows/Electron user-agent and exactly one loopback ancestor origin; a host-reported phone/tablet always keeps the manual field even with a desktop-looking UA. This is a UX heuristic, not authentication. The Windows chooser is provided by the approved host service, not by an undocumented parent-window bridge. Choosing a destination is asynchronous and can outlast the ordinary twenty-second bridge deadline. A session change while a chooser is pending cancels that destination and prevents publication. Other in-progress actions retain their originally clicked target and label a result for a previously selected session.

The native **Export Markdown** remains independent. **Export complete session** is an additive action, normally directly below it in the sidebar; the desktop header may interpose **Open in Mini Chat**, and other extensions can affect contributed-action ordering. The host exposes no placement contract; the extension does not patch the application or replace native export.

To collect external attachments, enable **Include referenced local files**, choose **Review files**, explicitly select available files, and choose **Create archive**. A target change resets inclusion to OFF. Only explicit attachment records, file tool content, Markdown image references and recognized generated/truncated-output artifacts are candidates; arbitrary filesystem paths in chat prose or tool arguments are not copy instructions. There is no directory crawl or remote download. Review the inventory carefully: an opt-in ZIP can contain private documents or generated images.

### Optional companion download

Desktop can open a separately authorized companion page through its existing local/dev-server tunnel. Remote web/mobile clients use **Files** unless an explicitly configured private HTTPS URL ending in `/companion` already proxies this service. The field configures no network route; the extension does not open a public port, configure Tailscale, or install a client helper.

The companion uses a five-minute, archive-scoped, single-redemption ticket in the URL fragment. The page removes that fragment, redeems it into an HttpOnly scoped cookie, and streams the ZIP from a validated file handle; HEAD and single byte ranges are supported. It never exposes the SDK service bearer or OpenCode password. A browser-profile download remains authorized until expiry; ticket redemption is single-use, not every individual range request. Use Files if the runtime cannot open or route the page. Actual Electron runtime execution remains unverified even though the native tunnel components were exercised in isolation.

## Import on the destination instance

*Importing always creates a new session. OpenCode’s import API cannot update an existing session.*

1. Move the ZIP to the destination server by any trusted transport and provide **ZIP path on this server**, or select **ZIP on this device** and upload it in acknowledged 32 KiB blocks. Choosing/uploading a file does not import a session. A failed upload can resume from its acknowledged offset while the same File remains selected; a frame reload requires choosing the file again.
2. Choose an existing canonical **destination working directory on this server**. On a VPS, both paths refer to that VPS, not the browser device.
3. Choose **Preview import**. The service freezes a private ZIP copy, validates entries/checksums/resource limits, prepares fresh session/message/tool/shell IDs, adapts supported references and checks the fully adapted JSON budget. Review sizes, counts, dependencies, warnings, the generated restored-file directory and job ID.
4. Confirm **Import as new session**. Files go only into a new `.openchamber-imports/<job-id>/` directory; existing project files are not replaced. The plugin imports parents before children through the official API, restores session instructions, and reads messages, session identity/pins and instructions back before reporting success.
5. Choose **Open imported session**. Source sessions, source ZIP and source files are unchanged; restoring the same ZIP again requires a fresh preview and creates another independent set of sessions.

The importer adapts only copies. Unfinished assistants are sealed with an explicit aborted marker so the official importer does not truncate later records. Running tool state is preserved in provenance and converted to an interrupted result; running shell/compaction records become interrupted copies. No execution resumes. The originals stay in the ZIP. Legacy attachments missing bytes must have a selected archived file from which to hydrate them; the importer never follows a historical source path or downloads a remote URI.

**Cancel** is best effort at safe boundaries: an in-flight native import may already create its session. Created sessions/files remain in place, and partial finalization, uncertain candidate IDs and file progress are reported. Copy the job ID and use **Check import result** after a lost connection or panel reload. Status reads can be repeated; mutation requests are never automatically replayed. Plugin-instance changes invalidate prepared operations. Persisted running journals become explicit interrupted/uncertain outcomes, not endless loading or silent retries. Inspect the private journal and reported IDs before preparing another import.

## Archive format

| Entry | Contents |
| --- | --- |
| `conversation.md` | Recorded message/content order, exposed reasoning, tool names/arguments/results/errors, unfamiliar content and separate descendant sections. |
| `session.json` | Main session `info` and complete paginated projected `messages`, without dropping unfamiliar JSON fields. |
| `subsessions/<id>.json` | The same projected snapshot for each descendant, including archived child sessions. |
| `events/<id>.jsonl` | Available durable events through the API's captured `log.synced` watermark; not provider wire traffic. |
| `context/<id>/instructions.json` | Captured API-managed session instruction entries, including portable older pins where required. |
| `context/<id>/effective.json` | Effective context evidence in Complete mode. Resume embeds its selected context in `session.json` instead. |
| `history/conversation.md` | Optional older main-conversation text for consultation only, never active import context. |
| `assets/` | Only explicitly selected and successfully revalidated external regular files. |
| `manifest.json` | Schema/version, capture times, sources, coverage warnings, file decisions and SHA-256 checksums of uncompressed entries other than the manifest itself. |

The writer uses `openchamber-session-export/2`; the importer explicitly accepts schema 1 with reduced coverage warnings. JSON is a projected snapshot, **not a byte-identical native transfer export**. Event logs and consultation history remain archive-only and are not replayed into SQLite or the internal event log. Unfamiliar message/content types fail preparation rather than being silently dropped; preservation of arbitrary unknown API fields during native import is not guaranteed. Provider-native checkpoint data stays opaque and may depend on the original provider/model.

## Integrity, omissions and operating limits

- Failed message pages, cursor inconsistencies or failed descendant enumeration abort preparation instead of publishing a successful-looking partial conversation archive.
- Unavailable durable logs and missing/refused/changed optional files are explicitly reported. Nothing reconstructs reasoning, events, external-file versions or deleted content that the host never exposed or retained.
- Sequential API reads are never claimed to be a transactional atomic snapshot: `coverage.atomic` is always false. `observedStable` separately records successful inactivity/revision observations; unavailable activity is represented as `null`, not a claim of inactivity. Export after work settles when consistency matters; no export operation interrupts the agent.
- Complete export capture, projected values, Markdown, events, inventories and checksums are processed progressively on disk, without an artificial cumulative transcript/page/log size ceiling in the writer. The fallback host read bridge still caps responses; disk capacity, OS limits, upstream availability, idle timeouts and metadata/depth bounds remain real constraints.
- Import deliberately has different limits: **8 GiB compressed staging/upload, 2 GiB expanded ZIP, 10,000 entries, 512 sessions, 64 MiB aggregate fully adapted session JSON, 2 MiB instruction-list input per session, and the native 256 KiB value limit per instruction entry**. Hydrated attachment Base64 counts against JSON limits. Rejecting a large import does not make its archive unusable for consultation. These are extension safety limits, not a claim about the maximum supported native request.
- ZIP paths, links, encryption, case/Unicode collisions, file/directory conflicts, sizes and manifest checksums are checked before native preparation. Disk space is checked for staging, expansion and restored files. Checksums detect corruption, not archive authenticity: import only trusted archives. Import restores active instructions and pins, which can influence subsequent model behavior.
- External files are limited to 100 MiB each and 500 MiB per selection. Symlinks, junction ancestors, non-regular files, network paths and changed files are refused. File fingerprints are rechecked after opening and copying; included bytes are hashed.
- Only three export preparations and bounded recent-job metadata remain in memory. Preparations do not expire merely because a chooser takes a long time. Archive writing and chooser operations are serialized; transfer/native import concurrency is bounded. Inventories contain at most 100 candidates and 25 referring-session previews per page. SDK requests contain bounded control data or an explicitly selected upload block, never complete archive/conversation bodies.
- Unique archives are published using an exclusive hard link, requiring a local filesystem supporting hard links, such as NTFS, APFS or ext4. Existing archives are never overwritten. FAT/exFAT and filesystems without hard-link support are not supported publication targets. If writing fails, no successful result path is returned.
- Capture folders (`session-export-capture-*` under the temporary root), exact-size caches and hidden `.session-export-*` staging folders are retained for manual cleanup. Upload staging and PID-independent job locators use host-provided extension service data, falling back to `~/.openchamber-session-export/service-data/<package-hash>/` in the built service. Plugin jobs/journals live under `~/.openchamber-session-export/bridges/<package-hash>/<host-pid>/jobs/`. The locator permits offline inspection of recorded outcomes after a host restart, not mutation replay or proof of session availability in a new database. These folders contain private uncompressed evidence and can use several times the ZIP's space. Completed/partial imports are not automatically deleted to simulate rollback. Review and remove retained evidence manually when no longer needed.

An ordinary ZIP is **not encrypted**. Markdown renderers can interpret links and inline HTML from original user/assistant messages; use a trusted, appropriately sandboxed viewer. Tool evidence and reasoning are fenced to prevent source text from closing its enclosing block. Keep the complete archive private; prepare a separately reviewed sharing copy rather than assuming secret redaction or anonymization.

## Connection and privacy boundaries

The SDK service bearer stays backend-only. The fallback native host connection accepts only validated loopback URLs supplied by OpenChamber. The bundled plugin holds OpenCode authentication inside its own process and exposes a separate private random capability, with a narrow GET allowlist and prepare/start/status/cancel operations. POSIX private directories/files use 0700/0600; Windows DACLs restrict the channel to the current user. Package identity, parent PID, plugin process and per-start instance identity are checked. No settings-file credential extraction, listener scan, arbitrary HTTP proxy, remote fetch or secondary-server fallback is used.

The extension's session-menu action does not request `payload: ["messages"]`: that SDK payload is text-only, bounded and unsuitable for this archive. The panel communicates with its approved local service over the SDK text bridge. Durable-log access uses the experimental `follow=false` API and does not create a permanent recorder.

## Release records

Release `0.2.0` added disk-backed export and Windows Save As; `0.2.1` recorded source extraction; `0.3.0` added mobile opt-in and the native host read connection. Source version `0.4.0` adds Complete/Resume profiles, size preview, a bundled plugin, new-session ZIP import, upload and optional companion download. Patch version `0.4.1` synchronizes the selected export mode, makes Windows private-directory ACL hardening repeatable without audit privileges, and corrects the synthetic touch fixture's viewport sizing. Creation `2026-11-07` is preserved; last updated `2026-11-14`. Package manifests, lockfile and runtime labels share the version.

Copyright 2026 Stephen Karl Larroque <LRQ3000@gmail.com>. See [AUTHOR.txt](AUTHOR.txt) and the [Apache-2.0 license](LICENSE.txt); dependencies retain their own licenses.

Current contracts: published `@openchamber/sdk` 2.7.1 parser, [OpenChamber OpenCode service access](https://github.com/openchamber/openchamber/blob/main/packages/sdk/GUEST_SERVICES.md#opencode-access), and [mobile SDK API](https://github.com/openchamber/openchamber/blob/main/packages/sdk/API.md). The documents dated 2026-11-07 under `docs/superpowers/specs/` retain historical Windows-proxy validation, not evidence of native 0.3.0 host testing.

The [approved consolidated plan](docs/superpowers/plans/2026-11-14-session-transfer-consolidated-plan.md) and [current validation record](docs/2026-11-14-session-transfer-validation.md) describe this implementation. Earlier design/follow-up documents retain historical limitations and are not authorization to change or deploy OpenChamber.
