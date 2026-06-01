# D-022 Global Shell Summary

## Scope

- Lane: `D-022` / `P28_D022_GLOBAL_SHELL_DONE`
- Objective: close C-06 R3 by moving `AppPrimeVueGlobals.vue` raw PrimeVue dependencies behind governed adapter facades.
- Baseline: local HEAD `316d0381`, `origin/main` `6132c9c9`; branch `main`.

## Result

- Added global shell component facades in `@ccd/vue-primevue-adapter`:
  - `PrimeVueGlobalToast`
  - `PrimeVueGlobalConfirmPopup`
  - `PrimeVueGlobalDynamicDialog`
- Added runtime/global service helpers in `@ccd/vue-primevue-adapter`:
  - `usePrimeVueToastService()`
  - `usePrimeVueRuntimeConfig()`
  - `createPrimeVueGlobalMessageApis()`
  - `mountPrimeVueGlobalMessageApis()`
  - `clearPrimeVueGlobalMessageApis()`
  - `clearPrimeVueToastGroups()`
- Migrated `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` off direct PrimeVue imports.
- Removed the final exact app row from `approvedPrimeVueAppImportFiles`.
- Regenerated `docs/generated/api-surface-report.{md,json}` with `pnpm api:report`.

## Status

- `C-06`: still `OPEN`, reduced from 1 exact row plus showcase to 0 exact rows plus showcase.
- `G-02`: unchanged, 78 open tasks.
- `M12`: still `PARTIAL`; showcase cleanup remains for D-024.
- Final decision: `CONDITIONAL_GO`.
- Push: not performed.
