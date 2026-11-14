# Mobile and cross-platform Session Export design

## Intent and approved boundary

Expose the complete existing export-options interface on mobile and make the extension usable with Windows, Linux and macOS desktop or standalone/headless OpenChamber hosts. Keep this implementation in the Session Export repository. A separate, self-contained implementation prompt will describe the OpenChamber host changes needed later for complete streaming parity and device ZIP delivery; do not modify or install OpenChamber in this task.

## Approaches

1. Native host integration spanning both repositories would provide complete streaming reads and authenticated device downloads without OS discovery, but the user deferred changes in the OpenChamber repository.
2. OS-specific PowerShell/lsof/ss discovery would preserve direct proxy reads where UI authentication is disabled, but adds platform dependencies and cannot reliably cover authenticated standalone hosts. Do not implement it.
3. Selected plugin-only approach: use the supported host-provided OpenCode read connection, opt the existing panel into mobile, and retain host-side archive publication. This is the smallest portable implementation, with the explicit host limitations below.

## Host connection and privacy

Require published `@openchamber/sdk` 2.7.1 and OpenChamber >=2.7.1. Declare `service.provides: ["opencode"]`; the native installer requests both `service` and implicit `opencode`, not an explicit entry under `contributes.capabilities`. Accept only the host-injected `OPENCHAMBER_OPENCODE_URL` and `OPENCHAMBER_SERVICE_TOKEN`. Validate a plain HTTP numeric-loopback URL with an explicit valid port, no user information, query, fragment or non-root path, and a nonempty header-safe token. Do not discover settings files, inspect ports, reuse UI credentials, scan listeners or start another server.

Keep the bearer exclusively in the backend `Connection` object and supply it on GET requests to the host connection. Never include it in service metadata, errors, UI messages or archive records. Requests must not follow redirects. Native access does not expose `/api/info`; represent the upstream version as `null`, not as an invented version or the OpenChamber version. Existing synthetic direct-connection fixtures may continue to specify a real version and omit the token.

## Export completeness and known host limits

The current read-only OpenCode bridge limits each response and excludes the experimental durable-log route. Do not silently truncate, bypass or reinterpret those restrictions: failed core reads abort preparation and unavailable logs remain explicit coverage warnings. Therefore this release does not claim unrestricted streaming parity with 0.2.1's Windows-only proxy. Large message reads may fail until the separate host work is implemented. Preserve disk-backed processing, attachment opt-in, checksums, no-overwrite publication, immutable clicked targets and cancellation behavior.

ZIP bytes do not pass through the iframe. Phone/browser/native/relay ZIP downloads remain deferred; the visible result is the archive location on the host. The later-host prompt must require a bounded-memory authenticated download facility, not a public listener, credential-bearing URL, base64 whole-ZIP response or sandbox bypass.

## Mobile and destinations

Set `contributes.panel.mobile: true` and reuse the same HTML entry, native session-menu action and export controls. The host owns whether this appears as its mobile workspace view or dialog; do not patch parent UI or globally change desktop actions to attach-dialog mode. At 360px widths, controls, attachment review, errors, paths and results remain reachable without horizontal overflow. Use touch-friendly control sizing where supported by the SDK and existing panel CSS.

Preserve the existing guarded Windows Save As convenience, including cancellation and explicit fallback. Linux, macOS, headless and mobile clients use the manual/default host-side output directory. No new GUI helper or OS-specific subprocess is necessary. Replace personal Windows paths in installation and test defaults with `node:os` temporary/home discovery and existing explicit environment overrides. Native chooser availability is optional, not a prerequisite for export.

## Installation and release

Ship synchronized release 0.3.0, creation 2026-11-07, last_updated 2026-11-14. Installer capability checks must match exactly the two declared native capabilities and must never silently widen an old installation's grant. Updates requiring new approval fail before changing files or pausing anything and direct the operator to native approval controls. Preserve unrelated extensions, files, enabled states, grants and retained backups.

## Verification and non-goals

Use synthetic evidence only: no private conversation exports or provider calls. Add authentication/URL/token rejection and failure coverage, parser-validated mobile/service declarations, mobile interaction/layout checks, portable fixture paths and a Windows/Linux/macOS CI matrix. Run typecheck, build, unit and installed-Chromium UI tests in the approved isolated worktree. Report Linux/macOS native runtime and CI execution as unverified on this Windows machine. Do not download a browser, push, open a PR, merge, install/update a live extension or clean up retained evidence.

## Inspected contracts

- [Current SDK API](https://github.com/openchamber/openchamber/blob/main/packages/sdk/API.md): panel.mobile and open-mode action routing.
- [OpenCode access](https://github.com/openchamber/openchamber/blob/main/packages/sdk/GUEST_SERVICES.md#opencode-access): provides role, environment, authentication, GET allowlist and response limits.
- [Service implementation](https://github.com/openchamber/openchamber/blob/main/packages/web/server/lib/guests/service.js): text-only bounded panel proxy.
- [Extension serving](https://github.com/openchamber/openchamber/blob/main/packages/web/server/lib/guests/DOCUMENTATION.md): opaque-origin sandbox without direct downloads.

Inspected upstream main identified itself as OpenChamber 2.7.1; npm's latest SDK was 2.7.1. Tests must also inspect the published SDK parser rather than assume upstream main and a packaged host are identical.
