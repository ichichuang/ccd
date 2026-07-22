/**
 * 系统 API 模块
 * 动态路由、权限菜单等接口，严格使用 DTO 类型
 * 禁止导入 Pinia stores，避免循环依赖
 */

import { get } from '@/utils/http/methods'
import {
  systemAsyncRoutesRawSchema,
  type SystemAsyncRouteItem,
  type SystemAsyncRoutesRawRes,
} from '@/types/dto/system.dto'
import { appLogger } from '@/adapters/logger.adapter'
import { API_ENDPOINTS } from '@/constants/http'
import { DEMO_MOCK_ENABLED, requestDemoSystemAsyncRoutes } from '@/demo/mock'

/** 路由校验错误码 */
export const SYSTEM_ERROR_CODES = {
  invalidRoutes: 'SYSTEM_INVALID_ROUTES',
  invalidResponse: 'SYSTEM_INVALID_RESPONSE',
} as const

export type SystemErrorCode = (typeof SYSTEM_ERROR_CODES)[keyof typeof SYSTEM_ERROR_CODES]

export class SystemApiError extends Error {
  constructor(
    public readonly code: SystemErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'SystemApiError'
  }
}

/**
 * 从原始响应中提取路由数组
 */
function extractRoutes(raw: SystemAsyncRoutesRawRes): SystemAsyncRouteItem[] {
  if (Array.isArray(raw)) {
    return raw
  }
  if (Array.isArray(raw?.routes)) {
    return raw.routes
  }
  return []
}

/**
 * 获取动态路由 API
 * 显式演示模式使用隔离边界；默认请求真实后端。
 */
export const requestSystemAsyncRoutes = async (): Promise<SystemAsyncRouteItem[]> => {
  if (DEMO_MOCK_ENABLED) {
    return requestDemoSystemAsyncRoutes()
  }
  return requestSystemAsyncRoutesReal()
}

/**
 * 路由数据校验：确保 path 和 component 合法
 * 无效路由项会抛出异常，防止静默丢失路由
 */
function validateRouteItems(routes: SystemAsyncRouteItem[]): SystemAsyncRouteItem[] {
  const invalid: { index: number; route: SystemAsyncRouteItem; reason: string }[] = []

  const valid = routes.filter((route: SystemAsyncRouteItem, index: number) => {
    if (typeof route.path !== 'string' || route.path.length === 0) {
      invalid.push({ index, route, reason: 'path missing or not a string' })
      return false
    }
    if (route.component !== undefined && typeof route.component !== 'string') {
      invalid.push({ index, route, reason: `component is not a string on ${route.path}` })
      return false
    }
    return true
  })

  if (invalid.length > 0) {
    appLogger.warn(
      `[System API] ${invalid.length} invalid route(s) filtered:`,
      invalid.map(i => `[${i.index}] ${i.reason}`)
    )
  }

  return valid
}

/**
 * 真实请求实现（对接后端时启用）
 * 响应拦截器已统一解包标准 BackendApiResponseEnvelope.data，本函数只接收并校验业务 payload。
 * 增强：基础字段校验，过滤无效路由项
 */
export const requestSystemAsyncRoutesReal = async (): Promise<SystemAsyncRouteItem[]> => {
  const raw = await get<SystemAsyncRoutesRawRes>(API_ENDPOINTS.system.asyncRoutes, {
    enableCache: false,
    cacheFor: { mode: 'memory', expire: 300000 },
    responseSchema: systemAsyncRoutesRawSchema,
  })
  const routes: SystemAsyncRouteItem[] = extractRoutes(raw)
  if (!Array.isArray(routes)) {
    throw new SystemApiError(
      SYSTEM_ERROR_CODES.invalidResponse,
      'Expected routes array or { routes: [] } object'
    )
  }
  return validateRouteItems(routes)
}
