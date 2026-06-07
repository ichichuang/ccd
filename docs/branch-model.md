# Workspace Graph Model

This document replaces the old branch-lane model. CCD runtime ownership now lives in the workspace package graph.

```text
packages/contracts -> packages/core -> apps/*
```

## Active Surfaces

- `packages/contracts`: public interfaces and shared types.
- `packages/core`: runtime-neutral platform logic.
- `apps/web-demo`: browser `web-demo` application shell, routes, stores, views, and browser adapters.
- `apps/desktop`: dedicated Tauri desktop runtime shell with its own frontend entry, desktop adapters, and `src-tauri` backend boundary.
- `root`: orchestration-only shell.
- Historical browser runtime snapshots are retained in Git history only; active branches must not recreate archive runtime directories.

## Validation

```bash
pnpm governance:gate
pnpm build
```
