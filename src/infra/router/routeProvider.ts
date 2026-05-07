export interface RouterCapabilities {
  getAdminMenuTree: () => MenuItem[]
  getFlatRouteList: () => RouteConfig[]
}

let capabilities: Readonly<RouterCapabilities> | null = null

function assertRouterCapabilities(candidate: RouterCapabilities): void {
  if (typeof candidate.getAdminMenuTree !== 'function') {
    throw new TypeError('[RouterCapabilities] getAdminMenuTree must be a function')
  }
  if (typeof candidate.getFlatRouteList !== 'function') {
    throw new TypeError('[RouterCapabilities] getFlatRouteList must be a function')
  }
}

function createMissingCapabilitiesError(): Error {
  return new Error('[RouterCapabilities] Router capabilities are not installed')
}

export function installRouterCapabilities(caps: RouterCapabilities): void {
  assertRouterCapabilities(caps)
  capabilities = Object.freeze({
    getAdminMenuTree: caps.getAdminMenuTree,
    getFlatRouteList: caps.getFlatRouteList,
  })
}

export function isRouterCapabilitiesInstalled(): boolean {
  return capabilities !== null
}

export function getRouterCapabilities(): RouterCapabilities {
  if (!capabilities) {
    throw createMissingCapabilitiesError()
  }
  return capabilities
}

export function resetRouterCapabilitiesForTest(): void {
  if (import.meta.env.MODE !== 'test') {
    throw new Error('[RouterCapabilities] resetRouterCapabilitiesForTest is test-only')
  }
  capabilities = null
}
