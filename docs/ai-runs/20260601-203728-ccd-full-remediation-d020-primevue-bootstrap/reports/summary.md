# D-020 PrimeVue Bootstrap Summary

## Scope

- Lane: `D-020` / `P26_D020_PRIMEVUE_BOOTSTRAP_DONE`
- Objective: migrate C-06 R1/R4 PrimeVue bootstrap installs behind `@ccd/vue-primevue-adapter`.
- Baseline: local HEAD `f8725327`, `origin/main` `6132c9c9`; branch `main`.

## Result

- Added `installPrimeVueRuntime()` and `PrimeVueRuntimeInstallOptions` in `packages/vue-primevue-adapter/src/index.ts`.
- Migrated `apps/desktop/src/plugins/index.ts` and `apps/web-demo/src/plugins/modules/primevue.ts` to use the adapter-owned runtime installer.
- Preserved web `PRIME_DIALOG_RUNTIME_CONFIG_KEY` provide ownership in the app.
- Removed the R1/R4 exact allowlist rows from `scripts/ai-architecture-guard.mjs` after source migration and guard validation.
- Regenerated `docs/generated/api-surface-report.{md,json}` with `pnpm api:report` for the new adapter public symbols.

## Status

- `C-06`: still `OPEN`, reduced from 5 exact rows plus showcase to 3 exact rows plus showcase.
- `G-02`: unchanged, 78 open tasks.
- `M12`: still `PARTIAL`.
- Final decision: `CONDITIONAL_GO`.
- Push: not performed.
