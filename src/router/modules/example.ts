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
      {
        path: '/example/basic-ui',
        name: 'ExampleBasicUi',
        redirect: '/example/basic-ui/toolbar-content',
        meta: {
          titleKey: 'router.example.basicUi',
          rank: 1,
          icon: 'i-lucide-layers',
        },
        children: [
          {
            path: '/example/basic-ui/toolbar-content',
            name: 'ExampleToolbarContent',
            component: () => import('@/views/example/toolbar-content/index.vue'),
            meta: {
              titleKey: 'router.example.toolbarContent',
              rank: 0,
              icon: 'i-lucide-layout',
            },
          },
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
      },
      // === 2. 表单与向导 ===
      {
        path: '/example/forms',
        name: 'ExampleForms',
        redirect: '/example/forms/schema-form',
        meta: {
          titleKey: 'router.example.forms',
          rank: 2,
          icon: 'i-lucide-clipboard-list',
        },
        children: [
          {
            path: '/example/forms/schema-form',
            name: 'ExampleSchemaForm',
            component: () => import('@/views/example/schema-form/index.vue'),
            meta: {
              titleKey: 'router.example.schemaForm',
              rank: 1,
              icon: 'i-lucide-clipboard-list',
            },
          },
          {
            path: '/example/forms/schema-form-v2',
            name: 'ExampleSchemaFormV2',
            component: () => import('@/views/example/schema-form/v2-ascension-demo.vue'),
            meta: {
              titleKey: 'router.example.schemaFormV2',
              rank: 2,
              icon: 'i-lucide-rocket',
            },
          },
          {
            path: '/example/forms/form-wizard',
            name: 'ExampleFormWizard',
            component: () => import('@/views/example/form-wizard/index.vue'),
            meta: {
              titleKey: 'router.example.formWizard',
              rank: 3,
              icon: 'i-lucide-git-branch-plus',
            },
          },
        ],
      },
      // === 3. 表格 ===
      {
        path: '/example/tables',
        name: 'ExampleTables',
        redirect: '/example/tables/data-table',
        meta: {
          titleKey: 'router.example.tables',
          rank: 3,
          icon: 'i-lucide-table',
        },
        children: [
          {
            path: '/example/tables/data-table',
            name: 'ExampleDataTable',
            component: () => import('@/views/example/data-table/index.vue'),
            meta: {
              titleKey: 'router.example.dataTable',
              rank: 1,
              icon: 'i-lucide-table',
            },
          },
          {
            path: '/example/tables/data-table-v2',
            name: 'ExampleDataTableV2',
            component: () => import('@/views/example/data-table/v2-table-ascension-demo.vue'),
            meta: {
              titleKey: 'router.example.dataTableV2',
              rank: 2,
              icon: 'i-lucide-table-2',
            },
          },
          {
            path: '/example/tables/data-table/:id',
            name: 'ExampleDataTableDetail',
            component: () =>
              import('@/views/example/router-meta-example/data-table-detail-example.vue'),
            meta: {
              titleKey: 'router.example.dataTableDetail',
              rank: 99,
              showLink: false,
              activeMenu: '/example/tables/data-table',
            },
          },
        ],
      },
      // === 4. 图表与展示 ===
      {
        path: '/example/charts',
        name: 'ExampleCharts',
        redirect: '/example/charts/use-echarts',
        meta: {
          titleKey: 'router.example.charts',
          rank: 4,
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
      },
      // === 5. 布局与检查器 ===
      {
        path: '/example/layout-inspector',
        name: 'ExampleLayoutInspector',
        redirect: '/example/layout-inspector/sidebar-inspector',
        meta: {
          titleKey: 'router.example.layoutInspector',
          rank: 5,
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
        ],
      },
      // === 6. 权限示例 ===
      {
        path: '/example/permission',
        name: 'ExamplePermission',
        redirect: '/example/permission/roles',
        meta: {
          titleKey: 'router.example.permission',
          rank: 6,
          icon: 'i-lucide-shield',
        },
        children: [
          {
            path: '/example/permission/roles',
            name: 'ExamplePermissionRoles',
            component: () =>
              import('@/views/example/permission-example/permission-roles-example.vue'),
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
            component: () =>
              import('@/views/example/permission-example/permission-auths-example.vue'),
            meta: {
              titleKey: 'router.example.permissionAuths',
              rank: 2,
              icon: 'i-lucide-badge-check',
              roles: ['admin', 'user'],
              auths: ['demo:read', 'demo:write'],
            },
          },
        ],
      },
      // === 7. CRUD / 业务示例 ===
      {
        path: '/example/business',
        name: 'ExampleBusiness',
        redirect: '/example/business/crud-best-practice',
        meta: {
          titleKey: 'router.example.business',
          rank: 7,
          icon: 'i-lucide-briefcase',
        },
        children: [
          {
            path: '/example/business/crud-best-practice',
            name: 'ExampleCrudBestPractice',
            component: () => import('@/views/example/crud-best-practice/index.vue'),
            meta: {
              titleKey: 'router.example.crudBestPractice',
              rank: 1,
              icon: 'i-lucide-users',
            },
          },
        ],
      },
      // === 8. Router Meta 示例 ===
      {
        path: '/example/router-meta',
        name: 'ExampleRouterMeta',
        redirect: '/example/router-meta/index',
        meta: {
          titleKey: 'router.example.routerMeta',
          rank: 8,
          icon: 'i-lucide-route',
        },
        children: [
          {
            path: '/example/router-meta/index',
            name: 'ExampleRouterMetaIndex',
            component: () =>
              import('@/views/example/router-meta-example/router-meta-index-example.vue'),
            meta: {
              titleKey: 'router.example.routerMetaIndex',
              rank: 1,
              icon: 'i-lucide-route',
            },
          },
          {
            path: '/example/router-meta/external-link',
            name: 'ExampleExternalLink',
            component: () =>
              import('@/views/example/router-meta-example/external-link-example.vue'),
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
            component: () =>
              import('@/views/example/router-meta-example/hide-breadcrumb-example.vue'),
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
      },
    ],
  },
]

export default exampleRoutes
