# Windows native Git extension update: reproduction and recovery

## Verified failure

OpenChamber Desktop 2.8.0 on Windows (bundled OpenCode 2.3.2) detects a newer Session Export Git release and stages a valid clone. Its native `updateGuest` stops the extension service, then tries to rename the existing checkout to `.old-session-export`. Windows refuses that rename with `EPERM`; OpenChamber returns `swap-failed` and leaves the original checkout and registration in place. With the same releases and no running plugin, the rename succeeds. The same failure and recovery were tested when updating from more than one older release.

OpenCode holds two handles below the checkout: a recursive watch of the [configured plugin directory](https://github.com/anomalyco/opencode/blob/v2.3.2/packages/core/src/config/plugin/source.ts#L44-L71) and a [plugin source watch](https://github.com/anomalyco/opencode/blob/v2.3.2/packages/core/src/plugin/module.ts#L25-L39) whose [file backend watches its parent directory](https://github.com/anomalyco/opencode/blob/v2.3.2/packages/core/src/filesystem/watcher.ts#L202-L234). The engine logs identify both watchers. They are owned by longer-lived scopes, not by the running extension service. Removing the plugin from the managed config made it disappear from the active inventory and removed its private bridge, but the subsequent [checkout swap](https://github.com/openchamber/openchamber/blob/v2.8.0/packages/web/server/lib/guests/updates.ts#L251-L284) still failed. A trial that avoided just the entry-file watcher also failed; the directory handle is a separate constraint.

## Reproduce without touching the live profile

In a Windows Git Bash shell with Node.js and Git, run this from the checkout. Supply the absolute directory containing `OpenChamber.exe` and its `resources`, followed by two local Session Export Git revisions whose manifests contain different published versions. The older revision must ship the bundled plugin. Example releases are provided for reproducibility, not as test assertions:

```sh
node tests/review/reproduce-windows-native-update.mjs "$LOCALAPPDATA/Programs/@openchamberelectron" 16d15c2 014cc14
```

The script uses the packaged OpenChamber updater and OpenCode engine, a local bare remote populated with only the supplied revision snapshots, a temporary profile, synthetic authentication, and no provider call. It verifies the failed rename before and after deactivation, then restarts only its isolated OpenCode engine with the extension still paused and verifies the update. It checks the new version, path, unchanged registration and grants, unchanged storage identity, retained synthetic service data, and successful service and plugin startup after re-enabling. It calls backend functions and mirrors the managed-config change; it does not drive the Desktop UI or test GitHub network access. Fixture and log directories are retained under the printed path for manual cleanup; they must not be shared raw.

## Recovery and permanent fix criteria

Use the [paused-restart procedure](../README.md#if-a-git-update-fails-on-windows-desktop) instead of removing the extension. An already-current installation needs no recovery. Restart only after all work and transfers on the affected Desktop host have settled.

A permanent upstream fix must allow the normal native update while the old plugin is loaded, without requiring an engine restart or losing grants, data or Git provenance. Either fix the OpenCode watch behavior so the directory can be swapped and the new build is reloaded, or change the OpenChamber update mechanism to tolerate a checkout that cannot be renamed. Retrying the same rename, changing package metadata, or altering only the file watcher does not meet the verified failure conditions.

Use this reproduction as the failing control for an upstream fix, not as its acceptance test. Test the integrated updater via Settings or the actual update route on Windows, with distinguishable old and new plugin builds. Verify a build-specific runtime marker after the normal update while the original OpenCode process is still running. A new plugin instance ID alone does not prove that the new build was loaded.
