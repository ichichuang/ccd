/**
 * 系统 API 模块
 * 动态路由、权限菜单等接口，严格使用 DTO 类型
 * 禁止导入 Pinia stores，避免循环依赖
 */

import { get } from '@/utils/http/methods'
import type { SystemAsyncRouteItem, SystemAsyncRoutesRawRes } from '@/api/types/system'

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
 * 当前为 mock 实现；对接后端时改为：get<SystemAsyncRoutesRawRes>(SYSTEM_ASYNC_ROUTES_URL)
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
  return []
}

/**
 * 真实请求实现（对接后端时启用）
 * 将 requestSystemAsyncRoutes 内部改为调用此函数即可
 */
export const requestSystemAsyncRoutesReal = async (): Promise<SystemAsyncRouteItem[]> => {
  const raw = await get<SystemAsyncRoutesRawRes>(SYSTEM_ASYNC_ROUTES_URL)
  const routes = extractRoutes(raw)
  if (!Array.isArray(routes)) {
    throw new Error('动态路由数据格式不正确，预期为数组或包含 routes 字段的对象')
  }
  return routes
}
