# Changelog

## 0.5.4

- Documented recovery from Windows Git update failures.

## 0.5.3

- Corrected the Windows permissions test to account for the runner's default directory owner before hardening.

## 0.5.2

- Kept Windows private-directory permissions owner-only without depending on PowerShell module discovery.

## 0.5.1

- Clarified the backup, transfer, and Resume workflows without changing their behavior.

## 0.5.0

- Added an opt-in subagent scope to both export modes and applied effective-context selection separately to each included session.

## 0.4.1

- Synchronized the selected export mode.
- Made Windows private-directory ACL hardening repeatable without audit privileges.
- Corrected viewport sizing in the synthetic touch fixture.

## 0.4.0

- Added Complete and Resume profiles, size previews, and a bundled plugin.
- Added new-session ZIP import, upload, and optional companion download.

## 0.3.0

- Added mobile opt-in and the native host read connection.

## 0.2.1

- Recorded [source extraction and provenance](HISTORY.md).

## 0.2.0

- Added disk-backed export and Windows Save As.

Project metadata records creation on `2026-11-07` and was last updated on `2026-11-24`. The package manifests, lockfile, and runtime labels share the same version.
