# Mobile and cross-platform export validation

## Scope and environment

Validation performed on Windows with Node 24.22.2 in `.worktrees/mobile-crossplatform-export`, branch `feat/mobile-crossplatform-export`, based on `1ff53da4d634ecf3e693fbae787f3bfc61da081a`. The approved scope is plugin-only: native host-provided connection, phone panel opt-in, portable paths and a separate future-host prompt. No installed extension, live host configuration, private conversation or provider was used. Main's tracked files were not edited. The operator separately approved a `.worktrees/` entry in local `.git/info/exclude`.

Published SDK 2.7.1 was installed with lifecycle scripts disabled. Its actual parser accepts `panel.mobile: true` and service `provides: ["opencode"]`, requests exactly `service` plus `opencode`, and accepts the declared OpenChamber >=2.7.1 floor. This verifies the package contract, not an installed host's native behavior.

## Checks run

- `npm run typecheck`: pass, TypeScript noEmit.
- `npm run build`: pass; generated panel and service bundles remain ignored inside this worktree.
- `npm test`: 50 tests passed, zero failures. Covers existing archive integrity/ZIP64 and optional files, every required capture page, bearer-protected native reads, secret-free missing/unsafe connection errors, authorization/oversize status failures, redirect refusal, optional-log denial, exact permissions, no-widening updates, cross-filesystem staging refusal before native mutation, release synchronization, OS temporary defaults/overrides and canonical temporary aliases.
- `npm run test:ui` with `SESSION_EXPORT_BROWSER=C:/Users/33632/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe`: one full SDK integration scenario passed using Chromium 153.0.8010.12. It exercises ordinary and 360px touch clients, no-file exports, explicit attachment selection and archive creation, destination-value persistence, clipboard results, long titles and unbroken coverage warnings without horizontal overflow, phone metadata overriding a desktop UA, immutable clicked targets, native picker cancellation/fallback and focus-change cancellation. No mobile action opens a host chooser.
- `git diff --check`: pass before review.

Final post-fix UI evidence is retained at `C:/Users/33632/AppData/Local/Temp/opencode/session-export-ui-Zsa29n`; pre-review evidence at `session-export-ui-NoKsuA` in the same root was also inspected. Phone review/title and desktop/fallback PNGs were opened for visual inspection; long titles wrap inside the 360px panel and the original export controls remain reachable by scrolling. Earlier synthetic archives/screenshots/capture evidence remain under `session-export-*` in the same approved temporary root, including deliberately created temporary directory aliases. Nothing was recursively deleted.

## Observed RED → GREEN cases and environment failures

Native resolution and authenticated capture initially failed against the old settings/port-discovery implementation; native capability, old-grant refusal and release tests also failed before implementation. After changing the backend and installer, all 47 first-milestone tests passed. The old service health fixture's version literal was updated when the full suite exposed it.

Mobile opt-in, portable temporary roots and 44px touch-target assertions failed before their implementation. Phone testing separately proved that SDK control refresh reset the visible output path to empty; supplying the stored field value on refresh fixed the new assertion. A simulated system temporary-directory symlink/junction proved that uncanonicalized fixture paths would conflict with the intentional attachment ancestor checks; the fixture helper now canonicalizes its base, without weakening production file safety.

The first baseline test run preceded the README's required build and failed the two installer tests for missing ignored bundles; building resolved both with no source edits. System Chrome was unavailable. Installed Edge 130 launched, but repeated phone archive taps delivered touchstart/touchend without a synthesized click; captured panel metadata showed no export request and no application error. The same test passed unchanged on the already-installed current Playwright Chromium. No browser was downloaded. Edge 130 touch emulation is not counted as passing. Diagnostic instrumentation was removed after isolating that browser-specific difference; useful failure screenshots/accessibility snapshots remain in the test.

## Limits and deferred host work

- Native Windows/Linux/macOS OpenChamber 2.7.1 runtime installation was not performed. Linux/macOS native execution and the configured CI matrix were not run on this Windows machine. Mobile browser emulation is not a real native-phone or relay test.
- The current host bridge still caps individual OpenCode responses, excludes the experimental durable-log route and does not support general authenticated ZIP delivery through the guest SDK. An oversized/failed core read aborts preparation; denied logs are explicit warnings; `serverVersion` is `null` when unknown. Do not advertise unrestricted full-export parity or phone downloads.
- The standalone receiving prompt is `docs/superpowers/plans/2026-11-14-openchamber-export-host-follow-up-prompt.md`. It scopes a separate later task in the OpenChamber repository for complete restricted evidence streaming, backend pinning/version metadata and native authenticated artifact delivery across direct/native/relay clients. No host implementation was started here.
- Stress/native smoke/native Windows dialog tests were not rerun: this change does not alter the archive algorithms, and the existing Windows chooser remains guarded and optional. The ordinary unit suite still exercises the streaming writer and an independent ZIP64 reader case, but this is not a new multi-gigabyte benchmark or native host response-limit test.
- Archives and retained evidence may contain secrets in real use. Host directories must support hard links; FAT/exFAT destinations remain unsupported. No installation, push, PR, merge or cleanup was performed.

## Independent review

One fresh-context read-only reviewer inspected the complete base-to-working-tree change, published parser and all new workflow/handoff/validation files (review session `ses_e28747a6fffeaBk53lhgVtaifl`). It reported no Critical findings, one Important cross-filesystem staging hazard and one Minor warning-overflow issue. The warning issue was regraded Important because it violates functional mobile-width behavior rather than merely changing appearance. Both were fixed in one pass, not silently deferred:

- Cross-filesystem update: a regression executes the actual updater with filesystem/API boundaries substituted because a second physical filesystem is not guaranteed on Windows/CI. It first reproduced the native pause and attempted rename. The device preflight then made it pass with zero native mutations and an actionable `--temp-root` error. Existing real-filesystem installation/update tests also pass. This does not claim an actual cross-device mount was exercised locally.
- Warning overflow: the phone test first reproduced overflow using a complete warning with a 200-character unbroken session identifier, then passed after adding `overflow-wrap:anywhere`. The assertion preserves the full warning text rather than clipping it.

After that fix pass, typecheck/build, all 50 unit tests, the full UI scenario and diff whitespace checks passed. No second reviewer was dispatched; the final fixes are verified by their observed RED → GREEN regressions and green suites.

The reviewer declined to infer native runtime, physical phone/relay, revocation-in-flight or backend-switch behavior from this read-only pass. Those remain explicitly unverified; the accepted host limitations remain deferred, and unsuccessful Edge 130 emulation remains excluded from passing evidence. There are no deferred code-review findings.
