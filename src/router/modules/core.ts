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
      showLink: false,
      parent: 'fullscreen',
    },
  },
]

export default coreRoutes
