# Codex Adapter Guide

## Discovery Entry

- Codex reads root `AGENTS.md`.
- In this repo, `AGENTS.md` must link to `.ai/protocol/AI.entry.md`.

## What to Load First

1. `.ai/protocol/AGENTS.core.md`
2. `.ai/rules/core/00-global-architect.mdc`
3. `.ai/rules/core/00-root-gatekeeper.mdc`
4. `.ai/rules/core/01-preflight-checklist.mdc`
5. Domain rules under `.ai/rules/**`

## Skill Mapping

- Implementation: `.ai/skills/claude/{vue,vueuse-functions,unocss,vite}`
- Tooling/E2E: `.ai/skills/cursor/{github,playwright-mcp}`

## Health Commands

- `pnpm ai:doctor`
- `pnpm ai:sync`
- `pnpm codex:preflight`
