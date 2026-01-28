/**
 * 自动导入模块的通用函数
 * @param modules - import.meta.glob 返回的模块对象
 * @param prefixToRemove - 需要从路径中移除的前缀字符串 (默认为 './modules/')
 */
export async function autoImportModules<T = any>(
  modules: Record<string, () => Promise<any>>,
  prefixToRemove = './modules/'
): Promise<Record<string, T>> {
  const importedModules: Record<string, T> = {}

  for (const [path, moduleLoader] of Object.entries(modules)) {
    try {
      const moduleName = path
        .replace(prefixToRemove, '')
        .replace(/\.(ts|js|vue)$/, '')
        .replace(/\/index$/, '')

      const moduleExports = await moduleLoader()
      const moduleContent = moduleExports.default || moduleExports
      importedModules[moduleName] = moduleContent
    } catch (error) {
      console.warn(`[ModuleLoader] Failed to load module from ${path}:`, error)
    }
  }

  return importedModules
}

/**
 * 同步版本的模块自动导入
 * @param modules - eager: true 的 glob 对象
 * @param prefixToRemove - 需要从路径中移除的前缀字符串 (默认为 './modules/')
 */
export function autoImportModulesSync<T = any>(
  modules: Record<string, any>,
  prefixToRemove = './modules/'
): Record<string, T> {
  const importedModules: Record<string, T> = {}

  for (const [path, moduleExports] of Object.entries(modules)) {
    try {
      const moduleName = path
        .replace(prefixToRemove, '')
        .replace(/\.(ts|js|vue)$/, '')
        .replace(/\/index$/, '')

      const moduleContent = moduleExports.default || moduleExports
      importedModules[moduleName] = moduleContent
    } catch (error) {
      console.warn(`[ModuleLoader] Failed to process module from ${path}:`, error)
    }
  }

  return importedModules
}
