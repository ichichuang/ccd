import type { Component } from 'vue'
import { castValue } from '@ccd/shared-utils'
import type {
  FieldComponentProps,
  FieldProps,
  FieldRegistryItem,
  FieldComponent,
  FormValuesRecord,
} from '../types'

function isFieldRegistryItem<TValue>(value: unknown): value is FieldRegistryItem<TValue> {
  return typeof value === 'object' && value !== null && 'component' in value
}

export class FieldRegistry {
  private readonly registry = new Map<string, FieldRegistryItem<unknown>>()

  /**
   * 注册字段渲染组件
   *
   * - 支持直接传入组件（向后兼容）
   * - 也支持传入包含默认配置与 props 映射器的 FieldRegistryItem
   */
  register<TValue>(name: string, component: Component<FieldComponentProps<TValue>>): void
  register<TValue>(name: string, item: FieldRegistryItem<TValue>): void
  register<TValue>(
    name: string,
    componentOrItem: Component<FieldComponentProps<TValue>> | FieldRegistryItem<TValue>
  ): void {
    const item: FieldRegistryItem<TValue> = isFieldRegistryItem<TValue>(componentOrItem)
      ? componentOrItem
      : {
          component: castValue<FieldComponent<TValue>>(componentOrItem),
        }

    this.registry.set(name, castValue<FieldRegistryItem<unknown>>(item))
  }

  get<
    TValue = unknown,
    TFieldProps extends FieldProps = FieldProps,
    TValues extends FormValuesRecord = FormValuesRecord,
  >(name: string): FieldRegistryItem<TValue, TFieldProps, TValues> | undefined {
    return castValue<FieldRegistryItem<TValue, TFieldProps, TValues> | undefined>(
      this.registry.get(name)
    )
  }

  has(name: string): boolean {
    return this.registry.has(name)
  }
}

export const fieldRegistry = new FieldRegistry()
