---
title_en: Vue UI Role
title_zh: Vue UI 职责
aliases:
  - packages/vue-ui
  - CCD UI primitives
  - 共享 UI 组件
tags:
  - packages
  - vue
  - ui
tags_zh:
  - 包
  - Vue
  - 界面
status: verified
confidence: 0.9
source_langs:
  - en
source_paths:
  - docs/generated/api-surface-report.md
  - docs/en/architecture-contract.md
  - packages/vue-ui/**
  - docs/governance/primevue-i18n-verification.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/vue-ui Package Boundary

## Owner boundary

`packages/vue-ui` owns CCD-owned shared Vue UI primitives and higher-level reusable UI contracts. It may internally compose PrimeVue through CCD-owned primitive APIs and adapter-owned runtime integration.

## Public exports

The generated API report lists export subpaths `.`, `./style.css`, and many CCD UI component, ProForm, ProTable, dialog, table, form, and injected adapter symbols.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies may include Vue UI runtime needs and adapter contracts when the public API remains CCD-owned.

## Forbidden moves

Do not expose raw PrimeVue components as a loose public bucket. Do not move app server-state, route-specific data loaders, app stores, app notifications, app HTTP behavior, or product-specific page behavior into this package.

## Validation commands

```bash
pnpm api:report
pnpm arch:boundaries
pnpm type-check
pnpm lint:check
```

## Related pages

- [[vue-primevue-adapter-role]]
- [[package-responsibility-matrix]]
- [[web-demo-role]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/generated/api-surface-report.md`
- `docs/en/architecture-contract.md`
- `packages/vue-ui/**`
- `docs/governance/primevue-i18n-verification.md`
