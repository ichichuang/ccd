import type { ConsolePageModel } from './types'
import { baseStatus } from './types'

export const runtimePages = {
  RuntimeHttp: {
    id: 'RuntimeHttp',
    key: 'http',
    status: baseStatus,
    stats: [
      { key: 'runtimeOwner', value: 'apps/web-demo', icon: 'i-lucide-webhook' },
      { key: 'clientAlova', value: 'alova', icon: 'i-lucide-network' },
    ],
    capabilities: [
      {
        key: 'apiBuilders',
        icon: 'i-lucide-file-code',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/api/**'],
      },
      {
        key: 'requestHooks',
        icon: 'i-lucide-refresh-cw',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/hooks/**'],
      },
    ],
    evidence: [
      {
        key: 'httpRuntimePath',
        value: 'apps/web-demo/src/utils/http/**',
        sourcePaths: ['apps/web-demo/src/utils/http/**'],
      },
      { key: 'httpGuardrail', value: 'P4-HttpCore-Blocked' },
    ],
    commands: [{ key: 'archRuntimeLeaks', command: 'pnpm arch:runtime' }],
  },
  RuntimeSafeStorage: {
    id: 'RuntimeSafeStorage',
    key: 'safeStorage',
    status: baseStatus,
    stats: [
      { key: 'runtimeOwner', value: 'apps/web-demo', icon: 'i-lucide-lock-keyhole' },
      { key: 'sharedUtilsBlocked', icon: 'i-lucide-ban' },
    ],
    capabilities: [
      {
        key: 'piniaPersistence',
        icon: 'i-lucide-database-zap',
        bulletCount: 3,
        sourcePaths: ['apps/web-demo/src/stores/**'],
      },
      {
        key: 'firstPaintExceptions',
        icon: 'i-lucide-sun-medium',
        bulletCount: 3,
        sourcePaths: ['apps/web-demo/src/utils/theme/**', 'apps/web-demo/src/locales/**'],
      },
    ],
    evidence: [
      {
        key: 'safeStoragePath',
        value: 'apps/web-demo/src/utils/safeStorage/**',
        sourcePaths: ['apps/web-demo/src/utils/safeStorage/**'],
      },
      { key: 'safeStorageGuardrail', value: 'P4-SafeStorageShared-Blocked' },
    ],
    commands: [{ key: 'aiGuardStorage', command: 'pnpm ai:guard' }],
  },
  RuntimeBrowser: {
    id: 'RuntimeBrowser',
    key: 'browser',
    status: baseStatus,
    stats: [
      { key: 'deviceRuntime', icon: 'i-lucide-smartphone' },
      { key: 'layoutRuntimeSsot', icon: 'i-lucide-layout-panel-top' },
    ],
    capabilities: [
      {
        key: 'themeAndSize',
        icon: 'i-lucide-palette',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/utils/theme/**'],
      },
      {
        key: 'visualReadiness',
        icon: 'i-lucide-camera',
        bulletCount: 3,
        sourcePaths: ['e2e/**'],
      },
    ],
    evidence: [
      {
        key: 'runtimeConstants',
        value: 'apps/web-demo/src/constants/runtime.ts',
        sourcePaths: ['apps/web-demo/src/constants/runtime.ts'],
      },
    ],
    commands: [{ key: 'e2eVisual', command: 'pnpm e2e:visual' }],
  },
  RuntimeState: {
    id: 'RuntimeState',
    key: 'state',
    status: baseStatus,
    stats: [
      { key: 'storeOwners', icon: 'i-lucide-database' },
      { key: 'utilitiesMerged', icon: 'i-lucide-wrench' },
    ],
    capabilities: [
      {
        key: 'storeMatrix',
        icon: 'i-lucide-table-properties',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/stores/**'],
      },
      {
        key: 'utilityPolicy',
        icon: 'i-lucide-shapes',
        bulletCount: 2,
        sourcePaths: ['apps/web-demo/src/utils/**'],
      },
    ],
    evidence: [{ key: 'stateBoundary', value: 'src/api -> hooks -> stores -> views' }],
    commands: [{ key: 'aiGuardBusiness', command: 'pnpm ai:guard' }],
  },
} satisfies Record<string, ConsolePageModel>
