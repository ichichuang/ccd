/**
 * 示例接口模块
 * 提供完整的 CRUD 操作示例，支持数据加密解密
 * @module api/modules/example
 */

import { del, get, head, patch, post, put } from '@/utils'
import { getConnectionState } from '@/utils/modules/http/connection'
import type { WithSafeStorage } from '@/utils/modules/http/interceptors'
import { clearCache, getCacheStats, getRequestStats } from '@/utils/modules/http/methods'
import type { CacheStats, ConnectionState, RequestStats } from '@/utils/modules/http/types'

/**
 * 示例数据接口
 */
export interface ExampleItem {
  id: number
  name: string
  description?: string
  createdAt: string
}

/**
 * 示例列表查询参数
 */
export interface ExampleListParams {
  /** 页码，从 1 开始 */
  page?: number
  /** 每页数量，最大 100 */
  pageSize?: number
  /** 搜索关键词 */
  keyword?: string
}

/**
 * 示例列表响应
 */
export interface ExampleListResponse {
  /** 示例列表 */
  list: ExampleItem[]
  /** 总数量 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
}

/**
 * 创建示例参数
 */
export interface CreateExampleParams {
  /** 名称（必填） */
  name: string | undefined
  /** 描述（可选） */
  description?: string
}

/**
 * 更新示例参数
 */
export interface UpdateExampleParams {
  /** 示例 ID */
  id: number
  /** 名称（必填） */
  name: string | undefined
  /** 描述（可选） */
  description?: string
}

/**
 * 获取示例列表
 * 支持分页和关键词搜索
 * @param params - 查询参数
 * @returns Promise<ExampleListResponse>
 * @example
 * ```typescript
 * const result = await getExampleList({ page: 1, pageSize: 10, keyword: '示例' })
 * ```
 */
export const getExampleList = (params?: ExampleListParams) => {
  // 构建查询字符串
  const queryString = params
    ? '?' +
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&')
    : ''

  return get<ExampleListResponse>(`/api/example/list${queryString}`)
}

/**
 * 获取示例详情
 * @param id - 示例 ID
 * @returns Promise<ExampleItem>
 * @example
 * ```typescript
 * const detail = await getExampleDetail(1)
 * ```
 */
export const getExampleDetail = (id: number) => get<ExampleItem>(`/api/example/${id}`)

/**
 * 创建示例
 * 支持加密传输（添加 isSafeStorage: true）
 * @param data - 创建参数
 * @returns Promise<ExampleItem>
 * @example
 * ```typescript
 * // 普通创建
 * await createExample({ name: '示例', description: '描述' })
 *
 * // 加密创建
 * await createExample({ name: '示例', description: '描述', isSafeStorage: true })
 * ```
 */
export const createExample = (data: WithSafeStorage<CreateExampleParams>) =>
  post<ExampleItem>('/api/example/create', data)

/**
 * 更新示例
 * 支持加密传输（添加 isSafeStorage: true）
 * @param data - 更新参数
 * @returns Promise<ExampleItem>
 * @example
 * ```typescript
 * await updateExample({ id: 1, name: '新名称', description: '新描述' })
 * ```
 */
export const updateExample = (data: WithSafeStorage<UpdateExampleParams>) =>
  put<ExampleItem>('/api/example/update', data)

/**
 * 部分更新示例
 * 只更新提供的字段
 * @param id - 示例 ID
 * @param data - 部分更新数据
 * @returns Promise<ExampleItem>
 * @example
 * ```typescript
 * await patchExample(1, { name: '新名称' })
 * ```
 */
export const patchExample = (id: number, data: Partial<CreateExampleParams>) =>
  patch<ExampleItem>(`/api/example/patch/${id}`, data)

/**
 * 删除示例
 * @param id - 示例 ID
 * @returns Promise<{ id: number }>
 * @example
 * ```typescript
 * await deleteExample(1)
 * ```
 */
export const deleteExample = (id: number) => del<{ id: number }>(`/api/example/${id}`)

/**
 * 检查示例是否存在
 * 使用 HEAD 请求，不返回响应体，只检查资源是否存在
 * @param id - 示例 ID
 * @returns Promise<void>
 * @example
 * ```typescript
 * try {
 *   await checkExampleExists(1)
 *   console.log('示例存在')
 * } catch (error) {
 *   console.log('示例不存在')
 * }
 * ```
 */
export const checkExampleExists = (id: number) => head<void>(`/api/example/${id}`)

// ==================== 缓存管理 API ====================

/**
 * 获取缓存统计信息
 * 包括缓存命中率、缓存大小等信息
 * @returns CacheStats
 * @example
 * ```typescript
 * const stats = getCacheStatsApi()
 * console.log(`缓存命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
 * ```
 */
export const getCacheStatsApi = (): CacheStats => {
  return getCacheStats()
}

/**
 * 清除所有缓存
 * @returns void
 * @example
 * ```typescript
 * clearCacheApi()
 * console.log('缓存已清除')
 * ```
 */
export const clearCacheApi = (): void => {
  clearCache()
}

// ==================== 请求统计 API ====================

/**
 * 获取请求统计信息
 * 包括待处理请求数、队列长度、并发数等
 * @returns RequestStats
 * @example
 * ```typescript
 * const stats = getRequestStatsApi()
 * console.log(`待处理请求: ${stats.pendingRequests}`)
 * ```
 */
export const getRequestStatsApi = (): RequestStats => {
  return getRequestStats()
}

// ==================== 连接状态 API ====================

/**
 * 获取连接状态
 * 包括连接状态、重连次数、最后连接时间等
 * @returns ConnectionState
 * @example
 * ```typescript
 * const state = getConnectionStateApi()
 * if (state.isConnected) {
 *   console.log('网络已连接')
 * } else {
 *   console.log('网络已断开')
 * }
 * ```
 */
export const getConnectionStateApi = (): ConnectionState => {
  return getConnectionState()
}
