import type { Component } from 'vue'
import { castValue } from '@ccd/shared-utils'
import type { FieldComponentProps, FieldRegistryItem, FieldComponent } from '../types'

function isFieldRegistryItem(value: unknown): value is FieldRegistryItem {
  return typeof value === 'object' && value !== null && 'component' in value
}

export class FieldRegistry {
  private readonly registry = new Map<string, FieldRegistryItem>()

  /**
   * 注册字段渲染组件
   *
   * - 支持直接传入组件（向后兼容）
   * - 也支持传入包含默认配置与 props 映射器的 FieldRegistryItem
   */
  register<T>(name: string, component: Component<FieldComponentProps<T>>): void
  register(name: string, item: FieldRegistryItem): void
  register<T>(
    name: string,
    componentOrItem: Component<FieldComponentProps<T>> | FieldRegistryItem
  ): void {
    const item: FieldRegistryItem = isFieldRegistryItem(componentOrItem)
      ? componentOrItem
      : {
          component: castValue<FieldComponent<unknown>>(componentOrItem),
        }

    this.registry.set(name, item)
  }

  get(name: string): FieldRegistryItem | undefined {
    return this.registry.get(name)
  }

  has(name: string): boolean {
    return this.registry.has(name)
  }
}

export const fieldRegistry = new FieldRegistry()
