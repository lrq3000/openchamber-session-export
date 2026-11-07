# OpenChamber Session Export

Export the selected conversation into one ZIP containing readable Markdown, projected OpenCode JSON, descendant sessions and available durable event logs. All processing is deterministic: exporting never calls a model, sends a prompt or executes a conversation tool.

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
```

`test:ui` uses an installed Chrome through Playwright; it does not download a browser. `test:smoke` starts an isolated OpenCode server and imports synthetic evidence without invoking a provider. Set `SESSION_EXPORT_OPENCODE` to an explicit OpenCode v2 executable if needed. Test artifacts are retained under `SESSION_EXPORT_TEST_TMP`, or this machine's approved `C:/Users/33632/AppData/Local/Temp/opencode` location. The user must remove them manually when no longer needed.

The installed-interface smoke case is opt-in: set `SESSION_EXPORT_NATIVE_URL` to an explicitly authorized local OpenChamber session URL. It opens an isolated Chrome profile, inspects the installed panel and its native session-menu action, and never clicks Export or sends a prompt. Native discovery, service/owning-proxy connectivity, panel rendering and default-OFF state were verified on this machine; real archive contents were verified with isolated synthetic evidence, not by exporting a private everyday conversation. An unrelated host `/api/source-control/binding` 422 was observed and is reported separately rather than attributed to the extension.

After building, copy the complete `openchamber/` directory to a stable location and install that folder through **Settings → Extensions → Add**. A folder install references its source; it does not copy the files. Never install from a disposable worktree if that worktree will later be removed. Approve the declared local service only if you trust the package: it runs with your user rights. It invokes PowerShell solely to query the owner of the one configured OpenChamber proxy port. Permissions describe intent, not an operating-system sandbox.

For an explicitly authorized new local installation with UI authentication disabled, `scripts/install.mjs` copies only the built extension files, backs up the registry, registers the new folder through OpenChamber's native API, grants exactly the requested `service` capability, and probes the installed service and its owning-proxy connection. It refuses an existing destination or extension ID, never sets `replace`, and does not retry or roll back uncertain mutations automatically. Supply the verified host and a new absolute destination:

```sh
node scripts/install.mjs --yes --host http://127.0.0.1:PORT --destination ABSOLUTE_NEW_FOLDER
```

## Usage

1. Open **Session Export** on the right-hand rail, or choose **Export complete session** in a session's menu.
2. Check the displayed session title and ID. The panel follows the focused session; an explicitly clicked session-menu action selects its target.
3. Leave **Include referenced local files** OFF for a normal transcript archive. No external-file inspection or copying occurs in that mode. Existing binary data embedded in projected messages remains in JSON.
4. Choose an absolute local output directory, or leave the field empty for `~/Downloads/OpenChamber-Exports`.
5. Choose **Export session**. The archive is saved on the machine hosting the extension service; **Copy path** copies its location. The sandbox does not offer a supported binary browser download or native Save dialog.

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
- Capture has a shared 128 MiB serialized-evidence budget enforced while reading pages, before retaining them; each API page and each durable log also has a 64 MiB limit. Core transcripts take priority over optional logs. Core limits abort; log limits produce an explicit optional-log omission. There is no silent truncation.
- External files are limited to 100 MiB each and 500 MiB per selection. Symlinks, junction ancestors, non-regular files, network paths and changed files are refused. File fingerprints are rechecked after opening and copying; included bytes are hashed.
- Preparations expire after ten minutes and only three remain in memory. The service allows one archive-writing job at a time and retains bounded metadata for recent jobs. SDK responses contain progress, inventories and paths, never archive or conversation bodies.
- Unique archives are published using an exclusive hard link, requiring a local filesystem supporting hard links, such as NTFS. Existing archives are never overwritten. If writing fails, no successful result path is returned.
- Hidden `.session-export-*` staging folders are deliberately retained beside exports for manual cleanup. They contain uncompressed private evidence and may use substantially more disk space than the ZIP. The staged ZIP and published ZIP share file data on a hard-link-capable filesystem.

An ordinary ZIP is **not encrypted**. Markdown renderers can interpret links and inline HTML from original user/assistant messages; use a trusted, appropriately sandboxed viewer. Tool evidence and reasoning are fenced to prevent source text from closing its enclosing block. Keep the complete archive private; prepare a separately reviewed sharing copy rather than assuming secret redaction or anonymization.

## Connection and privacy boundaries

The service reads the bounded local OpenChamber settings file only to obtain `desktopLocalPort`, verifies that port's OS owner equals the parent OpenChamber process, checks `/auth/session`, and reads `/api/info`. It then uses only GET requests to the owning proxy, which handles OpenCode authentication internally. The managed-process cleanup registry is not imported or executed. Connection credentials never enter the iframe or archive.

The extension's session-menu action does not request `payload: ["messages"]`: that SDK payload is text-only, bounded and unsuitable for this archive. The panel communicates with its approved local service over the SDK text bridge. Durable-log access uses the experimental `follow=false` API and does not create a permanent recorder.

## Release records

Initial release `0.1.0`; created and last updated `2026-11-07`. The development package and independently installable OpenChamber manifest share that version. Configuration-only files, including `tsconfig.json`, follow the plugin's version and do not carry independent version metadata. No nested skills or backend plugin installation are included.

Contracts inspected: OpenChamber 2.6.1 packaged extension installer/service/proxy behavior; `@openchamber/sdk` 2.6.0; [OpenCode v2 API](https://opencode.ai/v2/docs/api); [OpenChamber SDK](https://docs.openchamber.dev/sdk/). See the repository's `docs/superpowers/specs/2026-11-07-openchamber-session-export-validation.md` for exact verification evidence and remaining native-runtime limits.
