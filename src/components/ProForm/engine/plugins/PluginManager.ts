import type { FieldRegistryItem, ProFormPlugin, ProFormPluginContext } from '../types'
import { fieldRegistry } from '../registry/FieldRegistry'

class ProFormPluginManagerCore {
  private plugins: Set<string> = new Set()

  private context: ProFormPluginContext = {
    registerField: (name: string, item: FieldRegistryItem) => {
      fieldRegistry.register(name, item)
    },
  }

  use(plugin: ProFormPlugin): this {
    if (this.plugins.has(plugin.name)) {
      console.warn(`[ProForm] Plugin "${plugin.name}" is already installed.`)
      return this
    }

    try {
      plugin.install(this.context)
      this.plugins.add(plugin.name)
    } catch (error) {
      console.error(`[ProForm] Failed to install plugin "${plugin.name}":`, error)
    }

    return this
  }
}

export const pluginManager = new ProFormPluginManagerCore()
