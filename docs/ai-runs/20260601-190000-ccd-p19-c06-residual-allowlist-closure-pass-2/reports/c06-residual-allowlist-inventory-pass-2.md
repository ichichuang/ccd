# C-06 Residual PrimeVue Allowlist Inventory — Pass 2

Source: `approvedPrimeVueAppImportFiles` in `scripts/ai-architecture-guard.mjs` (count = 7 after P17).

Decision rules applied:
1. Exclude showcase rows.
2. Exclude generated type rows unless resolvable through owning generator or typed facade.
3. Exclude bootstrap/global install rows unless an existing adapter API preserves behavior.
4. Prefer type-only rows and adapter-owned wrappers.
5. If no safe row exists, record `P19_NO_SAFE_RESIDUAL_REDUCTION`.

| row_id | file | primevue_import | current_owner | target_owner | showcase | generated_type | app_bootstrap | migration_cost | behavior_risk | can_fix_in_p19 | proposed_action | reason |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R1 | apps/desktop/src/plugins/index.ts | `primevue/config` (PrimeVue plugin) | desktop bootstrap | desktop bootstrap | no | no | yes | high | high | no | keep | Global PrimeVue plugin install at desktop app bootstrap; `app.use(PrimeVue, ...)` cannot be re-expressed through a wrapper without breaking install semantics. Already uses adapter config + `installPrimeVueServices`. |
| R2 | apps/web-demo/build/plugins.ts | `@primevue/auto-import-resolver` | web-demo build config | web-demo build config | no | no | yes | high | high | no | keep | Build-time unplugin resolver that powers template auto-import + tree-shaking. Removing it would break the auto-import pipeline the rest of the app depends on. |
| R3 | apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue | `primevue/toast`, `primevue/confirmpopup`, `primevue/dynamicdialog`, `primevue/usetoast`, `primevue/config` | web-demo bootstrap | web-demo bootstrap | no | no | yes | high | high | no | keep | Global overlay host + `useToast`/`usePrimeVue` runtime service wiring and `window.$toast`/`window.$message` mount. Behavior-critical bootstrap surface; no equivalent adapter facade preserves the global mount. |
| R4 | apps/web-demo/src/plugins/modules/primevue.ts | `primevue/config` (PrimeVue plugin) | web-demo bootstrap | web-demo bootstrap | no | no | yes | high | high | no | keep | `setupPrimeVue(app)` performs `app.use(PrimeVue, ...)` with adapter config + locale. Same install-semantics constraint as R1. |
| R5 | apps/web-demo/src/types/components.d.ts | `typeof import('primevue/...')` (many) | generated (unplugin-vue-components) | generated | no | yes | no | high | high | no | keep | Auto-generated global component type declarations. Manually editing generated output is forbidden; regenerating it still emits raw `primevue/*` type references by design. Excluded per rule 2. |
| R6 | apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue | `primevue/tieredmenu` (default) | web-demo example page | @ccd/vue-ui `CcdTieredMenu` | no | no | no | low | low | **yes** | **migrate + remove row** | Single default import used as `<TieredMenu>` in template with `:ref` calling only `.hide()`/`.toggle()`. `@ccd/vue-ui` already exports `CcdTieredMenu` (forwards `toggle/show/hide` + `container/target`). Production `AdminBreadcrumbBar.vue` already uses `import { CcdTieredMenu as TieredMenu } from '@ccd/vue-ui'` with the same `useAdminBreadcrumbs` hook — proven, behavior-preserving pattern. |
| R7 | apps/web-demo/src/views/example/hooks/use-app-element-size.vue | `primevue/tag` (default, used inside TSX render fn) | web-demo example page | (none yet) | no | no | no | medium | medium | no | defer | `Tag` is used inside a `defineComponent` TSX render function (auto-import does not apply to JSX). No `CcdTag` wrapper exists today; migrating would require authoring a new wrapper, which adds risk beyond a single proven swap. Deferred to keep this lane to one minimal, safe slice. |

## Conclusion

Exactly one safe, behavior-preserving row qualifies for P19: **R6** (`layout-breadcrumbs.vue` → `CcdTieredMenu`).

Selected for Phase 3 slice. Expected exact allowlist count: 7 → 6.
