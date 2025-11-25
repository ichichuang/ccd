/**
 * 路由白名单配置
 * 不需要登录验证的页面路径
 */
export const routeWhitePathList: string[] = [
  '/login',
  '/register',
  '/example',
  '/example/layout/ratio',
]
export const routeWhiteNameList: string[] = ['Login', 'Register', 'Example', 'ExampleRatio']

/**
 * 错误页面配置
 * 系统错误页面的路径
 */
export const errorPagesPathList: string[] = ['/404', '/403', '/500']
export const errorPagesNameList: string[] = ['404', '403', '500']

/**
 * rootRedirect
 * 根路由重定向
 */
export const rootRedirect: RouteConfig[] = [
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/notfound/not-found-page.vue'),
    meta: {
      titleKey: 'router.error.notFound',
      showLink: false,
      parent: 'fullscreen',
    },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/notfound/forbidden-page.vue'),
    meta: {
      titleKey: 'router.error.forbidden',
      showLink: false,
      parent: 'fullscreen',
    },
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/notfound/server-error-page.vue'),
    meta: {
      titleKey: 'router.error.serverError',
      showLink: false,
      parent: 'fullscreen',
    },
  },
  // 捕获所有未匹配的路由，重定向到404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'CatchAll',
    redirect: '/404',
    meta: {
      showLink: false,
    },
  },
]
