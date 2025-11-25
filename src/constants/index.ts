// 配置统一管理入口
import { autoImportModulesSync } from '@/utils'

// 自动导入所有配置模块
const modules = import.meta.glob('./modules/**/*.ts', { eager: true })
const importedModules = autoImportModulesSync(modules)
export default importedModules

// 导出所有配置模块
export * from '@/constants/modules/layout'
export * from '@/constants/modules/http'
export * from '@/constants/modules/rem'
export * from '@/constants/modules/router'
export * from '@/constants/modules/theme'
