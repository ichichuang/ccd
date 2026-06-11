---
title_en: HTTP Runtime Ownership
title_zh: HTTP 运行时归属
aliases:
  - alova ownership
  - HTTP boundary
  - HTTP 归属
  - alova 归属
tags:
  - runtime
  - http
  - apps
  - guardrails
tags_zh:
  - 运行时
  - HTTP
  - 应用
  - 守卫
status: verified
confidence: 0.94
source_langs:
  - en
source_paths:
  - README.en.md
  - wiki/**
  - wiki/**
  - .ai/runtime/repair_list.md
  - apps/web-demo/src/utils/http/**
  - packages/contracts/src/http/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# HTTP Runtime Ownership

## Allowed runtime surfaces

Type-only HTTP contracts may live in `packages/contracts/src/http/**`. Concrete alova HTTP runtime, interceptors, auth refresh, retry/cache/dedup policy, UI notification behavior, and app Zod validation remain app-owned under `apps/web-demo`.

## Forbidden promotions

Do not promote alova HTTP runtime into `packages/core`, `@ccd/shared-utils`, or a generic shared request runtime. `P4-HttpCore-Blocked` records this as blocked unless a future owner/architect decision replaces the current app-owned decision.

## Adapter ownership

Browser HTTP adapters and app infrastructure own concrete runtime access. Contracts may define shapes; core may orchestrate only through injected adapters.

## Validation commands

```bash
pnpm arch:runtime
pnpm api:report
pnpm governance:gate
pnpm type-check
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.en.md`
- `wiki/**`
- `wiki/**`
- `.ai/runtime/repair_list.md`
- `apps/web-demo/src/utils/http/**`
- `packages/contracts/src/http/**`

## Related pages

- [[strategic-guardrails]]
- [[web-demo-role]]
- [[contracts-boundary]]
- [[core-boundary]]
