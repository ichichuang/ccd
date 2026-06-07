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
        parent: 'fullscreen',
        reuseWindow: true,
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
        parent: 'fullscreen',
        reuseWindow: true,
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
        parent: 'fullscreen',
        reuseWindow: true,
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
        parent: 'fullscreen',
        reuseWindow: true,
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
        parent: 'fullscreen',
        reuseWindow: true,
      },
    },
  ],
}

export default [systemConfigurationRootRoute] satisfies RouteConfig[]
