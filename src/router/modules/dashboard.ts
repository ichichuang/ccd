const homeRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/dashboard.vue'),
    meta: {
      titleKey: 'router.dashboard.dashboard',
      rank: 0,
      icon: 'i-lucide-layout-dashboard',
      roles: ['admin', 'user'],
      fixedTag: true, // 固定标签，不可拖拽和删
      keepAlive: true,
    },
  },
]

export default homeRoutes
