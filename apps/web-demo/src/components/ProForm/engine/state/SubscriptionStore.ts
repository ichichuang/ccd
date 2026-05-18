import type { FieldState } from '../types'
import { deepEqual } from '@/utils/lodashes'

export type FieldSubscriber = () => void

/**
 * 订阅式字段状态仓库
 *
 * - 按字段名维护独立的 FieldState
 * - 提供字段级别的订阅/通知，避免整个表单重渲染
 * - 后续可与 DependencyGraph / TransactionManager 集成
 */
export class SubscriptionStore<TValues extends Record<string, unknown> = Record<string, unknown>> {
  private readonly fieldStates = new Map<string, FieldState<unknown>>()
  private readonly subscribers = new Map<string, Set<FieldSubscriber>>()

  subscribe(field: string, callback: FieldSubscriber): void {
    const set = this.subscribers.get(field) ?? new Set<FieldSubscriber>()
    set.add(callback)
    this.subscribers.set(field, set)
  }

  unsubscribe(field: string, callback: FieldSubscriber): void {
    const set = this.subscribers.get(field)
    if (!set) return
    set.delete(callback)
    if (set.size === 0) {
      this.subscribers.delete(field)
    }
  }

  notify(field: string): void {
    const set = this.subscribers.get(field)
    if (!set) return
    set.forEach(subscriber => subscriber())
  }

  getFieldState(field: string): FieldState<unknown> | undefined {
    return this.fieldStates.get(field)
  }

  deleteFieldState(field: string): void {
    this.fieldStates.delete(field)
    this.notify(field)
  }

  setFieldState(field: string, state: FieldState<unknown>): void {
    this.fieldStates.set(field, state)
    this.notify(field)
  }

  getFieldValue(field: string): TValues[keyof TValues] | undefined {
    const state = this.getFieldState(field)
    return state?.value as unknown as TValues[keyof TValues] | undefined
  }

  setFieldValue(field: string, value: TValues[keyof TValues]): void {
    const existing = this.getFieldState(field)

    if (existing) {
      const dirty = !deepEqual(existing.initialValue, value)
      const nextState: FieldState<unknown> = {
        ...existing,
        value,
        dirty,
      }
      this.setFieldState(field, nextState)
      return
    }

    const initialState: FieldState<unknown> = {
      value,
      initialValue: value,
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

    this.setFieldState(field, initialState)
  }
}
