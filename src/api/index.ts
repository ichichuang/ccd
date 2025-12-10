// API 统一管理入口
import { autoImportModulesSync } from '@/utils'

// 自动导入所有 API 模块
const apiModules = import.meta.glob('./modules/**/*.ts', { eager: true })
const importedAPIs = autoImportModulesSync(apiModules)

// 导出所有 API 模块
export * from '@!/modules/auth'
export * from '@!/modules/test'

// 导出所有 API
export default importedAPIs

// 类型定义
export type APIModules = typeof importedAPIs
