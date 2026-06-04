# M1-T01 Route Type Consumer Map

## Status

Task status: `DONE`

This is a read-only audit. No source implementation files were changed.

## Search Scope

Searched route/menu/access ambient globals and helper consumers under `apps/**` and `packages/**`, excluding `dist` and `node_modules`.

Evidence:

- `command-logs/m1-route-type-rg-full.log`
- `command-logs/m1-route-type-counts.log`
- `command-logs/m1-route-type-file-summary.log`
- `command-logs/m1-route-helper-rg.log`
- `command-logs/m1-vue-router-runtime-imports.log`
- `command-logs/m1-route-meta-fields-rg.log`

## Ambient Type Definitions

Primary app-owned definition file:

- `apps/web-demo/src/types/modules/router.d.ts`

Definitions found:

- `AppRouteMeta`
- Vue Router `RouteMeta` module augmentation
- `RouteConfig`
- `BackendRouteConfig`
- `RouteModule`
- `MenuItem`
- `TabItem`
- `BreadcrumbItem`
- `RouteUtils`
- `DynamicRouteManager`

## Consumer Groups

| Group | Files | Symbols | Ownership conclusion |
| --- | --- | --- | --- |
| Static route declarations | `apps/web-demo/src/router/modules/core.ts`, `dashboard.ts`, `example.ts`, `apps/web-demo/src/router/index.ts` | `RouteConfig`, `RouteModule` | App-owned route table/runtime; should compose contracts but remain local. |
| Route transform/runtime utilities | `apps/web-demo/src/router/utils/transform.ts`, `dynamic.ts`, `helper.ts`, `guards.ts`, `menu.ts`, `accessControl.ts` | `RouteConfig`, `BackendRouteConfig`, `MenuItem`, `RouteUtils`, `DynamicRouteManager` | Mixed: pure access/menu contracts are candidates; router singleton/dynamic/view/runtime glue remains app-owned. |
| Permission store and tabs | `apps/web-demo/src/stores/modules/session/permission.ts`, `.spec.ts`, `apps/web-demo/src/hooks/layout/useAdminTabs.ts` | `RouteConfig`, `BackendRouteConfig`, `MenuItem`, `TabItem` | App-owned Pinia/runtime state; only type imports should be contractized. |
| API/DTO route payloads | `apps/web-demo/src/types/dto/system.dto.ts`, `apps/web-demo/src/adapters/http.adapter.ts`, `apps/web-demo/src/hooks/modules/usePermissionRoutes.ts` | `BackendRouteConfig` | Good candidate for a type-only backend route contract; Zod schema/runtime stays app-owned. |
| Router capability bridge | `apps/web-demo/src/infra/router/routeProvider.ts`, `.spec.ts` | `RouteConfig`, `MenuItem` | App bridge remains app-owned; return types can reference explicit contracts. |
| Example/docs surfaces | `apps/web-demo/src/views/example/**` | `BackendRouteConfig`, `MenuItem`, `TabItem` | Example consumers should follow contract import changes if app route types change. |
| Generated/auto-import types | `apps/web-demo/src/types/auto-imports.d.ts`, `components.d.ts` | Vue Router auto-import types | Generated-owned; do not manually edit. |

## False Positives

- `packages/vue-primevue-adapter/src/menuTypes.ts` contains `PrimeVueMenuItem` and `MenuItem as PrimeVueMenuItem` from `primevue/menuitem`. This is not the app ambient `MenuItem` contract and should not be treated as a route/menu global consumer.

## Contract Extraction Implications

Safe type-only candidates for `@ccd/contracts`:

- `RouteAccessMeta`: `roles?: string[]`, `auths?: string[]`
- `MenuAccessItem`: `roles?: string[]`, `auths?: string[]`, recursive `children?: MenuAccessItem[]`
- `SafeRedirectResult`: `path: string`, `query: Record<string, string>`
- `BackendRouteContract`: backend dynamic route payload shape without Vue Router runtime imports
- `RouteMenuNode`: generic menu tree item shape if it does not require Vue Router `RouteMeta`

Must remain app-owned:

- Vue Router module augmentation.
- `RouteConfig` if it extends/imports `RouteRecordRaw`.
- Route table files and view loaders.
- Router singleton helpers and dynamic route manager runtime.
- Pinia permission store and tab state.
- Breadcrumb app behavior tied to route matched state.

## Acceptance Criteria

- Every requested ambient route type family has current consumer evidence: PASS.
- Public reusable contracts are distinguishable from app-only runtime/view/router/store contracts: PASS.
- M1 implementation can proceed only after source-change approval for the dirty workspace: BLOCKED by `B-M0-001`.
