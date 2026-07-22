import type {
  ShowcaseCatalogGroup,
  ShowcaseCatalogItem,
  ShowcaseGroupId,
  ShowcaseRouteMeta,
} from './types'

type ShowcaseItemInput = Omit<ShowcaseCatalogItem, 'localeBaseKey' | 'sourcePaths' | 'tags'> & {
  sourcePath: string
  sourcePaths?: readonly string[]
  tags?: string[]
}

type ShowcaseViewModuleLoader = () => Promise<unknown>

interface ShowcaseRouteGroup {
  id: string
  groupId: ShowcaseGroupId
  path: `/showcase${string}`
  name: string
  titleKey: `router.showcase.${string}`
  icon: `i-${string}`
  rank: number
  redirect: `/showcase${string}`
}

const SHOWCASE_VIEW_SOURCE_PREFIX = 'apps/web-demo/src/views/showcase/'
const showcaseViewModules = import.meta.glob<unknown>('../**/*.vue')

const SHOWCASE_SHARED_SOURCE_PATHS = [
  'apps/web-demo/src/views/showcase/shared/ShowcaseCapabilityPage.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseDemoPanel.vue',
  'apps/web-demo/src/views/showcase/shared/ShowcaseFeatureCard.vue',
  'apps/web-demo/src/views/showcase/data/showcaseDemoContent.ts',
] as const

const COMPONENT_DEMO_SOURCE =
  'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseComponentDemo.vue'
const FEEDBACK_DEMO_SOURCE =
  'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseFeedbackDemo.vue'
const FEEDBACK_DIALOG_BRIDGE_SOURCE =
  'apps/web-demo/src/views/showcase/shared/ShowcaseFeedbackDialogBridge.ts'
const FEEDBACK_ADAPTER_SOURCE = 'apps/web-demo/src/adapters/showcaseFeedback.adapter.ts'
const CHART_DEMO_SOURCE = 'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseChartDemo.vue'
const HOOK_DEMO_SOURCE = 'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseHookDemo.vue'
const UTILITY_DEMO_SOURCE =
  'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseUtilityDemo.vue'
const RUNTIME_DEMO_SOURCE =
  'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseRuntimeDemo.vue'
const DESIGN_DEMO_SOURCE =
  'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseDesignDemo.vue'
const CHART_HELPER_SOURCE = 'apps/web-demo/src/views/showcase/data/showcaseChartOptions.ts'
const UTILITY_HELPER_SOURCE = 'apps/web-demo/src/views/showcase/data/showcaseUtilityDemos.ts'

const CHART_ADAPTER_SOURCES = [
  CHART_DEMO_SOURCE,
  CHART_HELPER_SOURCE,
  'apps/web-demo/src/adapters/charts/UseEcharts.vue',
] as const

const RUNTIME_ADAPTER_SOURCES = [
  RUNTIME_DEMO_SOURCE,
  'apps/web-demo/src/adapters/http.adapter.ts',
  'apps/web-demo/src/adapters/runtime.adapter.ts',
  'apps/web-demo/src/adapters/device.adapter.ts',
] as const

const SHOWCASE_EXTRA_SOURCE_PATHS_BY_ID: Partial<Record<string, readonly string[]>> = {
  'components-primevue-adapter': [COMPONENT_DEMO_SOURCE],
  'components-empty-state': [
    COMPONENT_DEMO_SOURCE,
    FEEDBACK_ADAPTER_SOURCE,
    'packages/vue-ui/src/EmptyState/EmptyState.vue',
  ],
  'components-icons': [COMPONENT_DEMO_SOURCE, 'packages/vue-ui/src/Icons/Icons.vue'],
  'components-c-scrollbar': [
    COMPONENT_DEMO_SOURCE,
    'packages/vue-ui/src/CScrollbar/CScrollbar.vue',
  ],
  'components-pro-tree-table-overview': [
    'apps/web-demo/src/views/showcase/components/pro-tree-table/shared/proTreeTableDemoData.ts',
    'packages/vue-ui/src/ProTreeTable/ProTreeTable.vue',
    'packages/vue-ui/src/ProTreeTable/types.ts',
    'packages/vue-ui/src/ProTreeTable/README.md',
  ],
  'feedback-dialog-toast': [
    FEEDBACK_DEMO_SOURCE,
    FEEDBACK_DIALOG_BRIDGE_SOURCE,
    FEEDBACK_ADAPTER_SOURCE,
    'apps/web-demo/src/hooks/modules/useDialog.tsx',
  ],
  'components-charts-overview': CHART_ADAPTER_SOURCES,
  'components-charts-theme': CHART_ADAPTER_SOURCES,
  'components-charts-responsive': CHART_ADAPTER_SOURCES,
  'components-charts-states': CHART_ADAPTER_SOURCES,
  'components-charts-events': CHART_ADAPTER_SOURCES,
  'components-charts-dashboard-preview': CHART_ADAPTER_SOURCES,
  'hooks-overview': [HOOK_DEMO_SOURCE],
  'hooks-theme-switching': [HOOK_DEMO_SOURCE, 'apps/web-demo/src/hooks/modules/useThemeSwitch.ts'],
  'hooks-locale-switching': [HOOK_DEMO_SOURCE, 'apps/web-demo/src/hooks/modules/useLocale.ts'],
  'hooks-http-flow': [HOOK_DEMO_SOURCE, 'apps/web-demo/src/hooks/modules/useHttpRequest.ts'],
  'hooks-auth-permission': [HOOK_DEMO_SOURCE, 'apps/web-demo/src/hooks/modules/useAuth.ts'],
  'hooks-layout-runtime': [HOOK_DEMO_SOURCE, 'apps/web-demo/src/hooks/layout/useLayoutRuntime.ts'],
  'hooks-responsive-device': [
    HOOK_DEMO_SOURCE,
    'apps/web-demo/src/stores/modules/system/device.ts',
  ],
  'utils-overview': [UTILITY_DEMO_SOURCE, UTILITY_HELPER_SOURCE],
  'utils-date': [UTILITY_DEMO_SOURCE, UTILITY_HELPER_SOURCE, 'apps/web-demo/src/utils/date/**'],
  'utils-safe-storage': [
    UTILITY_DEMO_SOURCE,
    UTILITY_HELPER_SOURCE,
    'apps/web-demo/src/utils/safeStorage/**',
  ],
  'utils-state-persistence': [
    UTILITY_DEMO_SOURCE,
    UTILITY_HELPER_SOURCE,
    'apps/web-demo/src/utils/safeStorage/piniaSerializer.ts',
  ],
  'runtime-overview': RUNTIME_ADAPTER_SOURCES,
  'runtime-http': RUNTIME_ADAPTER_SOURCES,
  'runtime-browser': RUNTIME_ADAPTER_SOURCES,
  'runtime-layout': RUNTIME_ADAPTER_SOURCES,
  'runtime-state-ownership': RUNTIME_ADAPTER_SOURCES,
  'design-tokens': [DESIGN_DEMO_SOURCE, 'packages/design-tokens/src/**'],
  'design-unocss': [
    DESIGN_DEMO_SOURCE,
    'packages/unocss-preset/src/shortcuts/semanticShortcuts.ts',
  ],
  'design-material': [
    DESIGN_DEMO_SOURCE,
    'packages/unocss-preset/src/shortcuts/semanticShortcuts.ts',
  ],
  'design-density': [DESIGN_DEMO_SOURCE, 'packages/design-tokens/src/size.ts'],
  'design-motion': [DESIGN_DEMO_SOURCE, 'apps/web-demo/src/plugins/animation/**'],
  governance: [RUNTIME_DEMO_SOURCE, 'apps/web-demo/src/views/showcase/data/showcaseCatalog.ts'],
  'desktop-boundary': [
    RUNTIME_DEMO_SOURCE,
    'apps/desktop/src/adapters/**',
    'apps/web-demo/src/adapters/**',
  ],
}

const SHOWCASE_RELATED_IDS_BY_ID: Partial<Record<string, readonly string[]>> = {
  overview: ['components-root', 'design-tokens', 'runtime-overview', 'governance'],
  'components-root': [
    'components-primevue-adapter',
    'components-empty-state',
    'components-charts-theme',
  ],
  'components-primevue-adapter': ['components-empty-state', 'components-icons'],
  'components-empty-state': ['feedback-dialog-toast', 'components-icons'],
  'components-icons': ['components-empty-state', 'design-tokens'],
  'components-c-scrollbar': ['components-icons', 'runtime-layout'],
  'feedback-dialog-toast': ['components-empty-state', 'components-c-scrollbar'],
  'components-charts-overview': ['components-charts-theme', 'components-charts-responsive'],
  'components-charts-theme': ['components-charts-responsive', 'design-tokens'],
  'components-charts-responsive': ['components-charts-theme', 'hooks-responsive-device'],
  'components-charts-states': ['components-charts-events', 'components-empty-state'],
  'components-charts-events': ['components-charts-states', 'feedback-dialog-toast'],
  'components-charts-dashboard-preview': ['components-charts-theme', 'runtime-overview'],
  'components-pro-tree-table-overview': [
    'components-pro-table-overview',
    'components-primevue-adapter',
  ],
  'hooks-overview': ['hooks-theme-switching', 'hooks-http-flow'],
  'hooks-theme-switching': ['hooks-locale-switching', 'design-motion'],
  'hooks-locale-switching': ['hooks-theme-switching', 'utils-date'],
  'hooks-http-flow': ['runtime-http', 'hooks-auth-permission'],
  'hooks-auth-permission': ['hooks-http-flow', 'runtime-state-ownership'],
  'hooks-layout-runtime': ['runtime-layout', 'hooks-responsive-device'],
  'hooks-responsive-device': ['components-charts-responsive', 'runtime-layout'],
  'utils-overview': ['utils-date', 'utils-safe-storage'],
  'utils-date': ['hooks-locale-switching', 'utils-safe-storage'],
  'utils-safe-storage': ['utils-state-persistence', 'runtime-state-ownership'],
  'utils-state-persistence': ['utils-safe-storage', 'runtime-state-ownership'],
  'runtime-overview': ['runtime-http', 'runtime-browser'],
  'runtime-http': ['hooks-http-flow', 'runtime-state-ownership'],
  'runtime-browser': ['runtime-http', 'desktop-boundary'],
  'runtime-layout': ['hooks-layout-runtime', 'hooks-responsive-device'],
  'runtime-state-ownership': ['utils-state-persistence', 'runtime-overview'],
  'design-tokens': ['design-unocss', 'design-material'],
  'design-unocss': ['design-tokens', 'design-material'],
  'design-material': ['design-tokens', 'design-density'],
  'design-density': ['design-material', 'design-motion'],
  'design-motion': ['design-density', 'hooks-theme-switching'],
  governance: ['runtime-overview', 'desktop-boundary'],
  'desktop-boundary': ['runtime-browser', 'governance'],
}

export const showcaseCatalogGroups = [
  {
    id: 'overview',
    titleKey: 'showcase.groups.overview.title',
    descriptionKey: 'showcase.groups.overview.description',
    icon: 'i-lucide-compass',
    rank: 0,
  },
  {
    id: 'components',
    titleKey: 'showcase.groups.components.title',
    descriptionKey: 'showcase.groups.components.description',
    icon: 'i-lucide-component',
    rank: 10,
  },
  {
    id: 'tables',
    titleKey: 'showcase.groups.tables.title',
    descriptionKey: 'showcase.groups.tables.description',
    icon: 'i-lucide-table',
    rank: 20,
  },
  {
    id: 'forms',
    titleKey: 'showcase.groups.forms.title',
    descriptionKey: 'showcase.groups.forms.description',
    icon: 'i-lucide-form-input',
    rank: 40,
  },
  {
    id: 'charts',
    titleKey: 'showcase.groups.charts.title',
    descriptionKey: 'showcase.groups.charts.description',
    icon: 'i-lucide-chart-no-axes-combined',
    rank: 60,
  },
  {
    id: 'feedback',
    titleKey: 'showcase.groups.feedback.title',
    descriptionKey: 'showcase.groups.feedback.description',
    icon: 'i-lucide-message-circle',
    rank: 90,
  },
  {
    id: 'hooks',
    titleKey: 'showcase.groups.hooks.title',
    descriptionKey: 'showcase.groups.hooks.description',
    icon: 'i-lucide-waypoints',
    rank: 100,
  },
  {
    id: 'utils',
    titleKey: 'showcase.groups.utils.title',
    descriptionKey: 'showcase.groups.utils.description',
    icon: 'i-lucide-wrench',
    rank: 120,
  },
  {
    id: 'runtime',
    titleKey: 'showcase.groups.runtime.title',
    descriptionKey: 'showcase.groups.runtime.description',
    icon: 'i-lucide-cpu',
    rank: 140,
  },
  {
    id: 'design',
    titleKey: 'showcase.groups.design.title',
    descriptionKey: 'showcase.groups.design.description',
    icon: 'i-lucide-swatch-book',
    rank: 160,
  },
  {
    id: 'governance',
    titleKey: 'showcase.groups.governance.title',
    descriptionKey: 'showcase.groups.governance.description',
    icon: 'i-lucide-shield-check',
    rank: 180,
  },
  {
    id: 'desktopBoundary',
    titleKey: 'showcase.groups.desktopBoundary.title',
    descriptionKey: 'showcase.groups.desktopBoundary.description',
    icon: 'i-lucide-monitor',
    rank: 190,
  },
] satisfies ShowcaseCatalogGroup[]

const overviewItem: ShowcaseItemInput = {
  id: 'overview',
  groupId: 'overview',
  path: '/showcase/overview',
  name: 'ShowcaseOverview',
  titleKey: 'router.showcase.overview',
  icon: 'i-lucide-compass',
  rank: 0,
  kind: 'overview',
  demoLevel: 'complete',
  sourcePath: 'apps/web-demo/src/views/showcase/index.vue',
  dashboardLink: true,
  tags: ['overview'],
}

const componentItems: ShowcaseItemInput[] = [
  {
    id: 'components-primevue-adapter',
    parentId: 'components-root',
    groupId: 'components',
    path: '/showcase/components/primevue-adapter',
    name: 'ShowcaseComponentsPrimeVueAdapter',
    titleKey: 'router.showcase.components.primevueAdapter',
    icon: 'i-lucide-plug',
    rank: 11,
    kind: 'demo',
    demoLevel: 'complete',
    sourcePath: 'apps/web-demo/src/views/showcase/components/primevue-adapter/index.vue',
    dashboardLink: true,
    tags: ['components', 'primevue'],
  },
  {
    id: 'components-empty-state',
    parentId: 'components-root',
    groupId: 'components',
    path: '/showcase/components/empty-state',
    name: 'ShowcaseComponentsEmptyState',
    titleKey: 'router.showcase.components.emptyState',
    icon: 'i-lucide-circle-dashed',
    rank: 12,
    kind: 'demo',
    demoLevel: 'preview',
    sourcePath: 'apps/web-demo/src/views/showcase/components/empty-state/index.vue',
    tags: ['components', 'empty-state'],
  },
  {
    id: 'components-icons',
    parentId: 'components-root',
    groupId: 'components',
    path: '/showcase/components/icons',
    name: 'ShowcaseComponentsIcons',
    titleKey: 'router.showcase.components.icons',
    icon: 'i-lucide-icons',
    rank: 13,
    kind: 'demo',
    demoLevel: 'preview',
    sourcePath: 'apps/web-demo/src/views/showcase/components/icons/index.vue',
    tags: ['components', 'icons'],
  },
  {
    id: 'components-c-scrollbar',
    parentId: 'components-root',
    groupId: 'components',
    path: '/showcase/components/c-scrollbar',
    name: 'ShowcaseComponentsCScrollbar',
    titleKey: 'router.showcase.components.cScrollbar',
    icon: 'i-lucide-scroll-text',
    rank: 14,
    kind: 'demo',
    demoLevel: 'preview',
    sourcePath: 'apps/web-demo/src/views/showcase/components/c-scrollbar/index.vue',
    tags: ['components', 'scroll'],
  },
]

const proTableItems = [
  ['overview', 'Overview', 'overview', 20, 'complete'],
  ['basic', 'Basic', 'basic', 21, 'complete'],
  ['columns', 'Columns', 'columns', 22, 'preview'],
  ['column-groups', 'ColumnGroups', 'columnGroups', 23, 'preview'],
  ['sorting-filtering', 'SortingFiltering', 'sortingFiltering', 24, 'preview'],
  ['pagination', 'Pagination', 'pagination', 25, 'preview'],
  ['server-request', 'ServerRequest', 'serverRequest', 26, 'complete'],
  ['states', 'States', 'states', 27, 'complete'],
  ['selection', 'Selection', 'selection', 28, 'preview'],
  ['toolbar-density', 'ToolbarDensity', 'toolbarDensity', 29, 'preview'],
  ['virtual-infinite', 'VirtualInfinite', 'virtualInfinite', 30, 'preview'],
  ['export-refresh', 'ExportRefresh', 'exportRefresh', 31, 'preview'],
  ['cell-rendering', 'CellRendering', 'cellRendering', 32, 'preview'],
  ['inline-editing', 'InlineEditing', 'inlineEditing', 33, 'preview'],
  ['row-editing', 'RowEditing', 'rowEditing', 34, 'preview'],
  ['form-composition', 'FormComposition', 'formComposition', 35, 'preview'],
  ['api-events', 'ApiEvents', 'apiEvents', 36, 'preview'],
] as const

const proTableCatalogItems = proTableItems.map(
  ([slug, nameSuffix, keySuffix, rank, demoLevel]) => ({
    id: `components-pro-table-${slug}`,
    parentId: 'components-root',
    groupId: 'tables',
    path: `/showcase/components/pro-table/${slug}`,
    name: `ShowcaseComponentsProTable${nameSuffix}`,
    titleKey: `router.showcase.components.proTable.${keySuffix}`,
    icon: 'i-lucide-table',
    rank,
    kind: 'table',
    demoLevel,
    sourcePath: `apps/web-demo/src/views/showcase/components/pro-table/${slug}/index.vue`,
    dashboardLink: slug === 'basic',
    tags: ['components', 'tables', 'pro-table'],
  })
) satisfies ShowcaseItemInput[]

const proTreeTableItems = [['overview', 'Overview', 'overview', 37, 'preview']] as const

const proTreeTableCatalogItems = proTreeTableItems.map(
  ([slug, nameSuffix, keySuffix, rank, demoLevel]) => ({
    id: `components-pro-tree-table-${slug}`,
    parentId: 'components-root',
    groupId: 'tables',
    path: `/showcase/components/pro-tree-table/${slug}`,
    name: `ShowcaseComponentsProTreeTable${nameSuffix}`,
    titleKey: `router.showcase.components.proTreeTable.${keySuffix}`,
    icon: 'i-lucide-list-tree',
    rank,
    kind: 'table',
    demoLevel,
    sourcePath: `apps/web-demo/src/views/showcase/components/pro-tree-table/${slug}/index.vue`,
    tags: ['components', 'tables', 'pro-tree-table', 'experimental'],
  })
) satisfies ShowcaseItemInput[]

const proFormItems = [
  ['overview', 'Overview', 'overview', 40, 'complete'],
  ['basic-schema', 'BasicSchema', 'basicSchema', 41, 'complete'],
  ['grouped-layout', 'GroupedLayout', 'groupedLayout', 42, 'preview'],
  ['validation', 'Validation', 'validation', 43, 'complete'],
  ['dependencies-computed', 'DependenciesComputed', 'dependenciesComputed', 44, 'preview'],
  ['conditional-visibility', 'ConditionalVisibility', 'conditionalVisibility', 45, 'preview'],
  ['reactions', 'Reactions', 'reactions', 46, 'complete'],
  ['async-data', 'AsyncData', 'asyncData', 47, 'preview'],
  ['field-arrays', 'FieldArrays', 'fieldArrays', 48, 'preview'],
  ['plugins-draft', 'PluginsDraft', 'pluginsDraft', 49, 'preview'],
  ['submit-states', 'SubmitStates', 'submitStates', 50, 'preview'],
  ['api-events', 'ApiEvents', 'apiEvents', 51, 'preview'],
] as const

const proFormCatalogItems = proFormItems.map(([slug, nameSuffix, keySuffix, rank, demoLevel]) => ({
  id: `components-pro-form-${slug}`,
  parentId: 'components-root',
  groupId: 'forms',
  path: `/showcase/components/pro-form/${slug}`,
  name: `ShowcaseComponentsProForm${nameSuffix}`,
  titleKey: `router.showcase.components.proForm.${keySuffix}`,
  icon: 'i-lucide-form-input',
  rank,
  kind: 'form',
  demoLevel,
  sourcePath: `apps/web-demo/src/views/showcase/components/pro-form/${slug}/index.vue`,
  dashboardLink: slug === 'validation',
  tags: ['components', 'forms', 'pro-form'],
})) satisfies ShowcaseItemInput[]

const chartItems = [
  ['overview', 'Overview', 'overview', 60, 'complete'],
  ['theme', 'Theme', 'theme', 61, 'complete'],
  ['responsive', 'Responsive', 'responsive', 62, 'complete'],
  ['states', 'States', 'states', 63, 'preview'],
  ['events', 'Events', 'events', 64, 'preview'],
  ['dashboard-preview', 'DashboardPreview', 'dashboardPreview', 65, 'preview'],
] as const

const chartCatalogItems = chartItems.map(([slug, nameSuffix, keySuffix, rank, demoLevel]) => ({
  id: `components-charts-${slug}`,
  parentId: 'components-root',
  groupId: 'charts',
  path: `/showcase/components/charts/${slug}`,
  name: `ShowcaseComponentsCharts${nameSuffix}`,
  titleKey: `router.showcase.components.charts.${keySuffix}`,
  icon: 'i-lucide-chart-no-axes-combined',
  rank,
  kind: 'chart',
  demoLevel,
  sourcePath: `apps/web-demo/src/views/showcase/components/charts/${slug}/index.vue`,
  dashboardLink: slug === 'theme',
  tags: ['components', 'charts'],
})) satisfies ShowcaseItemInput[]

const standaloneItems: ShowcaseItemInput[] = [
  {
    id: 'feedback-dialog-toast',
    groupId: 'feedback',
    path: '/showcase/feedback/dialog-toast',
    name: 'ShowcaseFeedbackDialogToast',
    titleKey: 'router.showcase.feedback.dialogToast',
    icon: 'i-lucide-message-circle',
    rank: 90,
    kind: 'demo',
    demoLevel: 'preview',
    sourcePath: 'apps/web-demo/src/views/showcase/feedback/dialog-toast/index.vue',
    tags: ['feedback', 'dialog', 'toast'],
  },
  ...((
    [
      [
        'hooks-overview',
        'hooks',
        '/showcase/hooks/overview',
        'ShowcaseHooksOverview',
        'router.showcase.hooks.overview',
        'i-lucide-waypoints',
        100,
        'overview',
      ],
      [
        'hooks-theme-switching',
        'hooks',
        '/showcase/hooks/theme-switching',
        'ShowcaseHooksThemeSwitching',
        'router.showcase.hooks.themeSwitching',
        'i-lucide-moon-star',
        101,
        'demo',
      ],
      [
        'hooks-locale-switching',
        'hooks',
        '/showcase/hooks/locale-switching',
        'ShowcaseHooksLocaleSwitching',
        'router.showcase.hooks.localeSwitching',
        'i-lucide-languages',
        102,
        'demo',
      ],
      [
        'hooks-http-flow',
        'hooks',
        '/showcase/hooks/http-flow',
        'ShowcaseHooksHttpFlow',
        'router.showcase.hooks.httpFlow',
        'i-lucide-webhook',
        103,
        'technical',
      ],
      [
        'hooks-auth-permission',
        'hooks',
        '/showcase/hooks/auth-permission',
        'ShowcaseHooksAuthPermission',
        'router.showcase.hooks.authPermission',
        'i-lucide-shield-check',
        104,
        'technical',
      ],
      [
        'hooks-layout-runtime',
        'hooks',
        '/showcase/hooks/layout-runtime',
        'ShowcaseHooksLayoutRuntime',
        'router.showcase.hooks.layoutRuntime',
        'i-lucide-layout-dashboard',
        105,
        'technical',
      ],
      [
        'hooks-responsive-device',
        'hooks',
        '/showcase/hooks/responsive-device',
        'ShowcaseHooksResponsiveDevice',
        'router.showcase.hooks.responsiveDevice',
        'i-lucide-monitor-smartphone',
        106,
        'demo',
      ],
      [
        'utils-overview',
        'utils',
        '/showcase/utils/overview',
        'ShowcaseUtilsOverview',
        'router.showcase.utils.overview',
        'i-lucide-wrench',
        120,
        'overview',
      ],
      [
        'utils-date',
        'utils',
        '/showcase/utils/date',
        'ShowcaseUtilsDate',
        'router.showcase.utils.date',
        'i-lucide-calendar-clock',
        121,
        'technical',
      ],
      [
        'utils-safe-storage',
        'utils',
        '/showcase/utils/safe-storage',
        'ShowcaseUtilsSafeStorage',
        'router.showcase.utils.safeStorage',
        'i-lucide-lock-keyhole',
        122,
        'technical',
      ],
      [
        'utils-state-persistence',
        'utils',
        '/showcase/utils/state-persistence',
        'ShowcaseUtilsStatePersistence',
        'router.showcase.utils.statePersistence',
        'i-lucide-database',
        123,
        'technical',
      ],
      [
        'runtime-overview',
        'runtime',
        '/showcase/runtime/overview',
        'ShowcaseRuntimeOverview',
        'router.showcase.runtime.overview',
        'i-lucide-cpu',
        140,
        'overview',
      ],
      [
        'runtime-http',
        'runtime',
        '/showcase/runtime/http',
        'ShowcaseRuntimeHttp',
        'router.showcase.runtime.http',
        'i-lucide-webhook',
        141,
        'technical',
      ],
      [
        'runtime-browser',
        'runtime',
        '/showcase/runtime/browser-runtime',
        'ShowcaseRuntimeBrowser',
        'router.showcase.runtime.browser',
        'i-lucide-globe-2',
        142,
        'technical',
      ],
      [
        'runtime-layout',
        'runtime',
        '/showcase/runtime/layout',
        'ShowcaseRuntimeLayout',
        'router.showcase.runtime.layout',
        'i-lucide-panels-top-left',
        143,
        'technical',
      ],
      [
        'runtime-state-ownership',
        'runtime',
        '/showcase/runtime/state-ownership',
        'ShowcaseRuntimeStateOwnership',
        'router.showcase.runtime.stateOwnership',
        'i-lucide-database',
        144,
        'technical',
      ],
      [
        'design-tokens',
        'design',
        '/showcase/design/tokens',
        'ShowcaseDesignTokens',
        'router.showcase.design.tokens',
        'i-lucide-swatch-book',
        160,
        'technical',
      ],
      [
        'design-unocss',
        'design',
        '/showcase/design/unocss',
        'ShowcaseDesignUnocss',
        'router.showcase.design.unocss',
        'i-lucide-diamond',
        161,
        'technical',
      ],
      [
        'design-material',
        'design',
        '/showcase/design/material',
        'ShowcaseDesignMaterial',
        'router.showcase.design.material',
        'i-lucide-layers-3',
        162,
        'technical',
      ],
      [
        'design-density',
        'design',
        '/showcase/design/density',
        'ShowcaseDesignDensity',
        'router.showcase.design.density',
        'i-lucide-ruler',
        163,
        'technical',
      ],
      [
        'design-motion',
        'design',
        '/showcase/design/motion',
        'ShowcaseDesignMotion',
        'router.showcase.design.motion',
        'i-lucide-move-3d',
        164,
        'technical',
      ],
      [
        'governance',
        'governance',
        '/showcase/governance',
        'ShowcaseGovernance',
        'router.showcase.governance.root',
        'i-lucide-shield-check',
        180,
        'technical',
      ],
      [
        'desktop-boundary',
        'desktopBoundary',
        '/showcase/desktop-boundary',
        'ShowcaseDesktopBoundary',
        'router.showcase.desktopBoundary.root',
        'i-lucide-monitor',
        190,
        'technical',
      ],
    ] as const
  ).map(([id, groupId, path, name, titleKey, icon, rank, kind]) => ({
    id,
    groupId,
    path,
    name,
    titleKey,
    icon,
    rank,
    kind,
    demoLevel: id === 'design-tokens' || id === 'runtime-overview' ? 'complete' : 'preview',
    sourcePath: `apps/web-demo/src/views/showcase/${String(path).replace('/showcase/', '')}/index.vue`,
    dashboardLink: ['design-tokens', 'runtime-overview', 'governance'].includes(String(id)),
    tags: [String(groupId)],
  })) satisfies ShowcaseItemInput[]),
]

function toCatalogItem(item: ShowcaseItemInput): ShowcaseCatalogItem {
  const relatedIds = SHOWCASE_RELATED_IDS_BY_ID[item.id] ?? item.relatedIds
  const isRemainingShowcaseItem = Object.prototype.hasOwnProperty.call(
    SHOWCASE_RELATED_IDS_BY_ID,
    item.id
  )
  const sharedSourcePaths = isRemainingShowcaseItem ? SHOWCASE_SHARED_SOURCE_PATHS : []
  const extraSourcePaths = item.sourcePaths ?? SHOWCASE_EXTRA_SOURCE_PATHS_BY_ID[item.id] ?? []

  return {
    ...item,
    localeBaseKey: `showcase.pages.${item.id}`,
    sourcePaths: [item.sourcePath, ...sharedSourcePaths, ...extraSourcePaths],
    tags: item.tags ?? [item.groupId],
    ...(relatedIds ? { relatedIds: [...relatedIds] } : {}),
  }
}

const showcaseCatalogInputs: ShowcaseItemInput[] = [
  overviewItem,
  {
    id: 'components-root',
    groupId: 'components',
    path: '/showcase/components',
    name: 'ShowcaseComponentsRoot',
    titleKey: 'router.showcase.components.root',
    icon: 'i-lucide-component',
    rank: 10,
    kind: 'overview',
    demoLevel: 'preview',
    sourcePath: 'apps/web-demo/src/views/showcase/data/showcaseCatalog.ts',
    tags: ['components'],
  },
  ...componentItems,
  ...proTableCatalogItems,
  ...proTreeTableCatalogItems,
  ...proFormCatalogItems,
  ...chartCatalogItems,
  ...standaloneItems,
]

export const showcaseCatalog = showcaseCatalogInputs.map(
  toCatalogItem
) satisfies ShowcaseCatalogItem[]

export const SHOWCASE_ROOT_ROUTE = {
  id: 'root',
  path: '/showcase',
  name: 'ShowcaseRoot',
  titleKey: 'router.showcase.root',
  icon: 'i-lucide-sparkles',
  rank: 5,
  redirect: '/showcase/overview',
} as const

export const SHOWCASE_ROUTE_GROUPS = [
  {
    id: 'components-pro-table',
    groupId: 'tables',
    path: '/showcase/components/pro-table',
    name: 'ShowcaseComponentsProTable',
    titleKey: 'router.showcase.components.proTable.root',
    icon: 'i-lucide-table',
    rank: 20,
    redirect: '/showcase/components/pro-table/overview',
  },
  {
    id: 'components-pro-tree-table',
    groupId: 'tables',
    path: '/showcase/components/pro-tree-table',
    name: 'ShowcaseComponentsProTreeTable',
    titleKey: 'router.showcase.components.proTreeTable.root',
    icon: 'i-lucide-list-tree',
    rank: 37,
    redirect: '/showcase/components/pro-tree-table/overview',
  },
  {
    id: 'components-pro-form',
    groupId: 'forms',
    path: '/showcase/components/pro-form',
    name: 'ShowcaseComponentsProForm',
    titleKey: 'router.showcase.components.proForm.root',
    icon: 'i-lucide-form-input',
    rank: 40,
    redirect: '/showcase/components/pro-form/overview',
  },
  {
    id: 'components-charts',
    groupId: 'charts',
    path: '/showcase/components/charts',
    name: 'ShowcaseComponentsCharts',
    titleKey: 'router.showcase.components.charts.root',
    icon: 'i-lucide-chart-no-axes-combined',
    rank: 60,
    redirect: '/showcase/components/charts/overview',
  },
  {
    id: 'hooks',
    groupId: 'hooks',
    path: '/showcase/hooks',
    name: 'ShowcaseHooks',
    titleKey: 'router.showcase.hooks.root',
    icon: 'i-lucide-waypoints',
    rank: 100,
    redirect: '/showcase/hooks/overview',
  },
  {
    id: 'utils',
    groupId: 'utils',
    path: '/showcase/utils',
    name: 'ShowcaseUtils',
    titleKey: 'router.showcase.utils.root',
    icon: 'i-lucide-wrench',
    rank: 120,
    redirect: '/showcase/utils/overview',
  },
  {
    id: 'runtime',
    groupId: 'runtime',
    path: '/showcase/runtime',
    name: 'ShowcaseRuntime',
    titleKey: 'router.showcase.runtime.root',
    icon: 'i-lucide-cpu',
    rank: 140,
    redirect: '/showcase/runtime/overview',
  },
  {
    id: 'design',
    groupId: 'design',
    path: '/showcase/design',
    name: 'ShowcaseDesign',
    titleKey: 'router.showcase.design.root',
    icon: 'i-lucide-swatch-book',
    rank: 160,
    redirect: '/showcase/design/tokens',
  },
] satisfies ShowcaseRouteGroup[]

const COMPONENT_ROUTE_GROUPS = ['tables', 'forms', 'charts'] satisfies ShowcaseGroupId[]
const ROOT_ROUTE_GROUPS = ['hooks', 'utils', 'runtime', 'design'] satisfies ShowcaseGroupId[]

function toShowcaseViewModuleKey(sourcePath: string, id: string): string {
  if (!sourcePath.startsWith(SHOWCASE_VIEW_SOURCE_PREFIX) || !sourcePath.endsWith('.vue')) {
    throw new Error(`[ShowcaseCatalog] Invalid Vue source path for ${id}: ${sourcePath}`)
  }

  return `../${sourcePath.slice(SHOWCASE_VIEW_SOURCE_PREFIX.length)}`
}

function getShowcaseSourceModuleKey(item: ShowcaseCatalogItem): string {
  const [sourcePath] = item.sourcePaths
  if (!sourcePath) throw new Error(`[ShowcaseCatalog] Missing source path for ${item.id}`)
  return toShowcaseViewModuleKey(sourcePath, item.id)
}

function createLazyComponent(item: ShowcaseCatalogItem): NonNullable<RouteConfig['component']> {
  const sourceModuleKey = getShowcaseSourceModuleKey(item)
  const loadModule: ShowcaseViewModuleLoader | undefined = showcaseViewModules[sourceModuleKey]

  if (!loadModule) {
    throw new Error(`[ShowcaseCatalog] Missing showcase view module: ${sourceModuleKey}`)
  }

  return async () => loadModule()
}

function createRouteMeta(item: ShowcaseCatalogItem): ShowcaseRouteMeta {
  return {
    titleKey: item.titleKey,
    icon: item.icon,
    rank: item.rank,
    showcaseId: item.id,
    showcaseGroupId: item.groupId,
    showcaseDemoLevel: item.demoLevel,
    showcaseKind: item.kind,
    showcaseSourcePaths: item.sourcePaths,
    dashboardLink: item.dashboardLink,
  }
}

function createCatalogRoute(item: ShowcaseCatalogItem): RouteConfig {
  return {
    path: item.path,
    name: item.name,
    component: createLazyComponent(item),
    meta: createRouteMeta(item),
  }
}

function createCatalogGroupRoute(
  item: ShowcaseCatalogItem,
  children: RouteConfig[],
  redirect: string
): RouteConfig {
  return {
    path: item.path,
    name: item.name,
    redirect,
    meta: {
      ...createRouteMeta(item),
      hiddenTag: true,
    },
    children,
  }
}

function sortCatalogItems(items: ShowcaseCatalogItem[]): ShowcaseCatalogItem[] {
  return [...items].sort((a, b) => a.rank - b.rank)
}

function sortRouteConfigs(routes: RouteConfig[]): RouteConfig[] {
  return [...routes].sort((a, b) => (a.meta?.rank ?? 999) - (b.meta?.rank ?? 999))
}

function requireCatalogItem(id: ShowcaseCatalogItem['id']): ShowcaseCatalogItem {
  const item = showcaseCatalog.find(catalogItem => catalogItem.id === id)
  if (!item) throw new Error(`[ShowcaseCatalog] Missing required catalog item: ${id}`)
  return item
}

function requireRouteGroup(id: ShowcaseRouteGroup['id']): ShowcaseRouteGroup {
  const group = SHOWCASE_ROUTE_GROUPS.find(routeGroup => routeGroup.id === id)
  if (!group) throw new Error(`[ShowcaseCatalog] Missing required route group: ${id}`)
  return group
}

function createRouteGroupMeta(group: ShowcaseRouteGroup): NonNullable<RouteConfig['meta']> {
  return {
    titleKey: group.titleKey,
    icon: group.icon,
    rank: group.rank,
    hiddenTag: true,
    showcaseGroupId: group.groupId,
  }
}

function createRouteGroupRoute(group: ShowcaseRouteGroup, children: RouteConfig[]): RouteConfig {
  return {
    path: group.path,
    name: group.name,
    redirect: group.redirect,
    meta: createRouteGroupMeta(group),
    children,
  }
}

function createCatalogRoutesByGroupId(
  items: ShowcaseCatalogItem[],
  groupId: ShowcaseGroupId
): RouteConfig[] {
  return sortCatalogItems(items.filter(item => item.groupId === groupId)).map(createCatalogRoute)
}

function createCatalogRoutesByRouteGroup(
  items: ShowcaseCatalogItem[],
  group: ShowcaseRouteGroup
): RouteConfig[] {
  const groupPathPrefix = `${group.path}/`
  return sortCatalogItems(items.filter(item => item.path.startsWith(groupPathPrefix))).map(
    createCatalogRoute
  )
}

function isRootGroupedCatalogItem(item: ShowcaseCatalogItem): boolean {
  return ROOT_ROUTE_GROUPS.some(groupId => groupId === item.groupId)
}

export function createShowcaseRoutes(): RouteConfig {
  const overview = requireCatalogItem('overview')
  const componentsRoot = requireCatalogItem('components-root')
  const componentsChildren = sortCatalogItems(
    showcaseCatalog.filter(item => item.parentId === componentsRoot.id)
  )
  const componentPrimitiveChildren = componentsChildren.filter(
    item => !COMPONENT_ROUTE_GROUPS.some(groupId => groupId === item.groupId)
  )
  const rootChildren = sortCatalogItems(
    showcaseCatalog.filter(
      item =>
        item.id === overview.id ||
        item.id === componentsRoot.id ||
        (!item.parentId && !isRootGroupedCatalogItem(item))
    )
  )
  const rootChildRoutes = rootChildren.map(item => {
    if (item.id !== componentsRoot.id) return createCatalogRoute(item)
    return createCatalogGroupRoute(
      item,
      sortRouteConfigs([
        ...componentPrimitiveChildren.map(createCatalogRoute),
        createRouteGroupRoute(
          requireRouteGroup('components-pro-table'),
          createCatalogRoutesByRouteGroup(
            componentsChildren,
            requireRouteGroup('components-pro-table')
          )
        ),
        createRouteGroupRoute(
          requireRouteGroup('components-pro-tree-table'),
          createCatalogRoutesByRouteGroup(
            componentsChildren,
            requireRouteGroup('components-pro-tree-table')
          )
        ),
        createRouteGroupRoute(
          requireRouteGroup('components-pro-form'),
          createCatalogRoutesByRouteGroup(
            componentsChildren,
            requireRouteGroup('components-pro-form')
          )
        ),
        createRouteGroupRoute(
          requireRouteGroup('components-charts'),
          createCatalogRoutesByRouteGroup(
            componentsChildren,
            requireRouteGroup('components-charts')
          )
        ),
      ]),
      '/showcase/components/primevue-adapter'
    )
  })

  return {
    path: SHOWCASE_ROOT_ROUTE.path,
    name: SHOWCASE_ROOT_ROUTE.name,
    redirect: SHOWCASE_ROOT_ROUTE.redirect,
    meta: {
      titleKey: SHOWCASE_ROOT_ROUTE.titleKey,
      icon: SHOWCASE_ROOT_ROUTE.icon,
      rank: SHOWCASE_ROOT_ROUTE.rank,
      hiddenTag: true,
    },
    children: sortRouteConfigs([
      ...rootChildRoutes,
      createRouteGroupRoute(
        requireRouteGroup('hooks'),
        createCatalogRoutesByGroupId(showcaseCatalog, 'hooks')
      ),
      createRouteGroupRoute(
        requireRouteGroup('utils'),
        createCatalogRoutesByGroupId(showcaseCatalog, 'utils')
      ),
      createRouteGroupRoute(
        requireRouteGroup('runtime'),
        createCatalogRoutesByGroupId(showcaseCatalog, 'runtime')
      ),
      createRouteGroupRoute(
        requireRouteGroup('design'),
        createCatalogRoutesByGroupId(showcaseCatalog, 'design')
      ),
    ]),
  }
}
