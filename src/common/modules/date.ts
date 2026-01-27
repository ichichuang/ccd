import dayjs from 'dayjs'

// 导入插件
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

// 扩展插件
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

// 设置默认语言为英文
dayjs.locale('en')

// ===== 类型定义 =====
export type DateInput = string | number | Date | dayjs.Dayjs
export type StrictDateInput = string | Date | dayjs.Dayjs // 排除 number，更严格的类型
export type DateFormat = string
export type Locale = 'zh-CN' | 'en-US' | 'zh-TW' // 与框架国际化保持一致

// DayJS 相关类型重新导出
export type DayjsManipulateType = dayjs.ManipulateType
export type DayjsOpUnitType = dayjs.OpUnitType
export type DayjsQUnitType = dayjs.QUnitType

// 时间单位类型
export type TimeUnit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'

export type OpUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
export type CompareUnit =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'

// 时间戳相关类型
export type TimestampType = 'second' | 'millisecond' | 'compressed'
export type TimestampInput = number
export type TimestampOutput = number | string

// 时间戳转换精度级别
export type TimestampPrecision =
  | 'year' // 精确到年：2024
  | 'month' // 精确到月：2024-01
  | 'date' // 精确到日：2024-01-01
  | 'hour' // 精确到时：2024-01-01 01
  | 'minute' // 精确到分：2024-01-01 01:30
  | 'second' // 精确到秒：2024-01-01 01:30:45
  | 'millisecond' // 精确到毫秒：2024-01-01 01:30:45.123

// 压缩时间戳精度
export type CompressedTimestampPrecision = 'date' | 'hour' | 'minute' | 'second'

// 时区类型
export type TimezoneInput = string // 如 'Asia/Shanghai', 'UTC', etc.

// 周几类型 (0-6, 0是周日)
export type WeekdayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6

// 月份类型 (0-11, dayjs内部使用)
export type MonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

// 季度类型 (1-4)
export type QuarterNumber = 1 | 2 | 3 | 4

// 包含性类型
export type Inclusivity = '()' | '[]' | '(]' | '[)'

// ===== 选项接口定义 =====
// 时间戳转换选项
export interface TimestampFormatOptions {
  precision?: TimestampPrecision
  locale?: Locale
  customFormat?: string
  timezone?: string
  truncate?: boolean // 是否截断到指定精度（而非四舍五入）
}

// 批量操作选项
export interface BatchProcessOptions<T> {
  errorHandler?: (error: Error, item: DateInput, index: number) => T | null
  preserveOrder?: boolean
  concurrent?: boolean // 是否并发处理
  batchSize?: number // 批次大小
}

// 日期范围选项
export interface DateRangeOptions {
  includeStart?: boolean
  includeEnd?: boolean
  step?: number
  unit?: DayjsManipulateType
}

// 格式化选项
export interface FormatOptions {
  locale?: Locale
  timezone?: string
  fallback?: string // 格式化失败时的回退值
}

// 解析选项
export interface ParseOptions {
  strict?: boolean
  formats?: string[] // 尝试的格式列表
  locale?: Locale
  timezone?: string
}

// 验证选项
export interface ValidationOptions {
  allowFuture?: boolean
  allowPast?: boolean
  minDate?: DateInput
  maxDate?: DateInput
  strictFormat?: boolean
}

// 节假日配置接口
export interface Holiday {
  name: string
  date: string | DateInput
  type: 'national' | 'international' | 'custom' | 'workday' // 添加调休工作日类型
  recurring?: boolean // 是否每年重复
  description?: string
  country?: string
  region?: string
}

// 节假日配置
export interface HolidayConfig {
  year: number
  holidays: Holiday[]
  country?: string
  region?: string
}

// 中国节假日预设 (2024年示例)
export const CHINA_HOLIDAYS_2024: Holiday[] = [
  // 法定节假日
  { name: '元旦', date: '2024-01-01', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-10', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-11', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-12', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-13', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-14', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-15', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-16', type: 'national', recurring: false, country: 'CN' },
  { name: '春节', date: '2024-02-17', type: 'national', recurring: false, country: 'CN' },
  { name: '清明节', date: '2024-04-04', type: 'national', recurring: false, country: 'CN' },
  { name: '清明节', date: '2024-04-05', type: 'national', recurring: false, country: 'CN' },
  { name: '清明节', date: '2024-04-06', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-01', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-02', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-03', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-04', type: 'national', recurring: false, country: 'CN' },
  { name: '劳动节', date: '2024-05-05', type: 'national', recurring: false, country: 'CN' },
  { name: '端午节', date: '2024-06-10', type: 'national', recurring: false, country: 'CN' },
  { name: '中秋节', date: '2024-09-15', type: 'national', recurring: false, country: 'CN' },
  { name: '中秋节', date: '2024-09-16', type: 'national', recurring: false, country: 'CN' },
  { name: '中秋节', date: '2024-09-17', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-01', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-02', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-03', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-04', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-05', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-06', type: 'national', recurring: false, country: 'CN' },
  { name: '国庆节', date: '2024-10-07', type: 'national', recurring: false, country: 'CN' },

  // 调休工作日
  { name: '春节调休', date: '2024-02-04', type: 'workday', recurring: false, country: 'CN' },
  { name: '春节调休', date: '2024-02-18', type: 'workday', recurring: false, country: 'CN' },
  { name: '劳动节调休', date: '2024-04-28', type: 'workday', recurring: false, country: 'CN' },
  { name: '劳动节调休', date: '2024-05-11', type: 'workday', recurring: false, country: 'CN' },
  { name: '国庆节调休', date: '2024-09-29', type: 'workday', recurring: false, country: 'CN' },
  { name: '国庆节调休', date: '2024-10-12', type: 'workday', recurring: false, country: 'CN' },
]

// 国际节假日预设
export const INTERNATIONAL_HOLIDAYS: Holiday[] = [
  { name: "New Year's Day", date: '01-01', type: 'international', recurring: true },
  { name: "Valentine's Day", date: '02-14', type: 'international', recurring: true },
  { name: "International Women's Day", date: '03-08', type: 'international', recurring: true },
  { name: 'Labor Day', date: '05-01', type: 'international', recurring: true },
  { name: "Children's Day", date: '06-01', type: 'international', recurring: true },
  { name: 'Christmas', date: '12-25', type: 'international', recurring: true },
]

// 时间段信息
export interface TimePeriodInfo {
  start: dayjs.Dayjs
  end: dayjs.Dayjs
  duration: number // 毫秒数
  days: number
  hours: number
  minutes: number
  seconds: number
}

// 日期信息接口
export interface DateInfo {
  year: number
  month: number // 1-12
  date: number
  day: number // 0-6, 0是周日
  hour: number
  minute: number
  second: number
  millisecond: number
  week: number
  quarter: number
  dayOfYear: number
  isoWeek: number
  isWeekday: boolean
  isWeekend: boolean
  isLeapYear: boolean
  daysInMonth: number
  daysInYear: number
  timezone: string
  utcOffset: number
}

// 时间戳信息
export interface TimestampInfo {
  type: TimestampType
  length: number
  normalized: number
  date: dayjs.Dayjs
  isValid: boolean
  precision?: TimestampPrecision
  originalValue: number
}

// 日期范围
export interface DateRange {
  start: dayjs.Dayjs
  end: dayjs.Dayjs
  duration: number
  days: number
  includesDate: (date: DateInput) => boolean
}

// 智能解析结果
export interface SmartParseResult {
  date: dayjs.Dayjs | null
  confidence: number
  format?: string
  errors?: string[]
  suggestions?: string[]
}

// 时间段分析结果
export interface TimePeriodAnalysis {
  count: number
  earliest: dayjs.Dayjs | null
  latest: dayjs.Dayjs | null
  span: {
    days: number
    hours: number
    minutes: number
    milliseconds: number
  }
  average: dayjs.Dayjs | null
  distribution: {
    byHour: Record<number, number>
    byDay: Record<number, number>
    byMonth: Record<number, number>
    byYear: Record<number, number>
  }
}

// 验证结果
export interface ValidationResult {
  valid: boolean
  reason?: string
  code?: string
  details?: Record<string, any>
}

// 缓存选项
export interface CacheOptions {
  ttl?: number // 存活时间(毫秒)
  maxSize?: number // 最大缓存条目数
  enabled?: boolean // 是否启用缓存
}

const DEFAULT_LOCALE: Locale = 'zh-CN'
const DEFAULT_TIMEZONE = 'Asia/Shanghai'

// ===== 枚举类型 =====
// 日期格式枚举
export enum DateFormatEnum {
  Date = 'YYYY-MM-DD',
  Time = 'HH:mm:ss',
  Datetime = 'YYYY-MM-DD HH:mm:ss',
  DatetimeMinute = 'YYYY-MM-DD HH:mm',
  Iso = 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  ChineseDate = 'YYYY年MM月DD日',
  ChineseDatetime = 'YYYY年MM月DD日 HH:mm:ss',
  ShortDate = 'M/D/YYYY',
  LongDate = 'dddd, MMMM D, YYYY',
  Time12 = 'h:mm A',
  Datetime12 = 'YYYY-MM-DD h:mm A',
}

// 持续时间格式枚举
export enum DurationFormat {
  SHORT = 'short',
  LONG = 'long',
  PRECISE = 'precise',
}

// 时间比较结果枚举
export enum ComparisonResult {
  BEFORE = -1,
  SAME = 0,
  AFTER = 1,
}

// ===== 函数类型定义 =====
// 错误处理函数类型
export type ErrorHandler<T = any> = (error: Error, context?: any) => T | null

// 日期处理函数类型
export type DateProcessor<T> = (date: dayjs.Dayjs, index?: number) => T

// 日期过滤函数类型
export type DateFilter = (date: dayjs.Dayjs) => boolean

// 日期比较函数类型
export type DateComparator = (a: dayjs.Dayjs, b: dayjs.Dayjs) => number

// 缓存键生成函数类型
export type CacheKeyGenerator = (...args: any[]) => string

// ===== 常量定义 =====
export const DATE_FORMATS = {
  date: 'YYYY-MM-DD',
  time: 'HH:mm:ss',
  datetime: 'YYYY-MM-DD HH:mm:ss',
  datetimeMinute: 'YYYY-MM-DD HH:mm',
  iso: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  chineseDate: 'YYYY年MM月DD日',
  chineseDatetime: 'YYYY年MM月DD日 HH:mm:ss',
  // 新增更多格式
  shortDate: 'M/D/YYYY',
  longDate: 'dddd, MMMM D, YYYY',
  time12: 'h:mm A',
  datetime12: 'YYYY-MM-DD h:mm A',
} as const

// 常量类型
export type DateFormatKeys = keyof typeof DATE_FORMATS
export type DateFormatValues = (typeof DATE_FORMATS)[DateFormatKeys]

// 精度级别对应的格式映射
export const PRECISION_FORMATS: Record<TimestampPrecision, string> = {
  year: 'YYYY',
  month: 'YYYY-MM',
  date: 'YYYY-MM-DD',
  hour: 'YYYY-MM-DD HH',
  minute: 'YYYY-MM-DD HH:mm',
  second: 'YYYY-MM-DD HH:mm:ss',
  millisecond: 'YYYY-MM-DD HH:mm:ss.SSS',
} as const

// 时间戳阈值常量
export const TIMESTAMP_THRESHOLD = 1_000_000_000_000 as const // 用于区分秒级和毫秒级时间戳

// 缓存相关常量
export const CACHE_DEFAULTS = {
  ttl: 5 * 60 * 1000, // 5分钟
  maxSize: 1000,
  enabled: true,
} as const

let timezoneState = DEFAULT_TIMEZONE

// 日期范围常量
export const DATE_RANGES = {
  today: 'today',
  yesterday: 'yesterday',
  tomorrow: 'tomorrow',
  thisWeek: 'thisWeek',
  lastWeek: 'lastWeek',
  nextWeek: 'nextWeek',
  thisMonth: 'thisMonth',
  lastMonth: 'lastMonth',
  nextMonth: 'nextMonth',
  thisQuarter: 'thisQuarter',
  lastQuarter: 'lastQuarter',
  nextQuarter: 'nextQuarter',
  thisYear: 'thisYear',
  lastYear: 'lastYear',
  nextYear: 'nextYear',
} as const

export type DateRangePreset = keyof typeof DATE_RANGES

// 语言包映射
const LOCALE_MODULES = {
  en: () => import('dayjs/locale/en.js'),
  zhCn: () => import('dayjs/locale/zh-cn.js'),
  zhTw: () => import('dayjs/locale/zh-tw.js'),
} as const

// 语言代码映射 - 框架格式到 dayjs 格式
const LOCALE_MAP: Record<Locale, keyof typeof LOCALE_MODULES> = {
  ['en-US']: 'en',
  ['zh-CN']: 'zhCn',
  ['zh-TW']: 'zhTw',
} as const

// dayjs 语言代码映射 - 框架格式到 dayjs 内部格式
const DAYJS_LOCALE_MAP: Record<Locale, string> = {
  ['en-US']: 'en',
  ['zh-CN']: 'zh-cn',
  ['zh-TW']: 'zh-tw',
} as const

// 星期名称映射
const _WEEKDAY_NAMES = {
  short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const,
  long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const,
  chinese: ['日', '一', '二', '三', '四', '五', '六'] as const,
}

// 月份名称映射
const _MONTH_NAMES = {
  short: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ] as const,
  long: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ] as const,
  chinese: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'] as const,
}

// 类型导出
export type WeekdayFormat = keyof typeof _WEEKDAY_NAMES
export type MonthFormat = keyof typeof _MONTH_NAMES
export type LocaleModule = keyof typeof LOCALE_MODULES

/**
 * 时间处理工具类
 * @template T - 泛型类型参数，用于批量操作等场景
 */
export class DateUtils {
  // ===== 私有静态属性 =====
  // 缓存已加载的语言包
  private static loadedLocales = new Set<Locale>(['en-US'])

  // 节假日配置缓存
  private static holidays: Map<string, Holiday[]> = new Map()

  // 性能缓存
  private static cache = new Map<string, { value: any; timestamp: number }>()
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

    // 监听框架语言切换事件
    if (typeof window !== 'undefined') {
      window.addEventListener('locale-changed', (event: any) => {
        const { locale } = event.detail
        if (locale) {
          this.syncWithFrameworkLocale(locale)
        }
      })

      // 精简：统一仅监听 locale-changed 与 timezone-changed

      // 监听时区切换事件
      window.addEventListener('timezone-changed', (event: any) => {
        const { timezone } = event.detail
        if (timezone) {
          this.syncWithFrameworkTimezone(timezone)
        }
      })
    }

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
   * 生成缓存键
   * @param method - 方法名
   * @param args - 参数
   * @returns 缓存键
   */
  private static generateCacheKey(method: string, ...args: any[]): string {
    return `${method}:${JSON.stringify(args)}`
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
        if (typeof window !== 'undefined' && (window as any).$i18n) {
          try {
            const i18n = (window as any).$i18n
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
    // 初始化框架集成
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
      ['zh-TW']: {
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
        time: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
        dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit' },
        timeOnly: { hour: '2-digit', minute: '2-digit', hour12: false },
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
  // 节假日管理 - 完整的节假日功能
  // =================

  /**
   * 设置节假日配置
   * @param year - 年份
   * @param holidays - 节假日数组
   */
  static setHolidays(year: number, holidays: Holiday[]): void {
    this.holidays.set(year.toString(), holidays)
  }

  /**
   * 批量导入预设节假日
   * @param year - 年份
   * @param country - 国家代码 ('CN' | 'US' | 'INTL')
   */
  static importPresetHolidays(year: number, country: 'CN' | 'US' | 'INTL' = 'CN'): void {
    const yearKey = year.toString()
    let presetHolidays: Holiday[] = []

    switch (country) {
      case 'CN':
        // 导入中国节假日，调整年份
        presetHolidays = CHINA_HOLIDAYS_2024.map(holiday => ({
          ...holiday,
          date: holiday.date.toString().replace('2024', year.toString()),
        }))
        break
      case 'INTL':
        // 导入国际节假日，添加年份
        presetHolidays = INTERNATIONAL_HOLIDAYS.map(holiday => ({
          ...holiday,
          date: `${year}-${holiday.date}`,
        }))
        break
      default:
        console.warn(`Unsupported country: ${country}`)
        return
    }

    // 合并现有节假日
    const existing = this.holidays.get(yearKey) || []
    const merged = [...existing, ...presetHolidays]

    // 去重（基于日期）
    const unique = merged.reduce((acc, current) => {
      const dateStr = dayjs(current.date).format('YYYY-MM-DD')
      const exists = acc.some(item => dayjs(item.date).format('YYYY-MM-DD') === dateStr)
      if (!exists) {
        acc.push(current)
      }
      return acc
    }, [] as Holiday[])

    this.holidays.set(yearKey, unique)
  }

  /**
   * 使用 date-holidays 初始化指定国家/地区的节假日
   * @param countryCode - 国家代码 (ISO 3166-1 alpha-2)
   * @param state - 州/省代码 (可选)
   * @param region - 地区代码 (可选)
   * @returns 成功初始化返回true，失败返回false
   */
  static initCountryHolidays(countryCode: string, state?: string, region?: string): boolean {
    try {
      const api = getHolidaysApi()
      if (!api) {
        return false
      }
      const args: string[] = [countryCode]
      if (state) {
        args.push(state)
      }
      if (region) {
        args.push(region)
      }

      const result = api.init(...args)
      return result !== undefined ? true : false
    } catch (error) {
      console.error('Failed to initialize country holidays:', error)
      return false
    }
  }

  /**
   * 获取指定国家和年份的所有节假日
   * @param countryCode - 国家代码 (ISO 3166-1 alpha-2)
   * @param year - 年份
   * @param importToDateUtils - 是否将节假日导入到DateUtils
   * @returns 节假日列表或null
   */
  static getCountryHolidays(
    countryCode: string,
    year: number,
    importToDateUtils: boolean = false
  ): HolidayInfo[] | null {
    try {
      const api = getHolidaysApi()
      if (!api) {
        return null
      }

      api.init(countryCode)
      const holidays = api.getHolidays(year) as HolidayInfo[]

      if (importToDateUtils && holidays && Array.isArray(holidays)) {
        // 转换为DateUtils的Holiday格式并导入
        const convertedHolidays: Holiday[] = holidays.map(h => ({
          name: h.name,
          date: h.start,
          type: h.type === 'public' ? 'national' : 'international',
          country: countryCode,
          description: h.note || h.name,
          recurring: false,
        }))

        this.setHolidays(year, convertedHolidays)
      }

      return holidays
    } catch (error) {
      console.error('Failed to get country holidays:', error)
      return null
    }
  }

  /**
   * 获取支持的国家列表
   * @returns 支持的国家列表
   */
  static getSupportedCountries(): Record<string, string> {
    try {
      const api = getHolidaysApi()
      if (!api) {
        return {}
      }
      return api.getCountries()
    } catch (error) {
      console.error('Failed to get supported countries:', error)
      return {}
    }
  }

  /**
   * 检查指定日期是否为特定国家的节假日
   * @param date - 日期输入
   * @param countryCode - 国家代码 (ISO 3166-1 alpha-2)
   * @returns 如果是节假日返回节假日信息，否则返回false
   */
  static isCountryHoliday(date: DateInput, countryCode: string = 'CN'): boolean {
    try {
      const api = getHolidaysApi()
      if (!api) {
        return false
      }
      api.init(countryCode)
      const d = this.validateDateInput(date, 'isCountryHoliday')
      const result = api.isHoliday(d.toDate())
      return result !== false
    } catch (error) {
      console.error('Failed to check country holiday:', error)
      return false
    }
  }

  /**
   * 获取指定日期的节假日详情（如果是节假日）
   * @param date - 日期输入
   * @param countryCode - 国家代码 (ISO 3166-1 alpha-2)
   * @returns 节假日详情或null
   */
  static getCountryHolidayInfo(date: DateInput, countryCode: string = 'CN'): HolidayInfo | null {
    try {
      const api = getHolidaysApi()
      if (!api) {
        return null
      }
      api.init(countryCode)
      const d = this.validateDateInput(date, 'getCountryHolidayInfo')
      const result = api.isHoliday(d.toDate())
      return result === false ? null : (result as unknown as HolidayInfo)
    } catch (error) {
      console.error('Failed to get holiday info:', error)
      return null
    }
  }

  /**
   * 添加节假日
   * @param year - 年份
   * @param holiday - 节假日配置
   */
  static addHoliday(year: number, holiday: Holiday): void {
    const yearKey = year.toString()
    const existing = this.holidays.get(yearKey) || []
    existing.push(holiday)
    this.holidays.set(yearKey, existing)
  }

  /**
   * 删除节假日
   * @param year - 年份
   * @param holidayName - 节假日名称
   * @returns 是否删除成功
   */
  static removeHoliday(year: number, holidayName: string): boolean {
    const yearKey = year.toString()
    const existing = this.holidays.get(yearKey)
    if (!existing) {
      return false
    }

    const index = existing.findIndex(h => h.name === holidayName)
    if (index === -1) {
      return false
    }

    existing.splice(index, 1)
    return true
  }

  /**
   * 获取指定年份的节假日
   * @param year - 年份
   * @returns 节假日数组
   */
  static getHolidays(year: number): Holiday[] {
    return this.holidays.get(year.toString()) || []
  }

  /**
   * 清除指定年份的节假日配置
   * @param year - 年份
   */
  static clearHolidays(year: number): void {
    this.holidays.delete(year.toString())
  }

  /**
   * 清除所有节假日配置
   */
  static clearAllHolidays(): void {
    this.holidays.clear()
  }

  /**
   * 检查是否为节假日
   * @param date - 日期输入
   * @param year - 指定年份（可选，默认使用日期的年份）
   * @returns 是否为节假日
   */
  static isHoliday(date: DateInput, year?: number): boolean {
    const d = this.validateDateInput(date, 'isHoliday')
    const targetYear = year ?? d.year()
    const dateStr = d.format('MM-DD')

    const yearHolidays = this.holidays.get(targetYear.toString())
    return (
      yearHolidays?.some(holiday => {
        const holidayDate = dayjs(holiday.date).format('MM-DD')
        return holidayDate === dateStr
      }) ?? false
    )
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
   * 检查是否为工作日（排除节假日，包含调休工作日）
   * @param date - 日期输入
   * @returns 是否为工作日
   */
  static isWorkingDay(date: DateInput): boolean {
    const d = this.validateDateInput(date, 'isWorkingDay')
    const year = d.year()

    // 检查是否为调休工作日
    const yearHolidays = this.holidays.get(year.toString())
    const isAdjustedWorkday =
      yearHolidays?.some(holiday => {
        return (
          holiday.type === 'workday' &&
          dayjs(holiday.date).format('YYYY-MM-DD') === d.format('YYYY-MM-DD')
        )
      }) ?? false

    if (isAdjustedWorkday) {
      return true // 调休工作日算作工作日
    }

    // 常规判断：是工作日且不是节假日
    return this.isWeekday(date) && !this.isHoliday(date)
  }

  /**
   * 检查是否为节假日（不包括调休工作日）
   * @param date - 日期输入
   * @returns 是否为节假日
   */
  static isNonWorkingDay(date: DateInput): boolean {
    const d = this.validateDateInput(date, 'isNonWorkingDay')
    const year = d.year()

    // 检查是否为法定节假日
    const yearHolidays = this.holidays.get(year.toString())
    const isLegalHoliday =
      yearHolidays?.some(holiday => {
        return (
          (holiday.type === 'national' || holiday.type === 'international') &&
          dayjs(holiday.date).format('YYYY-MM-DD') === d.format('YYYY-MM-DD')
        )
      }) ?? false

    if (isLegalHoliday) {
      return true
    }

    // 周末且不是调休工作日
    if (this.isWeekend(date)) {
      const isAdjustedWorkday =
        yearHolidays?.some(holiday => {
          return (
            holiday.type === 'workday' &&
            dayjs(holiday.date).format('YYYY-MM-DD') === d.format('YYYY-MM-DD')
          )
        }) ?? false

      return !isAdjustedWorkday
    }

    return false
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
      return cached.value
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

    return validDates.sort((a, b) => {
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

// 定义 TZDB 时区类型的最小结构（与示例中使用到的字段对齐）
export interface TimeZoneMinimal {
  name: string
  countryCode?: string
  currentTimeOffsetInMinutes?: number
}

// 内部缓存与动态加载器（避免 Vite 对 @vvo/tzdb 的预编译解析报错）
let _ALL_TIMEZONES_INTERNAL: TimeZoneMinimal[] = [
  { name: 'UTC', countryCode: 'UN', currentTimeOffsetInMinutes: 0 },
  { name: 'Asia/Shanghai', countryCode: 'CN', currentTimeOffsetInMinutes: 480 },
  { name: 'Asia/Tokyo', countryCode: 'JP', currentTimeOffsetInMinutes: 540 },
  { name: 'America/New_York', countryCode: 'US', currentTimeOffsetInMinutes: -300 },
  { name: 'Europe/London', countryCode: 'GB', currentTimeOffsetInMinutes: 0 },
  { name: 'Australia/Sydney', countryCode: 'AU', currentTimeOffsetInMinutes: 600 },
]

/**
 * 可选的时区数据加载器（默认不启用）
 *
 * 说明：
 * - 项目默认使用内置的少量常用时区作为兜底，已满足常规演示与使用。
 * - 如需更完整的时区目录（含国家、偏移等），可以：
 *   1) 将完整的 time-zones.json 放入 public/ 或 public/static/；
 *   2) 在应用启动时（例如 main.ts）显式调用此方法，或恢复下方 IIFE 中的 await 调用；
 *   3) 或直接在此处调整优先加载顺序与来源。
 * - 若网络或跨域受限，优先使用本地静态资源路径。
 */
// async function loadTzdbSafely(): Promise<void> {
//   // 仅在浏览器环境尝试通过 CDN/本地静态资源加载，避免打包期解析
//   if (typeof window === 'undefined' || typeof fetch === 'undefined') {
//     return
//   }

//   const cdnUrls = [
//     // 优先使用本地静态资源（请将 time-zones.json 放在 public/ 根目录）
//     '/time-zones.json',
//     // 可选的二路径（若你的部署把静态文件放到 /static）
//     '/static/time-zones.json',
//     // 以下为远程后备源
//     'https://raw.githubusercontent.com/vvo/tzdb/main/dist/time-zones.json',
//     'https://cdn.jsdelivr.net/gh/vvo/tzdb@main/dist/time-zones.json',
//     'https://cdn.jsdelivr.net/npm/@vvo/tzdb@latest/dist/time-zones.json',
//   ]

//   for (const url of cdnUrls) {
//     try {
//       const res = await fetch(url, { cache: 'force-cache' as RequestCache })
//       if (!res.ok) {
//         continue
//       }
//       const zones = (await res.json()) as TimeZoneMinimal[]
//       if (Array.isArray(zones) && zones.length > 0 && zones[0].name) {
//         _ALL_TIMEZONES_INTERNAL = zones
//         break
//       }
//     } catch (error) {
//       // 忽略并尝试下一个 URL
//       console.warn('[tzdb] load failed from', url, error)
//     }
//   }
// }

// 触发异步加载（不阻塞页面）
// 精简：避免重复触发，保留下方 IIFE 调用

// 对外导出可变的时区数组引用（异步加载成功后会被更新）
export let ALL_TIMEZONES: TimeZoneMinimal[] = _ALL_TIMEZONES_INTERNAL

let loadTzdbPromise: Promise<void> | null = null

export const loadTzdbSafely = async (): Promise<void> => {
  if (loadTzdbPromise) {
    return loadTzdbPromise
  }

  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return
  }

  // 优先使用本地静态资源，如需完整时区数据请将 time-zones.json 放到 public/ 目录
  // 如果本地文件不存在，将使用内置的默认时区数据
  const cdnUrls = ['/time-zones.json', '/static/time-zones.json']

  // 带超时的 fetch 辅助函数
  const fetchWithTimeout = async (url: string, timeout = 5000): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        cache: 'force-cache' as RequestCache,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  loadTzdbPromise = (async () => {
    try {
      for (const url of cdnUrls) {
        try {
          const res = await fetchWithTimeout(url, 5000)
          if (!res.ok) {
            continue
          }

          // 检查 Content-Type，确保是 JSON 格式
          const contentType = res.headers.get('content-type') || ''
          if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
            // 如果返回的是 HTML（如 404 页面），静默跳过
            continue
          }

          const zones = (await res.json()) as TimeZoneMinimal[]
          if (Array.isArray(zones) && zones.length > 0 && zones[0].name) {
            _ALL_TIMEZONES_INTERNAL = zones
            ALL_TIMEZONES = _ALL_TIMEZONES_INTERNAL
            return
          }
        } catch (error) {
          // 静默处理单个 URL 的失败，继续尝试下一个
          // 对于文件不存在的情况（返回 HTML），不输出警告
          if (error instanceof Error && error.name !== 'AbortError') {
            const errorMessage = error.message.toLowerCase()
            // 如果错误是 JSON 解析错误且包含 HTML 标记，说明文件不存在，静默跳过
            if (errorMessage.includes('json') && errorMessage.includes('<!doctype')) {
              continue
            }
            // 其他错误才输出警告
            console.warn('[tzdb] load failed from', url, error.message)
          }
          continue
        }
      }
      // 所有 URL 都失败时，静默失败，使用默认时区数据
      console.info(
        '[tzdb] 本地时区数据文件未找到，使用内置默认时区数据。如需完整时区列表，请将 time-zones.json 放到 public/ 目录'
      )
    } catch (error) {
      // 确保最外层错误也被捕获
      console.warn('[tzdb] 加载时区数据时发生未知错误:', error)
    }
  })()

  return loadTzdbPromise
}

// 节假日信息接口
export interface HolidayInfo {
  name: string
  start: Date
  end: Date
  type: string
  note?: string
  [key: string]: any
}

let holidaysApi: any | null = null
let holidaysApiReady = false
let holidaysApiLoader: Promise<void> | null = null

const ensureHolidaysApi = async (): Promise<void> => {
  if (holidaysApiReady && holidaysApi) {
    return
  }
  if (!holidaysApiLoader) {
    holidaysApiLoader = import('date-holidays')
      .then(module => {
        const holidaysCtor = module.default
        holidaysApi = new holidaysCtor()
        holidaysApi.init('CN')
        holidaysApiReady = true
      })
      .catch(error => {
        console.error('Failed to load date-holidays:', error)
        holidaysApiReady = false
        holidaysApi = null
      })
  }
  await holidaysApiLoader
}

const getHolidaysApi = () => {
  if (holidaysApiReady && holidaysApi) {
    return holidaysApi
  }
  void ensureHolidaysApi()
  return null
}

// 导出 dayjs 实例，方便直接使用
export { dayjs }

// 默认导出工具类
export default DateUtils
