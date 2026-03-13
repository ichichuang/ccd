const basicUiRoute: RouteConfig = {
  path: '/example/basic-ui',
  name: 'ExampleBasicUi',
  redirect: '/example/basic-ui/primevue',
  meta: {
    titleKey: 'router.example.basicUi',
    rank: 1,
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
  redirect: '/example/charts/use-echarts',
  meta: {
    titleKey: 'router.example.charts',
    rank: 2,
    icon: 'i-lucide-chart-bar',
  },
  children: [
    {
      path: '/example/charts/use-echarts',
      name: 'ExampleUseEcharts',
      component: () => import('@/views/example/use-echarts/index.vue'),
      meta: {
        titleKey: 'router.example.useEcharts',
        rank: 1,
        icon: 'i-lucide-chart-bar',
      },
    },
    {
      path: '/example/charts/stats-grid',
      name: 'ExampleStatsGrid',
      component: () => import('@/views/example/stats-grid/index.vue'),
      meta: {
        titleKey: 'router.example.statsGrid',
        rank: 2,
        icon: 'i-lucide-layout-grid',
      },
    },
  ],
}

const layoutInspectorRoute: RouteConfig = {
  path: '/example/layout-inspector',
  name: 'ExampleLayoutInspector',
  redirect: '/example/layout-inspector/sidebar-inspector',
  meta: {
    titleKey: 'router.example.layoutInspector',
    rank: 3,
    icon: 'i-lucide-panel-right',
  },
  children: [
    {
      path: '/example/layout-inspector/sidebar-inspector',
      name: 'ExampleSidebarInspector',
      component: () => import('@/views/example/sidebar-inspector/index.vue'),
      meta: {
        titleKey: 'router.example.sidebarInspector',
        rank: 1,
        icon: 'i-lucide-panel-right',
      },
    },
    {
      path: '/example/layout-inspector/system-states',
      name: 'ExampleSystemStates',
      component: () => import('@/views/example/system-states/index.vue'),
      meta: {
        titleKey: 'router.example.systemStates',
        rank: 2,
        icon: 'i-lucide-layers',
      },
    },
  ],
}

const permissionRoute: RouteConfig = {
  path: '/example/permission',
  name: 'ExamplePermission',
  redirect: '/example/permission/roles',
  meta: {
    titleKey: 'router.example.permission',
    rank: 4,
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
    rank: 5,
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

const proFormRoute: RouteConfig = {
  path: '/example/pro-form',
  name: 'ExampleProForm',
  redirect: '/example/pro-form/basic',
  meta: {
    titleKey: 'router.example.proForm',
    rank: 6,
    icon: 'i-lucide-form-input',
  },
  children: [
    {
      path: '/example/pro-form/basic',
      name: 'ExampleProFormBasic',
      component: () => import('@/views/example/pro-form/basic/index.vue'),
      meta: {
        title: 'ProForm 全量组件与基础',
        rank: 1,
        icon: 'i-lucide-form-input',
      },
    },
    {
      path: '/example/pro-form/layout',
      name: 'ExampleProFormLayout',
      component: () => import('@/views/example/pro-form/layout/index.vue'),
      meta: {
        title: 'ProForm 响应式与排版引擎',
        rank: 2,
        icon: 'i-lucide-layout-grid',
      },
    },
    {
      path: '/example/pro-form/group',
      name: 'ExampleProFormGroup',
      component: () => import('@/views/example/pro-form/group/index.vue'),
      meta: {
        title: 'ProForm 容器分组与向导',
        rank: 3,
        icon: 'i-lucide-folder-tree',
      },
    },
    {
      path: '/example/pro-form/validation',
      name: 'ExampleProFormValidation',
      component: () => import('@/views/example/pro-form/validation/index.vue'),
      meta: {
        title: 'ProForm 校验管线与持久化',
        rank: 4,
        icon: 'i-lucide-shield-check',
      },
    },
    {
      path: '/example/pro-form/dag',
      name: 'ExampleProFormDag',
      component: () => import('@/views/example/pro-form/dag/index.vue'),
      meta: {
        title: 'ProForm 动态联动与计算',
        rank: 5,
        icon: 'i-lucide-bezier-curve',
      },
    },
    {
      path: '/example/pro-form/advanced',
      name: 'ExampleProFormAdvanced',
      component: () => import('@/views/example/pro-form/advanced/index.vue'),
      meta: {
        title: 'ProForm 动态数组与高级扩展',
        rank: 6,
        icon: 'i-lucide-layers',
      },
    },
  ],
}

const exampleRoutes: RouteConfig[] = [
  {
    path: '/example',
    name: 'Example',
    meta: {
      titleKey: 'router.example.root',
      rank: 2,
      icon: 'i-lucide-beaker',
    },
    children: [
      // === 1. 基础 UI ===
      basicUiRoute,
      // === 2. 图表与展示 ===
      chartsRoute,
      // === 3. 布局与检查器 ===
      layoutInspectorRoute,
      // === 4. 权限示例 ===
      permissionRoute,
      // === 5. Router Meta 示例 ===
      routerMetaRoute,
      // === 6. ProForm 示例 ===
      proFormRoute,
    ],
  },
]

export default exampleRoutes
