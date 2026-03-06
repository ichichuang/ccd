# Skill 03: Fix Logic Only (Logic only, no UI changes)

## Goal

When fixing bugs or optimizing logic, **only modify the logic layer** (`<script setup>` / composable / store); do NOT change existing UI structure or UnoCSS classes.

## Inputs

- Problem description (error, repro steps, expected behavior)
- File paths involved (if known)

## Pre-check (mandatory)

- `@docs/ai-specs/PROJECT_PROTOCOL.md`
- `@.cursor/rules/00-core-architecture.mdc`
- `@.cursor/rules/10-logic-layer.mdc`
- `@.cursor/rules/15-utils-and-hooks-first.mdc`

## Task

1. Locate and fix the logic issue
2. If needed, extract complex logic to `src/hooks/modules/` (keep UI unchanged)
3. If requests are involved: MUST go through `src/api/**` + `useHttpRequest`

## Output

- Only the modified logic code/files (and state that template/class were not touched)

## Hard Constraints

- CRITICAL: Do NOT change `<template>` structure or any UnoCSS class (unless user explicitly allows)
- FORBIDDEN: raw CSS
- FORBIDDEN: fetch/axios
- FORBIDDEN: any

## Prompt Template (copy & use)

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md
Follow @.cursor/rules/00-core-architecture.mdc @.cursor/rules/10-logic-layer.mdc @.cursor/rules/15-utils-and-hooks-first.mdc

Task: Fix logic issue (logic only, no UI changes)

CRITICAL:
- Do NOT modify <template> or any class
- Only modify <script setup> / composable / store

Problem description:
<paste error/repro/expected>
```
