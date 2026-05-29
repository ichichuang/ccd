# Architecture Contract

## Package Topology

```text
packages/contracts          -> interfaces and shared types only
packages/core               -> minimal runtime-neutral adapter facade
packages/design-tokens      -> design token source
packages/shared-utils       -> pure shared utilities
packages/unocss-preset      -> shared UnoCSS preset
packages/vue-hooks          -> shared Vue/browser composables
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

| Workspace                       | Current responsibility                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `packages/contracts`            | Cross-runtime interfaces and DTO contracts only.                                           |
| `packages/core`                 | Minimal runtime-neutral adapter facade, not a shared frontend bucket.                      |
| `packages/shared-utils`         | Pure shared utilities.                                                                     |
| `packages/vue-hooks`            | Shared Vue/browser composables.                                                            |
| `packages/vue-ui`               | Shared Vue UI primitives.                                                                  |
| `packages/vue-primevue-adapter` | PrimeVue-specific theme and adaptation layer.                                              |
| `packages/vue-charts`           | Shared chart runtime and helpers.                                                          |
| `apps/web-demo`                 | App shell, routes, pages, stores, app adapters, and temporary app-local shared candidates. |
| `apps/desktop`                  | Tauri shell and desktop adapter.                                                           |

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

## App-local Shared Candidates

The following paths still belong to `apps/web-demo`, but should be understood as app-local shared candidates rather than immediate migration targets:

- `apps/web-demo/src/components/PrimeDialog`
- `apps/web-demo/src/components/ProForm`
- `apps/web-demo/src/components/ProTable`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/safeStorage`

`createCapabilityBridge` is already a pure shared utility owned by `packages/shared-utils`; app auth/router capability providers remain app-local adapter/infrastructure code.

## Do Not Move Yet

These areas should remain untouched by the Phase 1 clarity pass:

- `packages/core/src/index.ts`
- `apps/web-demo/src/main.ts`
- `apps/web-demo/src/plugins/**`
- `apps/web-demo/src/router/**`
- `apps/web-demo/src/stores/**`
- `apps/web-demo/src/views/**`
- `apps/web-demo/src/utils/date/dateUtils.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/components/ProForm/**`
- `apps/web-demo/src/components/ProTable/**`

## Dependency Direction

Fixed direction:

```text
@ccd/contracts -> @ccd/core -> apps/*
```

Reverse dependencies and cross-layer runtime leaks are forbidden.

## Runtime Restrictions

`packages/contracts` and `packages/core` must remain free of:

- browser globals
- Node builtins
- Tauri imports
- `fetch`
- `console`
- `crypto`
- storage globals
- timer globals

Runtime capabilities must be injected through contracts.

## Adapter Boundary

Runtime access is only allowed in:

- `apps/web-demo/src/adapters/**`
- `apps/desktop/src/adapters/**`

Adapters are translation layers and must not become business-rule centers.

## TypeScript Config Rule

Do not add global `@ccd/*` paths to `tsconfig.base.json`.

This repository depends on package boundaries, workspace resolution, and build outputs. Global path aliases mask dependency truth and can invalidate architecture and build assumptions.

## Internal Package Build Rule

Internal workspace packages are consumed through build outputs, not raw source imports.

Typical outputs:

- `dist/index.js`
- `dist/index.d.ts`

Run this before dependent app builds:

```bash
pnpm ci:prepare-internal
```
