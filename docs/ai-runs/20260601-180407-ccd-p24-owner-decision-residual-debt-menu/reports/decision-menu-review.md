# P24 — Decision Menu Review

- Date: 2026-06-01
- Lane: P24 owner decision for residual debt execution menu
- Baseline: branch `main`, HEAD `218d941e`, origin/main `218d941e`
- Source menu: `docs/ai-runs/20260601-173110-ccd-p23-conditional-go-residual-debt-final-review/reports/future-owner-decision-menu.md`
- Owner input this lane: **no approval** — keep all menu items `PROPOSED`

## Decision table

| decision_id | title | target_residual_debt | current_status | implementation_required | expected_files | risk | validation_required | owner_decision | result_status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-020 | PrimeVue bootstrap install adapter lane (R1/R4) | C-06 rows R1 (`apps/desktop/src/plugins/index.ts`), R4 (`apps/web-demo/src/plugins/modules/primevue.ts`) | PROPOSED | yes — adapter bootstrap API + dual-app plugin migration | `packages/vue-primevue-adapter/**`, `apps/desktop/src/plugins/index.ts`, `apps/web-demo/src/plugins/modules/primevue.ts`, `scripts/ai-architecture-guard.mjs` (after migration) | high | `pnpm ai:guard -- --format=json`, `pnpm build:desktop`, `pnpm build:web-demo`, desktop smoke | NO_DECISION | PROPOSED |
| D-021 | PrimeVue build resolver / generated registry lane (R2/R5) | C-06 rows R2 (`apps/web-demo/build/plugins.ts`), R5 (`apps/web-demo/src/types/components.d.ts`) | PROPOSED | yes — governed build resolver + regen `components.d.ts` | `apps/web-demo/build/plugins.ts`, build package or resolver config, `apps/web-demo/src/types/components.d.ts` (generated) | high | `drift-check`, `pnpm build:web-demo`, `pnpm type-check`, `pnpm api:report` | NO_DECISION | PROPOSED |
| D-022 | AppPrimeVueGlobals global shell facade lane (R3) | C-06 row R3 (`apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`) | PROPOSED | yes — adapter/vue-ui global shell facades + layout host migration | `packages/vue-primevue-adapter/**`, `packages/vue-ui/**`, `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` | high | visual smoke, `pnpm --filter @ccd/web-demo test`, e2e toast groups, `pnpm ai:guard -- --format=json` | NO_DECISION | PROPOSED |
| D-023 | G-02 operator/product closure wave | G-02 (78 open repair-ledger tasks) | PROPOSED | yes — separate approved lanes per task group with closure evidence | `.ai/runtime/repair_list.md` (checkboxes only with evidence), lane-specific `apps/**` / `packages/**` / `.github/**` as approved | medium-to-high | lane-specific matrices, `pnpm ai:doctor --open`, `pnpm validate:governance` | NO_DECISION | PROPOSED |
| D-024 | Showcase exception cleanup decision (M12 E3) | D-017 Option D showcase (`apps/web-demo/src/views/example/components/primevue-collection/**`) | PROPOSED | conditional — product/owner scope if cleanup chosen; may be docs-only if permanence affirmed | showcase paths under `apps/web-demo/src/views/example/components/primevue-collection/**`, guard policy if scope changes | low-to-medium | `pnpm ai:guard -- --format=json`, focused UI smoke | NO_DECISION | PROPOSED |

## Review conclusion

- All five menu items remain **`PROPOSED`**; none were approved, rejected, or deferred in P24.
- Residual debt unchanged: C-06 `OPEN` (5 exact rows + showcase), G-02 `ACCEPTED_DEFERRED_DEBT` (78), M12 `PARTIAL`.
- Final architecture status: **`CONDITIONAL_GO`**; full GO **not authorized**.
- P24 final status: **`P24_NO_OWNER_DECISION_RECORDED`**.
