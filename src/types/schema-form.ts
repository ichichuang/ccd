/**
 * SchemaForm 终极类型契约 (Engine Ascension)
 *
 * 受控设计架构下的表单引擎核心类型定义。
 * - 强类型字段绑定 (keyof T)
 * - 声明式联动设计 (vIf / disabled / componentProps)
 * - 异步选项流（支持级联：(model) => Promise）
 *
 * @module schema-form
 */

// ==================== 组件类型 ====================

/**
 * PrimeVue 核心表单组件名（v4 API）
 */
export type FormSchemaComponentType =
  | 'AutoComplete'
  | 'CascadeSelect'
  | 'Checkbox'
  | 'ColorPicker'
  | 'DatePicker'
  | 'InputGroup'
  | 'InputMask'
  | 'InputNumber'
  | 'InputText'
  | 'Listbox'
  | 'MultiSelect'
  | 'Password'
  | 'RadioButton'
  | 'RadioButtonGroup'
  | 'Rating'
  | 'Select'
  | 'SelectButton'
  | 'Slider'
  | 'Textarea'
  | 'ToggleButton'
  | 'ToggleSwitch'
  | 'TreeSelect'
  | 'Slot'
  | 'Custom'

// ==================== 选项类型 ====================

/**
 * 选项项结构（用于 Select / RadioButton / MultiSelect 等）
 */
export interface FormOptionItem<TOptionValue = unknown> {
  label: string
  value: TOptionValue
  disabled?: boolean
  [key: string]: unknown
}

/**
 * 选项数据源：静态数组 或 异步加载函数（支持级联，接收 model）
 */
export type FormOptionsSource<T = Record<string, unknown>, TOptionValue = unknown> =
  | readonly FormOptionItem<TOptionValue>[]
  | ((model: T) => Promise<readonly FormOptionItem<TOptionValue>[]>)

// ==================== 声明式联动 ====================

/**
 * 条件禁用：静态布尔 或 基于模型的响应式计算
 */
export type FormDisabledLinkage<T> = boolean | ((model: T) => boolean)

/**
 * 组件属性：静态对象 或 基于模型的响应式计算
 */
export type FormComponentPropsLinkage<T> =
  | Record<string, unknown>
  | ((model: T) => Record<string, unknown>)

// ==================== 表单项 Schema ====================

/**
 * 表单项 Schema 配置（强类型，模型绑定）
 *
 * @template T - 表单数据模型类型
 */
export interface FormSchemaItem<T extends Record<string, unknown>> {
  /** 字段键名，必须为模型 T 的合法属性 */
  field: keyof T

  /** 组件类型 */
  component: FormSchemaComponentType

  /** 标签文本 */
  label: string

  /** 动态显隐：根据当前模型值决定是否渲染 */
  vIf?: (model: T) => boolean

  /** 禁用：静态 或 (model: T) => boolean */
  disabled?: FormDisabledLinkage<T>

  /** 组件属性：静态对象 或 (model: T) => Record<string, unknown> */
  componentProps?: FormComponentPropsLinkage<T>

  /** 选项：静态数组 或 (model: T) => Promise<...>（支持级联） */
  options?: FormOptionsSource<T>

  placeholder?: string
  defaultValue?: T[keyof T]
  help?: string
  dependsOn?: (keyof T)[]
  readonly?: boolean | ((model: T) => boolean)
  hidden?: boolean
  hideValue?: boolean
  hideBlock?: boolean
}

// ==================== 表单 Schema 顶层 ====================

/**
 * 表单 Schema 配置（强类型顶层）
 */
export interface FormSchema<T extends Record<string, unknown>> {
  columns: FormSchemaItem<T>[]
  gap?: number
  layout?: {
    cols?: number
    span?: number
    labelWidth?: string | number
    labelAlign?: 'left' | 'right' | 'top'
    labelPosition?: 'left' | 'right' | 'top' | 'bottom'
    showLabel?: boolean
  }
  steps?: Array<{ title: string; fields: (keyof T)[] }>
  sections?: Array<{ title: string; fields: (keyof T)[] }>
}
