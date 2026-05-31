# Ownership and Boundary Authority

CCD uses workspace ownership rather than archive ownership.

## Common platform layer

`common platform layer` is the combined governed package layer under `packages/*`. It is not a synonym for `packages/core`.

`packages/core` remains the minimal runtime-neutral orchestration/facade package and may depend only on `@ccd/contracts`. Shared frontend concerns must land in their owning platform packages (`vue-hooks`, `vue-app-platform`, `vue-ui`, `vue-primevue-adapter`, `vue-charts`, `design-tokens`, or `shared-utils`) rather than being collected in `core`.

## Active owners

| Area                                                                  | Owner boundary                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------ |
| Contracts and public ABI                                              | `packages/contracts`                                         |
| Minimal runtime-neutral adapter facade                                | `packages/core`                                              |
| Theme, size, color, breakpoint tokens, and pure size/device resolvers | `packages/design-tokens`                                     |
| Pure shared utilities                                                 | `packages/shared-utils`                                      |
| UnoCSS preset and build-time styling helpers                          | `packages/unocss-preset`                                     |
| Shared Vue/browser composables                                        | `packages/vue-hooks`                                         |
| Frontend app bootstrap and platform orchestration                     | `packages/vue-app-platform`                                  |
| Shared Vue UI primitives                                              | `packages/vue-ui`                                            |
| PrimeVue-specific theme/adaptation layer                              | `packages/vue-primevue-adapter`                              |
| Shared chart runtime and helpers                                      | `packages/vue-charts`                                        |
| Browser app shell, routes, pages, stores, app adapters                | `apps/web-demo`                                              |
| Desktop/Tauri runtime shell and adapters                              | `apps/desktop`                                               |
| Governance                                                            | `.ai/**`, `scripts/governance/**`, `scripts/architecture/**` |

## Extraction authority matrix

| Move request                                  | Owning destination                                                       | Approval notes                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| DTO/interface/cross-runtime contract          | `packages/contracts`                                                     | Must remain type-only/runtime-neutral.                                                                                    |
| Runtime-neutral adapter orchestration         | `packages/core`                                                          | Requires proof that the logic depends only on injected contracts.                                                         |
| Pure generic helper                           | `packages/shared-utils`                                                  | No app/runtime globals.                                                                                                   |
| Vue/browser composable                        | `packages/vue-hooks`                                                     | No direct app store/router coupling.                                                                                      |
| Bootstrap/layout/preloader platform primitive | `packages/vue-app-platform`                                              | App-specific wiring remains in app.                                                                                       |
| CCD UI primitive                              | `packages/vue-ui`                                                        | CCD-owned public API; internal PrimeVue composition is allowed.                                                           |
| PrimeVue theme/config/service adapter         | `packages/vue-primevue-adapter`                                          | Raw PrimeVue exposure requires boundary approval.                                                                         |
| App runtime capability                        | `apps/*/src/adapters/**` or exact approved app infrastructure exceptions | Do not move browser/Tauri/auth/router/store effects into `contracts` or `core`; do not add broad runtime allowlist globs. |

## App-local shared candidates

M4 classifies app-local shared-looking paths before any source migration. This classification does not approve indefinite app ownership; it only separates app shell, app adapters, compatibility facades, stores, views, and future migration candidates.

Current app-local compatibility facades:

- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/safeStorage/index.ts`

Current app-owned integration surfaces:

- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/proform.ts`
- `apps/web-demo/src/plugins/modules/protable.ts`
- `apps/web-demo/src/utils/http/**`
- `apps/web-demo/src/stores/modules/system/**`

Current migration candidates for future source lanes:

- `apps/web-demo/src/utils/theme/sizeEngine.ts` (compatibility facade; M8 pure size resolvers live in `packages/design-tokens`)
- `apps/web-demo/src/utils/theme/mode.ts`
- `apps/web-demo/src/utils/theme/transitions.ts`
- `apps/web-demo/src/utils/theme/lottieThemeUtils.ts`
- pure/helper residue under `apps/web-demo/src/utils/theme/**`
- `apps/web-demo/src/utils/deviceSync.ts`
- pure safeStorage helpers under `apps/web-demo/src/utils/safeStorage/core.ts` and `apps/web-demo/src/utils/safeStorage/lzstring.ts`

`packages/shared-utils/src/createCapabilityBridge.ts` is the active owner for the pure capability bridge helper. App auth/router/storage capability providers remain app-local.

M5 extraction planning narrows the next source lanes:

- safeStorage: type-only storage shapes stay in `packages/contracts`, pure codec/pack/compression helpers target `packages/shared-utils`, and browser storage/key/env/logger behavior stays app-owned.
- safeStorage crypto: `apps/web-demo/src/utils/safeStorage/crypto.ts` is blocked on owner decision; Web Crypto/fallback runtime must not move to `packages/core` or `packages/contracts`.
- theme/size/device: pure token, size, and breakpoint resolvers target `packages/design-tokens`; injected DOM/storage/runtime application primitives target `packages/vue-app-platform`; browser collectors, persistence, Pinia stores, and preloader wiring stay app-owned.
- hooks/facades: `useAutoMitt`, `useDialog`, and `useProTableUrlSync` remain thin app bindings over `packages/vue-hooks` / `packages/vue-ui` primitives and adapter keys.

M6 records proposed owner-decision packets only. It recommends a non-crypto safeStorage codec lane before any crypto movement and leaves `B-07` blocked until an owner approves crypto ownership.

M8 establishes the pure size resolver foundation in `packages/design-tokens/src/sizeResolver.ts`. The web app size facade delegates pure calculation but still owns DOM writes, preload storage reads, browser device collectors, and Pinia store integration.

M9 establishes pure device, OS, breakpoint, orientation, and viewport metric resolvers in `packages/design-tokens/src/deviceResolver.ts`. Browser collectors, listener lifecycle, `visualViewport`, rAF/timers, and Pinia state remain app-owned.

M10 establishes pure layout visibility reducer helpers in `packages/vue-app-platform/src/layoutRuntime.ts`. `apps/web-demo/src/stores/modules/system/layout.ts` remains the Pinia owner for persisted preferences, sync, loading counters, mobile drawer runtime state, and app singleton access.

M11 verifies hook/facade convergence without moving production behavior. `useAutoMitt` remains the app event-map binding over `@ccd/vue-hooks/createAutoMittHook`; `useDialog` remains the app i18n/content facade over `@ccd/vue-ui` dialog core; `useProTableUrlSync` remains the app router adapter injected through the `@ccd/vue-ui` adapter key. `proform.ts` and `protable.ts` remain app plugin integration shells that inject app date/storage/router capabilities into package extension points.

M13 repairs the app TypeScript build boundary: `apps/web-demo/tsconfig.json` and `apps/desktop/tsconfig.json` no longer include `../../packages/*/src/**` globs. Apps consume `@ccd/vue-ui` and `@ccd/vue-charts` through workspace package exports and prepared build outputs; `pnpm arch:boundaries` now rejects new app tsconfig package-source includes.

M13a repairs the root theme tooling boundary: `scripts/upgrade-all-themes.mjs` and `scripts/validate-token-contrast.ts` consume pure theme helpers through `@ccd/design-tokens/theme-engine` instead of app theme utility source. `pnpm arch:boundaries` now rejects new `scripts/**` imports from `apps/web-demo/src/utils/theme/**`, `@/utils/theme/**`, or app-local `src/utils/theme/**`.

## PrimeVue Boundary

`packages/vue-primevue-adapter` owns PrimeVue theme, PT, locale, services, and integration adapters. `packages/vue-ui` may internally compose PrimeVue through CCD-owned components and public CCD-owned props/types, but it must not raw re-export PrimeVue components as a loose public bucket.

App-side direct PrimeVue imports are limited to app plugin/bootstrap wiring, app global shell wiring, exact legacy/demo allowlist entries, generated type registry output, and the path-scoped `apps/web-demo/src/views/example/components/primevue-collection/**` showcase exception. New direct PrimeVue imports in app feature code require migration behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter` or an owner-approved exact exception.

M5 found no PrimeVue allowlist row that can be removed safely without source migration. Future reductions must first migrate exact legacy/demo imports, wrapper gaps, generated registry ownership, and showcase usage behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter`.

M6 keeps `C-06` open and proposes reducing PrimeVue allowlists only through a future one-feature-area-at-a-time lane. Proposed policy is not approval to edit imports or allowlists.

## Runtime Exception Authority

`.ai/governance/policies/runtime.json` is the source of truth for runtime package classes, adapter path allowances, and exact app-local runtime exceptions.

M3 classified existing browser runtime access without moving source. A runtime exception must name the file, runtime surface, classification, related issue IDs, migration target, and revisit lane. New unclassified production runtime access fails `pnpm arch:runtime`.

## Do not move yet

- `packages/core/src/index.ts`
- `apps/web-demo/src/main.ts`
- `apps/web-demo/src/plugins/**`
- `apps/web-demo/src/router/**`
- `apps/web-demo/src/stores/**`
- `apps/web-demo/src/views/**`
- `apps/web-demo/src/utils/date/dateUtils.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- app-local compatibility facades that inject router/store/i18n/browser capabilities into governed packages

## Removed archive policy

The former browser runtime archive is not an active owner boundary and is not present in the working tree. Historical explanations may reference the migration, but active implementation, CI, scripts, and package graphs must use current workspace owners only.
