# ADR-005: Common Platform Layer Terminology

- Status: Proposed
- Date: 2026-05-29

## Context

The phrase `common core layer` can be misread as "move common code into `packages/core`". That conflicts with the repository invariant that `packages/core` is runtime-neutral and may depend only on `@ccd/contracts`.

## Decision

Use `common platform layer` for the combined governed package layer under `packages/*`.

`packages/core` is one package inside that layer. It remains the minimal runtime-neutral orchestration/facade package, not a shared frontend bucket.

Extraction targets must follow this matrix:

| Candidate kind                                                    | Destination                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| DTO/interface/cross-runtime contract                              | `packages/contracts`                                    |
| Runtime-neutral orchestration over injected adapters              | `packages/core`                                         |
| Pure generic helper                                               | `packages/shared-utils`                                 |
| Vue/browser composable                                            | `packages/vue-hooks`                                    |
| Bootstrap/layout/preloader platform primitive                     | `packages/vue-app-platform`                             |
| CCD-owned UI primitive                                            | `packages/vue-ui`                                       |
| PrimeVue theme/config/service adapter                             | `packages/vue-primevue-adapter`                         |
| Chart runtime/helper surface                                      | `packages/vue-charts`                                   |
| Runtime capability, auth, router, store, browser, or Tauri access | `apps/*/src/adapters/**` or approved app infrastructure |

## Consequences

- Future planning should say `common platform layer` unless specifically referring to `packages/core`.
- `packages/core` must not receive Vue, PrimeVue, browser, Tauri, fetch, storage, timer, or app runtime logic.
- Shared UI and browser-facing Vue code must land in the appropriate Vue platform package.

## Validation

- `pnpm docs:commands`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report`
