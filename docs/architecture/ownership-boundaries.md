# Ownership and Boundary Authority

CCD uses workspace ownership rather than archive ownership.

## Active owners

| Area                                                   | Owner boundary                                               |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| Contracts and public ABI                               | `packages/contracts`                                         |
| Minimal runtime-neutral adapter facade                 | `packages/core`                                              |
| Pure shared utilities                                  | `packages/shared-utils`                                      |
| Shared Vue/browser composables                         | `packages/vue-hooks`                                         |
| Shared Vue UI primitives                               | `packages/vue-ui`                                            |
| PrimeVue-specific theme/adaptation layer               | `packages/vue-primevue-adapter`                              |
| Shared chart runtime and helpers                       | `packages/vue-charts`                                        |
| Browser app shell, routes, pages, stores, app adapters | `apps/web-demo`                                              |
| Desktop/Tauri runtime shell and adapters               | `apps/desktop`                                               |
| Governance                                             | `.ai/**`, `scripts/governance/**`, `scripts/architecture/**` |

## App-local shared candidates

The following paths currently remain owned by `apps/web-demo` and should be treated as app-local shared candidates rather than immediate extraction targets:

- `apps/web-demo/src/components/PrimeDialog`
- `apps/web-demo/src/components/ProForm`
- `apps/web-demo/src/components/ProTable`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/infra/shared/createCapabilityBridge.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/safeStorage`

## Do not move yet

- `packages/core/src/index.ts`
- `apps/web-demo/src/main.ts`
- `apps/web-demo/src/plugins/**`
- `apps/web-demo/src/router/**`
- `apps/web-demo/src/stores/**`
- `apps/web-demo/src/views/**`
- `apps/web-demo/src/utils/date/dateUtils.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/components/ProForm/**`
- `apps/web-demo/src/components/ProTable/**`

## Removed archive policy

The former browser runtime archive is not an active owner boundary and is not present in the working tree. Historical explanations may reference the migration, but active implementation, CI, scripts, and package graphs must use current workspace owners only.
