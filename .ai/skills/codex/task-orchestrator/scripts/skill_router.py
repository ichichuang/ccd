#!/usr/bin/env python3

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[5]
MANIFEST_PATH = ROOT / ".ai/manifests/skill-routing.json"
SCOPES_PATH = ROOT / ".ai/manifests/routing-scopes.json"
FIXTURE_PATH = ROOT / ".ai/governance/routing/fixtures/routing-cases.json"
LOCK_PATH = ROOT / ".ai/manifests/skills-lock.json"

ROUTE_FIELDS = [
    "id", "description", "keywords", "scopeIds", "priority", "compositionMode",
    "exclusiveGroup", "primarySkills", "supplementalSkills", "prechecks",
    "tokenStrategy", "matchPolicy", "positiveFixtureIds", "negativeFixtureIds",
]
RESULT_FIELDS = [
    "resultVersion", "manifestVersion", "routerVersion", "status", "input",
    "primaryRoute", "supplementalRoutes", "matchedRoutes", "primarySkills",
    "supplementalSkills", "selectedSkills", "prechecks", "tokenStrategy",
    "matchReasons", "rejectedConflicts", "diagnostics",
]
SCOPE_CLASSIFICATIONS = {
    "universal", "ui-source", "style-source", "typescript-source", "ui-subsystem",
    "routing-subsystem", "composable-subsystem", "state-subsystem", "non-ui-subsystem",
    "adapter-subsystem", "type-subsystem", "utility-subsystem", "bootstrap-subsystem",
    "build-configuration", "runtime-entrypoint", "runtime-specific", "governance-integration",
    "shared-ui-source", "shared-typescript-source", "shared-ui-package", "design-system-package",
    "shared-vue-package", "repository-tooling", "remote-governance", "test-surface",
    "ai-governance", "rule-lineage", "workspace-configuration", "design-system-configuration",
    "future-reserved",
}


class RoutingContractError(Exception):
    def __init__(self, code: str, message: str, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}


def fail(code: str, message: str, details: dict[str, Any] | None = None) -> None:
    raise RoutingContractError(code, message, details)


def read_json(path_value: Path) -> dict[str, Any]:
    return json.loads(path_value.read_text(encoding="utf-8"))


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2, separators=(",", ": ")) + "\n"


def exact_keys(value: Any, expected: list[str], missing_code: str, extra_code: str, label: str) -> None:
    if not isinstance(value, dict):
        fail(missing_code, f"{label} must be an object")
    missing = [key for key in expected if key not in value]
    extra = [key for key in value if key not in expected]
    if missing:
        fail(missing_code, f"{label} is missing required fields", {"missing": missing})
    if extra:
        if any("branch" in key.casefold() for key in extra):
            fail("BRANCH_METADATA_FORBIDDEN", f"{label} contains branch metadata", {"extra": extra})
        fail(extra_code, f"{label} contains unsupported fields", {"extra": extra})


def assert_strings(values: Any, code: str, label: str, allow_empty: bool = True) -> None:
    if not isinstance(values, list) or (not allow_empty and not values) or any(not isinstance(value, str) or not value for value in values):
        fail(code, f"{label} must be an array of strings")
    if len(set(values)) != len(values):
        fail(code, f"{label} contains duplicates")


def assert_sorted(values: list[str], code: str, label: str) -> None:
    if values != sorted(values):
        fail(code, f"{label} must use deterministic ordering")


def is_id(value: Any) -> bool:
    return isinstance(value, str) and re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", value) is not None


def normalize_path(value: Any) -> str:
    normalized = re.sub(r"/+", "/", str(value).strip().replace("\\", "/"))
    if normalized.startswith("./"):
        normalized = normalized[2:]
    segments = normalized.split("/")
    if (
        not normalized
        or "\0" in normalized
        or normalized.startswith("/")
        or re.match(r"^[A-Za-z]:/", normalized)
        or "." in segments
        or ".." in segments
    ):
        fail("INVALID_INPUT_PATH", f"Path must be repository-relative: {value}")
    return normalized


def glob_regex(pattern: str) -> re.Pattern[str]:
    if pattern == "**":
        return re.compile(r"^.*$")
    if (
        not isinstance(pattern, str)
        or not pattern
        or pattern.startswith("/")
        or "\\" in pattern
        or "\0" in pattern
        or re.search(r"[?!\[\]{}]", pattern)
        or any(segment in {".", ".."} for segment in pattern.split("/"))
        or "@(" in pattern
    ):
        fail("INVALID_EFFECTIVE_GLOB", f"Unsupported routing glob: {pattern}")
    source = ""
    index = 0
    while index < len(pattern):
        character = pattern[index]
        if character == "*" and index + 1 < len(pattern) and pattern[index + 1] == "*":
            if index + 2 < len(pattern) and pattern[index + 2] == "/":
                source += r"(?:.*/)?"
                index += 3
                continue
            source += ".*"
            index += 2
            continue
        if character == "*":
            source += r"[^/]*"
        else:
            source += re.escape(character)
        index += 1
    return re.compile("^" + source + "$")


def matches_glob(value: str, pattern: str) -> bool:
    return glob_regex(pattern).fullmatch(value) is not None


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", str(value)).casefold().strip())


def is_word_character(value: str | None) -> bool:
    return value is not None and (value == "_" or value.isalnum())


def contains_keyword(task: str, keyword: str) -> bool:
    haystack = normalize_text(task)
    needle = normalize_text(keyword)
    if any(ord(character) > 127 for character in needle):
        return needle in haystack
    offset = haystack.find(needle)
    while offset >= 0:
        before = haystack[offset - 1] if offset > 0 else None
        after_index = offset + len(needle)
        after = haystack[after_index] if after_index < len(haystack) else None
        if (not is_word_character(needle[0]) or not is_word_character(before)) and (
            not is_word_character(needle[-1]) or not is_word_character(after)
        ):
            return True
        offset = haystack.find(needle, offset + 1)
    return False


def tracked_paths(root: Path = ROOT) -> list[str]:
    output = subprocess.check_output(["git", "ls-files", "-z"], cwd=root)
    return sorted(normalize_path(item.decode("utf-8")) for item in output.split(b"\0") if item)


def validate_scopes(registry: dict[str, Any], tracked: list[str] | None = None, root: Path = ROOT) -> None:
    exact_keys(registry, ["version", "globSemantics", "trackedTopologySource", "scopes", "ruleAssignments"], "SCOPE_SCHEMA_REQUIRED", "SCOPE_SCHEMA_ADDITIONAL_PROPERTY", "routing scopes")
    if registry["version"] != 1 or registry["globSemantics"] != "ccd-routing-glob/v1" or registry["trackedTopologySource"] != "git ls-files -z":
        fail("SCOPE_SCHEMA_ENUM", "Routing scope version or semantics drifted")
    inventory = tracked if tracked is not None else tracked_paths(root)
    ids: set[str] = set()
    previous = ""
    for scope in registry["scopes"]:
        exact_keys(scope, ["id", "description", "classification", "consumers", "effectiveGlobs", "trackedMatchPolicy", "justification"], "SCOPE_SCHEMA_REQUIRED", "SCOPE_SCHEMA_ADDITIONAL_PROPERTY", f"scope:{scope.get('id', 'unknown')}")
        scope_id = scope["id"]
        if not is_id(scope_id) or scope_id in ids:
            fail("DUPLICATE_SCOPE_ID", f"Invalid or duplicate scope ID: {scope_id}")
        if previous and previous >= scope_id:
            fail("NONDETERMINISTIC_SCOPE_ORDER", "Scopes must be sorted by ID")
        previous = scope_id
        ids.add(scope_id)
        if not isinstance(scope["description"], str) or not scope["description"] or scope["classification"] not in SCOPE_CLASSIFICATIONS:
            fail("SCOPE_SCHEMA_ENUM", f"{scope_id} has invalid metadata")
        assert_strings(scope["consumers"], "DUPLICATE_SCOPE_CONSUMER", f"{scope_id}.consumers")
        if any(consumer not in {"rule-index", "skill-routing"} for consumer in scope["consumers"]):
            fail("SCOPE_SCHEMA_ENUM", f"{scope_id} has an invalid consumer")
        assert_sorted(scope["consumers"], "NONDETERMINISTIC_SCOPE_ORDER", f"{scope_id}.consumers")
        assert_strings(scope["effectiveGlobs"], "DUPLICATE_EFFECTIVE_GLOB", f"{scope_id}.effectiveGlobs")
        assert_sorted(scope["effectiveGlobs"], "NONDETERMINISTIC_SCOPE_ORDER", f"{scope_id}.effectiveGlobs")
        if scope["classification"] == "future-reserved":
            if scope["effectiveGlobs"] or scope["trackedMatchPolicy"] != "reserved-empty" or not scope["justification"]:
                fail("INVALID_RESERVED_SCOPE", f"{scope_id} is not a valid future reservation")
            continue
        if not scope["effectiveGlobs"]:
            fail("DEAD_EFFECTIVE_GLOB", f"{scope_id} has no effective globs")
        if scope_id == "repository-all-tracked":
            if scope["classification"] != "universal" or scope["trackedMatchPolicy"] != "exact-all-tracked" or scope["effectiveGlobs"] != ["**"]:
                fail("UNIVERSAL_SCOPE_MISMATCH", "Universal scope must be the exact ** sentinel")
            resolved = [candidate for candidate in inventory if any(matches_glob(candidate, pattern) for pattern in scope["effectiveGlobs"])]
            if resolved != inventory:
                fail("UNIVERSAL_SCOPE_MISMATCH", "Universal scope does not equal git ls-files")
        else:
            if scope["trackedMatchPolicy"] != "at-least-one-per-glob":
                fail("SCOPE_SCHEMA_ENUM", f"{scope_id} has an invalid match policy")
            for pattern in scope["effectiveGlobs"]:
                if not any(matches_glob(candidate, pattern) for candidate in inventory):
                    fail("DEAD_EFFECTIVE_GLOB", f"{scope_id}:{pattern} matches no tracked path")
    rule_paths: set[str] = set()
    previous_rule = ""
    for assignment in registry["ruleAssignments"]:
        exact_keys(assignment, ["rulePath", "scopeIds"], "SCOPE_SCHEMA_REQUIRED", "SCOPE_SCHEMA_ADDITIONAL_PROPERTY", f"assignment:{assignment.get('rulePath', 'unknown')}")
        rule_path = assignment["rulePath"]
        if not re.fullmatch(r"\.ai/rules/.+\.mdc", rule_path) or rule_path in rule_paths:
            fail("DUPLICATE_RULE_ASSIGNMENT", f"Invalid or duplicate assignment: {rule_path}")
        if previous_rule and previous_rule >= rule_path:
            fail("NONDETERMINISTIC_SCOPE_ORDER", "Rule assignments must be sorted")
        previous_rule = rule_path
        rule_paths.add(rule_path)
        assert_strings(assignment["scopeIds"], "DUPLICATE_SCOPE_ID", f"{rule_path}.scopeIds", False)
        assert_sorted(assignment["scopeIds"], "NONDETERMINISTIC_SCOPE_ORDER", f"{rule_path}.scopeIds")
        for scope_id in assignment["scopeIds"]:
            if scope_id not in ids:
                fail("UNKNOWN_SCOPE_ID", f"Unknown scope {scope_id}")


def validate_manifest(
    manifest: dict[str, Any],
    fixture_cases: list[dict[str, Any]] | None = None,
    scope_registry: dict[str, Any] | None = None,
    skill_ids: set[str] | None = None,
    tracked: list[str] | None = None,
) -> None:
    exact_keys(manifest, ["version", "routerVersion", "scopeRegistry", "fallback", "motionPolicy", "routes"], "ROUTE_SCHEMA_REQUIRED", "ROUTE_SCHEMA_ADDITIONAL_PROPERTY", "routing manifest")
    if manifest["version"] != 3 or manifest["routerVersion"] != 1 or manifest["scopeRegistry"] != ".ai/manifests/routing-scopes.json":
        fail("ROUTE_SCHEMA_ENUM", "Routing manifest version or registry path drifted")
    exact_keys(manifest["fallback"], ["id", "description", "priority", "compositionMode", "exclusiveGroup", "primarySkills", "supplementalSkills", "prechecks", "tokenStrategy"], "ROUTE_SCHEMA_REQUIRED", "ROUTE_SCHEMA_ADDITIONAL_PROPERTY", "fallback")
    if manifest["fallback"]["id"] != "fallback" or manifest["fallback"]["priority"] != 0 or manifest["fallback"]["compositionMode"] != "fallback":
        fail("ROUTE_SCHEMA_ENUM", "Fallback contract drifted")
    exact_keys(manifest["motionPolicy"], ["exclusiveGroup", "allowDualMotionFlag", "requiresIndependentEvidence"], "ROUTE_SCHEMA_REQUIRED", "ROUTE_SCHEMA_ADDITIONAL_PROPERTY", "motionPolicy")
    if manifest["motionPolicy"] != {"exclusiveGroup": "motion-engine", "allowDualMotionFlag": "allowDualMotion", "requiresIndependentEvidence": True}:
        fail("ROUTE_SCHEMA_ENUM", "Motion policy drifted")
    scopes = scope_registry if scope_registry is not None else read_json(SCOPES_PATH)
    validate_scopes(scopes, tracked)
    scope_ids = {scope["id"] for scope in scopes["scopes"]}
    known_skills = skill_ids if skill_ids is not None else set(read_json(LOCK_PATH).get("skills", {}))
    fixture_ids: set[str] = set()
    for fixture in fixture_cases or []:
        if fixture["id"] in fixture_ids:
            fail("DUPLICATE_FIXTURE_ID", f"Duplicate fixture ID: {fixture['id']}")
        fixture_ids.add(fixture["id"])
    route_ids: set[str] = set()
    for route in manifest["routes"]:
        exact_keys(route, ROUTE_FIELDS, "ROUTE_SCHEMA_REQUIRED", "ROUTE_SCHEMA_ADDITIONAL_PROPERTY", f"route:{route.get('id', 'unknown')}")
        route_id = route["id"]
        if not is_id(route_id) or route_id in route_ids:
            fail("DUPLICATE_ROUTE_ID", f"Invalid or duplicate route ID: {route_id}")
        route_ids.add(route_id)
        if type(route["priority"]) is not int or not 1 <= route["priority"] <= 1000 or route["compositionMode"] not in {"primary", "composable", "supplemental-only", "fallback"}:
            fail("ROUTE_SCHEMA_ENUM", f"Invalid route enum or priority: {route_id}")
        for field in ["keywords", "scopeIds", "primarySkills", "supplementalSkills", "prechecks", "tokenStrategy", "positiveFixtureIds", "negativeFixtureIds"]:
            assert_strings(route[field], "ROUTE_SCHEMA_ENUM", f"{route_id}.{field}", field in {"scopeIds", "primarySkills", "supplementalSkills", "prechecks"})
            if field == "scopeIds":
                for scope_id in route[field]:
                    if scope_id not in scope_ids:
                        fail("UNKNOWN_SCOPE_ID", f"Unknown scope {scope_id} on {route_id}")
            if fixture_cases is not None and field in {"positiveFixtureIds", "negativeFixtureIds"}:
                for fixture_id in route[field]:
                    if fixture_id not in fixture_ids:
                        fail("MISSING_FIXTURE_ID", f"Missing linked fixture {fixture_id}")
            if field in {"keywords", "scopeIds", "supplementalSkills", "positiveFixtureIds", "negativeFixtureIds"}:
                assert_sorted(route[field], "NONDETERMINISTIC_ROUTE_ORDER", f"{route_id}.{field}")
        policy = route["matchPolicy"]
        exact_keys(policy, ["keywordMinimum", "scopeMinimum", "combine", "explicitKeywordRequired", "pathStatePolicy"], "ROUTE_SCHEMA_REQUIRED", "ROUTE_SCHEMA_ADDITIONAL_PROPERTY", f"{route_id}.matchPolicy")
        if type(policy["keywordMinimum"]) is not int or policy["keywordMinimum"] < 0 or type(policy["scopeMinimum"]) is not int or policy["scopeMinimum"] < 0 or policy["combine"] not in {"any", "all"} or type(policy["explicitKeywordRequired"]) is not bool or policy["pathStatePolicy"] not in {"any", "new-or-explicit-keyword"}:
            fail("ROUTE_SCHEMA_ENUM", f"Invalid match policy: {route_id}")
        for skill_id in route["primarySkills"] + route["supplementalSkills"]:
            if skill_id not in known_skills:
                fail("UNKNOWN_SKILL_ID", f"Unknown Skill {skill_id} on {route_id}")
    for skill_id in manifest["fallback"]["primarySkills"] + manifest["fallback"]["supplementalSkills"]:
        if skill_id not in known_skills:
            fail("UNKNOWN_SKILL_ID", f"Unknown fallback Skill {skill_id}")
    project_ui = next((route for route in manifest["routes"] if route["id"] == "project-ui"), None)
    if project_ui is None:
        fail("MISSING_PROJECT_UI_ROUTE", "project-ui route is required")
    if project_ui["compositionMode"] != "primary" or not project_ui["matchPolicy"]["explicitKeywordRequired"] or project_ui["primarySkills"][0] != "project-ui":
        fail("MISSING_PROJECT_UI_ROUTE", "project-ui primary activation drifted")
    if any(skill.startswith("ccd-") and skill not in {"ccd-gsap-motion", "ccd-animate-lite"} for skill in project_ui["supplementalSkills"]):
        fail("LEGACY_GENERIC_DESIGN_CHAIN_REACTIVATED", "Legacy design chain must not be generic UI supplements")
    unocss = next((route for route in manifest["routes"] if route["id"] == "core-unocss"), None)
    expected_unocss = {"keywordMinimum": 1, "scopeMinimum": 0, "combine": "any", "explicitKeywordRequired": True, "pathStatePolicy": "any"}
    if unocss is None or unocss["matchPolicy"] != expected_unocss or any(normalize_text(keyword) in {"theme", "style", "styling", "css", "scss", "design token"} for keyword in unocss["keywords"]):
        fail("BROAD_UNOCSS_EVIDENCE", "UnoCSS requires narrow explicit engine evidence")
    vite = next((route for route in manifest["routes"] if route["id"] == "core-vite"), None)
    if vite is None or any(scope_id in {"root-scripts", "workspace-config"} for scope_id in vite["scopeIds"]):
        fail("BROAD_VITE_EVIDENCE", "Vite route includes broad scopes")
    for route in manifest["routes"]:
        if route["exclusiveGroup"] == "motion-engine" and route["compositionMode"] != "supplemental-only":
            fail("INVALID_EXCLUSIVE_COMPOSITION", f"{route['id']} must remain supplemental-only")


def route_record(route: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": route["id"],
        "priority": route["priority"],
        "compositionMode": route["compositionMode"],
        "exclusiveGroup": route["exclusiveGroup"],
        "primarySkills": route["primarySkills"],
        "supplementalSkills": route["supplementalSkills"],
    }


def diagnostic(code: str, message: str, route_ids: list[str] | None = None, paths: list[str] | None = None) -> dict[str, Any]:
    return {"severity": "error", "code": code, "message": message, "routeIds": route_ids or [], "paths": paths or []}


def conflict(code: str, route_ids: list[str], skill_ids: list[str], evidence: list[str]) -> dict[str, Any]:
    return {"code": code, "routeIds": route_ids, "skillIds": skill_ids, "evidence": evidence}


def empty_result(manifest: dict[str, Any], input_value: dict[str, Any], status: str, diagnostics: list[dict[str, Any]], matched_routes: list[dict[str, Any]] | None = None, conflicts: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    return {
        "resultVersion": 1,
        "manifestVersion": manifest.get("version"),
        "routerVersion": manifest.get("routerVersion"),
        "status": status,
        "input": input_value,
        "primaryRoute": None,
        "supplementalRoutes": [],
        "matchedRoutes": matched_routes or [],
        "primarySkills": [],
        "supplementalSkills": [],
        "selectedSkills": [],
        "prechecks": [],
        "tokenStrategy": [],
        "matchReasons": [],
        "rejectedConflicts": conflicts or [],
        "diagnostics": diagnostics,
    }


def evaluate_route(route: dict[str, Any], task: str, input_paths: list[dict[str, Any]]) -> dict[str, Any] | None:
    keywords = [keyword for keyword in route["keywords"] if contains_keyword(task, keyword)]
    if (
        route["id"] == "project-ui"
        and keywords == ["design"]
        and re.search(r"\b(?:api|database|migration|schema)\b", normalize_text(task))
    ):
        keywords = []
    if (
        route["id"] == "project-ui"
        and all(keyword in {"design", "设计"} for keyword in keywords)
        and re.search(r"(?:design token engine|utility engine|unocss|设计令牌引擎|工具类引擎)", normalize_text(task))
    ):
        keywords = []
    matched_scopes = [scope_id for scope_id in route["scopeIds"] if any(scope_id in item["matchedScopeIds"] for item in input_paths)]
    policy = route["matchPolicy"]
    keyword_ok = policy["keywordMinimum"] == 0 or len(keywords) >= policy["keywordMinimum"]
    scope_ok = policy["scopeMinimum"] == 0 or len(matched_scopes) >= policy["scopeMinimum"]
    dimensions: list[bool] = []
    if policy["keywordMinimum"] > 0:
        dimensions.append(keyword_ok)
    if policy["scopeMinimum"] > 0:
        dimensions.append(scope_ok)
    matches = bool(dimensions) and (all(dimensions) if policy["combine"] == "all" else any(dimensions))
    if policy["explicitKeywordRequired"] and not keyword_ok:
        matches = False
    new_path_evidence = any(item["state"] != "tracked" and any(scope_id in item["matchedScopeIds"] for scope_id in route["scopeIds"]) for item in input_paths)
    if route["id"] == "core-vue" and not keywords and not any(
        item["path"].endswith(".vue") and any(scope_id in item["matchedScopeIds"] for scope_id in route["scopeIds"])
        for item in input_paths
    ):
        matches = False
    if policy["pathStatePolicy"] == "new-or-explicit-keyword" and not keywords and not new_path_evidence:
        matches = False
    if not matches:
        return None
    reasons: list[dict[str, Any]] = []
    if keywords:
        reasons.append({"routeId": route["id"], "kind": "keyword", "matcher": "keywords", "evidence": keywords})
    if matched_scopes:
        reasons.append({"routeId": route["id"], "kind": "scope", "matcher": "scopeIds", "evidence": matched_scopes})
    if new_path_evidence and policy["pathStatePolicy"] == "new-or-explicit-keyword":
        reasons.append({"routeId": route["id"], "kind": "path-state", "matcher": "new-or-explicit-keyword", "evidence": sorted(item["path"] for item in input_paths if item["state"] != "tracked")})
    return {"route": route, "reasons": reasons}


def route_task(
    task: str,
    paths: list[Any] | None = None,
    allow_dual_motion: bool = False,
    manifest: dict[str, Any] | None = None,
    scope_registry: dict[str, Any] | None = None,
    fixture_cases: list[dict[str, Any]] | None = None,
    skills_lock: dict[str, Any] | None = None,
    tracked: list[str] | None = None,
    root: Path = ROOT,
) -> dict[str, Any]:
    loaded_manifest = manifest if manifest is not None else read_json(MANIFEST_PATH)
    scopes = scope_registry if scope_registry is not None else read_json(SCOPES_PATH)
    fixtures = fixture_cases if fixture_cases is not None else read_json(FIXTURE_PATH)["cases"]
    lock = skills_lock if skills_lock is not None else read_json(LOCK_PATH)
    task_value = re.sub(r"\s+", " ", str(task).strip())
    path_values = paths or []
    input_value: dict[str, Any] = {"task": task_value, "paths": [], "allowDualMotion": allow_dual_motion}
    try:
        if not task_value:
            fail("CLI_ARGUMENT_ERROR", "Task text is required")
        supplied_states = {
            normalize_path(item["path"]): item["state"]
            for item in path_values
            if isinstance(item, dict)
        }
        normalized_paths = sorted(set(normalize_path(item["path"] if isinstance(item, dict) else item) for item in path_values))
        inventory = tracked if tracked is not None else tracked_paths(root)
        tracked_set = set(inventory)
        validate_scopes(scopes, inventory, root)
        validate_manifest(loaded_manifest, fixtures, scopes, set(lock.get("skills", {})), inventory)
        input_paths = []
        for candidate in normalized_paths:
            state = supplied_states.get(candidate)
            if state is None:
                state = "tracked" if candidate in tracked_set else "untracked" if (root / candidate).exists() else "missing"
            matched_scope_ids = sorted(
                scope["id"]
                for scope in scopes["scopes"]
                if any(matches_glob(candidate, pattern) for pattern in scope["effectiveGlobs"])
            )
            input_paths.append({"path": candidate, "state": state, "matchedScopeIds": matched_scope_ids})
        input_value = {"task": task_value, "paths": input_paths, "allowDualMotion": allow_dual_motion}
        matched = [
            result
            for route in loaded_manifest["routes"]
            if (result := evaluate_route(route, task_value, input_paths)) is not None
        ]
        matched.sort(key=lambda item: (-item["route"]["priority"], item["route"]["id"]))
        specialized = [item for item in matched if item["route"]["exclusiveGroup"] == loaded_manifest["motionPolicy"]["exclusiveGroup"]]
        has_concrete = any(item["route"]["compositionMode"] in {"primary", "composable"} for item in matched)
        active_matched = [item for item in matched if item["route"]["compositionMode"] != "fallback"] if has_concrete else matched
        matched_records = [route_record(item["route"]) for item in active_matched]
        if len(specialized) > 1 and not allow_dual_motion:
            route_ids = [item["route"]["id"] for item in specialized]
            skill_ids = sorted(set(skill for item in specialized for skill in item["route"]["supplementalSkills"]))
            return empty_result(loaded_manifest, input_value, "rejected", [], matched_records, [conflict("MOTION_DUAL_EVIDENCE_REQUIRED", route_ids, skill_ids, ["allowDualMotion=false"])])
        if allow_dual_motion and len(specialized) != 2:
            route_ids = [item["route"]["id"] for item in specialized]
            skill_ids = sorted(set(skill for item in specialized for skill in item["route"]["supplementalSkills"]))
            return empty_result(loaded_manifest, input_value, "rejected", [], matched_records, [conflict("MOTION_DUAL_EVIDENCE_INSUFFICIENT", route_ids, skill_ids, [f"matched={len(specialized)}"])])
        concrete = [item for item in active_matched if item["route"]["compositionMode"] in {"primary", "composable"}]
        pool = concrete if concrete else [item for item in active_matched if item["route"]["compositionMode"] == "fallback"]
        primary = None
        if pool:
            highest = pool[0]["route"]["priority"]
            tied = [item for item in pool if item["route"]["priority"] == highest]
            if len(tied) > 1:
                route_ids = sorted(item["route"]["id"] for item in tied)
                skill_ids = sorted(set(skill for item in tied for skill in item["route"]["primarySkills"]))
                return empty_result(loaded_manifest, input_value, "rejected", [], matched_records, [conflict("PRIMARY_PRIORITY_TIE", route_ids, skill_ids, [f"priority={highest}"])])
            primary = pool[0]
        if primary is None:
            primary = {"route": loaded_manifest["fallback"], "reasons": [{"routeId": "fallback", "kind": "fallback", "matcher": "default", "evidence": ["no-concrete-route"]}]}
        is_fallback = primary["route"]["compositionMode"] == "fallback"
        supplemental = [] if is_fallback else [
            item for item in active_matched
            if item["route"]["id"] != primary["route"]["id"] and item["route"]["compositionMode"] in {"composable", "supplemental-only"}
        ]
        primary_skills = list(primary["route"]["primarySkills"])
        supplemental_skills = sorted(set(
            list(primary["route"]["supplementalSkills"])
            + [skill for item in supplemental for skill in item["route"]["primarySkills"] + item["route"]["supplementalSkills"]]
        ) - set(primary_skills))

        def stable_route_values(field: str) -> list[str]:
            values = list(primary["route"].get(field, []))
            for item in supplemental:
                values.extend(item["route"].get(field, []))
            return list(dict.fromkeys(values))

        priority_map = {route["id"]: route["priority"] for route in loaded_manifest["routes"]}
        priority_map["fallback"] = 0
        reasons = list(primary["reasons"]) + [reason for item in supplemental for reason in item["reasons"]]
        reasons.sort(key=lambda reason: (-priority_map[reason["routeId"]], reason["routeId"], reason["kind"], reason["matcher"]))
        result = {
            "resultVersion": 1,
            "manifestVersion": loaded_manifest["version"],
            "routerVersion": loaded_manifest["routerVersion"],
            "status": "fallback" if is_fallback else "matched",
            "input": input_value,
            "primaryRoute": route_record(primary["route"]),
            "supplementalRoutes": [route_record(item["route"]) for item in supplemental],
            "matchedRoutes": [route_record(primary["route"])] if primary["route"]["id"] == "fallback" else matched_records,
            "primarySkills": primary_skills,
            "supplementalSkills": supplemental_skills,
            "selectedSkills": primary_skills + supplemental_skills,
            "prechecks": stable_route_values("prechecks"),
            "tokenStrategy": stable_route_values("tokenStrategy"),
            "matchReasons": reasons,
            "rejectedConflicts": [],
            "diagnostics": [],
        }
        def fixture_path_key(value: list[Any] | None) -> list[dict[str, Any]]:
            records = [
                {
                    "path": normalize_path(item["path"] if isinstance(item, dict) else item),
                    "state": item.get("state") if isinstance(item, dict) else None,
                }
                for item in (value or [])
            ]
            return sorted(records, key=lambda item: (item["path"], item["state"] or ""))
        input_path_key = fixture_path_key(
            [{"path": item["path"], "state": item["state"]} for item in input_paths]
        )
        matching_fixtures = [
            fixture for fixture in fixtures
            if fixture.get("classification") != "mutation"
            and re.sub(r"\s+", " ", str(fixture.get("task", "")).strip()) == task_value
            and fixture_path_key(fixture.get("paths")) == input_path_key
            and fixture.get("flags", {}).get("allowDualMotion") is allow_dual_motion
        ]
        for fixture in matching_fixtures:
            if fixture.get("expected", {}).get("selectedSkills") != result["selectedSkills"]:
                fail("EXPECTED_SKILL_SET_MISMATCH", f"Fixture {fixture['id']} expected Skill set differs from normalized routing output")
        if list(result) != RESULT_FIELDS:
            fail("RESULT_SHAPE_DRIFT", "Normalized result key order drifted")
        return result
    except RoutingContractError as error:
        return empty_result(
            loaded_manifest,
            input_value,
            "invalid",
            [diagnostic(error.code, str(error), error.details.get("routeIds", []), error.details.get("paths", []))],
        )


def parse_cli(argv: list[str]) -> dict[str, Any]:
    task: list[str] = []
    paths: list[str] = []
    allow_dual_motion = False
    json_mode = False
    index = 0
    while index < len(argv):
        value = argv[index]
        if value == "--":
            index += 1
            continue
        if value == "--json":
            if json_mode:
                fail("CLI_ARGUMENT_ERROR", "--json may be specified once")
            json_mode = True
            index += 1
            continue
        if value == "--allow-dual-motion":
            if allow_dual_motion:
                fail("CLI_ARGUMENT_ERROR", "--allow-dual-motion may be specified once")
            allow_dual_motion = True
            index += 1
            continue
        if value == "--paths":
            index += 1
            start = index
            while index < len(argv) and not argv[index].startswith("--"):
                paths.append(argv[index])
                index += 1
            if index == start:
                fail("CLI_ARGUMENT_ERROR", "--paths requires at least one path")
            continue
        if value.startswith("--"):
            fail("CLI_ARGUMENT_ERROR", f"Unknown argument: {value}")
        task.append(value)
        index += 1
    task_text = " ".join(task).strip()
    if not task_text and not sys.stdin.isatty():
        task_text = sys.stdin.read().strip()
    if not task_text:
        fail("CLI_ARGUMENT_ERROR", "Task text is required")
    return {"task": task_text, "paths": paths, "allowDualMotion": allow_dual_motion, "json": json_mode}


def render_text(result: dict[str, Any]) -> str:
    primary = result["primaryRoute"]["id"] if result["primaryRoute"] else "none"
    skills = ",".join(result["selectedSkills"]) or "none"
    diagnostics = ",".join(item["code"] for item in result["diagnostics"]) or "none"
    return f"status={result['status']}\nprimaryRoute={primary}\nselectedSkills={skills}\ndiagnostics={diagnostics}"


def main(argv: list[str] | None = None) -> int:
    try:
        args = parse_cli(list(sys.argv[1:] if argv is None else argv))
        result = route_task(args["task"], args["paths"], args["allowDualMotion"])
        sys.stdout.write(canonical_json(result) if args["json"] else render_text(result) + "\n")
        if result["status"] == "invalid":
            return 3
        if result["status"] == "rejected":
            return 4
        return 0
    except RoutingContractError as error:
        sys.stderr.write(f"{error.code}: {error}\n")
        return 2 if error.code in {"CLI_ARGUMENT_ERROR", "INVALID_INPUT_PATH"} else 1
    except Exception as error:
        sys.stderr.write(f"ROUTER_RUNTIME_ERROR: {error}\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
