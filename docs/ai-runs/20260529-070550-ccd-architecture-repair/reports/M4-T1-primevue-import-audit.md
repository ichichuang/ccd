# M4-T1 PrimeVue Import Audit

## Scope

- Target task: `P1-UIBoundary-Audit`
- Target areas: `apps/web-demo/**`, `apps/desktop/**`, `packages/vue-ui/**`, `packages/vue-primevue-adapter/**`
- Evidence: `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-T1-20260529-074704-primevue-import-audit.log`

## Summary

Direct `primevue/*` or `@primevue/*` imports exist in 37 files.

| Classification | Files | Boundary assessment |
|---|---:|---|
| Adapter | 2 | Expected: `@ccd/vue-primevue-adapter` owns global theme/PT/service integration. |
| App bootstrap/build tooling | 3 | Expected with current architecture: apps install PrimeVue and configure auto component resolver. |
| Generated component declarations | 1 | Expected generated typing surface. |
| App global PrimeVue service surface | 1 | Allowed only as app shell/global surface; candidate for later adapter helper extraction. |
| App shell/layout/navigation | 9 | Existing app-level usage; candidate for gradual CCD wrapper extraction, not a same-lane rewrite. |
| App/domain/example components | 17 | Existing examples and demo surfaces; should not block policy, but future guard needs exceptions or migration plan. |
| Package primitives | 2 | `@ccd/vue-ui` composes PrimeVue internally for CCD primitives; no raw PrimeVue re-export found. |
| Desktop app component | 1 | Existing app-local usage; candidate for future wrapper once desktop UI boundary is stricter. |
| Tests/mocks | Not counted in 37 direct source files | Test mocks reference PrimeVue services/config and should remain allowed in tests. |

## Classified files

| File | Classification | Notes |
|---|---|---|
| `packages/vue-primevue-adapter/src/index.ts` | Adapter | Exports adapter config/PT helpers; expected. |
| `packages/vue-primevue-adapter/src/services.ts` | Adapter | Owns Toast/Confirm/Dialog/Tooltip service installation; expected. |
| `apps/web-demo/src/plugins/modules/primevue.ts` | App bootstrap | Installs PrimeVue with adapter config and services; expected. |
| `apps/desktop/src/plugins/index.ts` | App bootstrap | Installs PrimeVue with adapter config and services; expected. |
| `apps/web-demo/build/plugins.ts` | Build tooling | Uses `PrimeVueResolver`; expected. |
| `apps/web-demo/src/types/components.d.ts` | Generated declarations | Generated component typings; do not edit manually. |
| `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` | App global service surface | Owns global Toast/ConfirmPopup/DynamicDialog shell and locale sync. |
| `apps/web-demo/src/layouts/modules/LayoutAdmin.tsx` | App shell/layout | Uses `Drawer`. |
| `apps/web-demo/src/layouts/components/User/index.vue` | App shell/layout | Uses `Popover` and `Button`. |
| `apps/web-demo/src/layouts/components/admin/AdminBreadcrumbBar.vue` | App shell/layout | Uses `TieredMenu`. |
| `apps/web-demo/src/layouts/components/admin/AdminMenuPopup.tsx` | App shell/layout | Uses `TieredMenu`. |
| `apps/web-demo/src/layouts/components/admin/AdminSidebarMenuCollapsed.tsx` | App shell/layout | Uses `Tooltip`. |
| `apps/web-demo/src/layouts/components/admin/AdminSidebarMenuInline.tsx` | App shell/layout | Uses `PanelMenu` and `Tooltip`. |
| `apps/web-demo/src/layouts/components/GlobalSetting/SettingsContent.vue` | App shell/layout | Uses settings form controls. |
| `apps/web-demo/src/hooks/layout/useAdminBreadcrumbs.ts` | App shell/layout | Type-only `TieredMenu`. |
| `apps/web-demo/src/router/utils/helper.ts` | App shell/layout | Type-only `MenuItem`. |
| `apps/web-demo/src/components/PrimeDialog/PrimeVueDialog.vue` | App component wrapper | PrimeDialog wrapper around PrimeVue Dialog. |
| `apps/web-demo/src/components/PrimeDialog/utils/types.ts` | App component wrapper | PrimeDialog types. |
| `apps/web-demo/src/components/ProTable/components/ProTableCrudFormModalBody.tsx` | App/domain component | ProTable CRUD body uses `Button`. |
| `apps/web-demo/src/components/ProTable/components/ProTableCrudViewModalBody.tsx` | App/domain component | ProTable CRUD body uses `Button`. |
| `apps/web-demo/src/views/dashboard/index.vue` | App/domain component | Dashboard action button. |
| `apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue` | Example | Uses `TieredMenu`. |
| `apps/web-demo/src/views/example/hooks/use-app-element-size.vue` | Example | Uses `Tag`. |
| `apps/web-demo/src/views/example/system-configuration/layout.vue` | Example | Type-only `Popover`. |
| `apps/web-demo/src/views/example/components/primevue-collection/overview/index.vue` | Example | Uses `useConfirm`. |
| `apps/web-demo/src/views/example/components/primevue-collection/prime-dialog/index.vue` | Example | Uses `Button`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-form/advanced/index.vue` | Example | Uses `Button`, `InputText`, `Select`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/components/ColorPickerField.tsx` | Example | Uses `InputText`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/components/MyColorCustomInput.tsx` | Example | Uses `InputText`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-table/advanced/index.vue` | Example | Uses `useConfirm`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-table/advanced/configs/columns.tsx` | Example | Uses `Button`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-table/columns/columns.tsx` | Example | Uses `Button`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-table/form-table-combo/components/TablePanel.vue` | Example | Uses `Button`. |
| `apps/web-demo/src/views/example/components/primevue-collection/pro-table/server/columns.tsx` | Example | Uses `Tag`. |
| `packages/vue-ui/src/CScrollbar/CScrollbar.vue` | Package primitive | Uses `usePrimeVue` only for locale-derived aria label. |
| `packages/vue-ui/src/EmptyState/EmptyState.vue` | Package primitive | Composes PrimeVue `Button` internally; no raw re-export. |
| `apps/desktop/src/views/DesktopHome.vue` | Desktop app component | Uses `Button`. |

## Boundary conclusion

- Adapter and app bootstrap placement already match the current architecture.
- `packages/vue-ui` is a CCD primitive package, not a PrimeVue re-export bucket.
- Existing app/example direct imports are too broad for an immediate guard without a policy and migration exception list.
- Guard enforcement should remain blocked until the proposed policy is reviewed and accepted.
