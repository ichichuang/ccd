import type { SupportedLocale } from '@/locales'

/**
 * 多语言相关的全局常量配置（SSOT）
 *
 * 说明：
 * - 仅通过类型导入依赖 `@/locales`，避免运行时循环依赖
 * - 运行时值以本文件为单一事实来源
 */

// 默认语言（同时作为框架启动时的初始语言）
export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN'

// 回退语言
// 当前行为为：回退到简体中文，如需改为英文请同步更新 i18n 配置与文案覆盖
export const FALLBACK_LOCALE: SupportedLocale = 'zh-CN'

// 语言到默认时区的映射（供 Store / DateUtils 等模块消费）
export const LOCALE_TO_TIMEZONE_MAP: Record<SupportedLocale, string> = {
  'zh-CN': 'Asia/Shanghai',
  'en-US': 'America/New_York',
}
