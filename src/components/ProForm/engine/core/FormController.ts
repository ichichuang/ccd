import { SubscriptionStore } from '../state/SubscriptionStore'
import { DependencyGraph } from '../dependency/DependencyGraph'
import { Scheduler } from '../dependency/Scheduler'
import { TransactionManager } from './TransactionManager'
import { ValidationEngine } from '../validation/ValidationEngine'
import { VisibilityEngine } from '../logic/VisibilityEngine'
import { DisableEngine } from '../logic/DisableEngine'
import { RequiredEngine } from '../logic/RequiredEngine'
import { ComputedEngine } from '../logic/ComputedEngine'
import { SchemaNormalizer } from '../schema/SchemaNormalizer'
import { LifecycleManager } from './LifecycleManager'
import { DraftStorage } from '../persistence/DraftStorage'
import type {
  FieldSchema,
  FormSchema,
  FormSchemaNode,
  FormState,
  FieldState,
  ValidationResolver,
  UseFormOptions,
  OptionsLoader,
  SelectOption,
} from '../types'
import type { LifecycleController } from './LifecycleManager'

type ValuesRecord = Record<string, unknown>

/**
 * 单个表单实例的核心控制器，聚合 Engine 子模块：
 * - SubscriptionStore：字段状态与订阅
 * - DependencyGraph：字段依赖关系
 * - Scheduler：基于 DAG 的更新调度
 * - TransactionManager：批量更新事务
 */
export class FormController<TValues extends ValuesRecord = ValuesRecord> {
  readonly schema: FormSchema
  readonly store: SubscriptionStore<TValues>
  readonly graph: DependencyGraph
  readonly scheduler: Scheduler
  readonly transactionManager: TransactionManager
  readonly validationEngine: ValidationEngine<TValues>
  readonly fieldNames: (keyof TValues & string)[]
  readonly validateOn?: 'change' | 'blur' | 'submit'
  private readonly options: UseFormOptions<TValues>
  private readonly lifecycle: LifecycleManager<TValues>
  private readonly visibilityEngine: VisibilityEngine<TValues>
  private readonly disableEngine: DisableEngine<TValues>
  private readonly requiredEngine: RequiredEngine<TValues>
  private readonly computedEngine: ComputedEngine<TValues>
  private readonly optionsRequestToken = new Map<string, number>()
  private readonly optionsDebounceTimers = new Map<string, number>()
  private nextOptionsRequestId = 0
  private saveDraftTimer: number | null = null
  public submitCallback?: (values: Record<string, unknown>) => Promise<void> | void

  constructor(options: UseFormOptions<TValues>) {
    this.options = options
    this.schema = SchemaNormalizer.normalize(options.schema) as FormSchema

    // 持久化草稿恢复：draft 覆盖 initialValues（必须在 SubscriptionStore 初始化之前完成）
    const baseInitialValues = (options.initialValues ?? {}) as Partial<TValues>
    const draft =
      options.persistKey && options.persistKey.length > 0
        ? DraftStorage.load(options.persistKey)
        : null
    const effectiveInitialValues = {
      ...baseInitialValues,
      ...(draft ?? {}),
    } as Partial<TValues>

    this.store = new SubscriptionStore<TValues>()
    this.graph = new DependencyGraph()
    this.scheduler = new Scheduler(this.graph)
    this.transactionManager = new TransactionManager(this.scheduler)
    this.fieldNames = []
    this.validateOn = options.validateOn
    this.visibilityEngine = new VisibilityEngine<TValues>()
    this.disableEngine = new DisableEngine<TValues>()
    this.requiredEngine = new RequiredEngine<TValues>()
    this.computedEngine = new ComputedEngine<TValues>()
    this.lifecycle = new LifecycleManager<TValues>(this as unknown as LifecycleController<TValues>)

    const flatFields: FieldSchema[] = []
    this.collectFields(this.schema.fields, flatFields)
    this.fieldNames = flatFields.map(field => field.name as keyof TValues & string)

    // 构建依赖图
    flatFields.forEach(field => {
      this.graph.addNode(field.name)
      if (field.deps && field.deps.length > 0) {
        field.deps.forEach(dep => {
          this.graph.addDependency(dep, field.name)
        })
      }
    })

    // 初始化字段状态（initialValues 优先，其次 schema.defaultValue）
    const initialValues = effectiveInitialValues ?? {}

    flatFields.forEach(field => {
      const fieldName = field.name as keyof TValues & string
      const hasInitial =
        Object.prototype.hasOwnProperty.call(initialValues, fieldName) &&
        (initialValues as ValuesRecord)[fieldName] !== undefined
      const value = (
        hasInitial
          ? (initialValues as ValuesRecord)[fieldName]
          : (field as FieldSchema<unknown>).defaultValue
      ) as TValues[keyof TValues] | undefined

      const initialState: FieldState<unknown> = {
        value,
        initialValue: value,
        visible: true,
        disabled: false,
        required: field.required === true,
        loadingOptions: false,
        touched: false,
        dirty: false,
        valid: true,
        validating: false,
        errors: [],
      }

      this.store.setFieldState(fieldName, initialState)
    })

    this.validationEngine = new ValidationEngine<TValues>(this.store, this.graph, this.schema, () =>
      this.getValues()
    )
  }

  /**
   * 按调度器给出的拓扑顺序，重算字段逻辑并写回 Store：
   * - computed：写回 value（同一 flush 内可影响后续字段的逻辑计算）
   * - visibleIf / disabledIf / requiredIf：写回 FieldState.visible/disabled/required
   *
   * 注意：本方法应由 TransactionManager.commit 在 flush 阶段统一调用，
   * 渲染层仅消费 Store 的 FieldState。
   */
  recomputeFields(orderedFields: string[]): void {
    if (!orderedFields || orderedFields.length === 0) return

    for (const fieldName of orderedFields) {
      const schema = this.findFieldSchema(fieldName)
      if (!schema) continue

      const ensureBaseState = (): FieldState<unknown> => {
        const existing = this.store.getFieldState(fieldName) as FieldState<unknown> | undefined
        if (existing) return existing

        const value = this.store.getFieldValue(fieldName)
        const base: FieldState<unknown> = {
          value,
          initialValue: value,
          visible: true,
          disabled: false,
          required: schema.required === true,
          touched: false,
          dirty: false,
          valid: true,
          validating: false,
          errors: [],
        }
        this.store.setFieldState(fieldName, base)
        return base
      }

      // 1) computed：先写回 value，确保后续逻辑读取到最新 values
      if (schema.computed) {
        const computedValue = this.computedEngine.evaluate(schema, this.getValues(), fieldName)
        this.store.setFieldValue(fieldName, computedValue as TValues[keyof TValues])
      } else {
        // 保证字段至少有一个 state（即使 value 为 undefined）
        ensureBaseState()
      }

      // 2) 逻辑字段：统一基于 controller.getValues() 作为上下文，由原子引擎负责计算
      const values = this.getValues()

      const visible = this.visibilityEngine.evaluate(schema, values, fieldName)
      const disabled = this.disableEngine.evaluate(schema, values, fieldName)
      const required = this.requiredEngine.evaluate(schema, values, fieldName)

      const latest = ensureBaseState()
      this.store.setFieldState(fieldName, {
        ...latest,
        visible,
        disabled,
        required,
      })

      // DAG 触发的联动重算后，根据触摸状态与 validateOn 策略触发交叉字段校验
      const nextState = this.store.getFieldState(fieldName) as FieldState<unknown> | undefined
      const shouldValidate =
        (this.validateOn === 'change' || this.validateOn === 'blur') && nextState?.touched === true

      if (shouldValidate && nextState?.visible !== false) {
        void this.validationEngine.validateField(fieldName)
      }
    }

    // 自动草稿保存：每次事务提交 flush 后触发（去抖 500ms）
    if (
      this.options.autoSave === true &&
      this.options.persistKey &&
      this.options.persistKey.length > 0
    ) {
      if (this.saveDraftTimer !== null) {
        window.clearTimeout(this.saveDraftTimer)
      }

      this.saveDraftTimer = window.setTimeout(() => {
        DraftStorage.save(this.options.persistKey as string, this.getValues() as ValuesRecord)
        this.saveDraftTimer = null
      }, 500)
    }
  }

  /**
   * 收集 Schema 树中的所有 FieldSchema
   */
  private collectFields(nodes: FormSchemaNode[], result: FieldSchema[]): void {
    nodes.forEach(node => {
      if (this.isFieldSchema(node)) {
        result.push(node)
      } else if (this.isGroupSchema(node)) {
        this.collectFields(node.children, result)
      }
    })
  }

  private isFieldSchema(node: FormSchemaNode): node is FieldSchema {
    return (node as FieldSchema).component !== undefined
  }

  private isGroupSchema(
    node: FormSchemaNode
  ): node is Extract<FormSchemaNode, { children: FormSchemaNode[] }> {
    return (node as { children?: FormSchemaNode[] }).children !== undefined
  }

  /**
   * 从 SubscriptionStore 快照当前表单值
   */
  getValues(): TValues {
    const values = {} as TValues

    this.fieldNames.forEach(name => {
      const value = this.store.getFieldValue(name)
      if (value !== undefined) {
        ;(values as ValuesRecord)[name] = value
      }
    })

    return values
  }

  /**
   * 构造一个基础的 FormState 快照（后续可与验证结果等集成）
   */
  getFormState(): FormState<TValues> {
    const values = this.getValues()
    return {
      values,
      errors: {},
      touched: {},
      dirty: false,
      valid: true,
      submitting: false,
    }
  }

  /**
   * 重置表单状态到 initialValues 或 schema.defaultValue
   */
  reset(initialValues?: Partial<TValues>): void {
    if (initialValues && Object.keys(initialValues as ValuesRecord).length > 0) {
      const base = (this.options.initialValues ?? {}) as Partial<TValues>
      this.options.initialValues = {
        ...base,
        ...initialValues,
      }
    }

    const source =
      ((this.options.initialValues ?? {}) as Partial<TValues>) ?? ({} as Partial<TValues>)

    this.transactionManager.begin()

    this.fieldNames.forEach(fieldName => {
      const schema = this.findFieldSchema(fieldName)

      const hasInitial =
        Object.prototype.hasOwnProperty.call(source, fieldName) &&
        (source as ValuesRecord)[fieldName] !== undefined

      const nextValue = (
        hasInitial
          ? (source as ValuesRecord)[fieldName]
          : (schema as FieldSchema<unknown> | undefined)?.defaultValue
      ) as TValues[typeof fieldName] | undefined

      const existingState = (this.store.getFieldState(fieldName) as
        | FieldState<unknown>
        | undefined) ?? {
        value: nextValue,
        initialValue: nextValue,
        visible: true,
        disabled: false,
        required: schema?.required === true,
        touched: false,
        dirty: false,
        valid: true,
        validating: false,
        errors: [],
      }

      this.store.setFieldState(fieldName, {
        ...existingState,
        value: nextValue,
        initialValue: nextValue,
        touched: false,
        dirty: false,
        valid: true,
        validating: false,
        errors: [],
      })

      this.transactionManager.updateField(fieldName)
    })

    this.transactionManager.commit(() => {
      // reset 会触发依赖字段逻辑与状态重算，values 快照由 Hook 层刷新
    }, this)
  }

  /**
   * 生成提交值快照：对每个字段应用 FieldSchema.transform（Serialize）
   */
  getSubmitValues(): Record<string, unknown> {
    const rawValues = this.getValues() as ValuesRecord
    const submitValues: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(rawValues)) {
      const field = this.findFieldSchema(key) as FieldSchema<unknown> | undefined
      if (field && typeof field.transform === 'function') {
        submitValues[key] = field.transform(value, rawValues)
      } else {
        submitValues[key] = value
      }
    }

    return submitValues
  }

  async submit(): Promise<void> {
    const isValid = await this.validateForm(this.options.resolver)
    if (!isValid) return

    if (typeof this.submitCallback === 'function') {
      await this.submitCallback(this.getSubmitValues())
    }
  }

  /**
   * 批量设置字段值：
   * - 仅对已在 schema 中声明的字段生效
   * - 整体包裹在 TransactionManager 事务中，避免多次调度
   * - 显式传入 undefined 允许调用方“清空”字段值
   */
  setFieldsValue(values: Partial<TValues>): void {
    const keys = Object.keys(values) as (keyof TValues & string)[]
    if (keys.length === 0) return

    this.transactionManager.begin()

    keys.forEach(fieldName => {
      if (!this.fieldNames.includes(fieldName)) return
      const value = values[fieldName]

      this.store.setFieldValue(fieldName, value as TValues[typeof fieldName])
      this.transactionManager.updateField(fieldName)
    })

    this.transactionManager.commit(() => {
      // 具体的表单值快照更新由 Hook 层负责（controller.getValues）
    }, this)
  }

  /**
   * 按字段名重置字段状态：
   * - value 回到 initialValue
   * - touched / dirty 重置为 false
   * - 清空 errors / validating / valid
   * - 使用事务避免多次调度
   */
  resetFields(names?: (keyof TValues & string)[]): void {
    const targetNames: (keyof TValues & string)[] =
      names && names.length > 0 ? (names as (keyof TValues & string)[]) : this.fieldNames
    if (targetNames.length === 0) return

    this.transactionManager.begin()

    targetNames.forEach(fieldName => {
      if (!this.fieldNames.includes(fieldName)) return
      const existing = this.store.getFieldState(fieldName)
      if (!existing) return

      const nextState = {
        ...existing,
        value: existing.initialValue,
        touched: false,
        dirty: false,
        valid: true,
        validating: false,
        errors: [],
      }

      this.store.setFieldState(fieldName, nextState)
      this.transactionManager.updateField(fieldName)
    })

    this.transactionManager.commit(() => {
      // 依赖图与验证调度交由 Scheduler / ValidationEngine 自行处理
    }, this)
  }

  /**
   * 清除指定字段（或全部字段）的校验错误
   */
  clearValidate(names?: (keyof TValues & string)[]): void {
    const targetNames: (keyof TValues & string)[] =
      names && names.length > 0 ? (names as (keyof TValues & string)[]) : this.fieldNames
    if (targetNames.length === 0) return

    this.transactionManager.begin()

    targetNames.forEach(fieldName => {
      if (!this.fieldNames.includes(fieldName)) return
      const existing = this.store.getFieldState(fieldName)
      if (!existing) return

      const nextState = {
        ...existing,
        errors: [],
        valid: true,
        validating: false,
      }

      this.store.setFieldState(fieldName, nextState)
      this.transactionManager.updateField(fieldName)
    })

    this.transactionManager.commit(() => {
      // 清理错误本身不需要额外的依赖调度，这里仅确保批量通知一次
    }, this)
  }

  /**
   * 异步加载指定字段的下拉选项（OptionsLoader）：
   * - 内部带简单去抖与竞态保护：仅最后一次请求结果会生效
   */
  loadAsyncOptions(fieldName: string): void {
    const field = this.findFieldSchema(fieldName)
    if (!field) return

    const loader = field.options as OptionsLoader<TValues> | undefined
    if (typeof loader !== 'function') return

    const existingTimer = this.optionsDebounceTimers.get(fieldName)
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer)
    }

    const timerId = window.setTimeout(() => {
      const requestId = this.nextOptionsRequestId++
      this.optionsRequestToken.set(fieldName, requestId)

      const currentState =
        (this.store.getFieldState(fieldName) as FieldState<unknown> | undefined) ??
        ({
          value: this.store.getFieldValue(fieldName),
          initialValue: this.store.getFieldValue(fieldName),
          visible: true,
          disabled: false,
          required: field.required === true,
          loadingOptions: true,
          loadedOptions: undefined,
          touched: false,
          dirty: false,
          valid: true,
          validating: false,
          errors: [],
        } as FieldState<unknown>)

      this.store.setFieldState(fieldName, {
        ...currentState,
        loadingOptions: true,
      })

      void loader({
        form: this.getValues(),
        field: fieldName,
      })
        .then((options: SelectOption[]) => {
          const latestToken = this.optionsRequestToken.get(fieldName)
          if (latestToken !== requestId) {
            return
          }

          const latestState =
            (this.store.getFieldState(fieldName) as FieldState<unknown> | undefined) ?? currentState
          this.store.setFieldState(fieldName, {
            ...latestState,
            loadingOptions: false,
            loadedOptions: options as unknown[],
          })
        })
        .catch(() => {
          const latestToken = this.optionsRequestToken.get(fieldName)
          if (latestToken !== requestId) {
            return
          }

          const latestState =
            (this.store.getFieldState(fieldName) as FieldState<unknown> | undefined) ?? currentState
          this.store.setFieldState(fieldName, {
            ...latestState,
            loadingOptions: false,
          })
        })
        .finally(() => {
          this.optionsDebounceTimers.delete(fieldName)
        })
    }, 200)

    this.optionsDebounceTimers.set(fieldName, timerId)
  }

  /**
   * 字段挂载时的生命周期钩子：
   * - 触发该字段相关的逻辑重算（依赖 DAG）
   * - 若存在 OptionsLoader，则发起首次异步加载
   */
  onFieldMount(fieldName: string): void {
    this.lifecycle.trigger('fieldMount', fieldName)
  }

  /**
   * 动态更新单个字段的 Schema props（浅层合并）：
   * - 直接修改 schema 中的 FieldSchema
   * - 通过 SubscriptionStore 通知对应字段，配合 Vue 响应式驱动渲染器刷新
   */
  setFieldProps(name: string, props: Record<string, unknown>): void {
    const field = this.findFieldSchema(name)
    if (!field) return

    const nextProps: Record<string, unknown> = {
      ...(field.props ?? {}),
      ...props,
    }

    field.props = nextProps
    this.store.notify(name)
  }

  /**
   * 在当前表单 schema 树中按名称查找 FieldSchema
   */
  private findFieldSchema(
    fieldName: string,
    nodes: FormSchemaNode[] = this.schema.fields
  ): FieldSchema | undefined {
    for (const node of nodes) {
      if (this.isFieldSchema(node) && node.name === fieldName) {
        return node
      }

      if (this.isGroupSchema(node)) {
        const found = this.findFieldSchema(fieldName, node.children)
        if (found) return found
      }
    }

    return undefined
  }

  validateField(fieldName: string): Promise<boolean> {
    return this.validationEngine.validateField(fieldName)
  }

  validateForm(resolver?: ValidationResolver<TValues>): Promise<boolean> {
    return this.validationEngine.validateForm(resolver)
  }

  /**
   * 释放当前表单实例内部的所有异步资源：
   * - 清理验证与选项加载相关的定时器与 token
   * - 取消草稿自动保存定时器
   */
  teardown(): void {
    // 校验引擎内部清理
    this.validationEngine.teardown()

    // 草稿自动保存去抖定时器
    if (this.saveDraftTimer !== null) {
      window.clearTimeout(this.saveDraftTimer)
      this.saveDraftTimer = null
    }

    // 选项加载去抖定时器
    this.optionsDebounceTimers.forEach(timerId => {
      window.clearTimeout(timerId)
    })
    this.optionsDebounceTimers.clear()

    // 选项加载标记与请求 token 清理，防止后续过期结果写回
    this.optionsRequestToken.clear()
  }
}
