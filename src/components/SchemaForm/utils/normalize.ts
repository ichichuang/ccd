// @/components/SchemaForm/utils/normalize.ts
/**
 * 共享的值规范化函数
 * 从 useFormSync 和 useFormMemory 中提取，消除重复代码
 */

import { deepClone } from '@/utils/lodashes'
import type { SchemaColumnsItem } from './types'

/** DatePicker 支持的 valueFormat，与 WrappedDatePicker 一致 */
export type DatePickerValueFormat = 'timestamp' | 'iso' | 'string' | 'date'

const DEFAULT_DATE_VALUE_FORMAT: DatePickerValueFormat = 'timestamp'

export function getDateValueFormat(props: Record<string, unknown> | undefined): string {
  if (!props || typeof props !== 'object') {
    return DEFAULT_DATE_VALUE_FORMAT
  }
  const v = props.valueFormat
  if (typeof v === 'string' && ['timestamp', 'iso', 'string', 'date'].includes(v)) {
    return v
  }
  return DEFAULT_DATE_VALUE_FORMAT
}

/**
 * 规范化颜色值（移除 # 前缀并转为小写）
 */
export function normalizeColorValue(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value
  }
  return value.replace(/^#/, '').toLowerCase()
}

/**
 * 安全地将未知值转换为 Date 对象
 */
function toDate(x: unknown): Date | null {
  if (x instanceof Date && !isNaN(x.getTime())) {
    return x
  }
  if (typeof x === 'string' || typeof x === 'number') {
    const d = new Date(x)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * 规范化日期值
 * 按 valueFormat（timestamp / iso / string / date）进行转换
 */
export function normalizeDateValue(value: unknown, format: string): unknown {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const convert = (input: unknown): unknown => {
    if (input === null || input === undefined || input === '') {
      return null
    }
    try {
      if (format === 'timestamp') {
        if (typeof input === 'number' && isFinite(input) && input > 0) {
          return input
        }
        if (input instanceof Date && !isNaN(input.getTime())) {
          return input.getTime()
        }
        const parsedNumber = Number(input)
        if (!Number.isNaN(parsedNumber) && isFinite(parsedNumber) && parsedNumber > 0) {
          return parsedNumber
        }
        const d = toDate(input)
        if (d) {
          return d.getTime()
        }
      }

      if (format === 'iso' || format === 'string') {
        if (typeof input === 'string') {
          const testDate = new Date(input)
          return isNaN(testDate.getTime()) ? null : input
        }
        const date = input instanceof Date ? input : toDate(input)
        if (date) {
          return date.toISOString()
        }
        return null
      }

      if (input instanceof Date && !isNaN(input.getTime())) {
        return input
      }
      const date = toDate(input)
      return date ?? null
    } catch {
      return null
    }
  }

  if (Array.isArray(value)) {
    return value.map(convert).filter(v => v !== null)
  }

  return convert(value)
}

/**
 * 规范化表单值（处理特殊组件的值：DatePicker、ColorPicker）
 */
export function normalizeFormValues(
  values: Record<string, unknown>,
  columns: SchemaColumnsItem[]
): Record<string, unknown> {
  const normalized = deepClone(values)
  try {
    for (const column of columns) {
      const key = column.field
      const rawVal = normalized[key]
      if (column.component === 'ColorPicker') {
        normalized[key] = normalizeColorValue(rawVal)
      } else if (column.component === 'DatePicker') {
        const valueFormat = getDateValueFormat(column.props)
        normalized[key] = normalizeDateValue(rawVal, valueFormat)
      }
    }
  } catch {
    /* ignore normalization errors */
  }
  return normalized
}
