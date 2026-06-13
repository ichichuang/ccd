---
title_en: Web Demo Role
title_zh: Web Demo 职责
aliases:
  - apps/web-demo
  - Browser app shell
  - 浏览器应用外壳
tags:
  - application-boundaries
  - web-demo
  - runtime
tags_zh:
  - 应用边界
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
  - wiki/**
  - apps/web-demo/**
  - apps/web-demo/src/views/architecture-console/**
last_reviewed: '2026-06-12'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Web Demo Role

`apps/web-demo` is the browser `web-demo` application shell. It owns browser entry, routes, stores, views, app adapters, app-level plugin wiring, compatibility facades, app-specific browser runtime integration, and the Architecture Console UI surface.

## Owned surfaces

- Browser frontend entry and Vite app shell.
- Routes, route metadata, pages/views, stores, and app layouts.
- Browser adapters and approved app infrastructure for runtime APIs.
- alova HTTP runtime under app-owned HTTP infrastructure.
- safeStorage concrete browser runtime facade under app-owned safeStorage paths.
- PrimeVue app bootstrap through `@ccd/vue-primevue-adapter`.
- Architecture Console pages and app-local page shells under `apps/web-demo/src/views/architecture-console/**`.

## Architecture console role

The app demonstrates CCD architecture through `/dashboard`, `/architecture`, `/runtime`, `/ui`, `/system`, and `/desktop`. The retired `/example` route museum is not a canonical user-facing surface. Console composition is app-local unless a future owner-approved extraction lane proves package ownership and public API.

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
- `wiki/**`
- `apps/web-demo/**`
- `apps/web-demo/src/views/architecture-console/**`

## Related pages

- [[web-runtime]]
- [[web-demo-architecture-console]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
- [[app-local-shared-candidates]]
- [[vue-primevue-adapter-role]]
