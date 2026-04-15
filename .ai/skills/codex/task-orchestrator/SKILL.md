---
name: task-orchestrator
description: Route coding tasks into simple or complex execution paths and keep validation proportional to risk. Use when Codex needs to classify a request, decide whether to plan first, trigger browser validation, choose imperative step order, or coordinate parallel subagents for multi-surface work.
---

# Task Orchestrator

## Overview

Turn vague work requests into a concrete execution path. Use the Python router to classify the task, then follow the matching imperative workflow instead of improvising every time.

Before loading multiple skills, prefer the repo skill router so you only open the minimum relevant skill set and references.

## Quick Start

- Classify a task:
  - `python3 scripts/task_router.py "optimize my homepage performance and validate the UI"`
- Select the smallest useful skill set first:
  - `python3 scripts/skill_router.py "处理 GitHub PR review comments 并检查 .github workflows" --json`
- Force a route:
  - `python3 scripts/task_router.py "refactor the auth flow" --force-complex`
- Print a compact machine-readable plan:
  - `python3 scripts/task_router.py "fix button spacing on settings page" --json`

## Task Classes

- `simple`: Small scope, low coupling, obvious validation, usually one file or one bounded fix.
- `complex`: Cross-module work, UI regression risk, performance work, schema or API changes, migrations, or anything that benefits from decomposition.

## Imperative Flow

### Simple Path

1. Confirm scope.
2. Implement directly.
3. Run the narrowest relevant validation.
4. Report changed files, checks, and remaining risk.

### Complex Path

1. Produce a short plan before editing.
2. Split the work into independent tracks.
3. Use subagents only when they can work in parallel on disjoint concerns and the current step is not blocked on their output.
4. Route browser work to `architecture-browser-master`.
5. Route GitHub, CI, PR, release, and `.github/**` work to `github-ops`.
6. Run validation in layers: static checks, tests, browser validation, performance checks.
7. End with a diff review and residual-risk summary.

## Routing Rules

- Use the simple path for copy changes, one-component fixes, narrow styling tweaks, or isolated tests.
- Use the complex path for refactors, architecture changes, auth, routing, state boundaries, data model changes, performance optimization, or broad UI validation.
- Run `skill_router.py` first when the task is ambiguous, multi-surface, or could involve GitHub or browser validation.
- Escalate to browser validation whenever the task affects UX, layout, interaction, accessibility, or perceived performance.
- If the task mentions Playwright CRX, recorder exports, traces, codegen, or replaying a recorded flow, route to `architecture-browser-master` and prefer `flow-import` or `flow-run` before manual browser exploration.
- Escalate to `github-ops` whenever the task mentions GitHub, pull requests, issues, workflow runs, release automation, review comments, remote branches, or `.github/**`.
- Escalate to parallel subagents only when the environment supports them and the write scopes do not overlap.
- Prefer imperative commands and checklists over narrative plans.

## References

- Read `references/routing-matrix.md` for the simple versus complex threshold.
- Read `references/validation-ladder.md` to choose the smallest sufficient validation stack.

## Output Contract

- Return a compact route summary with `complexity`, `reasons`, `tracks`, and `checks`.
- Keep the first response action-oriented. Do not hide the chosen path.
