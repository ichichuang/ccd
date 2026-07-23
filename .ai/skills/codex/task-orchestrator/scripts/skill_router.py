#!/usr/bin/env python3

import json
import pathlib
import re
import sys


LEADING_PATH_TOKEN_CHARACTER_CLASS = r"A-Za-z0-9_.-"
TERMINAL_PATH_TOKEN_CHARACTER_CLASS = r"A-Za-z0-9_./-"


def matches_keyword(task: str, keyword: str) -> bool:
    return re.search(r"(^|[^a-z0-9])" + re.escape(keyword) + r"($|[^a-z0-9])", task) is not None


def matches_path(task: str, candidate: str) -> bool:
    trailing_boundary = (
        "" if candidate.endswith(("/", "-")) else rf"(?![{TERMINAL_PATH_TOKEN_CHARACTER_CLASS}])"
    )
    pattern = (
        rf"(?:^|[^{LEADING_PATH_TOKEN_CHARACTER_CLASS}])"
        rf"{re.escape(candidate)}{trailing_boundary}"
    )
    return re.search(pattern, task, re.IGNORECASE) is not None


def glob_pattern(glob: str) -> str:
    pattern = ""
    index = 0
    while index < len(glob):
        if glob.startswith("**/", index):
            pattern += r"(?:[^/\s]+/)*"
            index += 3
        elif glob.startswith("**", index):
            pattern += r"[^\s]*"
            index += 2
        elif glob[index] == "*":
            pattern += r"[^/\s]*"
            index += 1
        elif glob[index] == "?":
            pattern += r"[^/\s]"
            index += 1
        else:
            pattern += re.escape(glob[index])
            index += 1
    trailing_boundary = (
        ""
        if glob.endswith(("/**", "/", "-"))
        else rf"(?![{TERMINAL_PATH_TOKEN_CHARACTER_CLASS}])"
    )
    return rf"(?:^|[^{LEADING_PATH_TOKEN_CHARACTER_CLASS}]){pattern}{trailing_boundary}"


def matches_glob(task: str, glob: str) -> bool:
    return re.search(glob_pattern(glob), task, re.IGNORECASE) is not None


def main() -> int:
    args = [value for value in sys.argv[1:] if value not in {"--json", "--"}]
    task = " ".join(args).strip()
    if not task:
        print('Usage: skill_router.py "<task>" [--json]', file=sys.stderr)
        return 1

    root = pathlib.Path(__file__).resolve().parents[4]
    manifest = json.loads((root / "manifests/skill-routing.json").read_text())
    normalized = task.lower()
    path_task = normalized.replace("\\", "/")
    skill_order = {skill: index for index, skill in enumerate(manifest["skillOrder"])}
    matches = []

    for item in manifest["routes"]:
        evidence = [value for value in item["keywords"] if matches_keyword(normalized, value.lower())]
        evidence += [value for value in item["paths"] if matches_path(path_task, value.lower())]
        evidence += [value for value in item["globs"] if matches_glob(path_task, value)]
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
    skills = sorted(
        dict.fromkeys(skill for item in matches for skill in item["skills"]),
        key=lambda skill: (skill_order.get(skill, sys.maxsize), skill),
    )
    result = {
        "task": task,
        "routes": [{"id": item["id"], "evidence": item["evidence"]} for item in matches],
        "skills": skills or manifest["fallback"],
    }

    if "--json" in sys.argv:
        payload = json.dumps(result, indent=2, ensure_ascii=False).encode("utf-8") + b"\n"
        sys.stdout.buffer.write(payload)
    else:
        print(", ".join(result["skills"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
