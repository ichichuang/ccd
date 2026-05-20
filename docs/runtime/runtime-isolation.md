# Runtime Isolation

CCD enforces runtime isolation through workspace package boundaries and adapter injection.

## Active Runtime Surfaces

```text
packages/contracts  -> no runtime access
packages/core       -> no runtime access
apps/web-demo       -> single browser runtime source of truth; browser runtime in adapters only
apps/desktop        -> Tauri runtime in adapters only
root                -> orchestration-only shell
```

## Core Runtime-Neutrality

`packages/contracts` and `packages/core` must not access:

- browser globals: `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `fetch`, `XMLHttpRequest`
- Node globals/builtins: `process`, `fs`, `path`
- runtime side effects: `console`, timers, direct `crypto`
- Tauri APIs or `invoke()`

Validation:

```bash
pnpm arch:runtime
```

## Adapter Boundaries

Runtime access is allowed only in app adapter layers:

```text
apps/web-demo/src/adapters/**
apps/desktop/src/adapters/**
```

Rules:

- Browser storage/network/logger implementations stay in web adapters.
- Tauri imports and `invoke()` stay in desktop adapters.
- Adapters translate runtime capability to contracts; they do not own business workflows.

## Import Boundaries

Validation:

```bash
pnpm arch:boundaries
```

This blocks:

- circular dependencies
- app-to-app imports
- core-to-app imports
- deep package imports
- imports from removed runtime archive paths
- Tauri imports outside desktop adapters

## Deterministic Runtime Commands

```bash
pnpm install --frozen-lockfile
pnpm governance:gate
pnpm typecheck
pnpm test
pnpm build
```
