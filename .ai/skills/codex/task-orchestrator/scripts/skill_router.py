#!/usr/bin/env python3
"""Select the smallest useful skill set for a task using the repo routing manifest."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from fnmatch import fnmatch
from pathlib import Path


@dataclass
class Match:
    route_id: str
    score: int
    skills: list[str]
    prechecks: list[str]
    token_strategy: list[str]
    reasons: list[str]


def repo_root() -> Path:
    return Path(__file__).resolve().parents[5]


def manifest_path() -> Path:
    return repo_root() / ".ai" / "manifests" / "skill-routing.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task", help="Task description.")
    parser.add_argument(
        "--paths",
        nargs="*",
        default=[],
        help="Optional repo-relative paths that are expected to be touched.",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON.")
    return parser.parse_args()


def contains_keyword(task: str, keyword: str) -> bool:
    if re.search(r"[A-Za-z]", keyword):
        pattern = r"\b" + re.escape(keyword.lower()) + r"\b"
        return re.search(pattern, task) is not None
    return keyword in task


def match_route(task: str, paths: list[str], route: dict[str, object]) -> Match | None:
    normalized = task.lower()
    score = 0
    reasons: list[str] = []

    for keyword in route.get("keywords", []):
        if contains_keyword(normalized, str(keyword).lower()):
            score += 2
            reasons.append(f"keyword:{keyword}")

    for pattern in route.get("path_globs", []):
        if any(fnmatch(path, pattern) for path in paths):
            score += 3
            reasons.append(f"path:{pattern}")

    if score == 0:
        return None

    return Match(
        route_id=str(route["id"]),
        score=score,
        skills=list(route.get("skills", [])),
        prechecks=list(route.get("prechecks", [])),
        token_strategy=list(route.get("token_strategy", [])),
        reasons=reasons,
    )


def dedupe(items: list[str]) -> list[str]:
    return list(dict.fromkeys(items))


def route_task(task: str, paths: list[str]) -> dict[str, object]:
    manifest = json.loads(manifest_path().read_text(encoding="utf-8"))
    matches: list[Match] = []

    for route in manifest["routes"]:
        match = match_route(task, paths, route)
        if match:
            matches.append(match)

    matches.sort(key=lambda item: (-item.score, item.route_id))

    default_route = manifest["default_route"]
    selected_skills = list(default_route.get("skills", []))
    prechecks = list(default_route.get("prechecks", []))
    token_strategy = list(default_route.get("token_strategy", []))
    reasons = ["default-route"]

    if matches:
        selected_skills = []
        prechecks = []
        token_strategy = []
        reasons = []
        for match in matches:
            selected_skills.extend(match.skills)
            prechecks.extend(match.prechecks)
            token_strategy.extend(match.token_strategy)
            reasons.extend(match.reasons)

    payload = {
        "task": task,
        "paths": paths,
        "selected_skills": dedupe(selected_skills),
        "prechecks": dedupe(prechecks),
        "token_strategy": dedupe(token_strategy),
        "matched_routes": [match.route_id for match in matches],
        "reasons": dedupe(reasons),
    }
    return payload


def render(payload: dict[str, object]) -> str:
    lines = [
        f"matched_routes: {', '.join(payload['matched_routes']) if payload['matched_routes'] else 'default'}",
        f"selected_skills: {', '.join(payload['selected_skills'])}",
        f"prechecks: {', '.join(payload['prechecks']) if payload['prechecks'] else 'none'}",
        "token_strategy:",
    ]
    for item in payload["token_strategy"]:
        lines.append(f"- {item}")
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    payload = route_task(args.task, args.paths)
    if args.json:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
    else:
        print(render(payload))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
