/* 注册路由 */
import { rootRedirect } from '@/constants/modules/router'
import { usePermissionStore } from '@/stores/modules/permission'
import type { Router } from 'vue-router'
import { createDynamicRouteManager, processAsyncRoutes } from './common'
import { usePermissionGuard } from './permission'

export const registerRouterGuards = ({
  router,
  routeUtils,
  staticRoutes,
}: {
  router: Router
  routeUtils: RouteUtils
  staticRoutes: RouteConfig[]
}) => {
  const dynamicRouteManager = createDynamicRouteManager(router)

  // 加载动态路由：由 Store 负责拉取并持久化，此处只做转换与注册
  const initDynamicRoutes = async (): Promise<void> => {
    const permissionStore = usePermissionStore()
    permissionStore.setStaticRoutes([...staticRoutes, ...rootRedirect])

    const rawRoutes = await permissionStore.fetchDynamicRoutes()
    const asyncRoutes = processAsyncRoutes(rawRoutes)

    dynamicRouteManager.addRoutes([...asyncRoutes])
    dynamicRouteManager.addRoutes([...rootRedirect])

    const completeRoutes = [...staticRoutes, ...asyncRoutes, ...rootRedirect]
    routeUtils.updateRouteUtils(completeRoutes)
  }

  // 注册权限守卫
  usePermissionGuard({ router, initDynamicRoutes })

  return dynamicRouteManager
}
