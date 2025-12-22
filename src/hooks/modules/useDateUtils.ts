/**
 * DateUtils 集成 Composable
 * 自动同步框架语言设置，提供响应式的日期处理功能
 * 支持时区管理和 Intl API 集成
 */
import {
  DateUtils,
  type DateFormat,
  type DateInput,
  type FormatOptions,
  type Locale,
} from '@#/index'
import type { SupportedLocale } from '@/locales'
import { getCurrentLocale } from '@/locales'
import { onMounted, onUnmounted, readonly, ref, watch } from 'vue'

export function useDateUtils() {
  // 当前语言状态
  const currentLocale = ref<Locale>('zh-CN')
  const currentTimezone = ref<string>('Asia/Shanghai')
  const isInitialized = ref(false)

  // 移除监听器的函数
  let removeLocaleListener: (() => void) | null = null
  let removeTimezoneListener: (() => void) | null = null

  /**
   * 初始化 DateUtils
   */
  const initDateUtils = async () => {
    try {
      // 获取框架当前语言
      const frameworkLocale = getCurrentLocale() as Locale

      // 初始化 DateUtils 并设置语言
      await DateUtils.initWithFramework(frameworkLocale)
      currentLocale.value = frameworkLocale

      // 设置默认时区
      DateUtils.setTimezone(currentTimezone.value)

      // 添加语言切换监听
      removeLocaleListener = DateUtils.onLocaleChange((locale: Locale) => {
        currentLocale.value = locale
      })

      // 添加时区切换监听
      removeTimezoneListener = DateUtils.onTimezoneChange((timezone: string) => {
        currentTimezone.value = timezone
      })

      isInitialized.value = true
      console
        .log
        // `🗓️ DateUtils 已初始化，当前语言: ${frameworkLocale}，当前时区: ${currentTimezone.value}`
        ()
    } catch (error) {
      console.error('Failed to initialize DateUtils:', error)
    }
  }

  // 监听框架语言变化
  watch(
    () => getCurrentLocale(),
    async newLocale => {
      if (isInitialized.value && newLocale !== currentLocale.value) {
        try {
          await DateUtils.setLocale(newLocale as Locale)
          currentLocale.value = newLocale as Locale
        } catch (error) {
          console.warn('Failed to sync DateUtils locale:', error)
        }
      }
    }
  )

  // 生命周期管理
  onMounted(() => {
    initDateUtils()
  })

  onUnmounted(() => {
    if (removeLocaleListener) {
      removeLocaleListener()
      removeLocaleListener = null
    }
    if (removeTimezoneListener) {
      removeTimezoneListener()
      removeTimezoneListener = null
    }
  })

  // ===== 响应式日期处理方法 =====

  /**
   * 格式化日期 - 自动使用当前语言
   */
  const formatDate = (
    date: DateInput,
    format: DateFormat = 'YYYY-MM-DD HH:mm:ss',
    options: Omit<FormatOptions, 'locale'> = {}
  ): string => {
    if (!isInitialized.value) {
      return 'Loading...'
    }
    return DateUtils.format(date, format, {
      ...options,
      locale: currentLocale.value,
    })
  }

  /**
   * 获取相对时间 - 自动使用当前语言
   */
  const fromNow = (date: DateInput): string => {
    if (!isInitialized.value) {
      return 'Loading...'
    }
    return DateUtils.fromNow(date, { fallback: 'Invalid Date' })
  }

  /**
   * 批量格式化日期
   */
  const batchFormat = (
    dates: DateInput[],
    format: DateFormat = 'YYYY-MM-DD HH:mm:ss',
    options?: Parameters<typeof DateUtils.batchFormat>[2]
  ) => {
    if (!isInitialized.value) {
      return []
    }
    return DateUtils.batchFormat(dates, format, options)
  }

  /**
   * 智能解析日期
   */
  const smartParse = (input: string) => {
    if (!isInitialized.value) {
      return null
    }
    return DateUtils.smartParse(input)
  }

  /**
   * 获取当前时间
   */
  const now = () => {
    if (!isInitialized.value) {
      return null
    }
    return DateUtils.now()
  }

  /**
   * 检查是否为工作日（考虑调休）
   */
  const isWorkingDay = (date: DateInput): boolean => {
    if (!isInitialized.value) {
      return false
    }
    return DateUtils.isWorkingDay(date)
  }

  /**
   * 检查是否为非工作日（节假日或周末，排除调休工作日）
   */
  const isNonWorkingDay = (date: DateInput): boolean => {
    if (!isInitialized.value) {
      return false
    }
    return DateUtils.isNonWorkingDay(date)
  }

  /**
   * 检查是否为节假日
   */
  const isHoliday = (date: DateInput): boolean => {
    if (!isInitialized.value) {
      return false
    }
    return DateUtils.isHoliday(date)
  }

  /**
   * 获取下一个工作日
   */
  const nextWorkingDay = (date: DateInput) => {
    if (!isInitialized.value) {
      return null
    }
    return DateUtils.nextWorkingDay(date)
  }

  /**
   * 使用 Intl API 格式化日期 - 更接近系统本地化
   */
  const formatIntl = (date: DateInput, options: Intl.DateTimeFormatOptions = {}): string => {
    if (!isInitialized.value) {
      return 'Loading...'
    }
    return DateUtils.formatIntl(date, currentLocale.value, currentTimezone.value, options)
  }

  /**
   * 智能格式化：优先使用 Intl API，回退到 dayjs
   */
  const formatSmart = (
    date: DateInput,
    formatStyle: 'system' | 'dayjs' | 'auto' = 'auto',
    options: { intlOptions?: Intl.DateTimeFormatOptions } = {}
  ): string => {
    if (!isInitialized.value) {
      return 'Loading...'
    }
    return DateUtils.formatSmart(date, formatStyle, {
      locale: currentLocale.value,
      timezone: currentTimezone.value,
      ...options,
    })
  }

  /**
   * 使用 vue-i18n 的 datetimeFormats 格式化日期
   */
  const formatI18n = (
    date: DateInput,
    formatKey: 'short' | 'long' | 'datetime' | 'time' | 'dateOnly' | 'timeOnly' = 'datetime'
  ): string => {
    if (!isInitialized.value) {
      return 'Loading...'
    }
    return DateUtils.formatI18n(date, formatKey, currentLocale.value, currentTimezone.value)
  }

  // ===== 语言相关的预设格式 =====

  /**
   * 根据当前语言获取本地化格式
   */
  const getLocalizedFormats = () => {
    const locale = currentLocale.value
    switch (locale) {
      case 'zh-CN':
        return {
          date: 'YYYY年MM月DD日',
          datetime: 'YYYY年MM月DD日 HH:mm:ss',
          time: 'HH:mm:ss',
          shortDate: 'MM-DD',
          longDate: 'YYYY年MM月DD日 dddd',
        }
      case 'zh-TW':
        return {
          date: 'YYYY年MM月DD日',
          datetime: 'YYYY年MM月DD日 HH:mm:ss',
          time: 'HH:mm:ss',
          shortDate: 'MM-DD',
          longDate: 'YYYY年MM月DD日 dddd',
        }
      case 'en-US':
      default:
        return {
          date: 'YYYY-MM-DD',
          datetime: 'YYYY-MM-DD HH:mm:ss',
          time: 'HH:mm:ss',
          shortDate: 'MM/DD',
          longDate: 'dddd, MMMM D, YYYY',
        }
    }
  }

  /**
   * 使用本地化格式格式化日期
   */
  const formatWithLocale = (
    date: DateInput,
    formatType: 'date' | 'datetime' | 'time' | 'shortDate' | 'longDate' = 'datetime'
  ): string => {
    if (!isInitialized.value) {
      return 'Loading...'
    }
    const formats = getLocalizedFormats()
    return DateUtils.format(date, formats[formatType])
  }

  // ===== 工具方法 =====

  /**
   * 手动设置语言（通常不需要，会自动同步框架语言）
   */
  const setLocale = async (locale: Locale) => {
    try {
      await DateUtils.setLocale(locale)
      currentLocale.value = locale
    } catch (error) {
      console.error('Failed to set DateUtils locale:', error)
    }
  }

  /**
   * 设置时区
   */
  const setTimezone = (timezone: string) => {
    try {
      DateUtils.setTimezone(timezone)
      currentTimezone.value = timezone
    } catch (error) {
      console.error('Failed to set DateUtils timezone:', error)
    }
  }

  /**
   * 导入预设节假日
   */
  const importHolidays = (year: number, country: 'CN' | 'US' | 'INTL' = 'CN') => {
    try {
      DateUtils.importPresetHolidays(year, country)
      console.log(`🎉 已导入${year}年${country}节假日配置`)
    } catch (error) {
      console.error('Failed to import holidays:', error)
    }
  }

  /**
   * 获取指定年份的节假日
   */
  const getHolidays = (year: number) => {
    if (!isInitialized.value) {
      return []
    }
    return DateUtils.getHolidays(year)
  }

  /**
   * 获取所有可用时区
   */
  const getAvailableTimezones = (groupByContinent: boolean = false) => {
    if (!isInitialized.value) {
      return groupByContinent ? {} : []
    }
    return DateUtils.getAvailableTimezones(groupByContinent)
  }

  /**
   * 获取特定国家可用的时区
   */
  const getTimezonesByCountry = (countryCode: string) => {
    if (!isInitialized.value) {
      return []
    }
    return DateUtils.getTimezonesByCountry(countryCode)
  }

  /**
   * 获取国家节假日
   */
  const getCountryHolidays = (
    countryCode: string,
    year: number,
    importToDateUtils: boolean = false
  ) => {
    if (!isInitialized.value) {
      return null
    }
    return DateUtils.getCountryHolidays(countryCode, year, importToDateUtils)
  }

  /**
   * 检查特定日期是否为指定国家的节假日
   */
  const isCountryHoliday = (date: DateInput, countryCode: string = 'CN') => {
    if (!isInitialized.value) {
      return false
    }
    return DateUtils.isCountryHoliday(date, countryCode)
  }

  /**
   * 获取特定日期的节假日详情
   */
  const getCountryHolidayInfo = (date: DateInput, countryCode: string = 'CN') => {
    if (!isInitialized.value) {
      return null
    }
    return DateUtils.getCountryHolidayInfo(date, countryCode)
  }

  /**
   * 获取支持的节假日国家列表
   */
  const getSupportedHolidayCountries = () => {
    if (!isInitialized.value) {
      return {}
    }
    return DateUtils.getSupportedCountries()
  }

  /**
   * 获取支持的语言格式映射
   */
  const getSupportedLocales = () => {
    const mapping: Record<SupportedLocale, Locale> = {
      ['zh-CN']: 'zh-CN',
      ['en-US']: 'en-US',
      ['zh-TW']: 'zh-TW',
    }
    return mapping
  }

  return {
    // 状态
    currentLocale: readonly(currentLocale),
    currentTimezone: readonly(currentTimezone),
    isInitialized: readonly(isInitialized),

    // 格式化方法
    formatDate,
    formatWithLocale,
    formatIntl,
    formatSmart,
    formatI18n,
    fromNow,
    batchFormat,
    smartParse,
    now,

    // 工作日相关
    isWorkingDay,
    isNonWorkingDay,
    isHoliday,
    nextWorkingDay,

    // 格式配置
    getLocalizedFormats,
    getSupportedLocales,

    // 工具方法
    setLocale,
    setTimezone,
    importHolidays,
    getHolidays,
    getAvailableTimezones,
    getTimezonesByCountry,
    getCountryHolidays,
    isCountryHoliday,
    getCountryHolidayInfo,
    getSupportedHolidayCountries,

    // 直接访问 DateUtils 的所有静态方法
    ['DateUtils']: DateUtils,
  }
}

export default useDateUtils
