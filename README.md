# OpenChamber Session Export

Export the selected conversation into one ZIP containing readable Markdown, projected OpenCode JSON, descendant sessions and available durable event logs. All processing is deterministic: exporting never calls a model, sends a prompt or executes a conversation tool.

The independent public source is [lrq3000/openchamber-session-export](https://github.com/lrq3000/openchamber-session-export). Release 0.2.1 moves the source out of the collection without changing export algorithms or dependencies. The collection references it as a commit-pinned Git submodule at `plugins/openchamber-session-export/`. See [HISTORY.md](HISTORY.md) for preserved commits, transferred documents and historical path conventions. The development package remains private to npm; no npm distribution is published for this extraction.

## Compatibility and installation units

This is an **OpenChamber extension**, not an OpenCode backend plugin or an Agent Skill. Install the complete built `openchamber/` directory. Do not add this package to OpenCode's `plugins` array. Release 0.3.0 requires OpenChamber >=2.7.1 and uses SDK 2.7.1; the development package uses Node >=22.13. The separately installed terminal OpenCode may be a different version and server and is never a connection fallback.

Since OpenChamber v2.7.1, plugins are supported on Android and iOS, as well as in the desktop and web interfaces. This release opts the export panel into those mobile interfaces with `panel.mobile: true`. Exported ZIPs are saved on the service host, not automatically to the mobile device.

The export service uses OpenChamber's supported, authenticated OpenCode read connection on **Windows, Linux and macOS**, including desktop and standalone/headless hosts. It no longer reads OpenChamber settings or queries port owners. The approved host supplies a loopback connection and authenticates upstream itself; UI-password authentication need not be disabled for runtime export. Missing/invalid connection data fails closed rather than selecting another instance. Actual native Linux/macOS and mobile runtime execution remains to be verified; portable protocol behavior is covered by synthetic tests and the cross-platform CI configuration.

**Important host limits:** the current native read bridge caps individual responses and does not allow experimental durable-log reads. A failed or interrupted core read aborts preparation, never produces a truncated successful archive. Denied logs appear as coverage warnings. This release is not unrestricted large-response/durable-log parity with the former Windows-only proxy. Native access also does not expose OpenCode's version; `serverVersion` is explicitly `null` when unknown. Device ZIP delivery is deferred: archives are saved on the host, not downloaded to the phone. The separate OpenChamber follow-up prompt documents the host changes required for those features.

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

`test:ui` uses an installed Chrome through Playwright; set `SESSION_EXPORT_BROWSER` to an existing compatible Chromium executable when Chrome is unavailable. It does not download a browser. `test:smoke` starts an isolated OpenCode server and imports synthetic evidence without invoking a provider. Set `SESSION_EXPORT_OPENCODE` to an explicit OpenCode v2 executable; otherwise it uses `opencode` on PATH, never a personal Windows installation path. `test:stress` separately exports/verifies 256 MiB, including one 160 MiB tool string, in a child with a 96 MiB V8 heap; archive entries and values are checked progressively, not loaded as a whole ZIP. That direct synthetic source tests the archive pipeline, not the native host's response limits. It takes about a minute and retains roughly gigabytes of intermediate evidence. A separate forced-ZIP64 unit case checks reader interoperability, not a real >4 GiB export. Test artifacts are retained under `SESSION_EXPORT_TEST_TMP`, or an `opencode` folder under Node's OS temporary directory. Missing bases are created; fixture paths are canonicalized so macOS temporary-directory aliases do not look like unsafe attachment ancestors. The user must remove retained evidence manually when no longer needed. The CI workflow runs typecheck, build and unit tests on Windows, Linux and macOS; a configured matrix is not a claim those remote runs have executed.

The actual Windows chooser smoke is separately opt-in: set `SESSION_EXPORT_NATIVE_DIALOG=1` using your shell's syntax, then run `npm run test:smoke`. It displays and automatically handles only its own titled test dialog, holds it beyond twenty seconds, chooses a synthetic Unicode ZIP path, verifies exact publication and cancels another chooser without writing. It requires an interactive Windows desktop. Normal unit/UI tests inject a chooser at the OS boundary; they do not display dialogs.

The installed-interface smoke case is opt-in: set `SESSION_EXPORT_NATIVE_URL` to an explicitly authorized local OpenChamber session URL. It opens an isolated Chrome profile, inspects the installed panel and its native session-menu action, and never clicks Export or sends a prompt. Native discovery, service/owning-proxy connectivity, panel rendering and default-OFF state were verified on this machine; real archive contents were verified with isolated synthetic evidence, not by exporting a private everyday conversation. An unrelated host `/api/source-control/binding` 422 was observed and is reported separately rather than attributed to the extension.

After building, copy the complete `openchamber/` directory to a stable location and install that folder through **Settings → Extensions → Add**. A folder install references its source; it does not copy the files. Never install from a disposable worktree if that worktree will later be removed. Approve both the declared local **service** and native **OpenCode access** only if you trust the package: the service runs with your user rights. PowerShell is used only for optional Save As on conservatively detected local Windows desktop clients. Linux, macOS and headless hosts need no PowerShell or GUI helper. Permissions describe intent, not an operating-system sandbox.

For an explicitly authorized new local installation with UI authentication disabled, `scripts/install.mjs` copies only the built extension files, backs up the registry, registers the new folder through OpenChamber's native API, grants exactly `service` and `opencode`, and probes service/native-connection configuration. It refuses an existing destination or extension ID, never sets `replace`, and does not retry or roll back uncertain mutations automatically. The configuration probe validates injected connection data; it does not assert successful transcript access or invent an upstream version. Use the native installation UI when authentication is enabled. Supply the verified host and a new absolute destination:

```sh
node scripts/install.mjs --yes --host http://127.0.0.1:PORT --destination ABSOLUTE_NEW_FOLDER
```

Installer backups use `--temp-root`, then `SESSION_EXPORT_TEST_TMP`, then Node's OS temporary directory plus `opencode`; the base is created if missing. Set `--registry` to the actual `extensions.json` when the host does not use `~/.config/openchamber/extensions.json`. These CLI overrides affect this installation run, not host settings.

For updates, staging must share the installation's filesystem. The installer checks the device before copying replacements or pausing the extension and rejects a different device with an actionable `--temp-root` error (for example when Linux `/tmp` is tmpfs). This preflight avoids a known cross-device failure; it does not guarantee every later rename or permission check will succeed, so the retained-backup/manual-recovery rules still apply.

For an explicitly approved update, inspect the existing installation and record SHA-256 fingerprints of all four managed files (`package.json`, `panel/index.html`, `panel/app.js`, `service.cjs`) in a reviewed JSON mapping. Run `node scripts/install.mjs --yes --update --expected-version OLD_VERSION --expected-hashes ABSOLUTE_HASH_MAP --host http://127.0.0.1:PORT --destination ABSOLUTE_EXISTING_FOLDER`. The installer refuses changed hashes, versions, identities, links or grants; backs up those files and the registry; pauses only Session Export through native controls; replaces complete files with the manifest last; resumes only this extension and checks its release/connection. Unrelated files, extensions and grants remain untouched. Use a temporary root on the same volume as the installation for atomic file replacement. Read-only health probes wait for stable readiness after the native folder watcher settles; only explicitly recognized restart/connection races are retried, within a bounded startup window. Pause/resume, file replacement, registration and export mutations are never retried. Failures preserve backups and report that this extension may remain paused; there is no automatic rollback. Inspect before continuing.

An old service-only installation cannot be silently upgraded through that script: both native capabilities must already be requested and approved. Use OpenChamber's native extension update/approval controls for the 0.2.x → 0.3.0 permission transition; the script refuses it before pausing or replacing files. A host older than 2.7.1 must be upgraded separately.

## Usage

1. Open **Session Export** on the right-hand rail, or choose **Export complete session** in a session's menu. On mobile, `panel.mobile: true` exposes the same controls in OpenChamber's workspace view; the host owns its presentation, without a separate limited mobile form or a desktop dialog-mode change.
2. Check the displayed session title and ID. The panel follows the focused session; an explicitly clicked session-menu action selects its target.
3. Leave **Include referenced local files** OFF for a normal transcript archive. No external-file inspection or copying occurs in that mode. Existing binary data embedded in projected messages remains in JSON.
4. On the local Windows desktop, **Export session** opens a ZIP **Save As** dialog for each archive. Cancel means no archive, with no silent fallback write. Existing ZIPs are never overwritten, even if the operating-system dialog offers overwrite confirmation; choose a new filename.
5. On Linux/macOS, mobile, browsers or uncertain client contexts, choose an absolute local output directory, or leave the field empty for `~/Downloads/OpenChamber-Exports`. Paths are on the service host, not necessarily the browser device. If the native chooser is unavailable, the panel exposes this manual field and requires another explicit export click rather than silently using it. **Copy path** copies the saved archive's location; ZIP bytes never traverse the iframe and no download-to-phone button is advertised.

The sandbox SDK exposes neither generic binary Save As nor a trustworthy local-client identity. Routing uses a deliberately conservative Windows/Electron user-agent and exactly one loopback ancestor origin; a host-reported phone/tablet always keeps the manual field even with a desktop-looking UA. This is a UX heuristic, not authentication. The Windows chooser is provided by the approved host service, not by an undocumented parent-window bridge. Choosing a destination is asynchronous and can outlast the ordinary twenty-second bridge deadline. A session change while a chooser is pending cancels that destination and prevents publication. Other in-progress actions retain their originally clicked target and label a result for a previously selected session.

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
- Capture, projected values, Markdown, events, inventories and checksums are processed progressively on disk. The writer adds no cumulative transcript/page/log size ceiling or total export polling deadline, but the current host read bridge caps each upstream response; it can terminate a large message page or even one oversized message. Such failures abort preparation, not truncate it. Large values within accessible responses are unpacked streaming values too. Disk capacity, filesystem/ZIP64 reader limits, upstream availability and metadata/depth bounds remain real constraints. Idle network responses fail explicitly.
- External files are limited to 100 MiB each and 500 MiB per selection. Symlinks, junction ancestors, non-regular files, network paths and changed files are refused. File fingerprints are rechecked after opening and copying; included bytes are hashed.
- Only three prepared descriptors and bounded recent-job metadata remain in memory. Preparations do not expire merely because a chooser takes a long time. The service allows one archive-writing job and one chooser at a time. SDK inventories contain at most 100 candidates and 25 referring-session previews per candidate, with counts for additional origins; all origins and warnings remain in the archive. SDK responses contain progress, inventories and paths, never archive or conversation bodies.
- Unique archives are published using an exclusive hard link, requiring a local filesystem supporting hard links, such as NTFS, APFS or ext4. Existing archives are never overwritten. FAT/exFAT and filesystems without hard-link support are not supported publication targets. If writing fails, no successful result path is returned.
- Capture folders (`session-export-capture-*` under the temporary root) and hidden `.session-export-*` staging folders beside exports are deliberately retained for manual cleanup. They contain uncompressed private evidence and can use several times the transcript's space, even when the resulting ZIP compresses well. The staged ZIP and published ZIP share file data on a hard-link-capable filesystem. Retention is not secure deletion or encryption; allow sufficient local disk space and remove these private copies manually when no longer needed.

An ordinary ZIP is **not encrypted**. Markdown renderers can interpret links and inline HTML from original user/assistant messages; use a trusted, appropriately sandboxed viewer. Tool evidence and reasoning are fenced to prevent source text from closing its enclosing block. Keep the complete archive private; prepare a separately reviewed sharing copy rather than assuming secret redaction or anonymization.

## Connection and privacy boundaries

The service accepts only host-injected `OPENCHAMBER_OPENCODE_URL` and `OPENCHAMBER_SERVICE_TOKEN`. The URL must be plain HTTP on literal `127.0.0.1` or `::1`, with an explicit valid port and no credentials, query, fragment or non-root path. The bearer stays in backend requests to that connection; metadata and archives contain neither it nor upstream credentials. Only GET requests are used, redirects are refused, and the host enforces approval and its read allowlist. No settings-file discovery, listener scan, UI-password extraction or secondary server is involved. The host currently excludes `/api/info`, so unknown server versions are recorded honestly as `null`.

The extension's session-menu action does not request `payload: ["messages"]`: that SDK payload is text-only, bounded and unsuitable for this archive. The panel communicates with its approved local service over the SDK text bridge. Durable-log access uses the experimental `follow=false` API and does not create a permanent recorder.

## Release records

Release `0.2.0` added progressive disk-backed capture and local Windows ZIP Save As. Release `0.2.1` records the independent source extraction. Release `0.3.0` adds mobile opt-in, touch-friendly controls, portable tooling defaults and the native cross-platform OpenCode connection with its explicit approval boundary; it documents rather than bypasses current host read/log/download limits. Creation `2026-11-07` is preserved; last updated `2026-11-14`. The development package, independently installable OpenChamber manifest, lockfile and runtime release labels share the version. No backend plugin installation is included.

Copyright 2026 Stephen Karl Larroque <LRQ3000@gmail.com>. See [AUTHOR.txt](AUTHOR.txt) and the [Apache-2.0 license](LICENSE.txt); dependencies retain their own licenses.

Current contracts: published `@openchamber/sdk` 2.7.1 parser, [OpenChamber OpenCode service access](https://github.com/openchamber/openchamber/blob/main/packages/sdk/GUEST_SERVICES.md#opencode-access), and [mobile SDK API](https://github.com/openchamber/openchamber/blob/main/packages/sdk/API.md). The documents dated 2026-11-07 under `docs/superpowers/specs/` retain historical Windows-proxy validation, not evidence of native 0.3.0 host testing.

Current [design](docs/superpowers/specs/2026-11-14-mobile-crossplatform-export-design.md), [validation record](docs/superpowers/specs/2026-11-14-mobile-crossplatform-export-validation.md), and [standalone OpenChamber follow-up prompt](docs/superpowers/plans/2026-11-14-openchamber-export-host-follow-up-prompt.md). The follow-up prompt is a later task in the OpenChamber repository, not an installed component or authorization to change that host now.
