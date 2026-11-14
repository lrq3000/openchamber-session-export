# Direct Git Extension Installation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the repository itself installable through OpenChamber's Git URL extension installer without a developer build.

**Architecture:** Add the native manifest to the existing root package with entries prefixed by `openchamber/`. Ship the existing built bundles, preserve the nested-folder package, and use release tests plus a CI freshness check to prevent regression.

**Tech Stack:** TypeScript, Node >=22.13, SDK 2.7.1, esbuild, node:test, Git.

**Spec:** `docs/superpowers/specs/2026-11-14-git-extension-install-design.md`

## Global Constraints

- Work only in `.worktrees/fix-git-extension-install` on `fix/git-extension-install`; preserve main and other worktrees.
- Keep release 0.3.0, API version 1, OpenChamber >=2.7.1, SDK 2.7.1 and exactly `service` and `opencode` capabilities.
- Preserve nested-folder installs, runtime algorithms and dependencies.
- No live installation, private session access, push, PR, merge or deletion; retain synthetic fixtures in the approved temporary directory.

## Review Focus

- A valid root manifest with missing bundles must still fail regression coverage.
- A locally present but untracked bundle must not count as a distributable file.
- Root and nested manifests must preserve identity, capabilities and relative-path semantics.
- A copied Git package without node_modules must serve the panel's built script and start its service with synthetic credentials.
- A source edit followed by a build must not leave stale committed bundles undetected by CI.

---

### Task 1: Complete Git-installable package

**Files:** Modify `package.json`, `.gitignore`, `tests/release.test.ts`, `README.md`, `.github/workflows/test.yml`; add generated `openchamber/panel/app.js` and `openchamber/service.cjs` using `scripts/build.mjs`. Include this plan and its approved design.

**Interfaces:** The root `openchamber` object matches the nested manifest except that its panel and service entry paths start with `openchamber/`. `scripts/build.mjs` keeps its existing outputs. Git-tracked files, not the local working directory alone, define shipped assets.

- [x] Reproduce the exact root parser error with `parseManifest`, inspect the nested manifest, loader documentation, Git inventory, build script and existing release tests.
- [x] Create the isolated worktree and install locked dependencies with `npm ci --ignore-scripts --no-audit --no-fund`; run `npm run build` then `npm test` as baseline (50/50 passed).
- [x] Add tests named `the repository root is an API-version-1 extension with the same contributions as the standalone folder` and `Git-tracked packages include built panel assets and a dependency-free working service`; assert parser success, contribution equivalence, exact two capabilities, tracked asset presence, no copied node_modules and synthetic authenticated health response `{ ok: true, version: '0.3.0' }`.
- [x] Run `node --import tsx --test tests/release.test.ts` and observe the missing root-manifest and untracked-bundle failures before implementation.
- [x] Add the root manifest, remove the bundle ignore rules, generate both bundles, and update installation guidance and CI's bundle-tracking/freshness check. Stage only the approved runtime bundles so tracked-file regression tests can exercise the prospective Git package.
- [x] Run the focused release tests, `npm run typecheck`, `npm run build`, `npm test`, the CI freshness check and `git diff --check`; inspect all task changes.
- [x] Obtain one fresh-context read-only review of the packaging contract and tests; verify any findings and correct valid in-scope defects.
- [x] With separate explicit approval, extend `scripts/build.mjs` to embed the complete SDK/MIT/BSD dependency license texts in deterministic bundle headers; observe the new notice-retention test fail before that change.
- [x] Rebuild, rerun release tests, typecheck and all unit tests, then restage rebuilt bundles and verify freshness and whitespace.
- [x] Update this ledger with results and retained fixture locations, inspect the final diff, and commit the complete working milestone as `fix: make repository directly installable as an OpenChamber extension`, with OpenCode and GPT-6.1 Sol attribution. Verify no task changes remain uncommitted.

## Execution record

The user approved inline the short design, file/command preview, dependency setup, isolated native execution, one read-only independent review and a local commit. This document records that approved checklist without widening it. Root-cause reproduction ran in the root checkout read-only; baseline verification and all writes run in the new worktree. The original root checkout was clean on main at `6729dbbeac35332aa234bb8c06363af3fd583d4e`.

Pre-flight: one cohesive task, no shared interfaces between tasks. This approved plan is also the execution ledger; no extra Bash helper workspace is needed on Windows.

Task 1: regression run failed 2/5 as expected: root parser reported the user's exact unsupported-api-version message; tracked-package assertion rejected the ignored panel bundle. After the fix, all 5 release tests passed and both root/folder service launches returned the authenticated 0.3.0 health response without node_modules. An initial typecheck identified the SDK's optional panel entry type in test code; an explicit presence assertion fixed the narrowing. Final typecheck and unit suite passed (52/52), as did build, bundle freshness (`git diff --exit-code -- openchamber/panel/app.js openchamber/service.cjs`) and `git diff --check HEAD`.

Validation limits: tests use the actual published manifest parser and copied production assets with a synthetic service environment; no live OpenChamber Git-install mutation was performed. The configured Linux/macOS CI checks were not run locally. Synthetic evidence is retained under `C:/Users/33632/AppData/Local/Temp/opencode/session-export-*`, including the `session-export-git-package-*` fixtures; no files were deleted.

Final review: fresh-context read-only reviewer `ses_e27fa6eafffewyph3d1Atj7Ip8` found no functional packaging defect, independently checked bundle freshness/dependency closure, and identified one Important distribution defect: missing full upstream license notices. No Critical or Minor findings. The user approved the additional build-script/test/documentation correction in a second inline approval form. `shipped bundles retain the full copyright and license notices of their bundled dependencies` then failed as expected on the missing SDK notice before the banner implementation.

Final: Ruling: live host installation and remote Linux/macOS CI remain unverified, publication/version changes remain outside this approval, and unchanged export algorithms were not re-audited — these were the reviewer's explicitly declined areas and do not change the approved packaging fix — cost: host/platform integration beyond the synthetic package tests is not established, and the remote URL remains unchanged until separately authorized publication.

Final: fixed missing dependency notices — notice-retention test RED→GREEN; build, typecheck and full unit suite 53/53 pass. Complete upstream copyright, permissions, conditions and disclaimers are embedded in each relevant production bundle. The existing installer still copies the same four files and therefore preserves those notices. No review findings remain deferred. A fresh rebuild matches the staged bundle bytes and whitespace checks pass. Task 1 is complete as the single local commit carrying this ledger; its hash is recorded in Git history. Keep the branch and worktree as-is; publication, installation and cleanup require separate approval.
