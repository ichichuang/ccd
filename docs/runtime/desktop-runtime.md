# Desktop Runtime

`apps/desktop` is the Tauri v2 runtime surface for CCD.

## Runtime Contract

- Vue 3 + Vite application running inside Tauri WebView.
- Depends on `@ccd/contracts` and `@ccd/core` through public exports.
- Encapsulates all Tauri APIs in `apps/desktop/src/adapters/**`.
- Exposes desktop capabilities to core through injected contracts.

## Adapter Ownership

Tauri APIs and `invoke()` are allowed only in:

```text
apps/desktop/src/adapters/**
```

Current adapter responsibilities:

- desktop storage adapter
- desktop filesystem adapter
- desktop network adapter
- desktop logger adapter

## Validation

```bash
pnpm --filter @ccd/desktop typecheck
pnpm --filter @ccd/desktop test
pnpm --filter @ccd/desktop build
pnpm arch:boundaries
pnpm arch:runtime
```
