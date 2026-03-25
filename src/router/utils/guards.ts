/* 注册路由 */
import { rootRedirect } from '@/constants/router'
import { usePermissionStore } from '@/stores/modules/permission'
import { usePermissionRoutes } from '@/hooks/modules/usePermissionRoutes'
import type { Router } from 'vue-router'
import { processAsyncRoutes } from './transform'
import type { createDynamicRouteManager } from './dynamic'
import { usePermissionGuard } from './permission'
import { registerGuardEffects } from './guardEffects'

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

    // 仅注入后台/权限相关的动态路由；错误页与 CatchAll 已作为初始静态路由注册
    dynamicRouteManager.addRoutes([...asyncRoutes])

    const completeRoutes = [...staticRoutes, ...asyncRoutes]
    routeUtils.updateRouteUtils(completeRoutes)
  }

  // 1. UI 副作用钩子（必须先注册，NProgress 在异步权限检查前启动）
  registerGuardEffects(router)

  // 2. 权限守卫（纯访问控制）
  usePermissionGuard({ router, initDynamicRoutes })

  return dynamicRouteManager
}
