// @vitest-environment jsdom

import { beforeAll, describe, expect, it, vi } from 'vitest'
import { messages } from '@/locales'
import {
  appRouteNames,
  appRoutePaths,
  routeWhiteNameList,
  routeWhitePathList,
} from '@/constants/router'
import {
  consolePages,
  getConsolePage,
  type ConsolePageModel,
} from '../../views/architecture-console/data/consolePages'
import { validateRegisteredRouteMetadata } from '../utils/metadata'
import {
  collectRouteModuleRoutes,
  defineRouteModule,
  defineRouteModuleLoaders,
  isTopLevelRouteModulePath,
  type RouteModuleFile,
  type RouteModuleLoaderRecord,
} from '../utils/routeModules'
import { SHOWCASE_ROUTE_GROUPS, showcaseCatalog } from '../../views/showcase/data/showcaseCatalog'

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

const EXPECTED_CONSOLE_ROUTE_RECORD_COUNT = 23
const BASE_STATIC_ROUTE_RECORD_COUNT = 24
const BASE_REGISTERED_ROUTE_RECORD_COUNT = 30
const EXPECTED_STATIC_ROUTE_RECORD_COUNT =
  BASE_STATIC_ROUTE_RECORD_COUNT + showcaseCatalog.length + SHOWCASE_ROUTE_GROUPS.length + 1
const EXPECTED_REGISTERED_ROUTE_RECORD_COUNT =
  BASE_REGISTERED_ROUTE_RECORD_COUNT + showcaseCatalog.length + SHOWCASE_ROUTE_GROUPS.length + 1
const LAZY_ROUTE_IMPORT_CONCURRENCY = 8
const ROUTE_SMOKE_IMPORT_TIMEOUT_MS = 20_000
const REJECTED_CONSOLE_FIRST_LAYER_COPY_PATTERNS = [
  /pnpm/i,
  /ai:guard/i,
  /governance report/i,
  /route metadata/i,
  /route count/i,
  /navigation records/i,
  /locale coverage/i,
  /command list/i,
  /migration/i,
  /Architecture Control/i,
  /\bP4\b/i,
  /\bLedger\b/i,
  /路由元数据/,
  /治理报告/,
  /路由数量/,
  /导航记录/,
  /语言覆盖/,
  /命令列表/,
  /迁移/,
  /架构控制台/,
  /台账/,
] as const
const EXPECTED_REGISTERED_ROUTE_SIGNATURES = [
  '/|Root|/dashboard|static',
  '/login|Login||lazy',
  '/dashboard|Dashboard||lazy',
  '/showcase|ShowcaseRoot|/showcase/overview|static',
  '/showcase/overview|ShowcaseOverview||lazy',
  '/showcase/components|ShowcaseComponentsRoot|/showcase/components/primevue-adapter|static',
  '/showcase/components/pro-table|ShowcaseComponentsProTable|/showcase/components/pro-table/overview|static',
  '/showcase/components/pro-table/basic|ShowcaseComponentsProTableBasic||lazy',
  '/showcase/components/pro-tree-table|ShowcaseComponentsProTreeTable|/showcase/components/pro-tree-table/overview|static',
  '/showcase/components/pro-form|ShowcaseComponentsProForm|/showcase/components/pro-form/overview|static',
  '/showcase/components/pro-form/validation|ShowcaseComponentsProFormValidation||lazy',
  '/showcase/components/charts|ShowcaseComponentsCharts|/showcase/components/charts/overview|static',
  '/showcase/components/charts/theme|ShowcaseComponentsChartsTheme||lazy',
  '/showcase/hooks|ShowcaseHooks|/showcase/hooks/overview|static',
  '/showcase/utils|ShowcaseUtils|/showcase/utils/overview|static',
  '/showcase/runtime|ShowcaseRuntime|/showcase/runtime/overview|static',
  '/showcase/design|ShowcaseDesign|/showcase/design/tokens|static',
  '/architecture|ArchitectureRoot|/architecture/topology|static',
  '/desktop|DesktopBoundary||lazy',
] as const

const registeredRouteModuleLoaders = defineRouteModuleLoaders(
  import.meta.glob<RouteModuleFile>(['./*.ts', '!./*.spec.ts']),
  { prefix: './' }
)
const consoleViewSourceModules = import.meta.glob<string>(
  [
    '../../views/architecture-console/**/*.{vue,ts,tsx}',
    '../../views/dashboard/**/*.{vue,ts,tsx}',
    '../../views/system/settings/**/*.{vue,ts,tsx}',
    '../../hooks/modules/system/useSystemSettingsPage.ts',
  ],
  {
    eager: true,
    import: 'default',
    query: '?raw',
  }
)
const consoleDataSourceModules = import.meta.glob<string>(
  [
    '../../views/architecture-console/data/**/*.ts',
    '!../../views/architecture-console/data/**/*.spec.ts',
  ],
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

function getRouteStableSignature(route: RouteConfig): string {
  const name = route.name === undefined || route.name === null ? '' : String(route.name)
  const redirect = typeof route.redirect === 'string' ? route.redirect : ''
  const componentKind = typeof route.component === 'function' ? 'lazy' : 'static'
  return `${route.path}|${name}|${redirect}|${componentKind}`
}

const PAGE_TRANSLATION_KEY_PATTERN =
  /['"]((?:chart|common|console|dialog|emptyState|http|login|proForm|proTable|router|settings|showcase)\.[A-Za-z0-9_.-]+)['"]/g
const CONSOLE_DATA_STRING_LITERAL_PATTERN = /(['"`])((?:\\.|(?!\1).)*)\1/g
const CONSOLE_DEMO_TRANSLATION_KEYS = [
  'console.demos.primeVue.title',
  'console.demos.primeVue.description',
  'console.demos.primeVue.fields.inputText',
  'console.demos.primeVue.fields.inputNumber',
  'console.demos.primeVue.fields.password',
  'console.demos.primeVue.fields.select',
  'console.demos.primeVue.fields.autocomplete',
  'console.demos.primeVue.fields.datePicker',
  'console.demos.primeVue.buttons.primary',
  'console.demos.primeVue.buttons.secondary',
  'console.demos.primeVue.buttons.success',
  'console.demos.primeVue.buttons.info',
  'console.demos.primeVue.buttons.warn',
  'console.demos.primeVue.buttons.help',
  'console.demos.primeVue.buttons.danger',
  'console.demos.primeVue.buttons.contrast',
  'console.demos.primeVue.options.contracts',
  'console.demos.primeVue.options.core',
  'console.demos.primeVue.options.appRuntime',
  'console.demos.primeVue.autocomplete.architecture',
  'console.demos.primeVue.autocomplete.runtime',
  'console.demos.primeVue.autocomplete.primevue',
  'console.demos.primeVue.autocomplete.governance',
  'console.demos.proForm.title',
  'console.demos.proForm.description',
  'console.demos.proForm.submit',
  'console.demos.proForm.asideLabel',
  'console.demos.proForm.asideDescription',
  'console.demos.proForm.groups.basic',
  'console.demos.proForm.groups.governance',
  'console.demos.proForm.fields.capability',
  'console.demos.proForm.fields.owner',
  'console.demos.proForm.fields.guarded',
  'console.demos.proForm.fields.command',
  'console.demos.proForm.fields.notes',
  'console.demos.proForm.descriptions.owner',
  'console.demos.proForm.descriptions.guarded',
  'console.demos.proForm.descriptions.command',
  'console.demos.proForm.descriptions.notes',
  'console.demos.proForm.defaults.capability',
  'console.demos.proForm.defaults.notes',
  'console.demos.proForm.validation.capabilityRequired',
  'console.demos.proForm.validation.capabilityLength',
  'console.demos.proForm.validation.notesRequired',
  'console.demos.proForm.owners.app',
  'console.demos.proForm.owners.package',
  'console.demos.proForm.owners.future',
  'console.demos.proForm.summary.empty',
  'console.demos.proForm.summary.submitted',
  'console.demos.proForm.summary.separator',
  'console.demos.proForm.summary.valid',
  'console.demos.proTable.title',
  'console.demos.proTable.description',
  'console.demos.proTable.tableTitle',
  'console.demos.proTable.columns.layer',
  'console.demos.proTable.columns.owner',
  'console.demos.proTable.columns.status',
  'console.demos.proTable.columns.validation',
  'console.demos.proTable.columns.evidence',
  'console.demos.proTable.filters.status',
  'console.demos.proTable.filters.all',
  'console.demos.proTable.states.loading',
  'console.demos.proTable.states.empty',
  'console.demos.proTable.emptyTitle',
  'console.demos.proTable.emptyDescription',
  'console.demos.proTable.evidence.title',
  'console.demos.proTable.evidence.empty',
  'console.demos.proTable.status.guarded',
  'console.demos.proTable.status.app',
  'console.demos.proTable.status.blocked',
  'console.demos.proTable.rows.contractsOwner',
  'console.demos.proTable.rows.coreOwner',
  'console.demos.proTable.rows.httpOwner',
  'console.demos.proTable.rows.safeStorageOwner',
  'console.demos.proTable.rows.blockedOwner',
  'console.demos.proTable.details.contracts',
  'console.demos.proTable.details.core',
  'console.demos.proTable.details.http',
  'console.demos.proTable.details.safeStorage',
  'console.demos.proTable.details.blocked',
  'console.demos.chart.title',
  'console.demos.chart.description',
  'console.demos.chart.axis.contracts',
  'console.demos.chart.axis.core',
  'console.demos.chart.axis.web',
  'console.demos.chart.axis.desktop',
  'console.demos.chart.axis.wiki',
  'console.demos.chart.series.evidenceWeight',
  'console.demos.chart.series.runtimeRisk',
  'console.demos.feedback.title',
  'console.demos.feedback.description',
  'console.demos.feedback.emptyTitle',
  'console.demos.feedback.emptyDescription',
  'console.demos.feedback.facadeTitle',
  'console.demos.feedback.facadeDescription',
] as const
const CONSOLE_SHARED_TRANSLATION_KEYS = [
  'console.shared.evidence.title',
  'console.shared.evidence.description',
  'console.shared.commands.title',
  'console.shared.commands.description',
  'console.routeEvidence.title',
  'console.routeEvidence.description',
  'console.routeEvidence.modules',
  'console.routeEvidence.modulesValue',
  'console.routeEvidence.modulesDetail',
  'console.routeEvidence.metadata',
  'console.routeEvidence.metadataValue',
  'console.routeEvidence.metadataDetail',
  'console.routeEvidence.locale',
  'console.routeEvidence.localeValue',
  'console.routeEvidence.localeDetail',
  'console.settingsPage.sizeDescriptions.compact',
  'console.settingsPage.sizeDescriptions.comfortable',
  'console.settingsPage.sizeDescriptions.loose',
  'settings.layoutVertical',
  'settings.layoutHorizontal',
  'settings.layoutMix',
] as const
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

function collectConsoleModelTranslationKeys(pages: Record<string, ConsolePageModel>): string[] {
  const localeKeys = new Set<string>([
    ...CONSOLE_DEMO_TRANSLATION_KEYS,
    ...CONSOLE_SHARED_TRANSLATION_KEYS,
  ])

  Object.values(pages).forEach(page => {
    localeKeys.add(`console.pages.${page.key}.eyebrow`)
    localeKeys.add(`console.pages.${page.key}.title`)
    localeKeys.add(`console.pages.${page.key}.description`)

    page.status.forEach(item => {
      localeKeys.add(`console.status.${item.key}.label`)
      if (!item.value) localeKeys.add(`console.status.${item.key}.value`)
    })
    page.stats.forEach(item => {
      localeKeys.add(`console.stats.${item.key}.label`)
      if (!item.value) localeKeys.add(`console.stats.${item.key}.value`)
      localeKeys.add(`console.stats.${item.key}.detail`)
    })
    page.capabilities.forEach(item => {
      localeKeys.add(`console.capabilities.${item.key}.title`)
      localeKeys.add(`console.capabilities.${item.key}.description`)
      localeKeys.add(`console.capabilities.${item.key}.status`)
      for (let index = 0; index < item.bulletCount; index += 1) {
        localeKeys.add(`console.capabilities.${item.key}.bullets.${index}`)
      }
    })
    page.evidence.forEach(item => {
      localeKeys.add(`console.evidence.${item.key}.label`)
      localeKeys.add(`console.evidence.${item.key}.detail`)
    })
    page.commands.forEach(item => {
      localeKeys.add(`console.commands.${item.key}.description`)
    })
  })

  return [...localeKeys].sort()
}

function collectConsoleFirstLayerTranslationKeys(
  pages: Record<string, ConsolePageModel>
): string[] {
  const localeKeys = new Set<string>([
    'console.shared.evidence.title',
    'console.shared.evidence.description',
    'console.shared.commands.title',
    'console.shared.commands.description',
    'console.routeEvidence.title',
    'console.routeEvidence.description',
  ])

  Object.values(pages).forEach(page => {
    localeKeys.add(`console.pages.${page.key}.eyebrow`)
    localeKeys.add(`console.pages.${page.key}.title`)
    localeKeys.add(`console.pages.${page.key}.description`)
    page.status.forEach(item => {
      localeKeys.add(`console.status.${item.key}.label`)
      if (!item.value) localeKeys.add(`console.status.${item.key}.value`)
    })
    page.stats.forEach(item => {
      localeKeys.add(`console.stats.${item.key}.label`)
      if (!item.value) localeKeys.add(`console.stats.${item.key}.value`)
      localeKeys.add(`console.stats.${item.key}.detail`)
    })
  })

  return [...localeKeys].sort()
}

function collectConsoleFirstLayerModelValues(pages: Record<string, ConsolePageModel>): Array<{
  source: string
  value: string
}> {
  return Object.values(pages).flatMap(page => [
    ...page.status
      .filter(item => typeof item.value === 'string')
      .map(item => ({
        source: `${page.id}.status.${item.key}.value`,
        value: String(item.value),
      })),
    ...page.stats
      .filter(item => typeof item.value === 'string')
      .map(item => ({
        source: `${page.id}.stats.${item.key}.value`,
        value: String(item.value),
      })),
  ])
}

function isRejectedConsoleFirstLayerValue(source: string, value: string): boolean {
  if (
    source.includes('.stats.') &&
    source.toLowerCase().includes('route') &&
    /^\d+$/.test(value.trim())
  ) {
    return true
  }

  return REJECTED_CONSOLE_FIRST_LAYER_COPY_PATTERNS.some(pattern => pattern.test(value))
}

function looksLikeLongDisplayText(value: string): boolean {
  if (!/[A-Za-z]/.test(value)) return false
  if (value.startsWith('console.')) return false
  if (value.startsWith('i-')) return false
  if (value.startsWith('pnpm ')) return false
  if (value.includes('/') || value.includes('**') || value.includes('->')) return false
  if (/^[A-Za-z0-9@._:*()-]+$/.test(value)) return false
  return value.length > 24 && /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(value)
}

function collectLongConsoleDataDisplayText(sourceModules: Record<string, string>): string[] {
  return Object.entries(sourceModules).flatMap(([path, source]) => {
    const violations: string[] = []
    for (const match of source.matchAll(CONSOLE_DATA_STRING_LITERAL_PATTERN)) {
      const literal = match[2].replace(/\\(['"`])/g, '$1')
      if (looksLikeLongDisplayText(literal)) violations.push(`${path}: ${literal}`)
    }
    return violations
  })
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

function findRouteByPath(routes: RouteConfig[], path: string): RouteConfig | undefined {
  for (const route of routes) {
    if (route.path === path) return route
    if (route.children) {
      const child = findRouteByPath(route.children, path)
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
    expect(flatRegisteredRoutes.map(getRouteStableSignature)).toEqual(
      expect.arrayContaining([...EXPECTED_REGISTERED_ROUTE_SIGNATURES])
    )

    const registeredModulePaths = Object.keys(registeredRouteModuleLoaders).sort()

    expect(registeredModulePaths).toEqual([
      './architecture.ts',
      './core.ts',
      './dashboard.ts',
      './desktop.ts',
      './runtime.ts',
      './showcase.ts',
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

  it('keeps the auth whitelist aligned with mounted routes (ROUTE-01: no unreachable /register)', () => {
    const registeredPathSet = new Set(flatRegisteredRoutes.map(route => route.path))
    const registeredNameSet = new Set(
      flatRegisteredRoutes
        .map(route => (route.name == null ? '' : String(route.name)))
        .filter(name => name.length > 0)
    )

    // Registration is intentionally unsupported in this architecture demo: the route
    // contract must not advertise a /register path or Register name, because no route
    // record mounts it — it would only ever resolve through the catch-all to /404.
    expect(Object.prototype.hasOwnProperty.call(appRoutePaths, 'register')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(appRouteNames, 'register')).toBe(false)
    expect(Object.values(appRoutePaths)).not.toContain('/register')
    expect(Object.values(appRouteNames)).not.toContain('Register')
    expect([...routeWhitePathList]).not.toContain('/register')
    expect([...routeWhiteNameList]).not.toContain('Register')

    // /register is not a mounted route, so it stays unreachable (catch-all → /404).
    expect(registeredPathSet.has('/register')).toBe(false)
    expect(registeredNameSet.has('Register')).toBe(false)

    // Positive contract: every whitelisted path/name resolves to a real mounted route.
    routeWhitePathList.forEach(path => {
      expect(
        registeredPathSet.has(path),
        `whitelisted path ${path} resolves to a mounted route`
      ).toBe(true)
    })
    routeWhiteNameList.forEach(name => {
      expect(
        registeredNameSet.has(String(name)),
        `whitelisted name ${String(name)} resolves to a mounted route`
      ).toBe(true)
    })
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
    const consoleModelTranslationKeys = collectConsoleModelTranslationKeys(consolePages)
    const coveredLocaleKeys = [
      ...new Set([...routeTitleKeys, ...pageTranslationKeys, ...consoleModelTranslationKeys]),
    ].sort()

    expect(routeTitleKeys.length).toBeGreaterThan(0)

    const missingLocaleKeys = Object.entries(messages).flatMap(([locale, localeMessages]) => {
      return coveredLocaleKeys
        .filter(localeKey => !hasStringLocaleMessage(localeMessages, localeKey))
        .map(localeKey => `${locale}:${localeKey}`)
    })

    expect(missingLocaleKeys).toEqual([])
  })

  it('keeps legacy console first-layer copy free of internal process framing', () => {
    const translatedValues = Object.entries(messages)
      .flatMap(([locale, localeMessages]) => {
        return collectConsoleFirstLayerTranslationKeys(consolePages).map(localeKey => ({
          source: `${locale}:${localeKey}`,
          value: getLocaleMessage(localeMessages, localeKey),
        }))
      })
      .filter(item => typeof item.value === 'string')
      .map(item => ({ source: item.source, value: String(item.value) }))
    const modelValues = collectConsoleFirstLayerModelValues(consolePages)
    const rejectedValues = [...translatedValues, ...modelValues]
      .filter(item => isRejectedConsoleFirstLayerValue(item.source, item.value))
      .map(item => `${item.source}:${item.value}`)

    expect(rejectedValues).toEqual([])
  })

  it('keeps console data structural instead of storing long display copy', () => {
    expect(collectLongConsoleDataDisplayText(consoleDataSourceModules)).toEqual([])
  })

  it('preserves intentional layout metadata and governed console route registration', () => {
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
        '/system/settings',
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

  it('registers showcase routes from the catalog contribution', () => {
    const showcaseRoot = findRouteByPath(registeredRoutes, '/showcase')
    const componentsRoot = findRouteByPath(registeredRoutes, '/showcase/components')

    expect(showcaseRoot?.redirect).toBe('/showcase/overview')
    expect(componentsRoot?.redirect).toBe('/showcase/components/primevue-adapter')
    SHOWCASE_ROUTE_GROUPS.forEach(group => {
      const groupRoute = findRouteByPath(registeredRoutes, group.path)

      expect(groupRoute?.redirect, group.path).toBe(group.redirect)
      expect(groupRoute?.component, group.path).toBeUndefined()
      expect(groupRoute?.meta?.hiddenTag, group.path).toBe(true)
    })
    expect(flatRegisteredRoutes.filter(route => route.path.startsWith('/showcase'))).toHaveLength(
      showcaseCatalog.length + SHOWCASE_ROUTE_GROUPS.length + 1
    )
  })

  it('covers every ConsolePage-backed route with a page model (strict 18-contract)', () => {
    const pageNames = Object.keys(consolePages)

    // Exactly 18 ConsolePage models
    expect(pageNames).toHaveLength(18)

    // Every model key must return its model (no undefined)
    for (const name of pageNames) {
      const model = getConsolePage(name)
      expect(model, `ConsolePage model not found for route "${name}"`).toBeDefined()
      expect(model!.id).toBe(name)
    }

    // Unknown names return undefined (strict lookup, no topology fallback)
    expect(getConsolePage('NonExistentRoute')).toBeUndefined()
    expect(getConsolePage('')).toBeUndefined()
    expect(getConsolePage(null)).toBeUndefined()
  })
})
