---
title_en: Web Demo Architecture Console
title_zh: Web Demo 架构控制台
aliases:
  - Architecture Control Center
  - web-demo console
  - 架构控制台
tags:
  - application-boundaries
  - web-demo
  - ui
  - governance
tags_zh:
  - 应用边界
  - Web Demo
  - 界面
  - 治理
status: verified
confidence: 0.9
source_langs:
  - en
source_paths:
  - apps/web-demo/src/router/modules/architecture.ts
  - apps/web-demo/src/router/modules/runtime.ts
  - apps/web-demo/src/router/modules/ui.ts
  - apps/web-demo/src/router/modules/system.ts
  - apps/web-demo/src/router/modules/desktop.ts
  - apps/web-demo/src/router/modules/architecture-console.spec.ts
  - apps/web-demo/src/views/dashboard/index.vue
  - apps/web-demo/src/views/architecture-console/**
  - apps/web-demo/src/locales/lang/console/**
  - wiki/generated/web-demo-ui-inventory.md
  - .ai/runtime/web-demo-ui-rebuild-plan.md
last_reviewed: '2026-06-12'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Web Demo Architecture Console

`apps/web-demo` presents CCD as an architecture console, not as a product-monitoring dashboard or a route museum. The console is an app-owned information architecture surface that demonstrates package boundaries, runtime ownership, UI capabilities, system controls, desktop boundaries, and governance evidence.

## Canonical route taxonomy

| Route family    | Role                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `/dashboard`    | Architecture Control Center for boundary status, validation gates, wiki evidence, and P4 guardrails. |
| `/architecture` | Monorepo topology, package boundaries, runtime boundaries, and route/governance metadata.            |
| `/runtime`      | HTTP/alova, safeStorage, browser runtime, i18n/theme/device runtime, and state ownership.            |
| `/ui`           | PrimeVue adapter, ProForm, ProTable, charts, and feedback primitives.                                |
| `/system`       | Theme, size, breakpoints, layout runtime, and UnoCSS/token posture.                                  |
| `/desktop`      | Read-only desktop/Tauri boundary mirror without touching desktop code.                               |

## Retired example surface

The old `/example` showcase was retired as a canonical route surface. Inventory evidence recorded 99 example route records and 106 registered route records before the rebuild. The architecture console registers 23 static business route records and 29 total registered route records, with no canonical `/example` route paths.

## App-local shells

The console uses app-local page composition under `apps/web-demo/src/views/architecture-console/**`. These shells are not public `@ccd/vue-ui` exports:

- `ArchitecturePageShell`
- `CapabilityCard`
- `CommandPanel`
- `DemoSection`
- `EvidencePanel`
- `RouteEvidenceTable`
- `StatusBadgeRow`

Future extraction requires an owner-approved lane proving destination, public API, validation, rollback, and package boundary.

## Capability disposition

| Legacy area                                        | New disposition                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `common/constants`, `common/enums`, `common/types` | Retired as route pages; boundary evidence is summarized in architecture/runtime pages. |
| Lodash, string, ID, color, type-caster utilities   | Merged into runtime/state ownership evidence.                                          |
| Hook-by-hook demos                                 | Merged into runtime, system, and architecture pages by ownership.                      |
| ProForm route spread                               | Consolidated into `/ui/pro-form`.                                                      |
| ProTable route spread                              | Consolidated into `/ui/pro-table`.                                                     |
| PrimeVue overview/dialog/toast/empty/icons         | Consolidated into `/ui/primevue-adapter` and `/ui/feedback`.                           |
| ECharts showcase                                   | Consolidated into `/ui/charts`.                                                        |
| Theme/size/breakpoints/UnoCSS/layout               | Consolidated into `/system/**`.                                                        |

## Boundary rules

- Keep alova HTTP runtime under `apps/web-demo/src/utils/http/**`.
- Keep safeStorage crypto, compression, serializer, migration, and facade code under `apps/web-demo/src/utils/safeStorage/**`.
- Keep PrimeVue as the approved UI ecosystem through `@ccd/vue-primevue-adapter`.
- Do not add global `@ccd/*` TypeScript aliases.
- Do not implement P4 strategic guardrails in this UI lane.
- Do not touch `apps/desktop` or Tauri runtime while documenting `/desktop`.

## Validation evidence

Route tests assert the new route signatures, route count, top-level module discovery, no `/example` paths, titleKey locale coverage, and lazy import resolution. Visual and E2E tests target the new canonical routes rather than preserving old route compatibility by inertia.

## Related pages

- [[web-demo-role]]
- [[app-local-shared-candidates]]
- [[package-responsibility-matrix]]
- [[runtime-isolation]]
- [[validation-gates]]
- [[strategic-guardrails]]
