// @/components/modules/date-picker/utils/helper.ts
/**
 * DatePicker 工具函数
 */

import { defaultDisplayFormats } from './constants'
import type { DatePickerMode, DatePrimitive, DateValue } from './types'

/** 规范化日期值为 Date 实例（不成功则返回 null） */
export function toDate(value: DatePrimitive | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null
  }

  // 已经是 Date 实例
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  // 数字类型（时间戳）
  if (typeof value === 'number') {
    // 验证时间戳合理性（避免无效值）
    if (!isFinite(value) || value < 0) {
      return null
    }
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }

  // 字符串类型
  if (typeof value === 'string') {
    // 空字符串返回 null
    if (value.trim() === '') {
      return null
    }
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }

  // 其他类型返回 null
  return null
}

const padNumber = (value: number, length: number = 2): string => {
  return String(Math.trunc(Math.abs(value))).padStart(length, '0')
}

/** 生成带时区偏移的 ISO 字符串，避免 Date.prototype.toISOString() 强制转换为 UTC */
const formatIsoWithTimezone = (date: Date): string => {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  const day = padNumber(date.getDate())
  const hours = padNumber(date.getHours())
  const minutes = padNumber(date.getMinutes())
  const seconds = padNumber(date.getSeconds())
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

  const offsetMinutesTotal = -date.getTimezoneOffset() // 本地相对于 UTC 的偏移（分钟）
  if (offsetMinutesTotal === 0) {
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`
  }

  const offsetSign = offsetMinutesTotal >= 0 ? '+' : '-'
  const offsetHours = padNumber(Math.floor(Math.abs(offsetMinutesTotal) / 60))
  const offsetMinutes = padNumber(Math.abs(offsetMinutesTotal) % 60)

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`
}

/** 将 Date 转为期望的 v-model 值格式 */
export function formatModelValue(
  value: Date | number | string | null | undefined,
  valueFormat: 'date' | 'timestamp' | 'iso' | 'string' = 'date'
): DatePrimitive | null {
  if (value === null || value === undefined) {
    return null
  }

  // 统一转换为 Date 对象
  const date = toDate(value)
  if (!date) {
    return null
  }

  switch (valueFormat) {
    case 'timestamp': {
      return date.getTime()
    }
    case 'iso':
    case 'string':
      return formatIsoWithTimezone(date)
    case 'date':
    default:
      return date
  }
}

// helper.ts (新增一个用于内部传递的简化 ISO 格式函数)

/**
 * 格式化为简化 ISO 8601 格式（不带时区，不带毫秒）
 * 专供 vue-datepicker 内部解析使用，以避免时区解析问题。
 * 格式：YYYY-MM-DDTHH:mm:ss
 */
export const formatSimpleIso = (date: Date): string => {
  const year = date.getFullYear()
  const month = padNumber(date.getMonth() + 1)
  const day = padNumber(date.getDate())
  const hours = padNumber(date.getHours())
  const minutes = padNumber(date.getMinutes())
  const seconds = padNumber(date.getSeconds())

  // 不包含毫秒和时区偏移
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/** 从 v-model 值解析为 Date（支持范围） */
export function parseModelValue(value: DateValue): Date | [Date | null, Date | null] | null {
  if (value === null || value === undefined) {
    return null
  }

  if (Array.isArray(value)) {
    // 范围选择
    return [toDate(value[0]), toDate(value[1])]
  }

  // 单个日期
  return toDate(value as DatePrimitive)
}

/** 根据模式返回默认展示格式 */
export function getDefaultDisplayFormat(mode: DatePickerMode): string {
  return defaultDisplayFormats[mode] || defaultDisplayFormats.date
}

/** 格式化日期为指定格式的字符串（简单实现） */
export function formatDate(date: Date | null, format: string): string {
  if (!date || isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/** 验证日期是否在指定范围内 */
export function isDateInRange(
  date: Date | null,
  minDate?: Date | null,
  maxDate?: Date | null
): boolean {
  if (!date || isNaN(date.getTime())) {
    return false
  }

  const timestamp = date.getTime()

  if (minDate && !isNaN(minDate.getTime())) {
    if (timestamp < minDate.getTime()) {
      return false
    }
  }

  if (maxDate && !isNaN(maxDate.getTime())) {
    if (timestamp > maxDate.getTime()) {
      return false
    }
  }

  return true
}

/** 比较两个日期是否相同（只比较日期部分，忽略时间） */
export function isSameDate(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) {
    return false
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/** 获取日期范围的天数 */
export function getDateRangeDays(start: Date | null, end: Date | null): number {
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0
  }

  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
