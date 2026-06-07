# Removed Browser Runtime Archive Checklist

The historical browser runtime archive has been removed from the working tree. This page records the current-state closure criteria that replaced the former archive-retention checklist.

## Current invariants

- `apps/web-demo` owns browser `web-demo` application behavior.
- `apps/desktop` owns the dedicated Tauri desktop runtime shell, desktop adapters, and `src-tauri` backend boundary.
- Shared platform logic lives in workspace packages, not duplicated inside either app.
- Root remains orchestration-only.
- Historical comparison uses Git history and generated governance artifacts, not a working-tree archive.
- No route, package, workspace, CI workflow, or script depends on a removed archive path.

## Validation

Use the repository gates:

```bash
pnpm governance:gate
pnpm validate
pnpm type-check
pnpm test:run
pnpm build:ci
```

Any future need to restore archived code must be proposed as a new governed migration and must not bypass package boundaries.
