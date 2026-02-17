// @/components/SchemaForm/components/utils/buildComponentProps.ts
/**
 * 构建组件 Props 的工具函数
 */

import type { SchemaColumnsItem, StyleConfig } from '../../utils/types'

/** 需要 optionLabel / optionValue 默认值的组件列表 */
export const COMPONENTS_WITH_OPTIONS = [
  'Select',
  'MultiSelect',
  'Listbox',
  'SelectButton',
  'CascadeSelect',
] as const

/** CascadeSelect 默认分组字段名 */
export const CASCADE_SELECT_DEFAULT_OPTION_GROUP_LABEL = 'label'
/** CascadeSelect 默认子节点字段名 */
export const CASCADE_SELECT_DEFAULT_OPTION_GROUP_CHILDREN = 'children'
/** TreeSelect 默认选择模式（single 避免 checkbox 导致的 undefined key） */
export const TREE_SELECT_DEFAULT_SELECTION_MODE = 'single'
/** 选项列表默认 label 字段名（与 OptionItem 一致） */
export const DEFAULT_OPTION_LABEL = 'label'
/** 选项列表默认 value 字段名（与 OptionItem 一致） */
export const DEFAULT_OPTION_VALUE = 'value'

export interface BuildComponentPropsOptions {
  column: SchemaColumnsItem
  baseProps: Record<string, unknown>
  safeProps: Record<string, unknown>
  mergedColumnStyle: { value: StyleConfig }
  componentStyle: { value: Record<string, string> }
  options?: unknown[]
}

/**
 * 构建组件 Props
 */
export function buildComponentProps({
  column,
  baseProps,
  safeProps,
  mergedColumnStyle,
  componentStyle: _componentStyle,
  options,
}: BuildComponentPropsOptions): Record<string, unknown> {
  const rawClass = baseProps.class
  const baseClass = Array.isArray(rawClass)
    ? rawClass
    : rawClass != null && rawClass !== ''
      ? [rawClass]
      : []
  const baseStyle =
    baseProps.style && typeof baseProps.style === 'object'
      ? (baseProps.style as Record<string, unknown>)
      : {}

  // 合并基础 props 和安全 props
  const componentProps: Record<string, unknown> = {
    ...baseProps,
    ...safeProps,
    name: column.field, // PrimeVue Form 使用 name 属性绑定字段
    class: [...baseClass, mergedColumnStyle.value.contentClass || ''].filter(Boolean),
    style: {
      ...baseStyle,
      ...(mergedColumnStyle.value.contentStyle || {}),
    },
  }

  // 如果组件需要 options，添加 options 属性
  if (options !== undefined) {
    componentProps.options = options
  }

  // 为特定组件设置默认的 optionLabel 和 optionValue
  if (COMPONENTS_WITH_OPTIONS.includes(column.component)) {
    if (componentProps.optionLabel === undefined) {
      componentProps.optionLabel = DEFAULT_OPTION_LABEL
    }
    if (componentProps.optionValue === undefined) {
      componentProps.optionValue = DEFAULT_OPTION_VALUE
    }
  }

  // CascadeSelect 需要额外的配置
  if (column.component === 'CascadeSelect') {
    if (componentProps.optionGroupLabel === undefined) {
      componentProps.optionGroupLabel = CASCADE_SELECT_DEFAULT_OPTION_GROUP_LABEL
    }
    if (componentProps.optionGroupChildren === undefined) {
      componentProps.optionGroupChildren = CASCADE_SELECT_DEFAULT_OPTION_GROUP_CHILDREN
    }
  }

  // TreeSelect 默认 single 选择模式，避免 checkbox 模式导致的 undefined key 问题
  if (column.component === 'TreeSelect') {
    if (componentProps.selectionMode === undefined) {
      componentProps.selectionMode = TREE_SELECT_DEFAULT_SELECTION_MODE
    }
  }

  return componentProps
}
