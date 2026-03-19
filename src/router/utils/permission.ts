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
  // 竞态保护：缓存进行中的路由初始化 Promise，防止并发导航触发多次 API 请求
  let routeInitializingPromise: Promise<void> | null = null

  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const { loadingStart, pageLoadingStart } = useLoading()
    const { startProgress } = useNprogress()

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
    // 直接读取 store 属性（beforeEach 入口为同步上下文，无需 computed 包装）
    const isLogin = userStore.isLogin
    const isDynamicRoutesLoaded = permissionStore.isDynamicRoutesLoaded

    if (isLogin) {
      if (to.path === '/login') {
        next({ path: '/' })
        return
      } else {
        if (isDynamicRoutesLoaded) {
          const routeRoles = to.meta?.roles as string[] | undefined
          if (routeRoles && routeRoles.length > 0) {
            const hasRole = routeRoles.some(r => userStore.userInfo.roles.includes(r))
            if (!hasRole) {
              next('/403')
              return
            }
          }
          next()
          return
        }
        try {
          // 竞态保护：多次并发导航共享同一个初始化 Promise，防止重复发起 API 请求
          routeInitializingPromise ??= initDynamicRoutes().finally(() => {
            routeInitializingPromise = null
          })
          await routeInitializingPromise

          const rawRedirect = (from.query.redirect as string | undefined) || to.fullPath
          const targetRedirect = decodeURIComponent(rawRedirect)

          permissionStore.setDynamicRoutesLoaded(true)

          const toParent = to.meta?.parent as LayoutMode | undefined
          const fromParent = from.meta?.parent as LayoutMode | undefined

          // 专门识别“登录页(fullscreen) → 后台(admin/ratio)”的场景：
          // 这类跳转用户已经明确触发了登录，不再叠加全屏遮罩，只保留 pageLoading 即可。
          const isLoginToNonFullscreen =
            from.path === '/login' && fromParent === 'fullscreen' && toParent !== 'fullscreen'

          const shouldShowGlobalLoading = !isLoginToNonFullscreen && toParent !== 'fullscreen'
          if (shouldShowGlobalLoading) {
            // 标记已调用 loadingStart()
            loadingStart()
          }

          // 避免多跳：如果是从登录页跳转，且目标一致，直接放行
          if (
            from.path === '/login' &&
            (to.fullPath === targetRedirect || to.path === targetRedirect)
          ) {
            next()
            return
          }

          // 其他场景（如 F5 刷新）：中断当前导航，重定向到完整目标路径
          next({ path: targetRedirect, replace: true })
          return
        } catch (error) {
          console.error('动态路由初始化失败', error)
          next('/login')
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

    // 绝对防御：确保无论经历多少次内部重定向，最终到达时清空所有残留的 Loading 计数
    while (layoutStore.loadingCount > 0) {
      loadingDone()
    }
    while (layoutStore.pageLoadingCount > 0) {
      pageLoadingDone()
    }

    doneProgress()
    updatePageTitle(to)

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

  // 路由错误兜底：确保全局 / 页面 loading 计数不会泄漏（如导航被中断、解析失败等）
  router.onError(error => {
    const { loadingDone, pageLoadingDone } = useLoading()
    const layoutStore = useLayoutStoreWithOut()

    // 兜底清理页面级 loading（重复调用由计数保护）
    safeClearPageLoading(layoutStore, pageLoadingDone)

    // 兜底清理全局 loading：将剩余计数全部归零
    while (layoutStore.loadingCount > 0) {
      loadingDone()
    }

    // 记录错误，方便排查
    console.error('🪒 Router: navigation error', error)
  })
}
