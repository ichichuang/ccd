/**
 * 系统 API 模块
 * 动态路由、权限菜单等接口，严格使用 DTO 类型
 * 禁止导入 Pinia stores，避免循环依赖
 */

import { get } from '@/utils/http/methods'
import {
  systemAsyncRouteItemSchema,
  systemAsyncRoutesRawSchema,
  type SystemAsyncRouteItem,
  type SystemAsyncRoutesRawRes,
} from '@/types/dto/system.dto'
import { parseZodHttpPayload } from '@/adapters/http.adapter'

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
 * 当前为 mock 实现；对接后端时改为 requestSystemAsyncRoutesReal。
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
  const routes: SystemAsyncRouteItem[] = [
    {
      path: '/example/hooks/use-date-utils',
      component: 'example/hooks/use-date-utils',
      meta: { titleKey: 'router.example.hooks.composables.useDateUtils' },
    },
    {
      path: '/example/hooks/use-theme-switch',
      component: 'example/hooks/use-theme-switch',
      meta: { titleKey: 'router.example.hooks.composables.useThemeSwitch' },
    },
    {
      path: '/example/hooks/use-http-request',
      component: 'example/hooks/use-http-request',
      meta: { titleKey: 'router.example.hooks.composables.useHttpRequest' },
    },
  ]
  return parseZodHttpPayload(systemAsyncRouteItemSchema.array(), routes)
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
 * 响应拦截器已统一解包标准 ApiResponse.data，本函数只接收并校验业务 payload。
 * 增强：基础字段校验，过滤无效路由项
 */
export const requestSystemAsyncRoutesReal = async (): Promise<SystemAsyncRouteItem[]> => {
  const raw = await get<SystemAsyncRoutesRawRes>(SYSTEM_ASYNC_ROUTES_URL, {
    enableCache: false,
    cacheFor: { mode: 'memory', expire: 300000 },
    responseSchema: systemAsyncRoutesRawSchema,
  })
  const routes: SystemAsyncRouteItem[] = extractRoutes(raw)
  if (!Array.isArray(routes)) {
    throw new Error('动态路由数据格式不正确，预期为数组或包含 routes 字段的对象')
  }
  return validateRouteItems(routes)
}
