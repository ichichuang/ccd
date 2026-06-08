/**
 * 页面标题管理的Composable函数
 *
 * v7.2 优化：
 * - 使用 @vueuse/core 的 useTitle 实现响应式标题管理
 * - 统一监听 localeStore.locale 而非 hack 方式
 * - 提取标题计算逻辑，便于复用
 */
import type { Ref } from 'vue'
import type {
  RouteLocationGeneric,
  RouteLocationNormalized,
  RouteLocationNormalizedLoaded,
  Router,
} from 'vue-router'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTitle } from '@vueuse/core'
import { brand } from '@/constants/brand'
import { appRouteNames, appRoutePaths } from '@/constants/router'

const APP_TITLE = brand.displayName
const INTERNAL_TITLE_VALUES = new Set(['CatchAll', 'NotFound', 'Redirect', 'Layout', 'LayoutAdmin'])
const TITLE_SLUG_PATTERN = /^[a-z0-9]+(?:[-_/][a-z0-9]+)+$/i

interface RouteTitleDeferralOptions {
  isAppReady?: boolean
  hasKnownRedirectedFromRoute?: boolean
}

function normalizeTitlePart(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  return String(value).trim().replace(/\s+/g, ' ')
}

function normalizeAppTitle(value: unknown): string {
  const title = normalizeTitlePart(value)
  if (!title || title.toLowerCase() === brand.name.toLowerCase()) return APP_TITLE
  return title
}

function isInternalTitleValue(title: string): boolean {
  if (!title) return true
  if (INTERNAL_TITLE_VALUES.has(title)) return true
  if (title.toLowerCase() === brand.name.toLowerCase()) return true
  if (TITLE_SLUG_PATTERN.test(title)) return true
  return false
}

export function formatPageTitle(pageTitle: unknown, appTitle: string = APP_TITLE): string {
  const cleanAppTitle = normalizeAppTitle(appTitle)
  const cleanPageTitle = normalizeTitlePart(pageTitle)

  if (isInternalTitleValue(cleanPageTitle)) return cleanAppTitle
  if (!cleanAppTitle || cleanPageTitle === cleanAppTitle) return cleanPageTitle
  return `${cleanPageTitle} - ${cleanAppTitle}`
}

/**
 * 计算路由页面标题（支持多语言）
 *
 * @param route - 路由对象
 * @param appTitle - 应用标题
 * @param t - i18n 翻译函数
 * @returns 完整的页面标题
 */
export function shouldDeferRouteTitle(
  route: RouteLocationNormalized,
  isDynamicRoutesLoaded: boolean,
  options: RouteTitleDeferralOptions = {}
): boolean {
  if (route.path !== appRoutePaths.notFound) return false
  if (!isDynamicRoutesLoaded) return true

  const redirectedFrom = route.redirectedFrom
  if (!redirectedFrom || redirectedFrom.path === appRoutePaths.notFound) return false

  return options.isAppReady === false && options.hasKnownRedirectedFromRoute === true
}

function isCatchAllTitleSource(route: RouteLocationGeneric | RouteLocationNormalized): boolean {
  if (String(route.name ?? '') === appRouteNames.catchAll) return true
  if (route.path === appRoutePaths.catchAll) return true
  return route.meta?.titleKey === 'router.error.notFound'
}

export function getDeferredRouteTitleSource(
  route: RouteLocationNormalized
): RouteLocationGeneric | RouteLocationNormalized | undefined {
  if (route.path !== appRoutePaths.notFound) return undefined
  const redirectedFrom = route.redirectedFrom
  if (!redirectedFrom || redirectedFrom.path === appRoutePaths.notFound) return undefined
  if (isCatchAllTitleSource(redirectedFrom)) return undefined
  return redirectedFrom
}

export function calculatePageTitle(
  route: RouteLocationGeneric | RouteLocationNormalizedLoaded | RouteLocationNormalized,
  appTitle: string,
  t: (key: string) => string
): string {
  const cleanAppTitle = normalizeAppTitle(appTitle)

  // 优先 titleKey（多语言）
  if (route.meta?.titleKey) {
    const key = route.meta.titleKey
    const translated = t(key)
    const isMissingTranslation = translated === key
    const baseTitle = isMissingTranslation ? route.meta?.title : translated

    return formatPageTitle(baseTitle, cleanAppTitle)
  }

  // 兼容仅使用 title（不翻译的极少数页面）
  if (route.meta?.title) {
    return formatPageTitle(route.meta.title, cleanAppTitle)
  }

  return cleanAppTitle
}

export interface UsePageTitleReturn {
  title: Ref<string>
  currentPageTitle: Ref<string>
  updatePageTitle: () => void
  getRouteTitle: (
    route: RouteLocationGeneric | RouteLocationNormalizedLoaded | RouteLocationNormalized,
    appTitle?: string
  ) => string
}

export function usePageTitle(_router?: Router): UsePageTitleReturn {
  const route = useRoute()
  const { t } = useI18n()
  const appTitle = brand.displayName

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
  const managedTitle = useTitle(currentPageTitle.value)
  const title = computed<string>({
    get: () => managedTitle.value ?? '',
    set: value => {
      managedTitle.value = value
    },
  })

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
    getRouteTitle: (
      route: RouteLocationGeneric | RouteLocationNormalizedLoaded | RouteLocationNormalized,
      appTitle?: string
    ) =>
      calculatePageTitle(
        route,
        // 若未传入则使用 brand.name；若显式传入空字符串则按“无应用标题”处理
        appTitle === undefined ? brand.displayName : appTitle,
        t
      ),
  }
}
