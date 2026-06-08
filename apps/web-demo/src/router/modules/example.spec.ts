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

const EXPECTED_EXAMPLE_ROUTE_RECORD_COUNT = 99
const EXPECTED_STATIC_ROUTE_RECORD_COUNT = 100
const EXPECTED_REGISTERED_ROUTE_RECORD_COUNT = 106
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
  '7|/example/system-configuration|ExampleSystemConfiguration|/example/system-configuration/theme|static',
  '8|/example/system-configuration/theme|ExampleSystemConfigurationTheme||lazy',
  '9|/example/system-configuration/size|ExampleSystemConfigurationSize||lazy',
  '10|/example/system-configuration/unocss|ExampleSystemConfigurationUnocss||lazy',
  '11|/example/system-configuration/breakpoints|ExampleSystemConfigurationBreakpoints||lazy',
  '12|/example/system-configuration/layout|ExampleSystemConfigurationLayout||lazy',
  '13|/example/components|ExampleComponents|/example/charts|static',
  '14|/example/primevue-collection|ExamplePrimevueCollection|/example/primevue-collection/overview|static',
  '15|/example/primevue-collection/overview|ExamplePrimeVue||lazy',
  '16|/example/primevue-collection/toast|ExamplePrimeVueToast||lazy',
  '17|/example/primevue-collection/prime-dialog|ExamplePrimeDialog||lazy',
  '18|/example/primevue-collection/pro-form|ExampleProForm|/example/primevue-collection/pro-form/basic|static',
  '19|/example/primevue-collection/pro-form/playground|ExampleProFormPlayground||lazy',
  '20|/example/primevue-collection/pro-form/basic|ExampleProFormBasic||lazy',
  '21|/example/primevue-collection/pro-form/group|ExampleProFormGroup||lazy',
  '22|/example/primevue-collection/pro-form/validation|ExampleProFormValidation||lazy',
  '23|/example/primevue-collection/pro-form/dag|ExampleProFormDag||lazy',
  '24|/example/primevue-collection/pro-form/reactions|ExampleProFormReactions||lazy',
  '25|/example/primevue-collection/pro-form/advanced|ExampleProFormAdvanced||lazy',
  '26|/example/primevue-collection/pro-form/plugins|ExampleProFormPlugins||lazy',
  '27|/example/primevue-collection/pro-form/api-events|ExampleProFormApiEvents||lazy',
  '28|/example/primevue-collection/pro-table|ExampleProTable|/example/primevue-collection/pro-table/basic|static',
  '29|/example/primevue-collection/pro-table/basic|ExampleProTableBasic||lazy',
  '30|/example/primevue-collection/pro-table/columns|ExampleProTableColumns||lazy',
  '31|/example/primevue-collection/pro-table/server|ExampleProTableServer||lazy',
  '32|/example/primevue-collection/pro-table/infinite|ExampleProTableInfinite||lazy',
  '33|/example/primevue-collection/pro-table/virtual|ExampleProTableVirtual||lazy',
  '34|/example/primevue-collection/pro-table/advanced|ExampleProTableAdvanced||lazy',
  '35|/example/primevue-collection/pro-table/api-events|ExampleProTableApiEvents||lazy',
  '36|/example/primevue-collection/pro-table/form-table-combo|ExampleProTableFormTableCombo||lazy',
  '37|/example/charts|ExampleCharts||lazy',
  '38|/example/components/icons|ExampleIcons||lazy',
  '39|/example/components/c-scrollbar|ExampleComponentsCScrollbar||lazy',
  '40|/example/components/empty-state|ExampleComponentsEmptyState||lazy',
  '41|/example/components/animate-wrapper|ExampleComponentsAnimateWrapper||lazy',
  '42|/example/hooks|ExampleHooks|/example/hooks/composables/use-date-utils|static',
  '43|/example/hooks/composables|ExampleHooksComposables|/example/hooks/composables/use-date-utils|static',
  '44|/example/hooks/composables/use-date-utils|ExampleHookUseDateUtils||lazy',
  '45|/example/hooks/composables/use-theme-switch|ExampleHookUseThemeSwitch||lazy',
  '46|/example/hooks/composables/use-http-request|ExampleHookUseHttpRequest||lazy',
  '47|/example/hooks/composables/use-locale|ExampleHookUseLocale||lazy',
  '48|/example/hooks/composables/use-auth|ExampleHookUseAuth||lazy',
  '49|/example/hooks/composables/use-auto-mitt|ExampleHookUseAutoMitt||lazy',
  '50|/example/hooks/layout|ExampleHooksLayout|/example/hooks/layout/loading|static',
  '51|/example/hooks/layout/loading|ExampleHookLayoutLoading||lazy',
  '52|/example/hooks/layout/page-title|ExampleHookLayoutPageTitle||lazy',
  '53|/example/hooks/layout/admin-tabs|ExampleHookLayoutAdminTabs||lazy',
  '54|/example/hooks/layout/breadcrumbs|ExampleHookLayoutBreadcrumbs||lazy',
  '55|/example/hooks/layout/nprogress|ExampleHookLayoutNprogress||lazy',
  '56|/example/hooks/layout/menu-visuals|ExampleHookLayoutMenuVisuals||lazy',
  '57|/example/hooks/component|ExampleHooksComponent|/example/hooks/component/use-pro-table|static',
  '58|/example/hooks/component/use-pro-table|ExampleHookUseProTable||lazy',
  '59|/example/hooks/component/use-chart-theme|ExampleHookUseChartTheme||lazy',
  '60|/example/hooks/component/use-app-element-size|ExampleHookUseAppElementSize||lazy',
  '61|/example/hooks/component/use-permission-routes|ExampleHookUsePermissionRoutes||lazy',
  '62|/example/utils|ExampleUtils|/example/utils/safe-storage|static',
  '63|/example/utils/safe-storage|ExampleUtilSafeStorage||lazy',
  '64|/example/utils/http-advanced|ExampleUtilHttpAdvanced||lazy',
  '65|/example/utils/lodash|ExampleUtilLodash||lazy',
  '66|/example/utils/device-sync|ExampleUtilDeviceSync||lazy',
  '67|/example/utils/strings-format|ExampleUtilStringsFormat||lazy',
  '68|/example/utils/type-casters|ExampleUtilTypeCasters||lazy',
  '69|/example/utils/ids|ExampleUtilIds||lazy',
  '70|/example/utils/color-utils|ExampleUtilColorUtils||lazy',
  '71|/example/common|ExampleCommon|/example/common/constants|static',
  '72|/example/common/constants|ExampleCommonConstants||lazy',
  '73|/example/common/enums|ExampleCommonEnums||lazy',
  '74|/example/common/types|ExampleCommonTypes||lazy',
  '75|/example/architecture|ExampleArchitectureAdvanced|/example/permission/roles|static',
  '76|/example/system-states|ExampleSystemStates||lazy',
  '77|/example/permission|ExamplePermission|/example/permission/roles|static',
  '78|/example/permission/roles|ExamplePermissionRoles||lazy',
  '79|/example/permission/auths|ExamplePermissionAuths||lazy',
  '80|/example/router-meta|ExampleRouterMeta|/example/router-meta/index|static',
  '81|/example/router-meta/index|ExampleRouterMetaIndex||lazy',
  '82|/example/router-meta/external-link|ExampleExternalLink||lazy',
  '83|/example/router-meta/hide-breadcrumb|ExampleHideBreadcrumb||lazy',
  '84|/example/router-meta/hidden-tag|ExampleHiddenTag||lazy',
  '85|/example/router-meta/ratio-demo|ExampleRatioDemo||lazy',
  '86|/example/router-meta/reuse-window|ExampleReuseWindow||lazy',
  '87|/example/router-meta/keep-alive|ExampleKeepAlive||lazy',
  '88|/example/router-meta/transition-demo|ExampleTransitionDemo||lazy',
  '89|/example/directives|ExampleDirectives|/example/directives/auth|static',
  '90|/example/directives/auth|ExampleDirectiveAuth||lazy',
  '91|/example/adapters|ExampleAdapters|/example/adapters/http|static',
  '92|/example/adapters/http|ExampleAdapterHttp||lazy',
  '93|/example/adapters/echarts|ExampleAdapterEcharts||lazy',
  '94|/example/infra|ExampleInfra|/example/infra/route-provider|static',
  '95|/example/infra/route-provider|ExampleInfraRouteProvider||lazy',
  '96|/example/infra/token-provider|ExampleInfraTokenProvider||lazy',
  '97|/example/stores|ExampleStores|/example/stores/locale|static',
  '98|/example/stores/locale|ExampleStoreLocale||lazy',
  '99|/example/stores/theme|ExampleStoreTheme||lazy',
  '100|/example/stores/table-drawer|ExampleStoreTableDrawer||lazy',
  '101|/example/stores/layout|ExampleStoreLayout||lazy',
  '102|/example/stores/user|ExampleStoreUser||lazy',
  '103|/example/stores/size|ExampleStoreSize||lazy',
  '104|/example/stores/device|ExampleStoreDevice||lazy',
  '105|/example/stores/permission|ExampleStorePermission||lazy',
] as const

const registeredRouteModuleLoaders = defineRouteModuleLoaders(
  import.meta.glob<RouteModuleFile>(['./*.ts', '!./*.spec.ts']),
  { prefix: './' }
)
const splitExampleRouteModules = import.meta.glob<RouteModuleFile>('./example/*.ts', {
  eager: true,
})
const exampleViewSourceModules = import.meta.glob<string>('../../views/example/**/*.{vue,ts,tsx}', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const systemConfigurationRouteNames = [
  'ExampleSystemConfigurationTheme',
  'ExampleSystemConfigurationSize',
  'ExampleSystemConfigurationUnocss',
  'ExampleSystemConfigurationBreakpoints',
  'ExampleSystemConfigurationLayout',
]

let exampleRoutes: RouteConfig[] = []
let staticRoutes: RouteConfig[] = []
let registeredRoutes: RouteConfig[] = []
let flatExampleRoutes: RouteConfig[] = []
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

  const [routerModule, coreModule, constantsModule, exampleModule] = await Promise.all([
    import('@/router'),
    import('./core'),
    import('@/constants/router'),
    import('./example'),
  ])

  exampleRoutes = exampleModule.default
  staticRoutes = await routerModule.ensureStaticRoutesLoaded()
  registeredRoutes = [...coreModule.default, ...constantsModule.rootRedirect, ...staticRoutes]

  flatExampleRoutes = flattenRouteRecords(exampleRoutes)
  flatStaticRoutes = flattenRouteRecords(staticRoutes)
  flatRegisteredRoutes = flattenRouteRecords(registeredRoutes)
})

describe('web-demo route module smoke coverage', () => {
  it('preserves the registered route inventory, order, and split example aggregation', () => {
    expect(flatExampleRoutes).toHaveLength(EXPECTED_EXAMPLE_ROUTE_RECORD_COUNT)
    expect(flatStaticRoutes).toHaveLength(EXPECTED_STATIC_ROUTE_RECORD_COUNT)
    expect(flatRegisteredRoutes).toHaveLength(EXPECTED_REGISTERED_ROUTE_RECORD_COUNT)
    expect(flatRegisteredRoutes.map(getRouteSignature)).toEqual(
      EXPECTED_REGISTERED_ROUTE_SIGNATURES
    )

    const registeredModulePaths = Object.keys(registeredRouteModuleLoaders).sort()
    const splitExampleModulePaths = Object.keys(splitExampleRouteModules).sort()

    expect(registeredModulePaths).toEqual(['./core.ts', './dashboard.ts', './example.ts'])
    expect(splitExampleModulePaths.length).toBeGreaterThan(0)
    expect(registeredModulePaths).not.toEqual(expect.arrayContaining(splitExampleModulePaths))
    registeredModulePaths.forEach(modulePath => {
      expect(isTopLevelRouteModulePath(modulePath, { prefix: './' })).toBe(true)
    })
    splitExampleModulePaths.forEach(modulePath => {
      expect(isTopLevelRouteModulePath(modulePath, { prefix: './' })).toBe(false)
    })

    const exampleRoutePaths = new Set(flatExampleRoutes.map(route => route.path))
    Object.entries(splitExampleRouteModules).forEach(([modulePath, routeModule]) => {
      const groupRoutes = flattenRouteRecords(toRouteArray(routeModule.default))

      expect(groupRoutes.length, `${modulePath} should export route records`).toBeGreaterThan(0)
      groupRoutes.forEach(route => {
        expect(
          exampleRoutePaths.has(route.path),
          `${modulePath} route ${route.path} should be aggregated by example.ts`
        ).toBe(true)
      })
    })
  })

  it('keeps route module registration typed and top-level only', () => {
    const invalidNestedRouteModuleLoaders: RouteModuleLoaderRecord = {}
    invalidNestedRouteModuleLoaders['./modules/dashboard.ts'] = async () => ({ default: [] })
    invalidNestedRouteModuleLoaders['./modules/example/charts.ts'] = async () => ({
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

  it('covers registered route titleKeys and example page translation keys in every locale', () => {
    const routeTitleKeys = collectRouteTitleKeys(flatRegisteredRoutes)
    const pageTranslationKeys = collectPageTranslationKeys(exampleViewSourceModules)
    const coveredLocaleKeys = [...new Set([...routeTitleKeys, ...pageTranslationKeys])].sort()

    expect(routeTitleKeys.length).toBeGreaterThan(0)
    expect(pageTranslationKeys.length).toBeGreaterThan(0)

    const missingLocaleKeys = Object.entries(messages).flatMap(([locale, localeMessages]) => {
      return coveredLocaleKeys
        .filter(localeKey => !hasStringLocaleMessage(localeMessages, localeKey))
        .map(localeKey => `${locale}:${localeKey}`)
    })

    expect(missingLocaleKeys).toEqual([])
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

describe('example system configuration routes', () => {
  it('opens each system configuration child as a reusable fullscreen window', () => {
    systemConfigurationRouteNames.forEach(routeName => {
      const route = findRouteByName(exampleRoutes, routeName)

      expect(route?.meta?.parent).toBe('fullscreen')
      expect(route?.meta?.reuseWindow).toBe(true)
    })
  })
})
