/**
 * 健康检查接口模块
 * 用于监控服务器连接状态和健康状态
 * @module api/modules/health
 */

import { get } from '@/utils'

/**
 * 健康检查响应
 */
export interface HealthResponse {
  /** 服务器状态（'ok' 表示正常） */
  status: string
  /** 检查时间戳（ISO 字符串） */
  timestamp: string
  /** 服务器运行时间（秒） */
  uptime: number
  /** 运行环境（development/production） */
  environment: string
}

/**
 * 健康检查
 * 检查服务器健康状态，用于连接状态监控
 * 前端连接管理器会定期调用此接口
 * @returns Promise<HealthResponse>
 * @example
 * ```typescript
 * const health = await checkHealth()
 * if (health.status === 'ok') {
 *   console.log('服务器正常')
 * }
 * ```
 */
export const checkHealth = () => get<HealthResponse>('/api/health')
