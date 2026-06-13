import type { ConsolePageModel } from './types'
import { baseStatus } from './types'

export const uiPages = {
  UiPrimeVueAdapter: {
    id: 'UiPrimeVueAdapter',
    key: 'primevueAdapter',
    status: baseStatus,
    stats: [
      { key: 'uiEcosystem', value: 'PrimeVue', icon: 'i-lucide-component' },
      { key: 'ptStyling', icon: 'i-lucide-paintbrush' },
    ],
    capabilities: [
      {
        key: 'adapterPackage',
        icon: 'i-lucide-plug',
        bulletCount: 3,
        sourcePaths: ['packages/vue-primevue-adapter/**'],
      },
      {
        key: 'appRegistration',
        icon: 'i-lucide-cable',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/plugins/modules/primevue.ts'],
      },
    ],
    evidence: [
      {
        key: 'adapterPackagePath',
        value: 'packages/vue-primevue-adapter/**',
        sourcePaths: ['packages/vue-primevue-adapter/**'],
      },
      {
        key: 'appPlugin',
        value: 'apps/web-demo/src/plugins/modules/primevue.ts',
        sourcePaths: ['apps/web-demo/src/plugins/modules/primevue.ts'],
      },
    ],
    commands: [{ key: 'lintComponentContracts', command: 'pnpm lint:check' }],
  },
  UiProForm: {
    id: 'UiProForm',
    key: 'proForm',
    status: baseStatus,
    stats: [
      { key: 'proFormLegacyRoutes', value: '9 -> 1', icon: 'i-lucide-form-input' },
      { key: 'schemaEngine', icon: 'i-lucide-workflow' },
    ],
    capabilities: [
      {
        key: 'schemaDrivenForm',
        icon: 'i-lucide-list-tree',
        bulletCount: 4,
        sourcePaths: ['packages/vue-ui/src/ProForm/**'],
      },
    ],
    evidence: [
      {
        key: 'proFormPackage',
        value: 'packages/vue-ui/src/ProForm/**',
        sourcePaths: ['packages/vue-ui/src/ProForm/**'],
      },
    ],
    commands: [{ key: 'webDemoTypeCheck', command: 'pnpm --filter @ccd/web-demo type-check' }],
  },
  UiProTable: {
    id: 'UiProTable',
    key: 'proTable',
    status: baseStatus,
    stats: [
      { key: 'proTableLegacyRoutes', value: '8 -> 1', icon: 'i-lucide-table' },
      { key: 'headlessBoundary', icon: 'i-lucide-brackets' },
    ],
    capabilities: [
      {
        key: 'typedColumns',
        icon: 'i-lucide-columns-3',
        bulletCount: 2,
        sourcePaths: ['packages/vue-ui/src/ProTable/**'],
      },
    ],
    evidence: [
      {
        key: 'proTablePackage',
        value: 'packages/vue-ui/src/ProTable/**',
        sourcePaths: ['packages/vue-ui/src/ProTable/**'],
      },
    ],
    commands: [{ key: 'testRun', command: 'pnpm test:run' }],
  },
  UiCharts: {
    id: 'UiCharts',
    key: 'charts',
    status: baseStatus,
    stats: [
      { key: 'chartWrapper', value: 'UseEcharts', icon: 'i-lucide-chart-no-axes-combined' },
      { key: 'reactiveTheme', icon: 'i-lucide-swatch-book' },
    ],
    capabilities: [
      {
        key: 'renderingGuard',
        icon: 'i-lucide-scan-eye',
        bulletCount: 2,
        sourcePaths: ['packages/vue-charts/**'],
      },
    ],
    evidence: [
      {
        key: 'chartsPackage',
        value: 'packages/vue-charts/**',
        sourcePaths: ['packages/vue-charts/**'],
      },
    ],
    commands: [{ key: 'e2eVisualTokens', command: 'pnpm e2e:visual' }],
  },
  UiFeedback: {
    id: 'UiFeedback',
    key: 'feedback',
    status: baseStatus,
    stats: [
      { key: 'feedbackCentral', icon: 'i-lucide-message-circle' },
      { key: 'emptyStatesReusable', icon: 'i-lucide-circle-dashed' },
    ],
    capabilities: [
      {
        key: 'uxPrimitives',
        icon: 'i-lucide-sparkles',
        bulletCount: 2,
        sourcePaths: ['packages/vue-ui/**'],
      },
    ],
    evidence: [
      { key: 'vueUiPackage', value: 'packages/vue-ui/**', sourcePaths: ['packages/vue-ui/**'] },
    ],
    commands: [{ key: 'lintBusinessViews', command: 'pnpm lint:check' }],
  },
} satisfies Record<string, ConsolePageModel>
