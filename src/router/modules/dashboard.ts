const homeRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      titleKey: 'router.dashboard.dashboard',
      rank: 1,
      roles: ['admin', 'user'],
      icon: 'fc-share',
      fixedTag: true, // 固定标签，不可拖拽和删除
      transition: {
        name: 'fade',
        enterTransition: 'animate__animated animate__fadeIn enter-active-class',
        leaveTransition: 'animate__animated animate__fadeOut leave-active-class',
      },
    },
  },
]

export default homeRoutes
