# Claude Adapter Guide

## Discovery Entry

- Claude tools read root `CLAUDE.md`.
- In this repo, `CLAUDE.md` must link to `.ai/protocol/AI.entry.md`.

## Skill Path Compatibility

- Runtime compatibility path: `.claude/skills/*`
- Canonical path: `.ai/skills/claude/*`

Do not edit `.claude/skills/*` directly if it is an adapter link.

## Rule Loading

Always load `.ai/protocol/AGENTS.core.md` first, then `.ai/rules/**` by touched domain.

## Health Commands

- `pnpm ai:doctor`
- `pnpm ai:sync`
