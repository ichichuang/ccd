#!/usr/bin/env python3
"""Classify a task and emit an imperative execution route.

Prefer skill_router.py first when you need deterministic skill selection.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass


COMPLEX_KEYWORDS = {
    "refactor",
    "architecture",
    "migration",
    "performance",
    "optimize",
    "auth",
    "routing",
    "state",
    "schema",
    "database",
    "api",
    "regression",
    "lighthouse",
    "design-system",
    "重构",
    "架构",
    "迁移",
    "性能",
    "优化",
    "认证",
    "鉴权",
    "路由",
    "状态",
    "模型",
    "数据库",
    "接口",
    "回归",
    "设计系统",
    "配置",
    "协议",
    "初始化",
    "安装",
    "文档",
    "github",
    "pull request",
    "pr",
    "issue",
    "workflow",
    "actions",
    "review",
    "release",
    ".github",
    "ci",
}

BROWSER_KEYWORDS = {
    "ui",
    "layout",
    "browser",
    "visual",
    "playwright",
    "screenshot",
    "interaction",
    "accessibility",
    "homepage",
    "页面",
    "界面",
    "浏览器",
    "截图",
    "交互",
    "可访问性",
    "首屏",
    "首页",
}

PARALLEL_KEYWORDS = {
    "parallel",
    "subagent",
    "monorepo",
    "end-to-end",
    "cross-module",
    "cross module",
    "并行",
    "子代理",
    "跨模块",
    "多模块",
}

GITHUB_KEYWORDS = {
    "github",
    "gh",
    "pull request",
    "pr",
    "issue",
    "workflow",
    "actions",
    "review",
    "review comment",
    "checks",
    "release",
    "remote",
    "branch protection",
    ".github",
    "ci",
    "代码审查",
    "评审意见",
    "工作流",
    "发布",
    "远程仓库",
    "分支保护",
}


@dataclass
class Route:
    complexity: str
    reasons: list[str]
    tracks: list[str]
    checks: list[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("task", help="Task description to classify.")
    parser.add_argument("--repo-stack", default="auto", help="Optional repository stack hint.")
    parser.add_argument("--force-complex", action="store_true", help="Force the complex route.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON.")
    return parser.parse_args()


def contains_any(task: str, keywords: set[str]) -> bool:
    for keyword in keywords:
        if re.search(r"[A-Za-z]", keyword):
            pattern = r"\b" + re.escape(keyword) + r"\b"
            if re.search(pattern, task):
                return True
            continue
        if keyword in task:
            return True
    return False


def is_long_request(task: str) -> bool:
    if " " in task:
        return len(task.split()) > 18
    return len(task) > 40


def classify(task: str, repo_stack: str, force_complex: bool) -> Route:
    normalized = task.lower()
    reasons: list[str] = []
    tracks: list[str] = []
    checks: list[str] = []
    complexity = "simple"

    if force_complex:
        complexity = "complex"
        reasons.append("forced-complex")
    if contains_any(normalized, COMPLEX_KEYWORDS):
        complexity = "complex"
        reasons.append("architecture-or-risk-keywords")
    if is_long_request(normalized):
        complexity = "complex"
        reasons.append("long-request")
    if contains_any(normalized, BROWSER_KEYWORDS):
        tracks.append("browser-validation")
        checks.append("playwright-cli")
        reasons.append("ui-surface")
    if contains_any(normalized, GITHUB_KEYWORDS):
        tracks.append("github-ops")
        checks.extend(["gh-cli", ".github-inspection"])
        reasons.append("github-surface")
    if "test" in normalized or "coverage" in normalized:
        checks.append("unit-or-e2e-tests")
    if "lint" in normalized or "typescript" in normalized or "type" in normalized:
        checks.append("static-checks")
    if "performance" in normalized or "lighthouse" in normalized:
        tracks.append("performance")
        checks.append("lighthouse")
    if contains_any(normalized, PARALLEL_KEYWORDS) or complexity == "complex":
        tracks.append("plan-first")
    if complexity == "complex":
        tracks.append("parallel-subagents-when-available")
        checks.extend(["diff-review", "residual-risk-summary"])
    else:
        tracks.append("direct-implementation")
        checks.append("focused-validation")

    if repo_stack != "auto":
        reasons.append(f"repo-stack:{repo_stack}")

    # Keep order stable while removing duplicates.
    tracks = list(dict.fromkeys(tracks))
    checks = list(dict.fromkeys(checks))
    reasons = list(dict.fromkeys(reasons))
    return Route(complexity=complexity, reasons=reasons, tracks=tracks, checks=checks)


def render(route: Route) -> str:
    lines = [
        f"complexity: {route.complexity}",
        f"reasons: {', '.join(route.reasons) if route.reasons else 'bounded-change'}",
        f"tracks: {', '.join(route.tracks)}",
        f"checks: {', '.join(route.checks)}",
    ]
    if route.complexity == "simple":
        lines.extend(
            [
                "flow:",
                "1. Confirm the narrow scope.",
                "2. Implement directly.",
                "3. Run the smallest relevant validation set.",
                "4. Report changes and residual risk.",
            ]
        )
    else:
        lines.extend(
            [
                "flow:",
                "1. Produce a short plan before editing.",
                "2. Split work into independent tracks.",
                "3. Route UI work to architecture-browser-master.",
                "4. Use parallel subagents only for disjoint concerns.",
                "5. Run layered validation and review the diff.",
            ]
        )
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    route = classify(args.task, args.repo_stack, args.force_complex)
    payload = {
        "complexity": route.complexity,
        "reasons": route.reasons,
        "tracks": route.tracks,
        "checks": route.checks,
    }
    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        print(render(route))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
