# C-06 PrimeVue Allowlist Decision Packet

## Status

- Issue: `C-06`
- Current status: `OPEN`
- Decision status: `PROPOSED`
- Recommendation: keep exact allowlists and showcase exception as temporary debt, prevent new non-showcase direct app imports, and reduce allowlists only through one feature area per future M12 lane.
- Source migration in M6: none
- Allowlist reduction in M6: none

## Evidence

- M4 classified 163 source PrimeVue import rows and found 0 unallowed rows under current policy.
- M5 found 0 PrimeVue allowlist rows removable without source migration and grouped 7 future reduction targets.
- `scripts/ai-architecture-guard.mjs` enforces exact app allowlists, package internal allowances, tests, `@ccd/vue-primevue-adapter`, `@ccd/vue-ui` internals, and the `primevue-collection/**` showcase exception.
- `packages/vue-primevue-adapter` owns PrimeVue config, PT, theme, locale, service installation, toast/message helpers, and adapter APIs.
- `packages/vue-ui` may internally compose PrimeVue but must not raw re-export a loose PrimeVue public bucket.

## Option Matrix

| option | affected files | expected allowlist reduction count | wrapper or adapter required | source migration required | UI regression risk | visual/e2e validation required | owner/product decision required | recommendation |
|---|---|---|---|---|---|---|---|---|
| A. Keep exact allowlist and showcase exceptions as temporary debt; reduce only through future component migration lanes | `scripts/ai-architecture-guard.mjs`, exact app files, showcase path, generated registry | 0 now; reductions only after migration | yes, when a row is targeted | yes | low now, deferred to target lanes | guard only now; visual/e2e in target lanes | owner approval for each reduction group | recommended current guard posture |
| B. Prioritize moving selected app feature usages behind `@ccd/vue-ui` wrappers | `apps/web-demo/src/views/dashboard/index.vue`, example app feature files, `packages/vue-ui/src/**` | small per feature group after migration | `@ccd/vue-ui` wrappers or CCD-owned component APIs | yes | medium-high per UI surface | focused visual/e2e and package tests | owner approval for selected group and UI budget | recommended inside M12 one group at a time |
| C. Prioritize moving global service/config usages behind `@ccd/vue-primevue-adapter` | `AppPrimeVueGlobals.vue`, app plugin/global shell, adapter services | possible 1-3 exact app rows after shell/API migration | `@ccd/vue-primevue-adapter` service/global shell helpers | yes | medium; global toast/dialog/locale behavior | adapter tests plus app smoke | owner approval for global shell split | recommended only after a narrow adapter API is approved |
| D. Keep showcase paths as long-lived demo exceptions but prevent new non-showcase direct imports | `apps/web-demo/src/views/example/components/primevue-collection/**`, guard path exception | 0 from showcase while retained | none unless demo is redesigned | no for current state | low now | guard validation; visual only if demo changes | product/owner decision if showcase is removed or redesigned | recommended current showcase posture |
| E. Create a future PrimeVue reduction lane handling one feature area at a time | selected exact app file group plus owning wrapper/adapter package | one group per lane; exact count depends on chosen files | yes | yes | controlled per lane | required for touched UI | owner approval for chosen group | recommended execution model |

## Proposed Decision

Keep options A and D as current policy. Execute option E for future reduction. Use options B and C only inside approved M12 sub-lanes with one selected feature/global-shell group at a time.

## Reduction Groups For M12

1. App global shell and PrimeVue service helpers.
2. Router/layout PrimeVue menu and tooltip type/directive usages.
3. Dashboard feature imports.
4. Example hook/system-configuration imports.
5. Generated component type registry, only through the owning generator.
6. Showcase path exception review or redesign.
7. `@ccd/vue-ui` wrapper/API gaps that block app migration.

## Required Owner Approval Before Allowlist Reduction

- Selected reduction group and allowed paths.
- Whether showcase exceptions remain product-approved.
- Whether generated typing changes are allowed through the generator.
- Visual/e2e validation budget for touched UI.
- Whether new wrapper APIs belong in `@ccd/vue-ui` or service APIs in `@ccd/vue-primevue-adapter`.

## Minimum Future Validation

- `pnpm ai:guard -- --format=json`
- `pnpm api:report`
- affected package tests/builds
- `pnpm --filter @ccd/web-demo type-check`
- focused app visual/e2e smoke for touched UI
- generated registry validation if component type output changes
