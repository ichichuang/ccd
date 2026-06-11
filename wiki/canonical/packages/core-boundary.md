---
title_en: '@ccd/core Boundary'
title_zh: '@ccd/core 边界'
aliases:
  - packages/core
  - Core package
  - 核心包
tags:
  - packages
  - core
  - runtime-neutral
tags_zh:
  - 包
  - 核心
  - 运行时无关
status: verified
confidence: 0.96
source_langs:
  - en
source_paths:
  - packages/core/src/index.ts
  - docs/generated/api-surface-report.md
  - README.en.md
  - docs/en/architecture-contract.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/core Package Boundary

## Owner boundary

`packages/core` is a minimal runtime-neutral facade over injected adapters. It depends on `@ccd/contracts` and exposes `createCoreRuntime`, `CoreRuntime`, `CoreAdapters`, and re-exported adapter/runtime types.

## Public exports

The package exports `createCoreRuntime(adapters)`, `CoreRuntime`, `CoreAdapters`, and contract-derived runtime adapter types. Its current implementation loads/saves JSON via injected storage and performs requests via injected network adapters.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependency direction is toward `@ccd/contracts` only for runtime contracts. Adapter behavior must be passed in by apps rather than imported from concrete runtime packages.

## Forbidden moves

Do not turn `packages/core` into a frontend shared bucket. Do not add Vue, PrimeVue, browser, Node, Tauri, alova, fetch, local storage, crypto, timer, safeStorage runtime, app router, or app store code.

## Validation commands

```bash
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm type-check
```

## Related pages

- [[contracts-boundary]]
- [[runtime-isolation]]
- [[web-runtime]]
- [[desktop-runtime]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `packages/core/src/index.ts`
- `docs/generated/api-surface-report.md`
- `README.en.md`
- `docs/en/architecture-contract.md`
