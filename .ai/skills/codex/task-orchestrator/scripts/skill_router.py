#!/usr/bin/env python3

import json
import pathlib
import re
import sys


UI_OVERLAPPING_ROUTES = {"project-ui", "unocss", "vue"}


def matches_keyword(task: str, keyword: str) -> bool:
    return re.search(r"(^|[^a-z0-9])" + re.escape(keyword) + r"($|[^a-z0-9])", task) is not None


def main() -> int:
    args = [value for value in sys.argv[1:] if value not in {"--json", "--"}]
    task = " ".join(args).strip()
    if not task:
        print('Usage: skill_router.py "<task>" [--json]', file=sys.stderr)
        return 1

    root = pathlib.Path(__file__).resolve().parents[4]
    manifest = json.loads((root / "manifests/skill-routing.json").read_text())
    normalized = task.lower()
    matches = []

    for item in manifest["routes"]:
        evidence = [value for value in item["keywords"] if matches_keyword(normalized, value.lower())]
        evidence += [value for value in item["paths"] if value.lower() in normalized]
        if evidence:
            matches.append(
                {
                    "id": item["id"],
                    "skills": item["skills"],
                    "priority": item["priority"],
                    "evidence": evidence,
                }
            )

    matches.sort(key=lambda item: (-item["priority"], item["id"]))
    selected_matches = (
        [item for item in matches if item["id"] == "project-ui" or item["id"] not in UI_OVERLAPPING_ROUTES]
        if any(item["id"] == "project-ui" for item in matches)
        else matches
    )
    skills = list(dict.fromkeys(skill for item in selected_matches for skill in item["skills"]))
    result = {
        "task": task,
        "routes": [{"id": item["id"], "evidence": item["evidence"]} for item in selected_matches],
        "skills": skills or manifest["fallback"],
    }

    if "--json" in sys.argv:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(", ".join(result["skills"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
