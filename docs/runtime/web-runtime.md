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

P2A extraction closure keeps runtime behavior unchanged and narrows future source lanes:

- safeStorage: type-only storage contracts are package-owned in `@ccd/contracts`; JSON codec helpers are package-owned in `@ccd/shared-utils`; browser storage, key/env/logger behavior stays app-owned.
- safeStorage crypto/compression: D-016 and D-019 keep Crypto/HMAC/Web Crypto, frontend obfuscation-key resolution, `lz-string`, Pinia serializer behavior, browser storage, migration/fallback behavior, and app safeStorage facade exports under `apps/web-demo/src/utils/safeStorage/**`; they must not move to `packages/core`, `packages/contracts`, or `@ccd/shared-utils`.
- theme/size/device: pure resolvers target `packages/design-tokens`; injected runtime primitives target `packages/vue-app-platform`; browser collectors, preload, persistence, and stores stay app-owned.
- hooks/facades: `useAutoMitt`, `useDialog`, and `useProTableUrlSync` remain thin app facades over package primitives and adapter keys.

M6 owner-decision notes are superseded for safeStorage by D-016 and D-019. They do not authorize source migration outside the owner lanes above.

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

`packages/vue-primevue-adapter` owns PrimeVue theme, PT, locale, runtime installation, services, and integration adapters. App bootstrap/plugin files install PrimeVue through `installPrimeVueRuntime()` and consume adapter facades rather than raw PrimeVue imports.

Post-P29/P31 current state: the app-side PrimeVue exact allowlist has 0 rows, the previous `apps/web-demo/src/views/example/components/primevue-collection/**` showcase exception is removed, and `C-06` is closed.

New app feature-code direct `primevue/*` or `@primevue/*` imports must migrate behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter` or receive an owner-approved exact exception.

## Adapter Ownership

Browser-only APIs are allowed in:

```text
apps/web-demo/src/adapters/**
```

Current adapter responsibilities:

- browser storage adapter
- browser network adapter
- browser logger adapter

## Governed App Infrastructure Exceptions

Some app-owned runtime infrastructure intentionally remains outside `src/adapters/**` because it binds app policy, stores, router, i18n, or browser-first-paint behavior. These are not shared package candidates unless a future owner decision changes the lane:

| Boundary                                                                                                 | Owner           | Reason                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web-demo/src/utils/http/**`                                                                        | `apps/web-demo` | Alova instance, interceptors, auth refresh, retry/cache/dedup, notification policy, and app Zod validation are app policy. Type-only HTTP contracts remain in `@ccd/contracts`. |
| `apps/web-demo/src/utils/safeStorage/**`                                                                 | `apps/web-demo` | Crypto/HMAC/Web Crypto, `lz-string`, browser storage, obfuscation-key resolution, serializer, maintenance, and migration behavior are app terminal runtime boundaries.          |
| `apps/web-demo/src/plugins/**`                                                                           | `apps/web-demo` | Plugin wiring injects app date/storage/router/store/i18n capabilities into package extension points.                                                                            |
| `apps/web-demo/src/router/**` and `apps/web-demo/src/stores/**`                                          | `apps/web-demo` | Routes and Pinia stores own concrete app navigation and state behavior. Extract only pure helpers through a future package lane.                                                |
| `apps/web-demo/src/utils/theme/engine.ts`, `mode.ts`, `transitions.ts`, `sizeEngine.ts`, `deviceSync.ts` | `apps/web-demo` | DOM writes, preload storage reads, device collection, transitions, and store coupling remain app-owned; pure resolvers are already in `@ccd/design-tokens`.                     |

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
