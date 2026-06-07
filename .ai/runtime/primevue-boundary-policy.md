# PrimeVue Boundary Policy

Task: `[P1-UIBoundary-Policy]`

Date: 2026-06-07

Binding owner decision: D-003, `APPROVED`.

## App Boundary

App-authored source files must not import raw `primevue`, `primevue/*`, or `@primevue/*` modules directly.

Allowed app bootstrap/plugin package imports:

| File                                            | Allowed imports                            | Raw PrimeVue imports |
| ----------------------------------------------- | ------------------------------------------ | -------------------- |
| `apps/web-demo/src/plugins/modules/primevue.ts` | `@ccd/vue-primevue-adapter`, `@ccd/vue-ui` | forbidden            |
| `apps/desktop/src/plugins/index.ts`             | `@ccd/vue-primevue-adapter`                | forbidden            |

Governed non-runtime exceptions:

| File                                        | Allowed raw PrimeVue surface        | Reason                                 |
| ------------------------------------------- | ----------------------------------- | -------------------------------------- |
| `apps/web-demo/build/resolvers/primevue.ts` | `@primevue/auto-import-resolver`    | build-time component resolver boundary |
| `apps/web-demo/src/types/components.d.ts`   | generated `primevue/*` type imports | generated component registry           |

Current exact app raw-import allowlist: empty.

## Package Boundary

| Area                                   | Policy                                                                                                                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/vue-ui/src/**`               | May import raw PrimeVue modules internally to build CCD-owned primitives, ProForm, ProTable, CScrollbar, and PrimeDialog. Must not publicly re-export raw PrimeVue modules. |
| `packages/vue-primevue-adapter/src/**` | Owns PrimeVue install, theme preset, PassThrough presets, directives, services, global message APIs, locale application, and adapter-facing PrimeVue types.                 |
| Other packages                         | Must not import raw PrimeVue modules unless a later ledger task adds an explicit policy exception and guard coverage.                                                       |

Implementation source: `scripts/architecture/primevue-boundary-policy.mjs`.
