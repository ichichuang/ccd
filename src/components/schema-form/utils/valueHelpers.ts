// @/components/schema-form/utils/valueHelpers.ts
/**
 * 表单值处理工具函数
 */

import type { FormValues } from './types'

/**
 * 判断值是否为空（用于过滤表单值）
 * @param value - 要判断的值
 * @returns 如果值为空返回 true，否则返回 false
 * @description 空值定义：
 * - null 或 undefined
 * - 空字符串 ''
 * - 空数组 []
 * - 空对象 {}
 * - 数字 0（不算空值）
 * - 布尔值 false（不算空值）
 */
export function isEmptyValue(value: any): boolean {
  // null 或 undefined
  if (value === null || value === undefined) {
    return true
  }

  // 空字符串
  if (typeof value === 'string' && value === '') {
    return true
  }

  // 空数组
  if (Array.isArray(value) && value.length === 0) {
    return true
  }

  // 空对象（但不包括 Date 等特殊对象）
  if (typeof value === 'object' && !(value instanceof Date) && Object.keys(value).length === 0) {
    return true
  }

  // 其他值（包括 0、false 等）不算空值
  return false
}

/**
 * 过滤掉空值字段
 * @param values - 原始值对象
 * @returns 过滤后的值对象（只包含非空字段）
 */
export function filterEmptyValues(values: FormValues): FormValues {
  const filtered: FormValues = {}

  for (const key in values) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      const value = values[key]
      if (!isEmptyValue(value)) {
        filtered[key] = value
      }
    }
  }

  return filtered
}
