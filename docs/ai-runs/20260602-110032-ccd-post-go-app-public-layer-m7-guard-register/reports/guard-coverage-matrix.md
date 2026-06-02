# M7 Guard Coverage Matrix

| Boundary | Guard | Coverage | M7 action |
| --- | --- | --- | --- |
| PrimeVue direct app imports | `pnpm ai:guard -- --format=json` | Allows only `@ccd/vue-ui` internals, `@ccd/vue-primevue-adapter`, tests, build resolver, generated registry, or exact allowlist. Exact app allowlist is empty. | No new guard needed. |
| PrimeVue resolver boundary | `pnpm drift-check` | Requires `apps/web-demo/build/plugins.ts` to call `createPrimeVueComponentResolver()` and `apps/web-demo/build/resolvers/primevue.ts` to centralize `PrimeVueResolver()`. | No new guard needed. |
| Generated file staging | pre-commit `scripts/lint-staged-safe.mjs` | Blocks local-only generated files and warns on tracked generated files. | No new guard needed. |
| Runtime leaks | `pnpm arch:runtime` | Scans runtime surfaces and enforces policy exceptions/classifications. | No new guard needed. |
| Package boundaries | `pnpm arch:boundaries` and dependency-cruiser | Enforces runtime-neutral core/packages and app/package dependency policy. | No new guard needed. |
| Generated governance sync | `pnpm validate:governance` | Regenerates governance/API/graph outputs and checks sync. | No new guard needed. |
| App build/generator config drift | `pnpm drift-check` | Checks AutoImport/Components config, resolver boundary, manual chunks, style drift. | No new guard needed. |

## Guard-strengthening decision

M7 did not modify guard source because every remaining boundary is already
covered by deterministic commands. Adding a new guard without a new failing
condition would duplicate existing checks and increase maintenance risk.
