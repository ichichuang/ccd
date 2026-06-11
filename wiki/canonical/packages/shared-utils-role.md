---
title_en: Shared Utils Role
title_zh: shared-utils 职责
aliases:
  - packages/shared-utils
  - Shared utilities
  - 共享工具
tags:
  - packages
  - shared-utils
  - runtime-neutral
tags_zh:
  - 包
  - 共享工具
  - 运行时无关
status: verified
confidence: 0.91
source_langs:
  - en
source_paths:
  - docs/generated/api-surface-report.md
  - docs/en/architecture-contract.md
  - docs/runtime/runtime-isolation.md
  - packages/shared-utils/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/shared-utils Package Boundary

## Owner boundary

`packages/shared-utils` owns pure helpers, JSON codec helpers, capability bridge primitives, stable serialization helpers, record/value helpers, and logger helper factories.

## Public exports

The generated API report lists root exports such as `createCapabilityBridge`, `createConsoleLogger`, JSON storage codec helpers, debounce/throttle helpers, ID helpers, record casting helpers, and stable serialization helpers.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies are pure utility dependencies that do not create app runtime ownership or hidden browser/Node/Tauri effects.

## Forbidden moves

Do not promote safeStorage crypto, HMAC/Web Crypto, compression, serializer orchestration, migration behavior, browser storage access, maintenance helpers, app env access, or app facade exports into `@ccd/shared-utils`.

## Validation commands

```bash
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm type-check
```

## Related pages

- [[safe-storage-runtime-ownership]]
- [[contracts-boundary]]
- [[runtime-isolation]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/generated/api-surface-report.md`
- `docs/en/architecture-contract.md`
- `docs/runtime/runtime-isolation.md`
- `packages/shared-utils/**`
