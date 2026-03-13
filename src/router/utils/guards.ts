/* 注册路由 */
import { rootRedirect } from '@/constants/router'
import { usePermissionStore } from '@/stores/modules/permission'
import { usePermissionRoutes } from '@/hooks/modules/usePermissionRoutes'
import type { Router } from 'vue-router'
import { processAsyncRoutes } from './transform'
import type { createDynamicRouteManager } from './dynamic'
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
  // 加载动态路由：通过 usePermissionRoutes composable 拉取（遵循 api→hook→store 数据流），
  // 此处只做路由转换与注册
  const initDynamicRoutes = async (): Promise<void> => {
    const permissionStore = usePermissionStore()
    const { fetchRoutes } = usePermissionRoutes()
    permissionStore.setStaticRoutes([...staticRoutes, ...rootRedirect])

    const rawRoutes = await fetchRoutes()
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
