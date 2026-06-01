# C-06 Residual PrimeVue Allowlist Inventory — Pass 3

Source: `approvedPrimeVueAppImportFiles` in `scripts/ai-architecture-guard.mjs` (count = 6 after P19).

Decision rules applied:
1. Exclude showcase rows.
2. Exclude generated type rows unless resolvable through owning generator or typed facade.
3. Exclude bootstrap/global install rows unless an existing adapter API preserves behavior.
4. Prefer type-only rows and adapter-owned wrappers.
5. If no safe row exists, record `P20_NO_SAFE_RESIDUAL_REDUCTION`.

## Exact allowlist rows (6)

| row_id | file | primevue_import | current_owner | target_owner | showcase | generated_type | app_bootstrap | migration_cost | behavior_risk | can_fix_in_p20 | proposed_action | reason |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R1 | apps/desktop/src/plugins/index.ts | `primevue/config` (PrimeVue plugin) | desktop bootstrap | desktop bootstrap | no | no | yes | high | high | no | keep | Global PrimeVue plugin install at desktop app bootstrap; install semantics cannot be re-expressed through a wrapper. |
| R2 | apps/web-demo/build/plugins.ts | `@primevue/auto-import-resolver` | web-demo build config | web-demo build config | no | no | yes | high | high | no | keep | Build-time unplugin resolver powers template auto-import + tree-shaking. |
| R3 | apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue | `primevue/toast`, `primevue/confirmpopup`, `primevue/dynamicdialog`, `primevue/usetoast`, `primevue/config` | web-demo bootstrap | web-demo bootstrap | no | no | yes | high | high | no | keep | Global overlay host + window.$toast/$message mount; behavior-critical bootstrap surface. |
| R4 | apps/web-demo/src/plugins/modules/primevue.ts | `primevue/config` (PrimeVue plugin) | web-demo bootstrap | web-demo bootstrap | no | no | yes | high | high | no | keep | `setupPrimeVue(app)` performs `app.use(PrimeVue, ...)` with adapter config + locale. |
| R5 | apps/web-demo/src/types/components.d.ts | `typeof import('primevue/...')` (many) | generated (unplugin-vue-components) | generated | no | yes | no | high | high | no | keep | Auto-generated global component type declarations; excluded per rule 2. |
| R6 | apps/web-demo/src/views/example/hooks/use-app-element-size.vue | `primevue/tag` (default, TSX render fn + template) | web-demo example page | @ccd/vue-ui `CcdTag` | no | no | no | low | low | **yes** | **migrate + remove row** | Single default import used in TSX render function (auto-import does not apply to JSX). `createCcdPrimeControl` pattern already exists in `CcdPrimeControls`; adding `CcdTag` is a small, testable wrapper with no ref forwarding needed. Template `<Tag>` also migrated to `<CcdTag>` for consistency. |

## Showcase exceptions (out of scope)

Path-scoped exception: `apps/web-demo/src/views/example/components/primevue-collection/**` via `isPrimeVueCollectionExampleFile()` in `scripts/ai-architecture-guard.mjs`. Owner-accepted per D-017 Option D; not modified in P20.

## Conclusion

Exactly one safe, behavior-preserving row qualifies for P20: **R6** (`use-app-element-size.vue` → `CcdTag`).

Selected for Phase 3 slice. Expected exact allowlist count: 6 → 5.
