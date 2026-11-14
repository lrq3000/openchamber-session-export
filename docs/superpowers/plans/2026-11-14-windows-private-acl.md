# Windows Private ACL Implementation Plan

> **For agentic workers:** Use `executing-plans` and retain this checklist as the execution ledger.

**Goal:** Make private-directory hardening repeatable without unnecessary Windows audit privileges.

**Architecture:** Retain the existing descriptor construction and use .NET Framework's direct directory setter to persist only modified security sections. Test real ACLs on isolated synthetic directories, not a mocked PowerShell result.

**Tech Stack:** TypeScript, Node test runner, Windows PowerShell 5.1, .NET Framework filesystem ACL APIs.

**Spec:** `docs/superpowers/specs/2026-11-14-windows-private-acl-design.md`.

## Global Constraints

- Same isolated worktree and branch; a separate local commit after the selector commit.
- Only synthetic temporary-directory ACLs may change. No elevation, machine-policy change, live-data ACL change, installation, publication, or cleanup.
- Preserve the existing private owner, protected DACL, sole inheritable FullControl grant, environment-based path passing, and error propagation.

## Review Focus

- Repeating the helper must not request `SeSecurityPrivilege`.
- Hardening must replace unwanted grants, not just add another grant.
- Child inheritance must grant access only to the intended SID.
- Unicode paths must remain data, never interpolated script code.
- Non-Windows owner/mode validation must remain unchanged.

## Task 1: Persist only changed ACL sections

**Files:** `src/private-channel.ts`, `tests/private-channel.test.ts`, rebuilt `openchamber/service.cjs` and `openchamber/plugin/index.js`, and directly related design/checklist.

**Interfaces:** Keep `privateDirectory(directory: string): Promise<void>` and all callers unchanged.

- [x] Add a real-filesystem regression that hardens a Unicode-named directory repeatedly and checks private Owner/Access rules, child inheritance and repeated child hardening on Windows; verify 0700/current ownership on other platforms.
- [x] Run `node --import tsx --test tests/private-channel.test.ts`; the second existing `Set-Acl` call failed with `SeSecurityPrivilege` after initial ACL read-back passed.
- [x] Replace only the provider setter in `privateDirectory()` with `[System.IO.Directory]::SetAccessControl($p,$a)` and document why Audit must not be requested.
- [x] Focused ACL/upload tests pass 4/4. Typecheck and build pass. Full `npm test` passes 76/76 without elevation; log: `C:/Users/33632/AppData/Local/Temp/opencode/session-export-acl-unit.log`.
- [x] Review and prepare this milestone's separate local commit, including rebuilt service/plugin bundles. Leave final full UI verification to the subsequently requested touch-test correction.

## Execution ledger

Pre-flight: one task; no interface changes. Baseline failure was reproduced both in the full upstream suite and alone before source edits. A fresh read-only investigator confirmed the installed provider's All-sections write and fallback comparison using runtime IL; the proposed setter was then verified by the real-filesystem regression below.

Runtime verification confirms repeated root/child hardening and exact Owner/Access read-back on this Windows host. Each protected directory has only the current SID's Allow/FullControl rule, with ContainerInherit/ObjectInherit and no inherited or unrelated grants. A newly created child first inherits that private grant and can then be hardened repeatedly. No process elevation, audit-policy modification, live-directory ACL modification, or error suppression was used. Non-Windows checks are present but were not executed on this Windows host.

Milestone committed separately as `9a1b7c6`. Final unit suite passes 76/76, and both final full UI runs pass 5/5 after the separately requested fixture correction. The independent read-only whole-branch review found no issues in the ACL implementation, regression, or rebuilt bundle correspondence.
