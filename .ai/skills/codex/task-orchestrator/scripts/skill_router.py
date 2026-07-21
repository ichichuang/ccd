#!/usr/bin/env python3

import json
import pathlib
import sys


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
        evidence = [value for value in item["keywords"] if value.lower() in normalized]
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
    skills = list(dict.fromkeys(skill for item in matches for skill in item["skills"]))
    result = {
        "task": task,
        "routes": [{"id": item["id"], "evidence": item["evidence"]} for item in matches],
        "skills": skills or manifest["fallback"],
    }

    if "--json" in sys.argv:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(", ".join(result["skills"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
