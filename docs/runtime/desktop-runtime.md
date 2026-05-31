# Desktop Runtime

`apps/desktop` is the Tauri v2 runtime surface for CCD.

## Runtime Contract

- Vue 3 + Vite application running inside Tauri WebView.
- Depends on governed workspace packages through public exports only.
- Current workspace dependencies include `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/unocss-preset`, `@ccd/vue-app-platform`, `@ccd/vue-hooks`, `@ccd/vue-primevue-adapter`, and `@ccd/vue-ui`.
- TypeScript consumes workspace packages through package exports and prepared `dist` declarations; `apps/desktop/tsconfig.json` must not include `../../packages/*/src/**`.
- Encapsulates all Tauri APIs in `apps/desktop/src/adapters/**`.
- Exposes desktop capabilities to core through injected contracts.
- Keeps browser WebView bootstrap/theme DOM access app-local and explicitly classified.

M13 removes the `@ccd/vue-ui` package source include globs from the desktop tsconfig. After `pnpm ci:prepare-internal`, desktop type-check and build consume the UI package through its workspace package exports and build outputs.

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

Browser DOM access in `apps/desktop/src/main.ts` and `apps/desktop/src/theme/index.ts` is classified as desktop app runtime integration. This does not loosen the Tauri rule: `@tauri-apps/*` imports and `invoke()` remain adapter-only.

## Validation

```bash
pnpm --filter @ccd/desktop type-check
pnpm --filter @ccd/desktop test
pnpm --filter @ccd/desktop build
pnpm arch:boundaries
pnpm arch:runtime
```
