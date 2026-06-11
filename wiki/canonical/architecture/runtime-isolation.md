---
title_en: Runtime Isolation
title_zh: 运行时隔离
aliases:
  - Runtime boundary
  - Adapter boundary
  - 运行时边界
  - 适配器边界
tags:
  - architecture
  - runtime
  - governance
tags_zh:
  - 架构
  - 运行时
  - 治理
status: verified
confidence: 0.96
source_langs:
  - en
source_paths:
  - docs/runtime/runtime-isolation.md
  - docs/en/architecture-contract.md
  - .ai/governance/policies/runtime.json
  - scripts/architecture/check-runtime-leaks.mjs
  - scripts/architecture/check-root-runtime-decommissioned.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Runtime Isolation

CCD enforces runtime isolation through workspace package boundaries and adapter injection. `packages/contracts` and `packages/core` are strict runtime-neutral packages. `packages/design-tokens` and `packages/shared-utils` are also classified as runtime-neutral package classes, with any diagnostics/test reset exceptions tracked as exact policy exceptions rather than reusable runtime permission.

## Runtime-neutral packages must not access

- Browser globals such as `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `fetch`, or `XMLHttpRequest`.
- Node builtins or globals such as `process`, `fs`, or `path`.
- Tauri APIs or `invoke()`.
- Runtime side effects such as direct timers, direct `crypto`, and direct storage or network.

## Adapter ownership

Runtime access should be owned first by:

```text
apps/web-demo/src/adapters/**
apps/desktop/src/adapters/**
```

Existing non-adapter browser runtime usage is only allowed when exact file/surface exceptions are registered in `.ai/governance/policies/runtime.json`. Those entries classify existing debt; they are not broad directory permissions.

## Validation commands

```bash
pnpm arch:runtime
pnpm arch:boundaries
pnpm governance:gate
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/runtime/runtime-isolation.md`
- `docs/en/architecture-contract.md`
- `.ai/governance/policies/runtime.json`
- `scripts/architecture/check-runtime-leaks.mjs`
- `scripts/architecture/check-root-runtime-decommissioned.mjs`

## Related pages

- [[web-runtime]]
- [[desktop-runtime]]
- [[contracts-boundary]]
- [[core-boundary]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
