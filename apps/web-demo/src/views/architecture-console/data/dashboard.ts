import type { DashboardCard, DashboardEvidence } from './types'

export const dashboardStatusCards: DashboardCard[] = [
  {
    key: 'packageBoundary',
    valueKey: 'clean',
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
    valueKey: 'governed',
    icon: 'i-lucide-list-checks',
    severity: 'success',
  },
  {
    key: 'p4Guardrails',
    valueKey: 'visible',
    icon: 'i-lucide-signpost',
    severity: 'warn',
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
    key: 'strategicGuardrails',
    path: 'wiki/canonical/governance/strategic-guardrails.md',
    icon: 'i-lucide-ban',
  },
]

export const dashboardValidationCommands = [
  'pnpm wiki:refresh',
  'pnpm arch:runtime',
  'pnpm arch:boundaries',
  'pnpm build:web-demo',
  'pnpm governance:gate',
]
