# Architecture Contract

## Package Topology

```text
packages/contracts          -> interfaces and shared types only
packages/core               -> minimal runtime-neutral adapter facade
packages/design-tokens      -> design token source
packages/shared-utils       -> pure shared utilities
packages/unocss-preset      -> shared UnoCSS preset
packages/vue-hooks          -> shared Vue/browser composables
packages/vue-app-platform   -> frontend app bootstrap and platform orchestration primitives
packages/vue-ui             -> shared Vue UI primitives
packages/vue-primevue-adapter -> PrimeVue-specific theme/adaptation layer
packages/vue-charts         -> shared chart runtime and helpers
apps/web-demo               -> app shell, routes, pages, stores, app adapters, and temporary app-local shared candidates
apps/desktop                -> Tauri shell and desktop adapter
root                        -> orchestration-only shell
```

The core architecture invariant remains `@ccd/contracts -> @ccd/core -> apps/*`.

Frontend shared packages are protected workspace packages. They must still obey their governance role, package exports, and runtime boundary rules. Runtime capabilities belong only in app adapter layers. Root must remain orchestration-only.

## Common Platform Layer Terminology

`common platform layer` means the governed platform package set under `packages/*`; it does not mean that shared code should move into `packages/core`.

Current platform package set:

- `packages/contracts`
- `packages/core`
- `packages/design-tokens`
- `packages/shared-utils`
- `packages/unocss-preset`
- `packages/vue-hooks`
- `packages/vue-app-platform`
- `packages/vue-ui`
- `packages/vue-primevue-adapter`
- `packages/vue-charts`

`packages/core` is only the minimal runtime-neutral orchestration/facade package in that platform layer. It is not a frontend shared bucket, UI package, HTTP implementation package, browser utility package, or app runtime package.

## Responsibility Matrix

| Workspace                       | Current responsibility                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `packages/contracts`            | Cross-runtime interfaces and DTO contracts only.                                                       |
| `packages/core`                 | Minimal runtime-neutral adapter facade, not a shared frontend bucket.                                  |
| `packages/design-tokens`        | Shared design token source and theme/size/breakpoint primitives, including pure size/device resolvers. |
| `packages/shared-utils`         | Pure shared utilities.                                                                                 |
| `packages/unocss-preset`        | Shared UnoCSS preset, safelist, and build-time styling helpers.                                        |
| `packages/vue-hooks`            | Shared Vue/browser composables.                                                                        |
| `packages/vue-app-platform`     | Shared frontend app bootstrap lifecycle and platform orchestration primitives.                         |
| `packages/vue-ui`               | Shared Vue UI primitives.                                                                              |
| `packages/vue-primevue-adapter` | PrimeVue-specific theme and adaptation layer.                                                          |
| `packages/vue-charts`           | Shared chart runtime and helpers.                                                                      |
| `apps/web-demo`                 | App shell, routes, pages, stores, app adapters, and temporary app-local shared candidates.             |
| `apps/desktop`                  | Tauri shell and desktop adapter.                                                                       |

## Extraction Decision Matrix

| Candidate kind                                                              | Destination                                             | Required constraints                                                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Pure DTO, interface, event shape, or cross-runtime contract                 | `packages/contracts`                                    | Type-only/runtime-neutral; no Vue, browser, Node, Tauri, fetch, storage, timers, or implementation policy.                               |
| Runtime-neutral orchestration over injected adapters                        | `packages/core`                                         | Depends only on `@ccd/contracts`; no UI, browser, Node, Tauri, fetch, storage, timers, console, or framework imports.                    |
| Pure synchronous utility or generic helper                                  | `packages/shared-utils`                                 | No app imports, no runtime globals, no Vue lifecycle, no implicit storage/network side effects.                                          |
| Vue/browser composable                                                      | `packages/vue-hooks`                                    | Vue-owned API; browser capability must be injected or guarded; no app store/router coupling.                                             |
| App bootstrap, preloader, route-loading, or shell lifecycle primitive       | `packages/vue-app-platform`                             | Framework-level Vue runtime only; app-specific router/store/DOM decisions stay in app integration code.                                  |
| CCD-owned UI primitive or component style surface                           | `packages/vue-ui`                                       | Public API must be CCD-owned props/types; may internally compose PrimeVue; must not raw re-export PrimeVue components as a loose bucket. |
| PrimeVue theme/config/service adaptation                                    | `packages/vue-primevue-adapter`                         | Owns PrimeVue configuration and service helpers; app bootstrap installs it.                                                              |
| Chart runtime/helper surface                                                | `packages/vue-charts`                                   | Chart-specific Vue runtime only; app data/query behavior stays outside.                                                                  |
| App-specific runtime capability, auth, router, store, Tauri, or browser API | `apps/*/src/adapters/**` or approved app infrastructure | Must not move into `contracts`/`core`; inject contracts into shared packages when cross-runtime reuse is required.                       |

Storage policy follows the same split: cross-runtime storage interfaces live in `packages/contracts`, pure serialization helpers live in `packages/shared-utils`, and browser `localStorage` / `sessionStorage` access stays in app-owned adapters or approved app infrastructure.

M3 runtime boundary policy records approved app infrastructure as exact file/surface exceptions in `.ai/governance/policies/runtime.json`. These entries classify existing debt only; they are not broad directory permissions.

## App-local Shared Candidates

The following paths still belong to `apps/web-demo`, but should be understood as classified app-local surfaces rather than immediate migration targets. Classification does not approve indefinite app ownership; it records the current role and future owner lane.

- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/proform.ts`
- `apps/web-demo/src/plugins/modules/protable.ts`
- `apps/web-demo/src/utils/http/**` (app HTTP infrastructure; runtime migration is not approved)
- `apps/web-demo/src/utils/theme/engine.ts` (compatibility facade only)
- `apps/web-demo/src/utils/theme/sizeEngine.ts` (compatibility facade; M8 pure size resolvers live in `packages/design-tokens`)
- `apps/web-demo/src/utils/theme/mode.ts` and `apps/web-demo/src/utils/theme/transitions.ts` (M5 migration candidates)
- pure/helper residue under `apps/web-demo/src/utils/theme/**` (target `packages/design-tokens` or stale-doc cleanup)
- `apps/web-demo/src/utils/deviceSync.ts` (M5 migration candidate)
- `apps/web-demo/src/utils/safeStorage` (browser adapter and compatibility helpers only; pure codec/compression helpers belong in `packages/shared-utils` if reused)
- `apps/web-demo/src/stores/modules/system/**` (app stores; extract only pure/runtime primitives in future lanes)

`createCapabilityBridge` is already a pure shared utility owned by `packages/shared-utils`; app auth/router capability providers remain app-local adapter/infrastructure code.

M5 extraction planning refines this list without moving source code:

- safeStorage storage contracts are type-only `packages/contracts` candidates; pure codec/pack/compression helpers target `packages/shared-utils`; browser storage, key resolution, env defaults, and logging remain app-owned.
- safeStorage crypto remains blocked on owner decision. Web Crypto/fallback runtime must not move to `packages/core` or `packages/contracts`.
- theme, size, and device should split pure token/size/breakpoint resolvers into `packages/design-tokens`, injected DOM/storage/runtime primitives into `packages/vue-app-platform`, and concrete browser collectors, persistence, preload, and Pinia store wiring into `apps/web-demo`.
- `useAutoMitt`, `useDialog`, and `useProTableUrlSync` stay thin app facades over `packages/vue-hooks` / `packages/vue-ui` primitives and adapter keys.

M6 records proposed decision packets only. `B-07` remains blocked until owner approval, and the proposed safeStorage sequence extracts non-crypto codec helpers before any crypto ownership change.

M8 establishes pure size variable, root-font, layout-dimension, preset fallback, and scoped-content resolver helpers in `packages/design-tokens`. Browser DOM writes, preload storage reads, device collectors, and Pinia store behavior remain app-owned.

M9 establishes pure device, OS, breakpoint, orientation, and viewport metric resolver helpers in `packages/design-tokens`. Browser collectors, listener lifecycle, `visualViewport`, rAF/timers, and Pinia state remain app-owned.

M10 establishes pure layout visibility reducer helpers in `packages/vue-app-platform`. `apps/web-demo/src/stores/modules/system/layout.ts` remains the Pinia owner for persisted preferences, sync, loading counters, mobile drawer runtime state, and app singleton access.

M11 verifies hook/facade convergence without moving production behavior. `useAutoMitt`, `useDialog`, and `useProTableUrlSync` remain app compatibility facades because they bind the app event map, app i18n defaults, and app router query semantics respectively. ProForm and ProTable plugin modules remain app integration shells that inject app capabilities into `@ccd/vue-ui`.

## Do Not Move Yet

These areas should remain untouched by the Phase 1 clarity pass:

- `packages/core/src/index.ts`
- `apps/web-demo/src/main.ts`
- `apps/web-demo/src/plugins/**`
- `apps/web-demo/src/router/**`
- `apps/web-demo/src/stores/**`
- `apps/web-demo/src/views/**`
- `apps/web-demo/src/utils/date/dateUtils.ts`
- app-local compatibility facades and runtime adapters that inject browser/storage/router/store capabilities
- new package topology such as `packages/vue-pro-components` unless an owner approves the package split, export policy, migration scope, and validation budget

## PrimeVue Boundary

`packages/vue-primevue-adapter` owns PrimeVue theme, PT, locale, and service helpers. `packages/vue-ui` may internally compose PrimeVue through CCD-owned primitives, but must not expose raw PrimeVue components as a loose public bucket.

App bootstrap/plugin files may install PrimeVue through `createPrimeVueAdapterConfig()` and `installPrimeVueServices()`. App global shell files may host Toast, ConfirmPopup, DynamicDialog, `useToast`, and `usePrimeVue` only for app-wide global UI behavior.

`apps/web-demo/src/views/example/components/primevue-collection/**` is the only path-scoped showcase exception for direct PrimeVue imports. Other app direct PrimeVue imports must remain exact allowlist entries or migrate behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter`. New app feature-code direct imports are forbidden unless explicitly classified and approved.

M5 found 0 PrimeVue allowlist rows removable without source migration. C-06 remains open until wrapper/source migrations can shrink exact legacy/demo entries, generated registry use, global shell/plugin exceptions, and the showcase exception.

M6 keeps C-06 open and proposes a future one-feature-area-at-a-time PrimeVue reduction lane. Proposed decision entries are not approval to edit allowlists or imports.

## Dependency Direction

Fixed direction:

```text
@ccd/contracts -> @ccd/core -> apps/*
```

Reverse dependencies and cross-layer runtime leaks are forbidden.

## Runtime Restrictions

`packages/contracts` and `packages/core` must remain strictly free of:

- browser globals
- Node builtins
- Tauri imports
- `fetch`
- `console`
- `crypto`
- storage globals
- timer globals

Runtime capabilities must be injected through contracts.

`packages/design-tokens` and `packages/shared-utils` remain runtime-neutral package classes. Existing diagnostics/test-reset runtime references are classified as violation candidates for future cleanup, not as package-level runtime permission.

## Adapter Boundary

Runtime access should be owned by:

- `apps/web-demo/src/adapters/**`
- `apps/desktop/src/adapters/**`

Adapters are translation layers and must not become business-rule centers.

Current browser runtime debt outside adapters is governed by exact exceptions in `.ai/governance/policies/runtime.json`; new unclassified production runtime access fails `pnpm arch:runtime`. M3 did not migrate hooks, stores, utils, views, or package runtime source.

## TypeScript Config Rule

Do not add global `@ccd/*` paths to `tsconfig.base.json`.

This repository depends on package boundaries, workspace resolution, and build outputs. Global path aliases mask dependency truth and can invalidate architecture and build assumptions.

App tsconfigs must not include `../../packages/*/src/**` package source globs. M13 enforces this through `pnpm arch:boundaries`; dependent app type-checks must consume package declarations from workspace package exports after `pnpm ci:prepare-internal`.

Root tooling scripts must not import `apps/web-demo/src/utils/theme/**`, `@/utils/theme/**`, or app-local `src/utils/theme/**` utilities. M13a enforces this through `pnpm arch:boundaries`; theme tooling should use `@ccd/design-tokens` or `@ccd/design-tokens/theme-engine` public exports.

## Internal Package Build Rule

Internal workspace packages are consumed through build outputs, not raw source imports.

Typical outputs:

- `dist/index.js`
- `dist/index.d.ts`

Run this before dependent app builds:

```bash
pnpm ci:prepare-internal
```
