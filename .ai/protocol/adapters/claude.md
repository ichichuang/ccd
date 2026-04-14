# Claude Adapter Guide

## Discovery Entry

- Claude tools read root `CLAUDE.md`.
- In this repo, `CLAUDE.md` is generated from `.ai/protocol/AI.entry.md`.

## Skill Path Compatibility

- Generated compatibility path: `.claude/skills/*`
- Canonical path: `.ai/skills/claude/*`

Do not edit generated `.claude/**` files directly. Run `pnpm ai:sync` after changing canonical `.ai/**` sources.

## Rule Loading

Always load `.ai/protocol/AGENTS.core.md` first, then `.ai/rules/**` by touched domain.

## Health Commands

- `pnpm ai:doctor`
- `pnpm ai:sync`
