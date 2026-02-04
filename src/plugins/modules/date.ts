/**
 * DateUtils 插件配置
 * 初始化日期工具并与框架语言系统集成
 */
import DateUtils, { type Locale } from '@/utils/date'
import type { SupportedLocale } from '@/locales'
import { getCurrentLocale } from '@/locales'
// 框架语言到 DateUtils 语言的映射
const localeMapping: Record<SupportedLocale, Locale> = {
  ['zh-CN']: 'zh-CN',
  ['en-US']: 'en-US',
}

/**
 * 设置 DateUtils 插件
 * @param app Vue 应用实例
 */
export const setupDateUtils = async (app: App) => {
  try {
    // 获取当前框架语言
    const currentFrameworkLocale = getCurrentLocale()
    const dateUtilsLocale = localeMapping[currentFrameworkLocale]

    // 初始化 DateUtils 并设置语言
    await DateUtils.initWithFramework(dateUtilsLocale)

    app.config.globalProperties.$dateUtils = DateUtils
  } catch (error) {
    console.error('❌ DateUtils 初始化失败:', error)
  }
}

export default setupDateUtils
