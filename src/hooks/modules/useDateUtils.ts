/**
 * DateUtils 集成 Composable
 *
 * 职责说明：
 * - 自动同步框架语言设置，提供响应式的日期/节假日/时区处理能力
 * - 仅作为 `DateUtils` 的响应式代理层，不负责初始化（初始化由 `setupDateUtils` 完成）
 *
 * 未初始化时（isInitialized === false）的统一返回约定：
 * - 字符串类 API（formatDate / fromNow / formatIntl / formatSmart / formatI18n / formatWithLocale）：
 *   返回空字符串 `''`
 * - 布尔类 API（isWorkingDay / isNonWorkingDay / isHoliday / isCountryHoliday）：
 *   返回 `false`
 * - 集合类 API（batchFormat / getHolidays / getAvailableTimezones / getTimezonesByCountry）：
 *   返回空数组 `[]`
 *   集合映射类（getSupportedHolidayCountries）：返回空对象 `{}`
 * - 对象/详情类 API（smartParse / now / nextWorkingDay / getCountryHolidays / getCountryHolidayInfo）：
 *   返回 `null`
 *
 * 如需区分“未初始化”与“真实结果”，请同时检查 `isInitialized`。
 */
import DateUtils from '@/utils/date'
import type { DateFormat, DateInput, FormatOptions, Locale } from '@/utils/date'
import type { SupportedLocale } from '@/locales'
import { useLocaleStore } from '@/stores/modules/locale'

// 使用浏览器本地时区作为默认值（不强绑语言）
const DEFAULT_TIMEZONE =
  typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC'
export function useDateUtils() {
  // 当前语言状态
  const currentLocale = ref<Locale>('zh-CN')
  const currentTimezone = ref<string>(DEFAULT_TIMEZONE)

  /**
   * 是否已完成初始化
   *
   * 约定：
   * - DateUtils 的初始化 SSOT 在 `src/plugins/modules/date.ts`（setupDateUtils）
   * - hook 只做“响应式代理 + 同步策略”，不重复 init/不重复注册全局监听器
   */
  const isInitialized = ref(false)

  const localeStore = useLocaleStore()

  // 初始化：从 store 推导初始 locale，并使用本地时区对齐 DateUtils
  // （DateUtils 若已被 setupDateUtils 初始化，这里只会做轻量同步，不重复 init）
  const initFromStore = async () => {
    const locale = localeStore.locale as Locale
    currentLocale.value = locale

    // 按“本地时区为准”，仅在初始化时同步一次
    DateUtils.setTimezone(currentTimezone.value)

    // 确保 DateUtils locale 已加载（若已加载则为 no-op）
    await DateUtils.setLocale(locale)
    isInitialized.value = true
  }

  // 初始化一次
  void initFromStore()

  // 监听 store 的语言变化（可靠的响应式源）
  watch(
    () => localeStore.locale,
    async newLocale => {
      const locale = newLocale as Locale
      currentLocale.value = locale
      // DateUtils 的 locale 同步交由 initWithFramework + mitt 驱动，这里只负责本地状态与初始化标记
      isInitialized.value = true
    }
  )

  // ===== 响应式日期处理方法 =====

  /**
   * 格式化日期 - 自动使用当前语言
   *
   * - 未初始化：返回空字符串 ''
   * - 已初始化：返回格式化后的日期字符串
   */
  const formatDate = (
    date: DateInput,
    format: DateFormat = 'YYYY-MM-DD HH:mm:ss',
    options: Omit<FormatOptions, 'locale'> = {}
  ): string => {
    if (!isInitialized.value) {
      return ''
    }
    return DateUtils.format(date, format, {
      ...options,
      locale: currentLocale.value,
    })
  }

  /**
   * 获取相对时间 - 自动使用当前语言
   *
   * - 未初始化：返回空字符串 ''
   * - 已初始化：返回人类可读的相对时间（失败时回退 'Invalid Date'）
   */
  const fromNow = (date: DateInput): string => {
    if (!isInitialized.value) {
      return ''
    }
    return DateUtils.fromNow(date, { fallback: 'Invalid Date' })
  }

  /**
   * 批量格式化日期
   *
   * - 未初始化：返回空数组 []
   * - 已初始化：返回与输入日期数组一一对应的格式化结果
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
   *
   * - 未初始化：返回 null
   * - 已初始化：返回解析结果对象（由 DateUtils 定义）或解析失败时的 null
   */
  const smartParse = (input: string) => {
    if (!isInitialized.value) {
      return null
    }
    return DateUtils.smartParse(input)
  }

  /**
   * 获取当前时间
   *
   * - 未初始化：返回 null
   * - 已初始化：返回当前时间（由 DateUtils.now() 决定具体类型）
   */
  const now = () => {
    if (!isInitialized.value) {
      return null
    }
    return DateUtils.now()
  }

  /**
   * 检查是否为工作日（考虑调休）
   *
   * - 未初始化：返回 false
   * - 已初始化：返回是否为工作日的布尔值
   */
  const isWorkingDay = (date: DateInput): boolean => {
    if (!isInitialized.value) {
      return false
    }
    return DateUtils.isWorkingDay(date)
  }

  /**
   * 检查是否为非工作日（节假日或周末，排除调休工作日）
   *
   * - 未初始化：返回 false
   */
  const isNonWorkingDay = (date: DateInput): boolean => {
    if (!isInitialized.value) {
      return false
    }
    return DateUtils.isNonWorkingDay(date)
  }

  /**
   * 检查是否为节假日
   *
   * - 未初始化：返回 false
   */
  const isHoliday = (date: DateInput): boolean => {
    if (!isInitialized.value) {
      return false
    }
    return DateUtils.isHoliday(date)
  }

  /**
   * 获取下一个工作日
   *
   * - 未初始化：返回 null
   * - 已初始化：返回下一个工作日日期
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
      return ''
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
      return ''
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
      return ''
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
      return ''
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
    DateUtils,
  }
}
