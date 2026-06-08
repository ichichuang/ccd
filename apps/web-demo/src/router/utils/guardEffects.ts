/**
 * 路由守卫 UI 副作用：NProgress 进度条、页面 Loading、标题更新
 * 职责：将所有 UI 副作用从权限守卫中解耦，独立注册 beforeEach / afterEach / onError 钩子。
 * 必须在权限守卫之前注册，确保 NProgress 在异步权限检查前启动。
 */
import { appLogger } from '@/adapters/logger.adapter'
import { brand } from '@/constants/brand'
import { appRoutePaths } from '@/constants/router'
import { t } from '@/locales'
import {
  calculatePageTitle,
  getDeferredRouteTitleSource,
  shouldDeferRouteTitle,
} from '@/hooks/layout/usePageTitle'
import { useNprogress } from '@/hooks/layout/useNprogress'
import { usePermissionStore } from '@/stores/modules/session'
import { useLayoutStoreWithOut } from '@/stores/modules/system'
import type { RouteLocationNormalized, Router } from 'vue-router'

const ROUTE_PAGE_LOADING_DELAY_MS = 0
const ROUTE_PAGE_LOADING_MIN_VISIBLE_MS = 500

function hasRoutePath(routes: RouteConfig[], path: string): boolean {
  return routes.some(route => route.path === path || hasRoutePath(route.children ?? [], path))
}

function hasKnownRedirectedFromRoute(
  to: RouteLocationNormalized,
  staticRoutes: RouteConfig[]
): boolean {
  const redirectedFrom = to.redirectedFrom
  if (!redirectedFrom || redirectedFrom.path === appRoutePaths.notFound) return false
  return hasRoutePath(staticRoutes, redirectedFrom.path)
}

function isAppReadyForTitleUpdates(): boolean {
  if (typeof document === 'undefined') return true
  return document.documentElement.dataset.appReady === 'true'
}

/**
 * 使用纯函数与全局 i18n 更新页面标题
 * 避免在守卫中调用 useI18n/useRoute 等 Composition API
 */
function createPageTitleUpdater(): (to: RouteLocationNormalized) => void {
  let stableTitle: string = brand.displayName

  return (to: RouteLocationNormalized): void => {
    const appTitle: string = brand.displayName
    const permissionStore = usePermissionStore()

    const shouldDeferTitle = shouldDeferRouteTitle(to, permissionStore.isDynamicRoutesLoaded, {
      isAppReady: isAppReadyForTitleUpdates(),
      hasKnownRedirectedFromRoute: hasKnownRedirectedFromRoute(to, permissionStore.getStaticRoutes),
    })
    const deferredTitleSource = shouldDeferTitle ? getDeferredRouteTitleSource(to) : undefined
    let finalTitle: string
    if (deferredTitleSource) {
      finalTitle = calculatePageTitle(deferredTitleSource, appTitle, t)
    } else if (shouldDeferTitle) {
      finalTitle = stableTitle
    } else {
      finalTitle = calculatePageTitle(to, appTitle, t)
    }

    stableTitle = finalTitle || stableTitle || appTitle
    if (typeof document !== 'undefined') {
      document.title = stableTitle
    }
  }
}

/**
 * 注册路由守卫 UI 副作用钩子
 * 必须在 usePermissionGuard 之前调用，确保 NProgress 在异步操作前启动
 */
export function registerGuardEffects(router: Router): void {
  let routePageLoadingTimer: ReturnType<typeof setTimeout> | null = null
  let routePageLoadingReleaseTimer: ReturnType<typeof setTimeout> | null = null
  let routePageLoadingStartedAt = 0
  let routePageLoadingActive = false
  const updatePageTitle = createPageTitleUpdater()

  const clearRoutePageLoadingTimer = (): void => {
    if (routePageLoadingTimer === null) return
    clearTimeout(routePageLoadingTimer)
    routePageLoadingTimer = null
  }

  const clearRoutePageLoadingReleaseTimer = (): void => {
    if (routePageLoadingReleaseTimer === null) return
    clearTimeout(routePageLoadingReleaseTimer)
    routePageLoadingReleaseTimer = null
  }

  const isInitialNavigation = (from: RouteLocationNormalized): boolean => from.matched.length === 0

  const shouldSuppressRoutePageLoadingForBoot = (from: RouteLocationNormalized): boolean => {
    const layoutStore = useLayoutStoreWithOut()
    const nativePreloaderExists =
      typeof document !== 'undefined' && document.getElementById('preloader-bg') !== null

    return isInitialNavigation(from) && (layoutStore.isLoading || nativePreloaderExists)
  }

  const activateRoutePageLoading = (): void => {
    clearRoutePageLoadingTimer()
    clearRoutePageLoadingReleaseTimer()

    routePageLoadingStartedAt = Date.now()
    if (routePageLoadingActive) return

    routePageLoadingActive = true
    useLayoutStoreWithOut().beginPageLoading()
  }

  const scheduleRoutePageLoading = (): void => {
    clearRoutePageLoadingTimer()
    clearRoutePageLoadingReleaseTimer()

    if (ROUTE_PAGE_LOADING_DELAY_MS <= 0) {
      activateRoutePageLoading()
      return
    }

    routePageLoadingTimer = setTimeout(activateRoutePageLoading, ROUTE_PAGE_LOADING_DELAY_MS)
  }

  const clearOwnedPageLoading = (): void => {
    clearRoutePageLoadingTimer()
    if (!routePageLoadingActive) return

    const elapsed = Date.now() - routePageLoadingStartedAt
    const remainingVisibleMs = Math.max(0, ROUTE_PAGE_LOADING_MIN_VISIBLE_MS - elapsed)

    clearRoutePageLoadingReleaseTimer()
    routePageLoadingReleaseTimer = setTimeout(() => {
      routePageLoadingReleaseTimer = null
      if (!routePageLoadingActive) return

      routePageLoadingActive = false
      routePageLoadingStartedAt = 0
      useLayoutStoreWithOut().endPageLoading()
    }, remainingVisibleMs)
  }

  router.beforeEach((to, from) => {
    const { startProgress } = useNprogress()

    startProgress()
    updatePageTitle(to)
    if (shouldSuppressRoutePageLoadingForBoot(from)) {
      clearRoutePageLoadingTimer()
      clearRoutePageLoadingReleaseTimer()
      return
    }
    scheduleRoutePageLoading()
  })

  router.afterEach((to, _from) => {
    const { doneProgress } = useNprogress()

    clearOwnedPageLoading()
    doneProgress()
    updatePageTitle(to)
  })

  // 路由错误兜底：仅清理路由自己开启的 loading，避免误伤业务侧并发 loading
  router.onError((error: unknown) => {
    const { doneProgress } = useNprogress()

    clearOwnedPageLoading()
    doneProgress()
    appLogger.error('🪒 Router: navigation error', error)
  })
}
