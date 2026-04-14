# Cursor Adapter Guide

## Discovery Entry

Cursor expects:

- `.cursor/settings.json`
- `.cursor/rules/**`
- `.cursor/skills/**`

In this repo:

- `.cursor/settings.json` <= `.ai/config/cursor.settings.json`
- `.cursor/rules/**` <= `.ai/rules/**`
- `.cursor/skills/**` <= `.ai/skills/cursor/**`

## Canonical Policy

Edit only `.ai/**` as source-of-truth. `.cursor/**` is generated compatibility output.

## Health Commands

- `pnpm ai:doctor`
- `pnpm ai:sync`
