#!/usr/bin/env python3
"""Summarize local GitHub-related repo context for repo-aware automation."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path


def run(cmd: list[str], cwd: Path) -> str:
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if proc.returncode != 0:
        return ""
    return proc.stdout.strip()


def list_rel(root: Path, pattern: str) -> list[str]:
    return sorted(str(path.relative_to(root)) for path in root.glob(pattern))


def main() -> int:
    repo = Path.cwd()
    github_dir = repo / ".github"
    payload = {
        "repo_root": str(repo),
        "git": {
            "branch": run(["git", "branch", "--show-current"], repo),
            "origin": run(["git", "remote", "get-url", "origin"], repo),
            "remotes": run(["git", "remote", "-v"], repo).splitlines(),
        },
        "github": {
            "exists": github_dir.exists(),
            "workflows": list_rel(repo, ".github/workflows/*"),
            "issue_templates": list_rel(repo, ".github/ISSUE_TEMPLATE/*"),
            "pull_request_templates": list_rel(repo, ".github/PULL_REQUEST_TEMPLATE*"),
            "codeowners": list_rel(repo, ".github/CODEOWNERS"),
            "dependabot": list_rel(repo, ".github/dependabot*"),
            "actions_configs": list_rel(repo, ".github/actions/*"),
        },
    }
    print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
