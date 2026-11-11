"""Verify the filtered Git history against its original collection without changing either repository."""

import argparse
import json
import subprocess
from pathlib import Path


class ExtractionAudit:
    """Compare every retained snapshot and its original attribution, not only the final working tree."""

    def __init__(self, source: Path, target: Path):
        self.source = source
        self.target = target
        self.manifest = json.loads((target / "docs/history/extraction.json").read_text(encoding="utf-8"))

    @staticmethod
    def git(repository: Path, *arguments: str) -> bytes:
        return subprocess.check_output(["git", "-C", str(repository), *arguments])

    def tree(self, repository: Path, commit: str, original: bool) -> dict[str, bytes]:
        entries = {}
        prefix = self.manifest["pluginPrefix"]
        documents = set(self.manifest["documents"])
        for record in self.git(repository, "ls-tree", "-rz", "--full-tree", commit).split(b"\0"):
            if not record:
                continue
            metadata, raw_path = record.split(b"\t", 1)
            path = raw_path.decode("utf-8")
            if original:
                if path.startswith(prefix):
                    path = path[len(prefix):]
                elif path not in documents:
                    continue
            if path in entries:
                raise AssertionError(f"Colliding extraction path: {path}")
            entries[path] = metadata
        return entries

    def run(self) -> dict:
        manifest = self.manifest
        expected = set(self.git(self.source, "rev-list", manifest["sourceBase"], "--", manifest["pluginPrefix"], *manifest["documents"]).decode("ascii").splitlines())
        retained = {entry["source"] for entry in manifest["commits"]}
        if expected != retained:
            raise AssertionError(f"Missing or extra relevant commits: missing={sorted(expected - retained)}, extra={sorted(retained - expected)}")
        attribution = "%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI%x00%B"
        for entry in manifest["commits"]:
            old, new = entry["source"], entry["extracted"]
            if self.tree(self.source, old, True) != self.tree(self.target, new, False):
                raise AssertionError(f"Filtered snapshot differs from the approved files of {old}")
            if self.git(self.source, "show", "-s", f"--format={attribution}", old) != self.git(self.target, "show", "-s", f"--format={attribution}", new):
                raise AssertionError(f"Author, date, committer or message changed for {old}")
            subprocess.run(["git", "-C", str(self.target), "merge-base", "--is-ancestor", new, "HEAD"], check=True)
        historical = set(self.git(self.target, "rev-list", manifest["extractedHead"]).decode("ascii").splitlines())
        if historical != {entry["extracted"] for entry in manifest["commits"]}:
            raise AssertionError("The extracted history contains additional or missing commits")
        return {"verifiedCommits": len(retained), "dedicatedDocuments": len(manifest["documents"]), "sourceBase": manifest["sourceBase"], "extractedHead": manifest["extractedHead"], "snapshotsAndAttributionMatch": True}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Original lrq3000_agent_skills checkout, retaining the historical source objects")
    parser.add_argument("--target", type=Path, default=Path(__file__).resolve().parents[2])
    arguments = parser.parse_args()
    print(json.dumps(ExtractionAudit(arguments.source.resolve(), arguments.target.resolve()).run(), indent=2))
