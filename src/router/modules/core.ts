const coreRoutes: RouteConfig[] = [
  {
    path: '/',
    name: 'Root',
    redirect: import.meta.env.VITE_ROOT_REDIRECT,
    meta: {
      titleKey: 'router.core.root',
      showLink: false,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/login.vue'),
    meta: {
      titleKey: 'router.core.login',
      parent: 'fullscreen',
      showLink: false,
    },
  },
  {
    path: '/system-configuration',
    name: 'systemConfiguration',
    meta: {
      title: '系统配置',
      rank: 0,
    },
    children: [
      {
        path: '/system-configuration/theme',
        name: 'theme',
        component: () => import('@/views/system-configuration/theme.vue'),
        meta: {
          title: '主题系统',
          rank: 1,
          parent: 'fullscreen',
        },
      },
      {
        path: '/system-configuration/size',
        name: 'size',
        component: () => import('@/views/system-configuration/size.vue'),
        meta: {
          title: '尺寸系统',
          rank: 2,
          parent: 'fullscreen',
        },
      },
      {
        path: '/system-configuration/breakpoints',
        name: 'breakpoints',
        component: () => import('@/views/system-configuration/breakpoints.vue'),
        meta: {
          title: '断点系统',
          rank: 3,
          parent: 'fullscreen',
        },
      },
      // scrollbar
      {
        path: '/system-configuration/scrollbar',
        name: 'scrollbar',
        component: () => import('@/views/system-configuration/scrollbar.vue'),
        meta: {
          title: '滚动条系统',
          rank: 4,
          parent: 'fullscreen',
        },
      },
    ],
  },
]

export default coreRoutes
