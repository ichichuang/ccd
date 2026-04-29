import router, { ensureStaticRoutesLoaded, routeUtils } from '@/router'
import { setRouterCapabilities } from '@/infra/router/routeProvider'

export const setupRouter = async (app: App) => {
  await ensureStaticRoutesLoaded()
  app.use(router)

  // 注入路由能力到 infra 层，供 Store 等通过 getRouterCapabilities() 使用，避免 Store 直接依赖 router/utils
  setRouterCapabilities({
    getAdminMenuTree: () => routeUtils.getAdminMenuTree(),
    getFlatRouteList: () => routeUtils.flatRoutes,
  })
}
