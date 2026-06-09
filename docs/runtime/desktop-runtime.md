# Desktop Runtime

`apps/desktop` is the dedicated Tauri v2 desktop runtime shell for CCD. It has its own frontend entry, desktop adapters, and `apps/desktop/src-tauri/**` backend boundary; it is not a full duplicate of the browser `web-demo` application.

## Runtime Contract

- Vue 3 + Vite desktop frontend entry running inside Tauri WebView.
- Depends on governed workspace packages through public exports only.
- Current workspace dependencies include `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/shared-utils`, `@ccd/unocss-preset`, `@ccd/vue-app-platform`, `@ccd/vue-hooks`, `@ccd/vue-primevue-adapter`, and `@ccd/vue-ui`.
- TypeScript consumes workspace packages through package exports and prepared `dist` declarations; `apps/desktop/tsconfig.json` must not include `../../packages/*/src/**`.
- Encapsulates all Tauri APIs in `apps/desktop/src/adapters/**`.
- Exposes desktop capabilities to core through injected contracts.
- Keeps browser WebView bootstrap/theme DOM access app-local and explicitly classified.
- Consumes shared components, tokens, hooks, UI primitives, package-level adapters, contracts, and runtime-neutral logic from `packages/*` instead of duplicating the browser app.
- Keeps desktop-specific frontend wiring and Tauri backend behavior app-local.

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

## Backend Command Policy

Rust command handlers are added only when a real desktop backend capability is introduced. New commands must be contract-first, routed through typed frontend adapters, payload-validated before `invoke()`, and registered under `apps/desktop/src-tauri/src/**`.

New Rust commands must return structured errors instead of string-only IPC errors. Updater and deep-link configuration remains disabled until a future task provides the trust model, allowed sources or schemes, signature/downgrade policy, and failure behavior.

See [ADR-008](../adr/ADR-008-desktop-backend-ipc-and-updater-policy.md).

## Security Policy

Production CSP is explicit in `apps/desktop/src-tauri/tauri.conf.json` and documented in `apps/desktop/src-tauri/security-scopes.json`.

Current policy:

- `default-src`: local app assets plus Tauri IPC bridge sources only.
- `connect-src`: same-origin requests plus Tauri IPC bridge sources only.
- `script-src`: bundled scripts only; no inline script and no eval.
- `style-src`: bundled stylesheets only.
- `img-src`: bundled images plus generated `data:` and `blob:` images.
- `font-src`: bundled fonts plus generated `data:` fonts.
- `base-uri`, `form-action`, `frame-ancestors`, `frame-src`, and `object-src`: denied.

There are currently no development CSP exceptions. If a future dev-only exception is required, keep production restrictive, document the exception in `security-scopes.json`, and extend `pnpm desktop:security` before enabling the behavior.

Capability policy remains deny-by-default. `apps/desktop/src-tauri/capabilities/default.json` is local to the `main` window and grants no Tauri core or plugin permissions by default. `apps/desktop/src-tauri/security-scopes.json` documents every denied or planned plugin/navigation surface; no plugin may be enabled until it has scoped allow/deny rules and validation.

## Validation

```bash
pnpm desktop:security
pnpm desktop:smoke:dev
pnpm desktop:smoke:release
pnpm desktop:smoke
pnpm --filter @ccd/desktop type-check
pnpm --filter @ccd/desktop test
pnpm --filter @ccd/desktop build
pnpm build:desktop
pnpm budget:desktop
pnpm arch:boundaries
pnpm arch:runtime
```

`pnpm desktop:smoke:dev` exercises the Tauri dev compile path with no dev-server wait and a no-op runner. `pnpm desktop:smoke:release` exercises `tauri build --no-bundle --ci`; it validates release compilation without producing installer bundles.
