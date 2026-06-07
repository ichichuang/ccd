import type { DependencyGraph } from '../dependency/DependencyGraph'
import type { SubscriptionStore } from '../state/SubscriptionStore'
import type {
  FieldName,
  FieldSchema,
  FormFieldValue,
  FieldState,
  FormSchema,
  FormSchemaNode,
  FormValuesRecord,
  ValidationResolver,
} from '../types'
import { PRO_FORM_TIMING_DEFAULTS } from '../config'
import { PRO_FORM_LOGGER } from '../utils/logger'
import { castValue } from '@ccd/shared-utils'

export class ValidationEngine<TValues extends FormValuesRecord = FormValuesRecord> {
  private readonly fieldMap = new Map<string, FieldSchema<unknown, TValues>>()
  private readonly fieldNames: FieldName<TValues>[] = []
  private readonly validationTimers = new Map<string, ReturnType<typeof globalThis.setTimeout>>()
  private readonly validationTokens = new Map<string, number>()
  private nextValidationToken = 0

  constructor(
    private readonly store: SubscriptionStore<TValues>,
    private readonly graph: DependencyGraph,
    schema: FormSchema<TValues>,
    private readonly getValues: () => TValues
  ) {
    const flatFields: FieldSchema<unknown, TValues>[] = []
    this.collectFields(schema.fields, flatFields)
    flatFields.forEach(field => {
      this.fieldMap.set(field.name, field)
      this.fieldNames.push(castValue<FieldName<TValues>>(field.name))
    })
  }

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

  replaceSchema(schema: FormSchema<TValues>): void {
    this.teardown()
    this.fieldMap.clear()
    this.fieldNames.length = 0

    const flatFields: FieldSchema<unknown, TValues>[] = []
    this.collectFields(schema.fields, flatFields)
    flatFields.forEach(field => {
      this.fieldMap.set(field.name, field)
      this.fieldNames.push(castValue<FieldName<TValues>>(field.name))
    })
  }

  async validateField(name: string): Promise<boolean> {
    const schema = this.fieldMap.get(name)
    if (!schema || !schema.rules || schema.rules.length === 0) {
      return true
    }

    const existingTimer = this.validationTimers.get(name)
    if (existingTimer !== undefined) {
      globalThis.clearTimeout(existingTimer)
    }

    const requestId = this.nextValidationToken++
    this.validationTokens.set(name, requestId)

    return new Promise<boolean>(resolve => {
      const timerId = globalThis.setTimeout(async () => {
        // 若在等待期间产生了新的校验请求，则丢弃本次结果，避免竞态覆盖最新错误信息
        if (this.validationTokens.get(name) !== requestId) {
          this.validationTimers.delete(name)
          resolve(true)
          return
        }

        const result = await this.runFieldValidation(name, schema, requestId)
        this.validationTimers.delete(name)
        resolve(result)
      }, PRO_FORM_TIMING_DEFAULTS.validationDebounceMs)

      this.validationTimers.set(name, timerId)
    })
  }

  private async runFieldValidation(
    name: string,
    schema: FieldSchema<unknown, TValues>,
    requestId: number
  ): Promise<boolean> {
    const resetValidatingBeforeAbort = (): void => {
      const current = this.store.getFieldState(name)
      if (!current) return
      if (current.validating !== true) return
      this.store.setFieldState(name, {
        ...current,
        validating: false,
      })
    }

    const currentState = this.store.getFieldState(name)
    const currentValue = this.store.getFieldValue(name)

    const baseState: FieldState<FormFieldValue<TValues>> = currentState ?? {
      value: currentValue,
      initialValue: currentValue,
      visible: true,
      disabled: false,
      required: false,
      loadingOptions: false,
      touched: false,
      dirty: false,
      valid: true,
      validating: false,
      errors: [],
    }

    this.store.setFieldState(name, {
      ...baseState,
      validating: true,
      errors: [],
    })

    const errors: string[] = []
    const value = this.store.getFieldValue(name)

    for (const rule of schema.rules ?? []) {
      // 若在异步规则执行过程中产生了新的校验请求，则立即中断并丢弃本次结果
      if (this.validationTokens.get(name) !== requestId) {
        // CRITICAL FIX: Reset validating state before aborting so UI doesn't freeze
        resetValidatingBeforeAbort()
        return true
      }

      try {
        const result = await rule.validator(value)
        if (!result) {
          errors.push(rule.message)
        }
      } catch (error) {
        // 单条规则异常视为该字段校验失败，但不阻断整个表单其他字段的校验
        PRO_FORM_LOGGER.error(`Validator error in field "${name}"`, error)
        errors.push(rule.message)
      }
    }

    const latestState = this.store.getFieldState(name) ?? baseState

    // 在写回最终状态前再次检查 token，防止过期结果覆盖最新状态
    if (this.validationTokens.get(name) !== requestId) {
      // CRITICAL FIX: Reset validating state before aborting so UI doesn't freeze
      resetValidatingBeforeAbort()
      return true
    }

    const finalState: FieldState<FormFieldValue<TValues>> = {
      ...latestState,
      validating: false,
      valid: errors.length === 0,
      errors,
    }

    this.store.setFieldState(name, finalState)

    return errors.length === 0
  }

  /**
   * 释放内部资源：
   * - 清理所有校验防抖定时器
   * - 清空 token 映射，避免后续过期结果回写
   */
  teardown(): void {
    this.validationTimers.forEach(timerId => {
      globalThis.clearTimeout(timerId)
    })
    this.validationTimers.clear()
    this.validationTokens.clear()
  }

  /**
   * 返回按依赖图拓扑序排列的字段名；未出现在图中的字段排在后面。
   */
  private getValidationOrder(): string[] {
    const order = this.graph.topologicalSort()
    const orderSet = new Set(order)
    const rest = this.fieldNames.filter(name => !orderSet.has(name))
    return [...order, ...rest]
  }

  async validateForm(resolver?: ValidationResolver<TValues>): Promise<boolean> {
    const orderedNames = this.getValidationOrder()
    const fieldResults = await Promise.all(orderedNames.map(name => this.validateField(name)))
    let isValid = fieldResults.every(result => result)

    if (resolver) {
      const values = this.getValues()
      const result = await resolver(values)

      if (!result.valid) {
        Object.entries(result.errors).forEach(([fieldName, fieldErrors]) => {
          if (!fieldErrors || fieldErrors.length === 0) return

          const currentState: FieldState<FormFieldValue<TValues>> = this.store.getFieldState(
            fieldName
          ) ?? {
            value: this.store.getFieldValue(fieldName),
            initialValue: this.store.getFieldValue(fieldName),
            visible: true,
            disabled: false,
            required: false,
            loadingOptions: false,
            touched: false,
            dirty: false,
            valid: true,
            validating: false,
            errors: [],
          }

          const mergedErrors = [...(currentState.errors ?? []), ...fieldErrors]

          const finalState: FieldState<FormFieldValue<TValues>> = {
            ...currentState,
            valid: mergedErrors.length === 0,
            errors: mergedErrors,
          }

          this.store.setFieldState(fieldName, finalState)
        })

        isValid = false
      }
    }

    return isValid
  }
}
