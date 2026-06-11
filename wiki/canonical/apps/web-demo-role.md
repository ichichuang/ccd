---
title_en: Web Demo Role
title_zh: Web Demo 职责
aliases:
  - apps/web-demo
  - Browser app shell
  - 浏览器应用外壳
tags:
  - apps
  - web-demo
  - runtime
tags_zh:
  - 应用
  - Web Demo
  - 运行时
status: verified
confidence: 0.93
source_langs:
  - en
  - zh
source_paths:
  - README.md
  - README.en.md
  - docs/en/architecture-contract.md
  - docs/runtime/web-runtime.md
  - apps/web-demo/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Web Demo Role

`apps/web-demo` is the browser `web-demo` application shell. It owns browser entry, routes, stores, views, app adapters, app-level plugin wiring, compatibility facades, and app-specific browser runtime integration.

## Owned surfaces

- Browser frontend entry and Vite app shell.
- Routes, route metadata, pages/views, stores, and app layouts.
- Browser adapters and approved app infrastructure for runtime APIs.
- alova HTTP runtime under app-owned HTTP infrastructure.
- safeStorage concrete browser runtime facade under app-owned safeStorage paths.
- PrimeVue app bootstrap through `@ccd/vue-primevue-adapter`.

## Not a public package

`apps/web-demo` is not a public shared capability export layer. Reusable capability must land in governed `packages/*` and be consumed through package exports. App-local shared candidates remain app-local unless a future owner-approved lane migrates them.

## Validation commands

```bash
pnpm dev:web-demo
pnpm build:web-demo
pnpm e2e:qa
pnpm arch:runtime
pnpm arch:boundaries
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `README.en.md`
- `docs/en/architecture-contract.md`
- `docs/runtime/web-runtime.md`
- `apps/web-demo/**`

## Related pages

- [[web-runtime]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
- [[app-local-shared-candidates]]
- [[vue-primevue-adapter-role]]
