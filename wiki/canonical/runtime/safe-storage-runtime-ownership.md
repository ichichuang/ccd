---
title_en: SafeStorage Runtime Ownership
title_zh: safeStorage 运行时归属
aliases:
  - safeStorage ownership
  - Safe storage boundary
  - safeStorage 边界
tags:
  - runtime
  - storage
  - apps
  - guardrails
tags_zh:
  - 运行时
  - 存储
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
  - wiki/**
  - .ai/runtime/repair_list.md
  - apps/web-demo/src/utils/safeStorage/**
  - packages/contracts/src/storage.ts
  - packages/shared-utils/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# SafeStorage Runtime Ownership

## Allowed runtime surfaces

Type-only storage capability contracts live in `packages/contracts`; JSON codec helpers can live in `@ccd/shared-utils`; concrete safeStorage crypto/HMAC/Web Crypto, obfuscation-key resolution, `lz-string` compression, Pinia serializer behavior, migration/fallback behavior, browser storage access, app facade exports, and maintenance remain app-owned under `apps/web-demo/src/utils/safeStorage/**`.

## Forbidden promotions

Do not promote safeStorage concrete runtime behavior into `packages/core`, `packages/contracts`, or `@ccd/shared-utils`. `P4-SafeStorageShared-Blocked` records this as blocked unless a future owner/security decision replaces the current app-owned runtime boundary.

## Adapter ownership

Storage capability contracts are injected across runtime boundaries; concrete browser storage is app-owned.

## Validation commands

```bash
pnpm arch:runtime
pnpm governance:gate
safeStorage tests when touched
pnpm type-check
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.en.md`
- `wiki/**`
- `wiki/**`
- `wiki/**`
- `.ai/runtime/repair_list.md`
- `apps/web-demo/src/utils/safeStorage/**`
- `packages/contracts/src/storage.ts`
- `packages/shared-utils/**`

## Related pages

- [[strategic-guardrails]]
- [[shared-utils-role]]
- [[contracts-boundary]]
- [[web-demo-role]]
