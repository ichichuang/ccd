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
      // === 1. UI 示例 ===
      {
        path: '/example/ui',
        name: 'ExampleUi',
        redirect: '/example/ui/primevue',
        meta: {
          titleKey: 'router.example.ui',
          rank: 1,
          icon: 'i-lucide-layers',
        },
        children: [
          {
            path: '/example/ui/primevue',
            name: 'ExamplePrimeVue',
            component: () => import('@/views/example/PrimeVue/PrimeVue.vue'),
            meta: {
              titleKey: 'router.example.primevue',
              rank: 1,
              icon: 'i-lucide-component',
            },
          },
          {
            path: '/example/ui/primevue-dialog',
            name: 'ExamplePrimeVueDialog',
            component: () => import('@/views/example/PrimeVueDialog/PrimeVueDialog.vue'),
            meta: {
              titleKey: 'router.example.primevueDialog',
              rank: 2,
              icon: 'i-lucide-box',
            },
          },
          {
            path: '/example/ui/primevue-toast',
            name: 'ExamplePrimeVueToast',
            component: () => import('@/views/example/PrimeVueToast/PrimeVueToast.vue'),
            meta: {
              titleKey: 'router.example.primevueToast',
              rank: 3,
              icon: 'i-lucide-bell',
            },
          },
          {
            path: '/example/ui/schema-form',
            name: 'ExampleSchemaForm',
            component: () => import('@/views/example/SchemaForm/SchemaForm.vue'),
            meta: {
              titleKey: 'router.example.schemaForm',
              rank: 4,
              icon: 'i-lucide-clipboard-list',
            },
          },
          {
            path: '/example/ui/data-table',
            name: 'ExampleDataTable',
            component: () => import('@/views/example/DataTable/DataTable.vue'),
            meta: {
              titleKey: 'router.example.dataTable',
              rank: 5,
              icon: 'i-lucide-table',
            },
          },
          {
            path: '/example/ui/data-table/:id',
            name: 'ExampleDataTableDetail',
            component: () => import('@/views/example/RouterMetaExample/DataTableDetailExample.vue'),
            meta: {
              titleKey: 'router.example.dataTableDetail',
              rank: 99,
              showLink: false,
              activeMenu: '/example/ui/data-table',
            },
          },
          {
            path: '/example/ui/use-echarts',
            name: 'ExampleUseEcharts',
            component: () => import('@/views/example/UseEcharts/UseEcharts.vue'),
            meta: {
              titleKey: 'router.example.useEcharts',
              rank: 6,
              icon: 'i-lucide-chart-bar',
            },
          },
          {
            path: '/example/ui/icons',
            name: 'ExampleIcons',
            component: () => import('@/views/example/IconsExample/IconsExample.vue'),
            meta: {
              titleKey: 'router.example.icons',
              rank: 7,
              icon: 'i-lucide-brush',
              keepAlive: true,
            },
          },
        ],
      },
      // === 2. 权限示例 ===
      {
        path: '/example/permission',
        name: 'ExamplePermission',
        redirect: '/example/permission/roles',
        meta: {
          titleKey: 'router.example.permission',
          rank: 2,
          icon: 'i-lucide-shield',
        },
        children: [
          {
            path: '/example/permission/roles',
            name: 'ExamplePermissionRoles',
            component: () => import('@/views/example/PermissionExample/PermissionRolesExample.vue'),
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
            component: () => import('@/views/example/PermissionExample/PermissionAuthsExample.vue'),
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
      // === 3. Router Meta 示例 ===
      {
        path: '/example/router-meta',
        name: 'ExampleRouterMeta',
        redirect: '/example/router-meta/index',
        meta: {
          titleKey: 'router.example.routerMeta',
          rank: 3,
          icon: 'i-lucide-route',
        },
        children: [
          {
            path: '/example/router-meta/index',
            name: 'ExampleRouterMetaIndex',
            component: () => import('@/views/example/RouterMetaExample/RouterMetaIndexExample.vue'),
            meta: {
              titleKey: 'router.example.routerMetaIndex',
              rank: 1,
              icon: 'i-lucide-route',
            },
          },
          {
            path: '/example/router-meta/external-link',
            name: 'ExampleExternalLink',
            component: () => import('@/views/example/RouterMetaExample/ExternalLinkExample.vue'),
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
            component: () => import('@/views/example/RouterMetaExample/HideBreadcrumbExample.vue'),
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
            component: () => import('@/views/example/RouterMetaExample/HiddenTagExample.vue'),
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
            component: () => import('@/views/example/RouterMetaExample/RatioLayoutExample.vue'),
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
            component: () => import('@/views/example/RouterMetaExample/ReuseWindowExample.vue'),
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
            component: () => import('@/views/example/RouterMetaExample/TransitionExample.vue'),
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
