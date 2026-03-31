/**
 * 日期工具类型定义（纯类型，无运行时代码）
 */
import type { Dayjs } from 'dayjs'

// ===== 基础类型 =====
export type DateInput = string | number | Date | Dayjs
export type StrictDateInput = string | Date | Dayjs
export type DateFormat = string
export type Locale = 'zh-CN' | 'en-US'

// DayJS 相关类型重新导出
export type DayjsManipulateType = import('dayjs').ManipulateType
export type DayjsOpUnitType = import('dayjs').OpUnitType
export type DayjsQUnitType = import('dayjs').QUnitType

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

export type TimestampType = 'second' | 'millisecond' | 'compressed'
export type TimestampInput = number
export type TimestampOutput = number | string

export type TimestampPrecision =
  | 'year'
  | 'month'
  | 'date'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond'

export type CompressedTimestampPrecision = 'date' | 'hour' | 'minute' | 'second'
export type TimezoneInput = string
export type WeekdayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6
export type MonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
export type QuarterNumber = 1 | 2 | 3 | 4
export type Inclusivity = '()' | '[]' | '(]' | '[)'

// ===== 选项接口 =====
export interface TimestampFormatOptions {
  precision?: TimestampPrecision
  locale?: Locale
  customFormat?: string
  timezone?: string
  truncate?: boolean
}

export interface BatchProcessOptions<T> {
  errorHandler?: (error: Error, item: DateInput, index: number) => T | null
  preserveOrder?: boolean
  concurrent?: boolean
  batchSize?: number
}

export interface DateRangeOptions {
  includeStart?: boolean
  includeEnd?: boolean
  step?: number
  unit?: DayjsManipulateType
}

export interface FormatOptions {
  locale?: Locale
  timezone?: string
  fallback?: string
}

export interface ParseOptions {
  strict?: boolean
  formats?: string[]
  locale?: Locale
  timezone?: string
}

export interface ValidationOptions {
  allowFuture?: boolean
  allowPast?: boolean
  minDate?: DateInput
  maxDate?: DateInput
  strictFormat?: boolean
}

// ===== 信息接口 =====
export interface TimePeriodInfo {
  start: Dayjs
  end: Dayjs
  duration: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface DateInfo {
  year: number
  month: number
  date: number
  day: number
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

export interface TimestampInfo {
  type: TimestampType
  length: number
  normalized: number
  date: Dayjs
  isValid: boolean
  precision?: TimestampPrecision
  originalValue: number
}

export interface DateRange {
  start: Dayjs
  end: Dayjs
  duration: number
  days: number
  includesDate: (date: DateInput) => boolean
}

export interface SmartParseResult {
  date: Dayjs | null
  confidence: number
  format?: string
  errors?: string[]
  suggestions?: string[]
}

export interface TimePeriodAnalysis {
  count: number
  earliest: Dayjs | null
  latest: Dayjs | null
  span: {
    days: number
    hours: number
    minutes: number
    milliseconds: number
  }
  average: Dayjs | null
  distribution: {
    byHour: Record<number, number>
    byDay: Record<number, number>
    byMonth: Record<number, number>
    byYear: Record<number, number>
  }
}

export interface ValidationResult {
  valid: boolean
  reason?: string
  code?: string
  details?: Record<string, unknown>
}

export interface CacheOptions {
  ttl?: number
  maxSize?: number
  enabled?: boolean
}

// ===== 枚举 =====
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

export enum DurationFormat {
  SHORT = 'short',
  LONG = 'long',
  PRECISE = 'precise',
}

export enum ComparisonResult {
  BEFORE = -1,
  SAME = 0,
  AFTER = 1,
}

// ===== 函数类型 =====
export type ErrorHandler<T = unknown> = (error: Error, context?: unknown) => T | null
export type DateProcessor<T> = (date: Dayjs, index?: number) => T
export type DateFilter = (date: Dayjs) => boolean
export type DateComparator = (a: Dayjs, b: Dayjs) => number
export type CacheKeyGenerator = (...args: unknown[]) => string

/** TZDB 时区最小结构 */
export interface TimeZoneMinimal {
  name: string
  countryCode?: string
  currentTimeOffsetInMinutes?: number
}
