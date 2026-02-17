// @/components/SchemaForm/utils/emptyValues.ts
/**
 * 空值工具函数
 * @description 根据组件类型返回合适的空值
 */

import { deepClone } from '@/utils/lodashes'
import type { SchemaColumnsItem } from './types'

/**
 * 获取组件类型对应的空值
 * @param component - 组件类型
 * @returns 该组件类型的空值
 */
export function getEmptyValueForComponent(component: string): unknown {
  switch (component) {
    // 文本输入类
    case 'InputText':
    case 'Textarea':
    case 'Password':
    case 'InputMask':
    case 'InputGroup':
      return ''

    // 数字输入
    case 'InputNumber':
    case 'Slider':
      return null

    // 选择类
    case 'Select':
    case 'CascadeSelect':
    case 'TreeSelect':
    case 'AutoComplete':
      return null

    // 多选类
    case 'MultiSelect':
    case 'Listbox':
      return []

    // 日期时间类
    case 'DatePicker':
      return null

    // 颜色选择
    case 'ColorPicker':
      return ''

    // 开关类
    case 'ToggleSwitch':
    case 'ToggleButton':
      return false

    // 复选框
    case 'Checkbox':
      return false

    // 单选按钮
    case 'RadioButton':
      return null

    // 选择按钮
    case 'SelectButton':
      return null

    // 评分
    case 'Rating':
      return 0

    // 默认
    default:
      return null
  }
}

/**
 * 获取表单所有字段的空值
 * @param columns - Schema 列配置
 * @returns 空值对象
 */
export function getEmptyValues(columns: SchemaColumnsItem[]): Record<string, unknown> {
  const emptyValues: Record<string, unknown> = {}

  for (const column of columns) {
    emptyValues[column.field] = getEmptyValueForComponent(column.component)
  }

  return emptyValues
}

/**
 * 获取表单所有字段的重置值（恢复 defaultValue）
 * @param columns - Schema 列配置
 * @returns 重置值对象（只包含有 defaultValue 的字段）
 * @description 🔥 关键：只返回有 defaultValue 的字段，没有 defaultValue 的字段不返回
 * @description 这样重置后只恢复有默认值的字段，其他字段保持清空状态
 */
export function getResetValues(columns: SchemaColumnsItem[]): Record<string, unknown> {
  const resetValues: Record<string, unknown> = {}

  for (const column of columns) {
    // 🔥 关键：只处理有 defaultValue 的字段
    if (column.defaultValue !== undefined) {
      // 深度克隆 defaultValue，避免引用污染
      // 优先使用 structuredClone，如果失败（例如 Proxy 对象）则使用 cloneDeep 作为后备
      try {
        resetValues[column.field] =
          typeof structuredClone === 'function'
            ? structuredClone(column.defaultValue)
            : deepClone(column.defaultValue)
      } catch (_error) {
        // 如果 structuredClone 失败（例如 Proxy 对象），使用 cloneDeep
        resetValues[column.field] = deepClone(column.defaultValue)
      }
    }
    // 🔥 关键：没有 defaultValue 的字段不添加到 resetValues，让它们保持 undefined
  }

  return resetValues
}
