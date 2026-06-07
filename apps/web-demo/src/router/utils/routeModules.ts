export interface RouteModuleFile {
  default: RouteModule
  [key: string]: unknown
}

export type RouteModuleLoader = () => Promise<RouteModuleFile>
export type RouteModuleLoaderRecord = Record<string, RouteModuleLoader>

export interface RouteModuleDiscoveryOptions {
  prefix?: string
}

const DEFAULT_ROUTE_MODULE_PREFIX = './modules/'
const ROUTE_MODULE_EXTENSION = '.ts'
const ROUTE_MODULE_SPEC_EXTENSION = '.spec.ts'

export function defineRouteModule<T extends RouteModule>(routes: T): T {
  return routes
}

export function isTopLevelRouteModulePath(
  path: string,
  options: RouteModuleDiscoveryOptions = {}
): boolean {
  const prefix = options.prefix ?? DEFAULT_ROUTE_MODULE_PREFIX

  if (!path.startsWith(prefix)) return false
  if (!path.endsWith(ROUTE_MODULE_EXTENSION)) return false
  if (path.endsWith(ROUTE_MODULE_SPEC_EXTENSION)) return false

  const moduleName = path.slice(prefix.length, -ROUTE_MODULE_EXTENSION.length)
  return moduleName.length > 0 && !moduleName.includes('/')
}

export function defineRouteModuleLoaders<T extends RouteModuleLoaderRecord>(
  loaders: T,
  options: RouteModuleDiscoveryOptions = {}
): T {
  const invalidModulePaths = Object.keys(loaders).filter(
    path => !isTopLevelRouteModulePath(path, options)
  )

  if (invalidModulePaths.length > 0) {
    throw new Error(
      `[RouteModules] Static route discovery must stay top-level: ${invalidModulePaths.join(', ')}`
    )
  }

  return loaders
}

export function routeModuleToRoutes(routeModule: RouteModule): RouteConfig[] {
  return Array.isArray(routeModule) ? routeModule : [routeModule]
}

export function collectRouteModuleRoutes(
  modules: Readonly<Record<string, RouteModule>>
): RouteConfig[] {
  return Object.values(modules).flatMap(routeModuleToRoutes)
}
