---
title_en: Vue App Platform Role
title_zh: Vue App Platform 职责
aliases:
  - packages/vue-app-platform
  - App platform
  - 应用平台包
tags:
  - packages
  - vue
  - app-platform
tags_zh:
  - 包
  - Vue
  - 应用平台
status: verified
confidence: 0.9
source_langs:
  - en
source_paths:
  - wiki/generated/**
  - wiki/**
  - wiki/**
  - packages/vue-app-platform/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# packages/vue-app-platform Package Boundary

## Owner boundary

`packages/vue-app-platform` owns frontend app bootstrap, lifecycle, i18n, layout, safe redirect, access-filter, and platform orchestration primitives when they remain reusable and not app-store-bound.

## Public exports

The generated API report lists exports such as app readiness markers, i18n runtime helpers, layout resolver helpers, menu/access filtering, Vite preload recovery, and layout visibility reducers.

The generated API surface report is the evidence view for exported symbols. Public consumption must go through package exports and prepared build outputs, not source deep imports.

## Allowed dependencies

Allowed dependencies support reusable Vue app-platform logic. App-specific router/store/DOM/storage/device/transition decisions must be injected or kept in apps.

## Forbidden moves

Do not move Pinia ownership, persisted preferences, `syncAction`, loading counters, mobile drawer runtime state, app singleton access, browser DOM writers, storage persistence, or desktop root-variable setup into this package.

## Validation commands

```bash
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm type-check
```

## Related pages

- [[package-responsibility-matrix]]
- [[web-demo-role]]
- [[desktop-role]]

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/generated/api-surface-report.md`
- `wiki/**`
- `wiki/**`
- `packages/vue-app-platform/**`
