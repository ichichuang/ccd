// @/components/modules/schema-form/utils/emptyValues.ts
/**
 * 空值工具函数
 * @description 根据组件类型返回合适的空值
 */

import type { SchemaColumnsItem } from './types'

/**
 * 获取组件类型对应的空值
 * @param component - 组件类型
 * @returns 该组件类型的空值
 */
export function getEmptyValueForComponent(component: string): any {
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

    // 富文本编辑器
    case 'Editor':
      return ''

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
export function getEmptyValues(columns: SchemaColumnsItem[]): Record<string, any> {
  const emptyValues: Record<string, any> = {}

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
export function getResetValues(columns: SchemaColumnsItem[]): Record<string, any> {
  const resetValues: Record<string, any> = {}

  for (const column of columns) {
    // 🔥 关键：只处理有 defaultValue 的字段
    if (column.defaultValue !== undefined) {
      // 深度克隆 defaultValue，避免引用污染
      resetValues[column.field] =
        typeof structuredClone === 'function'
          ? structuredClone(column.defaultValue)
          : JSON.parse(JSON.stringify(column.defaultValue))
    }
    // 🔥 关键：没有 defaultValue 的字段不添加到 resetValues，让它们保持 undefined
  }

  return resetValues
}
