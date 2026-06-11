---
title_en: Public Capability Placement
title_zh: 公共能力放置规则
aliases:
  - Capability placement
  - Public exports
  - 公共能力
  - 公开导出
tags:
  - architecture
  - packages
  - governance
tags_zh:
  - 架构
  - 包
  - 治理
status: verified
confidence: 0.91
source_langs:
  - en
  - zh
source_paths:
  - README.md
  - README.en.md
  - wiki/**
  - wiki/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Public Capability Placement

Reusable or public monorepo capability must live in governed `packages/*` and be consumed through package exports. `apps/*` may host app-local candidates and compatibility facades, but those classifications do not authorize public shared capability exports from app paths.

## Placement rules

| Capability kind                                      | Destination                                 |
| ---------------------------------------------------- | ------------------------------------------- |
| Cross-runtime interface, DTO, ABI shape              | `packages/contracts`                        |
| Runtime-neutral orchestration over injected adapters | `packages/core`                             |
| Pure helper                                          | `packages/shared-utils`                     |
| Token/theme/size/device derivation                   | `packages/design-tokens`                    |
| Vue/browser composable                               | `packages/vue-hooks`                        |
| App bootstrap/layout/i18n/platform primitive         | `packages/vue-app-platform`                 |
| CCD UI primitive                                     | `packages/vue-ui`                           |
| PrimeVue theme/config/service adapter                | `packages/vue-primevue-adapter`             |
| Chart helper/runtime                                 | `packages/vue-charts`                       |
| Runtime API, auth, router, store, browser, Tauri     | App adapters or approved app infrastructure |

## Forbidden shortcut

Do not expose public capability directly from `apps/web-demo` or `apps/desktop` unless a future owner decision changes the target architecture and records scope, paths, validation, rollback, and evidence.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `README.en.md`
- `wiki/**`
- `wiki/**`

## Related pages

- [[package-responsibility-matrix]]
- [[app-local-shared-candidates]]
- [[runtime-promotion-checklist]]
