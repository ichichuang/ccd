import { appLogger } from '@/adapters/logger.adapter'
import { castValue } from '@ccd/shared-utils'

/**
 * 自动导入模块的通用函数
 * @param modules - import.meta.glob 返回的模块对象
 * @param prefixToRemove - 需要从路径中移除的前缀字符串 (默认为 './modules/')
 */
export async function autoImportModules<T = unknown>(
  modules: Record<string, () => Promise<{ default?: unknown; [key: string]: unknown }>>,
  prefixToRemove = './modules/'
): Promise<Record<string, T>> {
  const importedModules: Record<string, T> = {}

  for (const [path, moduleLoader] of Object.entries(modules)) {
    try {
      const moduleName = getModuleName(path, prefixToRemove)

      const moduleExports = await moduleLoader()
      const moduleContent = castValue<T>(moduleExports.default ?? moduleExports)
      importedModules[moduleName] = moduleContent
    } catch (error) {
      appLogger.warn(`[ModuleLoader] Failed to load module from ${path}:`, error)
    }
  }

  return importedModules
}

export function getModuleName(path: string, prefixToRemove = './modules/'): string {
  return path
    .replace(prefixToRemove, '')
    .replace(/\.(ts|js|vue)$/, '')
    .replace(/\/index$/, '')
}

/**
 * 同步版本的模块自动导入
 * @param modules - eager: true 的 glob 对象
 * @param prefixToRemove - 需要从路径中移除的前缀字符串 (默认为 './modules/')
 * @deprecated Prefer lazy `autoImportModules()` unless a true synchronous bootstrap path is required.
 */
export function autoImportModulesSync<T = unknown>(
  modules: Record<string, { default?: unknown; [key: string]: unknown }>,
  prefixToRemove = './modules/'
): Record<string, T> {
  const importedModules: Record<string, T> = {}

  for (const [path, moduleExports] of Object.entries(modules)) {
    try {
      const moduleName = getModuleName(path, prefixToRemove)

      const moduleContent = castValue<T>(moduleExports.default ?? moduleExports)
      importedModules[moduleName] = moduleContent
    } catch (error) {
      appLogger.warn(`[ModuleLoader] Failed to process module from ${path}:`, error)
    }
  }

  return importedModules
}
