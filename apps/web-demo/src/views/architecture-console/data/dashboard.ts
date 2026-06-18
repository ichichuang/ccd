import type {
  DashboardArchitectureLane,
  DashboardCapabilityCard,
  DashboardCard,
  DashboardComponentPanel,
  DashboardEvidence,
  DashboardPipelineCommand,
  DashboardTableRow,
} from './types'

export const dashboardStatusCards: DashboardCard[] = [
  {
    key: 'packageBoundary',
    valueKey: 'layered',
    icon: 'i-lucide-package-check',
    severity: 'success',
  },
  {
    key: 'runtimeIsolation',
    valueKey: 'appOwned',
    icon: 'i-lucide-shield-check',
    severity: 'info',
  },
  {
    key: 'validationGate',
    valueKey: 'scripted',
    icon: 'i-lucide-list-checks',
    severity: 'success',
  },
  {
    key: 'uiRuntime',
    valueKey: 'tokenDriven',
    icon: 'i-lucide-component',
    severity: 'info',
  },
]

export const dashboardCapabilityCards: DashboardCapabilityCard[] = [
  {
    key: 'packageModel',
    valueKey: 'contractsCoreApps',
    icon: 'i-lucide-git-branch',
    severity: 'success',
    bulletCount: 3,
    evidencePath: 'wiki/canonical/architecture/package-responsibility-matrix.md',
  },
  {
    key: 'runtimeIsolation',
    valueKey: 'adapterInjected',
    icon: 'i-lucide-radar',
    severity: 'info',
    bulletCount: 3,
    evidencePath: 'wiki/canonical/architecture/runtime-isolation.md',
  },
  {
    key: 'uiSystem',
    valueKey: 'primevueProTokens',
    icon: 'i-lucide-component',
    severity: 'success',
    bulletCount: 3,
    evidencePath: 'packages/vue-ui/src/index.ts',
  },
  {
    key: 'governanceSystem',
    valueKey: 'wikiValidated',
    icon: 'i-lucide-shield-check',
    severity: 'warn',
    bulletCount: 3,
    evidencePath: '.ai/protocol/AGENTS.core.md',
  },
]

export const dashboardArchitectureLanes: DashboardArchitectureLane[] = [
  {
    key: 'contracts',
    icon: 'i-lucide-file-type',
    command: 'pnpm api:report',
    pointCount: 3,
  },
  {
    key: 'core',
    icon: 'i-lucide-cpu',
    command: 'pnpm arch:runtime',
    pointCount: 3,
  },
  {
    key: 'webDemo',
    icon: 'i-lucide-globe-2',
    command: 'pnpm build:web-demo',
    pointCount: 3,
  },
  {
    key: 'desktop',
    icon: 'i-lucide-monitor',
    command: 'pnpm sync:desktop-config',
    pointCount: 3,
  },
]

export const dashboardComponentPanels: DashboardComponentPanel[] = [
  {
    key: 'primevueAdapter',
    valueKey: 'ptStyled',
    icon: 'i-lucide-plug',
    severity: 'info',
    evidencePath: 'packages/vue-primevue-adapter/src/index.ts',
  },
  {
    key: 'proForm',
    valueKey: 'schemaDriven',
    icon: 'i-lucide-form-input',
    severity: 'success',
    evidencePath: 'packages/vue-ui/src/ProForm/**',
  },
  {
    key: 'proTable',
    valueKey: 'dataEngine',
    icon: 'i-lucide-table',
    severity: 'success',
    evidencePath: 'packages/vue-ui/src/ProTable/**',
  },
  {
    key: 'useEcharts',
    valueKey: 'themeAware',
    icon: 'i-lucide-chart-no-axes-combined',
    severity: 'info',
    evidencePath: 'packages/vue-charts/src/UseEcharts/**',
  },
]

export const dashboardTableRows: DashboardTableRow[] = [
  {
    id: 'package-boundary',
    capabilityKey: 'packageBoundary',
    ownerKey: 'workspace',
    status: 'governed',
    validation: 'pnpm arch:boundaries',
  },
  {
    id: 'http-runtime',
    capabilityKey: 'httpRuntime',
    ownerKey: 'webDemo',
    status: 'appOwned',
    validation: 'pnpm ai:guard',
  },
  {
    id: 'safe-storage',
    capabilityKey: 'safeStorage',
    ownerKey: 'webDemo',
    status: 'appOwned',
    validation: 'pnpm test:run',
  },
  {
    id: 'design-system',
    capabilityKey: 'designSystem',
    ownerKey: 'tokens',
    status: 'tokenized',
    validation: 'pnpm validate:tokens',
  },
]

export const dashboardEvidenceCards: DashboardEvidence[] = [
  {
    key: 'monorepoTopology',
    path: 'wiki/canonical/architecture/package-responsibility-matrix.md',
    icon: 'i-lucide-git-branch',
  },
  {
    key: 'runtimeBoundaries',
    path: 'wiki/canonical/architecture/runtime-isolation.md',
    icon: 'i-lucide-radar',
  },
  {
    key: 'webDemoRole',
    path: 'wiki/canonical/application-boundaries/web-demo-role.md',
    icon: 'i-lucide-globe-2',
  },
  {
    key: 'aiGovernance',
    path: '.ai/protocol/AGENTS.core.md',
    icon: 'i-lucide-book-open',
  },
]

export const dashboardPipelineCommands: DashboardPipelineCommand[] = [
  { key: 'lint', command: 'pnpm lint:check' },
  { key: 'typecheck', command: 'pnpm type-check' },
  { key: 'unit', command: 'pnpm test:run' },
  { key: 'runtime', command: 'pnpm arch:runtime' },
  { key: 'api', command: 'pnpm api:report' },
  { key: 'supply', command: 'pnpm supply:check' },
  { key: 'governance', command: 'pnpm governance:full' },
]
