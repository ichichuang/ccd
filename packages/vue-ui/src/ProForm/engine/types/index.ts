import type { Component, ComputedRef, Ref } from 'vue'
import type { BreakpointKey } from '@ccd/design-tokens'

export type FormLayoutMode = 'vertical' | 'horizontal'

export interface GridLayoutSchema {
  type: 'grid'
  /**
   * 间距，建议使用 CSS 变量，例如 'var(--spacing-md)'
   * @default 参考 PRO_FORM_DEFAULTS.gap
   */
  gap?: string
}

export type NodeLayoutSchema = GridLayoutSchema

export type FormFieldValue<TValues extends Record<string, unknown> = Record<string, unknown>> =
  | TValues[keyof TValues]
  | undefined

/**
 * 逻辑与计算相关的上下文类型
 */
export interface LogicContext<TValues extends Record<string, unknown> = Record<string, unknown>> {
  form: TValues
  field: string
}

export type LogicFunction<TValues extends Record<string, unknown> = Record<string, unknown>> = (
  ctx: LogicContext<TValues>
) => boolean

export type ComputedFunction<
  T,
  TValues extends Record<string, unknown> = Record<string, unknown>,
> = (ctx: LogicContext<TValues>) => T

/**
 * 下拉选项与异步加载
 */
export interface SelectOption {
  label: string
  value: unknown
}

export type OptionsLoader<TValues extends Record<string, unknown> = Record<string, unknown>> = (
  ctx: LogicContext<TValues>
) => Promise<SelectOption[]>

/**
 * 声明式跨字段联动引擎 (Reaction Engine) 类型
 */

/** Reaction 回调可访问的富上下文 */
export interface ReactionContext<
  TValues extends Record<string, unknown> = Record<string, unknown>,
> {
  /** 当前表单所有字段值的快照 */
  form: TValues
  /** 当前拥有 reactions 的字段名 */
  field: keyof TValues & string
  /** 读取任意字段的 FieldState */
  getFieldState: (name: string) => FieldState<FormFieldValue<TValues>> | undefined
  /** 设置任意字段的值（在同一事务内，不会触发额外调度） */
  setFieldValue: (name: string, value: unknown) => void
  /** 设置任意字段的 props（浅层合并） */
  setFieldProps: (name: string, props: Record<string, unknown>) => void
}

/** 内置原子动作枚举 */
export type ReactionAction = 'clearValue' | 'hide' | 'show' | 'disable' | 'enable' | 'custom'

/** 声明式联动规则 */
export interface FieldReaction<TValues extends Record<string, unknown> = Record<string, unknown>> {
  /** 监听的上游字段名（必须已声明在 deps 中） */
  watch: (keyof TValues & string) | (keyof TValues & string)[]
  /** 内置动作或 'custom' */
  action: ReactionAction
  /**
   * 当 action 为 'custom' 时执行的自定义副作用。
   * 也可与内置 action 组合：先执行内置动作，再执行 effect。
   */
  effect?: (ctx: ReactionContext<TValues>) => void | Promise<void>
}

/**
 * 表单 Schema 定义
 */
export interface ValidationRule {
  message: string
  validator: (value: unknown) => boolean | Promise<boolean>
}

export interface FieldSchema<TValue = unknown> {
  name: string
  component: string
  label?: string
  /** 声明式必填，用于 UI 显示红色星号，与 rules 校验互补 */
  required?: boolean
  /** 字段说明/提示文案，显示在输入框下方（无错误时） */
  description?: string
  defaultValue?: TValue
  /** Transform the value before it gets submitted (Serialize) */
  transform?: (value: TValue, formValues: Record<string, unknown>) => unknown
  props?: Record<string, unknown>
  rules?: ValidationRule[]
  deps?: string[]
  visibleIf?: LogicFunction
  disabledIf?: LogicFunction
  requiredIf?: LogicFunction
  computed?: ComputedFunction<TValue>
  options?: SelectOption[] | OptionsLoader
  /**
   * 声明式跨字段联动规则。当 deps 中声明的上游字段值变化时，
   * 引擎按数组顺序执行匹配的 reaction（在 recomputeFields 管线中，
   * 于 visibleIf/disabledIf/requiredIf 之后、OptionsLoader 之前执行）。
   */
  reactions?: FieldReaction[]
  /**
   * 网格布局中占用的列数（12 栅格制），仅用于渲染层布局，不参与业务逻辑
   * @default 参考 PRO_FORM_DEFAULTS.gridSpan
   */
  span?: ResponsiveSpan
  /**
   * 字段级布局扩展（用于承接历史 schema 的 layout.span 写法）
   */
  layout?: {
    span?: ResponsiveSpan
  }
}

export interface GroupSchema {
  type: 'group' | 'section' | 'card' | 'collapse' | 'tabs' | 'step'
  /** 规范化阶段可为分组生成内部 name，便于作为稳定 key 使用 */
  name?: string
  label?: string
  layout?: NodeLayoutSchema & {
    /**
     * 分组级别的默认 span 配置（可被子字段覆盖）
     */
    span?: ResponsiveSpan
  }
  children: FormSchemaNode[]
}

export type FormSchemaNode = FieldSchema | GroupSchema

export interface FormSchema {
  fields: FormSchemaNode[]
  layout?: NodeLayoutSchema
}
/**
 * 字段与表单状态类型
 */
export interface FieldState<T = unknown> {
  value: T
  initialValue: T
  /** 由 Engine 统一计算：字段是否可见（visibleIf + 默认 true） */
  visible: boolean
  /** 由 Engine 统一计算：字段是否禁用（disabledIf + 默认 false） */
  disabled: boolean
  /** 由 Engine 统一计算：字段是否必填（required/requiredIf + 默认 false） */
  required: boolean
  /** 异步选项或其他异步逻辑是否加载中 */
  loadingOptions?: boolean
  /**
   * 异步加载完成后的选项数据（避免写入 Schema 产生 Ghost State）
   * Select/MultiSelect 等组件可优先消费该值。
   */
  loadedOptions?: unknown[]
  /** 异步选项加载失败时的错误信息 */
  optionsError?: string
  /** 运行时动态 props 覆盖（由 setFieldProps/reaction engine 写入） */
  dynamicProps?: Record<string, unknown>
  touched: boolean
  dirty: boolean
  valid: boolean
  validating: boolean
  errors: string[]
}

export interface FormState<TValues extends Record<string, unknown> = Record<string, unknown>> {
  values: TValues
  errors: Partial<Record<keyof TValues, string[]>>
  touched: Partial<Record<keyof TValues, boolean>>
  dirty: boolean
  valid: boolean
  submitting: boolean
  /** 上一次提交的错误（网络失败、后端校验等），提交成功后自动清除 */
  submitError?: Error | null
}

/**
 * 字段与表单上下文（Engine 层抽象，不依赖具体 UI）
 */
export interface FieldContext<T = unknown> {
  name: string
  state: FieldState<T>
  setValue: (value: T) => void
  validate: () => Promise<void>
  reset: () => void
}

export interface FormContext<TValues extends Record<string, unknown> = Record<string, unknown>> {
  state: FormState<TValues>
  setValue<K extends keyof TValues>(field: K, value: TValues[K]): void
  setFieldsValue(values: Partial<TValues>): void
  resetFields(names?: (keyof TValues)[]): void
  clearValidate(names?: (keyof TValues)[]): void
  setFieldProps(name: string, props: Record<string, unknown>): void
  setValidateOn(validateOn?: 'change' | 'blur' | 'submit'): void
  validate(): Promise<boolean>
  submit(): Promise<void>
  reset(): Promise<void> | void
}

/**
 * 验证相关类型
 */
export interface ValidationResult {
  valid: boolean
  errors: Record<string, string[]>
}

export type ValidationResolver<TValues extends Record<string, unknown> = Record<string, unknown>> =
  (values: TValues) => Promise<ValidationResult>

/**
 * Hook 层类型定义（仅类型约束，具体实现位于 engine/hooks）
 */
export interface UseFormOptions<TValues extends Record<string, unknown> = Record<string, unknown>> {
  schema: FormSchema
  initialValues?: Partial<TValues>
  resolver?: ValidationResolver<TValues>
  validateOn?: 'change' | 'blur' | 'submit'
  persistKey?: string
  autoSave?: boolean
}

export interface UseFormReturn<TValues extends Record<string, unknown> = Record<string, unknown>> {
  form: FormContext<TValues>
  handleSubmit: (fn: (values: TValues) => void | Promise<void>) => (e?: Event) => Promise<void>
  getValues: () => TValues
  getFormState: () => FormState<TValues>
  updateSchema: (schema: FormSchema) => void
  /**
   * 释放当前表单实例持有的资源（定时器等），通常在组件卸载时调用
   */
  teardown: () => void
}

export interface ProFormProps<TValues extends Record<string, unknown> = Record<string, unknown>> {
  schema: FormSchema
  initialValues?: Partial<TValues>
  validateOn?: 'change' | 'blur' | 'submit'
  resolver?: ValidationResolver<TValues>
  disabled?: boolean
  readonly?: boolean
  /**
   * 表单布局模式
   * @default 参考 PRO_FORM_DEFAULTS.layout
   */
  layout?: FormLayoutMode
  persistKey?: string
  autoSave?: boolean
  /**
   * 标签宽度，推荐使用 CSS 变量字符串，例如 'var(--spacing-3xl)'
   * 传入 number 时不会在样式中直接使用，避免 px/rem 魔法数
   */
  labelWidth?: string | number
  /**
   * 表单主轴间距，推荐使用 CSS 变量字符串，例如 'var(--spacing-md)'
   * @default 参考 PRO_FORM_DEFAULTS.gap
   */
  gap?: string
  /**
   * 标签对齐方式，仅在 horizontal 布局下生效
   * @default 参考 PRO_FORM_DEFAULTS.labelAlign
   */
  labelAlign?: 'left' | 'center' | 'right'
}

/**
 * 响应式 span 定义：
 * - number: 固定列数
 * - Record<BreakpointKey, number>: 不同断点下的列数
 */
export type ResponsiveSpan = number | Partial<Record<BreakpointKey, number>>

export interface UseFieldReturn<T> {
  value: Ref<T>
  state: FieldState<T>
  setValue: (v: T) => void
  validate: () => Promise<void>
}

export interface FieldArrayItem<TValue = unknown> {
  id: string
  value: TValue
  index: number
}

export interface FieldArrayReturn<TValue = unknown> {
  fields: ComputedRef<FieldArrayItem<TValue>[]>
  append: (value: TValue) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
}

/**
 * ProForm 组件 expose 类型
 * 通过 ref 访问 ProForm 实例时使用
 */
export interface ProFormExpose<TValues extends Record<string, unknown> = Record<string, unknown>> {
  form: FormContext<TValues>
  submit: () => Promise<void>
  validate: () => Promise<boolean>
  getValues: () => TValues
  getFormState: () => FormState<TValues>
}

/**
 * 渲染层与注册表相关的公共类型
 */
export interface FieldComponentProps<T = unknown> {
  modelValue: T
  disabled?: boolean
  readonly?: boolean
  error?: string[]
  /** 异步加载状态（例如 Select 的 optionsLoader） */
  loading?: boolean
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'onUpdate:modelValue': (v: T) => void
}

export type FieldComponent<T = unknown> = Component<FieldComponentProps<T>>

/**
 * 字段注册表条目：
 * - component: 实际渲染组件（通常是 PrimeVue 包装组件）
 * - defaultProps: 该字段类型的默认 UI 配置
 * - propsMapper: 将标准 FieldComponentProps + FieldSchema 映射为组件特定 props
 */
export interface FieldRegistryItem<TValue = unknown> {
  component: FieldComponent<TValue>
  defaultProps?: Record<string, unknown>
  propsMapper?: (params: {
    field: FieldSchema<TValue>
    componentProps: FieldComponentProps<TValue>
  }) => Record<string, unknown>
}

export interface ProFormPluginContext {
  /** Register a custom field component with its metadata */
  registerField: (name: string, item: FieldRegistryItem) => void
  // Future proofing:
  // registerValidator: (name: string, validator: Function) => void;
}

export interface ProFormPlugin {
  name: string
  install: (ctx: ProFormPluginContext) => void
}

export type TypedFieldSchema<
  TValues extends Record<string, unknown>,
  K extends keyof TValues & string,
> = Omit<
  FieldSchema<TValues[K]>,
  'name' | 'computed' | 'visibleIf' | 'disabledIf' | 'requiredIf' | 'reactions'
> & {
  name: K
  computed?: ComputedFunction<TValues[K], TValues>
  visibleIf?: LogicFunction<TValues>
  disabledIf?: LogicFunction<TValues>
  requiredIf?: LogicFunction<TValues>
  reactions?: FieldReaction<TValues>[]
}

export type TypedFormSchemaNode<TValues extends Record<string, unknown>> =
  | {
      [K in keyof TValues & string]: TypedFieldSchema<TValues, K>
    }[keyof TValues & string]
  | (Omit<GroupSchema, 'children'> & { children: TypedFormSchemaNode<TValues>[] })

export interface TypedFormSchema<TValues extends Record<string, unknown>> extends Omit<
  FormSchema,
  'fields'
> {
  fields: TypedFormSchemaNode<TValues>[]
}

/**
 * 编译期 schema 收敛辅助函数（运行时零开销）
 */
export function defineFormSchema<TValues extends Record<string, unknown>>(
  schema: TypedFormSchema<TValues>
): TypedFormSchema<TValues> {
  return schema
}
