/**
 * 路由权限守卫：纯访问控制
 * 职责：登录状态检查、白名单放行、角色+权限守门、动态路由初始化。
 * UI 副作用（NProgress、Loading、标题更新）已解耦至 guardEffects.ts。
 */
import { appLogger } from '@/adapters/logger.adapter'
import { AUTH_ENABLED, appRoutePaths, routeWhitePathList } from '@/constants/router'
import { usePermissionStore } from '@/stores/modules/session'
import { useUserStoreWithOut } from '@/stores/modules/session'
import { useAuth } from '@/hooks/modules/useAuth'
import { isHttpRequestError } from '@/utils/http/errors'
import type { LocationQueryValue, RouteLocationNormalized, Router } from 'vue-router'
import { checkRouteAccess, isWhiteListed, parseSafeRedirect } from './accessControl'

type SessionValidationResult = 'valid' | 'invalid' | 'forbidden'

function getFirstQueryValue(value: LocationQueryValue | LocationQueryValue[]): string | undefined {
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === 'string')
  }
  return typeof value === 'string' ? value : undefined
}

function getCatchAllRedirectedFullPath(to: RouteLocationNormalized): string | undefined {
  if (to.path !== appRoutePaths.notFound) return undefined
  const redirectedFrom = to.redirectedFrom
  if (!redirectedFrom || redirectedFrom.path === appRoutePaths.notFound) return undefined
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
  let sessionValidationPromise: Promise<SessionValidationResult> | null = null
  let validatedSessionToken: string | null = null

  const validatePersistedSession = async (): Promise<SessionValidationResult> => {
    const userStore = useUserStoreWithOut()
    if (!userStore.getIsLogin) return 'invalid'
    if (userStore.invalidateIfSessionShapeInvalid()) return 'invalid'
    if (validatedSessionToken === userStore.getToken) return 'valid'

    sessionValidationPromise ??= useAuth()
      .restoreLoginFromToken()
      .then(userInfo => {
        if (!userInfo) {
          validatedSessionToken = null
          return 'invalid'
        }
        validatedSessionToken = userStore.getToken
        return 'valid'
      })
      .catch(error => {
        if (isHttpRequestError(error) && error.status === 403) {
          return 'forbidden'
        }
        appLogger.error('登录态恢复校验失败', error)
        validatedSessionToken = null
        userStore.clearUserInfo()
        return 'invalid'
      })
      .finally(() => {
        sessionValidationPromise = null
      })

    return sessionValidationPromise
  }

  // 全局前置守卫（纯访问控制，不包含 UI 副作用）
  router.beforeEach(async (to, from) => {
    // 未启用登录/鉴权模式时，直接放行
    if (!AUTH_ENABLED) {
      return true
    }

    const whiteList = routeWhitePathList
    const permissionStore = usePermissionStore()
    const userStore = useUserStoreWithOut()
    let isLogin: boolean = userStore.isLogin
    const isDynamicRoutesLoaded: boolean = permissionStore.isDynamicRoutesLoaded

    if (isLogin && !isWhiteListed(to.path, whiteList)) {
      const validationResult = await validatePersistedSession()
      if (validationResult === 'forbidden') {
        return appRoutePaths.forbidden
      }
      isLogin = validationResult === 'valid'
    }

    if (isLogin) {
      if (to.path === appRoutePaths.login) {
        return { path: appRoutePaths.root }
      } else {
        if (isDynamicRoutesLoaded) {
          if (
            !checkRouteAccess(
              to.meta as { roles?: string[]; auths?: string[] } | undefined,
              userStore.userInfo.roles,
              userStore.userInfo.permissions
            )
          ) {
            return appRoutePaths.forbidden
          }
          return true
        }
        let stopGlobalLoading: (() => void) | null = null
        try {
          // 竞态保护：多次并发导航共享同一个初始化 Promise，防止重复发起 API 请求
          routeInitializingPromise ??= initDynamicRoutes().finally(() => {
            routeInitializingPromise = null
          })
          await routeInitializingPromise

          const target = getNavigationTargetAfterRouteInit(to, from)

          const toParent = to.meta?.parent as LayoutMode | undefined
          const fromParent = from.meta?.parent as LayoutMode | undefined

          // 专门识别"登录页(fullscreen) → 后台(admin/ratio)"的场景：
          // 这类跳转用户已经明确触发了登录，不再叠加全屏遮罩，只保留 pageLoading 即可。
          // 注意：此处有意保留 loadingStart() 调用，因为此 UI 行为与权限初始化流程强耦合。
          const isLoginToNonFullscreen: boolean =
            from.path === appRoutePaths.login &&
            fromParent === 'fullscreen' &&
            toParent !== 'fullscreen'
          const shouldShowGlobalLoading: boolean =
            !isLoginToNonFullscreen && toParent !== 'fullscreen'
          if (shouldShowGlobalLoading) {
            const { startLoading } = useLoading()
            stopGlobalLoading = startLoading()
          }

          // 避免多跳：如果是从登录页跳转，且目标一致，直接放行
          if (
            from.path === appRoutePaths.login &&
            (to.fullPath === target.path || to.path === target.path)
          ) {
            return true
          }

          // 其他场景（如 F5 刷新）：中断当前导航，重定向到完整目标路径
          return { path: target.path, query: target.query, replace: true }
        } catch (error: unknown) {
          appLogger.error('动态路由初始化失败', error)
          return {
            path: appRoutePaths.login,
            query: to.fullPath !== appRoutePaths.login ? { redirect: to.fullPath } : {},
          }
        } finally {
          stopGlobalLoading?.()
        }
      }
    } else {
      if (isWhiteListed(to.path, whiteList)) {
        return true
      }

      const requestedFullPath = getCatchAllRedirectedFullPath(to) ?? to.fullPath
      return {
        path: appRoutePaths.login,
        query: { redirect: requestedFullPath },
      }
    }
  })

  // 全局后置守卫：仅负责 tab 同步（UI 清理已移至 guardEffects.ts）
  router.afterEach((to, _from) => {
    const permissionStore = usePermissionStore()
    const parent = to.meta?.parent as LayoutMode | undefined
    permissionStore.ensureFixedTabsIfAvailable()
    if (parent !== 'fullscreen' && parent !== 'ratio') {
      if (to.name) {
        permissionStore.addTab(to.name as string)
        permissionStore.updateTabActive(to.name as string)
      }
    }
  })

  // onError 已移至 guardEffects.ts 统一处理
}
