---
title_en: Web Runtime
title_zh: Web 运行时
aliases:
  - Browser runtime
  - apps/web-demo runtime
  - 浏览器运行时
tags:
  - runtime
  - web
  - apps
tags_zh:
  - 运行时
  - Web
  - 应用
status: verified
confidence: 0.88
source_langs:
  - en
source_paths:
  - wiki/**
  - wiki/**
  - wiki/**
  - apps/web-demo/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Web Runtime

## Allowed runtime surfaces

Browser runtime belongs to `apps/web-demo`, especially app adapters and approved app infrastructure. Existing non-adapter browser runtime usage is governed by exact exceptions in `.ai/governance/policies/runtime.json`.

## Forbidden promotions

Do not move browser storage, network, logger, router, store, DOM, alova HTTP runtime, or concrete safeStorage runtime into `packages/core`, `packages/contracts`, or generic shared packages.

## Adapter ownership

Preferred ownership is `apps/web-demo/src/adapters/**`; app-local candidates outside adapters remain classified debt or app infrastructure, not broad permission.

## Validation commands

```bash
pnpm dev:web-demo
pnpm build:web-demo
pnpm arch:runtime
pnpm arch:boundaries
pnpm e2e:qa
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `wiki/**`
- `wiki/**`
- `apps/web-demo/**`

## Related pages

- [[web-demo-role]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
- [[runtime-isolation]]
