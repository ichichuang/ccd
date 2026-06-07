# Project Metadata Contract

## project.config.json Is SSOT

Canonical manual metadata source:

```text
project.config.json
```

Version changes must start in `project.config.json`, specifically `release.version`.

Workspace `package.json` files under `apps/*` and `packages/*` are package manifests, not the manual version source of truth.

## Workspace Responsibility Reminder

Metadata governance does not override architecture ownership:

- `packages/contracts` contains cross-runtime interfaces and DTO contracts only.
- `packages/core` is a minimal runtime-neutral adapter facade, not a shared frontend bucket.
- `apps/web-demo` owns the browser `web-demo` application shell, routes, pages/views, stores, app adapters, app-level plugin wiring, and some temporary app-local shared candidates until later staged extraction work is approved.
- `apps/desktop` owns the dedicated Tauri desktop runtime shell with its own frontend entry, desktop adapters, and `apps/desktop/src-tauri/**` backend boundary.

## Derived Metadata Targets

`pnpm project:sync` updates derived metadata, including:

- root `package.json`
- workspace manifests under `apps/*` and `packages/*`
- `apps/web-demo/src/constants/brand.ts`
- desktop release metadata under `apps/desktop/src-tauri/**`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `.release-please-manifest.json`
- `.ai/governance/policies/version.json`

`apps/web-demo/index.html` is also a metadata template. Keep
`%BRAND_NAME%`, `%BRAND_SLOGAN%`, and `%BRAND_AUTHOR%` in the template instead
of hardcoding app title, description, or author metadata.

`apps/desktop/index.html` is not rewritten by `project:sync`. It is a build-time
HTML template: `apps/desktop/build/html.ts` reads `project.config.json` during
Vite dev/build and injects the desktop title, description, author, and package
metadata. Keep `%DESKTOP_PRODUCT_NAME%`, `%PRODUCT_DESCRIPTION%`, and
`%PRODUCT_AUTHOR%` in the template instead of hardcoding display metadata.

## project:sync

Use this command to propagate metadata changes:

```bash
pnpm project:sync
```

Do not manually edit derived metadata files when the same field is governed by `project.config.json`.
Do not hardcode product title, description, or author into `apps/web-demo/index.html`;
those values flow through the web metadata placeholders and brand constants.
Do not hardcode product name, description, or author into `apps/desktop/index.html`;
those values are injected from `project.config.json` by the desktop Vite plugin.

## project:doctor

Use this command to verify metadata alignment:

```bash
pnpm project:doctor
```

`pnpm governance:gate` also runs `pnpm project:doctor`, so metadata drift blocks the unified governance gate before it can reach `main`.

## Forbidden Direct Edits

Do not manually edit generated outputs under:

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

Use the existing refresh and validation scripts instead.
