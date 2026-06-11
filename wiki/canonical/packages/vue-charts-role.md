---
title_en: Vue Charts Role
title_zh: Vue Charts 职责
aliases:
  - packages/vue-charts
  - Chart runtime
  - 图表包
tags:
  - packages
  - vue
  - charts
tags_zh:
  - 包
  - Vue
  - 图表
status: verified
confidence: 0.86
source_langs:
  - en
source_paths:
  - docs/generated/api-surface-report.md
  - docs/en/architecture-contract.md
  - packages/vue-charts/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/vue-charts Package Boundary

## Owner boundary

`packages/vue-charts` owns reusable chart runtime and helper surfaces, currently represented by chart theme/runtime state and ECharts-facing hooks in the generated API surface.

## Public exports

The generated API report records root export symbols including `ChartThemeRuntimeState` and `UseEcharts`.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies should stay chart-specific and reusable. App data/query, product analytics, and server-state ownership remain outside this package.

## Forbidden moves

Do not move app HTTP calls, page-specific data loading, product dashboards, or app stores into `packages/vue-charts`.

## Validation commands

```bash
pnpm api:report
pnpm arch:boundaries
pnpm type-check
```

## Related pages

- [[package-responsibility-matrix]]
- [[web-demo-role]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/generated/api-surface-report.md`
- `docs/en/architecture-contract.md`
- `packages/vue-charts/**`
