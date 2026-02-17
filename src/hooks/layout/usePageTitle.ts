/**
 * 页面标题管理的Composable函数
 *
 * v7.2 优化：
 * - 使用 @vueuse/core 的 useTitle 实现响应式标题管理
 * - 统一监听 localeStore.locale 而非 hack 方式
 * - 提取标题计算逻辑，便于复用
 */
import { computed, watch } from 'vue'
import type { Router } from 'vue-router'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTitle } from '@vueuse/core'
import { brand } from '@/constants/brand'

/**
 * 计算路由页面标题（支持多语言）
 *
 * @param route - 路由对象
 * @param appTitle - 应用标题
 * @param t - i18n 翻译函数
 * @returns 完整的页面标题
 */
export function calculatePageTitle(
  route: any,
  appTitle: string,
  t: (key: string) => string
): string {
  // 认为“空标题”是空字符串/全空白，而非历史遗留的 '/' 判定
  const isNoAppTitle = String(appTitle ?? '').trim().length === 0
  const appendAppTitle = (base: string) => (isNoAppTitle ? base : `${base} - ${appTitle}`)

  // 优先 titleKey（多语言）
  if (route.meta?.titleKey) {
    const key = route.meta.titleKey
    const translated = t(key)
    const isMissingTranslation = translated === key
    const baseTitle = isMissingTranslation
      ? route.meta?.title || route?.name || appTitle
      : translated

    if (!baseTitle) return appTitle
    return appendAppTitle(String(baseTitle))
  }

  // 兼容仅使用 title（不翻译的极少数页面）
  if (route.meta?.title) {
    return appendAppTitle(route.meta.title)
  }

  // 兜底：尝试使用路由 name，否则回退应用标题
  const fallbackTitle = route?.name || appTitle
  if (!fallbackTitle) return appTitle
  return appendAppTitle(String(fallbackTitle))
}

export function usePageTitle(_router?: Router) {
  const route = useRoute()
  const { t } = useI18n()
  const appTitle = brand.name

  /**
   * 当前页面标题（响应式计算）
   */
  const currentPageTitle = computed(() => {
    return calculatePageTitle(route, appTitle, t)
  })

  /**
   * 使用 useTitle 管理页面标题（响应式）
   * 初始化时使用当前计算出的标题
   */
  const title = useTitle(currentPageTitle.value)

  /**
   * 手动更新页面标题（供外部调用）
   * 同时同步到 useTitle 管理的响应式标题
   */
  const updatePageTitle = () => {
    const newTitle = currentPageTitle.value
    title.value = newTitle
  }

  /**
   * 自动同步 currentPageTitle 的变化到 useTitle
   * 这样 useTitle 就能响应式地更新 document.title
   */
  watch(
    currentPageTitle,
    newTitle => {
      title.value = newTitle
    },
    { immediate: true }
  )

  return {
    // 响应式标题（由 useTitle 提供）
    title,
    // 计算后的页面标题
    currentPageTitle,
    // 手动更新方法
    updatePageTitle,
    // 标题计算函数（供外部复用）
    getRouteTitle: (route: any, appTitle?: string) =>
      calculatePageTitle(
        route,
        // 若未传入则使用 brand.name；若显式传入空字符串则按“无应用标题”处理
        appTitle === undefined ? brand.name : appTitle,
        t
      ),
  }
}
