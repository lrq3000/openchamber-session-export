# Export subagent sessions independently of export mode

Place an unchecked **Include subagent sessions** checkbox above **Export mode**. It applies to the selected session's full descendant tree, including archived and nested sessions. Changing mode preserves the checkbox; changing the target resets it. Changing either export setting invalidates the prepared inventory, estimate, and exact ZIP.

Complete preserves the full transcript and available durable events of each included session. Resume applies the same existing OpenCode effective-context, checkpoint, pin, instruction, and trailing-record rules separately to each included session; it does not add historical events or generate summaries. The separate opt-in earlier-conversation reference remains main-session-only. Parent transcript records are not redacted when descendant capture is disabled.

**Approaches:** Gate descendant enumeration at capture time and run the existing profile over every captured session. This keeps preview, attachments, ZIP contents, and existing parent/child restore in agreement. Filtering only while writing the ZIP would already have read excluded transcripts and could leave stale inventory entries. A global time cutoff is not a substitute for the engine's per-session compaction boundaries.

Use the existing TypeScript, SDK controls, disk-backed indexes, and archive layout without adding dependencies or changing native import behavior. Record the selection in new manifests; existing ZIPs remain importable.
