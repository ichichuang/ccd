# CCD Showcase Route System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rejected internal dashboard direction with a public-facing `/dashboard` landing page and a catalog-driven `/showcase` route family where every detailed CCD capability demo lives on dedicated pages.

**Architecture:** Keep `/dashboard` as a non-technical preview homepage that links into `/showcase`. Build one app-local showcase catalog as the single source of truth for route metadata, page metadata, dashboard links, navigation groups, locale expectations, source paths, and E2E targets. Generate a single top-level `apps/web-demo/src/router/modules/showcase.ts` route module from that catalog, because current route discovery only accepts top-level modules.

**Tech Stack:** Vue 3, TypeScript, Vite, pnpm, Turbo, PrimeVue v4, `@ccd/vue-ui` ProTable/ProForm/PrimeDialog/CScrollbar/EmptyState/Icons, `@ccd/vue-primevue-adapter`, `UseEcharts`, UnoCSS semantic shortcuts, i18n, Vitest, Playwright, GSAP through `apps/web-demo/src/plugins/animation`.

---

## Evidence Read Before Planning

- `apps/web-demo/src/hooks/modules/useDialog.tsx`: current facade exposes `openDialog`, close/remove/update helpers, `info`, `success`, `warn`, `danger`, `confirm`, and `confirmDelete` over `useDialogCore`. The implementation may use these supported facade methods. Raw PrimeVue dialogs remain out of bounds for business flows.
- `apps/web-demo/src/types/modules/router.d.ts`: `RouteConfig` is global, `RouteModule = RouteConfig | RouteConfig[]`, `titleKey` must be `router.${string}`, and icons must be `i-*` class names.
- `apps/web-demo/src/router/utils/routeModules.ts`: route module discovery rejects nested module paths. New static route family must land in a top-level module such as `apps/web-demo/src/router/modules/showcase.ts`.
- `apps/web-demo/src/views/architecture-console/shared/ArchitecturePageShell.vue`: shell is A2/sidebar-inspector oriented and should not be reused for public showcase pages.
- `apps/web-demo/src/adapters/charts/UseEcharts.vue` and `packages/vue-charts/src/UseEcharts/utils/types.ts`: app code should render charts through the app adapter and data-only options; rendering, theme runtime, locale text, loading text, resize, and KeepAlive recovery stay in the wrapper.
- `packages/vue-ui/src/ProTable/engine/types/props.ts`: ProTable currently supports request/server mode, pagination, selection, density toolbar, column settings, virtual scroll, infinite scroll, export, reload/state APIs, and URL sync.
- `packages/vue-ui/src/ProForm/engine/types/index.ts`: ProForm currently supports schema groups, validation resolver, deps, computed fields, visible/disabled/required logic, reactions, async options, field arrays, plugins, draft persistence, submit state, and exposed form APIs.
- `packages/unocss-preset/src/shortcuts/semanticShortcuts.ts`: requested semantic shortcuts exist; `glass-base` is internal-only.
- Current `/dashboard` imports architecture-console data and embeds ProForm, ProTable, UseEcharts, commands, evidence paths, and internal governance language. That content must move out of the homepage.

## Preflight Checklist

Global preflight:

- [x] Ledger read: `.ai/runtime/repair_list.md` has no actionable P0-P3 items; P4 items are non-actionable guardrails.
- [x] Data flow planned as `catalog/data -> hooks/composables -> views`; no raw HTTP in views.
- [x] Event bus rule planned: no direct `useMitt().on` in showcase Vue components.
- [x] Type safety planned: no business `any`; catalog and demo data use exported typed contracts.
- [x] Network/storage planned: HTTP demos use `useHttpRequest` or injected ProTable request functions; storage demos use `safeStorage`, not raw `localStorage`.
- [x] Date safety planned: date demos use `DateUtils` / `useDateUtils`.
- [x] Reactivity planned: avoid destructuring reactive state without `toRefs`.

UI preflight:

- [x] UnoCSS shortcuts are closed-set and verified in `semanticShortcuts.ts`.
- [x] `glass-base` is internal and not used directly.
- [x] Token rule planned: no hardcoded colors, raw Tailwind palettes, `rem`, or `em`.
- [x] Page roots use flowing `col-stretch` or a single layout container; no nested `layout-*`.
- [x] Scroll rule planned: no page-root `overflow-auto`; local scroll regions use `CScrollbar`.
- [x] Business forms with 2+ fields use `ProForm`.
- [x] PrimeVue v4 and CCD wrappers remain the interaction baseline.
- [x] GSAP, if used, goes only through `createScopedGsapContext`, with scoped root, cleanup, reduced-motion handling, and transform/opacity-only animation.

## Scaffold Constraint

Repo law requires `pnpm ai:scaffold:view-route` for new route/page pairs, but the scaffold script emits one route module per segment and the router tests reject nested route modules. Implementation should:

- [ ] Run the scaffold command for the initial `/showcase` route skeleton.
- [ ] Run scaffold commands for representative table/form/detail pages into temporary top-level route files where useful.
- [ ] Consolidate generated route metadata into `apps/web-demo/src/router/modules/showcase.ts`.
- [ ] Delete temporary scaffold route modules after the consolidated route module and catalog are in place.
- [ ] Keep the generated view/hook skeletons as the starting point for final showcase pages.
- [ ] Run `pnpm ai:guard` immediately after route/page scaffolding and after consolidation.

Recommended first scaffold command:

```bash
pnpm ai:scaffold:view-route -- --segment showcase --title-key router.showcase.root --kind detail --icon i-lucide-sparkles --rank 5
```

## File Structure

Create:

- `apps/web-demo/src/router/modules/showcase.ts`: one top-level route module generated from the catalog.
- `apps/web-demo/src/views/showcase/index.vue`: `/showcase` overview landing.
- `apps/web-demo/src/views/showcase/data/showcaseCatalog.ts`: single app-local catalog source of truth.
- `apps/web-demo/src/views/showcase/data/showcaseCatalog.spec.ts`: catalog uniqueness, locale key, route metadata, and dashboard-link coverage.
- `apps/web-demo/src/views/showcase/data/types.ts`: catalog types and page-kind unions.
- `apps/web-demo/src/views/showcase/shared/ShowcasePageShell.vue`: public showcase shell, not A2 inspector.
- `apps/web-demo/src/views/showcase/shared/ShowcaseHero.vue`: plain-language page header with optional CTA links.
- `apps/web-demo/src/views/showcase/shared/ShowcaseFeatureCard.vue`: reusable capability card.
- `apps/web-demo/src/views/showcase/shared/ShowcaseDemoPanel.vue`: framed demo area with source links and technical notes.
- `apps/web-demo/src/views/showcase/shared/ShowcaseCatalogGrid.vue`: renders catalog groups and cards.
- `apps/web-demo/src/views/showcase/shared/ShowcaseRelatedLinks.vue`: related demos from catalog IDs.
- `apps/web-demo/src/views/showcase/shared/ShowcaseSourceLinks.vue`: compact source-path references.
- `apps/web-demo/src/views/showcase/shared/ShowcasePlaceholderDemo.vue`: complete non-broken page for lower-priority entries, with value copy, source links, and related links.
- `apps/web-demo/src/views/showcase/components/primevue-adapter/index.vue`
- `apps/web-demo/src/views/showcase/components/empty-state/index.vue`
- `apps/web-demo/src/views/showcase/components/icons/index.vue`
- `apps/web-demo/src/views/showcase/components/c-scrollbar/index.vue`
- `apps/web-demo/src/views/showcase/feedback/dialog-toast/index.vue`
- `apps/web-demo/src/views/showcase/components/pro-table/*/index.vue`
- `apps/web-demo/src/views/showcase/components/pro-table/shared/*`
- `apps/web-demo/src/views/showcase/components/pro-form/*/index.vue`
- `apps/web-demo/src/views/showcase/components/pro-form/shared/*`
- `apps/web-demo/src/views/showcase/components/charts/*/index.vue`
- `apps/web-demo/src/views/showcase/hooks/*/index.vue`
- `apps/web-demo/src/views/showcase/utils/*/index.vue`
- `apps/web-demo/src/views/showcase/runtime/*/index.vue`
- `apps/web-demo/src/views/showcase/design/*/index.vue`
- `apps/web-demo/src/views/showcase/governance/index.vue`
- `apps/web-demo/src/views/showcase/desktop-boundary/index.vue`
- `e2e/showcase-route-system.spec.ts`

Modify:

- `apps/web-demo/src/views/dashboard/index.vue`: replace embedded demos and internal governance dashboard with public preview homepage driven by showcase catalog links.
- `apps/web-demo/src/views/dashboard/components/ArchitectureControlCenter.vue`: rename or replace with `DashboardLandingShell.vue`; preserve `#dashboard-page` and a stable dashboard CTA selector for E2E continuity.
- `apps/web-demo/src/locales/lang/core/en-US.ts` and `apps/web-demo/src/locales/lang/core/zh-CN.ts`: change `router.dashboard.dashboard` to public-facing dashboard title.
- `apps/web-demo/src/locales/lang/console/en-US.ts` and `apps/web-demo/src/locales/lang/console/zh-CN.ts`: add `router.showcase.*`, `showcase.*`, and dashboard landing locale keys; remove dashboard dependency on rejected `console.dashboard.*` copy.
- `apps/web-demo/src/router/modules/architecture-console.spec.ts`: update registered route counts/signatures or split showcase metadata tests into a new spec; remove dashboard-specific old console data assertions from dashboard coverage.
- `e2e/qa-regression.spec.ts`: keep dashboard smoke and fixed-tab checks, but assert public landing content and link behavior instead of dialog/demo-heavy workbench behavior.
- `e2e/sidebar-route-sync.spec.ts`: add nested showcase route active-state assertions.
- `e2e/use-echarts-render.spec.ts`: move chart smoke target from `/ui/charts` to `/showcase/components/charts/theme` while preserving non-zero canvas checks.

Do not update tracked snapshots until the implementation is approved visually.

## Catalog Shape

Use a typed, app-local catalog. It is source-of-truth for routes, labels, dashboard links, source paths, E2E targets, and page grouping.

```ts
export type ShowcaseGroupId =
  | 'overview'
  | 'components'
  | 'tables'
  | 'forms'
  | 'charts'
  | 'hooks'
  | 'utils'
  | 'runtime'
  | 'design'
  | 'feedback'
  | 'governance'
  | 'desktopBoundary'

export type ShowcaseDemoLevel = 'complete' | 'preview'
export type ShowcasePageKind = 'overview' | 'table' | 'form' | 'chart' | 'demo' | 'technical'

export interface ShowcaseCatalogItem {
  id: string
  parentId?: string
  groupId: ShowcaseGroupId
  path: `/showcase${string}`
  name: string
  titleKey: `router.showcase.${string}`
  localeBaseKey: `showcase.pages.${string}`
  icon: `i-${string}`
  rank: number
  kind: ShowcasePageKind
  demoLevel: ShowcaseDemoLevel
  componentKey: string
  sourcePaths: string[]
  dashboardLink?: boolean
  e2eTarget?: boolean
  tags: string[]
  relatedIds?: string[]
}
```

Route module generation pattern:

```ts
import { defineRouteModule } from '@/router/utils/routeModules'
import { createShowcaseRoutes } from '@/views/showcase/data/showcaseCatalog'

export default defineRouteModule(createShowcaseRoutes())
```

The catalog builder should validate unique `id`, `path`, `name`, `titleKey`, `rank` within siblings, valid parent references, and dashboard links pointing to concrete pages.

## Route Taxonomy

Root:

| Path                 | Name               | titleKey                   | Icon                | Rank |
| -------------------- | ------------------ | -------------------------- | ------------------- | ---: |
| `/showcase`          | `ShowcaseRoot`     | `router.showcase.root`     | `i-lucide-sparkles` |    5 |
| `/showcase/overview` | `ShowcaseOverview` | `router.showcase.overview` | `i-lucide-compass`  |    0 |

Components and feedback:

| Path                                    | Name                                | titleKey                                     | Icon                      | Rank |
| --------------------------------------- | ----------------------------------- | -------------------------------------------- | ------------------------- | ---: |
| `/showcase/components`                  | `ShowcaseComponentsRoot`            | `router.showcase.components.root`            | `i-lucide-component`      |   10 |
| `/showcase/components/primevue-adapter` | `ShowcaseComponentsPrimeVueAdapter` | `router.showcase.components.primevueAdapter` | `i-lucide-plug`           |   11 |
| `/showcase/components/empty-state`      | `ShowcaseComponentsEmptyState`      | `router.showcase.components.emptyState`      | `i-lucide-circle-dashed`  |   12 |
| `/showcase/components/icons`            | `ShowcaseComponentsIcons`           | `router.showcase.components.icons`           | `i-lucide-icons`          |   13 |
| `/showcase/components/c-scrollbar`      | `ShowcaseComponentsCScrollbar`      | `router.showcase.components.cScrollbar`      | `i-lucide-scroll-text`    |   14 |
| `/showcase/feedback/dialog-toast`       | `ShowcaseFeedbackDialogToast`       | `router.showcase.feedback.dialogToast`       | `i-lucide-message-circle` |   90 |

Tables, under the requested `/showcase/components/pro-table/*` path family:

| Path suffix         | Name suffix        | titleKey suffix                        | Rank |
| ------------------- | ------------------ | -------------------------------------- | ---: |
| `overview`          | `Overview`         | `components.proTable.overview`         |   20 |
| `basic`             | `Basic`            | `components.proTable.basic`            |   21 |
| `columns`           | `Columns`          | `components.proTable.columns`          |   22 |
| `sorting-filtering` | `SortingFiltering` | `components.proTable.sortingFiltering` |   23 |
| `pagination`        | `Pagination`       | `components.proTable.pagination`       |   24 |
| `server-request`    | `ServerRequest`    | `components.proTable.serverRequest`    |   25 |
| `states`            | `States`           | `components.proTable.states`           |   26 |
| `selection`         | `Selection`        | `components.proTable.selection`        |   27 |
| `toolbar-density`   | `ToolbarDensity`   | `components.proTable.toolbarDensity`   |   28 |
| `virtual-infinite`  | `VirtualInfinite`  | `components.proTable.virtualInfinite`  |   29 |
| `export-refresh`    | `ExportRefresh`    | `components.proTable.exportRefresh`    |   30 |
| `cell-rendering`    | `CellRendering`    | `components.proTable.cellRendering`    |   31 |
| `form-composition`  | `FormComposition`  | `components.proTable.formComposition`  |   32 |
| `api-events`        | `ApiEvents`        | `components.proTable.apiEvents`        |   33 |

Full path example: `/showcase/components/pro-table/basic`, name `ShowcaseComponentsProTableBasic`, title key `router.showcase.components.proTable.basic`, icon `i-lucide-table`.

Forms, under `/showcase/components/pro-form/*`:

| Path suffix              | Name suffix             | titleKey suffix                            | Rank |
| ------------------------ | ----------------------- | ------------------------------------------ | ---: |
| `overview`               | `Overview`              | `components.proForm.overview`              |   40 |
| `basic-schema`           | `BasicSchema`           | `components.proForm.basicSchema`           |   41 |
| `grouped-layout`         | `GroupedLayout`         | `components.proForm.groupedLayout`         |   42 |
| `validation`             | `Validation`            | `components.proForm.validation`            |   43 |
| `dependencies-computed`  | `DependenciesComputed`  | `components.proForm.dependenciesComputed`  |   44 |
| `conditional-visibility` | `ConditionalVisibility` | `components.proForm.conditionalVisibility` |   45 |
| `reactions`              | `Reactions`             | `components.proForm.reactions`             |   46 |
| `async-data`             | `AsyncData`             | `components.proForm.asyncData`             |   47 |
| `field-arrays`           | `FieldArrays`           | `components.proForm.fieldArrays`           |   48 |
| `plugins-draft`          | `PluginsDraft`          | `components.proForm.pluginsDraft`          |   49 |
| `submit-states`          | `SubmitStates`          | `components.proForm.submitStates`          |   50 |
| `api-events`             | `ApiEvents`             | `components.proForm.apiEvents`             |   51 |

Charts, under `/showcase/components/charts/*`:

| Path suffix         | Name suffix        | titleKey suffix                      | Rank |
| ------------------- | ------------------ | ------------------------------------ | ---: |
| `overview`          | `Overview`         | `components.charts.overview`         |   60 |
| `theme`             | `Theme`            | `components.charts.theme`            |   61 |
| `responsive`        | `Responsive`       | `components.charts.responsive`       |   62 |
| `states`            | `States`           | `components.charts.states`           |   63 |
| `events`            | `Events`           | `components.charts.events`           |   64 |
| `dashboard-preview` | `DashboardPreview` | `components.charts.dashboardPreview` |   65 |

Hooks:

| Path                                | Name                            | titleKey                                 | Icon                          | Rank |
| ----------------------------------- | ------------------------------- | ---------------------------------------- | ----------------------------- | ---: |
| `/showcase/hooks/overview`          | `ShowcaseHooksOverview`         | `router.showcase.hooks.overview`         | `i-lucide-waypoints`          |  100 |
| `/showcase/hooks/theme-switching`   | `ShowcaseHooksThemeSwitching`   | `router.showcase.hooks.themeSwitching`   | `i-lucide-moon-star`          |  101 |
| `/showcase/hooks/locale-switching`  | `ShowcaseHooksLocaleSwitching`  | `router.showcase.hooks.localeSwitching`  | `i-lucide-languages`          |  102 |
| `/showcase/hooks/http-flow`         | `ShowcaseHooksHttpFlow`         | `router.showcase.hooks.httpFlow`         | `i-lucide-webhook`            |  103 |
| `/showcase/hooks/auth-permission`   | `ShowcaseHooksAuthPermission`   | `router.showcase.hooks.authPermission`   | `i-lucide-shield-check`       |  104 |
| `/showcase/hooks/layout-runtime`    | `ShowcaseHooksLayoutRuntime`    | `router.showcase.hooks.layoutRuntime`    | `i-lucide-layout-dashboard`   |  105 |
| `/showcase/hooks/responsive-device` | `ShowcaseHooksResponsiveDevice` | `router.showcase.hooks.responsiveDevice` | `i-lucide-monitor-smartphone` |  106 |

Utils:

| Path                                | Name                            | titleKey                                 | Icon                      | Rank |
| ----------------------------------- | ------------------------------- | ---------------------------------------- | ------------------------- | ---: |
| `/showcase/utils/overview`          | `ShowcaseUtilsOverview`         | `router.showcase.utils.overview`         | `i-lucide-wrench`         |  120 |
| `/showcase/utils/date`              | `ShowcaseUtilsDate`             | `router.showcase.utils.date`             | `i-lucide-calendar-clock` |  121 |
| `/showcase/utils/safe-storage`      | `ShowcaseUtilsSafeStorage`      | `router.showcase.utils.safeStorage`      | `i-lucide-lock-keyhole`   |  122 |
| `/showcase/utils/state-persistence` | `ShowcaseUtilsStatePersistence` | `router.showcase.utils.statePersistence` | `i-lucide-database`       |  123 |

Runtime:

| Path                                | Name                            | titleKey                                 | Icon                       | Rank |
| ----------------------------------- | ------------------------------- | ---------------------------------------- | -------------------------- | ---: |
| `/showcase/runtime/overview`        | `ShowcaseRuntimeOverview`       | `router.showcase.runtime.overview`       | `i-lucide-cpu`             |  140 |
| `/showcase/runtime/http`            | `ShowcaseRuntimeHttp`           | `router.showcase.runtime.http`           | `i-lucide-webhook`         |  141 |
| `/showcase/runtime/browser-runtime` | `ShowcaseRuntimeBrowser`        | `router.showcase.runtime.browser`        | `i-lucide-globe-2`         |  142 |
| `/showcase/runtime/layout`          | `ShowcaseRuntimeLayout`         | `router.showcase.runtime.layout`         | `i-lucide-panels-top-left` |  143 |
| `/showcase/runtime/state-ownership` | `ShowcaseRuntimeStateOwnership` | `router.showcase.runtime.stateOwnership` | `i-lucide-database`        |  144 |

Design system:

| Path                        | Name                     | titleKey                          | Icon                   | Rank |
| --------------------------- | ------------------------ | --------------------------------- | ---------------------- | ---: |
| `/showcase/design/tokens`   | `ShowcaseDesignTokens`   | `router.showcase.design.tokens`   | `i-lucide-swatch-book` |  160 |
| `/showcase/design/unocss`   | `ShowcaseDesignUnocss`   | `router.showcase.design.unocss`   | `i-lucide-diamond`     |  161 |
| `/showcase/design/material` | `ShowcaseDesignMaterial` | `router.showcase.design.material` | `i-lucide-layers-3`    |  162 |
| `/showcase/design/density`  | `ShowcaseDesignDensity`  | `router.showcase.design.density`  | `i-lucide-ruler`       |  163 |
| `/showcase/design/motion`   | `ShowcaseDesignMotion`   | `router.showcase.design.motion`   | `i-lucide-move-3d`     |  164 |

Governance and desktop boundary:

| Path                         | Name                      | titleKey                               | Icon                    | Rank |
| ---------------------------- | ------------------------- | -------------------------------------- | ----------------------- | ---: |
| `/showcase/governance`       | `ShowcaseGovernance`      | `router.showcase.governance.root`      | `i-lucide-shield-check` |  180 |
| `/showcase/desktop-boundary` | `ShowcaseDesktopBoundary` | `router.showcase.desktopBoundary.root` | `i-lucide-monitor`      |  190 |

## Locale Structure

Route titles:

- `router.showcase.root`
- `router.showcase.overview`
- `router.showcase.components.*`
- `router.showcase.feedback.*`
- `router.showcase.hooks.*`
- `router.showcase.utils.*`
- `router.showcase.runtime.*`
- `router.showcase.design.*`
- `router.showcase.governance.root`
- `router.showcase.desktopBoundary.root`

Page copy:

- `showcase.dashboard.hero.title`
- `showcase.dashboard.hero.description`
- `showcase.dashboard.ctas.tables`
- `showcase.dashboard.ctas.forms`
- `showcase.dashboard.ctas.charts`
- `showcase.dashboard.ctas.design`
- `showcase.dashboard.ctas.runtime`
- `showcase.dashboard.ctas.governance`
- `showcase.groups.<groupId>.title`
- `showcase.groups.<groupId>.description`
- `showcase.pages.<catalogId>.eyebrow`
- `showcase.pages.<catalogId>.title`
- `showcase.pages.<catalogId>.description`
- `showcase.pages.<catalogId>.try`
- `showcase.pages.<catalogId>.source`
- `showcase.pages.<catalogId>.technical`
- `showcase.tags.<tagId>`

Every visible string must be present in both `apps/web-demo/src/locales/lang/console/en-US.ts` and `apps/web-demo/src/locales/lang/console/zh-CN.ts`.

## Dashboard Landing Plan

`/dashboard` must preserve route identity, fixed tab behavior, and `keepAlive`, but change content completely:

- Hero: plain product language describing CCD as reusable UI, runtime, and governance capabilities.
- Why CCD: reusable building blocks, consistent themes, reliable data tables, smart forms, chart-ready dashboards, responsive layout, multilingual UX, runtime safety, desktop boundary, governed delivery.
- Capability cards from catalog dashboard links.
- Visual preview tiles only; no embedded ProTable, ProForm, ECharts canvas, command list, evidence-path grid, route counts, migration history, or governance posture report.
- Start exploring CTAs:
  - Explore data tables -> `/showcase/components/pro-table/basic`
  - Try smart forms -> `/showcase/components/pro-form/validation`
  - View charts -> `/showcase/components/charts/theme`
  - Browse design system -> `/showcase/design/tokens`
  - See runtime features -> `/showcase/runtime/overview`
  - Open governance story -> `/showcase/governance`
- Compact architecture value story in human language only.
- GSAP may animate hero/card reveal through scoped root and reduced-motion bypass.

## Demo Priority

Phase 1 complete demos:

- Dashboard landing.
- Showcase overview.
- ProTable overview, basic, server-request, states.
- ProForm overview, basic-schema, validation, reactions.
- UseEcharts overview, theme, responsive.
- PrimeVue adapter controls.
- Design tokens.
- Runtime overview.

Phase 1 preview-ready pages:

- Remaining ProTable pages.
- Remaining ProForm pages.
- Chart events and dashboard preview.
- Hooks, utils, feedback, governance, desktop boundary.

Every page, including preview-ready pages, must answer:

- What this is.
- Why it matters.
- What the user can try.
- Where the technical source lives.

## Implementation Tasks

### Task 1: Catalog and Route Backbone

**Files:**

- Create: `apps/web-demo/src/views/showcase/data/types.ts`
- Create: `apps/web-demo/src/views/showcase/data/showcaseCatalog.ts`
- Create: `apps/web-demo/src/views/showcase/data/showcaseCatalog.spec.ts`
- Create/modify: `apps/web-demo/src/router/modules/showcase.ts`
- Modify: `apps/web-demo/src/router/modules/architecture-console.spec.ts`

- [ ] Run scaffold for `/showcase` root with `pnpm ai:scaffold:view-route -- --segment showcase --title-key router.showcase.root --kind detail --icon i-lucide-sparkles --rank 5`.
- [ ] Add typed catalog entries for all route paths listed in this plan.
- [ ] Implement `createShowcaseRoutes()` to build `RouteConfig` records with lazy component imports and catalog metadata.
- [ ] Ensure route groups redirect to their first child.
- [ ] Add catalog tests for duplicate ids, paths, names, titleKeys, invalid parents, missing locale keys, and dashboard-link targets.
- [ ] Update route metadata expectations to include `./showcase.ts`, route count changes, and no `/example` revival.
- [ ] Run `pnpm ai:guard`.

### Task 2: Shared Showcase Shell

**Files:**

- Create: `apps/web-demo/src/views/showcase/shared/ShowcasePageShell.vue`
- Create: `apps/web-demo/src/views/showcase/shared/ShowcaseHero.vue`
- Create: `apps/web-demo/src/views/showcase/shared/ShowcaseFeatureCard.vue`
- Create: `apps/web-demo/src/views/showcase/shared/ShowcaseDemoPanel.vue`
- Create: `apps/web-demo/src/views/showcase/shared/ShowcaseCatalogGrid.vue`
- Create: `apps/web-demo/src/views/showcase/shared/ShowcaseRelatedLinks.vue`
- Create: `apps/web-demo/src/views/showcase/shared/ShowcaseSourceLinks.vue`
- Create: `apps/web-demo/src/views/showcase/shared/ShowcasePlaceholderDemo.vue`

- [ ] Build a flowing A1/public showcase shell, not an A2 inspector clone.
- [ ] Use `material-elevated`, `material-solid`, `demo-well`, `glass-icon-box`, semantic surfaces, and static UnoCSS classes only.
- [ ] Keep root scrolling owned by the admin layout; use `CScrollbar` only for local fixed-height demo areas.
- [ ] Include source-path and related-link slots as secondary supporting details.
- [ ] Add scoped GSAP helper only if CSS/Vue transitions are insufficient; otherwise keep pages static.

### Task 3: Dashboard Public Landing

**Files:**

- Modify: `apps/web-demo/src/views/dashboard/index.vue`
- Rename or replace: `apps/web-demo/src/views/dashboard/components/ArchitectureControlCenter.vue`
- Modify: `apps/web-demo/src/locales/lang/core/en-US.ts`
- Modify: `apps/web-demo/src/locales/lang/core/zh-CN.ts`
- Modify: `apps/web-demo/src/locales/lang/console/en-US.ts`
- Modify: `apps/web-demo/src/locales/lang/console/zh-CN.ts`
- Modify: `e2e/qa-regression.spec.ts`

- [ ] Remove dashboard imports from `apps/web-demo/src/views/architecture-console/data/dashboard.ts`.
- [ ] Remove embedded ProForm, ProTable, UseEcharts, validation command list, source evidence cards, route-count framing, migration language, and internal governance posture language.
- [ ] Render public hero, Why CCD, capability category cards, visual preview tiles, start-exploring CTAs, and compact architecture value story from the showcase catalog.
- [ ] Preserve `#dashboard-page` for smoke tests and keep a stable primary CTA selector such as `#dashboard-start-exploring`.
- [ ] Update dashboard route title to public product language.
- [ ] Ensure the dashboard contains no `.echarts canvas`, no ProTable table surface, and no large ProForm surface.

### Task 4: ProTable Multi-Page Demos

**Files:**

- Create: `apps/web-demo/src/views/showcase/components/pro-table/shared/proTableDemoData.ts`
- Create: `apps/web-demo/src/views/showcase/components/pro-table/shared/proTableColumns.tsx`
- Create: `apps/web-demo/src/views/showcase/components/pro-table/shared/ProTableDemoShell.vue`
- Create: `apps/web-demo/src/views/showcase/components/pro-table/*/index.vue`

- [ ] Implement complete pages for overview, basic, server-request, and states.
- [ ] Implement preview-ready pages for columns, sorting-filtering, pagination, selection, toolbar-density, virtual-infinite, export-refresh, cell-rendering, form-composition, and API/events.
- [ ] Use typed `ProTableColumn<T>[]`; put columns in TSX files when renderers are needed.
- [ ] Use `request` or injected `apiExecutor` for server/request examples; do not use raw fetch.
- [ ] Exercise supported exposed APIs: `reload`, `clearSelection`, `getState`, `getFetchState`, and `exportData`.
- [ ] Demonstrate virtual/infinite mode only with supported `virtualScroll` and `infiniteScroll` props.

### Task 5: ProForm Multi-Page Demos

**Files:**

- Create: `apps/web-demo/src/views/showcase/components/pro-form/shared/proFormDemoSchemas.ts`
- Create: `apps/web-demo/src/views/showcase/components/pro-form/shared/ProFormDemoShell.vue`
- Create: `apps/web-demo/src/views/showcase/components/pro-form/*/index.vue`

- [ ] Implement complete pages for overview, basic-schema, validation, and reactions.
- [ ] Implement preview-ready pages for grouped-layout, dependencies-computed, conditional-visibility, async-data, field-arrays, plugins-draft, submit-states, and API/events.
- [ ] Use `FormSchema<T>`, `ValidationResolver<T>`, `deps`, `computed`, `visibleIf`, `requiredIf`, and `reactions` exactly as defined in current ProForm types.
- [ ] Use `useFieldArray`, `ProFormPlugins`, and draft storage only on pages that demonstrate those supported APIs.
- [ ] Keep submit/result states local and demonstrable without external network dependencies.

### Task 6: Charts, Hooks, Utils, Runtime, Design, Feedback

**Files:**

- Create: `apps/web-demo/src/views/showcase/components/charts/*/index.vue`
- Create: `apps/web-demo/src/views/showcase/hooks/*/index.vue`
- Create: `apps/web-demo/src/views/showcase/utils/*/index.vue`
- Create: `apps/web-demo/src/views/showcase/runtime/*/index.vue`
- Create: `apps/web-demo/src/views/showcase/design/*/index.vue`
- Create: `apps/web-demo/src/views/showcase/feedback/dialog-toast/index.vue`
- Create: `apps/web-demo/src/views/showcase/governance/index.vue`
- Create: `apps/web-demo/src/views/showcase/desktop-boundary/index.vue`

- [ ] Charts use `<UseEcharts :option="option" />`; chart options stay data-only and avoid hardcoded colors.
- [ ] Chart theme page validates light/dark switching through wrapper behavior.
- [ ] Responsive chart page relies on wrapper resize behavior, not page-local `resize()`.
- [ ] Hook pages demonstrate `useThemeSwitch`, `useLocale`, `useHttpRequest`, `useAuth`, `useLayoutRuntime`, and device/runtime behavior through understandable scenarios.
- [ ] Utils pages demonstrate `DateUtils`, `useDateUtils`, `safeStorage`, and state persistence without raw storage.
- [ ] Runtime pages explain app adapter ownership and link to `apps/web-demo/src/adapters/**`.
- [ ] Design pages show token families, UnoCSS shortcuts, material mapping, density, and motion rules without hardcoded palettes.
- [ ] Feedback page uses `useDialog`, `window.$message`, `window.$toast`, `EmptyState`, `Icons`, and `CScrollbar`.
- [ ] Desktop boundary page stays read-only and does not import Tauri APIs into web-demo.

### Task 7: Locale and Copy Coverage

**Files:**

- Modify: `apps/web-demo/src/locales/lang/console/en-US.ts`
- Modify: `apps/web-demo/src/locales/lang/console/zh-CN.ts`
- Modify: `apps/web-demo/src/router/modules/architecture-console.spec.ts`
- Create/modify: `apps/web-demo/src/views/showcase/data/showcaseCatalog.spec.ts`

- [ ] Add every `router.showcase.*` title key in both locales.
- [ ] Add every `showcase.*` visible page, dashboard, group, tag, CTA, state, and source label key in both locales.
- [ ] Ensure first-layer copy is plain product language and technical copy is secondary.
- [ ] Add tests that collect catalog locale keys and route title keys.
- [ ] Remove or stop using rejected `console.dashboard.*` architecture-control-center copy from the dashboard.

### Task 8: E2E and Visual Validation

**Files:**

- Create: `e2e/showcase-route-system.spec.ts`
- Modify: `e2e/qa-regression.spec.ts`
- Modify: `e2e/sidebar-route-sync.spec.ts`
- Modify: `e2e/use-echarts-render.spec.ts`
- Modify only after approval: tracked dashboard snapshots.

- [ ] Add dashboard smoke assertions for public homepage copy, CTAs, no embedded large demos, no console errors, and responsive viewports.
- [ ] Add route smoke for `/showcase`.
- [ ] Add page smoke for `/showcase/components/pro-table/basic`.
- [ ] Add page smoke for `/showcase/components/pro-form/validation`.
- [ ] Add chart canvas smoke for `/showcase/components/charts/theme`.
- [ ] Add design token page smoke for `/showcase/design/tokens`.
- [ ] Add sidebar active-state test for a nested showcase page.
- [ ] Add reduced-motion test for dashboard/showcase GSAP targets if GSAP is used.
- [ ] Keep snapshot updates separate and owner-approved.

## Validation Commands

Run narrow validation first:

```bash
pnpm ai:guard
pnpm exec vitest run apps/web-demo/src/views/showcase/data/showcaseCatalog.spec.ts apps/web-demo/src/router/modules/architecture-console.spec.ts
pnpm exec playwright test e2e/showcase-route-system.spec.ts --project=chromium
```

Then run repository-required gates:

```bash
pnpm lint:check
pnpm type-check
pnpm test:run
pnpm build:web-demo
pnpm arch:runtime
pnpm api:report
pnpm supply:check
pnpm governance:full
```

E2E coverage:

```bash
pnpm exec playwright test e2e/qa-regression.spec.ts e2e/sidebar-route-sync.spec.ts e2e/theme-switch-interaction.spec.ts e2e/use-echarts-render.spec.ts e2e/showcase-route-system.spec.ts --project=chromium
```

Responsive and reduced-motion checks:

- Desktop: 1280x720.
- Tablet: 768x1024.
- Mobile: 390x844.
- Reduced motion: Playwright `page.emulateMedia({ reducedMotion: 'reduce' })` against `/dashboard`, `/showcase`, and any GSAP-enabled page.

## Residual Risks

- The worktree already contains dirty files from the rejected direction. Implementation must intentionally replace dashboard-related content while preserving unrelated user changes.
- The scaffold command is not catalog-aware. Consolidation must be handled carefully and followed by `pnpm ai:guard`.
- Route metadata tests currently assert exact route counts and signatures. Showcase will require deliberate test updates.
- Existing E2E selectors expect dashboard quick action to open a dialog. Public dashboard should update that behavior and test expectation together.
- Snapshot files are already dirty. Do not update or stage snapshots until the visual result is approved.

## Self-Review

- Spec coverage: dashboard reset, catalog-driven showcase, route taxonomy, route metadata, locale coverage, ProTable pages, ProForm pages, chart pages, hooks/utils/runtime/design/feedback/governance/desktop demos, GSAP constraints, validation, and E2E coverage are all mapped to tasks.
- Placeholder scan: no unresolved placeholder markers are used. Preview-ready pages are defined as complete, navigable pages with copy, sources, and related links.
- Type consistency: catalog field names match planned route builder and test usage; route title keys follow `router.${string}`; icons follow `i-*`.
