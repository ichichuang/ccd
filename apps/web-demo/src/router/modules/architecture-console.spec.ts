// @vitest-environment jsdom

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { messages } from '@/locales'
import { validateRegisteredRouteMetadata } from '../utils/metadata'
import {
  collectRouteModuleRoutes,
  defineRouteModule,
  defineRouteModuleLoaders,
  isTopLevelRouteModulePath,
  type RouteModuleFile,
  type RouteModuleLoaderRecord,
} from '../utils/routeModules'

type LazyRouteComponent = () => Promise<unknown>
type LazyRouteComponentRoute = RouteConfig & { component: LazyRouteComponent }

const permissionStoreMock = vi.hoisted(() => ({
  ensureFixedTabsIfAvailable: vi.fn(),
}))

const routerGuardMock = vi.hoisted(() => ({
  registerRouterGuards: vi.fn((options: { dynamicRouteManager: unknown }) => {
    return options.dynamicRouteManager
  }),
}))

vi.mock('@/stores/modules/session/permission', () => ({
  usePermissionStoreWithOut: () => permissionStoreMock,
}))

vi.mock('@/router/utils/guards', () => routerGuardMock)

const EXPECTED_CONSOLE_ROUTE_RECORD_COUNT = 22
const EXPECTED_STATIC_ROUTE_RECORD_COUNT = 23
const EXPECTED_REGISTERED_ROUTE_RECORD_COUNT = 29
const LAZY_ROUTE_IMPORT_CONCURRENCY = 8
const ROUTE_SMOKE_IMPORT_TIMEOUT_MS = 20_000
const EXPECTED_REGISTERED_ROUTE_SIGNATURES = [
  '0|/|Root|/dashboard|static',
  '1|/login|Login||lazy',
  '2|/404|404||lazy',
  '3|/403|403||lazy',
  '4|/500|500||lazy',
  '5|/:pathMatch(.*)*|CatchAll|/404|static',
  '6|/dashboard|Dashboard||lazy',
  '7|/architecture|ArchitectureRoot|/architecture/topology|static',
  '8|/architecture/topology|ArchitectureTopology||lazy',
  '9|/architecture/package-boundaries|ArchitecturePackageBoundaries||lazy',
  '10|/architecture/runtime-boundaries|ArchitectureRuntimeBoundaries||lazy',
  '11|/architecture/governance|ArchitectureGovernance||lazy',
  '12|/runtime|RuntimeRoot|/runtime/http|static',
  '13|/runtime/http|RuntimeHttp||lazy',
  '14|/runtime/safe-storage|RuntimeSafeStorage||lazy',
  '15|/runtime/browser-runtime|RuntimeBrowser||lazy',
  '16|/runtime/state|RuntimeState||lazy',
  '17|/ui|UiRoot|/ui/primevue-adapter|static',
  '18|/ui/primevue-adapter|UiPrimeVueAdapter||lazy',
  '19|/ui/pro-form|UiProForm||lazy',
  '20|/ui/pro-table|UiProTable||lazy',
  '21|/ui/charts|UiCharts||lazy',
  '22|/ui/feedback|UiFeedback||lazy',
  '23|/system|SystemRoot|/system/theme|static',
  '24|/system/theme|SystemTheme||lazy',
  '25|/system/size-breakpoints|SystemSizeBreakpoints||lazy',
  '26|/system/layout|SystemLayout||lazy',
  '27|/system/unocss|SystemUnocss||lazy',
  '28|/desktop|DesktopBoundary||lazy',
] as const

const registeredRouteModuleLoaders = defineRouteModuleLoaders(
  import.meta.glob<RouteModuleFile>(['./*.ts', '!./*.spec.ts']),
  { prefix: './' }
)
const consoleViewSourceModules = import.meta.glob<string>(
  ['../../views/architecture-console/**/*.{vue,ts,tsx}', '../../views/dashboard/**/*.{vue,ts,tsx}'],
  {
    eager: true,
    import: 'default',
    query: '?raw',
  }
)

let consoleRoutes: RouteConfig[] = []
let staticRoutes: RouteConfig[] = []
let registeredRoutes: RouteConfig[] = []
let flatConsoleRoutes: RouteConfig[] = []
let flatStaticRoutes: RouteConfig[] = []
let flatRegisteredRoutes: RouteConfig[] = []

function toRouteArray(routeModule: RouteModule | undefined): RouteConfig[] {
  if (!routeModule) return []
  return Array.isArray(routeModule) ? routeModule : [routeModule]
}

function flattenRouteRecords(routes: RouteConfig[]): RouteConfig[] {
  return routes.flatMap(route => [route, ...flattenRouteRecords(route.children ?? [])])
}

function getRouteLabel(route: RouteConfig): string {
  return route.name ? `${String(route.name)} (${route.path})` : route.path
}

function getRouteSignature(route: RouteConfig, index: number): string {
  const name = route.name === undefined || route.name === null ? '' : String(route.name)
  const redirect = typeof route.redirect === 'string' ? route.redirect : ''
  const componentKind = typeof route.component === 'function' ? 'lazy' : 'static'
  return `${index}|${route.path}|${name}|${redirect}|${componentKind}`
}

const PAGE_TRANSLATION_KEY_PATTERN =
  /['"]((?:chart|common|dialog|emptyState|http|login|proForm|proTable|router|settings)\.[A-Za-z0-9_.-]+)['"]/g

function hasLazyRouteComponent(route: RouteConfig): route is RouteConfig & {
  component: LazyRouteComponent
} {
  return typeof route.component === 'function'
}

async function resolveLazyRouteComponentModules(
  routes: LazyRouteComponentRoute[]
): Promise<Array<{ route: LazyRouteComponentRoute; moduleValue: unknown }>> {
  const resolvedModules: Array<{ route: LazyRouteComponentRoute; moduleValue: unknown }> = []

  for (let start = 0; start < routes.length; start += LAZY_ROUTE_IMPORT_CONCURRENCY) {
    const batch = routes.slice(start, start + LAZY_ROUTE_IMPORT_CONCURRENCY)
    const batchModules = await Promise.all(
      batch.map(async route => ({
        route,
        moduleValue: await route.component(),
      }))
    )

    resolvedModules.push(...batchModules)
  }

  return resolvedModules
}

function hasDefaultExport(moduleValue: unknown): boolean {
  return typeof moduleValue === 'object' && moduleValue !== null && 'default' in moduleValue
}

function getLocaleMessage(localeMessages: unknown, localeKey: string): unknown {
  let cursor = localeMessages

  for (const segment of localeKey.split('.')) {
    if (typeof cursor !== 'object' || cursor === null || Array.isArray(cursor)) return undefined
    cursor = (cursor as Record<string, unknown>)[segment]
  }

  return cursor
}

function hasStringLocaleMessage(localeMessages: unknown, localeKey: string): boolean {
  return typeof getLocaleMessage(localeMessages, localeKey) === 'string'
}

function collectRouteTitleKeys(routes: RouteConfig[]): string[] {
  const titleKeys: string[] = []

  routes.forEach(route => {
    const titleKey = route.meta?.titleKey
    if (typeof titleKey === 'string') titleKeys.push(titleKey)
  })

  return [...new Set(titleKeys)].sort()
}

function collectPageTranslationKeys(sourceModules: Record<string, string>): string[] {
  const localeKeys = new Set<string>()

  Object.values(sourceModules).forEach(source => {
    for (const match of source.matchAll(PAGE_TRANSLATION_KEY_PATTERN)) {
      localeKeys.add(match[1])
    }
  })

  return [...localeKeys].sort()
}

function findRouteByName(routes: RouteConfig[], name: string): RouteConfig | undefined {
  for (const route of routes) {
    if (route.name === name) return route
    if (route.children) {
      const child = findRouteByName(route.children, name)
      if (child) return child
    }
  }
  return undefined
}

beforeAll(async () => {
  vi.resetModules()
  vi.stubEnv('VITE_ROUTER_MODE', 'hash')
  vi.stubEnv('VITE_PUBLIC_PATH', '/')
  vi.stubEnv('VITE_ROOT_REDIRECT', '/dashboard')
  vi.stubEnv('VITE_APP_ENV', 'development')
  vi.stubEnv('VITE_API_BASE_URL', 'http://127.0.0.1')

  const [
    routerModule,
    coreModule,
    constantsModule,
    architectureModule,
    runtimeModule,
    uiModule,
    systemModule,
    desktopModule,
  ] = await Promise.all([
    import('@/router'),
    import('./core'),
    import('@/constants/router'),
    import('./architecture'),
    import('./runtime'),
    import('./ui'),
    import('./system'),
    import('./desktop'),
  ])

  consoleRoutes = [
    ...toRouteArray(architectureModule.default),
    ...toRouteArray(runtimeModule.default),
    ...toRouteArray(uiModule.default),
    ...toRouteArray(systemModule.default),
    ...toRouteArray(desktopModule.default),
  ]
  staticRoutes = await routerModule.ensureStaticRoutesLoaded()
  registeredRoutes = [...coreModule.default, ...constantsModule.rootRedirect, ...staticRoutes]

  flatConsoleRoutes = flattenRouteRecords(consoleRoutes)
  flatStaticRoutes = flattenRouteRecords(staticRoutes)
  flatRegisteredRoutes = flattenRouteRecords(registeredRoutes)
})

describe('web-demo architecture console route coverage', () => {
  it('registers the intentional compact route inventory and order', () => {
    expect(flatConsoleRoutes).toHaveLength(EXPECTED_CONSOLE_ROUTE_RECORD_COUNT)
    expect(flatStaticRoutes).toHaveLength(EXPECTED_STATIC_ROUTE_RECORD_COUNT)
    expect(flatRegisteredRoutes).toHaveLength(EXPECTED_REGISTERED_ROUTE_RECORD_COUNT)
    expect(flatRegisteredRoutes.map(getRouteSignature)).toEqual(
      EXPECTED_REGISTERED_ROUTE_SIGNATURES
    )

    const registeredModulePaths = Object.keys(registeredRouteModuleLoaders).sort()

    expect(registeredModulePaths).toEqual([
      './architecture.ts',
      './core.ts',
      './dashboard.ts',
      './desktop.ts',
      './runtime.ts',
      './system.ts',
      './ui.ts',
    ])
    registeredModulePaths.forEach(modulePath => {
      expect(isTopLevelRouteModulePath(modulePath, { prefix: './' })).toBe(true)
    })
  })

  it('keeps route module registration typed and top-level only', () => {
    const invalidNestedRouteModuleLoaders: RouteModuleLoaderRecord = {}
    invalidNestedRouteModuleLoaders['./modules/dashboard.ts'] = async () => ({ default: [] })
    invalidNestedRouteModuleLoaders['./modules/console/runtime.ts'] = async () => ({
      default: [],
    })

    const typedRoute = defineRouteModule({
      path: '/typed-registration-smoke',
      name: 'TypedRegistrationSmoke',
      meta: { titleKey: 'router.core.root' },
    } satisfies RouteConfig)
    const typedRouteGroup = defineRouteModule([
      {
        path: '/typed-registration-group-smoke',
        name: 'TypedRegistrationGroupSmoke',
        meta: { titleKey: 'router.core.root' },
      },
    ] satisfies RouteConfig[])

    expect(
      collectRouteModuleRoutes({ typedRoute, typedRouteGroup }).map(route => route.path)
    ).toEqual(['/typed-registration-smoke', '/typed-registration-group-smoke'])
    expect(() =>
      defineRouteModuleLoaders(invalidNestedRouteModuleLoaders, { prefix: './modules/' })
    ).toThrow(/top-level/)
  })

  it('keeps every registered route path, name, and redirect valid', () => {
    const registeredPathSet = new Set(flatRegisteredRoutes.map(route => route.path))
    const routesByName = new Map<NonNullable<RouteConfig['name']>, string[]>()

    flatRegisteredRoutes.forEach(route => {
      expect(route.path, getRouteLabel(route)).toMatch(/^\/(?!\/)/)
      expect(route.path.trim(), getRouteLabel(route)).toBe(route.path)
      expect(route.path.includes('//'), getRouteLabel(route)).toBe(false)
      expect(route.path.startsWith('/example'), getRouteLabel(route)).toBe(false)

      if (route.name !== undefined && route.name !== null) {
        const paths = routesByName.get(route.name) ?? []
        routesByName.set(route.name, [...paths, route.path])
      }

      if (!route.redirect) return

      expect(typeof route.redirect, `${getRouteLabel(route)} redirect type`).toBe('string')
      if (typeof route.redirect !== 'string') return

      const [redirectPath] = route.redirect.split(/[?#]/)
      expect(route.redirect.startsWith('/'), `${getRouteLabel(route)} redirect target`).toBe(true)
      expect(
        registeredPathSet.has(redirectPath),
        `${getRouteLabel(route)} redirects to registered path ${route.redirect}`
      ).toBe(true)
    })

    const duplicateRouteNames = [...routesByName.entries()].filter(([, paths]) => paths.length > 1)
    expect(duplicateRouteNames).toEqual([])
  })

  it('keeps every registered route metadata record valid', () => {
    const metadataIssues = validateRegisteredRouteMetadata(flatRegisteredRoutes, {
      localeMessages: messages,
    })

    expect(
      metadataIssues,
      metadataIssues.map(issue => `${issue.route} ${issue.field}: ${issue.message}`).join('\n')
    ).toEqual([])
  })

  it('covers registered route titleKeys and console page translation keys in every locale', () => {
    const routeTitleKeys = collectRouteTitleKeys(flatRegisteredRoutes)
    const pageTranslationKeys = collectPageTranslationKeys(consoleViewSourceModules)
    const coveredLocaleKeys = [...new Set([...routeTitleKeys, ...pageTranslationKeys])].sort()

    expect(routeTitleKeys.length).toBeGreaterThan(0)

    const missingLocaleKeys = Object.entries(messages).flatMap(([locale, localeMessages]) => {
      return coveredLocaleKeys
        .filter(localeKey => !hasStringLocaleMessage(localeMessages, localeKey))
        .map(localeKey => `${locale}:${localeKey}`)
    })

    expect(missingLocaleKeys).toEqual([])
  })

  it('preserves intentional layout metadata while retiring the example museum', () => {
    const dashboardRoute = findRouteByName(staticRoutes, 'Dashboard')
    const systemThemeRoute = findRouteByName(staticRoutes, 'SystemTheme')
    const consolePaths = flatConsoleRoutes.map(route => route.path)

    expect(dashboardRoute?.meta?.fixedTag).toBe(true)
    expect(dashboardRoute?.meta?.keepAlive).toBe(true)
    expect(systemThemeRoute?.meta?.reuseWindow).toBeUndefined()
    expect(consolePaths).toEqual(
      expect.arrayContaining([
        '/architecture/topology',
        '/runtime/http',
        '/ui/pro-form',
        '/system/theme',
        '/desktop',
      ])
    )
    expect(consolePaths.some(path => path.startsWith('/example'))).toBe(false)
  })

  it(
    'resolves every lazy component import target',
    async () => {
      const lazyComponentRoutes = flatRegisteredRoutes.filter(hasLazyRouteComponent)

      expect(lazyComponentRoutes.length).toBeGreaterThan(0)

      const resolvedModules = await resolveLazyRouteComponentModules(lazyComponentRoutes)

      resolvedModules.forEach(({ route, moduleValue }) => {
        expect(hasDefaultExport(moduleValue), `${getRouteLabel(route)} lazy import`).toBe(true)
      })
    },
    ROUTE_SMOKE_IMPORT_TIMEOUT_MS
  )
})
