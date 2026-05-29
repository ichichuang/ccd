# Web Runtime

`apps/web-demo` is the browser runtime surface for CCD and the single browser runtime source of truth.

## Runtime Contract

- Vue 3 + Vite browser application.
- Depends on governed workspace packages through public exports only.
- Current workspace dependencies include `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/unocss-preset`, `@ccd/vue-hooks`, `@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, and `@ccd/vue-charts`.
- Injects browser runtime capabilities through `apps/web-demo/src/adapters/**`.
- Does not import desktop/Tauri runtime code.

## Current Ownership Scope

`apps/web-demo` owns:

- app shell and bootstrap
- routes and views
- stores
- browser adapters
- temporary app-local shared candidates that are not yet extracted into workspace packages

Current app-local shared candidates include:

- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/utils/theme/engine.ts` (compatibility facade only)
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/safeStorage`

## Adapter Ownership

Browser-only APIs are allowed in:

```text
apps/web-demo/src/adapters/**
```

Current adapter responsibilities:

- browser storage adapter
- browser network adapter
- browser logger adapter

## Root Boundary

The repository root is orchestration-only. It may hold workspace, governance, and tooling configuration, but it must not own browser runtime source files or production browser entrypoints.

## Validation

```bash
pnpm --filter @ccd/web-demo type-check
pnpm --filter @ccd/web-demo test
pnpm --filter @ccd/web-demo build
pnpm arch:boundaries
```
