/**
 * 多语言切换的Composable函数
 *
 * v7.1 架构对齐：
 * - Store 作为唯一数据源 (SSOT)
 * - useLocale 作为 Store 的代理/快捷方式
 * - 消除状态不同步和事件重复派发问题
 *
 * v7.2 优化：
 * - 移除重复的标题更新逻辑，标题更新统一由全局 usePageTitle 实例负责
 */
import { computed } from 'vue'
import type { SupportedLocale } from '@/locales'
import { supportedLocales } from '@/locales'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/modules/locale'

export function useLocale() {
  const { t, d, n } = useI18n()
  const localeStore = useLocaleStore()

  // ✅ 直接映射 store 的 state，保持响应式一致
  const locale = computed(() => localeStore.locale)

  // ✅ 从 store 获取语言信息，保持一致性
  const currentLocale = computed(() =>
    supportedLocales.find(item => item.key === localeStore.locale)
  )

  // ✅ 基于 store 状态计算
  const isChineseLang = computed(() => localeStore.locale.startsWith('zh'))

  const isRTL = computed(() => currentLocale.value?.direction === 'rtl')

  // ✅ 直接调用 Store action，确保状态、持久化、事件派发三位一体
  const switchLocale = async (newLocale: SupportedLocale) => {
    if (localeStore.locale === newLocale) {
      return
    }
    try {
      await localeStore.switchLocale(newLocale)
      // 标题更新会由 usePageTitle 自动处理（监听 localeStore.locale）
    } catch (error) {
      console.error('Failed to switch locale:', error)
    }
  }

  // 获取翻译文本（带类型安全）
  const $t = (key: string, params?: Record<string, any>) => {
    return t(key, params || {})
  }

  // 格式化日期
  const $d = (date: Date | number, format?: string) => {
    return format ? d(date, format) : d(date)
  }

  // 格式化数字
  const $n = (number: number, format?: string) => {
    return format ? n(number, format) : n(number)
  }

  return {
    // 响应式数据
    locale,
    currentLocale,
    isChineseLang,
    isRTL,
    supportedLocales,

    // 方法
    switchLocale,
    $t,
    $d,
    $n,
  }
}
