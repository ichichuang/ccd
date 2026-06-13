import type { ConsolePageModel } from './types'
import { baseStatus } from './types'

export const systemPages = {
  SystemTheme: {
    id: 'SystemTheme',
    key: 'theme',
    status: baseStatus,
    stats: [
      { key: 'semanticTokens', icon: 'i-lucide-palette' },
      { key: 'contrastValidated', icon: 'i-lucide-contrast' },
    ],
    capabilities: [
      {
        key: 'tokenFirstUi',
        icon: 'i-lucide-paintbrush-2',
        bulletCount: 2,
        sourcePaths: ['packages/design-tokens/**'],
      },
    ],
    evidence: [
      {
        key: 'designTokens',
        value: 'packages/design-tokens/**',
        sourcePaths: ['packages/design-tokens/**'],
      },
    ],
    commands: [{ key: 'validateTokens', command: 'pnpm validate:tokens' }],
  },
  SystemSizeBreakpoints: {
    id: 'SystemSizeBreakpoints',
    key: 'sizeBreakpoints',
    status: baseStatus,
    stats: [
      { key: 'densityModes', icon: 'i-lucide-maximize' },
      { key: 'breakpointRuntime', icon: 'i-lucide-monitor-smartphone' },
    ],
    capabilities: [
      {
        key: 'adaptiveSizing',
        icon: 'i-lucide-ruler',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/utils/theme/sizeEngine.ts'],
      },
    ],
    evidence: [
      {
        key: 'sizeRuntime',
        value: 'apps/web-demo/src/utils/theme/sizeEngine.ts',
        sourcePaths: ['apps/web-demo/src/utils/theme/sizeEngine.ts'],
      },
    ],
    commands: [{ key: 'checkFast', command: 'pnpm check' }],
  },
  SystemLayout: {
    id: 'SystemLayout',
    key: 'layout',
    status: baseStatus,
    stats: [
      { key: 'runtimeSsot', icon: 'i-lucide-layout-dashboard' },
      { key: 'shellPreserved', icon: 'i-lucide-panel-top' },
    ],
    capabilities: [
      {
        key: 'adminShell',
        icon: 'i-lucide-panels-top-left',
        bulletCount: 3,
        sourcePaths: ['apps/web-demo/src/layouts/**'],
      },
    ],
    evidence: [
      {
        key: 'layoutRuntimePath',
        value: 'apps/web-demo/src/layouts/runtime/layoutRuntime.ts',
        sourcePaths: ['apps/web-demo/src/layouts/runtime/layoutRuntime.ts'],
      },
    ],
    commands: [{ key: 'e2eLayout', command: 'pnpm e2e:layout' }],
  },
  SystemUnocss: {
    id: 'SystemUnocss',
    key: 'unocss',
    status: baseStatus,
    stats: [
      { key: 'closedShortcuts', icon: 'i-lucide-list-check' },
      { key: 'rawStylesGuarded', icon: 'i-lucide-shield' },
    ],
    capabilities: [
      {
        key: 'semanticComposition',
        icon: 'i-lucide-blocks',
        bulletCount: 2,
        sourcePaths: ['packages/unocss-preset/src/shortcuts/semanticShortcuts.ts'],
      },
    ],
    evidence: [
      {
        key: 'unocssPreset',
        value: 'packages/unocss-preset/src/shortcuts/semanticShortcuts.ts',
        sourcePaths: ['packages/unocss-preset/src/shortcuts/semanticShortcuts.ts'],
      },
    ],
    commands: [{ key: 'unocssTokenSmoke', command: 'pnpm ci:smoke:unocss-tokens' }],
  },
} satisfies Record<string, ConsolePageModel>
