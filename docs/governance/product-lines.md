# Workspace Runtime Policy

CCD no longer models runtime ownership through old delivery branches. Runtime ownership is expressed by workspace packages and apps.

## Current Model

```text
packages/contracts  -> implementation-free type and interface contracts
packages/core       -> runtime-neutral platform logic
apps/web-demo       -> browser runtime adapter shell
apps/desktop        -> Tauri runtime adapter shell
root                -> orchestration-only shell
legacy/root-app     -> read-only historical archive
```

## Dependency Policy

- `packages/contracts` imports no active package code.
- `packages/core` may depend on `@ccd/contracts` only.
- `apps/*` may depend on `@ccd/contracts` and `@ccd/core` through public exports only.
- Apps may not import sibling apps.
- Active packages may not import `legacy/**`.

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
