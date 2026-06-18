import { showcaseCatalog } from './showcaseCatalog'
import type { ShowcaseCatalogItem } from './types'

export const remainingShowcaseImplementedIds = [
  'overview',
  'components-root',
  'components-primevue-adapter',
  'components-empty-state',
  'components-icons',
  'components-c-scrollbar',
  'feedback-dialog-toast',
  'components-charts-overview',
  'components-charts-theme',
  'components-charts-responsive',
  'components-charts-states',
  'components-charts-events',
  'components-charts-dashboard-preview',
  'hooks-overview',
  'hooks-theme-switching',
  'hooks-locale-switching',
  'hooks-http-flow',
  'hooks-auth-permission',
  'hooks-layout-runtime',
  'hooks-responsive-device',
  'utils-overview',
  'utils-date',
  'utils-safe-storage',
  'utils-state-persistence',
  'runtime-overview',
  'runtime-http',
  'runtime-browser',
  'runtime-layout',
  'runtime-state-ownership',
  'design-tokens',
  'design-unocss',
  'design-material',
  'design-density',
  'design-motion',
  'governance',
  'desktop-boundary',
] as const

export type RemainingShowcaseId = (typeof remainingShowcaseImplementedIds)[number]

export type RemainingShowcaseDemoKind =
  | 'catalog-components'
  | 'catalog-overview'
  | 'catalog-single-group'
  | 'component-c-scrollbar'
  | 'component-empty-state'
  | 'component-icons'
  | 'component-primevue-adapter'
  | 'feedback-dialog-toast'
  | `chart-${string}`
  | `design-${string}`
  | `hook-${string}`
  | `runtime-${string}`
  | `utils-${string}`

export const remainingShowcaseCardIcons = {
  adapterOwnership: 'i-lucide-network',
  authPermission: 'i-lucide-shield-check',
  browserRuntime: 'i-lucide-globe-2',
  catalogMap: 'i-lucide-map',
  chartEvents: 'i-lucide-radio',
  chartStates: 'i-lucide-activity',
  chartWrapper: 'i-lucide-chart-no-axes-combined',
  componentAdapter: 'i-lucide-plug',
  dashboardPreview: 'i-lucide-layout-dashboard',
  dateFormatting: 'i-lucide-calendar-clock',
  deliveryDiscipline: 'i-lucide-clipboard-check',
  densityScale: 'i-lucide-ruler',
  desktopBoundary: 'i-lucide-monitor',
  deviceSignals: 'i-lucide-monitor-smartphone',
  dialogFacade: 'i-lucide-message-square',
  emptyStateReady: 'i-lucide-circle-dashed',
  feedbackLoop: 'i-lucide-message-circle',
  hookScenario: 'i-lucide-waypoints',
  httpBoundary: 'i-lucide-webhook',
  iconLanguage: 'i-lucide-icons',
  layoutRuntime: 'i-lucide-panels-top-left',
  layoutSignals: 'i-lucide-layout-dashboard',
  localeRuntime: 'i-lucide-languages',
  materialRules: 'i-lucide-layers-3',
  motionRules: 'i-lucide-move-horizontal',
  noRawRuntime: 'i-lucide-ban',
  plainCopy: 'i-lucide-type',
  primeControls: 'i-lucide-sliders-horizontal',
  productEntry: 'i-lucide-compass',
  reducedMotion: 'i-lucide-gauge',
  resizeAware: 'i-lucide-expand',
  safePersistence: 'i-lucide-lock-keyhole',
  scrollRegion: 'i-lucide-scroll-text',
  semanticShortcuts: 'i-lucide-diamond',
  sourceTrace: 'i-lucide-folder-code',
  stateOwnership: 'i-lucide-database',
  stateRestore: 'i-lucide-save',
  themeAware: 'i-lucide-moon-star',
  themeRuntime: 'i-lucide-palette',
  tokenFamilies: 'i-lucide-swatch-book',
  toastMessage: 'i-lucide-bell',
} as const satisfies Record<string, `i-${string}`>

export type RemainingShowcaseCardKey = keyof typeof remainingShowcaseCardIcons

export interface RemainingShowcaseContent {
  id: RemainingShowcaseId
  demoKind: RemainingShowcaseDemoKind
  features: readonly RemainingShowcaseCardKey[]
  explanations: readonly RemainingShowcaseCardKey[]
  technical: readonly RemainingShowcaseCardKey[]
}

const remainingShowcaseImplementedIdSet: ReadonlySet<string> = new Set(
  remainingShowcaseImplementedIds
)

const REMAINING_SHOWCASE_CONTENT = {
  overview: {
    id: 'overview',
    demoKind: 'catalog-overview',
    features: ['productEntry', 'catalogMap', 'plainCopy'],
    explanations: ['sourceTrace', 'deliveryDiscipline'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-root': {
    id: 'components-root',
    demoKind: 'catalog-components',
    features: ['componentAdapter', 'emptyStateReady', 'chartWrapper'],
    explanations: ['iconLanguage', 'scrollRegion'],
    technical: ['sourceTrace', 'plainCopy'],
  },
  'components-primevue-adapter': {
    id: 'components-primevue-adapter',
    demoKind: 'component-primevue-adapter',
    features: ['componentAdapter', 'primeControls', 'themeAware'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-empty-state': {
    id: 'components-empty-state',
    demoKind: 'component-empty-state',
    features: ['emptyStateReady', 'feedbackLoop', 'primeControls'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-icons': {
    id: 'components-icons',
    demoKind: 'component-icons',
    features: ['iconLanguage', 'themeAware', 'primeControls'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-c-scrollbar': {
    id: 'components-c-scrollbar',
    demoKind: 'component-c-scrollbar',
    features: ['scrollRegion', 'stateRestore', 'themeAware'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'feedback-dialog-toast': {
    id: 'feedback-dialog-toast',
    demoKind: 'feedback-dialog-toast',
    features: ['dialogFacade', 'toastMessage', 'emptyStateReady'],
    explanations: ['feedbackLoop', 'scrollRegion'],
    technical: ['sourceTrace', 'noRawRuntime'],
  },
  'components-charts-overview': {
    id: 'components-charts-overview',
    demoKind: 'chart-overview',
    features: ['chartWrapper', 'themeAware', 'resizeAware'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-charts-theme': {
    id: 'components-charts-theme',
    demoKind: 'chart-theme',
    features: ['themeAware', 'chartWrapper', 'tokenFamilies'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-charts-responsive': {
    id: 'components-charts-responsive',
    demoKind: 'chart-responsive',
    features: ['resizeAware', 'chartWrapper', 'deviceSignals'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-charts-states': {
    id: 'components-charts-states',
    demoKind: 'chart-states',
    features: ['chartStates', 'emptyStateReady', 'feedbackLoop'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-charts-events': {
    id: 'components-charts-events',
    demoKind: 'chart-events',
    features: ['chartEvents', 'feedbackLoop', 'sourceTrace'],
    explanations: ['plainCopy', 'chartWrapper'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'components-charts-dashboard-preview': {
    id: 'components-charts-dashboard-preview',
    demoKind: 'chart-dashboard-preview',
    features: ['chartWrapper', 'dashboardPreview', 'themeAware'],
    explanations: ['plainCopy', 'resizeAware'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'hooks-overview': {
    id: 'hooks-overview',
    demoKind: 'catalog-single-group',
    features: ['hookScenario', 'themeRuntime', 'layoutSignals'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'hooks-theme-switching': {
    id: 'hooks-theme-switching',
    demoKind: 'hook-theme-switching',
    features: ['themeRuntime', 'themeAware', 'reducedMotion'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'hooks-locale-switching': {
    id: 'hooks-locale-switching',
    demoKind: 'hook-locale-switching',
    features: ['localeRuntime', 'plainCopy', 'stateRestore'],
    explanations: ['sourceTrace', 'hookScenario'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'hooks-http-flow': {
    id: 'hooks-http-flow',
    demoKind: 'hook-http-flow',
    features: ['httpBoundary', 'feedbackLoop', 'stateOwnership'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'hooks-auth-permission': {
    id: 'hooks-auth-permission',
    demoKind: 'hook-auth-permission',
    features: ['authPermission', 'stateOwnership', 'feedbackLoop'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'hooks-layout-runtime': {
    id: 'hooks-layout-runtime',
    demoKind: 'hook-layout-runtime',
    features: ['layoutSignals', 'layoutRuntime', 'deviceSignals'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'hooks-responsive-device': {
    id: 'hooks-responsive-device',
    demoKind: 'hook-responsive-device',
    features: ['deviceSignals', 'resizeAware', 'layoutSignals'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'utils-overview': {
    id: 'utils-overview',
    demoKind: 'catalog-single-group',
    features: ['dateFormatting', 'safePersistence', 'stateRestore'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'utils-date': {
    id: 'utils-date',
    demoKind: 'utils-date',
    features: ['dateFormatting', 'localeRuntime', 'plainCopy'],
    explanations: ['sourceTrace', 'hookScenario'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'utils-safe-storage': {
    id: 'utils-safe-storage',
    demoKind: 'utils-safe-storage',
    features: ['safePersistence', 'stateRestore', 'noRawRuntime'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'utils-state-persistence': {
    id: 'utils-state-persistence',
    demoKind: 'utils-state-persistence',
    features: ['stateRestore', 'safePersistence', 'stateOwnership'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'runtime-overview': {
    id: 'runtime-overview',
    demoKind: 'runtime-overview',
    features: ['adapterOwnership', 'browserRuntime', 'stateOwnership'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['noRawRuntime', 'desktopBoundary'],
  },
  'runtime-http': {
    id: 'runtime-http',
    demoKind: 'runtime-http',
    features: ['httpBoundary', 'feedbackLoop', 'safePersistence'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'runtime-browser': {
    id: 'runtime-browser',
    demoKind: 'runtime-browser',
    features: ['browserRuntime', 'adapterOwnership', 'safePersistence'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['noRawRuntime', 'desktopBoundary'],
  },
  'runtime-layout': {
    id: 'runtime-layout',
    demoKind: 'runtime-layout',
    features: ['layoutRuntime', 'layoutSignals', 'deviceSignals'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'runtime-state-ownership': {
    id: 'runtime-state-ownership',
    demoKind: 'runtime-state-ownership',
    features: ['stateOwnership', 'safePersistence', 'adapterOwnership'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['noRawRuntime', 'desktopBoundary'],
  },
  'design-tokens': {
    id: 'design-tokens',
    demoKind: 'design-tokens',
    features: ['tokenFamilies', 'themeAware', 'plainCopy'],
    explanations: ['sourceTrace', 'reducedMotion'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'design-unocss': {
    id: 'design-unocss',
    demoKind: 'design-unocss',
    features: ['semanticShortcuts', 'tokenFamilies', 'plainCopy'],
    explanations: ['sourceTrace', 'noRawRuntime'],
    technical: ['adapterOwnership', 'reducedMotion'],
  },
  'design-material': {
    id: 'design-material',
    demoKind: 'design-material',
    features: ['materialRules', 'themeAware', 'plainCopy'],
    explanations: ['sourceTrace', 'tokenFamilies'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'design-density': {
    id: 'design-density',
    demoKind: 'design-density',
    features: ['densityScale', 'primeControls', 'plainCopy'],
    explanations: ['sourceTrace', 'tokenFamilies'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  'design-motion': {
    id: 'design-motion',
    demoKind: 'design-motion',
    features: ['motionRules', 'reducedMotion', 'plainCopy'],
    explanations: ['sourceTrace', 'themeRuntime'],
    technical: ['adapterOwnership', 'noRawRuntime'],
  },
  governance: {
    id: 'governance',
    demoKind: 'runtime-governance',
    features: ['deliveryDiscipline', 'sourceTrace', 'plainCopy'],
    explanations: ['catalogMap', 'noRawRuntime'],
    technical: ['adapterOwnership', 'desktopBoundary'],
  },
  'desktop-boundary': {
    id: 'desktop-boundary',
    demoKind: 'runtime-desktop-boundary',
    features: ['desktopBoundary', 'adapterOwnership', 'noRawRuntime'],
    explanations: ['plainCopy', 'sourceTrace'],
    technical: ['browserRuntime', 'stateOwnership'],
  },
} as const satisfies Record<RemainingShowcaseId, RemainingShowcaseContent>

export function isRemainingShowcaseId(id: string): id is RemainingShowcaseId {
  return remainingShowcaseImplementedIdSet.has(id)
}

export function getRemainingShowcaseContent(id: RemainingShowcaseId): RemainingShowcaseContent {
  return REMAINING_SHOWCASE_CONTENT[id]
}

export function getRemainingShowcaseItem(id: RemainingShowcaseId): ShowcaseCatalogItem {
  const item = showcaseCatalog.find(candidate => candidate.id === id)
  if (!item) throw new Error(`[ShowcaseDemoContent] Missing showcase catalog item: ${id}`)
  return item
}
