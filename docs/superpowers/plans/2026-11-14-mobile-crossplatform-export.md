# Mobile and Cross-platform Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable the existing export interface on phones and replace Windows-only connection discovery with the native, authenticated host connection on Windows, Linux and macOS desktop/headless hosts.

**Architecture:** Preserve the archive and job pipelines. Resolve an authenticated numeric-loopback connection from host-injected environment variables, keep its token backend-only, and reuse the existing panel on mobile. Document current host size/log/download limitations and provide a separate host-repository implementation prompt.

**Tech Stack:** TypeScript, Node >=22.13, @openchamber/sdk 2.7.1, esbuild, node:test, Playwright with installed Chromium.

**Spec:** `docs/superpowers/specs/2026-11-14-mobile-crossplatform-export-design.md`

## Global Constraints

- Work only in `.worktrees/mobile-crossplatform-export` on `feat/mobile-crossplatform-export`; main's tracked files stay unchanged.
- Release 0.3.0; creation 2026-11-07; last_updated 2026-11-14; OpenChamber >=2.7.1 and SDK 2.7.1.
- Native requested capabilities are exactly `service` and `opencode`; never widen an existing grant automatically.
- No OS listener discovery, credential scraping, new GUI dependencies, private exports or provider calls.
- No successful partial core transcript, no token in metadata/archives, no overwrite, no automatic fallback after failure.
- Direct device ZIP delivery and improvements to host read limits/log access are deferred to the separate OpenChamber prompt.
- No live installation, push, PR, merge or deletion; synthetic evidence is retained in the approved temporary root.

## Review Focus

- Invalid or partially supplied native environment must fail without network access, reflected secrets or fallback discovery (Task 1).
- Revoked authorization, redirects, oversized/failed core reads and denied logs must remain explicit failures or coverage omissions, never successful truncation (Task 1).
- An older service-only installation must be rejected before any update side effect or permission widening (Task 1).
- Mobile browsers, long titles/paths and attachment review must keep all controls reachable without opening a chooser on the host (Task 2).
- Portable temporary defaults and executable selection must not accidentally reference a developer's Windows profile on another host (Task 2).

---

### Task 1: Native authenticated capture and installation contract

**Files:** Modify `src/connection.ts`, `src/opencode.ts`, `src/types.ts`, `src/service-entry.ts`, `src/service.ts`, `src/archive.ts`, `openchamber/package.json`, `scripts/install.mjs`, `package.json`, `package-lock.json`, `README.md`, `tests/connection.test.ts`, `tests/capture.test.ts`, `tests/install.test.ts`, `tests/release.test.ts`.

**Interfaces:** `ConnectionResolver` consumes a constructor-injected environment defaulting to `process.env`; `resolve(): Promise<Connection>` produces `{ url: string; version: string | null; token?: string }`. `SessionSource` consumes that object, uses the token only for the verified origin's Authorization header and produces the existing disk-backed capture with nullable serverVersion. The `/connection` service route exposes version/transport metadata only.

- [x] Write resolver tests for valid IPv4/IPv6 numeric-loopback URLs, missing variables, malformed/untrusted URLs, header-unsafe tokens and generic secret-free errors. Assert native resolution does not query `/api/info` or inspect settings.
- [x] Write synthetic capture tests requiring the bearer on every GET and asserting it is absent from capture metadata; pin core authentication/redirect/oversize failures and optional log denial.
- [x] Write installer/parser/release assertions for exactly service+opencode, SDK 2.7.1, host >=2.7.1, nullable upstream version and version/date synchronization. Assert old grants stop an update before mutation.
- [x] Run `node --import tsx --test tests/connection.test.ts tests/capture.test.ts tests/install.test.ts tests/release.test.ts`; confirm new assertions fail for the intended reasons.
- [x] Upgrade only the SDK dependency with `npm install --ignore-scripts --no-audit --no-fund`; implement the native resolver/header handling and exact installer checks. Inspect the installed parser's actual role support. If the published SDK/host contract does not provide the approved functionality, stop and report rather than fabricate compatibility.
- [x] Update synchronized release labels and compatibility/privacy documentation, including current bridge limits and explicit failures. Build before running installer tests.
- [x] Run `npm run typecheck`, `npm run build`, `npm test`; inspect the diff, then commit a coherent native-capture milestone with conventional attribution.

### Task 2: Mobile interface, portable tooling and host handoff

**Files:** Modify `src/panel.ts`, `openchamber/package.json`, `openchamber/panel/index.html`, `scripts/install.mjs`, `tests/destination.test.ts`, `tests/fixtures.ts`, `tests/release.test.ts`, `tests/ui/panel.test.ts`, `tests/smoke/runtime.test.ts`, `README.md`; add `.github/workflows/test.yml`, `docs/superpowers/specs/2026-11-14-mobile-crossplatform-export-validation.md`, `docs/superpowers/plans/2026-11-14-openchamber-export-host-follow-up-prompt.md`.

**Interfaces:** Retain existing SDK event handling and job routes. Add mobile opt-in without changing action IDs or desktop attach behavior. Portable temp roots honor `SESSION_EXPORT_TEST_TMP`, otherwise `join(tmpdir(), 'opencode')`, creating the base before mkdtemp. Smoke binary selection honors `SESSION_EXPORT_OPENCODE`, otherwise platform-neutral PATH `opencode`.

- [ ] Write parser assertions for panel.mobile and a phone-sized interaction case covering output path, no-file export, attachment review/selection/create, copy result, long text and no horizontal overflow. Assert mobile never calls `/destination`.
- [ ] Add assertions for portable temp defaults and explicit overrides; preserve existing Windows-only native-picker safety tests.
- [ ] Run the focused unit/mobile checks and confirm the new behavioral assertions fail before implementation.
- [ ] Enable mobile, make minimal responsive/touch adjustments, replace personal default paths and create a Node 24 CI matrix on windows-latest, ubuntu-latest and macos-latest running install, typecheck, build and unit tests.
- [ ] Write the separate OpenChamber prompt: authenticated streamed downloads across direct/native/relay clients, complete allowlisted evidence reads without per-response truncation, durable logs and real upstream version, approval/revocation, bounded memory, no credential exposure, and cross-platform/mobile validation. It must be independently executable later and must not authorize work in that repository now.
- [ ] Run `npm run typecheck`, `npm run build`, `npm test`, `npm run test:ui` with an already installed Chromium. Use `SESSION_EXPORT_TEST_TMP=C:/Users/33632/AppData/Local/Temp/opencode` for retained local artifacts. Do not download a browser.
- [ ] Obtain an independent fresh-context read-only code/permission review; verify its findings and fix only valid issues within this approved scope. Re-run affected checks.
- [ ] Record exact results, limitations and evidence locations in the validation document; tick this plan; inspect the diff and commit the mobile/tooling/handoff milestone. Verify a clean worktree and all completed milestones committed before final delivery.

## Baseline and plan review

Baseline: `npm install --ignore-scripts --no-audit --no-fund`, `npm run build`, `npm test` passed 42/42 unit tests. A first test run before build failed only the two installer cases because generated ignored bundles did not exist; following the documented build order resolved both without source changes. This plan implements the approved design; native execution with one independent review is the proposed low-overhead execution method.

## Execution ledger

Plan identity: `docs/superpowers/plans/2026-11-14-mobile-crossplatform-export.md`; branch base `1ff53da4d634ecf3e693fbae787f3bfc61da081a`.

Pre-flight: Task 1 owns the manifest, release and installer permissions; Task 2 consumes them and adds only panel.mobile and portable paths. Shared changes must preserve service+opencode and release labels.

Ruling: Use this approved plan as the progress ledger instead of generating Bash-specific scratch/brief files on Windows — the complete two-task plan remains directly available and no extra workspace lifecycle is needed — cost if wrong: less automatic extraction of task briefs, not a product behavior change.

Task 1: complete. Published SDK 2.7.1's actual parser accepts the native role. Resolver, authenticated capture, permission-transition and release tests were observed failing before their implementation and passed afterward; existing core-read/redirect safeguards also remained covered. `npm run typecheck`, `npm run build`, `npm test` (47/47) and `git diff --check` pass. The existing service health assertion in `tests/service.test.ts` was synchronized with release 0.3.0 after the full suite identified its historical literal. No archive algorithm changed.
