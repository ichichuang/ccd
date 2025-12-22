// @/components/schema-form/components/utils/buildComponentProps.ts
/**
 * 构建组件 Props 的工具函数
 */

import type { SchemaColumnsItem, StyleConfig } from '../../utils/types'

export interface BuildComponentPropsOptions {
  column: SchemaColumnsItem
  baseProps: Record<string, any>
  safeProps: Record<string, any>
  mergedColumnStyle: { value: StyleConfig }
  componentStyle: { value: Record<string, string> }
  options?: any[]
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
}: BuildComponentPropsOptions): Record<string, any> {
  // 合并基础 props 和安全 props
  const componentProps: Record<string, any> = {
    ...baseProps,
    ...safeProps,
    name: column.field, // PrimeVue Form 使用 name 属性绑定字段
    class: [
      ...(Array.isArray(baseProps.class) ? baseProps.class : [baseProps.class]),
      mergedColumnStyle.value.contentClass || '',
    ].filter(Boolean),
    style: {
      ...baseProps.style,
      ...(mergedColumnStyle.value.contentStyle || {}),
    },
  }

  // 如果组件需要 options，添加 options 属性
  if (options !== undefined) {
    componentProps.options = options
  }

  // 为特定组件设置默认的 optionLabel 和 optionValue
  const componentsWithOptions = [
    'Select',
    'MultiSelect',
    'Listbox',
    'SelectButton',
    'CascadeSelect',
  ]
  if (componentsWithOptions.includes(column.component)) {
    if (componentProps.optionLabel === undefined) {
      componentProps.optionLabel = 'label'
    }
    if (componentProps.optionValue === undefined) {
      componentProps.optionValue = 'value'
    }
  }

  // CascadeSelect 需要额外的配置
  if (column.component === 'CascadeSelect') {
    if (componentProps.optionGroupLabel === undefined) {
      componentProps.optionGroupLabel = 'label'
    }
    if (componentProps.optionGroupChildren === undefined) {
      componentProps.optionGroupChildren = 'children'
    }
  }

  return componentProps
}
