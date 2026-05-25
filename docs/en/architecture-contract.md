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

## App-local Shared Candidates

The following paths still belong to `apps/web-demo`, but should be understood as app-local shared candidates rather than immediate migration targets:

- `apps/web-demo/src/components/PrimeDialog`
- `apps/web-demo/src/components/ProForm`
- `apps/web-demo/src/components/ProTable`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/infra/shared/createCapabilityBridge.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/safeStorage`

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
