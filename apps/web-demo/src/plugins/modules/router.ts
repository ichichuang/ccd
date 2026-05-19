import router, { ensureStaticRoutesLoaded, routeUtils } from '@/router'
import { installRouterCapabilities } from '@/infra/router/routeProvider'

export const setupRouter = (app: App) => {
  app.use(router)

  // 注入路由能力到 infra 层，供 Store 等通过 getRouterCapabilities() 使用，避免 Store 直接依赖 router/utils
  installRouterCapabilities({
    getAdminMenuTree: () => routeUtils.getAdminMenuTree(),
    getFlatRouteList: () => routeUtils.flatRoutes,
  })

  void ensureStaticRoutesLoaded().catch(error => {
    console.error('静态路由后台加载失败:', error)
  })
}
