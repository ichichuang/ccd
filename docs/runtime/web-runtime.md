# Web Runtime

`apps/web-demo` is the browser runtime surface for CCD.

## Runtime Contract

- Vue 3 + Vite browser application.
- Depends on `@ccd/contracts` and `@ccd/core` through public exports.
- Injects browser runtime capabilities through `apps/web-demo/src/adapters/**`.
- Does not import desktop/Tauri runtime code.

## Adapter Ownership

Browser-only APIs are allowed in:

```text
apps/web-demo/src/adapters/**
```

Current adapter responsibilities:

- browser storage adapter
- browser network adapter
- browser logger adapter

## Validation

```bash
pnpm --filter @ccd/web-demo typecheck
pnpm --filter @ccd/web-demo test
pnpm --filter @ccd/web-demo build
pnpm arch:boundaries
```
