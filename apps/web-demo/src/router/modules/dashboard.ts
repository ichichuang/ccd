const dashboardRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      titleKey: 'router.dashboard.dashboard',
      rank: 0,
      icon: 'i-lucide-layout-dashboard',
      fixedTag: true, // 固定标签，不可拖拽和删
      keepAlive: true,
    },
  },
]

export default dashboardRoutes
