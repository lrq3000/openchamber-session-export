# Resume selector synchronization

## Intent and scope

The extension panel must display the export profile actually selected by the user in both browser and desktop hosts. Selecting Resume snapshot must change the selector label and selected option, reveal the optional history checkbox, and survive later panel refreshes. Selecting Complete must reverse that presentation without changing export semantics.

## Approaches

Use the existing SDK controlled selector and pass the current profile through its update handle. This is the minimal approach: the panel already owns the profile and refreshes after selection. Replacing the selector or mutating its DOM directly would duplicate SDK behavior and introduce unnecessary maintenance. The user approved the existing-control approach in the chat approval form.

## Implementation and validation

Update only the profile value synchronization in `src/panel.ts`, add real rendered-control regression assertions in `tests/ui/panel.test.ts`, and rebuild the shipped panel bundle. Exercise Complete → Resume snapshot → Complete, reopening the menu, checkbox visibility, and intervening refreshes in browser, touch, and Electron-user-agent contexts. Electron user-agent coverage is not a native desktop-app test.

## Constraints

Work only on `fix/resume-selector` under `.worktrees/fix-resume-selector`, based on `origin/main` at `c44af02`. Do not push, merge, update the installed extension, export private conversations, change dependencies, or clean up retained evidence. Existing SDK version remains 2.7.1. Capture synthetic screenshots under the existing temporary test root.

## Separate baseline issue

Before product edits, the upstream unit suite passed 74/75 tests. The upload-restart test also failed alone because Windows rejected the existing `Set-Acl` operation for missing `SeSecurityPrivilege`. The user requested a separate fix and commit for that issue; its implementation requires a separate inspected plan and does not belong in the selector commit.
