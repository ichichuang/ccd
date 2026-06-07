import { SubscriptionStore } from '../state/SubscriptionStore'
import { DependencyGraph } from '../dependency/DependencyGraph'
import { Scheduler } from '../dependency/Scheduler'
import { TransactionManager } from './TransactionManager'
import { ValidationEngine } from '../validation/ValidationEngine'
import { VisibilityEngine } from '../logic/VisibilityEngine'
import { DisableEngine } from '../logic/DisableEngine'
import { RequiredEngine } from '../logic/RequiredEngine'
import { ComputedEngine } from '../logic/ComputedEngine'
import { ReactionEngine } from '../logic/ReactionEngine'
import { SchemaNormalizer } from '../schema/SchemaNormalizer'
import { LifecycleManager } from './LifecycleManager'
import { DraftStorage } from '../persistence/DraftStorage'
import { PRO_FORM_TIMING_DEFAULTS } from '../config'
import { deepClone } from '@ccd/shared-utils'
import { castValue } from '@ccd/shared-utils'
import { PRO_FORM_LOGGER } from '../utils/logger'
import type {
  FieldName,
  FieldProps,
  CompatibleFormSchema,
  FieldSchema,
  FormFieldValue,
  FormSchema,
  FormSchemaNode,
  FormSubmitValues,
  FormValuesRecord,
  FormState,
  FieldState,
  NormalizedFormSchema,
  ValidationResolver,
  UseFormOptions,
  SelectOption,
} from '../types'
import type { LifecycleController } from './LifecycleManager'

type ValuesRecord = FormValuesRecord
type FieldValue<TValues extends ValuesRecord> = FormFieldValue<TValues>
type TimerHandle = ReturnType<typeof globalThis.setTimeout>

/**
 * 单个表单实例的核心控制器，聚合 Engine 子模块：
 * - SubscriptionStore：字段状态与订阅
 * - DependencyGraph：字段依赖关系
 * - Scheduler：基于 DAG 的更新调度
 * - TransactionManager：批量更新事务
 */
export class FormController<TValues extends ValuesRecord = ValuesRecord> {
  schema: NormalizedFormSchema<TValues>
  readonly store: SubscriptionStore<TValues>
  readonly graph: DependencyGraph
  readonly scheduler: Scheduler
  readonly transactionManager: TransactionManager
  readonly validationEngine: ValidationEngine<TValues>
  readonly fieldNames: FieldName<TValues>[]
  public validateOn?: 'change' | 'blur' | 'submit'
  private readonly options: UseFormOptions<TValues>
  private effectiveInitials: Partial<TValues>
  private readonly lifecycle: LifecycleManager<TValues>
  private readonly visibilityEngine: VisibilityEngine<TValues>
  private readonly disableEngine: DisableEngine<TValues>
  private readonly requiredEngine: RequiredEngine<TValues>
  private readonly computedEngine: ComputedEngine<TValues>
  private readonly reactionEngine: ReactionEngine<TValues>
  private readonly optionsRequestToken = new Map<string, number>()
  private readonly optionsDebounceTimers = new Map<string, TimerHandle>()
  private nextOptionsRequestId = 0
  private saveDraftTimer: TimerHandle | null = null
  private isRecomputing = false
  private pendingRecompute: string[] = []
  public submitCallback?: (values: FormSubmitValues<TValues>) => Promise<void> | void

  constructor(options: UseFormOptions<TValues>) {
    this.options = options
    this.schema = SchemaNormalizer.normalize(castValue<FormSchema<TValues>>(options.schema))

    // 持久化草稿恢复：draft 覆盖 initialValues（必须在 SubscriptionStore 初始化之前完成）
    const baseInitialValues: Partial<TValues> = deepClone(options.initialValues ?? {})
    const draftRaw =
      options.persistKey && options.persistKey.length > 0
        ? DraftStorage.load(options.persistKey)
        : null
    const draft: Partial<TValues> | null = draftRaw
      ? castValue<Partial<TValues>>(deepClone(draftRaw))
      : null
    const effectiveInitialValues: Partial<TValues> = {
      ...baseInitialValues,
      ...(draft ?? {}),
    }
    this.effectiveInitials = effectiveInitialValues

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
    this.reactionEngine = new ReactionEngine<TValues>(this.store, (name, props) =>
      this.setFieldProps(name, props)
    )
    this.lifecycle = new LifecycleManager<TValues>(castValue<LifecycleController<TValues>>(this))

    const flatFields: FieldSchema<unknown, TValues>[] = []
    this.collectFields(this.schema.fields, flatFields)
    this.fieldNames = flatFields.map(field => castValue<FieldName<TValues>>(field.name))

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
      const fieldName = castValue<FieldName<TValues>>(field.name)
      const hasInitial =
        Object.prototype.hasOwnProperty.call(initialValues, fieldName) &&
        initialValues[fieldName] !== undefined
      const sourceValue: FieldValue<TValues> = hasInitial
        ? castValue<FieldValue<TValues>>(initialValues[fieldName])
        : castValue<FieldValue<TValues>>(field.defaultValue)
      const value: FieldValue<TValues> = deepClone(sourceValue)

      const initialState: FieldState<FieldValue<TValues>> = {
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

  updateSchema(nextSchema: CompatibleFormSchema<TValues>): void {
    const normalizedSchema = SchemaNormalizer.normalize(castValue<FormSchema<TValues>>(nextSchema))
    const flatFields: FieldSchema<unknown, TValues>[] = []
    this.collectFields(normalizedSchema.fields, flatFields)

    const previousFieldNames = [...this.fieldNames]
    const nextFieldNames = flatFields.map(field => castValue<FieldName<TValues>>(field.name))
    const nextFieldNameSet = new Set(nextFieldNames)

    this.transactionManager.reset()
    this.pendingRecompute.length = 0
    this.isRecomputing = false

    this.optionsDebounceTimers.forEach(timerId => {
      globalThis.clearTimeout(timerId)
    })
    this.optionsDebounceTimers.clear()
    this.optionsRequestToken.clear()
    this.nextOptionsRequestId = 0

    this.schema = normalizedSchema

    this.graph.reset()
    flatFields.forEach(field => {
      this.graph.addNode(field.name)
      if (field.deps && field.deps.length > 0) {
        field.deps.forEach(dep => {
          this.graph.addDependency(dep, field.name)
        })
      }
    })

    this.fieldNames.length = 0
    this.fieldNames.push(...nextFieldNames)
    this.validationEngine.replaceSchema(this.schema)

    previousFieldNames.forEach(fieldName => {
      if (!nextFieldNameSet.has(fieldName)) {
        this.store.deleteFieldState(fieldName)
      }
    })

    flatFields.forEach(field => {
      const fieldName = castValue<FieldName<TValues>>(field.name)
      const existingState = this.store.getFieldState(fieldName)

      const hasInitial =
        Object.prototype.hasOwnProperty.call(this.effectiveInitials, fieldName) &&
        this.effectiveInitials[fieldName] !== undefined
      const sourceValue: FieldValue<TValues> = hasInitial
        ? castValue<FieldValue<TValues>>(this.effectiveInitials[fieldName])
        : castValue<FieldValue<TValues>>(field.defaultValue)

      const nextValue: FieldValue<TValues> = castValue<FieldValue<TValues>>(
        deepClone(existingState ? existingState.value : sourceValue)
      )
      const nextInitialValue: FieldValue<TValues> = castValue<FieldValue<TValues>>(
        deepClone(existingState ? existingState.initialValue : sourceValue)
      )

      const nextState: FieldState<FieldValue<TValues>> = {
        value: nextValue,
        initialValue: nextInitialValue,
        visible: existingState?.visible ?? true,
        disabled: existingState?.disabled ?? false,
        required: existingState?.required ?? field.required === true,
        loadingOptions: false,
        loadedOptions: existingState?.loadedOptions,
        optionsError: undefined,
        touched: existingState?.touched ?? false,
        dirty: existingState?.dirty ?? false,
        valid: true,
        validating: false,
        errors: [],
      }

      this.store.setFieldState(fieldName, nextState)
    })

    if (nextFieldNames.length > 0) {
      const orderedFields = this.scheduler.getUpdateOrder(nextFieldNames)
      this.recomputeFields(orderedFields)
    }

    flatFields.forEach(field => {
      if (typeof field.options === 'function' && (!field.deps || field.deps.length === 0)) {
        this.loadAsyncOptionsForFieldWithoutDeps(field.name)
      }
    })
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

    // ── 重入保护 ──────────────────────────────────────────────────
    // 若 computed() 副作用触发 setFieldsValue → commit → recomputeFields，
    // 缓冲字段到 pendingRecompute，由外层循环统一排空
    if (this.isRecomputing) {
      this.pendingRecompute.push(...orderedFields)
      return
    }

    this.isRecomputing = true
    const MAX_RECOMPUTE_PASSES = 10
    let pass = 0

    try {
      let fieldsToProcess: string[] = orderedFields

      while (fieldsToProcess.length > 0) {
        pass++
        if (pass > MAX_RECOMPUTE_PASSES) {
          PRO_FORM_LOGGER.warn(
            `recomputeFields: safety limit reached (${MAX_RECOMPUTE_PASSES} passes). ` +
              `Possible infinite loop caused by computed() side-effects. ` +
              `Pending fields: [${this.pendingRecompute.join(', ')}]`
          )
          this.pendingRecompute.length = 0
          break
        }

        this.executeRecomputePass(fieldsToProcess)

        // 排空缓冲区（副作用在 executeRecomputePass 期间累积）
        if (this.pendingRecompute.length > 0) {
          fieldsToProcess = [...new Set(this.pendingRecompute)]
          this.pendingRecompute.length = 0
        } else {
          fieldsToProcess = []
        }
      }
    } finally {
      this.isRecomputing = false
      this.pendingRecompute.length = 0
    }

    // 自动草稿保存：所有 pass 完成后触发（去抖 500ms）
    if (
      this.options.autoSave === true &&
      this.options.persistKey &&
      this.options.persistKey.length > 0
    ) {
      const persistKey = this.options.persistKey
      if (this.saveDraftTimer !== null) {
        globalThis.clearTimeout(this.saveDraftTimer)
      }

      this.saveDraftTimer = globalThis.setTimeout(() => {
        DraftStorage.save(persistKey, this.getValues())
        this.saveDraftTimer = null
      }, PRO_FORM_TIMING_DEFAULTS.autoSaveDebounceMs)
    }
  }

  /**
   * 内部：执行一次字段重算遍历。
   * 从 recomputeFields() 提取，以支持重入保护 + 多 pass 排空。
   */
  private executeRecomputePass(orderedFields: string[]): void {
    // 构建本次事务中参与重算的字段集合，用于 reaction watch 匹配
    const changedFieldsSet = new Set(orderedFields)

    for (const fieldName of orderedFields) {
      const schema = this.findFieldSchema(fieldName)
      if (!schema) continue

      const ensureBaseState = (): FieldState<FieldValue<TValues>> => {
        const existing = this.store.getFieldState(fieldName)
        if (existing) return existing

        const value = this.store.getFieldValue(fieldName)
        const base: FieldState<FieldValue<TValues>> = {
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
        this.store.setFieldValue(fieldName, castValue<FieldValue<TValues>>(computedValue))
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

      // 3) 声明式联动引擎：在 visibleIf/disabledIf/requiredIf 之后、OptionsLoader 之前执行
      if (schema.reactions && schema.reactions.length > 0) {
        const reactionValues = this.getValues()
        this.reactionEngine.evaluate(schema, reactionValues, fieldName, changedFieldsSet)
      }

      // 有 deps 的 OptionsLoader：依赖链重算后按最新 form 上下文重新拉取（无 deps 的首次加载见 LifecycleManager）
      if (
        typeof schema.options === 'function' &&
        visible &&
        schema.deps &&
        schema.deps.length > 0
      ) {
        this.loadAsyncOptions(fieldName)
      }

      // DAG 触发的联动重算后，根据触摸状态与 validateOn 策略触发交叉字段校验
      const nextState = this.store.getFieldState(fieldName)
      const shouldValidate =
        (this.validateOn === 'change' || this.validateOn === 'blur') && nextState?.touched === true

      if (shouldValidate && nextState?.visible !== false) {
        void this.validationEngine.validateField(fieldName)
      }
    }
  }

  /**
   * 收集 Schema 树中的所有 FieldSchema
   */
  private collectFields(
    nodes: FormSchemaNode<TValues>[],
    result: FieldSchema<unknown, TValues>[]
  ): void {
    nodes.forEach(node => {
      if (this.isFieldSchema(node)) {
        result.push(node)
      } else if (this.isGroupSchema(node)) {
        this.collectFields(node.children, result)
      }
    })
  }

  private isFieldSchema(node: FormSchemaNode<TValues>): node is FieldSchema<unknown, TValues> {
    return 'component' in node && node.component !== undefined
  }

  private isGroupSchema(
    node: FormSchemaNode<TValues>
  ): node is Extract<FormSchemaNode<TValues>, { children: FormSchemaNode<TValues>[] }> {
    return 'children' in node && node.children !== undefined
  }

  /**
   * 从 SubscriptionStore 快照当前表单值
   */
  getValues(): TValues {
    const values: Partial<TValues> = {}

    this.fieldNames.forEach(name => {
      const value = this.store.getFieldValue(name)
      if (value !== undefined) {
        values[name] = castValue<TValues[typeof name]>(value)
      }
    })

    return castValue<TValues>(values)
  }

  /**
   * 从 SubscriptionStore 聚合各字段状态，构造完整的 FormState 快照
   */
  getFormState(): FormState<TValues> {
    const values = this.getValues()
    const errors: Partial<Record<keyof TValues, string[]>> = {}
    const touched: Partial<Record<keyof TValues, boolean>> = {}
    let dirty = false
    let valid = true

    for (const fieldName of this.fieldNames) {
      const fieldState = this.store.getFieldState(fieldName)
      if (!fieldState) continue

      if (fieldState.errors.length > 0) {
        errors[fieldName] = [...fieldState.errors]
        valid = false
      }

      if (fieldState.touched) {
        touched[fieldName] = true
      }

      if (fieldState.dirty) {
        dirty = true
      }

      if (!fieldState.valid) {
        valid = false
      }
    }

    return {
      values,
      errors,
      touched,
      dirty,
      valid,
      submitting: false,
    }
  }

  /**
   * 重置表单状态到 initialValues 或 schema.defaultValue
   */
  reset(initialValues?: Partial<TValues>): void {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const clonedInitials: Partial<TValues> = deepClone(initialValues)
      this.effectiveInitials = {
        ...this.effectiveInitials,
        ...clonedInitials,
      }
    }

    const source: Partial<TValues> = this.effectiveInitials

    this.transactionManager.begin()

    this.fieldNames.forEach(fieldName => {
      const schema = this.findFieldSchema(fieldName)

      const hasInitial =
        Object.prototype.hasOwnProperty.call(source, fieldName) && source[fieldName] !== undefined

      const sourceValue: FieldValue<TValues> = hasInitial
        ? castValue<FieldValue<TValues>>(source[fieldName])
        : castValue<FieldValue<TValues>>(schema?.defaultValue)
      const nextValue: FieldValue<TValues> = deepClone(sourceValue)

      const existingState = this.store.getFieldState(fieldName) ?? {
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
  getSubmitValues(): FormSubmitValues<TValues> {
    const rawValues = this.getValues()
    const submitValues: FieldProps = {}

    for (const [key, value] of Object.entries(rawValues)) {
      const field = this.findFieldSchema(key)
      if (field && typeof field.transform === 'function') {
        try {
          submitValues[key] = field.transform(value, rawValues)
        } catch (err) {
          PRO_FORM_LOGGER.error(`transform() failed for field "${key}"`, err)
          submitValues[key] = value
        }
      } else {
        submitValues[key] = value
      }
    }

    return castValue<FormSubmitValues<TValues>>(submitValues)
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
    const keys = castValue<FieldName<TValues>[]>(Object.keys(values))
    if (keys.length === 0) return

    this.transactionManager.begin()

    keys.forEach(fieldName => {
      if (!this.fieldNames.includes(fieldName)) return
      const value = values[fieldName]

      this.store.setFieldValue(fieldName, castValue<FieldValue<TValues>>(deepClone(value)))
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
      names && names.length > 0 ? names : this.fieldNames
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
      names && names.length > 0 ? names : this.fieldNames
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
   * 挂载后：对「无 deps」的 OptionsLoader 触发首次加载（有 deps 的已在 recomputeFields 中加载，避免重复请求）
   */
  loadAsyncOptionsForFieldWithoutDeps(fieldName: string): void {
    const field = this.findFieldSchema(fieldName)
    if (!field || typeof field.options !== 'function') return
    if (field.deps && field.deps.length > 0) return
    this.loadAsyncOptions(fieldName)
  }

  /**
   * 异步加载指定字段的下拉选项（OptionsLoader）：
   * - 内部带简单去抖与竞态保护：仅最后一次请求结果会生效
   */
  loadAsyncOptions(fieldName: string): void {
    const field = this.findFieldSchema(fieldName)
    if (!field) return

    const loader = typeof field.options === 'function' ? field.options : undefined
    if (typeof loader !== 'function') return

    const existingTimer = this.optionsDebounceTimers.get(fieldName)
    if (existingTimer !== undefined) {
      globalThis.clearTimeout(existingTimer)
    }

    const timerId = globalThis.setTimeout(() => {
      const requestId = this.nextOptionsRequestId++
      this.optionsRequestToken.set(fieldName, requestId)

      const currentState: FieldState<FieldValue<TValues>> = this.store.getFieldState(fieldName) ?? {
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
      }

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

          const latestState = this.store.getFieldState(fieldName) ?? currentState
          this.store.setFieldState(fieldName, {
            ...latestState,
            loadingOptions: false,
            loadedOptions: options,
            optionsError: undefined,
          })
        })
        .catch((err: unknown) => {
          const latestToken = this.optionsRequestToken.get(fieldName)
          if (latestToken !== requestId) {
            return
          }

          const errorMsg = err instanceof Error ? err.message : String(err)
          PRO_FORM_LOGGER.warn(`Async options load failed for "${fieldName}"`, err)

          const latestState = this.store.getFieldState(fieldName) ?? currentState
          this.store.setFieldState(fieldName, {
            ...latestState,
            loadingOptions: false,
            optionsError: errorMsg,
          })
        })
        .finally(() => {
          this.optionsDebounceTimers.delete(fieldName)
        })
    }, PRO_FORM_TIMING_DEFAULTS.asyncOptionsDebounceMs)

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
  setFieldProps(name: FieldName<TValues>, props: FieldProps): void {
    const field = this.findFieldSchema(name)
    if (!field) return

    const existingState = this.store.getFieldState(name)
    const nextProps: FieldProps = {
      ...(existingState?.dynamicProps ?? {}),
      ...props,
    }

    if (existingState) {
      this.store.setFieldState(name, { ...existingState, dynamicProps: nextProps })
    } else {
      this.store.notify(name)
    }
  }

  /**
   * 在当前表单 schema 树中按名称查找 FieldSchema
   */
  private findFieldSchema(
    fieldName: string,
    nodes: FormSchemaNode<TValues>[] = this.schema.fields
  ): FieldSchema<unknown, TValues> | undefined {
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

  setValidateOn(validateOn?: 'change' | 'blur' | 'submit'): void {
    this.validateOn = validateOn
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
      globalThis.clearTimeout(this.saveDraftTimer)
      this.saveDraftTimer = null
    }

    // 选项加载去抖定时器
    this.optionsDebounceTimers.forEach(timerId => {
      globalThis.clearTimeout(timerId)
    })
    this.optionsDebounceTimers.clear()

    // 选项加载标记与请求 token 清理，防止后续过期结果写回
    this.optionsRequestToken.clear()
  }
}
