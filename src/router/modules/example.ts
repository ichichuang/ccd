const basicUiRoute: RouteConfig = {
  path: '/example/basic-ui',
  name: 'ExampleBasicUi',
  redirect: '/example/basic-ui/primevue',
  meta: {
    titleKey: 'router.example.basicUi',
    rank: 2,
    icon: 'i-lucide-layers',
  },
  children: [
    {
      path: '/example/basic-ui/primevue',
      name: 'ExamplePrimeVue',
      component: () => import('@/views/example/prime-vue/index.vue'),
      meta: {
        titleKey: 'router.example.primevue',
        rank: 1,
        icon: 'i-lucide-component',
      },
    },
    {
      path: '/example/basic-ui/primevue-dialog',
      name: 'ExamplePrimeVueDialog',
      component: () => import('@/views/example/prime-vue-dialog/index.vue'),
      meta: {
        titleKey: 'router.example.primevueDialog',
        rank: 2,
        icon: 'i-lucide-box',
      },
    },
    {
      path: '/example/basic-ui/primevue-toast',
      name: 'ExamplePrimeVueToast',
      component: () => import('@/views/example/prime-vue-toast/index.vue'),
      meta: {
        titleKey: 'router.example.primevueToast',
        rank: 3,
        icon: 'i-lucide-bell',
      },
    },
    {
      path: '/example/basic-ui/icons',
      name: 'ExampleIcons',
      component: () => import('@/views/example/icons-example/index.vue'),
      meta: {
        titleKey: 'router.example.icons',
        rank: 4,
        icon: 'i-lucide-brush',
        keepAlive: true,
      },
    },
  ],
}

const chartsRoute: RouteConfig = {
  path: '/example/charts',
  name: 'ExampleCharts',
  component: () => import('@/views/example/use-echarts/index.vue'),
  meta: {
    titleKey: 'router.example.useEcharts',
    rank: 3,
    icon: 'i-lucide-chart-bar',
  },
}

const layoutInspectorRoute: RouteConfig = {
  path: '/example/system-states',
  name: 'ExampleSystemStates',
  component: () => import('@/views/example/system-states/index.vue'),
  meta: {
    titleKey: 'router.example.systemStates',
    rank: 4,
    icon: 'i-lucide-panel-right',
  },
}

const permissionRoute: RouteConfig = {
  path: '/example/permission',
  name: 'ExamplePermission',
  redirect: '/example/permission/roles',
  meta: {
    titleKey: 'router.example.permission',
    rank: 5,
    icon: 'i-lucide-shield',
  },
  children: [
    {
      path: '/example/permission/roles',
      name: 'ExamplePermissionRoles',
      component: () => import('@/views/example/permission-example/permission-roles-example.vue'),
      meta: {
        titleKey: 'router.example.permissionRoles',
        rank: 1,
        icon: 'i-lucide-shield-check',
        roles: ['admin'],
      },
    },
    {
      path: '/example/permission/auths',
      name: 'ExamplePermissionAuths',
      component: () => import('@/views/example/permission-example/permission-auths-example.vue'),
      meta: {
        titleKey: 'router.example.permissionAuths',
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
    titleKey: 'router.example.routerMeta',
    rank: 6,
    icon: 'i-lucide-route',
  },
  children: [
    {
      path: '/example/router-meta/index',
      name: 'ExampleRouterMetaIndex',
      component: () => import('@/views/example/router-meta-example/router-meta-index-example.vue'),
      meta: {
        titleKey: 'router.example.routerMetaIndex',
        rank: 1,
        icon: 'i-lucide-route',
      },
    },
    {
      path: '/example/router-meta/external-link',
      name: 'ExampleExternalLink',
      component: () => import('@/views/example/router-meta-example/external-link-example.vue'),
      meta: {
        titleKey: 'router.example.externalLink',
        rank: 2,
        icon: 'i-lucide-external-link',
        isLink: true,
        linkUrl: 'https://vuejs.org',
      },
    },
    {
      path: '/example/router-meta/hide-breadcrumb',
      name: 'ExampleHideBreadcrumb',
      component: () => import('@/views/example/router-meta-example/hide-breadcrumb-example.vue'),
      meta: {
        titleKey: 'router.example.hideBreadcrumb',
        rank: 3,
        icon: 'i-lucide-navigation',
        hideBreadcrumb: true,
      },
    },
    {
      path: '/example/router-meta/hidden-tag',
      name: 'ExampleHiddenTag',
      component: () => import('@/views/example/router-meta-example/hidden-tag-example.vue'),
      meta: {
        titleKey: 'router.example.hiddenTag',
        rank: 4,
        icon: 'i-lucide-tag',
        hiddenTag: true,
      },
    },
    {
      path: '/example/router-meta/ratio-demo',
      name: 'ExampleRatioDemo',
      component: () => import('@/views/example/router-meta-example/ratio-layout-example.vue'),
      meta: {
        titleKey: 'router.example.ratioLayout',
        rank: 5,
        icon: 'i-lucide-ratio',
        parent: 'ratio',
        ratio: '16:9',
      },
    },
    {
      path: '/example/router-meta/reuse-window',
      name: 'ExampleReuseWindow',
      component: () => import('@/views/example/router-meta-example/reuse-window-example.vue'),
      meta: {
        titleKey: 'router.example.reuseWindow',
        rank: 6,
        icon: 'i-lucide-app-window',
        parent: 'fullscreen',
        reuseWindow: true,
      },
    },
    {
      path: '/example/router-meta/transition-demo',
      name: 'ExampleTransitionDemo',
      component: () => import('@/views/example/router-meta-example/transition-example.vue'),
      meta: {
        titleKey: 'router.example.transition',
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
  path: '/example/pro-table',
  name: 'ExampleProTable',
  redirect: '/example/pro-table/basic',
  meta: {
    titleKey: 'router.example.proTable',
    rank: 8,
    icon: 'i-lucide-table',
  },
  children: [
    {
      path: '/example/pro-table/playground',
      name: 'ExampleProTablePlayground',
      component: () => import('@/views/example/pro-table/playground/index.vue'),
      meta: {
        titleKey: 'router.example.proTablePlayground',
        icon: 'i-lucide-flask-conical',
      },
    },
    {
      path: '/example/pro-table/height-modes',
      name: 'ExampleProTableHeightModes',
      component: () => import('@/views/example/pro-table/height-modes/index.vue'),
      meta: {
        titleKey: 'router.example.proTableHeightModes',
        icon: 'i-lucide-maximize-2',
      },
    },
    {
      path: '/example/pro-table/columns',
      name: 'ExampleProTableColumns',
      component: () => import('@/views/example/pro-table/columns/index.vue'),
      meta: {
        titleKey: 'router.example.proTableColumns',
        icon: 'i-lucide-columns-3',
      },
    },
    {
      path: '/example/pro-table/alignment',
      name: 'ExampleProTableAlignment',
      component: () => import('@/views/example/pro-table/alignment/index.vue'),
      meta: {
        title: '列对齐方式',
        icon: 'i-lucide-align-left',
      },
    },
    {
      path: '/example/pro-table/column-sizing',
      name: 'ExampleProTableColumnSizing',
      component: () => import('@/views/example/pro-table/column-sizing/index.vue'),
      meta: {
        titleKey: 'router.example.proTableColumnSizing',
        icon: 'i-lucide-columns',
      },
    },
    {
      path: '/example/pro-table/server',
      name: 'ExampleProTableServer',
      component: () => import('@/views/example/pro-table/server/index.vue'),
      meta: {
        titleKey: 'router.example.proTableServer',
        icon: 'i-lucide-globe',
      },
    },
    {
      path: '/example/pro-table/infinite',
      name: 'ExampleProTableInfinite',
      component: () => import('@/views/example/pro-table/infinite/index.vue'),
      meta: {
        titleKey: 'router.example.proTableInfinite',
        icon: 'i-lucide-arrow-down-to-line',
      },
    },
    {
      path: '/example/pro-table/advanced',
      name: 'ExampleProTableAdvanced',
      component: () => import('@/views/example/pro-table/advanced/index.vue'),
      meta: {
        titleKey: 'router.example.proTableAdvanced',
        icon: 'i-lucide-move-horizontal',
      },
    },
    {
      path: '/example/pro-table/api-events',
      name: 'ExampleProTableApiEvents',
      component: () => import('@/views/example/pro-table/api-events/index.vue'),
      meta: {
        titleKey: 'router.example.proTableApiEvents',
        icon: 'i-lucide-webhook',
      },
    },
    {
      path: '/example/pro-table/virtual',
      name: 'ExampleProTableVirtual',
      component: () => import('@/views/example/pro-table/virtual/index.vue'),
      meta: {
        titleKey: 'router.example.proTableVirtual',
        icon: 'i-lucide-gauge',
      },
    },
  ],
}

const proFormRoute: RouteConfig = {
  path: '/example/pro-form',
  name: 'ExampleProForm',
  redirect: '/example/pro-form/basic',
  meta: {
    titleKey: 'router.example.proForm',
    rank: 7,
    icon: 'i-lucide-form-input',
  },
  children: [
    {
      path: '/example/pro-form/playground',
      name: 'ExampleProFormPlayground',
      component: () => import('@/views/example/pro-form/playground/index.vue'),
      meta: {
        titleKey: 'router.example.proFormPlayground',
        rank: 0,
        icon: 'i-lucide-flask-conical',
      },
    },
    {
      path: '/example/pro-form/basic',
      name: 'ExampleProFormBasic',
      component: () => import('@/views/example/pro-form/basic/index.vue'),
      meta: {
        titleKey: 'router.example.proFormBasic',
        rank: 1,
        icon: 'i-lucide-form-input',
      },
    },
    {
      path: '/example/pro-form/layout',
      name: 'ExampleProFormLayout',
      component: () => import('@/views/example/pro-form/layout/index.vue'),
      meta: {
        titleKey: 'router.example.proFormLayout',
        rank: 2,
        icon: 'i-lucide-layout-grid',
      },
    },
    {
      path: '/example/pro-form/group',
      name: 'ExampleProFormGroup',
      component: () => import('@/views/example/pro-form/group/index.vue'),
      meta: {
        titleKey: 'router.example.proFormGroup',
        rank: 3,
        icon: 'i-lucide-folder-tree',
      },
    },
    {
      path: '/example/pro-form/validation',
      name: 'ExampleProFormValidation',
      component: () => import('@/views/example/pro-form/validation/index.vue'),
      meta: {
        titleKey: 'router.example.proFormValidation',
        rank: 4,
        icon: 'i-lucide-shield-check',
      },
    },
    {
      path: '/example/pro-form/dag',
      name: 'ExampleProFormDag',
      component: () => import('@/views/example/pro-form/dag/index.vue'),
      meta: {
        titleKey: 'router.example.proFormDag',
        rank: 5,
        icon: 'i-lucide-align-center-vertical',
      },
    },
    {
      path: '/example/pro-form/advanced',
      name: 'ExampleProFormAdvanced',
      component: () => import('@/views/example/pro-form/advanced/index.vue'),
      meta: {
        titleKey: 'router.example.proFormAdvanced',
        rank: 6,
        icon: 'i-lucide-layers',
      },
    },
    {
      path: '/example/pro-form/api-events',
      name: 'ExampleProFormApiEvents',
      component: () => import('@/views/example/pro-form/api-events/index.vue'),
      meta: {
        titleKey: 'router.example.proFormApiEvents',
        rank: 8,
        icon: 'i-lucide-webhook',
      },
    },
    {
      path: '/example/pro-form/plugins',
      name: 'ExampleProFormPlugins',
      component: () => import('@/views/example/pro-form/plugins/index.vue'),
      meta: {
        titleKey: 'router.example.proFormPlugins',
        rank: 7,
        icon: 'i-lucide-plug',
      },
    },
  ],
}

const exampleRoutes: RouteConfig[] = [
  // === 1. 基础 UI 示例 ===
  basicUiRoute,
  // === 2. 图表与展示 ===
  chartsRoute,
  // === 3. 系统状态与布局检查 ===
  layoutInspectorRoute,
  // === 4. 权限示例 ===
  permissionRoute,
  // === 5. Router Meta 与路由行为示例 ===
  routerMetaRoute,
  // === 6. ProForm 超级表单示例 ===
  proFormRoute,
  // === 7. ProTable 超级表格示例 ===
  proTableRoute,
]

export default exampleRoutes
