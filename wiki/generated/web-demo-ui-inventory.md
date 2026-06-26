---
title_en: Web Demo UI Inventory
title_zh: Web Demo UI Inventory
aliases:
  - web-demo ui inventory
  - architecture console inventory
tags:
  - generated
  - web-demo
  - ui
  - routes
tags_zh:
  - generated
  - web-demo
  - ui
  - routes
status: published
confidence: 0.95
source_langs:
  - en
source_paths:
  - apps/web-demo/src/router/**
  - apps/web-demo/src/views/**
  - apps/web-demo/src/locales/**
  - e2e/**
last_reviewed: '2026-06-24'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Web Demo UI Inventory

Current route surface for `apps/web-demo`: the Architecture Console lane
(`/dashboard`, `/architecture`, `/runtime`, `/ui`, `/system`, `/desktop`) plus the
`/showcase` capability catalog. This replaces the pre-rebuild route-museum snapshot
that this file used to carry.

> **Maintenance note — manually maintained, not script-generated.**
> There is no code generator that emits this file; it is refreshed by hand from the
> live route source of truth. When the route surface changes, update the tables below
> and run the governance guard `pnpm wiki:ui-inventory:check` (also wired into
> `pnpm governance:gate`). The guard fails if this inventory references a removed
> top-level route section or drops one of the current route families, which is what
> keeps it from drifting back into staleness.
>
> **Source of truth**
>
> - Route modules: `apps/web-demo/src/router/modules/*.ts`
>   (`core`, `dashboard`, `architecture`, `runtime`, `ui`, `system`, `desktop`, `showcase`)
> - Route constants and error/redirect records: `apps/web-demo/src/constants/router.ts`
> - Showcase catalog (computed leaves, groups, root): `apps/web-demo/src/views/showcase/data/showcaseCatalog.ts`
> - Console page models (shared `ConsolePage.vue` host): `apps/web-demo/src/views/architecture-console/data/consolePages.ts`
> - Titles/i18n keys: `apps/web-demo/src/locales/**`
> - Surface assertions (count + signature guard): `apps/web-demo/src/router/modules/architecture-console.spec.ts`

## Route surface overview

| Section      | Top path                          | Registered records | Entry / redirect                   |
| ------------ | --------------------------------- | -----------------: | ---------------------------------- |
| core         | `/`, `/login`                     |                  2 | `/` → `VITE_ROOT_REDIRECT`         |
| dashboard    | `/dashboard`                      |                  1 | leaf (fixed tag, keep-alive)       |
| architecture | `/architecture`                   |                  5 | root + 4 console pages             |
| runtime      | `/runtime`                        |                  5 | root + 4 console pages             |
| ui           | `/ui`                             |                  6 | root + 5 console pages             |
| system       | `/system`                         |                  6 | root + 5 console pages             |
| desktop      | `/desktop`                        |                  1 | single boundary console page       |
| error/catch  | `/404`, `/403`, `/500`, catch-all |                  4 | catch-all → `/404`                 |
| showcase     | `/showcase`                       |                 70 | root + 7 group parents + 62 leaves |

Console route records (architecture + runtime + ui + system + desktop) total **23**.
Base registered records (everything except `/showcase`) total **30**. The full
registered surface is **100** records.

## Base / static routes (30 registered records)

`ConsolePage.vue` is the shared host for every console route; the route name selects
the console page model. `(redirect)` rows do not render a component of their own.

| Family       | Path                               | Name                          | Resolution               | TitleKey                                        | Component                       |
| ------------ | ---------------------------------- | ----------------------------- | ------------------------ | ----------------------------------------------- | ------------------------------- |
| core         | `/`                                | Root                          | → VITE_ROOT_REDIRECT     | `router.core.root`                              | (redirect)                      |
| core         | `/login`                           | Login                         | leaf                     | `router.core.login`                             | views/login/index.vue           |
| dashboard    | `/dashboard`                       | Dashboard                     | leaf                     | `router.dashboard.dashboard`                    | views/dashboard/index.vue       |
| architecture | `/architecture`                    | ArchitectureRoot              | → /architecture/topology | `router.console.architecture.root`              | (redirect)                      |
| architecture | `/architecture/topology`           | ArchitectureTopology          | leaf                     | `router.console.architecture.topology`          | ConsolePage.vue                 |
| architecture | `/architecture/package-boundaries` | ArchitecturePackageBoundaries | leaf                     | `router.console.architecture.packageBoundaries` | ConsolePage.vue                 |
| architecture | `/architecture/runtime-boundaries` | ArchitectureRuntimeBoundaries | leaf                     | `router.console.architecture.runtimeBoundaries` | ConsolePage.vue                 |
| architecture | `/architecture/governance`         | ArchitectureGovernance        | leaf                     | `router.console.architecture.governance`        | ConsolePage.vue                 |
| runtime      | `/runtime`                         | RuntimeRoot                   | → /runtime/http          | `router.console.runtime.root`                   | (redirect)                      |
| runtime      | `/runtime/http`                    | RuntimeHttp                   | leaf                     | `router.console.runtime.http`                   | ConsolePage.vue                 |
| runtime      | `/runtime/safe-storage`            | RuntimeSafeStorage            | leaf                     | `router.console.runtime.safeStorage`            | ConsolePage.vue                 |
| runtime      | `/runtime/browser-runtime`         | RuntimeBrowser                | leaf                     | `router.console.runtime.browser`                | ConsolePage.vue                 |
| runtime      | `/runtime/state`                   | RuntimeState                  | leaf                     | `router.console.runtime.state`                  | ConsolePage.vue                 |
| ui           | `/ui`                              | UiRoot                        | → /ui/primevue-adapter   | `router.console.ui.root`                        | (redirect)                      |
| ui           | `/ui/primevue-adapter`             | UiPrimeVueAdapter             | leaf                     | `router.console.ui.primevueAdapter`             | ConsolePage.vue                 |
| ui           | `/ui/pro-form`                     | UiProForm                     | leaf                     | `router.console.ui.proForm`                     | ConsolePage.vue                 |
| ui           | `/ui/pro-table`                    | UiProTable                    | leaf                     | `router.console.ui.proTable`                    | ConsolePage.vue                 |
| ui           | `/ui/charts`                       | UiCharts                      | leaf                     | `router.console.ui.charts`                      | ConsolePage.vue                 |
| ui           | `/ui/feedback`                     | UiFeedback                    | leaf                     | `router.console.ui.feedback`                    | ConsolePage.vue                 |
| system       | `/system`                          | SystemRoot                    | → /system/theme          | `router.console.system.root`                    | (redirect)                      |
| system       | `/system/theme`                    | SystemTheme                   | leaf                     | `router.console.system.theme`                   | ConsolePage.vue                 |
| system       | `/system/size-breakpoints`         | SystemSizeBreakpoints         | leaf                     | `router.console.system.sizeBreakpoints`         | ConsolePage.vue                 |
| system       | `/system/layout`                   | SystemLayout                  | leaf                     | `router.console.system.layout`                  | ConsolePage.vue                 |
| system       | `/system/unocss`                   | SystemUnocss                  | leaf                     | `router.console.system.unocss`                  | ConsolePage.vue                 |
| system       | `/system/settings`                 | SystemGlobalSettings          | leaf                     | `router.console.system.globalSettings`          | views/system/settings/index.vue |
| desktop      | `/desktop`                         | DesktopBoundary               | leaf                     | `router.console.desktop.root`                   | ConsolePage.vue                 |
| error        | `/404`                             | 404                           | leaf                     | `router.error.notFound`                         | views/notfound/404.vue          |
| error        | `/403`                             | 403                           | leaf                     | `router.error.forbidden`                        | views/notfound/403.vue          |
| error        | `/500`                             | 500                           | leaf                     | `router.error.serverError`                      | views/notfound/500.vue          |
| error        | `/:pathMatch(.*)*`                 | CatchAll                      | → /404                   | `router.error.notFound`                         | (redirect)                      |

## Showcase routes (70 records: 1 root + 7 group parents + 62 catalog leaves)

Showcase routes are computed at runtime by `createShowcaseRoutes()` from
`showcaseCatalog.ts`. The root and the seven group parents are redirect-only
container records; the 62 catalog items are the navigable/leaf records.

### Root and group parents

| Path                             | Name                       | Resolution           | TitleKey                                   |
| -------------------------------- | -------------------------- | -------------------- | ------------------------------------------ |
| `/showcase`                      | ShowcaseRoot               | → /showcase/overview | `router.showcase.root`                     |
| `/showcase/components/pro-table` | ShowcaseComponentsProTable | → …/overview         | `router.showcase.components.proTable.root` |
| `/showcase/components/pro-form`  | ShowcaseComponentsProForm  | → …/overview         | `router.showcase.components.proForm.root`  |
| `/showcase/components/charts`    | ShowcaseComponentsCharts   | → …/overview         | `router.showcase.components.charts.root`   |
| `/showcase/hooks`                | ShowcaseHooks              | → …/overview         | `router.showcase.hooks.root`               |
| `/showcase/utils`                | ShowcaseUtils              | → …/overview         | `router.showcase.utils.root`               |
| `/showcase/runtime`              | ShowcaseRuntime            | → …/overview         | `router.showcase.runtime.root`             |
| `/showcase/design`               | ShowcaseDesign             | → …/tokens           | `router.showcase.design.root`              |

### Showcase catalog leaves (62)

`/showcase/components` (`ShowcaseComponentsRoot`) is itself a catalog item that acts
as a redirect group parent (→ `/showcase/components/primevue-adapter`).

| Group           | Path                                                   | Name                                           | TitleKey                                                   |
| --------------- | ------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------- |
| overview        | `/showcase/overview`                                   | ShowcaseOverview                               | `router.showcase.overview`                                 |
| components      | `/showcase/components`                                 | ShowcaseComponentsRoot                         | `router.showcase.components.root`                          |
| components      | `/showcase/components/primevue-adapter`                | ShowcaseComponentsPrimeVueAdapter              | `router.showcase.components.primevueAdapter`               |
| components      | `/showcase/components/empty-state`                     | ShowcaseComponentsEmptyState                   | `router.showcase.components.emptyState`                    |
| components      | `/showcase/components/icons`                           | ShowcaseComponentsIcons                        | `router.showcase.components.icons`                         |
| components      | `/showcase/components/c-scrollbar`                     | ShowcaseComponentsCScrollbar                   | `router.showcase.components.cScrollbar`                    |
| tables          | `/showcase/components/pro-table/overview`              | ShowcaseComponentsProTableOverview             | `router.showcase.components.proTable.overview`             |
| tables          | `/showcase/components/pro-table/basic`                 | ShowcaseComponentsProTableBasic                | `router.showcase.components.proTable.basic`                |
| tables          | `/showcase/components/pro-table/columns`               | ShowcaseComponentsProTableColumns              | `router.showcase.components.proTable.columns`              |
| tables          | `/showcase/components/pro-table/sorting-filtering`     | ShowcaseComponentsProTableSortingFiltering     | `router.showcase.components.proTable.sortingFiltering`     |
| tables          | `/showcase/components/pro-table/pagination`            | ShowcaseComponentsProTablePagination           | `router.showcase.components.proTable.pagination`           |
| tables          | `/showcase/components/pro-table/server-request`        | ShowcaseComponentsProTableServerRequest        | `router.showcase.components.proTable.serverRequest`        |
| tables          | `/showcase/components/pro-table/states`                | ShowcaseComponentsProTableStates               | `router.showcase.components.proTable.states`               |
| tables          | `/showcase/components/pro-table/selection`             | ShowcaseComponentsProTableSelection            | `router.showcase.components.proTable.selection`            |
| tables          | `/showcase/components/pro-table/toolbar-density`       | ShowcaseComponentsProTableToolbarDensity       | `router.showcase.components.proTable.toolbarDensity`       |
| tables          | `/showcase/components/pro-table/virtual-infinite`      | ShowcaseComponentsProTableVirtualInfinite      | `router.showcase.components.proTable.virtualInfinite`      |
| tables          | `/showcase/components/pro-table/export-refresh`        | ShowcaseComponentsProTableExportRefresh        | `router.showcase.components.proTable.exportRefresh`        |
| tables          | `/showcase/components/pro-table/cell-rendering`        | ShowcaseComponentsProTableCellRendering        | `router.showcase.components.proTable.cellRendering`        |
| tables          | `/showcase/components/pro-table/form-composition`      | ShowcaseComponentsProTableFormComposition      | `router.showcase.components.proTable.formComposition`      |
| tables          | `/showcase/components/pro-table/api-events`            | ShowcaseComponentsProTableApiEvents            | `router.showcase.components.proTable.apiEvents`            |
| forms           | `/showcase/components/pro-form/overview`               | ShowcaseComponentsProFormOverview              | `router.showcase.components.proForm.overview`              |
| forms           | `/showcase/components/pro-form/basic-schema`           | ShowcaseComponentsProFormBasicSchema           | `router.showcase.components.proForm.basicSchema`           |
| forms           | `/showcase/components/pro-form/grouped-layout`         | ShowcaseComponentsProFormGroupedLayout         | `router.showcase.components.proForm.groupedLayout`         |
| forms           | `/showcase/components/pro-form/validation`             | ShowcaseComponentsProFormValidation            | `router.showcase.components.proForm.validation`            |
| forms           | `/showcase/components/pro-form/dependencies-computed`  | ShowcaseComponentsProFormDependenciesComputed  | `router.showcase.components.proForm.dependenciesComputed`  |
| forms           | `/showcase/components/pro-form/conditional-visibility` | ShowcaseComponentsProFormConditionalVisibility | `router.showcase.components.proForm.conditionalVisibility` |
| forms           | `/showcase/components/pro-form/reactions`              | ShowcaseComponentsProFormReactions             | `router.showcase.components.proForm.reactions`             |
| forms           | `/showcase/components/pro-form/async-data`             | ShowcaseComponentsProFormAsyncData             | `router.showcase.components.proForm.asyncData`             |
| forms           | `/showcase/components/pro-form/field-arrays`           | ShowcaseComponentsProFormFieldArrays           | `router.showcase.components.proForm.fieldArrays`           |
| forms           | `/showcase/components/pro-form/plugins-draft`          | ShowcaseComponentsProFormPluginsDraft          | `router.showcase.components.proForm.pluginsDraft`          |
| forms           | `/showcase/components/pro-form/submit-states`          | ShowcaseComponentsProFormSubmitStates          | `router.showcase.components.proForm.submitStates`          |
| forms           | `/showcase/components/pro-form/api-events`             | ShowcaseComponentsProFormApiEvents             | `router.showcase.components.proForm.apiEvents`             |
| charts          | `/showcase/components/charts/overview`                 | ShowcaseComponentsChartsOverview               | `router.showcase.components.charts.overview`               |
| charts          | `/showcase/components/charts/theme`                    | ShowcaseComponentsChartsTheme                  | `router.showcase.components.charts.theme`                  |
| charts          | `/showcase/components/charts/responsive`               | ShowcaseComponentsChartsResponsive             | `router.showcase.components.charts.responsive`             |
| charts          | `/showcase/components/charts/states`                   | ShowcaseComponentsChartsStates                 | `router.showcase.components.charts.states`                 |
| charts          | `/showcase/components/charts/events`                   | ShowcaseComponentsChartsEvents                 | `router.showcase.components.charts.events`                 |
| charts          | `/showcase/components/charts/dashboard-preview`        | ShowcaseComponentsChartsDashboardPreview       | `router.showcase.components.charts.dashboardPreview`       |
| feedback        | `/showcase/feedback/dialog-toast`                      | ShowcaseFeedbackDialogToast                    | `router.showcase.feedback.dialogToast`                     |
| hooks           | `/showcase/hooks/overview`                             | ShowcaseHooksOverview                          | `router.showcase.hooks.overview`                           |
| hooks           | `/showcase/hooks/theme-switching`                      | ShowcaseHooksThemeSwitching                    | `router.showcase.hooks.themeSwitching`                     |
| hooks           | `/showcase/hooks/locale-switching`                     | ShowcaseHooksLocaleSwitching                   | `router.showcase.hooks.localeSwitching`                    |
| hooks           | `/showcase/hooks/http-flow`                            | ShowcaseHooksHttpFlow                          | `router.showcase.hooks.httpFlow`                           |
| hooks           | `/showcase/hooks/auth-permission`                      | ShowcaseHooksAuthPermission                    | `router.showcase.hooks.authPermission`                     |
| hooks           | `/showcase/hooks/layout-runtime`                       | ShowcaseHooksLayoutRuntime                     | `router.showcase.hooks.layoutRuntime`                      |
| hooks           | `/showcase/hooks/responsive-device`                    | ShowcaseHooksResponsiveDevice                  | `router.showcase.hooks.responsiveDevice`                   |
| utils           | `/showcase/utils/overview`                             | ShowcaseUtilsOverview                          | `router.showcase.utils.overview`                           |
| utils           | `/showcase/utils/date`                                 | ShowcaseUtilsDate                              | `router.showcase.utils.date`                               |
| utils           | `/showcase/utils/safe-storage`                         | ShowcaseUtilsSafeStorage                       | `router.showcase.utils.safeStorage`                        |
| utils           | `/showcase/utils/state-persistence`                    | ShowcaseUtilsStatePersistence                  | `router.showcase.utils.statePersistence`                   |
| runtime         | `/showcase/runtime/overview`                           | ShowcaseRuntimeOverview                        | `router.showcase.runtime.overview`                         |
| runtime         | `/showcase/runtime/http`                               | ShowcaseRuntimeHttp                            | `router.showcase.runtime.http`                             |
| runtime         | `/showcase/runtime/browser-runtime`                    | ShowcaseRuntimeBrowser                         | `router.showcase.runtime.browser`                          |
| runtime         | `/showcase/runtime/layout`                             | ShowcaseRuntimeLayout                          | `router.showcase.runtime.layout`                           |
| runtime         | `/showcase/runtime/state-ownership`                    | ShowcaseRuntimeStateOwnership                  | `router.showcase.runtime.stateOwnership`                   |
| design          | `/showcase/design/tokens`                              | ShowcaseDesignTokens                           | `router.showcase.design.tokens`                            |
| design          | `/showcase/design/unocss`                              | ShowcaseDesignUnocss                           | `router.showcase.design.unocss`                            |
| design          | `/showcase/design/material`                            | ShowcaseDesignMaterial                         | `router.showcase.design.material`                          |
| design          | `/showcase/design/density`                             | ShowcaseDesignDensity                          | `router.showcase.design.density`                           |
| design          | `/showcase/design/motion`                              | ShowcaseDesignMotion                           | `router.showcase.design.motion`                            |
| governance      | `/showcase/governance`                                 | ShowcaseGovernance                             | `router.showcase.governance.root`                          |
| desktopBoundary | `/showcase/desktop-boundary`                           | ShowcaseDesktopBoundary                        | `router.showcase.desktopBoundary.root`                     |

## Counts

| Metric                                                         | Count | Evidence                                                                                         |
| -------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------ |
| Console route records (architecture/runtime/ui/system/desktop) | 23    | `architecture-console.spec.ts` (`EXPECTED_CONSOLE_ROUTE_RECORD_COUNT`)                           |
| Base registered records (non-showcase)                         | 30    | core, dashboard and console route modules plus `constants/router.ts` (error pages and catch-all) |
| Showcase catalog items (leaves)                                | 62    | `showcaseCatalog.length` in `showcaseCatalog.ts`                                                 |
| Showcase route group parents                                   | 7     | `SHOWCASE_ROUTE_GROUPS.length`                                                                   |
| Showcase root record                                           | 1     | `SHOWCASE_ROOT_ROUTE`                                                                            |
| Showcase records total                                         | 70    | 1 root + 7 groups + 62 leaves                                                                    |
| Registered records total                                       | 100   | 30 base + 70 showcase                                                                            |

These match the dynamic assertion in `architecture-console.spec.ts`:
`EXPECTED_REGISTERED_ROUTE_RECORD_COUNT = 30 + showcaseCatalog.length + SHOWCASE_ROUTE_GROUPS.length + 1`.

## E2E / visual coverage

E2E and visual specs under `e2e/**` target the current surface only. Route sections
exercised (by reference count across specs): `/showcase` (heaviest), `/dashboard`,
`/ui`, `/system`, `/runtime`, `/architecture`. The `/desktop` boundary route is not
directly driven by an E2E hash-navigation spec. No spec references any retired
pre-rebuild route path. To re-derive the current coverage:

```bash
grep -rhoE "/(dashboard|architecture|runtime|ui|system|desktop|showcase)(/[a-z0-9-]+)*" e2e/ | sort -u
```

## Provenance

This inventory was rebuilt to the Architecture Console + Showcase surface. The
pre-rebuild "route museum" (a large flat catalog under a single legacy top-level
section) was retired and is no longer a canonical user-facing surface; see
`wiki/canonical/application-boundaries/web-demo-architecture-console.md` and
`wiki/canonical/application-boundaries/web-demo-role.md` for the boundary rationale.
Historical pre-rebuild route counts are preserved in `wiki/log.md`.
