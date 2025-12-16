/**
 * API 统一管理入口
 * 自动导入并导出所有 API 模块
 * @module api/index
 */

import { autoImportModulesSync } from '@/utils'

// 自动导入所有 API 模块
const apiModules = import.meta.glob('./modules/**/*.ts', { eager: true })
const importedAPIs = autoImportModulesSync(apiModules)

// 导出所有 API 模块
export * from '@!/modules/auth' // 认证相关接口
export * from '@!/modules/test' // 测试接口
export * from '@!/modules/example' // 示例 CRUD 接口
export * from '@!/modules/upload' // 文件上传接口
export * from '@!/modules/download' // 文件下载接口
export * from '@!/modules/health' // 健康检查接口
export * from '@!/modules/table' // 表格示例接口

// 导出所有 API
export default importedAPIs

// 类型定义
export type APIModules = typeof importedAPIs
