/**
 * 页面标题管理的Composable函数
 */
import type { Router } from 'vue-router'
import { useRoute } from 'vue-router'

export function usePageTitle(_router?: Router) {
  const route = useRoute()
  const env = import.meta.env
  const appTitle = env.VITE_APP_TITLE

  /**
   * 获取路由页面标题（支持多语言）
   */
  const getRouteTitle = (route: any, appTitle: string): string => {
    const isNoAppTitle = String(appTitle).trim() === '/'
    if (route.meta?.titleKey) {
      // 使用 titleKey 获取多语言标题
      return isNoAppTitle
        ? `${$t(route.meta.titleKey)}`
        : `${$t(route.meta.titleKey)} - ${appTitle}`
    } else if (route.meta?.title) {
      // 兼容直接设置 title 的情况
      return isNoAppTitle ? `${route.meta.title}` : `${route.meta.title} - ${appTitle}`
    }
    return appTitle
  }

  /**
   * 当前页面标题
   */
  const currentPageTitle = computed(() => {
    return getRouteTitle(route, appTitle)
  })

  /**
   * 更新页面标题
   */
  const updatePageTitle = () => {
    document.title = currentPageTitle.value
  }

  /**
   * 监听路由变化，更新标题
   */
  watch(
    () => route.path,
    () => {
      updatePageTitle()
    },
    { immediate: true }
  )

  /**
   * 监听语言变化，更新标题
   */
  watch(
    () => $t('router.dashboard.dashboard'), // 监听任意翻译键的变化
    () => {
      updatePageTitle()
    }
  )

  /**
   * 监听应用标题变化
   */
  watch(
    () => env.VITE_APP_TITLE,
    () => {
      updatePageTitle()
    }
  )

  return {
    currentPageTitle,
    updatePageTitle,
    getRouteTitle,
  }
}
