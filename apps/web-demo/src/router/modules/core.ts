import { appRouteNames, appRoutePaths } from '@/constants/router'
import { defineRouteModule } from '@/router/utils/routeModules'

const coreRoutes = defineRouteModule<RouteConfig[]>([
  {
    path: appRoutePaths.root,
    name: appRouteNames.root,
    redirect: import.meta.env.VITE_ROOT_REDIRECT,
    meta: {
      titleKey: 'router.core.root',
      showLink: false,
    },
  },
  {
    path: appRoutePaths.login,
    name: appRouteNames.login,
    component: () => import('@/views/login/index.vue'),
    meta: {
      titleKey: 'router.core.login',
      showLink: false,
      parent: 'fullscreen',
    },
  },
])

export default coreRoutes
