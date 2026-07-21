import { createCapabilityBridge } from '@ccd/shared-utils'

export interface RouterCapabilities {
  getAdminMenuTree: () => MenuItem[]
  getFlatRouteList: () => RouteConfig[]
}

const bridge = createCapabilityBridge<RouterCapabilities>({
  label: 'RouterCapabilities',
  assert(candidate) {
    if (typeof candidate.getAdminMenuTree !== 'function') {
      throw new TypeError('[RouterCapabilities] getAdminMenuTree must be a function')
    }
    if (typeof candidate.getFlatRouteList !== 'function') {
      throw new TypeError('[RouterCapabilities] getFlatRouteList must be a function')
    }
  },
  onMissing: 'throw',
})

export function installRouterCapabilities(caps: RouterCapabilities): void {
  bridge.install(caps)
}

export function isRouterCapabilitiesInstalled(): boolean {
  return bridge.isInstalled()
}

export function getRouterCapabilities(): RouterCapabilities {
  return bridge.getOrThrow()
}
