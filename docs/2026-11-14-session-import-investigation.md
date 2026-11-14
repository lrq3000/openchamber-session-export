# Session import without changing OpenChamber or OpenCode

Research result, 2026-11-14. This is not an implemented ZIP importer or authorization to install into a live instance.

## Result

A single OpenChamber extension can bundle a server-side OpenCode plugin using `contributes.opencodePlugin`. An authenticated private connection between that plugin and the extension's local service can reach the existing official session import HTTP endpoint. This was exercised against an isolated OpenCode 2.3.0 process using the installed OpenChamber 2.7.1 service proxy implementation. Neither application's source or live configuration was changed.

This removes the assumption that native host changes are necessarily required for **session restoration**. It does not solve integrated browser/mobile ZIP download and upload.

## Contracts checked

- [OpenChamber: an OpenCode plugin in your package](https://docs.openchamber.dev/sdk/#an-opencode-plugin-in-your-package): one installation can contain a panel, a local service and an OpenCode plugin. The user must separately approve **Add a plugin to OpenCode**, which grants code running inside OpenCode the user's full access. The plugin runs server-side when the client is a phone.
- [OpenCode server plugins](https://opencode.ai/docs/build/plugins/server): the context resembles a client, but is **not** the complete client. Published 2.2.5 and 2.3.0 typings do not expose `ctx.experimental.session.import` or `ctx.session.import`; the 2.3.0 Promise adapter also constructs a restricted object at runtime. Casting away the types does not fix this.
- [OpenCode client](https://opencode.ai/docs/build/client): the full authenticated client exposes `client.experimental.session.import({ info, messages, location? })`.
- The published protocol maps this operation to `POST /api/experimental/session/import`. Parent sessions must be imported before children. An existing session ID is rejected with HTTP 409.
- [OpenCode TUI plugins](https://opencode.ai/docs/build/plugins/cli) receive a full `context.client`, whose type includes the importer. This is an alternative for a running terminal client, not a solution for an unattended OpenChamber server by itself.
- [OpenCode CLI](https://opencode.ai/docs/cli/commands#session) provides `opencode session import file.json --directory ...`; the installed 2.3.0 command's help also lists global `--server`. The CLI import path was not exercised here. Never let automatic service discovery silently choose or start a different backend.

## Tested path

1. A local OpenCode plugin, loaded through the normal plugin configuration, starts a private loopback listener.
2. The plugin determines its own HTTP endpoint from its process's explicit `--port` argument and authenticates using its own process environment. OpenChamber 2.7.1's managed-process implementation passes an explicit port plus `OPENCODE_PASSWORD` and `OPENCODE_SERVER_PASSWORD`.
3. The extension service calls the plugin listener with a separate capability token. It does not receive the OpenCode password.
4. The plugin calls the official HTTP importer and returns only result metadata through the extension service.

The second step relies on the inspected managed-process implementation, not a documented plugin-context import API. Production must validate this runtime capability and fail closed if absent; do not treat it as a universal plugin API or guess a port.

The extension service is a user-approved host process: its declared permissions describe intent rather than an OS sandbox. It can communicate with our own plugin without modifying the native read-only OpenCode transport. `serviceRequest` reaches a service route such as `/restore`; the service, not the sandboxed iframe, makes the private backend request. No attempt to send import or RPC through the native GET-only bridge is needed.

### Evidence

Probe files outside the repository:

- `/tmp/opencode/session-import-investigation/probe.mjs`
- `/tmp/opencode/session-import-investigation/fixture-plugin.mjs`
- `/tmp/opencode/session-import-investigation/fixture-service.cjs`

Successful run: `/tmp/opencode/session-import-probe-nDDxtH/result.json`.

The probe:

- used isolated HOME and XDG directories, a fresh database, an explicit loopback port and generated synthetic credentials;
- loaded the plugin after requesting the location's plugin inventory (creating a session alone did not activate it);
- invoked the actual `proxyGuestServiceRequest` function from OpenChamber 2.7.1 in a separate test process, which launched the fixture extension service;
- imported one synthetic user message and one synthetic assistant message through service → private plugin bridge → official importer;
- exported the imported session again and checked both messages;
- checked HTTP 409 for duplicate session IDs and HTTP 401 for a missing private bridge token;
- checked that the service response contained neither password nor bridge token;
- observed zero calls to the synthetic model provider;
- stopped only its own fixture processes.

This was not a browser/Android end-to-end test, a real extension installation test, or a production-safe bridge implementation. Windows and older runtime behavior remain untested.

## Production work still needed

- Put the optional plugin in the extension package and document its additional full-access approval.
- Create a private, authenticated rendezvous channel with restrictive filesystem permissions/Windows ACLs, revocation and cleanup. The fixture's single-instance descriptor is not a production design.
- Bind the service to the correct managed OpenCode instance, including concurrent OpenChamber processes, spaces and shared databases. A matching session ID alone does not establish process identity. Reject ambiguous or unsupported configurations.
- Never expose the upstream OpenCode password to the panel, archive, diagnostics or rendezvous file. Use a separate scoped bridge capability, not a generic arbitrary-HTTP proxy.
- Validate ZIP entries, checksums, expansion limits and selected destination paths before import. Allocate fresh IDs, remap relationships and import parents before children. Preserve existing sessions and source files.
- Validate full restoration fidelity separately: interrupted messages, tools/resources, compactions, pins, instruction entries and Windows/Linux path mapping. The two-message probe does not establish these guarantees.
- Prefer asynchronous service jobs and small job/result metadata through `serviceRequest`; large transcripts should remain server-side.
- Handle the full-access plugin's lifecycle and location activation without requiring a model call.

## Remaining client-file constraint

The existing OpenChamber Files interface can move the ZIP between the server and the user's device, independently of the importer. A wholly integrated extension-panel ZIP download/upload path remains separate work: the current SDK is bounded text, and the extension document's sandbox does not allow downloads. The import result above does not demonstrate or bypass those browser constraints.

Follow-up: [client-transfer investigation](2026-11-14-client-transfer-investigation.md) subsequently tested **in-panel upload through bounded Base64 blocks**, plus **download through a bundled companion page and the existing Desktop dev-server tunnel**. Thus bounded text is not a fundamental upload blocker. Remote web/Android companion reachability and real native-client behavior still need explicit handling; another server plugin cannot grant iframe downloads.

External OpenCode servers may not load the bundled plugin automatically, and isolated spaces use their own OpenCode/configuration. Capability detection must report these cases rather than claiming all instances work.
