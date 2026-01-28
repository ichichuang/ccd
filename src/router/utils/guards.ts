/* 注册路由 */
import { rootRedirect } from '@/constants/router'
import { usePermissionStore } from '@/stores/modules/permission'
import type { Router } from 'vue-router'
import { processAsyncRoutes } from './common'
import type { createDynamicRouteManager } from './common'
import { usePermissionGuard } from './permission'

type DynamicRouteManager = ReturnType<typeof createDynamicRouteManager>

export const registerRouterGuards = ({
  router,
  routeUtils,
  staticRoutes,
  dynamicRouteManager,
}: {
  router: Router
  routeUtils: RouteUtils
  staticRoutes: RouteConfig[]
  dynamicRouteManager: DynamicRouteManager
}) => {
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
