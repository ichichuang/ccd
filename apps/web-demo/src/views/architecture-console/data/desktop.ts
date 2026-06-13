import type { ConsolePageModel } from './types'

export const desktopPages = {
  DesktopBoundary: {
    id: 'DesktopBoundary',
    key: 'desktopBoundary',
    status: [
      { key: 'desktopUntouched', severity: 'success' },
      { key: 'tauriAdapterOnly', severity: 'info' },
      { key: 'p4BackendDeferred', severity: 'warn' },
    ],
    stats: [
      { key: 'desktopAdapterPath', value: 'apps/desktop', icon: 'i-lucide-monitor' },
      { key: 'updaterDeepLink', icon: 'i-lucide-lock' },
    ],
    capabilities: [
      {
        key: 'tauriBoundary',
        icon: 'i-lucide-terminal',
        bulletCount: 2,
        sourcePaths: ['apps/desktop/src/adapters/**', 'apps/desktop/src-tauri/**'],
      },
      {
        key: 'strategicGuardrails',
        icon: 'i-lucide-signpost',
        bulletCount: 2,
        sourcePaths: ['wiki/canonical/governance/strategic-guardrails.md'],
      },
    ],
    evidence: [
      {
        key: 'desktopWiki',
        value: 'wiki/canonical/application-boundaries/desktop-role.md',
        sourcePaths: ['wiki/canonical/application-boundaries/desktop-role.md'],
      },
    ],
    commands: [
      { key: 'syncDesktopConfig', command: 'pnpm sync:desktop-config' },
      { key: 'checkDrift', command: 'pnpm check:drift' },
    ],
  },
} satisfies Record<string, ConsolePageModel>
