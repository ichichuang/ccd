const systemConfigurationRoutes: RouteConfig[] = [
  {
    path: '/system-configuration',
    name: 'systemConfiguration',
    meta: {
      titleKey: 'router.systemConfiguration',
      rank: 1,
      icon: 'i-lucide-settings',
    },
    children: [
      {
        path: '/system-configuration/theme',
        name: 'theme',
        component: () => import('@/views/system-configuration/theme.vue'),
        meta: {
          titleKey: 'router.systemConfigurationTheme',
          icon: 'i-lucide-palette',
        },
      },
      {
        path: '/system-configuration/size',
        name: 'size',
        component: () => import('@/views/system-configuration/size.vue'),
        meta: {
          titleKey: 'router.systemConfigurationSize',
          icon: 'i-lucide-maximize-2',
        },
      },
      {
        path: '/system-configuration/unocss',
        name: 'unocss',
        component: () => import('@/views/system-configuration/unocss.vue'),
        meta: {
          titleKey: 'router.systemConfigurationUnocss',
          icon: 'i-lucide-diamond',
        },
      },
      {
        path: '/system-configuration/breakpoints',
        name: 'breakpoints',
        component: () => import('@/views/system-configuration/breakpoints.vue'),
        meta: {
          titleKey: 'router.systemConfigurationBreakpoints',
          icon: 'i-lucide-monitor',
        },
      },
      {
        path: '/system-configuration/layout',
        name: 'layout',
        component: () => import('@/views/system-configuration/layout.vue'),
        meta: {
          titleKey: 'router.systemConfigurationLayout',
          icon: 'i-lucide-layout-dashboard',
        },
      },
      {
        path: '/system-configuration/scrollbar',
        name: 'scrollbar',
        component: () => import('@/views/system-configuration/scrollbar.vue'),
        meta: {
          titleKey: 'router.systemConfigurationScrollbar',
          icon: 'i-lucide-layout',
        },
      },
    ],
  },
]

export default systemConfigurationRoutes
