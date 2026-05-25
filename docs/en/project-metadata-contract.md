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
- `apps/web-demo` owns the browser app shell, routes, pages, stores, app adapters, and some temporary app-local shared candidates until later staged extraction work is approved.

## Derived Metadata Targets

`pnpm project:sync` updates derived metadata, including:

- root `package.json`
- workspace manifests under `apps/*` and `packages/*`
- `apps/web-demo/src/constants/brand.ts`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `.release-please-manifest.json`
- `.ai/governance/policies/version.json`

## project:sync

Use this command to propagate metadata changes:

```bash
pnpm project:sync
```

Do not manually edit derived metadata files when the same field is governed by `project.config.json`.

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
