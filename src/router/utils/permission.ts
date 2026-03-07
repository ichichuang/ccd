/* 守卫 */
import { brand } from '@/constants/brand'
import { AUTH_ENABLED, routeWhitePathList } from '@/constants/router'
import { usePermissionStore } from '@/stores/modules/permission'
import { useUserStoreWithOut } from '@/stores/modules/user'
import { useLayoutStoreWithOut } from '@/stores/modules/layout'
import { t } from '@/locales'
import { calculatePageTitle } from '@/hooks/layout/usePageTitle'
import type { RouteLocationNormalized, Router } from 'vue-router'

/**
 * 使用纯函数与全局 i18n 更新页面标题
 * 避免在守卫中调用 useI18n/useRoute 等 Composition API
 */
function updatePageTitle(to: RouteLocationNormalized) {
  const appTitle = brand.name
  const finalTitle = calculatePageTitle(to, appTitle, t)
  // 直接操作 document.title，保持守卫层的纯 JS 特性
  if (typeof document !== 'undefined') {
    document.title = finalTitle
  }
}

/**
 * 安全清理页面加载状态
 * 由于路由重定向可能导致多次 pageLoadingStart() 调用但只有一次清理机会
 * 需要循环清理直到 pageLoadingCount 归零
 * @param layoutStore - Layout Store 实例
 * @param pageLoadingDone - pageLoadingDone 函数
 */
function safeClearPageLoading(
  layoutStore: ReturnType<typeof useLayoutStoreWithOut>,
  pageLoadingDone: () => void
) {
  // 添加最大循环次数保护，防止极端情况下的无限循环
  // 正常情况下，pageLoadingCount 不会超过路由守卫的嵌套深度（通常 < 10）
  let maxIterations = 100
  while (layoutStore.pageLoadingCount > 0 && maxIterations-- > 0) {
    pageLoadingDone()
  }
  // 如果达到最大次数仍未清理完成，记录警告并强制清零（兜底保护）
  if (layoutStore.pageLoadingCount > 0) {
    console.warn(
      `⚠️ Router: pageLoadingCount 清理未完成，剩余: ${layoutStore.pageLoadingCount}，已强制清零`
    )
    // 强制清零（兜底保护）
    layoutStore.pageLoadingCount = 0
    layoutStore.isPageLoading = false
  }
}

export const usePermissionGuard = ({
  router,
  initDynamicRoutes,
}: {
  router: Router
  initDynamicRoutes: () => Promise<void>
}) => {
  // 使用闭包变量追踪当前导航是否调用了 loadingStart()
  // 用于在 afterEach 中精确控制 loadingDone() 的调用
  let currentNavigationHasLoadingStart = false
  // 标记是否是首次路由导航（用于处理初始 loadingCount: 1 的情况）
  let isFirstNavigation = true

  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const { loadingStart, pageLoadingStart, loadingDone, pageLoadingDone } = useLoading()
    const { startProgress, doneProgress } = useNprogress()
    const layoutStore = useLayoutStoreWithOut()

    // 重置状态标记
    currentNavigationHasLoadingStart = false

    startProgress()
    updatePageTitle(to)
    pageLoadingStart()

    // 未启用登录/鉴权模式时，直接放行（仅保留加载与标题更新）
    if (!AUTH_ENABLED) {
      next()
      return
    }

    const whiteList = routeWhitePathList
    const permissionStore = usePermissionStore()
    const userStore = useUserStoreWithOut()
    const isLogin = computed(() => userStore.isLogin)
    const isDynamicRoutesLoaded = computed(() => permissionStore.isDynamicRoutesLoaded)

    if (isLogin.value) {
      if (to.path === '/login') {
        next({ path: '/' })
        return
      } else {
        if (isDynamicRoutesLoaded.value) {
          next()
          return
        }
        // 标记已调用 loadingStart()
        loadingStart()
        currentNavigationHasLoadingStart = true
        try {
          await initDynamicRoutes()
          const redirectPath = from.query.redirect || to.path
          const redirect = decodeURIComponent(redirectPath as string)
          const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect }
          permissionStore.setDynamicRoutesLoaded(true)
          next(nextData)
        } catch (error) {
          // 错误日志
          console.error('🪒 Router: 初始化动态路由失败:', error)
          // 状态重置：强制标记为未加载，防止后续重试
          permissionStore.setDynamicRoutesLoaded(false)
          // 清理 UI 状态（因为 next(false) 会跳过全局后置守卫，需要手动清理）
          doneProgress()
          updatePageTitle(to)
          loadingDone()
          // 清理所有未配对的 pageLoadingStart()（可能由于重定向导致多次调用）
          // 使用安全清理函数确保完整清理并防止无限循环
          safeClearPageLoading(layoutStore, pageLoadingDone)
          // 重置状态标记
          currentNavigationHasLoadingStart = false
          // 阻断当前导航
          next(false)
          await userStore.logout()
          router.replace('/login')
          return
        }
      }
    } else {
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
      }
    }
  })

  // 全局后置守卫
  router.afterEach((to, _from) => {
    const { loadingDone, pageLoadingDone } = useLoading()
    const { doneProgress } = useNprogress()
    const layoutStore = useLayoutStoreWithOut()

    doneProgress()
    updatePageTitle(to)

    // 处理页面加载状态：由于路由重定向可能导致多次 beforeEach 调用但只有一次 afterEach
    // 需要确保 pageLoadingCount 被正确清理
    // 使用安全清理函数确保完整清理并防止无限循环
    safeClearPageLoading(layoutStore, pageLoadingDone)

    // 精确控制：只有在 beforeEach 中调用了 loadingStart() 的情况下才调用 loadingDone()
    // 这样可以确保 loadingStart/Done 的精确配对，避免不必要的计数器操作
    let hasCalledLoadingDone = false
    if (currentNavigationHasLoadingStart) {
      loadingDone()
      hasCalledLoadingDone = true
      // 重置状态标记，为下一次导航做准备
      currentNavigationHasLoadingStart = false
    }

    // 处理初始 loading 状态：如果这是首次导航且 loadingCount > 0，说明初始 loading 还未关闭
    // 这可能是 setupPlugins 的 finally 还未执行，或者路由守卫在 setupPlugins 之前执行了
    // 为了确保初始 loading 能够关闭，这里也处理一下
    if (isFirstNavigation && layoutStore.loadingCount > 0) {
      loadingDone()
      hasCalledLoadingDone = true
      isFirstNavigation = false
    } else if (isFirstNavigation) {
      isFirstNavigation = false
    }

    // 🔥 兜底逻辑：如果 loadingCount > 0 且前面没有调用过 loadingDone()，确保关闭 loading
    // 这可以处理动态路由已加载时，但 loadingCount 仍然 > 0 的情况
    // 例如：登录后跳转时，如果动态路由已加载，不会调用 loadingStart()，但可能仍有遗留的 loading
    if (!hasCalledLoadingDone && layoutStore.loadingCount > 0) {
      loadingDone()
    }

    // 仅对 admin 布局下的路由同步标签页：addTab + updateTabActive
    const permissionStore = usePermissionStore()
    const parent = to.meta?.parent as LayoutMode | undefined
    if (parent !== 'fullscreen' && parent !== 'ratio') {
      if (to.name) {
        permissionStore.addTab(to.name as string)
        permissionStore.updateTabActive(to.name as string)
      }
    }
  })
}
