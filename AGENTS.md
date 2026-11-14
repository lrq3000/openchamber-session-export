# Implementation guidelines

## Language and comments

- Use idiomatic English for code identifiers, UI copy, comments, and new developer documentation. Existing French planning text describes requirements; it is not the intended UI wording.
- Comment nontrivial behavior, especially security boundaries, effective-context assembly, identifier/path remapping, streaming, cancellation, and recovery. Explain the rationale and invariants rather than restating obvious code.
- Preserve the established spelling of external API names and fields.

## Importer notice

The importer must display this notice in italics:

*Importing always creates a new session. OpenCode’s import API cannot update an existing session.*

- Keep it visible before import confirmation for both client-upload and server-path imports. Do not hide it in a tooltip or help page.
- Use semantic emphasis, such as `<em>`, and test both the notice and its italic presentation.
- Import into fresh session IDs. Never treat the official import endpoint as an update or overwrite operation.

## Native transfer contracts

- The tested engine is OpenCode 2.3.0. Its official importer truncates at the first unfinished assistant and omits running shell records. Seal only prepared copies as interrupted, preserving source records in the ZIP. Use an `aborted` assistant error: an `unknown` error can discard text in model-facing conversion.
- Resume must preserve the engine-assembled `metadata.recent` and remove only the obsolete `metadata.keepID` reference from its copied compaction. Do not replace this with a timestamp cutoff or a new model summary.
- OpenChamber pins are objects containing `id`, `createdAt`, `role` and optionally `sessionID`. Remap both message and session identities and test the actual object shape.
- Native instruction keys are slash-free lowercase identifiers; values are JSON, not only strings, and have a 256 KiB limit. Validate fully adapted payloads and instructions before confirmation, then verify native read-back.
- A lost mutation acknowledgement is not proof of failure. Preserve created/candidate session IDs, keep native journals authoritative over ancillary local errors, and never automatically replay import or finalization writes. Stable job locators must support offline inspection across managing-host PID changes without authorizing writes on a replacement instance.
- Run the isolated contract suites in `tests/smoke/` when changing these behaviors. They must not discover live services or inherit provider credentials. Real Windows/Electron and Android validation remains separate from browser emulation.
