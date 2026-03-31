import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear.js'
import duration from 'dayjs/plugin/duration.js'
import isBetween from 'dayjs/plugin/isBetween.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'
import quarterOfYear from 'dayjs/plugin/quarterOfYear.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import weekday from 'dayjs/plugin/weekday.js'
import weekOfYear from 'dayjs/plugin/weekOfYear.js'
import { useMitt } from '@/utils/mitt'
import { ALL_TIMEZONES } from './timezone'
import {
  CACHE_DEFAULTS,
  DATE_FORMATS,
  type DateFormatValues,
  DAYJS_LOCALE_MAP,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
  LOCALE_MAP,
  LOCALE_MODULES,
  PRECISION_FORMATS,
  TIMESTAMP_THRESHOLD,
} from './constants'
import type {
  BatchProcessOptions,
  CacheOptions,
  DateFormat,
  DateInput,
  DateProcessor,
  DayjsManipulateType,
  DayjsOpUnitType,
  FormatOptions,
  Locale,
  ParseOptions,
  SmartParseResult,
  TimestampFormatOptions,
  TimestampInput,
  TimestampPrecision,
  TimePeriodAnalysis,
  ValidationResult,
} from './types'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(isBetween)
dayjs.extend(weekday)
dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)
dayjs.extend(quarterOfYear)
dayjs.extend(dayOfYear)
dayjs.locale('en')

let timezoneState = DEFAULT_TIMEZONE

export class DateUtils {
  // ===== 私有静态属性 =====
  // 缓存已加载的语言包
  private static loadedLocales = new Set<Locale>(['en-US'])

  // 性能缓存
  private static cache = new Map<string, { value: unknown; timestamp: number }>()
  private static readonly cacheTtl = CACHE_DEFAULTS.ttl

  // 语言切换监听器
  private static localeChangeListeners = new Set<(locale: Locale) => void>()

  // 时区切换监听器
  private static timezoneChangeListeners = new Set<(timezone: string) => void>()

  // 是否已初始化框架集成
  private static frameworkIntegrated = false

  // ===== 私有静态方法 =====
  /**
   * 动态加载语言包
   * @param locale - 语言环境
   * @returns Promise<void>
   */
  private static async loadLocale(locale: Locale): Promise<void> {
    if (this.loadedLocales.has(locale)) {
      return
    }

    try {
      const moduleKey = LOCALE_MAP[locale]
      await LOCALE_MODULES[moduleKey]()
      this.loadedLocales.add(locale)
    } catch (error) {
      console.warn(`Failed to load locale: ${locale}`, error)
      // 优化：加载失败时不抛出异常，记录警告后继续
    }
  }

  /**
   * 初始化框架集成
   * @private
   */
  private static initFrameworkIntegration(): void {
    if (this.frameworkIntegrated) {
      return
    }

    // v7.0：通过 mitt 统一监听框架语言与时区事件
    const emitter = useMitt()

    emitter.on('localeChange', locale => {
      if (locale) {
        this.syncWithFrameworkLocale(locale as Locale)
      }
    })

    emitter.on('timezoneChange', timezoneCode => {
      if (timezoneCode) {
        this.syncWithFrameworkTimezone(timezoneCode)
      }
    })

    this.frameworkIntegrated = true
  }

  /**
   * 与框架语言同步
   * @param frameworkLocale - 框架语言代码
   * @private
   */
  private static async syncWithFrameworkLocale(frameworkLocale: Locale): Promise<void> {
    try {
      await this.setLocale(frameworkLocale)

      // 通知所有监听器
      this.localeChangeListeners.forEach(listener => {
        try {
          listener(frameworkLocale)
        } catch (error) {
          console.warn('DateUtils locale change listener error:', error)
        }
      })
    } catch (error) {
      console.warn('Failed to sync with framework locale:', error)
    }
  }

  /**
   * 与框架时区同步
   * @param frameworkTimezone - 框架时区代码
   * @private
   */
  private static syncWithFrameworkTimezone(frameworkTimezone: string): void {
    try {
      this.setTimezone(frameworkTimezone)

      // 通知所有监听器
      this.timezoneChangeListeners.forEach(listener => {
        try {
          listener(frameworkTimezone)
        } catch (error) {
          console.warn('DateUtils timezone change listener error:', error)
        }
      })
    } catch (error) {
      console.warn('Failed to sync with framework timezone:', error)
    }
  }

  /**
   * 获取当前 dayjs 应该使用的语言代码
   * @param locale - 框架语言代码
   * @returns dayjs 语言代码
   * @private
   */
  private static getDayjsLocaleCode(locale: Locale): string {
    return DAYJS_LOCALE_MAP[locale] || 'en'
  }

  /**
   * 智能识别时间戳类型
   * @param timestamp - 时间戳
   * @returns 标准化后的毫秒时间戳
   */
  private static normalizeTimestamp(timestamp: TimestampInput): number {
    return Math.abs(timestamp) < TIMESTAMP_THRESHOLD ? timestamp * 1000 : timestamp
  }

  /**
   * 通用的语言环境执行函数
   * @param locale - 语言环境
   * @param fn - 执行函数
   * @returns Promise<T>
   */
  private static async withLocale<T>(locale: Locale, fn: () => T): Promise<T> {
    await this.loadLocale(locale)
    const currentLocale = dayjs.locale()

    try {
      dayjs.locale(locale)
      return fn()
    } finally {
      dayjs.locale(currentLocale)
    }
  }

  /**
   * 根据精度级别截断或四舍五入时间
   * @param date - dayjs 对象
   * @param precision - 精度级别
   * @param truncate - 是否截断
   * @returns dayjs.Dayjs
   */
  private static truncateByPrecision(
    date: dayjs.Dayjs,
    precision: TimestampPrecision,
    truncate: boolean = false
  ): dayjs.Dayjs {
    if (truncate) {
      // 截断到指定精度（归零后面的部分）
      switch (precision) {
        case 'year':
          return date.startOf('year')
        case 'month':
          return date.startOf('month')
        case 'date':
          return date.startOf('day')
        case 'hour':
          return date.startOf('hour')
        case 'minute':
          return date.startOf('minute')
        case 'second':
          return date.startOf('second')
        case 'millisecond':
          return date
        default:
          return date
      }
    }
    return date
  }

  /**
   * 验证日期输入
   * @param date - 日期输入
   * @param methodName - 方法名（用于错误提示）
   * @returns dayjs.Dayjs
   * @throws Error 当日期无效时
   */
  private static validateDateInput(date: DateInput, methodName: string = 'unknown'): dayjs.Dayjs {
    const parsed = dayjs(date)
    if (!parsed.isValid()) {
      throw new Error(`[${methodName}] Invalid date input: ${date}`)
    }
    return parsed
  }

  /**
   * 清理过期缓存
   * @private
   */
  private static cleanExpiredCache(): void {
    const now = Date.now()
    for (const [key, { timestamp }] of this.cache.entries()) {
      if (now - timestamp > this.cacheTtl) {
        this.cache.delete(key)
      }
    }
  }

  // ===== 公共静态方法 =====

  /**
   * 设置语言环境
   * @param locale - 语言环境
   * @returns Promise<void>
   */
  static async setLocale(locale: Locale): Promise<void> {
    await this.loadLocale(locale)
    const dayjsLocale = this.getDayjsLocaleCode(locale)
    dayjs.locale(dayjsLocale)
  }

  /**
   * 核心格式器：集中处理 locale / timezone / i18n / Intl / dayjs 的统一格式化逻辑
   * 单一职责：任何对日期的格式化最终都应走到此函数
   */
  private static coreFormat(
    date: DateInput,
    params: {
      mode?: 'i18n' | 'intl' | 'dayjs' | 'auto'
      format?: DateFormatValues | DateFormat
      formatKey?: 'short' | 'long' | 'datetime' | 'time' | 'dateOnly' | 'timeOnly'
      locale?: Locale
      timezone?: string
      intlOptions?: Intl.DateTimeFormatOptions
      fallback?: string
    } = {}
  ): string {
    const {
      mode = 'auto',
      format = DATE_FORMATS.datetime,
      formatKey = 'datetime',
      locale = DEFAULT_LOCALE,
      timezone = timezoneState,
      intlOptions,
      fallback = 'Invalid Date',
    } = params

    try {
      const d = this.validateDateInput(date, 'coreFormat')

      // 尝试 i18n
      if (mode === 'i18n' || mode === 'auto') {
        if (typeof window !== 'undefined' && window.$i18n) {
          try {
            const i18n = window.$i18n
            return i18n.d(d.toDate(), formatKey, locale)
          } catch (_error) {
            // ignore i18n fallback failure
          }
        }
        if (mode === 'i18n') {
          // i18n 专用回退到 Intl
          const formatOptions = this.getI18nFormatOptions(formatKey, locale)
          return new Intl.DateTimeFormat(locale, { timeZone: timezone, ...formatOptions }).format(
            d.toDate()
          )
        }
      }

      // 尝试 Intl
      if (mode === 'intl' || mode === 'auto') {
        try {
          return new Intl.DateTimeFormat(locale, { timeZone: timezone, ...intlOptions }).format(
            d.toDate()
          )
        } catch (_error) {
          // ignore, will fallback to dayjs
        }
      }

      // 回退 dayjs
      let day = d
      if (timezone) {
        day = day.tz(timezone)
      }

      if (locale) {
        const currentDayjsLocale = dayjs.locale()
        const targetDayjsLocale = this.getDayjsLocaleCode(locale)
        try {
          dayjs.locale(targetDayjsLocale)
          return day.format(format)
        } finally {
          dayjs.locale(currentDayjsLocale)
        }
      }
      return day.format(format)
    } catch (error) {
      console.error('DateUtils.coreFormat error:', error)
      return fallback
    }
  }

  /**
   * 同步设置语言环境（需要预先导入语言包）
   * @param locale - 语言环境
   * @returns void
   */
  static setLocaleSync(locale: Locale): void {
    if (!this.loadedLocales.has(locale)) {
      console.warn(`Locale ${locale} not loaded. Use setLocale() to load it first.`)
    }
    const dayjsLocale = this.getDayjsLocaleCode(locale)
    dayjs.locale(dayjsLocale)
  }

  /**
   * 获取当前语言环境
   * @returns 当前语言环境标识
   */
  static getLocale(): string {
    return dayjs.locale()
  }

  /**
   * 获取当前框架语言环境
   * @returns 当前框架语言环境标识
   */
  static getCurrentLocale(): Locale {
    return dayjs.locale() as Locale
  }

  /**
   * 初始化并与框架集成
   * @param initialLocale - 初始语言环境（可选）
   * @returns Promise<void>
   */
  static async initWithFramework(initialLocale?: Locale): Promise<void> {
    // 初始化框架集成（注册 mitt 监听）
    this.initFrameworkIntegration()

    // 设置初始语言
    if (initialLocale) {
      await this.setLocale(initialLocale)
    }
  }

  /**
   * 添加语言切换监听器
   * @param listener - 监听器函数
   * @returns 移除监听器的函数
   */
  static onLocaleChange(listener: (locale: Locale) => void): () => void {
    this.localeChangeListeners.add(listener)
    return () => {
      this.localeChangeListeners.delete(listener)
    }
  }

  /**
   * 添加时区切换监听器
   * @param listener - 监听器函数
   * @returns 移除监听器的函数
   */
  static onTimezoneChange(listener: (timezone: string) => void): () => void {
    this.timezoneChangeListeners.add(listener)
    return () => {
      this.timezoneChangeListeners.delete(listener)
    }
  }

  /**
   * 设置时区
   * @param timezone - 时区代码
   */
  static setTimezone(timezone: string): void {
    timezoneState = timezone
  }

  /**
   * 获取当前时区
   * @returns 当前时区代码
   */
  static getCurrentTimezone(): string {
    return timezoneState
  }

  /**
   * 获取所有可用时区列表
   * @param groupByContinent - 是否按洲分组
   * @returns 时区列表或分组后的时区对象
   */
  static getAvailableTimezones(
    groupByContinent: boolean = false
  ): typeof ALL_TIMEZONES | Record<string, typeof ALL_TIMEZONES> {
    if (groupByContinent) {
      return ALL_TIMEZONES.reduce((acc: Record<string, typeof ALL_TIMEZONES>, zone) => {
        const continent = zone.name.split('/')[0]
        if (!acc[continent]) {
          acc[continent] = []
        }
        acc[continent].push(zone)
        return acc
      }, {})
    }
    return ALL_TIMEZONES
  }

  /**
   * 获取时区偏移信息
   * @param timezone - 时区代码
   * @returns 时区偏移信息
   */
  static getTimezoneOffset(timezone: string): string {
    const timeZone = ALL_TIMEZONES.find(tz => tz.name === timezone)
    const minutes =
      timeZone && typeof timeZone.currentTimeOffsetInMinutes === 'number'
        ? timeZone.currentTimeOffsetInMinutes
        : 0
    return minutes.toString()
  }

  /**
   * 根据国家代码获取可用时区
   * @param countryCode - 国家代码 (ISO 3166-1 alpha-2)
   * @returns 国家可用时区列表
   */
  static getTimezonesByCountry(countryCode: string): typeof ALL_TIMEZONES {
    return ALL_TIMEZONES.filter(tz => tz.countryCode === countryCode.toUpperCase())
  }

  /**
   * 获取当前时间
   * @returns dayjs.Dayjs 对象
   */
  static now(): dayjs.Dayjs {
    return dayjs()
  }

  // =================
  // 基础操作 - 优化错误处理和类型安全
  // =================

  /**
   * 格式化日期 - 类型安全版本
   * @param date - 日期输入
   * @param format - 格式字符串或预定义格式
   * @param options - 格式化选项
   * @returns 格式化后的字符串
   */
  static format(
    date: DateInput,
    format: DateFormatValues | DateFormat = DATE_FORMATS.datetime,
    options: FormatOptions = {}
  ): string {
    const { locale, timezone, fallback = 'Invalid Date' } = options
    return this.coreFormat(date, { mode: 'dayjs', format, locale, timezone, fallback })
  }

  /**
   * 根据时间戳格式化日期时间（自动识别秒/毫秒）
   * @param timestamp - 时间戳
   * @param format - 格式字符串
   * @param options - 格式化选项
   * @returns 格式化后的字符串
   */
  static formatTimestamp(
    timestamp: TimestampInput,
    format: DateFormat = DATE_FORMATS.datetime,
    options: FormatOptions = {}
  ): string {
    const { fallback = 'Invalid Date' } = options
    try {
      const ms = this.normalizeTimestamp(timestamp)
      return this.coreFormat(dayjs(ms), { mode: 'dayjs', format, ...options, fallback })
    } catch (error) {
      console.error('DateUtils.formatTimestamp error:', error)
      return fallback
    }
  }

  /**
   * 高级时间戳格式化 - 支持精度控制和多种选项
   * @param timestamp - 时间戳
   * @param options - 时间戳格式化选项
   * @returns 格式化后的字符串
   */
  static formatTimestampAdvanced(
    timestamp: TimestampInput,
    options: TimestampFormatOptions = {}
  ): string {
    try {
      const {
        precision = 'second',
        locale = DEFAULT_LOCALE,
        customFormat,
        timezone = timezoneState,
        truncate = false,
      } = options
      const ms = this.normalizeTimestamp(timestamp)
      let date = dayjs(ms)
      if (!date.isValid()) {
        throw new Error(`Invalid timestamp: ${timestamp}`)
      }
      if (timezone) {
        date = date.tz(timezone)
      }
      date = this.truncateByPrecision(date, precision, truncate)
      const fmt = customFormat || PRECISION_FORMATS[precision]
      return this.coreFormat(date, { mode: 'dayjs', format: fmt, locale, timezone })
    } catch (error) {
      console.error('DateUtils.formatTimestampAdvanced error:', error)
      return 'Invalid Date'
    }
  }

  /**
   * 使用 Intl API 格式化日期 - 更接近系统本地化
   * @param date - 日期输入
   * @param locale - 语言环境
   * @param timezone - 时区
   * @param options - Intl 格式化选项
   * @returns 格式化后的字符串
   */
  static formatIntl(
    date: DateInput,
    locale: Locale = DEFAULT_LOCALE,
    timezone: string = timezoneState,
    options: Intl.DateTimeFormatOptions = {}
  ): string {
    return this.coreFormat(date, {
      mode: 'intl',
      locale,
      timezone,
      intlOptions: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        ...options,
      },
    })
  }

  /**
   * 智能格式化：优先使用 Intl API，回退到 dayjs
   * @param date - 日期输入
   * @param formatStyle - 格式风格 ('system' | 'dayjs' | 'auto')
   * @param options - 格式化选项
   * @returns 格式化后的字符串
   */
  static formatSmart(
    date: DateInput,
    formatStyle: 'system' | 'dayjs' | 'auto' = 'auto',
    options: FormatOptions & { intlOptions?: Intl.DateTimeFormatOptions } = {}
  ): string {
    const {
      locale = DEFAULT_LOCALE,
      timezone = timezoneState,
      fallback = 'Invalid Date',
      intlOptions,
    } = options
    if (formatStyle === 'system') {
      return this.coreFormat(date, { mode: 'intl', locale, timezone, intlOptions, fallback })
    }
    if (formatStyle === 'dayjs') {
      return this.coreFormat(date, {
        mode: 'dayjs',
        format: DATE_FORMATS.datetime,
        locale,
        timezone,
        fallback,
      })
    }
    return this.coreFormat(date, {
      mode: 'auto',
      format: DATE_FORMATS.datetime,
      locale,
      timezone,
      intlOptions,
      fallback,
    })
  }

  /**
   * 使用 vue-i18n 的 datetimeFormats 格式化日期
   * @param date - 日期输入
   * @param formatKey - 格式键名
   * @param locale - 语言环境
   * @param timezone - 时区
   * @returns 格式化后的字符串
   */
  static formatI18n(
    date: DateInput,
    formatKey: 'short' | 'long' | 'datetime' | 'time' | 'dateOnly' | 'timeOnly' = 'datetime',
    locale: Locale = DEFAULT_LOCALE,
    timezone: string = timezoneState
  ): string {
    return this.coreFormat(date, {
      mode: 'i18n',
      formatKey,
      locale,
      timezone,
    })
  }

  /**
   * 获取 i18n 格式配置对应的 Intl 选项
   * @param formatKey - 格式键
   * @param locale - 语言环境
   * @returns Intl 格式选项
   * @private
   */
  private static getI18nFormatOptions(
    formatKey: string,
    locale: Locale
  ): Intl.DateTimeFormatOptions {
    const formatMaps: Record<Locale, Record<string, Intl.DateTimeFormatOptions>> = {
      ['zh-CN']: {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        datetime: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        },
        time: { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: false },
        dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit' },
        timeOnly: { hour: '2-digit', minute: '2-digit', hour12: false },
      },
      ['en-US']: {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        datetime: {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        },
        time: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true },
        dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit' },
        timeOnly: { hour: '2-digit', minute: '2-digit', hour12: true },
      },
    }

    return formatMaps[locale]?.[formatKey] || formatMaps['zh-CN'].datetime
  }

  /**
   * 异步高级时间戳格式化 - 支持语言包动态加载
   * @param timestamp - 时间戳
   * @param options - 时间戳格式化选项
   * @returns Promise<string>
   */
  static async formatTimestampAdvancedAsync(
    timestamp: TimestampInput,
    options: TimestampFormatOptions = {}
  ): Promise<string> {
    try {
      const {
        precision = 'second',
        locale = DEFAULT_LOCALE,
        customFormat,
        timezone = timezoneState,
        truncate = false,
      } = options

      const ms = this.normalizeTimestamp(timestamp)
      let date = dayjs(ms)

      if (!date.isValid()) {
        throw new Error(`Invalid timestamp: ${timestamp}`)
      }

      if (timezone) {
        date = date.tz(timezone)
      }

      date = this.truncateByPrecision(date, precision, truncate)
      const format = customFormat || PRECISION_FORMATS[precision]

      if (locale) {
        return this.withLocale(locale, () => date.format(format))
      }

      return date.format(format)
    } catch (error) {
      console.error('DateUtils.formatTimestampAdvancedAsync error:', error)
      return 'Invalid Date'
    }
  }

  /**
   * 安全的日期解析
   * @param date - 日期输入
   * @param fallback - 解析失败时的回退值
   * @param options - 解析选项
   * @returns dayjs.Dayjs 对象或 null
   */
  static safeParse(
    date: DateInput,
    fallback?: dayjs.Dayjs | null,
    options: ParseOptions = {}
  ): dayjs.Dayjs | null {
    const { strict = false, formats = [], locale, timezone } = options

    try {
      let parsed: dayjs.Dayjs | null = null

      if (strict && formats.length > 0) {
        // 严格模式：尝试指定格式
        for (const format of formats) {
          const attempt = dayjs(date as string, format, true)
          if (attempt.isValid()) {
            parsed = attempt
            break
          }
        }
      } else {
        // 普通模式：使用 dayjs 默认解析
        const attempt = dayjs(date)
        if (attempt.isValid()) {
          parsed = attempt
        }
      }

      if (!parsed) {
        return fallback ?? null
      }

      // 时区转换
      if (timezone) {
        parsed = parsed.tz(timezone)
      }

      // 语言环境设置
      if (locale) {
        const currentLocale = dayjs.locale()
        try {
          dayjs.locale(locale)
          return parsed
        } finally {
          dayjs.locale(currentLocale)
        }
      }

      return parsed
    } catch (error) {
      console.warn('DateUtils.safeParse error:', error)
      return fallback ?? null
    }
  }

  /**
   * 智能日期解析 - 自动推测格式
   * @param input - 输入字符串
   * @param options - 解析选项
   * @returns 解析结果
   */
  static smartParse(input: string, options: ParseOptions = {}): SmartParseResult {
    const { timezone } = options
    const formats: string[] = [
      'YYYY-MM-DD',
      'YYYY/MM/DD',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'YYYY-MM-DD HH:mm:ss',
      'MM-DD-YYYY',
      'DD-MM-YYYY',
      'YYYY年MM月DD日',
      'MM月DD日',
      'YYYY-MM-DD HH:mm',
      'YYYY/MM/DD HH:mm:ss',
      'DD/MM/YYYY HH:mm:ss',
      ...(options.formats || []),
    ]

    const errors: string[] = []
    const suggestions: string[] = []

    // 尝试严格格式匹配
    for (const format of formats) {
      try {
        const parsed = dayjs(input, format, true)
        if (parsed.isValid()) {
          let result = parsed

          // 时区转换
          if (timezone) {
            result = result.tz(timezone)
          }

          return {
            date: result,
            confidence: 0.9,
            format,
            errors: [],
            suggestions: [],
          }
        }
      } catch (error) {
        errors.push(`Format ${format}: ${(error as Error).message}`)
      }
    }

    // 尝试自然语言解析
    try {
      const parsed = dayjs(input)
      if (parsed.isValid()) {
        let result = parsed

        if (timezone) {
          result = result.tz(timezone)
        }

        return {
          date: result,
          confidence: 0.7,
          errors,
          suggestions: ['Consider using a more specific format for better accuracy'],
        }
      }
    } catch (error) {
      errors.push(`Natural parsing: ${(error as Error).message}`)
    }

    // 提供建议
    suggestions.push(
      'Try formats like: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY',
      'Ensure the date is within valid ranges',
      'Check for typos in month/day names'
    )

    return {
      date: null,
      confidence: 0,
      errors,
      suggestions,
    }
  }

  // =================
  // 批量操作 - 类型安全的批量处理
  // =================

  /**
   * 批量格式化日期
   * @param dates - 日期数组
   * @param format - 格式字符串
   * @param options - 批量处理选项
   * @returns 格式化结果数组
   */
  static batchFormat<T = string>(
    dates: DateInput[],
    format: DateFormat = DATE_FORMATS.datetime,
    options: BatchProcessOptions<T> = {}
  ): (string | T | null)[] {
    const { errorHandler, concurrent = false, batchSize = 100 } = options

    const processor = (date: DateInput, index: number): string | T | null => {
      try {
        return this.format(date, format)
      } catch (error) {
        if (errorHandler) {
          return errorHandler(error as Error, date, index)
        }
        console.warn(`Failed to format date at index ${index}:`, error)
        return null
      }
    }

    if (concurrent && dates.length > batchSize) {
      // 分批处理大量数据
      const results: (string | T | null)[] = []
      for (let i = 0; i < dates.length; i += batchSize) {
        const batch = dates.slice(i, i + batchSize)
        const batchResults = batch.map((date, localIndex) => processor(date, i + localIndex))
        results.push(...batchResults)
      }
      return results
    }

    return dates.map(processor)
  }

  /**
   * 批量处理日期
   * @param dates - 日期数组
   * @param processor - 处理函数
   * @param options - 批量处理选项
   * @returns 处理结果数组
   */
  static batchProcess<T, R = T>(
    dates: DateInput[],
    processor: DateProcessor<T>,
    options: BatchProcessOptions<R> = {}
  ): (T | R | null)[] {
    const { errorHandler } = options

    const safeProcessor = (date: DateInput, index: number): T | R | null => {
      try {
        const dayjsObj = this.validateDateInput(date, 'batchProcess')
        return processor(dayjsObj, index)
      } catch (error) {
        if (errorHandler) {
          return errorHandler(error as Error, date, index)
        }
        console.warn(`Failed to process date at index ${index}:`, error)
        return null
      }
    }

    return dates.map(safeProcessor)
  }

  // =================
  // 相对时间 - 类型安全的相对时间处理
  // =================

  /**
   * 获取相对时间
   * @param date - 日期输入
   * @param options - 格式化选项
   * @returns 相对时间字符串
   */
  static fromNow(date: DateInput, options: FormatOptions = {}): string {
    const { fallback = 'Invalid Date' } = options

    try {
      const d = this.validateDateInput(date, 'fromNow')
      return d.fromNow()
    } catch (error) {
      console.error('DateUtils.fromNow error:', error)
      return fallback
    }
  }

  static async fromNowWithLocale(
    date: DateInput,
    locale: Locale,
    options: FormatOptions = {}
  ): Promise<string> {
    const { fallback = 'Invalid Date' } = options

    try {
      const d = this.validateDateInput(date, 'fromNowWithLocale')
      return this.withLocale(locale, () => d.fromNow())
    } catch (error) {
      console.error('DateUtils.fromNowWithLocale error:', error)
      return fallback
    }
  }

  /**
   * 获取相对于指定日期的时间
   * @param date - 基准日期
   * @param targetDate - 目标日期
   * @param options - 格式化选项
   * @returns 相对时间字符串
   */
  static fromDate(date: DateInput, targetDate: DateInput, options: FormatOptions = {}): string {
    const { fallback = 'Invalid Date' } = options

    try {
      const d = this.validateDateInput(date, 'fromDate')
      const target = this.validateDateInput(targetDate, 'fromDate')
      return d.from(target)
    } catch (error) {
      console.error('DateUtils.fromDate error:', error)
      return fallback
    }
  }

  // =================
  // 日期验证 - 增强的验证功能
  // =================

  /**
   * 日期范围验证
   * @param date - 要验证的日期
   * @param minDate - 最小日期
   * @param maxDate - 最大日期
   * @returns 验证结果
   */
  static validateDateRange(
    date: DateInput,
    minDate?: DateInput,
    maxDate?: DateInput
  ): ValidationResult {
    try {
      const d = this.validateDateInput(date, 'validateDateRange')

      if (minDate && d.isBefore(dayjs(minDate))) {
        return {
          valid: false,
          reason: 'Date is before minimum allowed value',
          code: 'DATE_TOO_EARLY',
          details: { date: d.toISOString(), minDate: dayjs(minDate).toISOString() },
        }
      }

      if (maxDate && d.isAfter(dayjs(maxDate))) {
        return {
          valid: false,
          reason: 'Date is after maximum allowed value',
          code: 'DATE_TOO_LATE',
          details: { date: d.toISOString(), maxDate: dayjs(maxDate).toISOString() },
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        reason: `Validation error: ${(error as Error).message}`,
        code: 'DATE_VALIDATION_ERROR',
        details: { originalError: error },
      }
    }
  }

  /**
   * 检查日期是否有效
   * @param date - 日期输入
   * @returns 是否有效
   */
  static isValid(date: DateInput): boolean {
    try {
      return dayjs(date).isValid()
    } catch {
      return false
    }
  }

  // =================
  // 工作日处理 - 增强的工作日功能
  // =================

  /**
   * 检查是否为工作日（周一到周五）
   * @param date - 日期输入
   * @returns 是否为工作日
   */
  static isWeekday(date: DateInput): boolean {
    const d = this.validateDateInput(date, 'isWeekday')
    const day = d.day()
    return day >= 1 && day <= 5
  }

  /**
   * 检查是否为周末
   * @param date - 日期输入
   * @returns 是否为周末
   */
  static isWeekend(date: DateInput): boolean {
    return !this.isWeekday(date)
  }

  /**
   * 检查是否为工作日（模板壳：按周一到周五）
   * @param date - 日期输入
   * @returns 是否为工作日
   */
  static isWorkingDay(date: DateInput): boolean {
    return this.isWeekday(date)
  }

  /**
   * 获取下一个工作日
   * @param date - 基准日期
   * @returns 下一个工作日
   */
  static nextWorkday(date: DateInput): dayjs.Dayjs {
    let next = this.validateDateInput(date, 'nextWorkday').add(1, 'day')
    while (this.isWeekend(next)) {
      next = next.add(1, 'day')
    }
    return next
  }

  /**
   * 获取下一个工作日（考虑节假日）
   * @param date - 基准日期
   * @returns 下一个工作日
   */
  static nextWorkingDay(date: DateInput): dayjs.Dayjs {
    let next = this.validateDateInput(date, 'nextWorkingDay').add(1, 'day')
    while (!this.isWorkingDay(next)) {
      next = next.add(1, 'day')
    }
    return next
  }

  /**
   * 获取上一个工作日
   * @param date - 基准日期
   * @returns 上一个工作日
   */
  static prevWorkday(date: DateInput): dayjs.Dayjs {
    let prev = this.validateDateInput(date, 'prevWorkday').subtract(1, 'day')
    while (this.isWeekend(prev)) {
      prev = prev.subtract(1, 'day')
    }
    return prev
  }

  /**
   * 获取上一个工作日（考虑节假日）
   * @param date - 基准日期
   * @returns 上一个工作日
   */
  static prevWorkingDay(date: DateInput): dayjs.Dayjs {
    let prev = this.validateDateInput(date, 'prevWorkingDay').subtract(1, 'day')
    while (!this.isWorkingDay(prev)) {
      prev = prev.subtract(1, 'day')
    }
    return prev
  }

  // =================
  // 缓存和性能优化
  // =================

  /**
   * 带缓存的复杂计算
   * @param key - 缓存键
   * @param calculator - 计算函数
   * @param options - 缓存选项
   * @returns 计算结果
   */
  static getCachedResult<T>(key: string, calculator: () => T, options: CacheOptions = {}): T {
    const { ttl = this.cacheTtl, enabled = true } = options

    if (!enabled) {
      return calculator()
    }

    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && now - cached.timestamp < ttl) {
      return cached.value as T
    }

    const result = calculator()
    this.cache.set(key, { value: result, timestamp: now })

    // 清理过期缓存
    this.cleanExpiredCache()

    return result
  }

  /**
   * 清理所有缓存
   */
  static clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  static getCacheStats(): {
    size: number
    keys: string[]
    oldestTimestamp: number | null
    newestTimestamp: number | null
  } {
    const entries = Array.from(this.cache.entries())
    const timestamps = entries.map(([, { timestamp }]) => timestamp)

    return {
      size: this.cache.size,
      keys: entries.map(([key]) => key),
      oldestTimestamp: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestTimestamp: timestamps.length > 0 ? Math.max(...timestamps) : null,
    }
  }

  // =================
  // 日期序列生成器 - 内存友好的生成器
  // =================

  /**
   * 日期序列生成器
   * @param start - 开始日期
   * @param end - 结束日期
   * @param step - 步长
   * @param unit - 时间单位
   * @returns 日期生成器
   */
  static *dateSequence(
    start: DateInput,
    end: DateInput,
    step: number = 1,
    unit: DayjsManipulateType = 'day'
  ): Generator<dayjs.Dayjs, void, unknown> {
    let current = this.validateDateInput(start, 'dateSequence')
    const endDate = this.validateDateInput(end, 'dateSequence')

    while (current.isSameOrBefore(endDate)) {
      yield current
      current = current.add(step, unit)
    }
  }

  /**
   * 工作日序列生成器
   * @param start - 开始日期
   * @param end - 结束日期
   * @returns 工作日生成器
   */
  static *workdaySequence(start: DateInput, end: DateInput): Generator<dayjs.Dayjs, void, unknown> {
    for (const date of this.dateSequence(start, end)) {
      if (this.isWorkingDay(date)) {
        yield date
      }
    }
  }

  // =================
  // 时间段分析 - 完善的分析功能
  // =================

  /**
   * 分析时间段
   * @param dates - 日期数组
   * @returns 时间段分析结果
   */
  static analyzeTimePeriod(dates: DateInput[]): TimePeriodAnalysis {
    if (dates.length === 0) {
      return {
        count: 0,
        earliest: null,
        latest: null,
        span: { days: 0, hours: 0, minutes: 0, milliseconds: 0 },
        average: null,
        distribution: {
          byHour: {},
          byDay: {},
          byMonth: {},
          byYear: {},
        },
      }
    }

    const validDates = dates.map(d => this.safeParse(d)).filter((d): d is dayjs.Dayjs => d !== null)

    if (validDates.length === 0) {
      return {
        count: 0,
        earliest: null,
        latest: null,
        span: { days: 0, hours: 0, minutes: 0, milliseconds: 0 },
        average: null,
        distribution: {
          byHour: {},
          byDay: {},
          byMonth: {},
          byYear: {},
        },
      }
    }

    const earliest = this.min(...validDates)
    const latest = this.max(...validDates)

    const spanMs = latest.diff(earliest)
    const span = {
      days: Math.floor(spanMs / (24 * 60 * 60 * 1000)),
      hours: Math.floor((spanMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
      minutes: Math.floor((spanMs % (60 * 60 * 1000)) / (60 * 1000)),
      milliseconds: spanMs,
    }

    const averageMs = validDates.reduce((sum, d) => sum + d.valueOf(), 0) / validDates.length
    const average = dayjs(averageMs)

    // 计算分布
    const distribution = {
      byHour: {} as Record<number, number>,
      byDay: {} as Record<number, number>,
      byMonth: {} as Record<number, number>,
      byYear: {} as Record<number, number>,
    }

    validDates.forEach(d => {
      const hour = d.hour()
      const day = d.day()
      const month = d.month() + 1
      const year = d.year()

      distribution.byHour[hour] = (distribution.byHour[hour] || 0) + 1
      distribution.byDay[day] = (distribution.byDay[day] || 0) + 1
      distribution.byMonth[month] = (distribution.byMonth[month] || 0) + 1
      distribution.byYear[year] = (distribution.byYear[year] || 0) + 1
    })

    return {
      count: validDates.length,
      earliest,
      latest,
      span,
      average,
      distribution,
    }
  }

  // =================
  // 辅助工具方法 - 完善的工具功能
  // =================

  /**
   * 查找最早日期
   * @param dates - 日期数组
   * @returns 最早的日期
   */
  static min(...dates: DateInput[]): dayjs.Dayjs {
    if (dates.length === 0) {
      throw new Error('At least one date is required')
    }

    return dates.reduce(
      (earliest: dayjs.Dayjs, current) => {
        const currentDate = this.validateDateInput(current, 'min')
        return currentDate.isBefore(earliest) ? currentDate : earliest
      },
      this.validateDateInput(dates[0], 'min')
    )
  }

  /**
   * 查找最晚日期
   * @param dates - 日期数组
   * @returns 最晚的日期
   */
  static max(...dates: DateInput[]): dayjs.Dayjs {
    if (dates.length === 0) {
      throw new Error('At least one date is required')
    }

    return dates.reduce(
      (latest: dayjs.Dayjs, current) => {
        const currentDate = this.validateDateInput(current, 'max')
        return currentDate.isAfter(latest) ? currentDate : latest
      },
      this.validateDateInput(dates[0], 'max')
    )
  }

  /**
   * 日期排序
   * @param dates - 日期数组
   * @param order - 排序顺序
   * @returns 排序后的日期数组
   */
  static sort(dates: DateInput[], order: 'asc' | 'desc' = 'asc'): dayjs.Dayjs[] {
    const validDates = dates.map(d => this.safeParse(d)).filter((d): d is dayjs.Dayjs => d !== null)

    return [...validDates].sort((a, b) => {
      const comparison = a.valueOf() - b.valueOf()
      return order === 'asc' ? comparison : -comparison
    })
  }

  /**
   * 日期去重
   * @param dates - 日期数组
   * @param unit - 比较单位
   * @returns 去重后的日期数组
   */
  static unique(dates: DateInput[], unit: DayjsOpUnitType = 'day'): dayjs.Dayjs[] {
    const validDates = dates.map(d => this.safeParse(d)).filter((d): d is dayjs.Dayjs => d !== null)

    const unique: dayjs.Dayjs[] = []

    for (const date of validDates) {
      const exists = unique.some(existing => existing.isSame(date, unit))
      if (!exists) {
        unique.push(date)
      }
    }

    return unique
  }
}

export { dayjs }
export default DateUtils
