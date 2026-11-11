# OpenChamber Session Export

Export the selected conversation into one ZIP containing readable Markdown, projected OpenCode JSON, descendant sessions and available durable event logs. All processing is deterministic: exporting never calls a model, sends a prompt or executes a conversation tool.

The independent public source is [lrq3000/openchamber-session-export](https://github.com/lrq3000/openchamber-session-export). Release 0.2.1 moves the source out of the collection without changing export algorithms or dependencies. The collection references it as a commit-pinned Git submodule at `plugins/openchamber-session-export/`. See [HISTORY.md](HISTORY.md) for preserved commits, transferred documents and historical path conventions. The development package remains private to npm; no npm distribution is published for this extraction.

## Compatibility and installation units

This is an **OpenChamber extension**, not an OpenCode backend plugin or an Agent Skill. Install the complete built `openchamber/` directory. Do not add this package to OpenCode's `plugins` array. The development package uses Node >=22.13; native validation used Node 24.22.2, OpenChamber 2.6.1 and its managed OpenCode 2.2.5. The separately installed terminal OpenCode may be a different version and server.

Automatic connection discovery currently supports **Windows desktop-hosted OpenChamber with UI authentication disabled**. A browser connected to that same desktop host can use the extension too. Standalone/remote hosts, non-Windows owner verification and UI-password authentication are not claimed supported. Unsupported or ambiguous connections fail closed; the extension does not extract passwords, scan ports, start another server or fall back to the terminal service. This compatibility restriction is preferable to silently exporting a similarly named session from the wrong instance.

Build from this development directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run typecheck
npm run build
npm test
npm run test:ui
npm run test:smoke
npm run test:stress
```

`test:ui` uses an installed Chrome through Playwright; set `SESSION_EXPORT_BROWSER` to an existing compatible Chromium executable when Chrome is unavailable. It does not download a browser. `test:smoke` starts an isolated OpenCode server and imports synthetic evidence without invoking a provider. Set `SESSION_EXPORT_OPENCODE` to an explicit OpenCode v2 executable if needed. `test:stress` separately exports/verifies 256 MiB, including one 160 MiB tool string, in a child with a 96 MiB V8 heap; archive entries and values are checked progressively, not loaded as a whole ZIP. It takes about a minute and retains roughly gigabytes of intermediate evidence. A separate forced-ZIP64 unit case checks reader interoperability, not a real >4 GiB export. Test artifacts are retained under `SESSION_EXPORT_TEST_TMP`, or this machine's approved `C:/Users/33632/AppData/Local/Temp/opencode` location. The user must remove them manually when no longer needed.

The actual Windows chooser smoke is separately opt-in: set `SESSION_EXPORT_NATIVE_DIALOG=1` using your shell's syntax, then run `npm run test:smoke`. It displays and automatically handles only its own titled test dialog, holds it beyond twenty seconds, chooses a synthetic Unicode ZIP path, verifies exact publication and cancels another chooser without writing. It requires an interactive Windows desktop. Normal unit/UI tests inject a chooser at the OS boundary; they do not display dialogs.

The installed-interface smoke case is opt-in: set `SESSION_EXPORT_NATIVE_URL` to an explicitly authorized local OpenChamber session URL. It opens an isolated Chrome profile, inspects the installed panel and its native session-menu action, and never clicks Export or sends a prompt. Native discovery, service/owning-proxy connectivity, panel rendering and default-OFF state were verified on this machine; real archive contents were verified with isolated synthetic evidence, not by exporting a private everyday conversation. An unrelated host `/api/source-control/binding` 422 was observed and is reported separately rather than attributed to the extension.

After building, copy the complete `openchamber/` directory to a stable location and install that folder through **Settings → Extensions → Add**. A folder install references its source; it does not copy the files. Never install from a disposable worktree if that worktree will later be removed. Approve the declared local service only if you trust the package: it runs with your user rights. It invokes PowerShell to query the owner of the one configured OpenChamber proxy port and, for conservatively detected local Windows desktop clients, to display Save As. Permissions describe intent, not an operating-system sandbox.

For an explicitly authorized new local installation with UI authentication disabled, `scripts/install.mjs` copies only the built extension files, backs up the registry, registers the new folder through OpenChamber's native API, grants exactly the requested `service` capability, and probes the installed service and its owning-proxy connection. It refuses an existing destination or extension ID, never sets `replace`, and does not retry or roll back uncertain mutations automatically. Supply the verified host and a new absolute destination:

```sh
node scripts/install.mjs --yes --host http://127.0.0.1:PORT --destination ABSOLUTE_NEW_FOLDER
```

For an explicitly approved update, inspect the existing installation and record SHA-256 fingerprints of all four managed files (`package.json`, `panel/index.html`, `panel/app.js`, `service.cjs`) in a reviewed JSON mapping. Run `node scripts/install.mjs --yes --update --expected-version OLD_VERSION --expected-hashes ABSOLUTE_HASH_MAP --host http://127.0.0.1:PORT --destination ABSOLUTE_EXISTING_FOLDER`. The installer refuses changed hashes, versions, identities, links or grants; backs up those files and the registry; pauses only Session Export through native controls; replaces complete files with the manifest last; resumes only this extension and checks its release/connection. Unrelated files, extensions and grants remain untouched. Use a temporary root on the same volume as the installation for atomic file replacement. Read-only health probes wait for stable readiness after the native folder watcher settles; only explicitly recognized restart/connection races are retried, within a bounded startup window. Pause/resume, file replacement, registration and export mutations are never retried. Failures preserve backups and report that this extension may remain paused; there is no automatic rollback. Inspect before continuing.

## Usage

1. Open **Session Export** on the right-hand rail, or choose **Export complete session** in a session's menu.
2. Check the displayed session title and ID. The panel follows the focused session; an explicitly clicked session-menu action selects its target.
3. Leave **Include referenced local files** OFF for a normal transcript archive. No external-file inspection or copying occurs in that mode. Existing binary data embedded in projected messages remains in JSON.
4. On the local Windows desktop, **Export session** opens a ZIP **Save As** dialog for each archive. Cancel means no archive, with no silent fallback write. Existing ZIPs are never overwritten, even if the operating-system dialog offers overwrite confirmation; choose a new filename.
5. In browsers or uncertain client contexts, choose an absolute local output directory, or leave the field empty for `~/Downloads/OpenChamber-Exports`. Paths are on the service host, not necessarily the browser device. If the native chooser is unavailable, the panel exposes this manual field and requires another explicit export click rather than silently using it. **Copy path** copies the saved archive's location; ZIP bytes never traverse the iframe.

The sandbox SDK exposes neither generic binary Save As nor a trustworthy local-client identity. Routing uses a deliberately conservative Windows/Electron user-agent and exactly one loopback ancestor origin. This is a UX heuristic, not authentication; unknown contexts keep the manual field. The Windows chooser is provided by the approved host service, not by an undocumented parent-window bridge. Choosing a destination is asynchronous and can outlast the ordinary twenty-second bridge deadline. A session change while a chooser is pending cancels that destination and prevents publication. Other in-progress actions retain their originally clicked target and label a result for a previously selected session.

The native **Export Markdown** remains independent. **Export complete session** is an additive action, normally directly below it in the sidebar; the desktop header may interpose **Open in Mini Chat**, and other extensions can affect contributed-action ordering. The host exposes no placement contract; the extension does not patch the application or replace native export.

To collect external attachments, enable **Include referenced local files**, choose **Review files**, explicitly select available files, and choose **Create archive**. A target change resets inclusion to OFF. Only explicit attachment records, file tool content, Markdown image references and recognized generated/truncated-output artifacts are candidates; arbitrary filesystem paths in chat prose or tool arguments are not copy instructions. There is no directory crawl or remote download. Review the inventory carefully: an opt-in ZIP can contain private documents or generated images.

## Archive format

| Entry | Contents |
| --- | --- |
| `conversation.md` | Recorded message/content order, exposed reasoning, tool names/arguments/results/errors, unfamiliar content and separate descendant sections. |
| `session.json` | Main session `info` and complete paginated projected `messages`, without dropping unfamiliar JSON fields. |
| `subsessions/<id>.json` | The same projected snapshot for each descendant, including archived child sessions. |
| `events/<id>.jsonl` | Available durable events through the API's captured `log.synced` watermark; not provider wire traffic. |
| `assets/` | Only explicitly selected and successfully revalidated external regular files. |
| `manifest.json` | Schema/version, capture times, sources, coverage warnings, file decisions and SHA-256 checksums of uncompressed entries other than the manifest itself. |

The versioned archive schema is `openchamber-session-export/1`. The JSON is a projected snapshot, **not a byte-identical native transfer export**: unlike OpenCode's settled-only transfer filter, it retains unfinished records exposed by the message API. Do not assume native import will preserve those unfinished records. Raw provider-native fields remain in the JSON but are not decoded or presented as readable hidden reasoning.

## Integrity, omissions and operating limits

- Failed message pages, cursor inconsistencies or failed descendant enumeration abort preparation instead of publishing a successful-looking partial conversation archive.
- Unavailable durable logs and missing/refused/changed optional files are explicitly reported. Nothing reconstructs reasoning, events, external-file versions or deleted content that the host never exposed or retained.
- Sequential API reads are never claimed to be a transactional atomic snapshot: `coverage.atomic` is always false. `observedStable` separately records successful inactivity/revision observations; unavailable activity is represented as `null`, not a claim of inactivity. Export after work settles when consistency matters; no export operation interrupts the agent.
- Capture, projected values, Markdown, events, inventories and checksums are processed progressively on disk. There is no cumulative transcript/page/log size ceiling or total export polling deadline. Large individual strings are unpacked streaming values too, not simply large objects held one message at a time. Disk capacity, filesystem/ZIP64 reader limits, upstream availability and schema-sized metadata/depth bounds remain real constraints; arbitrary infinity is not promised. Idle network responses still fail explicitly.
- External files are limited to 100 MiB each and 500 MiB per selection. Symlinks, junction ancestors, non-regular files, network paths and changed files are refused. File fingerprints are rechecked after opening and copying; included bytes are hashed.
- Only three prepared descriptors and bounded recent-job metadata remain in memory. Preparations do not expire merely because a chooser takes a long time. The service allows one archive-writing job and one chooser at a time. SDK inventories contain at most 100 candidates and 25 referring-session previews per candidate, with counts for additional origins; all origins and warnings remain in the archive. SDK responses contain progress, inventories and paths, never archive or conversation bodies.
- Unique archives are published using an exclusive hard link, requiring a local filesystem supporting hard links, such as NTFS. Existing archives are never overwritten. If writing fails, no successful result path is returned.
- Capture folders (`session-export-capture-*` under the temporary root) and hidden `.session-export-*` staging folders beside exports are deliberately retained for manual cleanup. They contain uncompressed private evidence and can use several times the transcript's space, even when the resulting ZIP compresses well. The staged ZIP and published ZIP share file data on a hard-link-capable filesystem. Retention is not secure deletion or encryption; allow sufficient local disk space and remove these private copies manually when no longer needed.

An ordinary ZIP is **not encrypted**. Markdown renderers can interpret links and inline HTML from original user/assistant messages; use a trusted, appropriately sandboxed viewer. Tool evidence and reasoning are fenced to prevent source text from closing its enclosing block. Keep the complete archive private; prepare a separately reviewed sharing copy rather than assuming secret redaction or anonymization.

## Connection and privacy boundaries

The service reads the bounded local OpenChamber settings file only to obtain `desktopLocalPort`, verifies that port's OS owner equals the parent OpenChamber process, checks `/auth/session`, and reads `/api/info`. It then uses only GET requests to the owning proxy, which handles OpenCode authentication internally. The managed-process cleanup registry is not imported or executed. Connection credentials never enter the iframe or archive.

The extension's session-menu action does not request `payload: ["messages"]`: that SDK payload is text-only, bounded and unsuitable for this archive. The panel communicates with its approved local service over the SDK text bridge. Durable-log access uses the experimental `follow=false` API and does not create a permanent recorder.

## Release records

Release `0.2.0` added progressive disk-backed capture and local Windows ZIP Save As. Release `0.2.1` records the independent source repository, preserves that behavior and adds an installed-browser override to the UI test fixture. Creation `2026-11-07` is preserved from the original `0.1.0`; last updated `2026-11-12`. The development package, independently installable OpenChamber manifest, lockfile and runtime release labels share the version. Configuration-only files, including `tsconfig.json`, follow the plugin's version and do not carry independent version metadata. No nested skills or backend plugin installation are included.

Copyright 2026 Stephen Karl Larroque <LRQ3000@gmail.com>. See [AUTHOR.txt](AUTHOR.txt) and the [Apache-2.0 license](LICENSE.txt); dependencies retain their own licenses.

Contracts inspected: OpenChamber 2.6.1 packaged extension installer/service/proxy behavior; `@openchamber/sdk` 2.6.0; [OpenCode v2 API](https://opencode.ai/v2/docs/api); [OpenChamber SDK](https://docs.openchamber.dev/sdk/). See `docs/superpowers/specs/2026-11-07-openchamber-session-export-validation.md` for original-release evidence and `docs/superpowers/specs/2026-11-07-session-export-streaming-validation.md` for this correction's checks and remaining native-runtime limits.
