import type { FieldSchema, FieldReaction, FormFieldValue, ReactionContext } from '../types'
import type { SubscriptionStore } from '../state/SubscriptionStore'
import { PRO_FORM_LOGGER } from '../utils/logger'
import { castValue } from '@ccd/shared-utils'

type ValuesRecord = Record<string, unknown>

function isPromiseLike(value: unknown): value is Promise<void> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'catch' in value &&
    typeof value.catch === 'function'
  )
}

/**
 * 声明式跨字段联动引擎 (Reaction Engine)
 *
 * 在 recomputeFields 管线中，于 visibleIf/disabledIf/requiredIf 之后、
 * OptionsLoader 之前执行。按拓扑序遍历字段，对每个字段的 reactions 数组
 * 依次执行匹配的内置动作和自定义 effect。
 *
 * 所有 setFieldValue/setFieldProps 操作均在当前事务内完成，
 * 由 TransactionManager 保证批量刷新，不会引起额外调度循环。
 */
export class ReactionEngine<TValues extends ValuesRecord = ValuesRecord> {
  constructor(
    private readonly store: SubscriptionStore<TValues>,
    private readonly setFieldPropsCallback: (name: string, props: Record<string, unknown>) => void
  ) {}

  /**
   * 对单个字段执行其声明的 reactions 列表。
   *
   * @param field     当前字段的 Schema
   * @param values    当前表单所有字段的值快照
   * @param fieldName 当前字段名
   * @param changedFields 本次事务中发生变化的字段集合（用于匹配 watch）
   */
  evaluate(
    field: FieldSchema<unknown>,
    values: TValues,
    fieldName: keyof TValues & string,
    changedFields?: Set<string>
  ): void {
    if (!field.reactions || field.reactions.length === 0) return

    const ctx = this.buildContext(values, fieldName)

    for (const reaction of field.reactions) {
      // Schema at this boundary is still FieldSchema<unknown>; bridge reaction typing locally.
      const typedReaction = reaction as FieldReaction<TValues>
      const watchFields = Array.isArray(typedReaction.watch)
        ? typedReaction.watch
        : [typedReaction.watch]

      // 若提供了 changedFields，仅在 watch 的字段确实发生变化时才执行
      if (changedFields && changedFields.size > 0) {
        const isTriggered = watchFields.some(w => changedFields.has(w))
        if (!isTriggered) continue
      }

      try {
        this.executeAction(typedReaction, fieldName)

        if (typeof typedReaction.effect === 'function') {
          const result = typedReaction.effect(ctx)
          // 若 effect 返回 Promise，静默消费但不阻塞同步管线
          if (isPromiseLike(result)) {
            result.catch((err: unknown) => {
              PRO_FORM_LOGGER.error(`Reaction effect (async) error in field "${fieldName}"`, err)
            })
          }
        }
      } catch (error) {
        PRO_FORM_LOGGER.error(`Reaction error in field "${fieldName}"`, error)
      }
    }
  }

  private executeAction(reaction: FieldReaction<TValues>, fieldName: keyof TValues & string): void {
    switch (reaction.action) {
      case 'clearValue':
        this.store.setFieldValue(fieldName, undefined)
        break

      case 'hide': {
        const hideState = this.store.getFieldState(fieldName)
        if (hideState) {
          this.store.setFieldState(fieldName, { ...hideState, visible: false })
        }
        break
      }

      case 'show': {
        const showState = this.store.getFieldState(fieldName)
        if (showState) {
          this.store.setFieldState(fieldName, { ...showState, visible: true })
        }
        break
      }

      case 'disable': {
        const disableState = this.store.getFieldState(fieldName)
        if (disableState) {
          this.store.setFieldState(fieldName, { ...disableState, disabled: true })
        }
        break
      }

      case 'enable': {
        const enableState = this.store.getFieldState(fieldName)
        if (enableState) {
          this.store.setFieldState(fieldName, { ...enableState, disabled: false })
        }
        break
      }

      case 'custom':
        // custom action 由 effect 回调处理，此处无需额外操作
        break

      default:
        PRO_FORM_LOGGER.warn(`Unknown reaction action "${reaction.action}" in field "${fieldName}"`)
    }
  }

  private buildContext(
    values: TValues,
    fieldName: keyof TValues & string
  ): ReactionContext<TValues> {
    return {
      form: values,
      field: fieldName,
      getFieldState: (name: string) => {
        return this.store.getFieldState(name)
      },
      setFieldValue: (name: string, value: unknown) => {
        this.store.setFieldValue(name, castValue<FormFieldValue<TValues>>(value))
      },
      setFieldProps: (name: string, props: Record<string, unknown>) => {
        this.setFieldPropsCallback(name, props)
      },
    }
  }
}
