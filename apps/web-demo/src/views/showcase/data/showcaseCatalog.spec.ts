// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { messages } from '@/locales'
import {
  SHOWCASE_ROOT_ROUTE,
  createShowcaseRoutes,
  getShowcasePlaceholderModuleKey,
  getShowcaseSourceModuleKey,
  hasShowcaseViewModule,
  showcaseCatalog,
  showcaseCatalogGroups,
} from './showcaseCatalog'
import { getRemainingShowcaseContent, remainingShowcaseImplementedIds } from './showcaseDemoContent'

const REQUIRED_PAGE_LOCALE_FIELDS = [
  'eyebrow',
  'title',
  'description',
  'try',
  'source',
  'technical',
] as const

const SHOWCASE_STATIC_LOCALE_KEY_PATTERN = /['"`](showcase\.[A-Za-z0-9_.-]+)['"`]/g
const DASHBOARD_FIRST_LAYER_LOCALE_KEY_PATTERN = /['"`](showcase\.dashboard\.[A-Za-z0-9_.-]+)['"`]/g
const REJECTED_FIRST_LAYER_COPY_PATTERNS = [
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

const PLANNED_ROUTE_PATHS = [
  '/showcase/overview',
  '/showcase/components',
  '/showcase/components/primevue-adapter',
  '/showcase/components/empty-state',
  '/showcase/components/icons',
  '/showcase/components/c-scrollbar',
  '/showcase/feedback/dialog-toast',
  '/showcase/components/pro-table/overview',
  '/showcase/components/pro-table/basic',
  '/showcase/components/pro-table/columns',
  '/showcase/components/pro-table/sorting-filtering',
  '/showcase/components/pro-table/pagination',
  '/showcase/components/pro-table/server-request',
  '/showcase/components/pro-table/states',
  '/showcase/components/pro-table/selection',
  '/showcase/components/pro-table/toolbar-density',
  '/showcase/components/pro-table/virtual-infinite',
  '/showcase/components/pro-table/export-refresh',
  '/showcase/components/pro-table/cell-rendering',
  '/showcase/components/pro-table/form-composition',
  '/showcase/components/pro-table/api-events',
  '/showcase/components/pro-form/overview',
  '/showcase/components/pro-form/basic-schema',
  '/showcase/components/pro-form/grouped-layout',
  '/showcase/components/pro-form/validation',
  '/showcase/components/pro-form/dependencies-computed',
  '/showcase/components/pro-form/conditional-visibility',
  '/showcase/components/pro-form/reactions',
  '/showcase/components/pro-form/async-data',
  '/showcase/components/pro-form/field-arrays',
  '/showcase/components/pro-form/plugins-draft',
  '/showcase/components/pro-form/submit-states',
  '/showcase/components/pro-form/api-events',
  '/showcase/components/charts/overview',
  '/showcase/components/charts/theme',
  '/showcase/components/charts/responsive',
  '/showcase/components/charts/states',
  '/showcase/components/charts/events',
  '/showcase/components/charts/dashboard-preview',
  '/showcase/hooks/overview',
  '/showcase/hooks/theme-switching',
  '/showcase/hooks/locale-switching',
  '/showcase/hooks/http-flow',
  '/showcase/hooks/auth-permission',
  '/showcase/hooks/layout-runtime',
  '/showcase/hooks/responsive-device',
  '/showcase/utils/overview',
  '/showcase/utils/date',
  '/showcase/utils/safe-storage',
  '/showcase/utils/state-persistence',
  '/showcase/runtime/overview',
  '/showcase/runtime/http',
  '/showcase/runtime/browser-runtime',
  '/showcase/runtime/layout',
  '/showcase/runtime/state-ownership',
  '/showcase/design/tokens',
  '/showcase/design/unocss',
  '/showcase/design/material',
  '/showcase/design/density',
  '/showcase/design/motion',
  '/showcase/governance',
  '/showcase/desktop-boundary',
] as const

const showcaseVisibleSourceModules = import.meta.glob<string>(
  ['../**/*.vue', '../**/*.ts', '!../**/*.spec.ts', '../../dashboard/**/*.vue'],
  {
    eager: true,
    import: 'default',
    query: '?raw',
  }
)
const showcaseRouteSmokeTargetModules = import.meta.glob<readonly string[]>(
  '../../../../../../e2e/showcaseRouteSmokeTargets.ts',
  {
    eager: true,
    import: 'SHOWCASE_ROUTE_SMOKE_TARGET_PATHS',
  }
)

function flattenRouteRecords(routes: RouteConfig[]): RouteConfig[] {
  return routes.flatMap(route => [route, ...flattenRouteRecords(route.children ?? [])])
}

function collectDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  values.forEach(value => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return [...duplicates].sort()
}

function getParentPath(path: string): string {
  return path.slice(0, path.lastIndexOf('/')) || '/'
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

function getLocaleRecordKeys(localeMessages: unknown, localeKey: string): string[] {
  const message = getLocaleMessage(localeMessages, localeKey)
  if (typeof message !== 'object' || message === null || Array.isArray(message)) return []
  return Object.keys(message).sort()
}

function collectLeafLocaleKeys(localeMessages: unknown, localeKey: string): string[] {
  const root = getLocaleMessage(localeMessages, localeKey)
  const leafKeys: string[] = []

  function visit(value: unknown, path: string): void {
    if (typeof value === 'string') {
      leafKeys.push(path)
      return
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) return

    Object.entries(value).forEach(([key, childValue]) => {
      visit(childValue, `${path}.${key}`)
    })
  }

  visit(root, localeKey)
  return leafKeys.sort()
}

function collectShowcaseStaticLocaleKeysFromSources(): string[] {
  const localeKeys = new Set<string>()

  Object.values(showcaseVisibleSourceModules).forEach(source => {
    for (const match of source.matchAll(SHOWCASE_STATIC_LOCALE_KEY_PATTERN)) {
      const localeKey = match[1]
      if (localeKey) localeKeys.add(localeKey)
    }
  })

  return [...localeKeys].sort()
}

function collectFirstLayerLocaleKeys(): string[] {
  const localeKeys = new Set<string>([
    'showcase.dashboard.hero.eyebrow',
    'showcase.dashboard.hero.title',
    'showcase.dashboard.hero.description',
    'showcase.dashboard.hero.primaryAction',
    'showcase.dashboard.hero.secondaryAction',
    'showcase.dashboard.capabilities.eyebrow',
    'showcase.dashboard.capabilities.title',
    'showcase.dashboard.capabilities.description',
    'showcase.dashboard.story.eyebrow',
    'showcase.dashboard.story.title',
    'showcase.dashboard.story.description',
    'showcase.shell.source.title',
    'showcase.shell.source.description',
    'showcase.shell.related.title',
    'showcase.shell.related.description',
  ])

  showcaseCatalogGroups.forEach(group => {
    localeKeys.add(group.titleKey)
    localeKeys.add(group.descriptionKey)
  })
  showcaseCatalog.forEach(item => {
    localeKeys.add(`${item.localeBaseKey}.eyebrow`)
    localeKeys.add(`${item.localeBaseKey}.title`)
    localeKeys.add(`${item.localeBaseKey}.description`)
    localeKeys.add(`${item.localeBaseKey}.try`)
  })
  Object.values(showcaseVisibleSourceModules).forEach(source => {
    for (const match of source.matchAll(DASHBOARD_FIRST_LAYER_LOCALE_KEY_PATTERN)) {
      const localeKey = match[1]
      if (localeKey) localeKeys.add(localeKey)
    }
  })

  return [...localeKeys].sort()
}

function hasDefaultExport(moduleValue: unknown): boolean {
  return typeof moduleValue === 'object' && moduleValue !== null && 'default' in moduleValue
}

function collectRanks(routes: RouteConfig[]): number[] {
  return routes
    .map(route => route.meta?.rank)
    .filter((rank): rank is number => typeof rank === 'number')
}

function collectRemainingShowcaseLocaleKeys(): string[] {
  const localeKeys = new Set<string>([
    'showcase.remaining.tags.value',
    'showcase.remaining.tags.explanation',
    'showcase.remaining.tags.technical',
  ])

  remainingShowcaseImplementedIds.forEach(id => {
    const content = getRemainingShowcaseContent(id)
    localeKeys.add(`showcase.remaining.demos.${content.demoKind}.description`)
    ;[...content.features, ...content.explanations, ...content.technical].forEach(cardKey => {
      localeKeys.add(`showcase.remaining.cards.${cardKey}.title`)
      localeKeys.add(`showcase.remaining.cards.${cardKey}.description`)
    })
  })

  return [...localeKeys].sort()
}

function collectShowcaseRouteSmokeTargetPaths(): string[] {
  const targetPaths = Object.values(showcaseRouteSmokeTargetModules)[0]

  return [...(targetPaths ?? [])].sort()
}

describe('showcase catalog', () => {
  it('covers every planned route path exactly once', () => {
    const catalogPaths = showcaseCatalog.map(item => item.path).sort()

    expect(catalogPaths).toEqual([...PLANNED_ROUTE_PATHS].sort())
  })

  it('keeps ids, paths, names, title keys, and sibling ranks unique', () => {
    expect(collectDuplicates(showcaseCatalog.map(item => item.id))).toEqual([])
    expect(collectDuplicates(showcaseCatalog.map(item => item.path))).toEqual([])
    expect(collectDuplicates(showcaseCatalog.map(item => item.name))).toEqual([])
    expect(collectDuplicates(showcaseCatalog.map(item => item.titleKey))).toEqual([])

    const ranksByParent = new Map<string, string[]>()
    showcaseCatalog.forEach(item => {
      const parentKey = item.parentId ?? getParentPath(item.path)
      const rankKey = `${parentKey}:${item.rank}`
      ranksByParent.set(rankKey, [...(ranksByParent.get(rankKey) ?? []), item.id])
    })

    expect([...ranksByParent.values()].filter(ids => ids.length > 1)).toEqual([])
  })

  it('keeps showcase groups unique and locale-backed', () => {
    const groupIds = new Set(showcaseCatalogGroups.map(group => group.id))

    expect(collectDuplicates(showcaseCatalogGroups.map(group => group.id))).toEqual([])
    expect(collectDuplicates(showcaseCatalogGroups.map(group => String(group.rank)))).toEqual([])
    showcaseCatalog.forEach(item => {
      expect(groupIds.has(item.groupId), item.id).toBe(true)
    })

    const missingGroupLocaleKeys = Object.entries(messages).flatMap(([locale, localeMessages]) => {
      return showcaseCatalogGroups
        .flatMap(group => [group.titleKey, group.descriptionKey])
        .filter(localeKey => !hasStringLocaleMessage(localeMessages, localeKey))
        .map(localeKey => `${locale}:${localeKey}`)
    })

    expect(missingGroupLocaleKeys).toEqual([])
  })

  it('keeps parent references, dashboard links, and related links concrete', () => {
    const ids = new Set(showcaseCatalog.map(item => item.id))
    const paths = new Set(showcaseCatalog.map(item => item.path))
    const dashboardLinks = showcaseCatalog.filter(item => item.dashboardLink)

    showcaseCatalog.forEach(item => {
      if (item.parentId) expect(ids.has(item.parentId), item.id).toBe(true)
      item.relatedIds?.forEach(relatedId => {
        expect(ids.has(relatedId), `${item.id} related ${relatedId}`).toBe(true)
      })
      expect(item.sourcePaths.length, item.id).toBeGreaterThan(0)
      expect(item.sourcePaths[0]?.startsWith('apps/web-demo/src/views/showcase/'), item.id).toBe(
        true
      )
      expect(item.sourcePaths[0]?.endsWith('.vue'), item.id).toBe(true)
      expect(
        item.sourcePaths
          .slice(1)
          .every(
            sourcePath => sourcePath.startsWith('apps/') || sourcePath.startsWith('packages/')
          ),
        item.id
      ).toBe(true)
      expect(paths.has(item.path), item.id).toBe(true)
    })

    expect(dashboardLinks.map(item => item.path)).toEqual(
      expect.arrayContaining([
        '/showcase/components/pro-table/basic',
        '/showcase/components/pro-form/validation',
        '/showcase/components/charts/theme',
        '/showcase/design/tokens',
        '/showcase/runtime/overview',
        '/showcase/governance',
      ])
    )
  })

  it('keeps catalog E2E targets aligned with route smoke coverage metadata', () => {
    const catalogTargetPaths = showcaseCatalog
      .filter(item => item.e2eTarget)
      .map(item => item.path)
      .sort()

    expect(collectShowcaseRouteSmokeTargetPaths()).toEqual(catalogTargetPaths)
  })

  it('keeps locale keys derivable from catalog metadata', () => {
    showcaseCatalog.forEach(item => {
      expect(item.titleKey.startsWith('router.showcase.'), item.id).toBe(true)
      expect(item.localeBaseKey).toBe(`showcase.pages.${item.id}`)
    })
  })

  it('covers every catalog route title and page locale key in every locale', () => {
    const localeKeys = new Set<string>()

    showcaseCatalog.forEach(item => {
      localeKeys.add(item.titleKey)
      REQUIRED_PAGE_LOCALE_FIELDS.forEach(field => {
        localeKeys.add(`${item.localeBaseKey}.${field}`)
      })
    })

    const missingLocaleKeys = Object.entries(messages).flatMap(([locale, localeMessages]) => {
      return [...localeKeys]
        .filter(localeKey => !hasStringLocaleMessage(localeMessages, localeKey))
        .map(localeKey => `${locale}:${localeKey}`)
    })

    expect(missingLocaleKeys).toEqual([])
  })

  it('keeps complete showcase locale trees aligned across supported locales', () => {
    expect(collectLeafLocaleKeys(messages['zh-CN'], 'showcase')).toEqual(
      collectLeafLocaleKeys(messages['en-US'], 'showcase')
    )
    expect(collectLeafLocaleKeys(messages['zh-CN'], 'router.showcase')).toEqual(
      collectLeafLocaleKeys(messages['en-US'], 'router.showcase')
    )
  })

  it('covers dashboard and showcase static locale keys used by visible source files', () => {
    const localeKeys = collectShowcaseStaticLocaleKeysFromSources()
    const missingLocaleKeys = Object.entries(messages).flatMap(([locale, localeMessages]) => {
      return localeKeys
        .filter(localeKey => !hasStringLocaleMessage(localeMessages, localeKey))
        .map(localeKey => `${locale}:${localeKey}`)
    })

    expect(localeKeys).toContain('showcase.dashboard.hero.title')
    expect(localeKeys).toContain('showcase.shell.source.description')
    expect(missingLocaleKeys).toEqual([])
  })

  it('keeps first-layer dashboard and showcase copy free of internal process framing', () => {
    const rejectedValues = Object.entries(messages)
      .flatMap(([locale, localeMessages]) => {
        return collectFirstLayerLocaleKeys().map(localeKey => ({
          locale,
          localeKey,
          value: getLocaleMessage(localeMessages, localeKey),
        }))
      })
      .filter(item => typeof item.value === 'string')
      .filter(item =>
        REJECTED_FIRST_LAYER_COPY_PATTERNS.some(pattern => pattern.test(String(item.value)))
      )
      .map(item => `${item.locale}:${item.localeKey}:${String(item.value)}`)

    expect(rejectedValues).toEqual([])
  })

  it('keeps locale page metadata aligned with catalog ids', () => {
    const catalogIds = showcaseCatalog.map(item => item.id).sort()

    Object.entries(messages).forEach(([locale, localeMessages]) => {
      expect(getLocaleRecordKeys(localeMessages, 'showcase.pages'), locale).toEqual(catalogIds)
    })
    expect(
      getLocaleMessage(messages['zh-CN'], 'showcase.pages.components-pro-table-basic.title')
    ).toBe('基础表格')
  })

  it('derives Vite-resolvable showcase view module keys from catalog source paths', () => {
    showcaseCatalog.forEach(item => {
      expect(getShowcaseSourceModuleKey(item), item.id).toMatch(/^\.\.\/.+\.vue$/)
    })
    expect(getShowcasePlaceholderModuleKey()).toBe('../shared/ShowcaseRoutePlaceholder.vue')
  })

  it('loads implemented ProTable showcase pages instead of the placeholder module', () => {
    const implementedIds = [
      'components-pro-table-overview',
      'components-pro-table-basic',
      'components-pro-table-columns',
      'components-pro-table-sorting-filtering',
      'components-pro-table-pagination',
      'components-pro-table-server-request',
      'components-pro-table-states',
      'components-pro-table-selection',
      'components-pro-table-toolbar-density',
      'components-pro-table-virtual-infinite',
      'components-pro-table-export-refresh',
      'components-pro-table-cell-rendering',
      'components-pro-table-form-composition',
      'components-pro-table-api-events',
    ]

    expect(
      showcaseCatalog
        .filter(item => implementedIds.includes(item.id))
        .map(item => (hasShowcaseViewModule(item) ? null : item.id))
        .filter((id): id is string => id !== null)
    ).toEqual([])
    expect(
      showcaseCatalog
        .filter(item => item.id.startsWith('components-pro-table-'))
        .map(item => item.id)
    ).toEqual(implementedIds)
  })

  it('loads implemented ProForm showcase pages instead of the placeholder module', () => {
    const implementedIds = [
      'components-pro-form-overview',
      'components-pro-form-basic-schema',
      'components-pro-form-grouped-layout',
      'components-pro-form-validation',
      'components-pro-form-dependencies-computed',
      'components-pro-form-conditional-visibility',
      'components-pro-form-reactions',
      'components-pro-form-async-data',
      'components-pro-form-field-arrays',
      'components-pro-form-plugins-draft',
      'components-pro-form-submit-states',
      'components-pro-form-api-events',
    ]

    expect(
      showcaseCatalog
        .filter(item => implementedIds.includes(item.id))
        .map(item => (hasShowcaseViewModule(item) ? null : item.id))
        .filter((id): id is string => id !== null)
    ).toEqual([])
    expect(
      showcaseCatalog
        .filter(item => item.id.startsWith('components-pro-form-'))
        .map(item => item.id)
    ).toEqual(implementedIds)
  })

  it('loads implemented remaining showcase pages instead of the placeholder module', () => {
    const implementedIds = new Set<string>(remainingShowcaseImplementedIds)

    expect(
      showcaseCatalog
        .filter(item => implementedIds.has(item.id))
        .map(item => (hasShowcaseViewModule(item) ? null : item.id))
        .filter((id): id is string => id !== null)
    ).toEqual([])
    expect(
      showcaseCatalog
        .filter(
          item =>
            !item.id.startsWith('components-pro-table-') &&
            !item.id.startsWith('components-pro-form-')
        )
        .map(item => item.id)
        .sort()
    ).toEqual([...remainingShowcaseImplementedIds].sort())
  })

  it('covers remaining shared demo and card locale keys in every locale', () => {
    const localeKeys = collectRemainingShowcaseLocaleKeys()
    const missingLocaleKeys = Object.entries(messages).flatMap(([locale, localeMessages]) => {
      return localeKeys
        .filter(localeKey => !hasStringLocaleMessage(localeMessages, localeKey))
        .map(localeKey => `${locale}:${localeKey}`)
    })

    expect(missingLocaleKeys).toEqual([])
  })
})

describe('showcase routes', () => {
  it('builds a root route and redirects route groups to their first child', () => {
    const route = createShowcaseRoutes()
    const flatRoutes = flattenRouteRecords([route])
    const componentsRoot = flatRoutes.find(item => item.path === '/showcase/components')

    expect(route.path).toBe(SHOWCASE_ROOT_ROUTE.path)
    expect(route.name).toBe(SHOWCASE_ROOT_ROUTE.name)
    expect(route.redirect).toBe('/showcase/overview')
    expect(componentsRoot?.component).toBeUndefined()
    expect(componentsRoot?.redirect).toBe('/showcase/components/primevue-adapter')
    expect(collectRanks(route.children ?? [])).toEqual(
      [...collectRanks(route.children ?? [])].sort((a, b) => a - b)
    )
    expect(collectRanks(componentsRoot?.children ?? [])).toEqual(
      [...collectRanks(componentsRoot?.children ?? [])].sort((a, b) => a - b)
    )
  })

  it('emits one route record per catalog item plus the root route', () => {
    const flatRoutes = flattenRouteRecords([createShowcaseRoutes()])
    const routePaths = flatRoutes.map(route => route.path)

    expect(flatRoutes).toHaveLength(showcaseCatalog.length + 1)
    expect(routePaths).toEqual(expect.arrayContaining(['/showcase', ...PLANNED_ROUTE_PATHS]))
    expect(flatRoutes.every(route => route.meta?.titleKey)).toBe(true)
  })

  it('uses lazy route components for catalog-backed leaf pages', () => {
    const flatRoutes = flattenRouteRecords([createShowcaseRoutes()])
    const catalogRoutes = flatRoutes.filter(
      (route): route is RouteConfig & { component: NonNullable<RouteConfig['component']> } =>
        route.path !== '/showcase' && typeof route.component === 'function'
    )

    expect(catalogRoutes).toHaveLength(showcaseCatalog.length - 1)
    catalogRoutes.forEach(route => {
      expect(typeof route.component, String(route.name)).toBe('function')
    })
  })

  it('resolves every catalog route component to the placeholder module', async () => {
    const flatRoutes = flattenRouteRecords([createShowcaseRoutes()])
    const catalogRoutes = flatRoutes.filter(
      (route): route is RouteConfig & { component: () => Promise<unknown> } =>
        route.path !== '/showcase' && typeof route.component === 'function'
    )
    const resolvedModules = await Promise.all(catalogRoutes.map(route => route.component()))

    expect(catalogRoutes).toHaveLength(showcaseCatalog.length - 1)
    resolvedModules.forEach(moduleValue => {
      expect(hasDefaultExport(moduleValue)).toBe(true)
    })
  })
})
