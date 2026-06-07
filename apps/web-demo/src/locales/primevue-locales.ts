import { primevueZhCN } from './primevue-zh-CN'
import { primevueEnUS } from './primevue-en-US'
import type { PrimeVueLocaleMap } from '@ccd/contracts'
import type { SupportedLocale } from './index'

/**
 * PrimeVue locale 映射表
 * 集中管理所有支持的 PrimeVue 语言包，供插件和 App 组件引用。
 */
export const PRIMEVUE_LOCALE_MAP = {
  'zh-CN': primevueZhCN,
  'en-US': primevueEnUS,
} satisfies PrimeVueLocaleMap<SupportedLocale, typeof primevueZhCN>
