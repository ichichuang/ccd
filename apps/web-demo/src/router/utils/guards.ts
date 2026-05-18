/* 注册路由 */
import { rootRedirect } from '@/constants/router'
import { usePermissionStore } from '@/stores/modules/session'
import { usePermissionRoutes } from '@/hooks/modules/usePermissionRoutes'
import type { Router } from 'vue-router'
import { processAsyncRoutes } from './transform'
import type { createDynamicRouteManager } from './dynamic'
import { usePermissionGuard } from './permission'
import { registerGuardEffects } from './guardEffects'

type DynamicRouteManager = ReturnType<typeof createDynamicRouteManager>
const INITIAL_DYNAMIC_ROUTES_TIMEOUT_MS = 1_500

export const registerRouterGuards = ({
  router,
  routeUtils,
  loadStaticRoutes,
  dynamicRouteManager,
}: {
  router: Router
  routeUtils: RouteUtils
  loadStaticRoutes: () => Promise<RouteConfig[]>
  dynamicRouteManager: DynamicRouteManager
}) => {
  let backgroundDynamicRouteHydrationPromise: Promise<void> | null = null

  const syncRouteRegistry = (routes: RouteConfig[]): void => {
    routeUtils.updateRouteUtils(routes)
  }

  const loadAndRegisterStaticRoutes = async (): Promise<RouteConfig[]> => {
    const permissionStore = usePermissionStore()
    const staticRoutes = await loadStaticRoutes()
    permissionStore.setStaticRoutes([...staticRoutes, ...rootRedirect])
    syncRouteRegistry(staticRoutes)
    return staticRoutes
  }

  const hydrateDynamicRoutes = async (
    staticRoutes: RouteConfig[],
    options?: { initial: boolean }
  ): Promise<RouteConfig[]> => {
    const permissionStore = usePermissionStore()
    const { fetchRoutes } = usePermissionRoutes()
    const rawRoutes = await fetchRoutes(
      options?.initial
        ? {
            timeoutMs: INITIAL_DYNAMIC_ROUTES_TIMEOUT_MS,
            maxRetries: 0,
          }
        : undefined
    )
    const asyncRoutes = processAsyncRoutes(rawRoutes)

    // 仅注入后台/权限相关的动态路由；错误页与 CatchAll 已作为初始静态路由注册
    dynamicRouteManager.addRoutes([...asyncRoutes])

    const completeRoutes = [...staticRoutes, ...asyncRoutes]
    syncRouteRegistry(completeRoutes)
    permissionStore.setDynamicRoutesLoaded(true)
    return completeRoutes
  }

  const scheduleBackgroundDynamicRouteHydration = (staticRoutes: RouteConfig[]): void => {
    if (backgroundDynamicRouteHydrationPromise) return

    backgroundDynamicRouteHydrationPromise = hydrateDynamicRoutes(staticRoutes)
      .then(() => undefined)
      .catch(error => {
        console.error('后台动态路由刷新失败:', error)
      })
      .finally(() => {
        backgroundDynamicRouteHydrationPromise = null
      })
  }

  // 加载动态路由：通过 usePermissionRoutes composable 拉取（遵循 api→hook→store 数据流），
  // 此处只做路由转换与注册
  const initDynamicRoutes = async (): Promise<void> => {
    const permissionStore = usePermissionStore()
    const staticRoutes = await loadAndRegisterStaticRoutes()

    try {
      await hydrateDynamicRoutes(staticRoutes, { initial: true })
    } catch (error) {
      console.warn('初始动态路由加载超时或失败，使用静态路由继续首屏:', error)
      permissionStore.setDynamicRoutesLoaded(true)
      scheduleBackgroundDynamicRouteHydration(staticRoutes)
    }
  }

  // 1. UI 副作用钩子（必须先注册，NProgress 在异步权限检查前启动）
  registerGuardEffects(router)

  // 2. 权限守卫（纯访问控制）
  usePermissionGuard({ router, initDynamicRoutes })

  return dynamicRouteManager
}
