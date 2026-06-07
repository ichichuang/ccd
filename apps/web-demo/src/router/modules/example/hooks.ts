const hooksRootRoute: RouteConfig = {
  path: '/example/hooks',
  name: 'ExampleHooks',
  redirect: '/example/hooks/composables/use-date-utils',
  meta: {
    titleKey: 'router.example.hooks.root',
    rank: 3,
    icon: 'i-lucide-brain',
  },
  children: [
    {
      path: '/example/hooks/composables',
      name: 'ExampleHooksComposables',
      redirect: '/example/hooks/composables/use-date-utils',
      meta: {
        titleKey: 'router.example.hooks.composables.root',
        rank: 0,
        icon: 'i-lucide-code',
      },
      children: [
        {
          path: '/example/hooks/composables/use-date-utils',
          name: 'ExampleHookUseDateUtils',
          component: () => import('@/views/example/hooks/use-date-utils.vue'),
          meta: {
            titleKey: 'router.example.hooks.composables.useDateUtils',
            rank: 0,
            icon: 'i-lucide-calendar',
          },
        },
        {
          path: '/example/hooks/composables/use-theme-switch',
          name: 'ExampleHookUseThemeSwitch',
          component: () => import('@/views/example/hooks/use-theme-switch.vue'),
          meta: {
            titleKey: 'router.example.hooks.composables.useThemeSwitch',
            rank: 1,
            icon: 'i-lucide-brush',
          },
        },
        {
          path: '/example/hooks/composables/use-http-request',
          name: 'ExampleHookUseHttpRequest',
          component: () => import('@/views/example/hooks/use-http-request.vue'),
          meta: {
            titleKey: 'router.example.hooks.composables.useHttpRequest',
            rank: 2,
            icon: 'i-lucide-webhook',
          },
        },
        {
          path: '/example/hooks/composables/use-locale',
          name: 'ExampleHookUseLocale',
          component: () => import('@/views/example/hooks/use-locale.vue'),
          meta: {
            titleKey: 'router.example.hooks.composables.useLocale',
            rank: 3,
            icon: 'i-lucide-globe',
          },
        },
        {
          path: '/example/hooks/composables/use-auth',
          name: 'ExampleHookUseAuth',
          component: () => import('@/views/example/hooks/use-auth.vue'),
          meta: {
            titleKey: 'router.example.hooks.composables.useAuth',
            rank: 4,
            icon: 'i-lucide-shield',
          },
        },
        {
          path: '/example/hooks/composables/use-auto-mitt',
          name: 'ExampleHookUseAutoMitt',
          component: () => import('@/views/example/hooks/use-auto-mitt.vue'),
          meta: {
            titleKey: 'router.example.hooks.composables.useAutoMitt',
            rank: 5,
            icon: 'i-lucide-radical',
          },
        },
      ],
    },
    {
      path: '/example/hooks/layout',
      name: 'ExampleHooksLayout',
      redirect: '/example/hooks/layout/loading',
      meta: {
        titleKey: 'router.example.hooks.layout.root',
        rank: 1,
        icon: 'i-lucide-layout-dashboard',
      },
      children: [
        {
          path: '/example/hooks/layout/loading',
          name: 'ExampleHookLayoutLoading',
          component: () => import('@/views/example/hooks/layout-loading.vue'),
          meta: {
            titleKey: 'router.example.hooks.layout.loading',
            rank: 0,
            icon: 'i-lucide-loader',
          },
        },
        {
          path: '/example/hooks/layout/page-title',
          name: 'ExampleHookLayoutPageTitle',
          component: () => import('@/views/example/hooks/layout-page-title.vue'),
          meta: {
            titleKey: 'router.example.hooks.layout.pageTitle',
            rank: 1,
            icon: 'i-lucide-heading',
          },
        },
        {
          path: '/example/hooks/layout/admin-tabs',
          name: 'ExampleHookLayoutAdminTabs',
          component: () => import('@/views/example/hooks/layout-admin-tabs.vue'),
          meta: {
            titleKey: 'router.example.hooks.layout.adminTabs',
            rank: 2,
            icon: 'i-lucide-layers',
          },
        },
        {
          path: '/example/hooks/layout/breadcrumbs',
          name: 'ExampleHookLayoutBreadcrumbs',
          component: () => import('@/views/example/hooks/layout-breadcrumbs.vue'),
          meta: {
            titleKey: 'router.example.hooks.layout.breadcrumbs',
            rank: 3,
            icon: 'i-lucide-map-pin',
          },
        },
        {
          path: '/example/hooks/layout/nprogress',
          name: 'ExampleHookLayoutNprogress',
          component: () => import('@/views/example/hooks/layout-nprogress.vue'),
          meta: {
            titleKey: 'router.example.hooks.layout.nprogress',
            rank: 4,
            icon: 'i-lucide-loader-circle',
          },
        },
        {
          path: '/example/hooks/layout/menu-visuals',
          name: 'ExampleHookLayoutMenuVisuals',
          component: () => import('@/views/example/hooks/layout-menu-visuals.vue'),
          meta: {
            titleKey: 'router.example.hooks.layout.menuVisuals',
            rank: 5,
            icon: 'i-lucide-layout-dashboard',
          },
        },
      ],
    },
    {
      path: '/example/hooks/component',
      name: 'ExampleHooksComponent',
      redirect: '/example/hooks/component/use-pro-table',
      meta: {
        titleKey: 'router.example.hooks.component.root',
        rank: 2,
        icon: 'i-lucide-component',
      },
      children: [
        {
          path: '/example/hooks/component/use-pro-table',
          name: 'ExampleHookUseProTable',
          component: () => import('@/views/example/hooks/use-pro-table.vue'),
          meta: {
            titleKey: 'router.example.hooks.component.useProTable',
            rank: 0,
            icon: 'i-lucide-table',
          },
        },
        {
          path: '/example/hooks/component/use-chart-theme',
          name: 'ExampleHookUseChartTheme',
          component: () => import('@/views/example/hooks/use-chart-theme.vue'),
          meta: {
            titleKey: 'router.example.hooks.component.useChartTheme',
            rank: 1,
            icon: 'i-lucide-chart-pie',
          },
        },
        {
          path: '/example/hooks/component/use-app-element-size',
          name: 'ExampleHookUseAppElementSize',
          component: () => import('@/views/example/hooks/use-app-element-size.vue'),
          meta: {
            titleKey: 'router.example.hooks.component.useAppElementSize',
            rank: 2,
            icon: 'i-lucide-maximize',
          },
        },
        {
          path: '/example/hooks/component/use-permission-routes',
          name: 'ExampleHookUsePermissionRoutes',
          component: () => import('@/views/example/hooks/use-permission-routes.vue'),
          meta: {
            titleKey: 'router.example.hooks.component.usePermissionRoutes',
            rank: 3,
            icon: 'i-lucide-key-round',
          },
        },
      ],
    },
  ],
}

export default [hooksRootRoute] satisfies RouteConfig[]
