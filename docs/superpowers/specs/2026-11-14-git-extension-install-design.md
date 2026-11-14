# Direct Git Extension Installation Design

## Intent and evidence

Allow the standalone repository URL to install as an OpenChamber extension without a local build. The published SDK 2.7.1 parser reproduces `Unsupported apiVersion. This host accepts 1.` for the root development package, which has no `openchamber` block; the nested manifest already parses successfully. Git tracks neither runtime bundle. OpenChamber's SDK documentation states that the host does not compile extensions and requires shipped built scripts.

## Approaches and approved choice

Add an API-version-1 manifest to the root development package, using `openchamber/panel/index.html` and `openchamber/service.cjs` as package-relative entries, and track the existing build outputs. This preserves the stable source URL and existing nested-folder installation with the smallest change. A documentation-only workaround requires users to build locally and does not satisfy direct Git installation. A separate distribution repository or branch introduces release synchronization and a different installation URL without solving an additional requirement.

## Goals, constraints and non-goals

Both package roots must parse under SDK 2.7.1, retain the same panel/action identity, request exactly `service` and `opencode`, and require OpenChamber >=2.7.1. Keep release 0.3.0, dependencies, export behavior and native permission boundaries unchanged. Keep the nested installation layout and build command. Track `openchamber/panel/app.js` and `openchamber/service.cjs`; CI must reject missing or stale tracked bundles. Tests must verify a package made only of Git-tracked extension files, without development dependencies, can load its page assets and run the service health endpoint with synthetic host environment values. No live installation, host changes, real transcript access, push, PR, merge or deletion is authorized.

## Approved review correction

The independent review found the existing build omitted notices required by the bundled MIT/BSD dependencies. The user separately approved extending `scripts/build.mjs` to embed full installed license texts as deterministic comment headers: SDK in the panel; yazl, buffer-crc32, stream-json and stream-chain in the service. A release test must require those complete notices. This keeps every distribution path compliant with the inspected notice requirements without changing the four-file installer contract, dependencies or runtime behavior.

## Verification and side effects

Implement in `.worktrees/fix-git-extension-install` on `fix/git-extension-install`, leaving the root main checkout unchanged. Run regression tests before and after the packaging changes, typecheck, the existing build, the unit suite and whitespace checks. Validate both manifests and the portable package's authenticated health response. Review the branch independently, then make a focused local commit. Dependency installation, generated bundles, local Git metadata and retained synthetic temporary fixtures are the authorized side effects; publication of the commit is a separate action. The user approved this design and its execution checklist in the inline approval form on 2026-11-14.
