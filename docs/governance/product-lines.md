# Workspace Runtime Policy

CCD no longer models runtime ownership through old delivery branches. Runtime ownership is expressed by workspace packages and apps.

## Current Model

```text
packages/contracts  -> cross-runtime interfaces and DTO contracts only
packages/core       -> minimal runtime-neutral adapter facade
packages/shared-utils -> pure shared utilities
packages/vue-hooks  -> shared Vue/browser composables
packages/vue-ui     -> shared Vue UI primitives
packages/vue-primevue-adapter -> PrimeVue-specific theme/adaptation layer
packages/vue-charts -> shared chart runtime and helpers
apps/web-demo       -> browser web-demo application shell, routes, stores, views, and app adapters
apps/desktop        -> dedicated Tauri desktop runtime shell with own frontend entry and src-tauri backend boundary
root                -> orchestration-only shell
```

## Dependency Policy

- `packages/contracts` imports no active package code.
- `packages/core` may depend on `@ccd/contracts` only.
- `apps/*` may depend only on the workspace packages explicitly declared by `.ai/governance/policies/topology.json`.
- `apps/web-demo` currently consumes `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/unocss-preset`, `@ccd/vue-hooks`, `@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, and `@ccd/vue-charts`.
- Shared components, tokens, hooks, UI primitives, package-level adapters, contracts, and runtime-neutral logic belong in `packages/*`.
- App-specific routes, stores, pages/views, plugin wiring, runtime access, and compatibility facades stay app-local.
- Apps may not import sibling apps.
- Active packages may not import removed runtime archive paths.

## Runtime Policy

- Browser APIs belong in `apps/web-demo/src/adapters/**`.
- Tauri APIs and `invoke()` belong in `apps/desktop/src/adapters/**`.
- Shared runtime capabilities must be represented as contracts and injected.
- Adapter modules must remain thin runtime translation layers.
- Root must not contain active runtime source code.

## Validation

```bash
pnpm arch:boundaries
pnpm arch:runtime
pnpm api:report
pnpm supply:check
```
