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
apps/web-demo               -> runtime shell, routes/views/plugins/stores, app adapters, and app-owned compatibility facades
apps/desktop                -> Tauri runtime shell, app adapters, and compatibility facades
root                        -> orchestration-only shell
```

The core architecture invariant remains `@ccd/contracts -> @ccd/core -> apps/*`.

Frontend shared packages are protected workspace packages. They must still obey their governance role, package exports, and runtime boundary rules. Runtime capabilities belong only in app adapter layers. Root must remain orchestration-only.

Current accepted target definition:

- `apps/*` own runtime shells, app adapters, route/view/plugin/store surfaces, and compatibility facades.
- Reusable or public monorepo capability must land in governed `packages/*` and be consumed through package exports.
- `apps/*` may temporarily host classified app-local candidates, but those classifications do not authorize public shared-capability exports from app paths.
- `packages/core` stays minimal and runtime-neutral; it must not become a shared frontend bucket.

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

| Workspace                       | Current responsibility                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/contracts`            | Cross-runtime interfaces and DTO contracts only.                                                                                              |
| `packages/core`                 | Minimal runtime-neutral adapter facade, not a shared frontend bucket.                                                                         |
| `packages/design-tokens`        | Shared design token source and pure theme/size/breakpoint/device derivation.                                                                  |
| `packages/shared-utils`         | Pure shared utilities.                                                                                                                        |
| `packages/unocss-preset`        | Shared UnoCSS preset, safelist, and build-time styling helpers.                                                                               |
| `packages/vue-hooks`            | Shared Vue/browser composables.                                                                                                               |
| `packages/vue-app-platform`     | Pure app-platform/layout helpers where applicable.                                                                                            |
| `packages/vue-ui`               | Shared Vue UI primitives.                                                                                                                     |
| `packages/vue-primevue-adapter` | PrimeVue-specific theme and adaptation layer.                                                                                                 |
| `packages/vue-charts`           | Shared chart runtime and helpers.                                                                                                             |
| `apps/web-demo`                 | Runtime shell, routes/views/plugins/stores, app adapters, and app-owned compatibility facades. Not a public shared-capability export surface. |
| `apps/desktop`                  | Tauri runtime shell, desktop adapters, and compatibility facades. Not a public shared-capability export surface.                              |

## Extraction Decision Matrix

| Candidate kind                                                              | Destination                                             | Required constraints                                                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Pure DTO, interface, event shape, or cross-runtime contract                 | `packages/contracts`                                    | Type-only/runtime-neutral; no Vue, browser, Node, Tauri, fetch, storage, timers, or implementation policy.                               |
| Runtime-neutral orchestration over injected adapters                        | `packages/core`                                         | Depends only on `@ccd/contracts`; no UI, browser, Node, Tauri, fetch, storage, timers, console, or framework imports.                    |
| Pure synchronous utility or generic helper                                  | `packages/shared-utils`                                 | No app imports, no runtime globals, no Vue lifecycle, no implicit storage/network side effects.                                          |
| Vue/browser composable                                                      | `packages/vue-hooks`                                    | Vue-owned API; browser capability must be injected or guarded; no app store/router coupling.                                             |
| Pure app-platform or layout helper                                          | `packages/vue-app-platform`                             | App-specific router/store/DOM/storage/device/transition/desktop setup decisions stay in app integration code.                            |
| CCD-owned UI primitive or component style surface                           | `packages/vue-ui`                                       | Public API must be CCD-owned props/types; may internally compose PrimeVue; must not raw re-export PrimeVue components as a loose bucket. |
| PrimeVue theme/config/service adaptation                                    | `packages/vue-primevue-adapter`                         | Owns PrimeVue configuration and service helpers; app bootstrap installs it.                                                              |
| Chart runtime/helper surface                                                | `packages/vue-charts`                                   | Chart-specific Vue runtime only; app data/query behavior stays outside.                                                                  |
| App-specific runtime capability, auth, router, store, Tauri, or browser API | `apps/*/src/adapters/**` or approved app infrastructure | Must not move into `contracts`/`core`; inject contracts into shared packages when cross-runtime reuse is required.                       |
| Reusable/public monorepo capability surface                                 | owning package under `packages/*` via package exports   | Do not publish shared capability from `apps/*` unless a future explicit owner decision changes the architecture.                         |

Storage policy follows the same split: cross-runtime storage interfaces live in `packages/contracts`, pure serialization helpers live in `packages/shared-utils`, and browser `localStorage` / `sessionStorage` access stays in app-owned adapters or approved app infrastructure.

M3 runtime boundary policy records approved app infrastructure as exact file/surface exceptions in `.ai/governance/policies/runtime.json`. These entries classify existing debt only; they are not broad directory permissions.

## App-local Shared Candidates

The following paths still belong to `apps/web-demo`, but should be understood as classified app-local surfaces rather than immediate migration targets. Classification does not approve indefinite app ownership, and it does not authorize turning app paths into public shared-capability exports; it records the current role and future owner lane.

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
- `apps/web-demo/src/utils/safeStorage` (app-owned safeStorage runtime facade, browser storage, security/crypto, compression, serializer, storage maintenance, and migration behavior; JSON codec helpers are package-owned by `@ccd/shared-utils`, and type-only storage contracts are package-owned by `@ccd/contracts`)
- `apps/web-demo/src/stores/modules/system/**` (app stores; extract only pure/runtime primitives in future lanes)

`createCapabilityBridge` is already a pure shared utility owned by `packages/shared-utils`; app auth/router capability providers remain app-local adapter/infrastructure code.

M5 extraction planning refines this list without moving source code:

- safeStorage storage contracts are type-only package-owned contracts in `@ccd/contracts`. JSON codec helpers are package-owned in `@ccd/shared-utils`; app pack/unpack orchestration remains app-owned because it composes app crypto, `lz-string`, env, browser storage, logging, and migration behavior.
- D-016 approved app-owned safeStorage crypto/security behavior: Crypto/HMAC/Web Crypto, frontend obfuscation-key resolution, app env access, and logger coupling remain terminal runtime boundaries under `apps/web-demo`. Frontend encryption/obfuscation is client-visible and must not be described as server-grade or secret-grade security.
- D-019 approved app-owned `lz-string` compression. `lz-string` compression, the Pinia serializer, storage maintenance helpers, migration/fallback behavior, browser storage access, and app safeStorage facade exports remain app-owned terminal/runtime boundaries under `apps/web-demo`; they stay out of `@ccd/shared-utils`.
- theme, size, and device split pure theme/size/breakpoint/device derivation into `packages/design-tokens`; `packages/vue-app-platform` owns only pure app-platform/layout helpers where applicable. Browser DOM writes, `style.cssText` mutation, storage persistence, preload reads, device listeners, transitions, desktop root-var setup, and Pinia store wiring remain app-owned.
- `useAutoMitt`, `useDialog`, and `useProTableUrlSync` stay thin app facades over `packages/vue-hooks` / `packages/vue-ui` primitives and adapter keys.

M6 records the earlier proposed decision packets only. Current active safeStorage ownership is superseded by D-016 and D-019: crypto/security and `lz-string` compression are approved app-owned terminal boundaries, while JSON codec helpers and type-only storage contracts stay package-owned in `@ccd/shared-utils` and `@ccd/contracts`.

M8 establishes pure size variable, root-font, layout-dimension, preset fallback, and scoped-content resolver helpers in `packages/design-tokens`. D-025 theme-runtime repair keeps pure theme/size/device derivation in `packages/design-tokens` and removes the browser-coupled theme DOM/storage writer from the `@ccd/vue-app-platform` public API. Browser DOM writes, `style.cssText` mutation, storage persistence, preload reads, device collectors/listeners, transitions, desktop root-var setup, and Pinia store behavior remain app-owned.

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

`packages/vue-primevue-adapter` owns PrimeVue theme, PT, locale, runtime installation, services, and integration adapters. `packages/vue-ui` may internally compose PrimeVue through CCD-owned primitives, but must not expose raw PrimeVue components as a loose public bucket.

App bootstrap/plugin files install PrimeVue through adapter-owned `installPrimeVueRuntime()`, which composes `createPrimeVueAdapterConfig()` and `installPrimeVueServices()`. App global shell files consume adapter facades such as `PrimeVueGlobalToast`, `PrimeVueGlobalConfirmPopup`, `PrimeVueGlobalDynamicDialog`, `usePrimeVueToastService`, `usePrimeVueRuntimeConfig`, locale helpers, and global message helpers instead of raw PrimeVue imports.

Post-P29/P31 current state: the app-side PrimeVue exact allowlist has 0 rows, the `apps/web-demo/src/views/example/components/primevue-collection/**` showcase exception is removed, and `C-06` is closed. Generated/build references are governed separately by their command-owned boundaries, not by app exact allowlist rows.

New app-side raw `primevue/*` or `@primevue/*` imports remain forbidden unless a future explicit owner decision authorizes and classifies an exact exception.

Historical note: M5/M6 recorded that no safe unapproved reduction was available before source migration. P26 through P31 superseded that active status by moving bootstrap, generated registry, global shell, and showcase usage behind governed adapter/UI boundaries.

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
