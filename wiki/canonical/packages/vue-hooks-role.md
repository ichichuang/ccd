---
title_en: Vue Hooks Role
title_zh: Vue Hooks 职责
aliases:
  - packages/vue-hooks
  - Vue composables
  - 组合式函数
tags:
  - packages
  - vue
  - hooks
tags_zh:
  - 包
  - Vue
  - 组合式函数
status: verified
confidence: 0.9
source_langs:
  - en
source_paths:
  - docs/generated/api-surface-report.md
  - docs/en/architecture-contract.md
  - docs/runtime/runtime-isolation.md
  - packages/vue-hooks/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/vue-hooks Package Boundary

## Owner boundary

`packages/vue-hooks` owns reusable Vue/browser composables and interaction directives when they are generic and avoid app store/router/i18n coupling.

## Public exports

The generated API report lists hook exports including interaction hooks, table URL sync primitives, browser device resolution helpers, and `createAutoMittHook`.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies include Vue-facing composition utilities and guarded/injected browser surfaces. Browser capability must be explicit and not silently promoted to runtime-neutral packages.

## Forbidden moves

Do not move app event maps, app i18n defaults, app router query semantics, app storage/date injection, or app plugin wiring into this package.

## Validation commands

```bash
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm type-check
```

## Related pages

- [[app-local-shared-candidates]]
- [[web-demo-role]]
- [[runtime-isolation]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/generated/api-surface-report.md`
- `docs/en/architecture-contract.md`
- `docs/runtime/runtime-isolation.md`
- `packages/vue-hooks/**`
