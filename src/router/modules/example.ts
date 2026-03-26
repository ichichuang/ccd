// Unified V2.3 Example Routes

const chartsRoute: RouteConfig = {
  path: '/example/charts',
  name: 'ExampleCharts',
  component: () => import('@/views/example/components/use-echarts/index.vue'),
  meta: {
    titleKey: 'router.example.components.useEcharts',
    rank: 4,
    icon: 'i-lucide-chart-bar',
  },
}

const layoutInspectorRoute: RouteConfig = {
  path: '/example/system-states',
  name: 'ExampleSystemStates',
  component: () => import('@/views/example/architecture/system-states/index.vue'),
  meta: {
    titleKey: 'router.example.architecture.systemStates',
    rank: 4,
    icon: 'i-lucide-panel-right',
  },
}

const permissionRoute: RouteConfig = {
  path: '/example/permission',
  name: 'ExamplePermission',
  redirect: '/example/permission/roles',
  meta: {
    titleKey: 'router.example.architecture.permission.root',
    rank: 5,
    icon: 'i-lucide-shield',
  },
  children: [
    {
      path: '/example/permission/roles',
      name: 'ExamplePermissionRoles',
      component: () => import('@/views/example/architecture/permission/permission-roles.vue'),
      meta: {
        titleKey: 'router.example.architecture.permission.roles',
        rank: 1,
        icon: 'i-lucide-shield-check',
        roles: ['admin'],
      },
    },
    {
      path: '/example/permission/auths',
      name: 'ExamplePermissionAuths',
      component: () => import('@/views/example/architecture/permission/permission-auths.vue'),
      meta: {
        titleKey: 'router.example.architecture.permission.auths',
        rank: 2,
        icon: 'i-lucide-badge-check',
        roles: ['admin', 'user'],
        auths: ['demo:read', 'demo:write'],
      },
    },
  ],
}

const routerMetaRoute: RouteConfig = {
  path: '/example/router-meta',
  name: 'ExampleRouterMeta',
  redirect: '/example/router-meta/index',
  meta: {
    titleKey: 'router.example.architecture.routerMeta.root',
    rank: 6,
    icon: 'i-lucide-route',
  },
  children: [
    {
      path: '/example/router-meta/index',
      name: 'ExampleRouterMetaIndex',
      component: () => import('@/views/example/architecture/router-meta/router-meta-index.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.index',
        rank: 1,
        icon: 'i-lucide-route',
      },
    },
    {
      path: '/example/router-meta/external-link',
      name: 'ExampleExternalLink',
      component: () => import('@/views/example/architecture/router-meta/external-link.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.externalLink',
        rank: 2,
        icon: 'i-lucide-external-link',
        isLink: true,
        linkUrl: 'https://vuejs.org',
      },
    },
    {
      path: '/example/router-meta/hide-breadcrumb',
      name: 'ExampleHideBreadcrumb',
      component: () => import('@/views/example/architecture/router-meta/hide-breadcrumb.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.hideBreadcrumb',
        rank: 3,
        icon: 'i-lucide-navigation',
        hideBreadcrumb: true,
      },
    },
    {
      path: '/example/router-meta/hidden-tag',
      name: 'ExampleHiddenTag',
      component: () => import('@/views/example/architecture/router-meta/hidden-tag.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.hiddenTag',
        rank: 4,
        icon: 'i-lucide-tag',
        hiddenTag: true,
      },
    },
    {
      path: '/example/router-meta/ratio-demo',
      name: 'ExampleRatioDemo',
      component: () => import('@/views/example/architecture/router-meta/ratio-layout.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.ratioLayout',
        rank: 5,
        icon: 'i-lucide-ratio',
        parent: 'ratio',
        ratio: '16:9',
      },
    },
    {
      path: '/example/router-meta/reuse-window',
      name: 'ExampleReuseWindow',
      component: () => import('@/views/example/architecture/router-meta/reuse-window.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.reuseWindow',
        rank: 6,
        icon: 'i-lucide-app-window',
        parent: 'fullscreen',
        reuseWindow: true,
      },
    },
    {
      path: '/example/router-meta/transition-demo',
      name: 'ExampleTransitionDemo',
      component: () => import('@/views/example/architecture/router-meta/transition.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.transition',
        rank: 7,
        icon: 'i-lucide-sparkles',
        transition: {
          name: 'fade-slide',
          enterTransition: 'animate__animated animate__fadeInRight animate__fast',
          leaveTransition: 'animate__animated animate__fadeOutLeft animate__fast',
          duration: '400ms',
        },
      },
    },
  ],
}

const proTableRoute: RouteConfig = {
  path: '/example/primevue-collection/pro-table',
  name: 'ExampleProTable',
  redirect: '/example/primevue-collection/pro-table/basic',
  meta: {
    titleKey: 'router.example.components.primevueCollection.proTable.root',
    rank: 5,
    icon: 'i-lucide-table',
  },
  children: [
    {
      path: '/example/primevue-collection/pro-table/basic',
      name: 'ExampleProTableBasic',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/basic/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.basic',
        rank: 0,
        icon: 'i-lucide-table',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/playground',
      name: 'ExampleProTablePlayground',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/playground/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.playground',
        icon: 'i-lucide-flask-conical',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/height-modes',
      name: 'ExampleProTableHeightModes',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/height-modes/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.heightModes',
        icon: 'i-lucide-maximize-2',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/columns',
      name: 'ExampleProTableColumns',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/columns/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.columns',
        icon: 'i-lucide-columns-3',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/alignment',
      name: 'ExampleProTableAlignment',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/alignment/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.alignment',
        icon: 'i-lucide-align-left',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/column-sizing',
      name: 'ExampleProTableColumnSizing',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/column-sizing/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.columnSizing',
        icon: 'i-lucide-columns',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/server',
      name: 'ExampleProTableServer',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/server/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.server',
        icon: 'i-lucide-globe',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/infinite',
      name: 'ExampleProTableInfinite',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/infinite/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.infinite',
        icon: 'i-lucide-arrow-down-to-line',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/advanced',
      name: 'ExampleProTableAdvanced',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/advanced/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.advanced',
        icon: 'i-lucide-move-horizontal',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/api-events',
      name: 'ExampleProTableApiEvents',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/api-events/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.apiEvents',
        icon: 'i-lucide-webhook',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/virtual',
      name: 'ExampleProTableVirtual',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/virtual/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.virtual',
        icon: 'i-lucide-gauge',
      },
    },
  ],
}

const proFormRoute: RouteConfig = {
  path: '/example/primevue-collection/pro-form',
  name: 'ExampleProForm',
  redirect: '/example/primevue-collection/pro-form/basic',
  meta: {
    titleKey: 'router.example.components.primevueCollection.proForm.root',
    rank: 4,
    icon: 'i-lucide-form-input',
  },
  children: [
    {
      path: '/example/primevue-collection/pro-form/playground',
      name: 'ExampleProFormPlayground',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/playground/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.playground',
        rank: 0,
        icon: 'i-lucide-flask-conical',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/basic',
      name: 'ExampleProFormBasic',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/basic/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.basic',
        rank: 1,
        icon: 'i-lucide-form-input',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/layout',
      name: 'ExampleProFormLayout',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/layout/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.layout',
        rank: 2,
        icon: 'i-lucide-layout-grid',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/group',
      name: 'ExampleProFormGroup',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/group/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.group',
        rank: 3,
        icon: 'i-lucide-folder-tree',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/validation',
      name: 'ExampleProFormValidation',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/validation/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.validation',
        rank: 4,
        icon: 'i-lucide-shield-check',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/dag',
      name: 'ExampleProFormDag',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/dag/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.dag',
        rank: 5,
        icon: 'i-lucide-align-center-vertical',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/advanced',
      name: 'ExampleProFormAdvanced',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/advanced/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.advanced',
        rank: 6,
        icon: 'i-lucide-layers',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/plugins',
      name: 'ExampleProFormPlugins',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/plugins/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.plugins',
        rank: 7,
        icon: 'i-lucide-plug',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/api-events',
      name: 'ExampleProFormApiEvents',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/api-events/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.apiEvents',
        rank: 8,
        icon: 'i-lucide-webhook',
      },
    },
  ],
}

const primevueCollectionRoute: RouteConfig = {
  path: '/example/primevue-collection',
  name: 'ExamplePrimevueCollection',
  redirect: '/example/primevue-collection/overview',
  meta: {
    titleKey: 'router.example.components.primevueCollection.root',
    rank: 1,
    icon: 'i-lucide-layers',
  },
  children: [
    {
      path: '/example/primevue-collection/overview',
      name: 'ExamplePrimeVue',
      component: () => import('@/views/example/components/primevue-collection/overview/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.overview',
        rank: 1,
        icon: 'i-lucide-component',
      },
    },
    {
      path: '/example/primevue-collection/toast',
      name: 'ExamplePrimeVueToast',
      component: () => import('@/views/example/components/primevue-collection/toast/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.toast',
        rank: 2,
        icon: 'i-lucide-bell',
      },
    },
    {
      path: '/example/primevue-collection/prime-dialog',
      name: 'ExamplePrimeDialog',
      component: () =>
        import('@/views/example/components/primevue-collection/prime-dialog/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.primeDialog',
        rank: 3,
        icon: 'i-lucide-message-circle',
      },
    },
    proFormRoute,
    proTableRoute,
  ],
}

const systemConfigurationRootRoute: RouteConfig = {
  path: '/example/system-configuration',
  name: 'ExampleSystemConfiguration',
  redirect: '/example/system-configuration/theme',
  meta: {
    titleKey: 'router.example.systemConfiguration.root',
    rank: 1,
    icon: 'i-lucide-settings',
  },
  children: [
    {
      path: '/example/system-configuration/theme',
      name: 'ExampleSystemConfigurationTheme',
      component: () => import('@/views/example/system-configuration/theme.vue'),
      meta: {
        titleKey: 'router.example.systemConfiguration.theme',
        rank: 1,
        icon: 'i-lucide-palette',
      },
    },
    {
      path: '/example/system-configuration/size',
      name: 'ExampleSystemConfigurationSize',
      component: () => import('@/views/example/system-configuration/size.vue'),
      meta: {
        titleKey: 'router.example.systemConfiguration.size',
        rank: 2,
        icon: 'i-lucide-maximize-2',
      },
    },
    {
      path: '/example/system-configuration/unocss',
      name: 'ExampleSystemConfigurationUnocss',
      component: () => import('@/views/example/system-configuration/unocss.vue'),
      meta: {
        titleKey: 'router.example.systemConfiguration.unocss',
        rank: 3,
        icon: 'i-lucide-diamond',
      },
    },
    {
      path: '/example/system-configuration/breakpoints',
      name: 'ExampleSystemConfigurationBreakpoints',
      component: () => import('@/views/example/system-configuration/breakpoints.vue'),
      meta: {
        titleKey: 'router.example.systemConfiguration.breakpoints',
        rank: 4,
        icon: 'i-lucide-monitor',
      },
    },
    {
      path: '/example/system-configuration/layout',
      name: 'ExampleSystemConfigurationLayout',
      component: () => import('@/views/example/system-configuration/layout.vue'),
      meta: {
        titleKey: 'router.example.systemConfiguration.layout',
        rank: 5,
        icon: 'i-lucide-layout-dashboard',
      },
    },
  ],
}

const hooksRootRoute: RouteConfig = {
  path: '/example/hooks',
  name: 'ExampleHooks',
  redirect: '/example/hooks/use-date-utils',
  meta: {
    titleKey: 'router.example.hooks.root',
    rank: 3,
    icon: 'i-lucide-brain',
  },
  children: [
    {
      path: '/example/hooks/use-date-utils',
      name: 'ExampleHookUseDateUtils',
      component: () => import('@/views/example/hooks/use-date-utils.vue'),
      meta: { titleKey: 'router.example.hooks.useDateUtils', rank: 1, icon: 'i-lucide-calendar' },
    },
    {
      path: '/example/hooks/use-theme-switch',
      name: 'ExampleHookUseThemeSwitch',
      component: () => import('@/views/example/hooks/use-theme-switch.vue'),
      meta: { titleKey: 'router.example.hooks.useThemeSwitch', rank: 2, icon: 'i-lucide-brush' },
    },
    {
      path: '/example/hooks/use-http-request',
      name: 'ExampleHookUseHttpRequest',
      component: () => import('@/views/example/hooks/use-http-request.vue'),
      meta: { titleKey: 'router.example.hooks.useHttpRequest', rank: 3, icon: 'i-lucide-webhook' },
    },
    {
      path: '/example/hooks/use-locale',
      name: 'ExampleHookUseLocale',
      component: () => import('@/views/example/hooks/use-locale.vue'),
      meta: { titleKey: 'router.example.hooks.useLocale', rank: 4, icon: 'i-lucide-globe' },
    },
    {
      path: '/example/hooks/use-auth',
      name: 'ExampleHookUseAuth',
      component: () => import('@/views/example/hooks/use-auth.vue'),
      meta: { titleKey: 'router.example.hooks.useAuth', rank: 5, icon: 'i-lucide-shield' },
    },
    {
      path: '/example/hooks/use-app-element-size',
      name: 'ExampleHookUseAppElementSize',
      component: () => import('@/views/example/hooks/use-app-element-size.vue'),
      meta: {
        titleKey: 'router.example.hooks.useAppElementSize',
        rank: 6,
        icon: 'i-lucide-maximize',
      },
    },
    {
      path: '/example/hooks/use-auto-mitt',
      name: 'ExampleHookUseAutoMitt',
      component: () => import('@/views/example/hooks/use-auto-mitt.vue'),
      meta: { titleKey: 'router.example.hooks.useAutoMitt', rank: 7, icon: 'i-lucide-radical' },
    },
    {
      path: '/example/hooks/use-permission-routes',
      name: 'ExampleHookUsePermissionRoutes',
      component: () => import('@/views/example/hooks/use-permission-routes.vue'),
      meta: {
        titleKey: 'router.example.hooks.usePermissionRoutes',
        rank: 8,
        icon: 'i-lucide-key-round',
      },
    },
    {
      path: '/example/hooks/use-chart-theme',
      name: 'ExampleHookUseChartTheme',
      component: () => import('@/views/example/hooks/use-chart-theme.vue'),
      meta: { titleKey: 'router.example.hooks.useChartTheme', rank: 9, icon: 'i-lucide-chart-pie' },
    },
    {
      path: '/example/hooks/layout-loading',
      name: 'ExampleHookLayoutLoading',
      component: () => import('@/views/example/hooks/layout-loading.vue'),
      meta: { titleKey: 'router.example.hooks.layoutLoading', rank: 10, icon: 'i-lucide-loader' },
    },
    {
      path: '/example/hooks/layout-page-title',
      name: 'ExampleHookLayoutPageTitle',
      component: () => import('@/views/example/hooks/layout-page-title.vue'),
      meta: {
        titleKey: 'router.example.hooks.layoutPageTitle',
        rank: 11,
        icon: 'i-lucide-heading',
      },
    },
    {
      path: '/example/hooks/layout-admin-tabs',
      name: 'ExampleHookLayoutAdminTabs',
      component: () => import('@/views/example/hooks/layout-admin-tabs.vue'),
      meta: { titleKey: 'router.example.hooks.layoutAdminTabs', rank: 12, icon: 'i-lucide-tabs' },
    },
    {
      path: '/example/hooks/layout-breadcrumbs',
      name: 'ExampleHookLayoutBreadcrumbs',
      component: () => import('@/views/example/hooks/layout-breadcrumbs.vue'),
      meta: {
        titleKey: 'router.example.hooks.layoutBreadcrumbs',
        rank: 13,
        icon: 'i-lucide-map-pin',
      },
    },
    {
      path: '/example/hooks/layout-nprogress',
      name: 'ExampleHookLayoutNprogress',
      component: () => import('@/views/example/hooks/layout-nprogress.vue'),
      meta: {
        titleKey: 'router.example.hooks.layoutNprogress',
        rank: 14,
        icon: 'i-lucide-loader-circle',
      },
    },
    {
      path: '/example/hooks/layout-menu-visuals',
      name: 'ExampleHookLayoutMenuVisuals',
      component: () => import('@/views/example/hooks/layout-menu-visuals.vue'),
      meta: {
        titleKey: 'router.example.hooks.layoutMenuVisuals',
        rank: 15,
        icon: 'i-lucide-layout-dashboard',
      },
    },
  ],
}

const utilsRootRoute: RouteConfig = {
  path: '/example/utils',
  name: 'ExampleUtils',
  redirect: '/example/utils/safe-storage',
  meta: {
    titleKey: 'router.example.utils.root',
    rank: 4,
    icon: 'i-lucide-wrench',
  },
  children: [
    {
      path: '/example/utils/safe-storage',
      name: 'ExampleUtilSafeStorage',
      component: () => import('@/views/example/utils/safe-storage.vue'),
      meta: { titleKey: 'router.example.utils.safeStorage', rank: 3, icon: 'i-lucide-lock' },
    },
    {
      path: '/example/utils/lodash',
      name: 'ExampleUtilLodash',
      component: () => import('@/views/example/utils/lodash.vue'),
      meta: { titleKey: 'router.example.utils.lodash', rank: 4, icon: 'i-lucide-braces' },
    },
    {
      path: '/example/utils/device-sync',
      name: 'ExampleUtilDeviceSync',
      component: () => import('@/views/example/utils/device-sync.vue'),
      meta: { titleKey: 'router.example.utils.deviceSync', rank: 5, icon: 'i-lucide-smartphone' },
    },
    {
      path: '/example/utils/strings-format',
      name: 'ExampleUtilStringsFormat',
      component: () => import('@/views/example/utils/strings-format.vue'),
      meta: { titleKey: 'router.example.utils.stringsFormat', rank: 6, icon: 'i-lucide-text' },
    },
    {
      path: '/example/utils/type-casters',
      name: 'ExampleUtilTypeCasters',
      component: () => import('@/views/example/utils/type-casters.vue'),
      meta: { titleKey: 'router.example.utils.typeCasters', rank: 7, icon: 'i-lucide-shapes' },
    },
    {
      path: '/example/utils/ids',
      name: 'ExampleUtilIds',
      component: () => import('@/views/example/utils/ids.vue'),
      meta: { titleKey: 'router.example.utils.ids', rank: 8, icon: 'i-lucide-hash' },
    },
  ],
}

const commonRootRoute: RouteConfig = {
  path: '/example/common',
  name: 'ExampleCommon',
  redirect: '/example/common/constants',
  meta: {
    titleKey: 'router.example.common.root',
    rank: 5,
    icon: 'i-lucide-list',
  },
  children: [
    {
      path: '/example/common/constants',
      name: 'ExampleCommonConstants',
      component: () => import('@/views/example/common/constants.vue'),
      meta: { titleKey: 'router.example.common.constants', rank: 1, icon: 'i-lucide-book' },
    },
    {
      path: '/example/common/enums',
      name: 'ExampleCommonEnums',
      component: () => import('@/views/example/common/enums.vue'),
      meta: { titleKey: 'router.example.common.enums', rank: 2, icon: 'i-lucide-list-checks' },
    },
    {
      path: '/example/common/types',
      name: 'ExampleCommonTypes',
      component: () => import('@/views/example/common/types.vue'),
      meta: { titleKey: 'router.example.common.types', rank: 3, icon: 'i-lucide-shapes' },
    },
  ],
}

const componentsRootRoute: RouteConfig = {
  path: '/example/components',
  name: 'ExampleComponents',
  redirect: '/example/primevue-collection/overview',
  meta: {
    titleKey: 'router.example.components.root',
    rank: 2,
    icon: 'i-lucide-layers',
  },
  children: [
    primevueCollectionRoute,
    chartsRoute,
    {
      path: '/example/components/icons',
      name: 'ExampleIcons',
      component: () => import('@/views/example/components/icons/index.vue'),
      meta: {
        titleKey: 'router.example.components.icons',
        rank: 3,
        icon: 'i-lucide-brush',
        keepAlive: true,
      },
    },
    {
      path: '/example/components/c-scrollbar',
      name: 'ExampleComponentsCScrollbar',
      component: () => import('@/views/example/components/c-scrollbar/index.vue'),
      meta: {
        titleKey: 'router.example.components.cScrollbar',
        rank: 4,
        icon: 'i-lucide-scroll-text',
      },
    },
    {
      path: '/example/components/empty-state',
      name: 'ExampleComponentsEmptyState',
      component: () => import('@/views/example/components/empty-state/index.vue'),
      meta: {
        titleKey: 'router.example.components.emptyState',
        rank: 5,
        icon: 'i-lucide-circle-dashed',
      },
    },
    {
      path: '/example/components/animate-wrapper',
      name: 'ExampleComponentsAnimateWrapper',
      component: () => import('@/views/example/components/animate-wrapper/index.vue'),
      meta: {
        titleKey: 'router.example.components.animateWrapper',
        rank: 6,
        icon: 'i-lucide-sparkles',
      },
    },
  ],
}

const directivesRootRoute: RouteConfig = {
  path: '/example/directives',
  name: 'ExampleDirectives',
  redirect: '/example/directives/auth',
  meta: {
    titleKey: 'router.example.architecture.directives.root',
    rank: 14,
    icon: 'i-lucide-sparkles',
  },
  children: [
    {
      path: '/example/directives/auth',
      name: 'ExampleDirectiveAuth',
      component: () => import('@/views/example/architecture/directives/auth.vue'),
      meta: {
        titleKey: 'router.example.architecture.directives.auth',
        rank: 1,
        icon: 'i-lucide-shield',
      },
    },
  ],
}

const adaptersRootRoute: RouteConfig = {
  path: '/example/adapters',
  name: 'ExampleAdapters',
  redirect: '/example/adapters/http',
  meta: {
    titleKey: 'router.example.architecture.adapters.root',
    rank: 15,
    icon: 'i-lucide-plug',
  },
  children: [
    {
      path: '/example/adapters/http',
      name: 'ExampleAdapterHttp',
      component: () => import('@/views/example/architecture/adapters/http-adapter.vue'),
      meta: {
        titleKey: 'router.example.architecture.adapters.httpAdapter',
        rank: 1,
        icon: 'i-lucide-webhook',
      },
    },
    {
      path: '/example/adapters/echarts',
      name: 'ExampleAdapterEcharts',
      component: () => import('@/views/example/architecture/adapters/echarts-adapter.vue'),
      meta: {
        titleKey: 'router.example.architecture.adapters.echartsAdapter',
        rank: 2,
        icon: 'i-lucide-chart-bar',
      },
    },
  ],
}

const infraRootRoute: RouteConfig = {
  path: '/example/infra',
  name: 'ExampleInfra',
  redirect: '/example/infra/route-provider',
  meta: {
    titleKey: 'router.example.architecture.infra.root',
    rank: 16,
    icon: 'i-lucide-network',
  },
  children: [
    {
      path: '/example/infra/route-provider',
      name: 'ExampleInfraRouteProvider',
      component: () => import('@/views/example/architecture/infra/route-provider.vue'),
      meta: {
        titleKey: 'router.example.architecture.infra.routeProvider',
        rank: 1,
        icon: 'i-lucide-sitemap',
      },
    },
    {
      path: '/example/infra/token-provider',
      name: 'ExampleInfraTokenProvider',
      component: () => import('@/views/example/architecture/infra/token-provider.vue'),
      meta: {
        titleKey: 'router.example.architecture.infra.tokenProvider',
        rank: 2,
        icon: 'i-lucide-key-round',
      },
    },
  ],
}

const storesRootRoute: RouteConfig = {
  path: '/example/stores',
  name: 'ExampleStores',
  redirect: '/example/stores/locale',
  meta: {
    titleKey: 'router.example.architecture.stores.root',
    rank: 17,
    icon: 'i-lucide-database',
  },
  children: [
    {
      path: '/example/stores/locale',
      name: 'ExampleStoreLocale',
      component: () => import('@/views/example/architecture/stores/locale.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.locale',
        rank: 1,
        icon: 'i-lucide-globe',
      },
    },
    {
      path: '/example/stores/theme',
      name: 'ExampleStoreTheme',
      component: () => import('@/views/example/architecture/stores/theme.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.theme',
        rank: 2,
        icon: 'i-lucide-palette',
      },
    },
    {
      path: '/example/stores/table-drawer',
      name: 'ExampleStoreTableDrawer',
      component: () => import('@/views/example/architecture/stores/table-drawer.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.tableDrawer',
        rank: 3,
        icon: 'i-lucide-layout-sidebar',
      },
    },
    {
      path: '/example/stores/layout',
      name: 'ExampleStoreLayout',
      component: () => import('@/views/example/architecture/stores/layout.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.layout',
        rank: 4,
        icon: 'i-lucide-layout-dashboard',
      },
    },
    {
      path: '/example/stores/user',
      name: 'ExampleStoreUser',
      component: () => import('@/views/example/architecture/stores/user.vue'),
      meta: { titleKey: 'router.example.architecture.stores.user', rank: 5, icon: 'i-lucide-user' },
    },
    {
      path: '/example/stores/size',
      name: 'ExampleStoreSize',
      component: () => import('@/views/example/architecture/stores/size.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.size',
        rank: 6,
        icon: 'i-lucide-maximize',
      },
    },
    {
      path: '/example/stores/device',
      name: 'ExampleStoreDevice',
      component: () => import('@/views/example/architecture/stores/device.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.device',
        rank: 7,
        icon: 'i-lucide-smartphone',
      },
    },
    {
      path: '/example/stores/permission',
      name: 'ExampleStorePermission',
      component: () => import('@/views/example/architecture/stores/permission.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.permission',
        rank: 8,
        icon: 'i-lucide-shield',
      },
    },
  ],
}

const architectureAdvancedRootRoute: RouteConfig = {
  path: '/example/architecture',
  name: 'ExampleArchitectureAdvanced',
  redirect: '/example/system-states',
  meta: {
    titleKey: 'router.example.architecture.root',
    rank: 6,
    icon: 'i-lucide-sparkles',
  },
  children: [
    layoutInspectorRoute,
    permissionRoute,
    routerMetaRoute,
    directivesRootRoute,
    adaptersRootRoute,
    infraRootRoute,
    storesRootRoute,
  ],
}

const exampleRoutes: RouteConfig[] = [
  systemConfigurationRootRoute,
  componentsRootRoute,
  hooksRootRoute,
  utilsRootRoute,
  commonRootRoute,
  architectureAdvancedRootRoute,
]

export default exampleRoutes
