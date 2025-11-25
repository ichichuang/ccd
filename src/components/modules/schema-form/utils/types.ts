// @/components/schema-form/utils/types.ts
/**
 * Schema 类型定义 —— 供 SchemaForm 全模块共享
 *
 * 目标：严格且贴近 PrimeVue API（v4+），对 schema 有 TS 推断提示。
 */

import type * as yup from 'yup'

// ==================== 基础类型 ====================

/** 组件类型 */
export type ComponentType =
  | 'AutoComplete' // 自动完成输入组件
  | 'CascadeSelect' // 从选项的嵌套结构中选择值
  | 'Checkbox' // 复选框组件
  | 'ColorPicker' // 颜色选择器组件
  | 'DatePicker' // 日期选择器组件
  | 'Editor' // 富文本编辑器组件
  | 'InputGroup' // 输入组组件
  | 'InputMask' // 输入掩码组件
  | 'InputNumber' // 数字输入组件
  | 'InputText' // 文本输入组件
  | 'Listbox' // 列表框组件
  | 'MultiSelect' // 多选组件
  | 'Password' // 密码输入组件
  | 'RadioButton' // 单选按钮组件
  | 'Rating' // 评分组件
  | 'Select' // 下拉选择组件
  | 'SelectButton' // 选择按钮组件
  | 'Slider' // 滑块组件
  | 'Textarea' // 文本区域组件
  | 'ToggleButton' // 切换按钮组件
  | 'ToggleSwitch' // 切换开关组件
  | 'TreeSelect' // 树形选择组件
  | 'Custom' // 自定义渲染组件

// ==================== 布局配置 ====================

/** 布局配置 */
export interface LayoutConfig {
  /** 表单项栅格列数 */
  cols?: number
  /** 表单项标签对齐方式（内容左侧 | 内容右侧 | 内容顶部） */
  labelAlign?: 'left' | 'right' | 'top'
  /** 表单项标签位置 */
  labelPosition?:
    | 'left' // 中间靠左
    | 'right' // 中间靠右
    | 'top' // 中间靠上
    | 'bottom' // 中间靠下
    | 'left-top' // 左上角
    | 'right-top' // 右上角
    | 'left-bottom' // 左下角
    | 'right-bottom' // 右下角
  /** 标签宽度（10px | 10% | 10vh | 100） */
  labelWidth?: string | number
  /** 是否显示标签 */
  showLabel?: boolean
}

// ==================== 样式配置 ====================

/** 样式配置 */
export interface StyleConfig {
  /** 自定义 label class */
  labelClass?: string
  /** 自定义内容 class */
  contentClass?: string
  /** 自定义 label 样式 */
  labelStyle?: Record<string, string>
  /** 自定义内容样式 */
  contentStyle?: Record<string, string>
}

// ==================== 验证规则 ====================

/** 支持的规则类型：字符串规则、Yup Schema、函数式 async 校验 */
export type RuleString = string // 'required|min:3'
export type RuleFn = (value: any, ctx: EvalCtx) => true | string | Promise<true | string>
export type RuleYup = yup.AnySchema
export type Rule = RuleString | RuleFn | RuleYup | Array<RuleString | RuleFn | RuleYup>

// ==================== 数据转换 ====================

/** 数据转换配置 */
export interface TransformConfig {
  /** 输入转换 */
  input?: (value: any, ctx: EvalCtx) => any
  /** 输出转换 */
  output?: (value: any, ctx: EvalCtx) => any
}

// ==================== 表单项 Schema ====================

/** 选项项 */
export interface OptionItem<T = any> {
  label: string
  value: T
  disabled?: boolean
  [k: string]: any
}

/** 表单项 SchemaColumnsItem 配置 */
export interface SchemaColumnsItem {
  /** 索引（字段名） */
  field: string
  /** 标签文本 */
  label?: string
  /** 组件类型 */
  component: ComponentType
  /** 占位符（提示文本） */
  placeholder?: string
  /** 默认值（初始值，点击重置按钮时 赋值给表单项） */
  defaultValue?: any
  /** 验证规则 */
  rules?: Rule
  /** 依赖字段 */
  dependsOn?: string[]
  /** 是否可见（支持函数式） */
  visible?: boolean | string | ((ctx: EvalCtx) => boolean | Promise<boolean>)
  /** 是否禁用（支持函数式） */
  disabled?: boolean | string | ((ctx: EvalCtx) => boolean | Promise<boolean>)
  /** 是否只读（支持函数式） */
  readonly?: boolean | string | ((ctx: EvalCtx) => boolean | Promise<boolean>)
  /** 帮助文本（提示文本，显示在表单项下方） */
  help?: string
  /** 组件属性（其他属性、独有属性） */
  props?: Record<string, any>
  /** 数据转换（输入转换 | 输出转换） */
  transform?: TransformConfig
  /** 布局配置（覆盖全局配置） */
  layout?: LayoutConfig
  /** 样式配置（覆盖全局配置） */
  style?: StyleConfig
  /* 表单项是否隐藏（默认 false） */
  hidden?: boolean
  /* 表单项隐藏后，是否可以获取到值（默认 false） */
  hideValue?: boolean
  /* 表单项隐藏后，是否保留原来的栅格位置（默认 false） */
  hideBlock?: boolean
}

// ==================== 步骤和分组配置 ====================

/** 步骤配置 */
export interface StepConfig {
  title: string
  fields: string[]
}

/** 分组配置 */
export interface SectionConfig {
  title: string
  fields: string[]
}

// ==================== Schema 配置 ====================

/** Schema 配置 */
export interface Schema {
  /** 渲染数据源（表单项列表） */
  columns: SchemaColumnsItem[]
  /** 布局配置（全局布局配置） */
  layout?: LayoutConfig
  /** 样式配置（全局样式配置） */
  style?: StyleConfig
  /** 步骤配置 */
  steps?: StepConfig[]
  /** 分组配置 */
  sections?: SectionConfig[]
  /** 表单项栅格间距 */
  gap?: number
  gapX?: number
  gapY?: number
}

// ==================== 上下文类型 ====================

/** 评估上下文 */
export interface EvalCtx {
  values: Record<string, any>
  column: SchemaColumnsItem
}

/** 字段渲染上下文 */
export interface FieldRenderCtx extends EvalCtx {
  setValue: (v: any) => void
}

// ==================== 组件 Props ====================

/** SchemaForm 组件 Props */
export interface SchemaFormProps {
  /** 表单 Schema */
  schema: Schema
  /** 表单数据 */
  modelValue?: Record<string, any>
  /** 持久化配置 */
  persist?: PersistConfig | false
  /** 选项缓存时间(ms) */
  optionsCacheTTL?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 提交转换 */
  submitTransform?: (values: any) => any
  /** 是否开启内容记忆（IndexedDB 存储，layout 仅保存指针） */
  remember?: boolean
}

/** 持久化配置 */
export interface PersistConfig {
  /** 存储键名 */
  key: string
  /** 过期时间(ms) */
  ttl?: number
}

// ==================== 表单事件 ====================

/** SchemaForm 组件事件 */
export interface SchemaFormEmits {
  /** 更新模型值 */
  updateModelValue: [value: Record<string, any>]
  /** 提交成功 */
  submit: [values: Record<string, any>]
  /** 验证错误 */
  error: [payload: { errors: Record<string, string> }]
}

// ==================== 验证结果 ====================

/** 验证错误 */
export interface ValidationError {
  message: string
}

/** 验证结果 */
export interface ValidationResult {
  values: Record<string, any>
  errors: Record<string, ValidationError[]>
}

// ==================== 缓存类型 ====================

/** 缓存项 */
export interface CacheItem<T = any> {
  expires: number
  data: T
}

// ==================== 工具类型 ====================

/** 深度部分可选 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 排除指定键 */
export type ExcludeKeys<T, K extends keyof T> = Omit<T, K>

/** 只包含指定键 */
export type PickKeys<T, K extends keyof T> = Pick<T, K>

// ==================== 使用示例 ====================

/**
 * 样式配置使用示例：
 *
 * // 全局样式配置
 * const schema: Schema = {
 *   columns: [...],
 *   layout: { cols: 2, gap: 16 },
 *   style: {
 *     labelClass: 'text-blue-500 font-bold',
 *     contentClass: 'border-2 border-gray-300',
 *     labelStyle: { fontSize: '14px' },
 *     contentStyle: { padding: '8px' }
 *   }
 * }
 *
 * // 表单项单独样式配置（优先级更高）
 * const column: SchemaColumnsItem = {
 *   field: 'username',
 *   component: 'InputText',
 *   label: '用户名',
 *   style: {
 *     labelClass: 'text-red-500', // 覆盖全局配置
 *     contentStyle: { borderColor: 'red' } // 覆盖全局配置
 *   }
 * }
 *
 * 优先级：表单项样式 > 全局样式 > 默认样式
 */
