/**
 * Router / Route Provider（依赖注入）
 * 基础设施层提供路由能力抽象，避免 Store 直接依赖 router/utils，满足架构解耦边界。
 */

export interface RouterCapabilities {
  getAdminMenuTree: () => MenuItem[]
  getFlatRouteList: () => RouteConfig[]
}

let capabilities: RouterCapabilities | null = null

export function setRouterCapabilities(caps: RouterCapabilities): void {
  capabilities = caps
}

export function getRouterCapabilities(): RouterCapabilities {
  if (!capabilities) {
    console.warn('[Router Provider] Capabilities not initialized. Returning empty arrays.')
    return { getAdminMenuTree: () => [], getFlatRouteList: () => [] }
  }
  return capabilities
}
