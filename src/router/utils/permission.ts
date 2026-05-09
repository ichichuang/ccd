/**
 * 路由权限守卫：纯访问控制
 * 职责：登录状态检查、白名单放行、角色+权限守门、动态路由初始化。
 * UI 副作用（NProgress、Loading、标题更新）已解耦至 guardEffects.ts。
 */
import { AUTH_ENABLED, routeWhitePathList } from '@/constants/router'
import { usePermissionStore } from '@/stores/modules/session'
import { useUserStoreWithOut } from '@/stores/modules/session'
import type { LocationQueryValue, RouteLocationNormalized, Router } from 'vue-router'
import { checkRouteAccess, isWhiteListed, parseSafeRedirect } from './accessControl'

function getFirstQueryValue(value: LocationQueryValue | LocationQueryValue[]): string | undefined {
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === 'string')
  }
  return typeof value === 'string' ? value : undefined
}

function getCatchAllRedirectedFullPath(to: RouteLocationNormalized): string | undefined {
  if (to.path !== '/404') return undefined
  const redirectedFrom = to.redirectedFrom
  if (!redirectedFrom || redirectedFrom.path === '/404') return undefined
  return redirectedFrom.fullPath
}

function getNavigationTargetAfterRouteInit(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): { path: string; query: Record<string, string> } {
  const redirectResult = parseSafeRedirect(getFirstQueryValue(from.query.redirect))
  if (redirectResult) {
    return redirectResult
  }

  const requestedFullPath = getCatchAllRedirectedFullPath(to) ?? to.fullPath
  const requestedResult = parseSafeRedirect(requestedFullPath)
  if (requestedResult) {
    return requestedResult
  }

  return { path: to.path, query: {} }
}

export const usePermissionGuard = ({
  router,
  initDynamicRoutes,
}: {
  router: Router
  initDynamicRoutes: () => Promise<void>
}) => {
  // 竞态保护：缓存进行中的路由初始化 Promise，防止并发导航触发多次 API 请求
  let routeInitializingPromise: Promise<void> | null = null

  // 全局前置守卫（纯访问控制，不包含 UI 副作用）
  router.beforeEach(async (to, from, next) => {
    // 未启用登录/鉴权模式时，直接放行
    if (!AUTH_ENABLED) {
      next()
      return
    }

    const whiteList = routeWhitePathList
    const permissionStore = usePermissionStore()
    const userStore = useUserStoreWithOut()
    const isLogin: boolean = userStore.isLogin
    const isDynamicRoutesLoaded: boolean = permissionStore.isDynamicRoutesLoaded

    if (isLogin) {
      if (to.path === '/login') {
        next({ path: '/' })
        return
      } else {
        if (isDynamicRoutesLoaded) {
          if (
            !checkRouteAccess(
              to.meta as { roles?: string[]; auths?: string[] } | undefined,
              userStore.userInfo.roles,
              userStore.userInfo.permissions
            )
          ) {
            next('/403')
            return
          }
          next()
          return
        }
        let stopGlobalLoading: (() => void) | null = null
        try {
          // 竞态保护：多次并发导航共享同一个初始化 Promise，防止重复发起 API 请求
          routeInitializingPromise ??= initDynamicRoutes().finally(() => {
            routeInitializingPromise = null
          })
          await routeInitializingPromise

          const target = getNavigationTargetAfterRouteInit(to, from)

          permissionStore.setDynamicRoutesLoaded(true)

          const toParent = to.meta?.parent as LayoutMode | undefined
          const fromParent = from.meta?.parent as LayoutMode | undefined

          // 专门识别"登录页(fullscreen) → 后台(admin/ratio)"的场景：
          // 这类跳转用户已经明确触发了登录，不再叠加全屏遮罩，只保留 pageLoading 即可。
          // 注意：此处有意保留 loadingStart() 调用，因为此 UI 行为与权限初始化流程强耦合。
          const isLoginToNonFullscreen: boolean =
            from.path === '/login' && fromParent === 'fullscreen' && toParent !== 'fullscreen'
          const shouldShowGlobalLoading: boolean =
            !isLoginToNonFullscreen && toParent !== 'fullscreen'
          if (shouldShowGlobalLoading) {
            const { startLoading } = useLoading()
            stopGlobalLoading = startLoading()
          }

          // 避免多跳：如果是从登录页跳转，且目标一致，直接放行
          if (from.path === '/login' && (to.fullPath === target.path || to.path === target.path)) {
            next()
            return
          }

          // 其他场景（如 F5 刷新）：中断当前导航，重定向到完整目标路径
          next({ path: target.path, query: target.query, replace: true })
          return
        } catch (error: unknown) {
          console.error('动态路由初始化失败', error)
          next({
            path: '/login',
            query: to.fullPath !== '/login' ? { redirect: to.fullPath } : {},
          })
          return
        } finally {
          stopGlobalLoading?.()
        }
      }
    } else {
      if (isWhiteListed(to.path, whiteList)) {
        next()
      } else {
        const requestedFullPath = getCatchAllRedirectedFullPath(to) ?? to.fullPath
        next(`/login?redirect=${encodeURIComponent(requestedFullPath)}`)
      }
    }
  })

  // 全局后置守卫：仅负责 tab 同步（UI 清理已移至 guardEffects.ts）
  router.afterEach((to, _from) => {
    const permissionStore = usePermissionStore()
    const parent = to.meta?.parent as LayoutMode | undefined
    if (parent !== 'fullscreen' && parent !== 'ratio') {
      if (to.name) {
        permissionStore.addTab(to.name as string)
        permissionStore.updateTabActive(to.name as string)
      }
    }
  })

  // onError 已移至 guardEffects.ts 统一处理
}
