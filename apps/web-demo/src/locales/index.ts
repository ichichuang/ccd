/// <reference lib="dom" />
/**
 * 国际化配置入口文件
 */
import enUS from '@/locales/lang/en-US'
import zhCN from '@/locales/lang/zh-CN'
import { DEFAULT_LOCALE, FALLBACK_LOCALE } from '@/constants/locale'
import type { LocaleRecord } from '@/locales/lang/utils/mergeLocale'
import type { LocaleMessageRegistry, LocaleRegistration } from '@ccd/contracts'
import {
  createI18nRuntime,
  getI18nRuntimeLocale,
  installI18nRuntime,
  setI18nRuntimeLocale,
} from '@ccd/vue-app-platform'
import { applyAppLocaleDocumentAttributes } from '@/adapters/i18n.adapter'
import type { App } from 'vue'

// 类型定义
/** 支持的语言类型 */
export type SupportedLocale = 'zh-CN' | 'en-US'

/** 语言配置信息 */
export type LocaleInfo = LocaleRegistration<SupportedLocale>
/** 语言包类型 */
export type LocaleMessages = LocaleRecord

// 支持的语言列表
export const supportedLocales: LocaleInfo[] = [
  {
    key: 'zh-CN',
    name: '简体中文',
    flag: '🇨🇳',
    direction: 'ltr',
  },
  {
    key: 'en-US',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  },
]

// 语言包映射
const messages = {
  ['zh-CN']: zhCN,
  ['en-US']: enUS,
} satisfies LocaleMessageRegistry<SupportedLocale, LocaleMessages>

// 获取默认语言（框架默认中文），从 constants 统一读取
function getDefaultLocale(): SupportedLocale {
  return DEFAULT_LOCALE
}

// 日期时间格式配置
const datetimeFormats = {
  ['zh-CN']: {
    short: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    },
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    },
    dateOnly: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeOnly: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
  },
  ['en-US']: {
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    },
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    },
    dateOnly: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    timeOnly: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  },
} as const

// 创建 i18n 实例
export const i18n = createI18nRuntime({
  // 默认语言与回退语言均从 constants 中读取，确保单一事实来源
  locale: getDefaultLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  datetimeFormats,
  globalInjection: true,
  // 开发环境下启用警告
  development: import.meta.env.VITE_APP_ENV === 'development',
})

// 安装插件
export function setupI18n(app: App) {
  installI18nRuntime(app, i18n)
}

// 获取当前语言
export function getCurrentLocale(): SupportedLocale {
  return getI18nRuntimeLocale(i18n, supportedLocales, DEFAULT_LOCALE)
}

// 设置语言
export function setLocale(locale: SupportedLocale) {
  if (messages[locale]) {
    setI18nRuntimeLocale(i18n, locale)
    applyAppLocaleDocumentAttributes(locale, supportedLocales)
    // locale-changed 由 store.switchLocale / initLocale 统一派发，此处不再重复派发
  }
}

// 获取翻译文本
export function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params || {})
}

// 格式化日期
export function d(date: Date | number, format?: string): string {
  return format ? i18n.global.d(date, format) : i18n.global.d(date)
}

// 格式化数字
export function n(number: number, format?: string): string {
  return format ? i18n.global.n(number, format) : i18n.global.n(number)
}

// 导出语言包
export { enUS } from '@/locales/lang/en-US'
export { zhCN } from '@/locales/lang/zh-CN'

// 按需导出常用国际化函数，便于使用
export { getDefaultLocale, messages }
