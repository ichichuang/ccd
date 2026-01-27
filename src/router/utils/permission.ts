/* 守卫 */
import { routeWhitePathList } from '@/constants/modules/router'
import { usePermissionStore } from '@/stores/modules/permission'
import { useUserStoreWithOut } from '@/stores/modules/user'
import type { Router } from 'vue-router'

export const usePermissionGuard = ({
  router,
  initDynamicRoutes,
}: {
  router: Router
  initDynamicRoutes: () => Promise<any>
}) => {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const { loadingStart, pageLoadingStart, loadingDone, pageLoadingDone } = useLoading()
    const { startProgress, doneProgress } = useNprogress()
    const { updatePageTitle } = usePageTitle()
    startProgress()
    updatePageTitle()
    pageLoadingStart()
    const whiteList = routeWhitePathList
    const permissionStore = usePermissionStore()
    const userStore = useUserStoreWithOut()
    const isLogin = computed(() => userStore.isLogin)
    const isDynamicRoutesLoaded = computed(() => permissionStore.isDynamicRoutesLoaded)

    if (isLogin.value) {
      if (to.path === '/login') {
        // loadingDone()
        next({ path: '/' })
      } else {
        if (isDynamicRoutesLoaded.value) {
          // loadingDone()
          next()
          return
        }
        loadingStart()
        try {
          await initDynamicRoutes()
          // loadingDone()
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
          updatePageTitle()
          loadingDone()
          pageLoadingDone()
          // 阻断当前导航
          next(false)
          // 核心修复：清除登录状态并刷新页面，彻底打破循环
          await userStore.logout()
        }
      }
    } else {
      if (whiteList.includes(to.path)) {
        // loadingDone()
        next()
      } else {
        // loadingDone()
        next(`/login?redirect=${to.path}`)
      }
    }
  })

  // 全局后置守卫
  router.afterEach((_to, _from) => {
    const { loadingDone, pageLoadingDone } = useLoading()
    const { doneProgress } = useNprogress()
    const { updatePageTitle } = usePageTitle()
    doneProgress()
    updatePageTitle()
    loadingDone()
    pageLoadingDone()
  })
}
