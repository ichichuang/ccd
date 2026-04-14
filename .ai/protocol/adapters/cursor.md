# Cursor Adapter Guide

## Discovery Entry

Cursor expects:

- `.cursor/settings.json`
- `.cursor/rules/**`
- `.cursor/skills/**`

In this repo:

- `.cursor/rules` -> adapter link to `.ai/rules`
- `.cursor/skills` -> adapter link to `.ai/skills/cursor`

## Canonical Policy

Edit only `.ai/**` as source-of-truth. Adapter paths are compatibility mirrors.

## Health Commands

- `pnpm ai:doctor`
- `pnpm ai:sync`
