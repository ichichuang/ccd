# M5 PrimeVue Allowlist Reduction Preparation

M5 does not reduce allowlists. This report prepares future reduction by grouping current direct PrimeVue imports by owner and migration path.

| current_file | current_allowlist_type | import_or_usage | target_owner | can_remove_without_source_migration | wrapper_or_adapter_needed | migration_complexity | future_lane | related_issue_ids | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `apps/web-demo/src/plugins/modules/primevue.ts` | approved-app-plugin-integration | `primevue/config` install | app plugin shell plus `@ccd/vue-primevue-adapter` | no | existing adapter config/services are already used | low | none | C-06 | Should remain as app bootstrap install point. |
| `apps/desktop/src/plugins/index.ts` | approved-app-plugin-integration | `primevue/config` install | desktop plugin shell plus adapter | no | existing adapter config/services | low | none | C-06 | App install integration is legitimate. |
| `apps/web-demo/build/plugins.ts` | approved-build-plugin-integration | `@primevue/auto-import-resolver` | web-demo build tooling | no | build tooling owns resolver | low | none | C-06 | Build-time only; not a runtime wrapper target. |
| `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` | approved-app-global-ui-shell | Toast, ConfirmPopup, DynamicDialog, `useToast`, `usePrimeVue`, icons | app global shell plus `@ccd/vue-primevue-adapter` services | no | adapter may expose more generic service/icon wrappers later | mid | M7-primevue-shell-cleanup | C-06 | Keep until app global host can be narrowed without behavior changes. |
| `apps/web-demo/src/hooks/layout/useAdminBreadcrumbs.ts` | approved-exact-app-allowlist | type import from `primevue/tieredmenu` | `@ccd/vue-ui` or app layout type facade | no | CCD-owned menu item type or package wrapper | mid | M7-layout-primevue-types | C-06 | Type import can move only after a type facade exists. |
| `apps/web-demo/src/router/utils/helper.ts` | approved-exact-app-allowlist | type import from `primevue/menuitem` | app router facade or `@ccd/vue-ui` menu contract | no | menu item contract wrapper | mid | M7-router-menu-type-cleanup | C-06 | Router menu shape is app-specific today. |
| `apps/web-demo/src/layouts/components/admin/AdminSidebarMenuCollapsed.tsx` | approved-exact-app-allowlist | `primevue/tooltip` | `@ccd/vue-primevue-adapter` directive/service facade or app layout shell | no | tooltip directive adapter | low-mid | M7-layout-primevue-types | C-06 | Layout shell exception; do not broaden. |
| `apps/web-demo/src/layouts/components/admin/AdminSidebarMenuInline.tsx` | approved-exact-app-allowlist | `primevue/tooltip` | `@ccd/vue-primevue-adapter` directive/service facade or app layout shell | no | tooltip directive adapter | low-mid | M7-layout-primevue-types | C-06 | Same as collapsed menu. |
| `apps/web-demo/src/types/components.d.ts` | approved-exact-app-allowlist/generated type registry | dynamic import calls for PrimeVue auto components | generated type output | no | none; generated registry | high | M7-generated-type-cleanup only if generator changes | C-06 | Do not manually edit generated type registry. |
| `apps/web-demo/src/views/dashboard/index.vue` | approved-exact-app-allowlist | direct PrimeVue imports from M4 inventory | `@ccd/vue-ui` primitives or app feature cleanup | no | component wrapper/source migration | mid | M7-dashboard-ui-cleanup | C-06 | Future source lane can remove exact app allowlist after wrapper migration. |
| `apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue` | approved-exact-app-allowlist | example direct PrimeVue usage | example cleanup or `@ccd/vue-ui` | no | wrapper or demo rewrite | low | M7-demo-cleanup | C-06 | Demo-only; lower priority than app shell. |
| `apps/web-demo/src/views/example/hooks/use-app-element-size.vue` | approved-exact-app-allowlist | example direct PrimeVue usage | example cleanup or `@ccd/vue-ui` | no | wrapper or demo rewrite | low | M7-demo-cleanup | C-06 | Keep until demo cleanup lane. |
| `apps/web-demo/src/views/example/system-configuration/layout.vue` | approved-exact-app-allowlist | example/system config direct PrimeVue usage | example cleanup or `@ccd/vue-ui` | no | wrapper or demo rewrite | low | M7-demo-cleanup | C-06 | System configuration examples are not business feature code. |
| `apps/web-demo/src/views/example/components/primevue-collection/**` | path-scoped showcase exception | direct PrimeVue showcase imports | showcase/demo owner | no | none until demo is redesigned | high | M7-demo-cleanup | C-06 | 12 showcase exception rows remain by design. |
| `packages/vue-ui/src/**` | vue-ui-internal-primevue-composition | internal PrimeVue composition | `@ccd/vue-ui` | no | no wrapper required; this is the wrapper owner | none | none | C-06, D-11 | Allowed internally, but raw PrimeVue public re-exports remain forbidden. |
| `packages/vue-primevue-adapter/src/**` | primevue-adapter-owned | PrimeVue services, PT, theme, locale | `@ccd/vue-primevue-adapter` | no | none | none | none | C-06 | Correct owner for PrimeVue integration. |

## Reduction Strategy

1. Keep C-06 `OPEN`; M5 does not reduce exact allowlists.
2. Preserve app plugin/bootstrap and generated type registry exceptions.
3. Prioritize future reduction for app feature/demo exact imports that can move behind `@ccd/vue-ui`.
4. Keep showcase exceptions until a demo cleanup lane rewrites or removes the PrimeVue collection pages.
5. Do not touch the M4 owner-decision item (`safeStorage/crypto.ts`) in PrimeVue planning; it remains blocked under B-07.

## Counts

- Current PrimeVue inventory baseline: 163 rows from M4.
- Exact app allowlist baseline: 70 rows from M4.
- Showcase exception baseline: 12 rows from M4.
- M5 immediate removable rows without source migration: 0.
- Future reduction candidate groups: 7.
