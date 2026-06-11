---
title_en: Design Tokens Role
title_zh: 设计 Token 职责
aliases:
  - packages/design-tokens
  - Design token package
  - 设计令牌
tags:
  - packages
  - design-tokens
  - ui
tags_zh:
  - 包
  - 设计令牌
  - 界面
status: verified
confidence: 0.91
source_langs:
  - en
source_paths:
  - docs/generated/api-surface-report.md
  - docs/en/architecture-contract.md
  - docs/runtime/runtime-isolation.md
  - packages/design-tokens/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/design-tokens Package Boundary

## Owner boundary

`packages/design-tokens` owns token constants and pure derivation for theme, size, breakpoint, layout-dimension, device, OS, orientation, and viewport metrics.

## Public exports

The generated API report lists root exports and the `./theme-engine` subpath, including theme presets, size variables, breakpoint helpers, device resolvers, layout dimension helpers, and pure color utilities.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies are pure and build-compatible. Token derivation must be synchronous/pure unless explicitly documented otherwise.

## Forbidden moves

Do not move DOM writes, `style.cssText` mutation, preload reads, storage persistence, browser device listener lifecycle, transitions, desktop root variable setup, or Pinia state into this package.

## Validation commands

```bash
pnpm api:report
pnpm arch:runtime
pnpm type-check
pnpm validate:tokens
```

## Related pages

- [[package-responsibility-matrix]]
- [[vue-primevue-adapter-role]]
- [[web-demo-role]]
- [[desktop-role]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/generated/api-surface-report.md`
- `docs/en/architecture-contract.md`
- `docs/runtime/runtime-isolation.md`
- `packages/design-tokens/**`
