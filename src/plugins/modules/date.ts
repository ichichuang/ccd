/**
 * DateUtils 插件配置
 * 初始化日期工具并与框架语言系统集成
 */
import { DateUtils, loadTzdbSafely } from '@#/index'
import type { SupportedLocale } from '@/locales'
import { getCurrentLocale } from '@/locales'
import type { App } from 'vue'

// 框架语言到 DateUtils 语言的映射
const localeMapping: Record<SupportedLocale, import('@#/index').Locale> = {
  ['zh-CN']: 'zh-CN',
  ['en-US']: 'en-US',
  ['zh-TW']: 'zh-TW',
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

    // 加载完整时区数据（使用 public/time-zones.json 或远程兜底）
    await loadTzdbSafely()

    app.config.globalProperties.$dateUtils = DateUtils
  } catch (error) {
    console.error('❌ DateUtils 初始化失败:', error)
  }
}

// 导出类型定义
export type { DateUtils }

export default setupDateUtils
