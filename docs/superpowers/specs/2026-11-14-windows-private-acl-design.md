# Repeatable private directory ACLs on Windows

## Intent and evidence

Repeated calls to `privateDirectory()` must preserve owner-only private transfer directories without administrator elevation. On unchanged upstream, the upload-restart test fails at a second upload initialization with `SeSecurityPrivilege`. A read-only investigation of installed Windows PowerShell 5.1 IL found that its `Set-Acl` provider initially persists all descriptor sections, including Audit, and its privilege fallback compares requested audit protection with existing access protection. Once the first call protects the DACL, a repeated call can retain the unnecessary Audit request.

## Approaches and chosen design

Keep constructing the same fresh `DirectorySecurity` with current-user ownership, protected access rules, and one inheritable FullControl grant. Replace only PowerShell's final `Set-Acl` provider call with .NET Framework `[System.IO.Directory]::SetAccessControl($p,$a)`. Its persistence uses the descriptor's changed Owner/Access sections without asking to modify Audit. The user approved this exact approach and synthetic-directory ACL tests in the chat approval form.

Elevation or enabling `SeSecurityPrivilege` would grant unnecessary authority. Skipping already existing directories or suppressing errors could leave private data exposed. Adding a grant to an existing ACL could retain unrelated principals. None of those alternatives is permitted.

## Scope and validation

Modify `src/private-channel.ts`, add `tests/private-channel.test.ts`, and rebuild `openchamber/service.cjs` plus `openchamber/plugin/index.js`. Test initial and repeated calls, exact Windows Owner/Access read-back, inherited permissions on a newly created child, hardening that child, and a Unicode path. Retain equivalent owner-only mode checks on non-Windows systems. Re-run upload tests, unit tests, typecheck, build, and the eventual full UI suite.

Only newly created synthetic directories under the approved temporary test root may have ACLs changed. Do not elevate, change machine policy, weaken privacy requirements, touch live transfer directories, install, publish, or clean up retained evidence. Commit separately from the selector and subsequent touch-test fix.
