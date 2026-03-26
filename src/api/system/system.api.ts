/**
 * 系统 API 模块
 * 动态路由、权限菜单等接口，严格使用 DTO 类型
 * 禁止导入 Pinia stores，避免循环依赖
 */

import { get } from '@/utils/http/methods'
import type { ApiResponse } from '@/types/api'
import type { SystemAsyncRouteItem, SystemAsyncRoutesRawRes } from '@/types/dto/system.dto'

/** 动态路由 API 路径（对接后端时使用） */
const SYSTEM_ASYNC_ROUTES_URL = '/system/menu/routes'

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
 * 当前为 mock 实现；对接后端时改为 get<ApiResponse<SystemAsyncRoutesRawRes>> 并解包 data
 */
export const requestSystemAsyncRoutes = async (): Promise<SystemAsyncRouteItem[]> => {
  return requestSystemAsyncRoutesMock()
}

/**
 * 模拟「获取动态路由」
 * 返回空数组，表示当前仅使用静态路由；对接后端时切换为 requestSystemAsyncRoutesReal
 */
export const requestSystemAsyncRoutesMock = async (): Promise<SystemAsyncRouteItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 100))
  return [
    { path: '/example/hooks/use-date-utils', component: 'example/hooks/use-date-utils' },
    { path: '/example/hooks/use-theme-switch', component: 'example/hooks/use-theme-switch' },
    { path: '/example/hooks/use-http-request', component: 'example/hooks/use-http-request' },
  ] as SystemAsyncRouteItem[]
}

/**
 * 基础路由数据校验：确保 path 和 component 为字符串
 */
function validateRouteItems(routes: SystemAsyncRouteItem[]): SystemAsyncRouteItem[] {
  return routes.filter((route: SystemAsyncRouteItem) => {
    if (typeof route.path !== 'string' || route.path.length === 0) {
      console.warn('🪒 Router: 跳过无效路由（path 缺失或非字符串）:', route)
      return false
    }
    if (route.component !== undefined && typeof route.component !== 'string') {
      console.warn(`🪒 Router: 跳过无效路由 ${route.path}（component 非字符串）:`, route)
      return false
    }
    return true
  })
}

/**
 * 真实请求实现（对接后端时启用）
 * 后端返回标准 ApiResponse<SystemAsyncRoutesRawRes>，解包 data 后提取路由数组
 * 增强：基础字段校验，过滤无效路由项
 */
export const requestSystemAsyncRoutesReal = async (): Promise<SystemAsyncRouteItem[]> => {
  const res = await get<ApiResponse<SystemAsyncRoutesRawRes>>(SYSTEM_ASYNC_ROUTES_URL)
  const raw: SystemAsyncRoutesRawRes = res.data
  const routes: SystemAsyncRouteItem[] = extractRoutes(raw)
  if (!Array.isArray(routes)) {
    throw new Error('动态路由数据格式不正确，预期为数组或包含 routes 字段的对象')
  }
  return validateRouteItems(routes)
}
