---
title_en: Package Responsibility Matrix
title_zh: 包职责矩阵
aliases:
  - Workspace responsibilities
  - Package boundaries
  - 包职责
  - 工作区职责
tags:
  - architecture
  - packages
  - governance
tags_zh:
  - 架构
  - 包
  - 治理
status: verified
confidence: 0.95
source_langs:
  - en
  - zh
source_paths:
  - README.md
  - wiki/**
  - wiki/generated/**
  - wiki/**
  - package.json
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Package Responsibility Matrix

The CCD package matrix is a governance surface, not only a folder list. Each workspace package has an owner boundary, a public export contract, and forbidden promotions.

| Workspace                       | Owner boundary                                        | Public export posture                                                     | Forbidden move                                                                                |
| ------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `packages/contracts`            | Interfaces, DTOs, cross-runtime contracts.            | Type exports and contract shapes through package exports.                 | Runtime implementation, Vue, browser, Node, Tauri, storage, network, timers, crypto.          |
| `packages/core`                 | Runtime-neutral orchestration over injected adapters. | `createCoreRuntime`, `CoreRuntime`, adapter type facades.                 | UI, HTTP runtime, safeStorage runtime, browser/Tauri access, frontend shared bucket behavior. |
| `packages/design-tokens`        | Tokens and pure derivation.                           | Token constants, theme/size/device/breakpoint resolvers.                  | DOM writes, storage persistence, app bootstrap, Pinia ownership.                              |
| `packages/shared-utils`         | Pure helpers.                                         | Generic utilities, JSON codec helpers, capability bridge, logger helpers. | Concrete safeStorage crypto/compression/migration/runtime facade.                             |
| `packages/unocss-preset`        | Build-time shared UnoCSS preset.                      | UnoCSS config, safelist, theme helpers.                                   | App runtime logic or UI state.                                                                |
| `packages/vue-hooks`            | Generic Vue/browser composables.                      | Hook factories and reusable composables.                                  | App event maps, app i18n defaults, app router query semantics.                                |
| `packages/vue-app-platform`     | Frontend bootstrap/layout/i18n/platform primitives.   | Pure orchestration helpers and layout reducers.                           | App stores, storage persistence, browser DOM writers, desktop root variable setup.            |
| `packages/vue-ui`               | CCD-owned UI primitives and component contracts.      | CCD components, ProForm/ProTable primitives, injected adapter keys.       | Raw PrimeVue loose bucket export, app data/query behavior.                                    |
| `packages/vue-primevue-adapter` | PrimeVue theme/config/service/locale integration.     | PrimeVue adapter config, runtime install helpers, service facades.        | PrimeVue replacement or raw app-side PrimeVue import expansion.                               |
| `packages/vue-charts`           | Shared chart runtime/helpers.                         | Chart runtime utilities and Vue chart hooks.                              | App server-state, HTTP, or product analytics ownership.                                       |

## Extraction decision rule

- DTO/interface/event-shape/cross-runtime contract goes to `packages/contracts`.
- Runtime-neutral orchestration over injected adapters goes to `packages/core`.
- Pure helper goes to `packages/shared-utils`.
- Vue/browser composable goes to `packages/vue-hooks` when it avoids app router/store coupling.
- UI primitive goes to `packages/vue-ui` when the public API is CCD-owned.
- PrimeVue integration goes to `packages/vue-primevue-adapter`.
- Runtime capability, auth, router, store, browser, or Tauri access stays app-owned or adapter-owned.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `wiki/**`
- `wiki/generated/api-surface-report.md`
- `wiki/**`
- `package.json`

## Related pages

- [[contracts-boundary]]
- [[core-boundary]]
- [[public-capability-placement]]
- [[runtime-isolation]]
