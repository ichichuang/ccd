# P13 PrimeVue M12 Owner Decision Analysis

## Inventory (M4/M5 baseline)

| Metric | Count | Source |
|--------|-------|--------|
| Total PrimeVue import rows | 163 | M4 audit |
| Exact app allowlist rows | 70 | M4 audit |
| Showcase exception rows | 12 | M4 audit (path-scoped `primevue-collection/**`) |
| Removable without source migration | 0 | M5 analysis |
| Future reduction candidate groups | 7 | M5 plan |

## Allowlist rows by migration path

| current_file | migration_path | complexity |
|---|---|---|
| `AdminSidebarMenuCollapsed.tsx` | `@ccd/vue-primevue-adapter` tooltip directive | low-mid (E1) |
| `AdminSidebarMenuInline.tsx` | `@ccd/vue-primevue-adapter` tooltip directive | low-mid (E1) |
| `AppPrimeVueGlobals.vue` | `@ccd/vue-primevue-adapter` service/icon facades | mid (E1) |
| `useAdminBreadcrumbs.ts` | `@ccd/vue-ui` menu type facade | mid (E2) |
| `router/utils/helper.ts` | `@ccd/vue-ui` menu type facade | mid (E2) |
| `dashboard/index.vue` | `@ccd/vue-ui` component wrappers | mid (E2) |
| example hooks/layout files | demo cleanup or `@ccd/vue-ui` | low (E2/E3) |
| `components.d.ts` | generated registry — no hand-edit | high (E4) |
| `primevue-collection/**` | long-lived showcase exception | high (E3, keep per D-017 Option D) |
| bootstrap/plugin/build files | remain app-owned | none (keep) |

## Decision table

| option_id | description | approved | source_migration_required | guard_change_required | expected_allowlist_reduction | validation_required | risk | recommendation |
|---|---|---|---|---|---|---|---|---|
| A | Keep exact allowlist and showcase exceptions as documented debt | yes | no | no | 0 | ai:guard | low | keep as guard posture baseline |
| D | Keep showcase paths as long-lived demo exceptions; block new non-showcase direct imports | yes | no | no | 0 | ai:guard | low | keep showcase exception scope |
| E | Approve staged reduction lane by feature slice | yes | yes | yes (after migration) | 2–7 rows per slice | full matrix per slice | mid | **proceed P14** |
| E1 | Adapter-only global PrimeVue service/config/directive reduction | yes | yes (adapter) | yes | 2–3 rows | adapter build + web-demo type-check + ai:guard | low-mid | **first slice** |
| E2 | Simple app component usages behind `@ccd/vue-ui` | yes | yes (vue-ui) | yes | 3–5 rows | vue-ui test + web-demo test + ai:guard | mid | second slice |
| E3 | Showcase-only cleanup or explicit long-lived demo exception | yes (keep exception) | optional | optional | 0 (keep) | visual/e2e smoke | high | defer cleanup; keep per Option D |
| E4 | Generated typing and resolver boundary review | yes | no (review only) | no | 0 | api:report + type-check | low | review-only slice |

## Visual/e2e risk

- E1 touches admin sidebar tooltip and global PrimeVue shell — layout regression risk on collapsed/inline menu hover.
- E2 touches dashboard and router menu types — breadcrumb/navigation regression risk.
- E3 showcase cleanup deferred — no immediate risk.
- E4 review-only — no runtime change.

## Recommended staged reduction order

1. **E1** — adapter-only (tooltip directive + global service/icon narrowing)
2. **E2** — vue-ui menu type facades + dashboard migration
3. **E4** — generated typing/resolver boundary review
4. **E3** — keep showcase as long-lived debt unless owner requests cleanup

## Residual after all slices

Bootstrap installs (`primevue.ts`, desktop plugins, `build/plugins.ts`), generated `components.d.ts`, and showcase `primevue-collection/**` remain as owner-accepted residual allowlist debt unless completion criteria change.
