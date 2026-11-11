# Source extraction and provenance

OpenChamber Session Export was extracted on 2026-11-12 from [lrq3000/lrq3000_agent_skills](https://github.com/lrq3000/lrq3000_agent_skills) at source baseline `c9da021f3e0da9210038782827021044836d7265`. Its independent repository is [lrq3000/openchamber-session-export](https://github.com/lrq3000/openchamber-session-export). The original collection retains its complete history and references this source as a commit-pinned Git submodule; configuring branch `main` does not itself make a clone float to that branch tip.

## What was preserved

Only `plugins/openchamber-session-export/`, promoted to this root, and the six dedicated design/plan/validation documents under `docs/` were selected. Three relevant main-branch commits remain. Every retained snapshot's blob identifiers and modes, author/committer names, emails, dates and full messages are compared against the source. History rewriting changes tree/parent identities and therefore commit identifiers; references inside historical messages intentionally remain original.

The machine-readable selected paths and complete mapping are in [docs/history/extraction.json](docs/history/extraction.json):

- Original `d63cfce69459136e09643ed8454c3cf7e5fa2b23` → extracted `c9e701e2145948303c901bd170bf2e27ebaeb639`.
- Original `e39d9f6cdd2d47c3ab80533152e5e592fb4d16af` → extracted `bf765a816ac493d72332f9bf3dfcc2c9df2035d8`.
- Original `591b11405959c1c58622a1d0ea870258e9cb2b2c` → extracted `b7c30c861e8a7663e93c0f8d35b22fece42c7476`.

Feature-branch commits quoted within the original squash messages remain historical references in the original collection. Unrelated collection branches, tags, module files and history were not imported or published here. Later standalone migration commits follow this filtered history without changing historical attribution.

## Reproduction and verification

Use git-filter-repo 2.47.0 in a fresh isolated clone of the collection's main at the source baseline, without tags or local object sharing. Create a path manifest with the plugin prefix followed by the six exact `documents` entries from extraction.json, one per line. Filter it with:

```sh
python /PATH/TO/git_filter_repo.py --paths-from-file /PATH/TO/paths.txt --path-rename plugins/openchamber-session-export/: --preserve-commit-hashes
```

`--preserve-commit-hashes` preserves embedded message references, not the identities of rewritten commits. Then verify every historical selected tree, attribution/message and ancestry:

```sh
python -B tests/review/verify-extraction.py --source /PATH/TO/lrq3000_agent_skills
```

The verifier is reused from the collection's Context Churn Monitor extraction procedure. It detects missing/extra relevant commits, wrong snapshots or attribution and unexpected historical ancestors. Both repositories are read-only during verification; the original source objects must remain available in the source checkout.

## Historical document conventions

The six transferred documents preserve their historical wording, paths, evidence and then-current limitations. Within them, `plugins/openchamber-session-export/` refers to this repository's root. Original collection-level paths and quoted branch/worktree identifiers describe that historical environment, not required current installation paths. Absolute machine paths and synthetic session IDs are retained as provenance, not credentials or portable destinations. Current installation and compatibility claims live in [README.md](README.md).

Release 0.2.1 updates source ownership records and release labels, not export algorithms or dependency versions. Creation remains 2026-11-07; update date is 2026-11-12. Apache-2.0 and Stephen Karl Larroque <LRQ3000@gmail.com> attribution are preserved; historical Git author spellings remain verbatim. No npm publication or installed-profile update is part of this extraction.
