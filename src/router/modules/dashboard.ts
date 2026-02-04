const homeRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/dashboard.vue'),
    meta: {
      titleKey: 'router.dashboard.dashboard',
      rank: 1,
      roles: ['admin', 'user'],
      fixedTag: true, // 固定标签，不可拖拽和删
      keepAlive: true,
      // transition: {
      //   name: 'fade',
      //   enterTransition: 'animate__animated animate__fadeInTopRight enter-active-class',
      //   leaveTransition: 'animate__animated animate__fadeOutBottomRight leave-active-class',
      // },
    },
  },
]

export default homeRoutes
