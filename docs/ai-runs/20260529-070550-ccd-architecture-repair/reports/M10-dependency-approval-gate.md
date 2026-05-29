# M10 Dependency Approval Gate Report

## Scope

- Lane: M10 / `P2-Deps-*`.
- Inventory only.
- No dependency upgrade, `package.json` edit, `pnpm-lock.yaml` edit, install mutation, branch, or worktree change was performed.

## Evidence

- Table inventory: `command-logs/M10-T1-20260529-081950-pnpm-deps-outdated.log`
- JSON inventory: `command-logs/M10-T1-20260529-082010-pnpm-outdated-json.log`

`pnpm outdated` exits with code `1` when outdated packages exist. In this lane that is treated as inventory evidence, not as an implementation failure.

## Lane Classification

| Lane | Package examples | Current | Wanted | Latest | Status |
|---|---|---:|---:|---:|---|
| Vite runtime | `vite` | 7.3.3 | 7.3.3 | 8.0.14 | BLOCKED by M9 approval gate |
| VueUse | `@vueuse/core` | 13.9.0 | 13.9.0 | 14.3.0 | BLOCKED pending isolated approved lane |
| Vue tooling | `vue-tsc` | 2.2.12 | 2.2.12 | 3.3.2 | BLOCKED pending isolated approved lane |
| Vue tooling | `typescript` | 5.9.3 | 5.9.3 | 6.0.3 | BLOCKED pending isolated approved lane |
| Vue tooling | `@vue/compiler-sfc` | 3.5.29 | 3.5.29 | 3.5.35 | BLOCKED pending isolated approved lane |
| ESLint | `eslint` | 9.39.2 | 9.39.2 | 10.4.0 | BLOCKED pending isolated approved lane |
| ESLint | `eslint-plugin-vue` | 9.33.0 | 9.33.0 | 10.9.1 | BLOCKED pending isolated approved lane |
| PrimeVue | `primevue` | 4.5.4 | 4.5.4 | 4.5.5 | BLOCKED pending API/adapters review |
| PrimeVue | `@primevue/core` | 4.5.4 | 4.5.4 | 4.5.5 | BLOCKED pending API/adapters review |
| alova | `alova` | 3.4.0 | 3.4.0 | 3.5.1 | BLOCKED pending request/adapter contract lane |
| Playwright | `@playwright/test` | 1.59.1 | 1.59.1 | 1.60.0 | BLOCKED pending CI/browser cache review |
| UnoCSS | `unocss` | 66.6.0 | 66.6.0 | 66.7.0 | DEFERRED; not part of the approved M10 tasks |
| Charts/runtime | `echarts` | 6.0.0 | 6.0.0 | 6.1.0 | DEFERRED; requires separate visual/runtime lane |

The full package list is in the JSON inventory log.

## Required Approval Before Mutation

Each upgrade lane needs:

- explicit operator approval;
- a single-lane branch/worktree when package or lockfile changes are required;
- official docs/changelog review for the selected packages;
- targeted validation first, then broader validation.
