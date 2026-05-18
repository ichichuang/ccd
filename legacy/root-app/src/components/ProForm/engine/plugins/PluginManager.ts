import type { FieldRegistryItem, ProFormPlugin, ProFormPluginContext } from '../types'
import { fieldRegistry } from '../registry/FieldRegistry'
import { PRO_FORM_LOGGER } from '../utils/logger'

class ProFormPluginManagerCore {
  private plugins: Set<string> = new Set()

  private context: ProFormPluginContext = {
    registerField: (name: string, item: FieldRegistryItem) => {
      fieldRegistry.register(name, item)
    },
  }

  use(plugin: ProFormPlugin): this {
    if (this.plugins.has(plugin.name)) {
      // 已安装时静默返回：组件 script setup 在路由切换/HMR 时会重复执行，use() 幂等安全
      return this
    }

    try {
      plugin.install(this.context)
      this.plugins.add(plugin.name)
    } catch (error) {
      PRO_FORM_LOGGER.error(`Failed to install plugin "${plugin.name}"`, error)
    }

    return this
  }
}

export const pluginManager = new ProFormPluginManagerCore()
