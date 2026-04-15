/**
 * 路由守卫 UI 副作用：NProgress 进度条、页面 Loading、标题更新
 * 职责：将所有 UI 副作用从权限守卫中解耦，独立注册 beforeEach / afterEach / onError 钩子。
 * 必须在权限守卫之前注册，确保 NProgress 在异步权限检查前启动。
 */
import { brand } from '@/constants/brand'
import { t } from '@/locales'
import { calculatePageTitle } from '@/hooks/layout/usePageTitle'
import { useLoading } from '@/hooks/layout/useLoading'
import { useNprogress } from '@/hooks/layout/useNprogress'
import type { RouteLocationNormalized, Router } from 'vue-router'

/**
 * 使用纯函数与全局 i18n 更新页面标题
 * 避免在守卫中调用 useI18n/useRoute 等 Composition API
 */
function updatePageTitle(to: RouteLocationNormalized): void {
  const appTitle: string = brand.name
  const finalTitle: string = calculatePageTitle(to, appTitle, t)
  if (typeof document !== 'undefined') {
    document.title = finalTitle
  }
}

/**
 * 注册路由守卫 UI 副作用钩子
 * 必须在 usePermissionGuard 之前调用，确保 NProgress 在异步操作前启动
 */
export function registerGuardEffects(router: Router): void {
  let pendingRoutePageLoads = 0

  const clearOwnedPageLoading = (): void => {
    if (pendingRoutePageLoads === 0) return
    const { pageLoadingDone } = useLoading()

    while (pendingRoutePageLoads > 0) {
      pageLoadingDone()
      pendingRoutePageLoads -= 1
    }
  }

  router.beforeEach((to, _from) => {
    const { startProgress } = useNprogress()
    const { pageLoadingStart } = useLoading()

    startProgress()
    updatePageTitle(to)
    pendingRoutePageLoads += 1
    pageLoadingStart()
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
    console.error('🪒 Router: navigation error', error)
  })
}
