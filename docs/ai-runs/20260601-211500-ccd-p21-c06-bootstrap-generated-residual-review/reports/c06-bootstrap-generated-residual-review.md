# C-06 Bootstrap / Generated Residual Allowlist Review (P21)

Source: `approvedPrimeVueAppImportFiles` in `scripts/ai-architecture-guard.mjs` (count = **5** after P20).

P21 scope: review only the five bootstrap/generated/global-shell rows remaining after P17–P20 feature-wrapper reductions. Showcase (`primevue-collection/**`) out of scope.

## Review table

| row_id | file | primevue_import_or_allowlist_reason | role | current_owner | target_owner_candidate | generated_by_tool | bootstrap_install | global_shell | desktop_runtime | behavior_risk | can_remove_in_p21 | required_source_change | validation_required | decision | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | `apps/desktop/src/plugins/index.ts` | `primevue/config` (`PrimeVue` plugin) | desktop-plugin-install | desktop app bootstrap | `@ccd/vue-primevue-adapter` unified `installPrimeVueRuntime` (not approved in P21) | no | yes | no | yes | high | no | New adapter bootstrap API + desktop migration; dual-app parity with R4 | `ai:guard`, desktop build, smoke | keep | `app.use(PrimeVue, …)` is the canonical plugin install boundary. Adapter owns config/services but not the plugin object re-export. Consolidation is M6 Option C global-shell work, not a proven P21 narrow slice. |
| R2 | `apps/web-demo/build/plugins.ts` | `@primevue/auto-import-resolver` (`PrimeVueResolver`) | build-time-resolver | web-demo Vite build | none in-repo without build-package split | no | yes (build) | no | no | high | no | Move resolver into governed build package or replace unplugin output semantics | `drift-check`, `build:web-demo`, component d.ts regen | keep | Build-time resolver drives template auto-import and tree-shaking. Byte-compatible output not proven without owning generator/resolver lane (P14 E4). |
| R3 | `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` | `primevue/toast`, `confirmpopup`, `dynamicdialog`, `usetoast`, `config` | global-component-shell | web-demo layout bootstrap | adapter global-shell hosts (not implemented) | no | partial | yes | no | high | no | Shell component facades for Toast/ConfirmPopup/DynamicDialog + composable re-exports; preserve `window.$toast` / `$message` | visual smoke, web-demo tests, e2e toast groups | keep | Behavior-critical global overlay host (six Toast groups, locale watch, route dialog reset). Adapter already wraps APIs used here but not the host components. |
| R4 | `apps/web-demo/src/plugins/modules/primevue.ts` | `primevue/config` (`PrimeVue` plugin) | web-plugin-install | web-demo plugin module | same as R1 (`installPrimeVueRuntime`) | no | yes | no | no | high | no | Adapter bootstrap API + preserve `PRIME_DIALOG_RUNTIME_CONFIG_KEY` provide | `ai:guard`, web-demo type-check/test/build | keep | `setupPrimeVue` couples locale, size store, and dialog runtime provide. Same bootstrap class as R1; removing one row without the other breaks parity. |
| R5 | `apps/web-demo/src/types/components.d.ts` | `typeof import('primevue/…')` (many) | generated-type-registry | unplugin-vue-components | generator/resolver only | yes (`unplugin-vue-components`) | no | no | no | high | no | Change Components resolver/registry so generated types reference `@ccd/vue-ui` or adapter facades | regen `components.d.ts`, `type-check`, `drift-check` | keep | File is generated; manual edit forbidden. P14 E4 documented registry boundary. Removal requires owning tool output change, not app edit. |

## Cross-row findings

- P17–P20 removed only **feature/example** rows (type facade, `CcdTieredMenu`, `CcdTag`). All five remaining rows are bootstrap, build, global shell, or generated registry — matching P20 pass-3 inventory conclusions.
- Hypothetical `installPrimeVueRuntime` in `@ccd/vue-primevue-adapter` could relocate R1/R4 `primevue/config` imports into the adapter package (already allowed), but that is **global install architecture** (M6 Option C), requires owner approval for a new public bootstrap API, and must migrate **both** desktop and web plugin entrypoints to preserve parity. Not eligible as a single-row P21 slice.
- No row qualifies under P21 decision rules 1–4 without broader architecture approval.

## Conclusion

**`P21_NO_SAFE_RESIDUAL_REDUCTION`** — retain all 5 exact allowlist rows as owner-accepted residual under bootstrap/generated constraints.
