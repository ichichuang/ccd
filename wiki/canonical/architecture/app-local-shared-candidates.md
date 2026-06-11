---
title_en: App-local Shared Candidates
title_zh: 应用内共享候选模块
aliases:
  - App-local candidates
  - Migration candidates
  - 应用共享候选
  - 迁移候选
tags:
  - architecture
  - apps
  - migration
tags_zh:
  - 架构
  - 应用
  - 迁移
status: verified
confidence: 0.9
source_langs:
  - en
  - zh
source_paths:
  - README.md
  - wiki/**
  - wiki/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# App-local Shared Candidates

The repository identifies several `apps/web-demo` paths as app-local shared candidates, integration shells, facades, runtime adapters, or future migration candidates. This classification is evidence for future owner-approved lanes; it is not an implementation task and not public export approval.

## Current candidate examples

- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/proform.ts`
- `apps/web-demo/src/plugins/modules/protable.ts`
- `apps/web-demo/src/utils/http/**`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/deviceSync.ts`
- `apps/web-demo/src/utils/safeStorage`
- `apps/web-demo/src/stores/modules/system/**`

## Current operating rule

Do not move these paths as a batch. A future lane must prove the destination, allowed paths, forbidden paths, validation, rollback, and owner decision. HTTP/alova and safeStorage concrete runtime behavior remain app-owned under current policy.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `wiki/**`
- `wiki/**`

## Related pages

- [[public-capability-placement]]
- [[http-runtime-ownership]]
- [[safe-storage-runtime-ownership]]
- [[web-demo-role]]
