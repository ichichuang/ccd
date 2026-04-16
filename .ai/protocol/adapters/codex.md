# Codex Adapter Guide

## Discovery Entry

- Codex reads root `AGENTS.md`.
- In this repo, `AGENTS.md` is generated from `.ai/protocol/AI.entry.md`.

## What to Load First

1. `.ai/protocol/AGENTS.core.md`
2. `.ai/rules/core/00-global-architect.mdc`
3. `.ai/rules/core/00-root-gatekeeper.mdc`
4. `.ai/rules/core/01-global-preflight.mdc`
5. `.ai/rules/core/02-ui-preflight.mdc` when visual surfaces are touched
6. Domain rules under `.ai/rules/**`

## Skill Mapping

- Implementation: `.ai/skills/core/{vue,vueuse-functions,unocss,vite}`
- Orchestration: `.ai/skills/codex/task-orchestrator`
- Browser/E2E: `.ai/skills/codex/architecture-browser-master`
- Desktop/Tauri: `.ai/skills/codex/desktop-tauri-guard`
- GitHub/remote workflows: `.ai/skills/codex/github-ops`

## Auto-Trigger Hints

- Start with `python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "<task>" --json` for ambiguous tasks or when you want deterministic low-token skill selection.
- If the task mentions GitHub, PRs, issues, Actions, CI, releases, reviews, remote branches, or `.github/**`, load `github-ops` and inspect local repo GitHub context first.
- If the task touches UI behavior, layout, screenshots, navigation, or perceived performance, load `architecture-browser-master`.
- If the task touches Tauri, desktop bridge behavior, `src-tauri/**`, capability files, or desktop drift cleanup, load `desktop-tauri-guard`.
- If the task mentions Playwright CRX, recorder exports, codegen, traces, recordings, or replaying browser flows, load `architecture-browser-master` and prefer `flow-import` or `flow-run`.
- If the task is vague, cross-module, or likely needs staged validation, load `task-orchestrator`.

## Health Commands

- `pnpm ai:doctor`
- `pnpm ai:sync`
- `pnpm ai:sync:codex`
- `pnpm codex:preflight`
