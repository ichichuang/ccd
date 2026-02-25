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
          rank: 1,
          icon: 'i-lucide-palette',
        },
      },
      {
        path: '/system-configuration/size',
        name: 'size',
        component: () => import('@/views/system-configuration/size.vue'),
        meta: {
          titleKey: 'router.systemConfigurationSize',
          rank: 2,
          icon: 'i-lucide-maximize-2',
        },
      },
      {
        path: '/system-configuration/breakpoints',
        name: 'breakpoints',
        component: () => import('@/views/system-configuration/breakpoints.vue'),
        meta: {
          titleKey: 'router.systemConfigurationBreakpoints',
          rank: 3,
          icon: 'i-lucide-monitor',
        },
      },
      {
        path: '/system-configuration/scrollbar',
        name: 'scrollbar',
        component: () => import('@/views/system-configuration/scrollbar.vue'),
        meta: {
          titleKey: 'router.systemConfigurationScrollbar',
          rank: 4,
          icon: 'i-lucide-layout',
        },
      },
      {
        path: '/system-configuration/unocss',
        name: 'unocss',
        component: () => import('@/views/system-configuration/unocss.vue'),
        meta: {
          titleKey: 'router.systemConfigurationUnocss',
          rank: 5,
          icon: 'i-lucide-diamond',
        },
      },
    ],
  },
]

export default systemConfigurationRoutes
