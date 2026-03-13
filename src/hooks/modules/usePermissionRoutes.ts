import { requestSystemAsyncRoutes } from '@/api/system/system.api'
import { deepClone } from '@/utils/lodashes'
import { usePermissionStore } from '@/stores/modules/permission'

/**
 * 权限路由拉取 composable
 *
 * 职责：调用 API、处理缓存降级，封装网络层与 Store 层之间的桥接逻辑。
 * Store 不应直接调用 API；此 composable 是唯一合法的动态路由数据来源。
 *
 * 数据流：`src/api/**` → `usePermissionRoutes` → `src/stores/permission`
 */
export function usePermissionRoutes(): { fetchRoutes: () => Promise<BackendRouteConfig[]> } {
  /**
   * 拉取动态路由并同步到 Store.dynamicRoutes。
   * 失败时若 Store 中有缓存则降级返回缓存，否则抛出错误供调用方处理。
   * 注意：不负责设置 `isDynamicRoutesLoaded`，由调用方在路由注册完成后统一标记。
   */
  const fetchRoutes = async (): Promise<BackendRouteConfig[]> => {
    const permissionStore = usePermissionStore()
    try {
      const routes = await requestSystemAsyncRoutes()
      if (!Array.isArray(routes)) {
        throw new Error('动态路由数据格式不正确，预期为数组或包含 routes 字段的对象')
      }
      const typedRoutes = routes as BackendRouteConfig[]
      permissionStore.setDynamicRoutes(typedRoutes)
      return typedRoutes
    } catch (error) {
      console.error('🪒 Router: 获取动态路由失败，使用本地缓存:', error)
      if (permissionStore.dynamicRoutes.length > 0) {
        return deepClone(permissionStore.dynamicRoutes) as BackendRouteConfig[]
      }
      throw error
    }
  }

  return { fetchRoutes }
}
