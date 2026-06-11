---
title_en: Portable Runtime
title_zh: 可移植运行时
aliases:
  - Runtime portability
  - Cross-runtime contracts
  - 可移植性
tags:
  - runtime
  - portable
  - contracts
tags_zh:
  - 运行时
  - 可移植
  - 契约
status: verified
confidence: 0.84
source_langs:
  - en
source_paths:
  - docs/runtime/portable-runtime.md
  - docs/runtime/runtime-isolation.md
  - README.en.md
  - packages/contracts/src/index.ts
  - packages/core/src/index.ts
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Portable Runtime

## Allowed runtime surfaces

Portable behavior is represented as cross-runtime contracts in `packages/contracts` and runtime-neutral orchestration in `packages/core`. Concrete browser and desktop adapters inject capabilities into the core facade.

## Forbidden promotions

Do not equate portability with moving runtime APIs into `packages/core`. Runtime portability is achieved by contracts and adapter injection, not by shared concrete runtime implementations.

## Adapter ownership

Apps own concrete adapters; packages own contracts and runtime-neutral primitives.

## Validation commands

```bash
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm type-check
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/runtime/portable-runtime.md`
- `docs/runtime/runtime-isolation.md`
- `README.en.md`
- `packages/contracts/src/index.ts`
- `packages/core/src/index.ts`

## Related pages

- [[contracts-boundary]]
- [[core-boundary]]
- [[runtime-isolation]]
