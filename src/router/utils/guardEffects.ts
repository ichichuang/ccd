/**
 * 路由守卫 UI 副作用：NProgress 进度条、页面 Loading、标题更新
 * 职责：将所有 UI 副作用从权限守卫中解耦，独立注册 beforeEach / afterEach / onError 钩子。
 * 必须在权限守卫之前注册，确保 NProgress 在异步权限检查前启动。
 */
import { brand } from '@/constants/brand'
import { useLayoutStoreWithOut } from '@/stores/modules/layout'
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
 * 安全清理页面加载状态
 * 由于路由重定向可能导致多次 pageLoadingStart() 调用但只有一次清理机会
 * 需要循环清理直到 pageLoadingCount 归零
 */
function safeClearPageLoading(
  layoutStore: ReturnType<typeof useLayoutStoreWithOut>,
  pageLoadingDone: () => void
): void {
  let maxIterations: number = 100
  while (layoutStore.pageLoadingCount > 0 && maxIterations-- > 0) {
    pageLoadingDone()
  }
  if (layoutStore.pageLoadingCount > 0) {
    console.warn(
      `⚠️ Router: pageLoadingCount 清理未完成，剩余: ${layoutStore.pageLoadingCount}，已强制清零`
    )
    layoutStore.pageLoadingCount = 0
    layoutStore.isPageLoading = false
  }
}

/**
 * 注册路由守卫 UI 副作用钩子
 * 必须在 usePermissionGuard 之前调用，确保 NProgress 在异步操作前启动
 */
export function registerGuardEffects(router: Router): void {
  router.beforeEach((to, _from) => {
    const { startProgress } = useNprogress()
    const { pageLoadingStart } = useLoading()

    startProgress()
    updatePageTitle(to)
    pageLoadingStart()
  })

  router.afterEach((to, _from) => {
    const { loadingDone, pageLoadingDone } = useLoading()
    const { doneProgress } = useNprogress()
    const layoutStore: ReturnType<typeof useLayoutStoreWithOut> = useLayoutStoreWithOut()

    // 绝对防御：确保无论经历多少次内部重定向，最终到达时清空所有残留的 Loading 计数
    while (layoutStore.loadingCount > 0) {
      loadingDone()
    }
    while (layoutStore.pageLoadingCount > 0) {
      pageLoadingDone()
    }

    doneProgress()
    updatePageTitle(to)
  })

  // 路由错误兜底：确保全局 / 页面 loading 计数不会泄漏
  router.onError((error: unknown) => {
    const { loadingDone, pageLoadingDone } = useLoading()
    const layoutStore: ReturnType<typeof useLayoutStoreWithOut> = useLayoutStoreWithOut()

    safeClearPageLoading(layoutStore, pageLoadingDone)

    while (layoutStore.loadingCount > 0) {
      loadingDone()
    }

    console.error('🪒 Router: navigation error', error)
  })
}
