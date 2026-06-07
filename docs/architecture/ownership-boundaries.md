# Ownership and Boundary Authority

CCD uses workspace ownership rather than archive ownership.

## Common platform layer

`common platform layer` is the combined governed package layer under `packages/*`. It is not a synonym for `packages/core`.

`packages/core` remains the minimal runtime-neutral orchestration/facade package and may depend only on `@ccd/contracts`. Shared frontend concerns must land in their owning platform packages (`vue-hooks`, `vue-app-platform`, `vue-ui`, `vue-primevue-adapter`, `vue-charts`, `design-tokens`, or `shared-utils`) rather than being collected in `core`.

## Active owners

| Area                                                                                                      | Owner boundary                                               |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Contracts and public ABI                                                                                  | `packages/contracts`                                         |
| Minimal runtime-neutral adapter facade                                                                    | `packages/core`                                              |
| Pure theme, size, color, breakpoint, and device derivation                                                | `packages/design-tokens`                                     |
| Pure shared utilities                                                                                     | `packages/shared-utils`                                      |
| UnoCSS preset and build-time styling helpers                                                              | `packages/unocss-preset`                                     |
| Shared Vue/browser composables                                                                            | `packages/vue-hooks`                                         |
| Pure app-platform/layout helpers where applicable                                                         | `packages/vue-app-platform`                                  |
| Shared Vue UI primitives                                                                                  | `packages/vue-ui`                                            |
| PrimeVue-specific theme/adaptation layer                                                                  | `packages/vue-primevue-adapter`                              |
| Shared chart runtime and helpers                                                                          | `packages/vue-charts`                                        |
| Browser `web-demo` application shell, routes/views/plugins/stores, app adapters, compatibility facades    | `apps/web-demo`                                              |
| Dedicated Tauri desktop runtime shell, own frontend entry, desktop adapters, `src-tauri` backend boundary | `apps/desktop`                                               |
| Governance                                                                                                | `.ai/**`, `scripts/governance/**`, `scripts/architecture/**` |

## Extraction authority matrix

| Move request                          | Owning destination                                                       | Approval notes                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| DTO/interface/cross-runtime contract  | `packages/contracts`                                                     | Must remain type-only/runtime-neutral.                                                                                    |
| Runtime-neutral adapter orchestration | `packages/core`                                                          | Requires proof that the logic depends only on injected contracts.                                                         |
| Pure generic helper                   | `packages/shared-utils`                                                  | No app/runtime globals.                                                                                                   |
| Vue/browser composable                | `packages/vue-hooks`                                                     | No direct app store/router coupling.                                                                                      |
| Pure app-platform/layout helper       | `packages/vue-app-platform`                                              | App-specific DOM, storage, device, transition, and desktop setup wiring remains in app.                                   |
| CCD UI primitive                      | `packages/vue-ui`                                                        | CCD-owned public API; internal PrimeVue composition is allowed.                                                           |
| PrimeVue theme/config/service adapter | `packages/vue-primevue-adapter`                                          | Raw PrimeVue exposure requires boundary approval.                                                                         |
| App runtime capability                | `apps/*/src/adapters/**` or exact approved app infrastructure exceptions | Do not move browser/Tauri/auth/router/store effects into `contracts` or `core`; do not add broad runtime allowlist globs. |
| Reusable/public monorepo capability   | owning package under `packages/*` via package exports                    | Do not create public shared-capability exports from `apps/*` unless a future explicit owner decision changes the target.  |

## App-local shared candidates

M4 classifies app-local shared-looking paths before any source migration. This classification does not approve indefinite app ownership, and it does not authorize app paths to become public shared-capability export surfaces; it only separates app shell, app adapters, compatibility facades, stores, views, and future migration candidates.

`apps/web-demo` is the browser `web-demo` application shell. `apps/desktop` is a dedicated Tauri desktop runtime shell with its own frontend entry and `apps/desktop/src-tauri/**` backend boundary; it is not a full duplicate of the browser app. Shared components, tokens, hooks, UI primitives, package-level integration adapters, contracts, and runtime-neutral logic belong in governed `packages/*`. App-specific routes, stores, pages/views, plugin wiring, runtime access, and compatibility facades stay app-local.

The app-owned example route/page surface is inventoried in `docs/architecture/example-route-inventory.md`. That inventory maps each `/example/**` route group to its route module, page owner path, and package/runtime boundary.

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
- safeStorage runtime helpers under `apps/web-demo/src/utils/safeStorage/core.ts`, `crypto.ts`, `lzstring.ts`, `piniaSerializer.ts`, `storageMaintenance.ts`, and facade exports

`packages/shared-utils/src/createCapabilityBridge.ts` is the active owner for the pure capability bridge helper. App auth/router/storage capability providers remain app-local.

M5 extraction planning narrows the next source lanes:

- safeStorage: type-only storage contracts are package-owned in `@ccd/contracts`. JSON codec helpers are package-owned in `@ccd/shared-utils`. App pack/unpack orchestration remains app-owned because it composes app crypto, `lz-string`, env, browser storage, logger coupling, and migration behavior.
- D-016 approved app-owned safeStorage crypto/security behavior. Crypto/HMAC/Web Crypto, frontend obfuscation-key resolution, app env access, and logger coupling remain terminal runtime boundaries under `apps/web-demo`. Frontend encryption/obfuscation is client-visible and must not be described as server-grade or secret-grade security.
- D-019 approved app-owned `lz-string` compression. `lz-string` compression, the Pinia serializer, storage maintenance helpers, migration/fallback behavior, browser storage access, and app safeStorage facade exports remain app-owned terminal/runtime boundaries under `apps/web-demo`; they stay out of `@ccd/shared-utils`.
- theme/size/device: pure theme, size, breakpoint, and device derivation is owned by `packages/design-tokens`; `packages/vue-app-platform` owns only pure app-platform/layout helpers where applicable. Browser DOM writes, `style.cssText` mutation, storage persistence, preload reads, device listeners, transitions, desktop root-var setup, Pinia stores, and preloader wiring stay app-owned.
- hooks/facades: `useAutoMitt`, `useDialog`, and `useProTableUrlSync` remain thin app bindings over `packages/vue-hooks` / `packages/vue-ui` primitives and adapter keys.

M6 records the earlier proposed owner-decision packets only. Current active safeStorage ownership is superseded by D-016 and D-019: crypto/security and `lz-string` compression are approved app-owned terminal boundaries, while JSON codec helpers and type-only storage contracts stay package-owned in `@ccd/shared-utils` and `@ccd/contracts`.

M8 establishes the pure size resolver foundation in `packages/design-tokens/src/sizeResolver.ts`. D-025 theme-runtime repair keeps pure theme/size/device derivation in `packages/design-tokens` and removes the browser-coupled theme DOM/storage writer from the `@ccd/vue-app-platform` public API. Web and desktop apps own DOM writes, `style.cssText` mutation, storage persistence, preload reads, browser device collectors/listeners, transitions, desktop root-var setup, and Pinia store integration.

M9 establishes pure device, OS, breakpoint, orientation, and viewport metric resolvers in `packages/design-tokens/src/deviceResolver.ts`. Browser collectors, listener lifecycle, `visualViewport`, rAF/timers, and Pinia state remain app-owned.

M10 establishes pure layout visibility reducer helpers in `packages/vue-app-platform/src/layoutRuntime.ts`. `apps/web-demo/src/stores/modules/system/layout.ts` remains the Pinia owner for persisted preferences, sync, loading counters, mobile drawer runtime state, and app singleton access.

M11 verifies hook/facade convergence without moving production behavior. `useAutoMitt` remains the app event-map binding over `@ccd/vue-hooks/createAutoMittHook`; `useDialog` remains the app i18n/content facade over `@ccd/vue-ui` dialog core; `useProTableUrlSync` remains the app router adapter injected through the `@ccd/vue-ui` adapter key. `proform.ts` and `protable.ts` remain app plugin integration shells that inject app date/storage/router capabilities into package extension points.

M13 repairs the app TypeScript build boundary: `apps/web-demo/tsconfig.json` and `apps/desktop/tsconfig.json` no longer include `../../packages/*/src/**` globs. Apps consume `@ccd/vue-ui` and `@ccd/vue-charts` through workspace package exports and prepared build outputs; `pnpm arch:boundaries` now rejects new app tsconfig package-source includes.

M13a repairs the root theme tooling boundary: `scripts/upgrade-all-themes.mjs` and `scripts/validate-token-contrast.ts` consume pure theme helpers through `@ccd/design-tokens/theme-engine` instead of app theme utility source. `pnpm arch:boundaries` now rejects new `scripts/**` imports from `apps/web-demo/src/utils/theme/**`, `@/utils/theme/**`, or app-local `src/utils/theme/**`.

## PrimeVue Boundary

`packages/vue-primevue-adapter` owns PrimeVue theme, PT, locale, runtime installation, services, and integration adapters. `packages/vue-ui` may internally compose PrimeVue through CCD-owned components and public CCD-owned props/types, but it must not raw re-export PrimeVue components as a loose public bucket.

App bootstrap/plugin code installs PrimeVue through adapter-owned `installPrimeVueRuntime()`. App global shell code consumes adapter facades such as `PrimeVueGlobalToast`, `PrimeVueGlobalConfirmPopup`, `PrimeVueGlobalDynamicDialog`, `usePrimeVueToastService`, `usePrimeVueRuntimeConfig`, locale helpers, and global message helpers instead of raw PrimeVue imports.

Post-P29/P31 current state: the app-side PrimeVue exact allowlist has 0 rows, the `apps/web-demo/src/views/example/components/primevue-collection/**` showcase exception is removed, and `C-06` is closed. Generated/build references are governed separately by their command-owned boundaries, not by app exact allowlist rows.

New app-side raw `primevue/*` or `@primevue/*` imports remain forbidden unless a future explicit owner decision authorizes and classifies an exact exception. Historical M5/M6 notes record the pre-migration state only; P26 through P31 superseded that active status.

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
