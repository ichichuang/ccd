import type { DependencyGraph } from '../dependency/DependencyGraph'
import type { SubscriptionStore } from '../state/SubscriptionStore'
import type {
  FieldSchema,
  FieldState,
  FormSchema,
  FormSchemaNode,
  ValidationResolver,
} from '../types'

export class ValidationEngine<TValues extends Record<string, unknown> = Record<string, unknown>> {
  private readonly fieldMap = new Map<string, FieldSchema<unknown>>()
  private readonly fieldNames: string[] = []
  private readonly validationTimers = new Map<string, number>()
  private readonly validationTokens = new Map<string, number>()
  private nextValidationToken = 0

  constructor(
    private readonly store: SubscriptionStore<TValues>,
    private readonly graph: DependencyGraph,
    schema: FormSchema,
    private readonly getValues: () => TValues
  ) {
    const flatFields: FieldSchema<unknown>[] = []
    this.collectFields(schema.fields, flatFields)
    flatFields.forEach(field => {
      this.fieldMap.set(field.name, field)
      this.fieldNames.push(field.name)
    })
  }

  private collectFields(nodes: FormSchemaNode[], result: FieldSchema<unknown>[]): void {
    nodes.forEach(node => {
      if (this.isFieldSchema(node)) {
        result.push(node)
      } else if (this.isGroupSchema(node)) {
        this.collectFields(node.children, result)
      }
    })
  }

  private isFieldSchema(node: FormSchemaNode): node is FieldSchema<unknown> {
    return (node as FieldSchema<unknown>).component !== undefined
  }

  private isGroupSchema(
    node: FormSchemaNode
  ): node is Extract<FormSchemaNode, { children: FormSchemaNode[] }> {
    return (node as { children?: FormSchemaNode[] }).children !== undefined
  }

  async validateField(name: string): Promise<boolean> {
    const schema = this.fieldMap.get(name)
    if (!schema || !schema.rules || schema.rules.length === 0) {
      return true
    }

    const existingTimer = this.validationTimers.get(name)
    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer)
    }

    const requestId = this.nextValidationToken++
    this.validationTokens.set(name, requestId)

    return new Promise<boolean>(resolve => {
      const timerId = window.setTimeout(async () => {
        // 若在等待期间产生了新的校验请求，则丢弃本次结果，避免竞态覆盖最新错误信息
        if (this.validationTokens.get(name) !== requestId) {
          this.validationTimers.delete(name)
          resolve(true)
          return
        }

        const result = await this.runFieldValidation(name, schema, requestId)
        this.validationTimers.delete(name)
        resolve(result)
      }, 200)

      this.validationTimers.set(name, timerId)
    })
  }

  private async runFieldValidation(
    name: string,
    schema: FieldSchema<unknown>,
    requestId: number
  ): Promise<boolean> {
    const resetValidatingBeforeAbort = (): void => {
      const current = this.store.getFieldState(name) as FieldState<unknown> | undefined
      if (!current) return
      if (current.validating !== true) return
      this.store.setFieldState(name, {
        ...current,
        validating: false,
      })
    }

    const currentState = this.store.getFieldState(name)
    const currentValue = this.store.getFieldValue(name)

    const baseState: FieldState<unknown> =
      currentState ??
      ({
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
      } as FieldState<unknown>)

    this.store.setFieldState(name, {
      ...baseState,
      validating: true,
      errors: [],
    } as FieldState<unknown>)

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
        console.error(`[ProForm] Validator error in field "${name}":`, error)
        errors.push(rule.message)
      }
    }

    const latestState =
      (this.store.getFieldState(name) as FieldState<unknown> | undefined) ?? baseState

    // 在写回最终状态前再次检查 token，防止过期结果覆盖最新状态
    if (this.validationTokens.get(name) !== requestId) {
      // CRITICAL FIX: Reset validating state before aborting so UI doesn't freeze
      resetValidatingBeforeAbort()
      return true
    }

    const finalState: FieldState<unknown> = {
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
      window.clearTimeout(timerId)
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

          const currentState =
            (this.store.getFieldState(fieldName) as FieldState<unknown> | undefined) ??
            ({
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
            } as FieldState<unknown>)

          const mergedErrors = [...(currentState.errors ?? []), ...fieldErrors]

          const finalState: FieldState<unknown> = {
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
