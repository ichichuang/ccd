---
title_en: Monorepo Topology
title_zh: Monorepo 拓扑
aliases:
  - CCD topology
  - Workspace topology
  - 仓库拓扑
  - 工作区拓扑
tags:
  - architecture
  - monorepo
  - topology
tags_zh:
  - 架构
  - 单仓
  - 拓扑
status: verified
confidence: 0.96
source_langs:
  - en
  - zh
source_paths:
  - README.md
  - README.en.md
  - docs/en/architecture-contract.md
  - .ai/README.md
  - pnpm-workspace.yaml
  - package.json
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Monorepo Topology

CCD is a self-protecting deterministic multi-runtime platform monorepo. Its hard invariant is:

```text
@ccd/contracts -> @ccd/core -> apps/*
```

The full governed workspace topology is broader than the three-node invariant. `packages/contracts` owns cross-runtime contracts, `packages/core` owns minimal runtime-neutral adapter orchestration, governed frontend packages under `packages/*` own reusable UI/platform/tokens/composable surfaces, `apps/web-demo` owns the browser application shell, `apps/desktop` owns the Tauri desktop shell, and the repository root remains orchestration-only.

The root README and English AI entry both describe the repository as a platform architecture rather than a one-off frontend refactor. The root must not become an active runtime source host; app runtime access belongs in app adapter or approved app infrastructure paths.

## Current workspace domains

| Domain                          | Role                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `packages/contracts`            | Cross-runtime interfaces, DTOs, and ABI contracts only.                                             |
| `packages/core`                 | Minimal runtime-neutral facade over injected adapters.                                              |
| `packages/design-tokens`        | Shared design token source and pure size/theme/device resolver layer.                               |
| `packages/shared-utils`         | Pure shared utilities and safe helper functions.                                                    |
| `packages/unocss-preset`        | Shared UnoCSS preset, safelist, and build-time styling helpers.                                     |
| `packages/vue-hooks`            | Reusable Vue/browser composables with guarded or injected browser surfaces.                         |
| `packages/vue-app-platform`     | Shared frontend bootstrap, layout, i18n, and platform orchestration primitives.                     |
| `packages/vue-ui`               | CCD-owned shared Vue UI primitives and higher-level components.                                     |
| `packages/vue-primevue-adapter` | PrimeVue theme, locale, config, services, and runtime adapter layer.                                |
| `packages/vue-charts`           | Shared chart runtime and helpers.                                                                   |
| `apps/web-demo`                 | Browser application shell, routes, stores, views, plugins, app adapters, compatibility facades.     |
| `apps/desktop`                  | Dedicated Tauri desktop runtime shell with its own frontend entry and `src-tauri` backend boundary. |
| root                            | Orchestration shell only.                                                                           |

## Non-negotiables

- No reverse dependency through the invariant.
- No app-to-app imports.
- No runtime APIs in `packages/contracts` or `packages/core`.
- No global `@ccd/*` TypeScript path aliases masking package boundaries.
- No public shared capability exports from `apps/*` without a future owner decision.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `README.en.md`
- `docs/en/architecture-contract.md`
- `.ai/README.md`
- `pnpm-workspace.yaml`
- `package.json`

## Related pages

- [[package-responsibility-matrix]]
- [[runtime-isolation]]
- [[contracts-boundary]]
- [[core-boundary]]
- [[web-demo-role]]
- [[desktop-role]]
