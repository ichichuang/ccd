import { appRouteNames, appRoutePaths } from '@/constants/router'
import { defineRouteModule } from '@/router/utils/routeModules'

const dashboardRoutes = defineRouteModule<RouteConfig[]>([
  {
    path: appRoutePaths.dashboard,
    name: appRouteNames.dashboard,
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      titleKey: 'router.dashboard.dashboard',
      rank: 0,
      icon: 'i-lucide-layout-dashboard',
      fixedTag: true, // 固定标签，不可拖拽和删
      keepAlive: true,
    },
  },
])

export default dashboardRoutes
