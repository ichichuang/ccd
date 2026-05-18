# Workspace Graph Model

This document replaces the old branch-lane model. CCD runtime ownership now lives in the workspace package graph.

```text
packages/contracts -> packages/core -> apps/*
```

## Active Surfaces

- `packages/contracts`: public interfaces and shared types.
- `packages/core`: runtime-neutral platform logic.
- `apps/web-demo`: browser runtime adapters.
- `apps/desktop`: Tauri runtime adapters.
- `legacy/root-app`: archived historical archived application, excluded from active graphs.

## Validation

```bash
pnpm governance:gate
pnpm build
```
