/**
 * 路由白名单配置
 * 不需要登录验证的页面路径
 */
export const appRoutePaths = {
  root: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  notFound: '/404',
  forbidden: '/403',
  serverError: '/500',
  catchAll: '/:pathMatch(.*)*',
} as const

export const appRouteNames = {
  root: 'Root',
  login: 'Login',
  register: 'Register',
  dashboard: 'Dashboard',
  notFound: '404',
  forbidden: '403',
  serverError: '500',
  catchAll: 'CatchAll',
} as const

export type AppRoutePathValue = (typeof appRoutePaths)[keyof typeof appRoutePaths]
export type AppRouteNameValue = (typeof appRouteNames)[keyof typeof appRouteNames]

export const routeWhitePathList: readonly AppRoutePathValue[] = [
  appRoutePaths.login,
  appRoutePaths.register,
] as const
export const routeWhiteNameList: readonly AppRouteNameValue[] = [
  appRouteNames.login,
  appRouteNames.register,
] as const

/**
 * 是否启用登录/鉴权模式
 * 默认开启；可通过 VITE_AUTH_ENABLED=false 关闭
 */
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED !== 'false'

/**
 * 错误页面配置
 * 系统错误页面的路径
 */
export const errorPagesPathList: readonly AppRoutePathValue[] = [
  appRoutePaths.notFound,
  appRoutePaths.forbidden,
  appRoutePaths.serverError,
] as const
export const errorPagesNameList: readonly AppRouteNameValue[] = [
  appRouteNames.notFound,
  appRouteNames.forbidden,
  appRouteNames.serverError,
] as const

/**
 * rootRedirect
 * 根路由重定向
 */
export const rootRedirect: RouteConfig[] = [
  {
    path: appRoutePaths.notFound,
    name: appRouteNames.notFound,
    component: () => import('@/views/notfound/404.vue'),
    meta: {
      titleKey: 'router.error.notFound',
      showLink: false,
      parent: 'fullscreen',
    },
  },
  {
    path: appRoutePaths.forbidden,
    name: appRouteNames.forbidden,
    component: () => import('@/views/notfound/403.vue'),
    meta: {
      titleKey: 'router.error.forbidden',
      showLink: false,
      parent: 'fullscreen',
    },
  },
  {
    path: appRoutePaths.serverError,
    name: appRouteNames.serverError,
    component: () => import('@/views/notfound/500.vue'),
    meta: {
      titleKey: 'router.error.serverError',
      showLink: false,
      parent: 'fullscreen',
    },
  },
  // 捕获所有未匹配的路由，重定向到404页面
  {
    path: appRoutePaths.catchAll,
    name: appRouteNames.catchAll,
    redirect: appRoutePaths.notFound,
    meta: {
      titleKey: 'router.error.notFound',
      showLink: false,
    },
  },
]
