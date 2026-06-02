# M1 Apps Public Capability Inventory

## Scope

Tracked files under `apps/**` were inventoried with `git ls-files apps`. Build artifacts, node_modules, and ignored files are excluded by git ownership.

## App file counts

| App | Tracked files |
| --- | --- |
| desktop | 14 |
| web-demo | 434 |

## Classification counts

| Classification | Count | Meaning |
| --- | --- | --- |
| APP_COMPATIBILITY_FACADE | 47 | app facade delegating to governed package while preserving imports/API |
| APP_OWNED_PLUGIN_SHELL | 25 | app bootstrap/plugin installation shell |
| APP_OWNED_ROUTE_OR_FEATURE | 163 | route, layout, locale, asset, or app feature surface |
| APP_OWNED_RUNTIME_ADAPTER | 61 | browser/Tauri/API/runtime adapter or integration boundary |
| APP_OWNED_STORE | 20 | concrete Pinia/app state owner |
| DEMO_OR_SHOWCASE | 105 | example/demo/showcase surface |
| GENERATED_OWNED | 3 | generated app output or generated typing registry |
| NEEDS_OWNER_DECISION | 17 | candidate requires owner/package/manifest decision before migration |
| NOT_SAFE_TO_MOVE | 7 | runtime/security/dependency movement not approved |

## M1 decision

M1 performs inventory only. No production code was changed. Candidates that look reusable but need package-owner, manifest, or runtime-risk decisions are marked `NEEDS_OWNER_DECISION` and deferred to M2 batch planning.

## Full inventory

| Path | Classification | Owner | Reason | Candidate |
| --- | --- | --- | --- | --- |
| apps/desktop/index.html | APP_OWNED_PLUGIN_SHELL | desktop | app manifest/config/shell entry; not a shared runtime module | - |
| apps/desktop/package.json | APP_OWNED_PLUGIN_SHELL | desktop | app manifest/config/shell entry; not a shared runtime module | - |
| apps/desktop/src-tauri/capabilities/default.json | APP_OWNED_RUNTIME_ADAPTER | desktop | Tauri config/capability surface; desktop adapter owner | - |
| apps/desktop/src-tauri/tauri.conf.json | APP_OWNED_RUNTIME_ADAPTER | desktop | Tauri config/capability surface; desktop adapter owner | - |
| apps/desktop/src/App.vue | APP_OWNED_PLUGIN_SHELL | desktop | app bootstrap/root shell | - |
| apps/desktop/src/adapters/index.ts | APP_OWNED_RUNTIME_ADAPTER | desktop | app runtime adapter/capability bridge owner | - |
| apps/desktop/src/main.ts | APP_OWNED_PLUGIN_SHELL | desktop | app bootstrap/root shell | - |
| apps/desktop/src/plugins/index.ts | APP_OWNED_PLUGIN_SHELL | desktop | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/desktop/src/router/index.ts | APP_OWNED_ROUTE_OR_FEATURE | desktop | app route table/router instance | - |
| apps/desktop/src/router/routes.ts | APP_OWNED_ROUTE_OR_FEATURE | desktop | app route table/router instance | - |
| apps/desktop/src/theme/index.ts | NEEDS_OWNER_DECISION | desktop | desktop pure theme var derivation may belong in design-tokens, DOM write remains app-owned | M3-DESKTOP-THEME |
| apps/desktop/src/views/DesktopHome.vue | APP_OWNED_ROUTE_OR_FEATURE | desktop | route view or feature page | - |
| apps/desktop/tsconfig.json | APP_OWNED_PLUGIN_SHELL | desktop | app manifest/config/shell entry; not a shared runtime module | - |
| apps/desktop/vite.config.ts | NEEDS_OWNER_DECISION | desktop | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/compress.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/html.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/info.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/optimize.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/performance.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/plugins.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/resolvers/primevue.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/build/utils.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
| apps/web-demo/index.html | APP_OWNED_PLUGIN_SHELL | web-demo | app manifest/config/shell entry; not a shared runtime module | - |
| apps/web-demo/package.json | APP_OWNED_PLUGIN_SHELL | web-demo | app manifest/config/shell entry; not a shared runtime module | - |
| apps/web-demo/public/face.png | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/public/lottie/003.json | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/public/lottie/airplane.json | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/public/lottie/loading-002.json | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/public/lottie/loading-003.json | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/App.vue | APP_OWNED_PLUGIN_SHELL | web-demo | app bootstrap/root shell | - |
| apps/web-demo/src/adapters/charts/UseEcharts.vue | APP_COMPATIBILITY_FACADE | web-demo | app facade over @ccd/vue-charts preserving app import path | - |
| apps/web-demo/src/adapters/http.adapter.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app runtime adapter/capability bridge owner | - |
| apps/web-demo/src/adapters/http.adapter.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app runtime adapter/capability bridge owner | - |
| apps/web-demo/src/adapters/logger.adapter.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app runtime adapter/capability bridge owner | - |
| apps/web-demo/src/api/README.md | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/api/auth/auth.api.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/api/example/httpAdvanced.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/api/example/todos.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/api/example/users.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/api/example/users.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/api/system/preferences.api.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/api/system/system.api.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app API/mock/alova boundary; contracts already govern shared HTTP shapes | - |
| apps/web-demo/src/assets/icons/custom/juejin.svg | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/images/default-avatar.png | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/images/face.png | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/ambient-orb-animations.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/animate-lite.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/custom-nprogress.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/custom-primevue.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/interaction.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/reset.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/data-region-transitions.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/modes/circle.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/modes/curtain.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/modes/diamond.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/modes/fade.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/modes/glitch.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/modes/implosion.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/assets/styles/theme/transitions.scss | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app asset/style surface | - |
| apps/web-demo/src/constants/brand.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/breakpoints.ts | APP_COMPATIBILITY_FACADE | web-demo | design-token compatibility facade over @ccd/design-tokens | - |
| apps/web-demo/src/constants/business.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/dashboardAlert.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/employee.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/gender.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/index.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/orderStatus.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/product.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/taskBoard.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/transactionLedger.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/enums/userAccountStatus.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/http.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/layout-menu.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/layout.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/locale.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/mock.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/router.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/runtime.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/runtime.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/constants/size.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | design-token compatibility facade over @ccd/design-tokens | - |
| apps/web-demo/src/constants/size.ts | APP_COMPATIBILITY_FACADE | web-demo | design-token compatibility facade over @ccd/design-tokens | - |
| apps/web-demo/src/constants/sizeScale.ts | APP_COMPATIBILITY_FACADE | web-demo | design-token compatibility facade over @ccd/design-tokens | - |
| apps/web-demo/src/constants/theme.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | design-token compatibility facade over @ccd/design-tokens | - |
| apps/web-demo/src/constants/theme.ts | APP_COMPATIBILITY_FACADE | web-demo | design-token compatibility facade over @ccd/design-tokens | - |
| apps/web-demo/src/constants/theme/colorUsage.ts | APP_COMPATIBILITY_FACADE | web-demo | design-token compatibility facade over @ccd/design-tokens | - |
| apps/web-demo/src/constants/validation.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app domain/runtime constant | - |
| apps/web-demo/src/directives/auth.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app permission/DOM directive tied to stores or app policy | - |
| apps/web-demo/src/directives/auth.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app permission/DOM directive tied to stores or app policy | - |
| apps/web-demo/src/directives/index.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app permission/DOM directive tied to stores or app policy | - |
| apps/web-demo/src/directives/longPress.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | re-export facade over @ccd/vue-hooks directive | - |
| apps/web-demo/src/directives/longPress.ts | APP_COMPATIBILITY_FACADE | web-demo | re-export facade over @ccd/vue-hooks directive | - |
| apps/web-demo/src/directives/swipe.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | re-export facade over @ccd/vue-hooks directive | - |
| apps/web-demo/src/directives/swipe.ts | APP_COMPATIBILITY_FACADE | web-demo | re-export facade over @ccd/vue-hooks directive | - |
| apps/web-demo/src/directives/tap.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | re-export facade over @ccd/vue-hooks directive | - |
| apps/web-demo/src/directives/tap.ts | APP_COMPATIBILITY_FACADE | web-demo | re-export facade over @ccd/vue-hooks directive | - |
| apps/web-demo/src/hooks/layout/useAdminBreadcrumbs.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useAdminTabs.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useAdminTabs.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useLayoutRuntime.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useLoading.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useLoading.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useMenuRenderer.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useMenuVisuals.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/useNprogress.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/usePageTitle.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/layout/usePageTitle.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useAuth.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useAuth.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useAutoMitt.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | facade over @ccd/vue-hooks createAutoMittHook | - |
| apps/web-demo/src/hooks/modules/useAutoMitt.ts | APP_COMPATIBILITY_FACADE | web-demo | facade over @ccd/vue-hooks createAutoMittHook | - |
| apps/web-demo/src/hooks/modules/useDateUtils.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useDialog.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | app i18n/router convenience facade over @ccd/vue-ui | - |
| apps/web-demo/src/hooks/modules/useDialog.tsx | APP_COMPATIBILITY_FACADE | web-demo | app i18n/router convenience facade over @ccd/vue-ui | - |
| apps/web-demo/src/hooks/modules/useHttpRequest.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useHttpRequest.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useLocale.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/usePermissionRoutes.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useProTableUrlSync.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | app i18n/router convenience facade over @ccd/vue-ui | - |
| apps/web-demo/src/hooks/modules/useProTableUrlSync.ts | APP_COMPATIBILITY_FACADE | web-demo | app i18n/router convenience facade over @ccd/vue-ui | - |
| apps/web-demo/src/hooks/modules/useRecordOverlay.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useThemeSwitch.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/hooks/modules/useThemeSwitch.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app hook coupled to router/store/i18n/http/layout runtime | - |
| apps/web-demo/src/infra/auth/tokenProvider.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app runtime adapter/capability bridge owner | - |
| apps/web-demo/src/infra/auth/tokenProvider.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app runtime adapter/capability bridge owner | - |
| apps/web-demo/src/infra/router/routeProvider.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app route table/router instance | - |
| apps/web-demo/src/infra/router/routeProvider.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app route table/router instance | - |
| apps/web-demo/src/layouts/components/AmbientBackground.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/AnimateRouterView.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/AppContainer.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/AsyncErrorFallback.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/BaseLottieLoader/BaseLottieLoader.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/BaseLottieLoader/index.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/BaseLottieLoader/loadingCircle.json | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/ContextMenuProvider.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/GlobalSetting/SettingsContent.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/GlobalSetting/index.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/GlobalSetting/useGlobalSettingsDialog.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/Loading.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/LoadingFallback.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/LoadingLottie.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/ParentView.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/ToastMessageContent.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/User/index.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminBreadcrumbBar.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminFooterBar.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminHeader.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminMenuPopup.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminSidebar.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminSidebarLogo.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminSidebarMenu.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminSidebarMenuCollapsed.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminSidebarMenuInline.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/AdminTabsBar.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/adminSidebarMenu.shared.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/components/admin/adminSidebarMenu.shared.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/index.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/modules/LayoutAdmin.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/modules/LayoutAdmin.tsx | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/modules/LayoutFullScreen.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/modules/LayoutRatio.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/runtime/layoutRuntime.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/layouts/runtime/layoutRuntime.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app layout/global shell/admin chrome surface | - |
| apps/web-demo/src/locales/index.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/lang/core/en-US.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/lang/core/zh-CN.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/lang/en-US.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/lang/example/en-US.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/lang/example/zh-CN.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/lang/utils/mergeLocale.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/lang/zh-CN.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/primevue-en-US.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/primevue-locales.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/locales/primevue-zh-CN.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app i18n messages and locale runtime | - |
| apps/web-demo/src/main.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app bootstrap/root shell | - |
| apps/web-demo/src/plugins/index.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/authBridge.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/date.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/errorHandler.spec.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/errorHandler.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/locales.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/primevue.spec.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/primevue.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/proform.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/protable.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/router.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/scrollbar.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/modules/stores.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/plugins/setupPlugins.spec.ts | APP_OWNED_PLUGIN_SHELL | web-demo | app plugin/bootstrap wiring and injected runtime shell | - |
| apps/web-demo/src/router/index.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app route table/router instance | - |
| apps/web-demo/src/router/modules/core.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app route table/router instance | - |
| apps/web-demo/src/router/modules/dashboard.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app route table/router instance | - |
| apps/web-demo/src/router/modules/example.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app route table/router instance | - |
| apps/web-demo/src/router/utils/accessControl.ts | NEEDS_OWNER_DECISION | web-demo | mostly pure route access logic, but depends app route/menu shape | M3-ROUTE-ACCESS |
| apps/web-demo/src/router/utils/dynamic.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/guardEffects.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/guards.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/helper.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/index.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/menu.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/moduleLoader.spec.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/moduleLoader.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/permission.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/resolver.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/router/utils/transform.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | router utility coupled to app route meta, loader, logger, or Vue Router | - |
| apps/web-demo/src/stores/index.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/session/index.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/session/permission.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/session/permission.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/session/user.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/session/user.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/device.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/device.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/index.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/layout.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/layout.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/locale.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/locale.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/size.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/size.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/theme.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/system/theme.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/ui/index.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/ui/tableDrawer.spec.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/stores/modules/ui/tableDrawer.ts | APP_OWNED_STORE | web-demo | concrete Pinia/app state owner | - |
| apps/web-demo/src/sync/middleware.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/registry.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/runtime.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/setup.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/socket.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/syncAction.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/syncAction.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/guards.ts | NEEDS_OWNER_DECISION | web-demo | mostly pure payload guard, but depends app preference types | M3-SYSTEM-PREF-GUARDS |
| apps/web-demo/src/sync/systemPreferences/index.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/localPersist.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/middleware.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/middleware.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/model.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/model.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/register.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/runtime.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/socket.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/sync/systemPreferences/state.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | app sync runtime/store integration | - |
| apps/web-demo/src/types/api.ts | NEEDS_OWNER_DECISION | web-demo | DTO/Zod schema candidate; contracts package has no zod dependency approval | M3-DTO-CONTRACTS |
| apps/web-demo/src/types/auto-imports.d.ts | GENERATED_OWNED | web-demo | generated typing/registry output; owning generator must update it | - |
| apps/web-demo/src/types/components.d.ts | GENERATED_OWNED | web-demo | generated typing/registry output; owning generator must update it | - |
| apps/web-demo/src/types/design-state.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/dto/auth.dto.ts | NEEDS_OWNER_DECISION | web-demo | DTO/Zod schema candidate; contracts package has no zod dependency approval | M3-DTO-CONTRACTS |
| apps/web-demo/src/types/dto/system.dto.ts | NEEDS_OWNER_DECISION | web-demo | DTO/Zod schema candidate; contracts package has no zod dependency approval | M3-DTO-CONTRACTS |
| apps/web-demo/src/types/env.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/index.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/index.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/modules/router.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/modules/utils.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/modules/vue.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/systems/device.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/systems/layout.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/systems/preferences.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/systems/size.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/systems/theme.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/testing.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/vue-custom.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/types/vue-data-attributes.d.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | app ambient/module declaration or feature type | - |
| apps/web-demo/src/utils/date/constants.ts | NOT_SAFE_TO_MOVE | web-demo | dayjs plugins, dynamic locale/timezone, mitt/window coupling; no package dependency approval | - |
| apps/web-demo/src/utils/date/dateUtils.ts | NOT_SAFE_TO_MOVE | web-demo | dayjs plugins, dynamic locale/timezone, mitt/window coupling; no package dependency approval | - |
| apps/web-demo/src/utils/date/index.ts | NOT_SAFE_TO_MOVE | web-demo | dayjs plugins, dynamic locale/timezone, mitt/window coupling; no package dependency approval | - |
| apps/web-demo/src/utils/date/timezone.ts | NOT_SAFE_TO_MOVE | web-demo | dayjs plugins, dynamic locale/timezone, mitt/window coupling; no package dependency approval | - |
| apps/web-demo/src/utils/date/types.ts | NOT_SAFE_TO_MOVE | web-demo | dayjs plugins, dynamic locale/timezone, mitt/window coupling; no package dependency approval | - |
| apps/web-demo/src/utils/deviceSync.ts | APP_COMPATIBILITY_FACADE | web-demo | browser collector over @ccd/design-tokens device resolvers | - |
| apps/web-demo/src/utils/guards.ts | APP_COMPATIBILITY_FACADE | web-demo | re-export facade over @ccd/shared-utils | - |
| apps/web-demo/src/utils/http/connection.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/errors.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/index.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/instance.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/interceptors.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/interceptors.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/methods.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/policies/authRefreshPolicy.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/policies/errorMappingPolicy.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/policies/notificationPolicy.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/policies/responseDecodePolicy.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/policies/schemaValidationPolicy.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/requestLayer.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/types.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/uploadManager.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/validation.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/http/validation.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | alova/browser HTTP runtime and policy stack | - |
| apps/web-demo/src/utils/mitt.ts | NEEDS_OWNER_DECISION | web-demo | utility-looking app module requires M2 owner review | M3-PURE-UTILITY-REVIEW |
| apps/web-demo/src/utils/runtime/e2e.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | browser runtime/e2e helper | - |
| apps/web-demo/src/utils/safeStorage/core.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | browser storage adapter; JSON codec already package-owned | - |
| apps/web-demo/src/utils/safeStorage/crypto.ts | NOT_SAFE_TO_MOVE | web-demo | D-016/D-019 keep crypto/compression app-owned; manifest/security risk | - |
| apps/web-demo/src/utils/safeStorage/index.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | browser storage adapter; JSON codec already package-owned | - |
| apps/web-demo/src/utils/safeStorage/lzstring.ts | NOT_SAFE_TO_MOVE | web-demo | D-016/D-019 keep crypto/compression app-owned; manifest/security risk | - |
| apps/web-demo/src/utils/safeStorage/piniaSerializer.spec.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | browser storage adapter; JSON codec already package-owned | - |
| apps/web-demo/src/utils/safeStorage/piniaSerializer.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | browser storage adapter; JSON codec already package-owned | - |
| apps/web-demo/src/utils/safeStorage/safeStorage.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | browser storage adapter; JSON codec already package-owned | - |
| apps/web-demo/src/utils/safeStorage/storageMaintenance.ts | APP_OWNED_RUNTIME_ADAPTER | web-demo | browser storage adapter; JSON codec already package-owned | - |
| apps/web-demo/src/utils/theme/cache.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/color.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/colors.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/colors.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/compiler.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/derive.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/diff.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/engine.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/engine.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/fingerprint.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/graph.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/inspect.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/lottieThemeUtils.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/metadata.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/metrics.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/mode.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/observability.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/patch.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/resolver.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/sizeEngine.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/sizeEngine.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/tokens.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/transitions.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/validate.spec.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/utils/theme/validate.ts | APP_COMPATIBILITY_FACADE | web-demo | delegates pure theme/token work to @ccd/design-tokens; DOM/storage remains app-owned | - |
| apps/web-demo/src/views/dashboard/configs/alerts.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/dashboard/configs/quickAction.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/dashboard/hooks/useChartOptions.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/dashboard/index.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/dashboard/page.state.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/example/architecture/adapters/echarts-adapter.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/adapters/http-adapter.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/directives/auth.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/infra/route-provider.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/infra/token-provider.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/permission/permission-auths.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/permission/permission-roles.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/external-link.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/hidden-tag.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/hide-breadcrumb.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/keep-alive.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/ratio-layout.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/reuse-window.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/router-meta-index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/router-meta/transition.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/device.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/layout.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/locale.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/permission.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/size.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/table-drawer.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/theme.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/stores/user.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/architecture/system-states/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/common/constants.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/common/enums.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/common/types.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/animate-wrapper/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/c-scrollbar/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/empty-state/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/icons/components/IconControls.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/icons/configs/iconLists.generated.ts | GENERATED_OWNED | web-demo | generated typing/registry output; owning generator must update it | - |
| apps/web-demo/src/views/example/components/icons/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/overview/composables/usePrimeVueScrollSpy.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/overview/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/prime-dialog/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/advanced/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/api-events/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/basic/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/dag/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/group/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/playground/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/components/ColorPickerField.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/components/ColorPickerFieldAdapter.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/components/MyColorCustomInput.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/plugins/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/reactions/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-form/validation/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/advanced/configs/columns.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/advanced/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/api-events/columns.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/api-events/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/basic/columns.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/basic/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/columns/columns.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/columns/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/form-table-combo/components/SearchPanel.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/form-table-combo/components/TablePanel.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/form-table-combo/config.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/form-table-combo/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/infinite/columns.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/infinite/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/server/columns.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/server/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/shared/apiExecutor.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/virtual/columns.tsx | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/pro-table/virtual/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/primevue-collection/toast/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/components/ChartDemoCard.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/components/GlobalControls.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/configs/advancedChartConfig.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/configs/basicChartConfig.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/configs/connectChartConfig.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/configs/customThemeConfig.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/configs/dynamicChartConfig.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/configs/eventsRefConfig.ts | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/components/use-echarts/index.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/layout-admin-tabs.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/layout-loading.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/layout-menu-visuals.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/layout-nprogress.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/layout-page-title.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-app-element-size.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-auth.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-auto-mitt.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-chart-theme.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-date-utils.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-http-request.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-locale.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-permission-routes.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-pro-table.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/hooks/use-theme-switch.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/system-configuration/breakpoints.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/system-configuration/layout.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/system-configuration/size.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/system-configuration/theme.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/system-configuration/unocss.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/color-utils.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/device-sync.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/http-advanced.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/ids.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/lodash.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/safe-storage.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/strings-format.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/example/utils/type-casters.vue | DEMO_OR_SHOWCASE | web-demo | example/showcase route surface; not shared package API | - |
| apps/web-demo/src/views/login/components/BrandPanel.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/login/components/HeaderActions.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/login/components/LoginForm.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/login/components/LoginShell.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/login/composables/useLoginSubmit.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/login/index.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/login/types.ts | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/notfound/403.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/notfound/404.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/src/views/notfound/500.vue | APP_OWNED_ROUTE_OR_FEATURE | web-demo | route view or feature page | - |
| apps/web-demo/tsconfig.json | APP_OWNED_PLUGIN_SHELL | web-demo | app manifest/config/shell entry; not a shared runtime module | - |
| apps/web-demo/vite.config.ts | NEEDS_OWNER_DECISION | web-demo | build/generator utility; no governed build package owner in current topology | M6-BUILD-GENERATOR |
