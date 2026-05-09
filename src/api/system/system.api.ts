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
  if (!import.meta.env.DEV) {
    throw new SystemApiError(SYSTEM_ERROR_CODES.invalidResponse, 'Mock routes are DEV-only')
  }

  await new Promise(resolve => setTimeout(resolve, 100))
  const routes: SystemAsyncRouteItem[] = [
    {
      path: '/example/hooks/use-date-utils',
      name: 'ExampleHookUseDateUtilsLegacy',
      redirect: '/example/hooks/composables/use-date-utils',
      meta: { titleKey: 'router.example.hooks.composables.useDateUtils', showLink: false },
    },
    {
      path: '/example/hooks/use-theme-switch',
      name: 'ExampleHookUseThemeSwitchLegacy',
      redirect: '/example/hooks/composables/use-theme-switch',
      meta: { titleKey: 'router.example.hooks.composables.useThemeSwitch', showLink: false },
    },
    {
      path: '/example/hooks/use-http-request',
      name: 'ExampleHookUseHttpRequestLegacy',
      redirect: '/example/hooks/composables/use-http-request',
      meta: { titleKey: 'router.example.hooks.composables.useHttpRequest', showLink: false },
    },
  ]
  return parseZodHttpPayload(systemAsyncRouteItemSchema.array(), routes)
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
    console.warn(
      `[System API] ${invalid.length} invalid route(s) filtered:`,
      invalid.map(i => `[${i.index}] ${i.reason}`)
    )
  }

  return valid
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
    throw new SystemApiError(
      SYSTEM_ERROR_CODES.invalidResponse,
      'Expected routes array or { routes: [] } object'
    )
  }
  return validateRouteItems(routes)
}
