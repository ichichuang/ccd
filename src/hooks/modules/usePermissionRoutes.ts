import { requestSystemAsyncRoutes } from '@/api/system/system.api'
import { deepClone } from '@/utils/lodashes'
import { usePermissionStore } from '@/stores/modules/session'
import { parseBackendRoutes } from '@/adapters/http.adapter'

/** 路由拉取配置 */
const FETCH_TIMEOUT_MS: number = 10_000
const MAX_RETRIES: number = 2
const CACHE_MAX_AGE_MS: number = 5 * 60 * 1000

interface FetchRoutesOptions {
  timeoutMs?: number
  maxRetries?: number
}

/** 缓存时间戳 */
let lastFetchTimestamp: number = 0

/**
 * 带超时的 Promise 包装
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer: ReturnType<typeof setTimeout> = setTimeout(
      () => reject(new Error(`动态路由请求超时 (${ms}ms)`)),
      ms
    )
    promise
      .then((val: T) => {
        clearTimeout(timer)
        resolve(val)
      })
      .catch((err: unknown) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

/**
 * 带重试的请求包装（指数退避）
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let lastError: unknown
  for (let attempt: number = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error
      if (attempt < maxRetries) {
        const delay: number = Math.min(1000 * 2 ** attempt, 5000)
        await new Promise<void>(resolve => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

/**
 * 权限路由拉取 composable
 *
 * 职责：调用 API、处理缓存降级，封装网络层与 Store 层之间的桥接逻辑。
 * Store 不应直接调用 API；此 composable 是唯一合法的动态路由数据来源。
 *
 * 数据流：`src/api/**` → `usePermissionRoutes` → `src/stores/permission`
 *
 * 增强特性：
 * - 请求超时保护（默认 10s）
 * - 自动重试（最多 2 次，指数退避）
 * - 缓存 staleness 检查（5 分钟内的缓存视为有效）
 *
 * @see {@link BackendRouteConfig} 全局类型定义位于 src/types/modules/router.d.ts:96
 */
export function usePermissionRoutes(): {
  fetchRoutes: (options?: FetchRoutesOptions) => Promise<BackendRouteConfig[]>
} {
  /**
   * 拉取动态路由并同步到 Store.dynamicRoutes。
   * 失败时若 Store 中有缓存则降级返回缓存，否则抛出错误供调用方处理。
   * 注意：不负责设置 `isDynamicRoutesLoaded`，由调用方在路由注册完成后统一标记。
   */
  const fetchRoutes = async (options: FetchRoutesOptions = {}): Promise<BackendRouteConfig[]> => {
    const permissionStore = usePermissionStore()
    const timeoutMs = options.timeoutMs ?? FETCH_TIMEOUT_MS
    const maxRetries = options.maxRetries ?? MAX_RETRIES

    // 缓存 staleness 检查：5 分钟内的缓存直接返回
    const now: number = Date.now()
    if (
      permissionStore.dynamicRoutes.length > 0 &&
      lastFetchTimestamp > 0 &&
      now - lastFetchTimestamp < CACHE_MAX_AGE_MS
    ) {
      return deepClone(permissionStore.dynamicRoutes) as BackendRouteConfig[]
    }

    try {
      const routes: unknown = await withRetry(
        () => withTimeout(requestSystemAsyncRoutes(), timeoutMs),
        maxRetries
      )
      const typedRoutes: BackendRouteConfig[] = parseBackendRoutes(routes)
      permissionStore.setDynamicRoutes(typedRoutes)
      lastFetchTimestamp = Date.now()
      return typedRoutes
    } catch (error: unknown) {
      console.error('🪒 Router: 获取动态路由失败，使用本地缓存:', error)
      if (permissionStore.dynamicRoutes.length > 0) {
        return deepClone(permissionStore.dynamicRoutes) as BackendRouteConfig[]
      }
      throw error
    }
  }

  return { fetchRoutes }
}
