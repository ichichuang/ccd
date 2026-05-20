# Architecture Contract

## Package Topology

```text
packages/contracts  -> interfaces and shared types only
packages/core       -> runtime-neutral platform logic
apps/web-demo       -> single browser runtime source of truth
apps/desktop        -> Tauri runtime shell and adapters
root                -> orchestration-only shell
```

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
