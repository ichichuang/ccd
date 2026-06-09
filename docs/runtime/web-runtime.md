# Web Runtime

`apps/web-demo` is the browser `web-demo` application shell for CCD. It owns the browser entry, routes, stores, views, app adapters, app-level plugin wiring, and browser compatibility facades.

## Runtime Contract

- Vue 3 + Vite browser `web-demo` application.
- Depends on governed workspace packages through public exports only.
- Current workspace dependencies include `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/unocss-preset`, `@ccd/vue-hooks`, `@ccd/vue-app-platform`, `@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, and `@ccd/vue-charts`.
- TypeScript consumes workspace packages through package exports and prepared `dist` declarations; `apps/web-demo/tsconfig.json` must not include `../../packages/*/src/**`.
- Injects browser runtime capabilities through `apps/web-demo/src/adapters/**`.
- Does not import desktop/Tauri runtime code.
- Shares components, tokens, hooks, UI primitives, package-level adapters, contracts, and runtime-neutral logic through `packages/*`; it must not duplicate those as public app-local capabilities.

## Current Ownership Scope

`apps/web-demo` owns:

- app shell and bootstrap
- routes and views
- stores
- browser adapters
- app-level plugin wiring
- temporary app-local shared candidates that are not yet extracted into workspace packages
- explicitly classified app-local runtime exceptions

Current app-local shared candidates include:

- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/proform.ts`
- `apps/web-demo/src/plugins/modules/protable.ts`
- `apps/web-demo/src/utils/http/**`
- `apps/web-demo/src/utils/theme/engine.ts` (compatibility facade only)
- `apps/web-demo/src/utils/theme/sizeEngine.ts` (compatibility facade; M8 pure size resolvers live in `@ccd/design-tokens`)
- `apps/web-demo/src/utils/theme/mode.ts`
- `apps/web-demo/src/utils/theme/transitions.ts`
- `apps/web-demo/src/utils/deviceSync.ts`
- `apps/web-demo/src/utils/safeStorage`
- `apps/web-demo/src/stores/modules/system/**`

M4 classification separates app shell, app adapters, app stores, app-local compatibility facades, app views, test-only files, and migration candidates. It does not approve indefinite app ownership.

M5 extraction planning keeps runtime behavior unchanged and narrows future source lanes:

- safeStorage: contracts/types and pure codec helpers may move to packages later; browser storage, key/env/logger behavior stays app-owned.
- safeStorage crypto: blocked on owner decision; Web Crypto/fallback implementation must not move to `packages/core` or `packages/contracts`.
- theme/size/device: pure resolvers target `packages/design-tokens`; injected runtime primitives target `packages/vue-app-platform`; browser collectors, preload, persistence, and stores stay app-owned.
- hooks/facades: `useAutoMitt`, `useDialog`, and `useProTableUrlSync` remain thin app facades over package primitives and adapter keys.

M6 adds proposed owner-decision records only. It does not approve source migration; `B-07` remains blocked until an owner approves crypto ownership.

M8 moves/exposes only runtime-neutral size resolver helpers in `@ccd/design-tokens`. `apps/web-demo` still owns size DOM application, preload storage reads, browser device collectors, Pinia state, and cross-window sync.

M9 moves/exposes only runtime-neutral device resolver helpers in `@ccd/design-tokens`. `apps/web-demo` still owns browser collection, listener lifecycle, `visualViewport`, rAF/timers, Pinia state, and resize event emission.

M10 moves/exposes only runtime-neutral layout visibility reducer helpers in `@ccd/vue-app-platform`. `apps/web-demo` still owns Pinia layout state, persistence, `syncAction`, loading counters, mobile drawer runtime state, and app singleton access.

M11 verifies hook/facade convergence without moving production behavior. `useAutoMitt`, `useDialog`, and `useProTableUrlSync` remain app-owned compatibility facades over package primitives or adapter keys, and ProForm/ProTable plugin modules remain app-owned capability injection shells.

M13 removes package source include globs from the app tsconfig. After `pnpm ci:prepare-internal`, web-demo type-check and build consume `@ccd/vue-ui` and `@ccd/vue-charts` through package exports and build outputs.

M13a removes root theme tooling imports from `apps/web-demo/src/utils/theme/**`. Root scripts now consume pure theme generation, color, and contrast helpers through `@ccd/design-tokens/theme-engine`; the app theme utilities remain app-owned compatibility/runtime facades.

## Route Inventory

Current route ownership is app-local under `apps/web-demo/src/router/modules/**`:

- `core.ts`: root redirects, login, and error routes.
- `dashboard.ts`: authenticated dashboard entry routes.
- `example.ts`: example route aggregation boundary.
- `example/**`: split architecture, component, chart, hook, PrimeVue, ProForm, ProTable, system-configuration, utility, store, directive, permission, adapter, infra, and router-meta demonstration route modules.
- `example.spec.ts`: route title/page i18n coverage for the example route surface.

Route modules and their views remain browser-app-owned. New reusable platform behavior must move through governed `packages/*`; app routes must not become public package exports.

## PrimeVue Boundary

Direct PrimeVue imports in `apps/web-demo` are limited to app bootstrap/plugin wiring, app global shell wiring, exact legacy/demo allowlist entries, generated type registry output, and the path-scoped `apps/web-demo/src/views/example/components/primevue-collection/**` showcase exception. New app feature-code direct PrimeVue imports must migrate behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter` or receive an owner-approved exact exception.

M5 found no PrimeVue allowlist row that can be removed safely without source migration. C-06 remains open until future wrapper/source migrations shrink exact app exceptions and the showcase exception.

M6 keeps C-06 open and proposes future one-feature-area-at-a-time reduction before allowlist rows are removed.

## Adapter Ownership

Browser-only APIs are allowed in:

```text
apps/web-demo/src/adapters/**
```

Current adapter responsibilities:

- browser storage adapter
- browser network adapter
- browser logger adapter

## Classified Non-Adapter Runtime Access

M3 does not move runtime source. Existing browser runtime usage outside `apps/web-demo/src/adapters/**` is classified by exact file and surface in `.ai/governance/policies/runtime.json`.

The registered categories include:

- app bootstrap/router/env integration
- app plugins and layout integration
- Pinia stores that still own concrete app state
- app-local compatibility facades such as theme and safeStorage
- app-local shared candidates for M4/M5 extraction
- app views and examples that remain app-only

Any new production runtime surface outside adapter ownership must either move into an adapter or add an exact policy entry with owner, related issue ID, migration target, and revisit lane.

## Root Boundary

The repository root is orchestration-only. It may hold workspace, governance, and tooling configuration, but it must not own browser runtime source files or production browser entrypoints.

## Validation

```bash
pnpm --filter @ccd/web-demo type-check
pnpm --filter @ccd/web-demo test
pnpm --filter @ccd/web-demo build
pnpm arch:runtime
pnpm arch:boundaries
```
