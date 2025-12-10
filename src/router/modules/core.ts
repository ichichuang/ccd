import { env } from '@/utils'
const coreRoutes: RouteConfig[] = [
  {
    path: '/',
    name: 'Root',
    redirect: env.rootRedirect,
    meta: {
      titleKey: 'router.core.root',
      rank: 0,
      showLink: false,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/indexs.vue'),
    meta: {
      titleKey: 'router.core.login',
      rank: 1,
      parent: 'fullscreen',
      showLink: false,
    },
  },
]

export default coreRoutes
