# Ownership and Boundary Authority

CCD uses workspace ownership rather than archive ownership.

## Common platform layer

`common platform layer` is the combined governed package layer under `packages/*`. It is not a synonym for `packages/core`.

`packages/core` remains the minimal runtime-neutral orchestration/facade package and may depend only on `@ccd/contracts`. Shared frontend concerns must land in their owning platform packages (`vue-hooks`, `vue-app-platform`, `vue-ui`, `vue-primevue-adapter`, `vue-charts`, `design-tokens`, or `shared-utils`) rather than being collected in `core`.

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

## Extraction authority matrix

| Move request                                  | Owning destination                                      | Approval notes                                                                  |
| --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| DTO/interface/cross-runtime contract          | `packages/contracts`                                    | Must remain type-only/runtime-neutral.                                          |
| Runtime-neutral adapter orchestration         | `packages/core`                                         | Requires proof that the logic depends only on injected contracts.               |
| Pure generic helper                           | `packages/shared-utils`                                 | No app/runtime globals.                                                         |
| Vue/browser composable                        | `packages/vue-hooks`                                    | No direct app store/router coupling.                                            |
| Bootstrap/layout/preloader platform primitive | `packages/vue-app-platform`                             | App-specific wiring remains in app.                                             |
| CCD UI primitive                              | `packages/vue-ui`                                       | CCD-owned public API; internal PrimeVue composition is allowed.                 |
| PrimeVue theme/config/service adapter         | `packages/vue-primevue-adapter`                         | Raw PrimeVue exposure requires boundary approval.                               |
| App runtime capability                        | `apps/*/src/adapters/**` or approved app infrastructure | Do not move browser/Tauri/auth/router/store effects into `contracts` or `core`. |

## App-local shared candidates

The following paths currently remain owned by `apps/web-demo` and should be treated as app-local shared candidates rather than immediate extraction targets:

- `apps/web-demo/src/components/PrimeDialog`
- `apps/web-demo/src/components/ProForm`
- `apps/web-demo/src/components/ProTable`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/safeStorage`

`packages/shared-utils/src/createCapabilityBridge.ts` is the active owner for the pure capability bridge helper. App auth/router/storage capability providers remain app-local.

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
