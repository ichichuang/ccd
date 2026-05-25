import type { RouteRecordRaw } from 'vue-router'

export const desktopRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
    meta: {
      title: 'CCD Desktop',
    },
  },
  {
    path: '/home',
    name: 'DesktopHome',
    component: () => import('../views/DesktopHome.vue'),
    meta: {
      title: 'Desktop Home',
    },
  },
]
