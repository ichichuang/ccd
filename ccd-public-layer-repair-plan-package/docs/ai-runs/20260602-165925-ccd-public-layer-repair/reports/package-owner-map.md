# M0 Package Owner Map

## Active Topology

Observed topology matches the repository rule:

- `packages/contracts` is runtime-neutral and type-contract focused.
- `packages/core` depends only on `@ccd/contracts`.
- `apps/web-demo` and `apps/desktop` own runtime adapters, app stores, route views, plugin shells, and app integration glue.
- Shared runtime helpers currently live in governed packages such as `@ccd/shared-utils`, `@ccd/vue-app-platform`, `@ccd/design-tokens`, `@ccd/vue-ui`, and `@ccd/vue-primevue-adapter`.

Evidence:

- `command-logs/package-owner-inventory.log`
- `command-logs/package-public-exports-scan.log`
- `packages/contracts/package.json`
- `packages/contracts/src/index.ts`
- `packages/vue-app-platform/package.json`
- `packages/vue-app-platform/src/index.ts`

## Package Summary

| Area | Package or path | Observed owner role | Boundary notes |
| --- | --- | --- | --- |
| Contracts | `packages/contracts` / `@ccd/contracts` | Runtime-neutral interfaces and DTOs | No internal `@ccd/*` dependencies; exports `./dist/index.*`; current HTTP contracts are type-only. |
| Core | `packages/core` / `@ccd/core` | Runtime-neutral core facade | Depends on `@ccd/contracts`; should not receive app/browser runtime code. |
| Shared utils | `packages/shared-utils` / `@ccd/shared-utils` | Pure shared utilities | Suitable only for generic pure helpers, not app platform policy buckets. |
| Design tokens | `packages/design-tokens` / `@ccd/design-tokens` | Theme/size/token derivation | Owns pure token derivation and exported theme-engine. |
| Vue app platform | `packages/vue-app-platform` / `@ccd/vue-app-platform` | Browser/platform runtime helpers with capability injection | Already owns `applyThemeVars`, layout runtime, preloader, bootstrap helpers. |
| PrimeVue adapter | `packages/vue-primevue-adapter` / `@ccd/vue-primevue-adapter` | PrimeVue-specific adapter layer | Owns global PrimeVue integration and service adapter. |
| Vue UI | `packages/vue-ui` / `@ccd/vue-ui` | CCD-owned UI primitives | May compose PrimeVue internally; must not re-export raw PrimeVue. |
| Web app | `apps/web-demo` / `@ccd/web-demo` | Browser app shell and app-owned runtime | Owns routes, views, stores, HTTP runtime, safeStorage, sync runtime, build config, generated registries. |
| Desktop app | `apps/desktop` / `@ccd/desktop` | Tauri desktop shell | Owns desktop app adapters and desktop-specific theme setup. |

## M0 Owner Conclusions

- `@ccd/contracts` is the correct owner for safe type-only route/menu/API/preference contracts if no runtime dependency is introduced.
- `@ccd/vue-app-platform` is the plausible existing owner for safe browser/platform runtime helpers when dependency direction is clean.
- Sync runtime and build config do not currently have approved new package owners; default action is decision/defer unless separately approved.
- App stores, route views, plugin shells, SafeStorage crypto/compression, DateUtils, HTTP runtime adapters, generated registries, and app integration facades remain app-owned unless a later milestone proves otherwise.
