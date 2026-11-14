# Viewport-sized touch test fixture

## Intent and observed failure

Keep actual touchscreen interactions reliable in the synthetic SDK panel test without changing application behavior. The existing fixture used a 900px-tall iframe in a 780px phone viewport, creating scrolling in both the parent document and panel. On the installed Chromium-based Edge 130, an off-screen file-selection tap delivered touchstart/touchend to the checkbox but no click; after an explicit center-scroll experiment, its compatibility click instead targeted Create archive at a different vertical coordinate. The checkbox stayed unchecked and the later archive action timed out.

## Approaches and chosen design

Size the synthetic iframe to `100dvh` and make it block-level so its parent has no overflow or inline baseline gap. Leave the panel as the scroll owner, matching the host's bounded panel layout. Retain `.tap()` and Playwright's actionability waits; assert the checkbox's checked state immediately after the tap, and assert the parent does not scroll. Retain diagnostic touch/click events as synthetic temporary evidence. The user approved test-only scrolling/geometry correction as a third commit after the ACL fix.

An explicit center-scroll alone did not resolve the failure and was removed. Arbitrary sleeps, retries, larger timeouts, forced clicks, replacing touch with mouse input, or modifying SDK/product behavior are not part of the solution. The trace establishes behavior on this installed browser; it does not claim a universal browser defect or a native Android result.

## Scope and validation

Modify only `tests/ui/panel.test.ts` and this directly related design/checklist. Run the unchanged failing flow before the fix, then the focused panel suite, two complete UI runs, and typecheck. Inspect phone and selector screenshots. No app installation, real user browser profile, private conversation, new dependency, publication, or cleanup is authorized.
