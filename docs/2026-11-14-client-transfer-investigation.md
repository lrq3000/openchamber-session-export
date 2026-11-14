# Client ZIP transfer without modifying OpenChamber

Research result, 2026-11-14. Companion to [the importer investigation](2026-11-14-session-import-investigation.md). This records isolated prototypes, not a shipped feature or permission to change a live instance.

## Conclusions

1. **Upload can be integrated into the extension panel.** A normal file input can read a file the user explicitly selects on their device. Send bounded Base64 blocks through the existing `host.serviceRequest`; decode and append them server-side. The SDK's text/request-body limit is per request, not an unavoidable whole-file limit.
2. **Download cannot be enabled inside the existing extension sandbox by adding another server plugin.** Both the iframe and the package document's HTTP CSP omit `allow-downloads`. Receiving the bytes does not give the page permission to save them. Opening the same package HTML in a new tab retains its HTTP sandbox.
3. **A companion transfer page, shipped with the extension and served by its own service, can download the ZIP.** Open it through `host.openUrl` and use a narrowly scoped, temporary transfer authorization. It is a separate browser page or Desktop browser panel, not the extension iframe. No second OpenCode plugin is required for this transport.
4. **Desktop already has the missing private network transport.** Its browser panel tunnels a remote instance's loopback page through OpenChamber's existing dev-server tunnel. The native tunnel's scanner, server and client were exercised with the companion download.
5. **Remote web/Android need a reachable companion URL.** Their `127.0.0.1` is the user's device, not the VPS, and they do not have Desktop's dev-server tunnel. A private HTTPS route, for example through an explicitly configured Tailscale-only reverse proxy, can provide that URL without modifying application code. This is deployment configuration, not something another server plugin automatically solves. No public endpoint, Funnel, relay, firewall change or reverse-proxy change was authorized or performed.

## Sources and implementation checks

- [OpenChamber Host API](https://docs.openchamber.dev/sdk/host/): `serviceRequest` and `openUrl`.
- [Extension accounts/network and origins](https://docs.openchamber.dev/sdk/#accounts-and-network): approved HTTPS origins allow direct fetch but do not grant downloads.
- [Preview & Dev Servers](https://docs.openchamber.dev/preview/#working-with-a-remote-openchamber): Desktop forwards a remote server's loopback port; ordinary web clients do not.
- OpenChamber 2.7.1 `packages/sdk/src/contract.ts`: request body at most 64,000 characters, response at most 8,000,000 bytes, request timeout 20 seconds.
- `packages/sdk/src/frame-policy.ts`, `packages/ui/src/components/layout/PluginPane.tsx`, and `packages/web/server/lib/guests/routes.js`: iframe `sandbox="allow-scripts"` and HTTP `Content-Security-Policy: sandbox allow-scripts; ...`.
- `packages/ui/src/lib/guests/open-url.ts`: Desktop routes loopback addresses to its browser panel when a project is available.
- `packages/ui/src/lib/browser/devTunnel.ts`: the browser panel resolves loopback URLs against the selected remote instance, including its authentication, rather than opening a local machine's unrelated service.
- `packages/web/server/lib/dev-tunnel/{runtime,client}.js`: native authenticated byte transport; only ports returned by dev-server discovery may be reached.
- `packages/mobile/android/app/src/main/java/com/openchamber/app/FileSharePlugin.java`: Android's native file-sharing implementation is part of the app, not an extension SDK method. Its comments note that Android WebView does not support ordinary blob downloads/Web Share. A real Android check is therefore necessary; desktop mobile emulation is not proof.

## Isolated prototype

Probe sources outside the repository:

- `/tmp/opencode/session-file-transfer-investigation/probe.mjs`
- `/tmp/opencode/session-file-transfer-investigation/panel.js`
- `/tmp/opencode/session-file-transfer-investigation/service.cjs`

Successful evidence: `/tmp/opencode/session-transfer-probe-Q53mtc/result.json`.

The probe used Chromium 156.0.8078.4, the installed SDK 2.7.1 and the installed OpenChamber 2.7.1 service/tunnel modules. Browser tools, missing shared libraries and fonts were downloaded/extracted only under `/tmp/opencode`; no system packages were installed.

### Upload

- Constructed a valid synthetic ZIP of 2,097,399 bytes.
- Used the real SDK in a `sandbox="allow-scripts"` iframe with the real `guestFramePolicy` and the HTTP sandbox header.
- Intercepted an actual browser file-chooser event from the iframe and supplied only the synthetic fixture.
- Read the selected file with `File.slice` in 32,768-byte blocks.
- Sent 65 Base64 blocks through SDK messages validated by the real schema and through the actual `proxyGuestServiceRequest`, which launched the fixture extension service.
- The largest service request body was 43,762 bytes, below 64,000.
- Checked the server's size and SHA-256 against the original ZIP.
- Repeated successfully in narrow/touch mobile emulation.

The parent UI in this probe is a harness, not an installed real extension/PluginPane. Mobile emulation does not test the Android native picker.

### Download

- Clicking a blob download or navigating to an attachment response inside the sandbox produced no download.
- Opening the package page directly, while retaining its HTTP CSP, still produced no blob download.
- `host.openUrl` in the parent harness opened the companion page outside that sandbox.
- A short-lived ticket in the URL fragment was exchanged once for an HttpOnly, SameSite cookie; the page removed the fragment from its address.
- Clicking **Save ZIP** streamed the synthetic archive from the companion listener; the browser's downloaded file matched the original SHA-256 on desktop and in mobile emulation.
- Access without the download cookie returned HTTP 401.
- Used the real dev-server scanner to confirm that the companion port was an eligible native tunnel target.
- Used the actual native tunnel client and server to fetch the companion page through a separate local forwarding port, redeemed a fresh ticket, downloaded the ZIP and checked its SHA-256.
- Replaying the redeemed ticket returned HTTP 401.

All test listeners were loopback-only; all services, browser profiles, credentials and data were synthetic. Only fixture processes were stopped. No model/provider was called. Neither an actual Electron window nor a real Android app, Windows machine, VPS-to-device network path, HTTPS reverse proxy or relay was tested.

## Proposed production shape, not yet a user-approved choice

### Upload in the panel

Use a device file input, bounded blocks, acknowledgements, progress and cancellation. Keep a resumable, opaque upload ID tied to the extension/instance and verify the final size and digest. Stage bytes privately and do not import until ZIP validation and explicit confirmation succeed. Do not accept arbitrary destination paths in chunk requests.

Base64 adds about one third to transport size and many small requests add latency. This is a compatible fallback, not an efficient substitute for native streaming for very large archives. A reachable companion page could also stream uploads to avoid that overhead.

### Download through the companion

The existing service can own the companion routes; there is no need for another OpenCode plugin or another separately installed application. The prototype used a separate loopback listener to make the two trust boundaries explicit. Production could also use capability-protected routes on the existing service listener.

Keep ordinary SDK service routes protected by the existing bearer. The companion's ticket/cookie must grant access only to the selected prepared archive, not arbitrary files or a generic proxy. Use expiry, revocation, path/transfer-scoped cookies, `Secure` on HTTPS, no-store/no-referrer headers, CSRF/origin checks where appropriate, and no credential logging. The synthetic prototype is not hardened production code.

Prepare the ticket before the final user's **Download** click, to preserve browser user activation when calling `host.openUrl`. Keep the service alive while the page is in use, expire abandoned tickets/staging, and report failures rather than navigating to a remote server's loopback address on the client.

- **Local Desktop/browser:** the companion can remain on local loopback.
- **Desktop connected to a VPS:** use its existing authenticated browser-panel tunnel, with the selected project/runtime. Full Electron/Windows save-dialog behavior still needs testing.
- **Android or a browser connected to a VPS:** require an explicitly configured reachable private HTTPS companion address, or retain native Files as the download fallback. A server-side plugin cannot give these clients Desktop's forwarding feature.

## Other options considered

- **Another OpenCode server plugin:** useful for importing, but still server-side; cannot change client sandbox flags.
- **OpenCode TUI/GUI plugin:** extends those OpenCode clients, not OpenChamber's browser or Android client.
- **Another extension page, popover, block or file editor:** retains the same sandbox; binary file-editor saves target server files, not the user's downloads.
- **`contributes.origins`:** can authorize direct HTTPS file transport to a known endpoint but does not grant local file saving.
- **Native Android/browser add-on:** would require client installation or an application rebuild and is not a universal single-extension solution.
- **Native Files:** remains a valid zero-new-route fallback, not a wholly integrated extension-panel download.
