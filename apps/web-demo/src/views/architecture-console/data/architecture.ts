import type { ConsolePageModel } from './types'
import { baseStatus, packageStats } from './types'

export const architecturePages = {
  ArchitectureTopology: {
    id: 'ArchitectureTopology',
    key: 'topology',
    status: baseStatus,
    stats: packageStats,
    capabilities: [
      {
        key: 'contracts',
        icon: 'i-lucide-file-type',
        bulletCount: 3,
        sourcePaths: ['packages/contracts/**'],
      },
      { key: 'core', icon: 'i-lucide-cpu', bulletCount: 3, sourcePaths: ['packages/core/**'] },
      { key: 'apps', icon: 'i-lucide-app-window', bulletCount: 2, sourcePaths: ['apps/**'] },
    ],
    evidence: [
      {
        key: 'packageDirection',
        value: 'packages/contracts -> packages/core -> apps/*',
        sourcePaths: ['wiki/canonical/architecture/package-responsibility-matrix.md'],
      },
      { key: 'sourceOfTruth', value: 'wiki/** and .ai/**', sourcePaths: ['wiki/**', '.ai/**'] },
    ],
    commands: [
      { key: 'archBoundaries', command: 'pnpm arch:boundaries' },
      { key: 'governanceGate', command: 'pnpm governance:gate' },
    ],
  },
  ArchitecturePackageBoundaries: {
    id: 'ArchitecturePackageBoundaries',
    key: 'packageBoundaries',
    status: baseStatus,
    stats: packageStats,
    capabilities: [
      {
        key: 'uiPrimitives',
        icon: 'i-lucide-component',
        bulletCount: 2,
        sourcePaths: ['packages/vue-ui/**'],
      },
      {
        key: 'primevueAdapter',
        icon: 'i-lucide-plug',
        bulletCount: 2,
        sourcePaths: ['packages/vue-primevue-adapter/**'],
      },
      {
        key: 'appLocalCandidates',
        icon: 'i-lucide-map',
        bulletCount: 2,
        sourcePaths: ['wiki/canonical/architecture/app-local-shared-candidates.md'],
      },
    ],
    evidence: [
      {
        key: 'matrix',
        value: 'wiki/canonical/architecture/package-responsibility-matrix.md',
        sourcePaths: ['wiki/canonical/architecture/package-responsibility-matrix.md'],
      },
      {
        key: 'candidateLedger',
        value: 'wiki/canonical/architecture/app-local-shared-candidates.md',
        sourcePaths: ['wiki/canonical/architecture/app-local-shared-candidates.md'],
      },
    ],
    commands: [
      { key: 'apiReport', command: 'pnpm api:report' },
      { key: 'archBoundariesReject', command: 'pnpm arch:boundaries' },
    ],
  },
  ArchitectureRuntimeBoundaries: {
    id: 'ArchitectureRuntimeBoundaries',
    key: 'runtimeBoundaries',
    status: baseStatus,
    stats: [...packageStats, { key: 'runtimeScans', icon: 'i-lucide-radar' }],
    capabilities: [
      {
        key: 'browserBoundary',
        icon: 'i-lucide-globe-2',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/**'],
      },
      {
        key: 'desktopBoundary',
        icon: 'i-lucide-monitor',
        bulletCount: 2,
        sourcePaths: ['apps/desktop/**'],
      },
    ],
    evidence: [
      {
        key: 'runtimePolicy',
        value: '.ai/governance/policies/runtime.json',
        sourcePaths: ['.ai/governance/policies/runtime.json'],
      },
    ],
    commands: [
      { key: 'archRuntime', command: 'pnpm arch:runtime' },
      { key: 'codexPreflight', command: 'pnpm codex:preflight' },
    ],
  },
  ArchitectureGovernance: {
    id: 'ArchitectureGovernance',
    key: 'governance',
    status: [
      { key: 'routeMetadata', severity: 'success' },
      { key: 'i18n', value: 'en-US + zh-CN', severity: 'info' },
      { key: 'ledgerP4', severity: 'warn' },
    ],
    stats: [
      { key: 'targetRoutes', value: '23', icon: 'i-lucide-route' },
      { key: 'legacyExample', value: '0', icon: 'i-lucide-archive-x' },
      { key: 'routeTests', icon: 'i-lucide-list-checks' },
    ],
    capabilities: [
      {
        key: 'rbacMetadata',
        icon: 'i-lucide-badge-check',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/router/modules/**'],
      },
      {
        key: 'wikiPortal',
        icon: 'i-lucide-book-open',
        bulletCount: 2,
        sourcePaths: ['wiki/canonical/**'],
      },
    ],
    evidence: [
      { key: 'wikiValidation', value: 'wiki:refresh -> wiki:validate -> wiki:commands' },
      { key: 'p4Guardrails', value: 'P4' },
    ],
    commands: [
      { key: 'wikiCommands', command: 'pnpm wiki:commands' },
      { key: 'aiDoctorOpen', command: 'pnpm ai:doctor --open' },
    ],
  },
} satisfies Record<string, ConsolePageModel>
