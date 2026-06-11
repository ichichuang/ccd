import { defineRouteModule } from '@/router/utils/routeModules'

const consolePage = () => import('@/views/architecture-console/ConsoleDetailPage.vue')

const architectureConsoleRoutes = defineRouteModule<RouteConfig[]>([
  {
    path: '/architecture',
    name: 'ArchitectureConsoleArchitecture',
    redirect: '/architecture/topology',
    meta: {
      titleKey: 'router.console.architecture.root',
      rank: 1,
      icon: 'i-lucide-network',
    },
    children: [
      {
        path: '/architecture/topology',
        name: 'ArchitectureTopology',
        component: consolePage,
        meta: {
          titleKey: 'router.console.architecture.topology',
          rank: 1,
          icon: 'i-lucide-git-fork',
          keepAlive: true,
        },
      },
      {
        path: '/architecture/package-boundaries',
        name: 'ArchitecturePackageBoundaries',
        component: consolePage,
        meta: {
          titleKey: 'router.console.architecture.packageBoundaries',
          rank: 2,
          icon: 'i-lucide-boxes',
        },
      },
      {
        path: '/architecture/runtime-boundaries',
        name: 'ArchitectureRuntimeBoundaries',
        component: consolePage,
        meta: {
          titleKey: 'router.console.architecture.runtimeBoundaries',
          rank: 3,
          icon: 'i-lucide-shield-check',
        },
      },
      {
        path: '/architecture/app-owned-runtime',
        name: 'ArchitectureAppOwnedRuntime',
        component: consolePage,
        meta: {
          titleKey: 'router.console.architecture.appOwnedRuntime',
          rank: 4,
          icon: 'i-lucide-app-window',
        },
      },
      {
        path: '/architecture/strategic-guardrails',
        name: 'ArchitectureStrategicGuardrails',
        component: consolePage,
        meta: {
          titleKey: 'router.console.architecture.strategicGuardrails',
          rank: 5,
          icon: 'i-lucide-traffic-cone',
        },
      },
    ],
  },
  {
    path: '/runtime',
    name: 'ArchitectureConsoleRuntime',
    redirect: '/runtime/web-runtime',
    meta: {
      titleKey: 'router.console.runtime.root',
      rank: 2,
      icon: 'i-lucide-cpu',
    },
    children: [
      {
        path: '/runtime/web-runtime',
        name: 'RuntimeWebRuntime',
        component: consolePage,
        meta: {
          titleKey: 'router.console.runtime.webRuntime',
          rank: 1,
          icon: 'i-lucide-monitor',
        },
      },
      {
        path: '/runtime/http-alova',
        name: 'RuntimeHttpAlova',
        component: consolePage,
        meta: {
          titleKey: 'router.console.runtime.httpAlova',
          rank: 2,
          icon: 'i-lucide-webhook',
          keepAlive: true,
        },
      },
      {
        path: '/runtime/safe-storage',
        name: 'RuntimeSafeStorage',
        component: consolePage,
        meta: {
          titleKey: 'router.console.runtime.safeStorage',
          rank: 3,
          icon: 'i-lucide-lock-keyhole',
          keepAlive: true,
        },
      },
      {
        path: '/runtime/i18n-theme-device',
        name: 'RuntimeI18nThemeDevice',
        component: consolePage,
        meta: {
          titleKey: 'router.console.runtime.i18nThemeDevice',
          rank: 4,
          icon: 'i-lucide-languages',
        },
      },
      {
        path: '/runtime/validation',
        name: 'RuntimeValidation',
        component: consolePage,
        meta: {
          titleKey: 'router.console.runtime.validation',
          rank: 5,
          icon: 'i-lucide-clipboard-check',
        },
      },
    ],
  },
  {
    path: '/ui',
    name: 'ArchitectureConsoleUi',
    redirect: '/ui/primevue-adapter',
    meta: {
      titleKey: 'router.console.ui.root',
      rank: 3,
      icon: 'i-lucide-component',
    },
    children: [
      {
        path: '/ui/primevue-adapter',
        name: 'UiPrimeVueAdapter',
        component: consolePage,
        meta: {
          titleKey: 'router.console.ui.primevueAdapter',
          rank: 1,
          icon: 'i-lucide-plug',
        },
      },
      {
        path: '/ui/proform-patterns',
        name: 'UiProFormPatterns',
        component: consolePage,
        meta: {
          titleKey: 'router.console.ui.proFormPatterns',
          rank: 2,
          icon: 'i-lucide-form-input',
          keepAlive: true,
        },
      },
      {
        path: '/ui/protable-patterns',
        name: 'UiProTablePatterns',
        component: consolePage,
        meta: {
          titleKey: 'router.console.ui.proTablePatterns',
          rank: 3,
          icon: 'i-lucide-table-2',
          keepAlive: true,
        },
      },
      {
        path: '/ui/charts',
        name: 'UiCharts',
        component: consolePage,
        meta: {
          titleKey: 'router.console.ui.charts',
          rank: 4,
          icon: 'i-lucide-chart-no-axes-combined',
        },
      },
      {
        path: '/ui/dialog-toast',
        name: 'UiDialogToast',
        component: consolePage,
        meta: {
          titleKey: 'router.console.ui.dialogToast',
          rank: 5,
          icon: 'i-lucide-message-circle',
        },
      },
      {
        path: '/ui/empty-state',
        name: 'UiEmptyState',
        component: consolePage,
        meta: {
          titleKey: 'router.console.ui.emptyState',
          rank: 6,
          icon: 'i-lucide-circle-dashed',
        },
      },
      {
        path: '/ui/route-evidence',
        name: 'UiRouteEvidence',
        component: consolePage,
        meta: {
          titleKey: 'router.console.ui.routeEvidence',
          rank: 7,
          icon: 'i-lucide-route',
        },
      },
    ],
  },
  {
    path: '/system',
    name: 'ArchitectureConsoleSystem',
    redirect: '/system/theme-size',
    meta: {
      titleKey: 'router.console.system.root',
      rank: 4,
      icon: 'i-lucide-settings-2',
    },
    children: [
      {
        path: '/system/theme-size',
        name: 'SystemThemeSize',
        component: consolePage,
        meta: {
          titleKey: 'router.console.system.themeSize',
          rank: 1,
          icon: 'i-lucide-palette',
          parent: 'fullscreen',
          reuseWindow: true,
        },
      },
      {
        path: '/system/breakpoints',
        name: 'SystemBreakpoints',
        component: consolePage,
        meta: {
          titleKey: 'router.console.system.breakpoints',
          rank: 2,
          icon: 'i-lucide-monitor-smartphone',
          parent: 'fullscreen',
          reuseWindow: true,
        },
      },
      {
        path: '/system/unocss',
        name: 'SystemUnoCss',
        component: consolePage,
        meta: {
          titleKey: 'router.console.system.unocss',
          rank: 3,
          icon: 'i-lucide-diamond',
          parent: 'fullscreen',
          reuseWindow: true,
        },
      },
      {
        path: '/system/layout-controls',
        name: 'SystemLayoutControls',
        component: consolePage,
        meta: {
          titleKey: 'router.console.system.layoutControls',
          rank: 4,
          icon: 'i-lucide-layout-panel-top',
          parent: 'fullscreen',
          reuseWindow: true,
        },
      },
      {
        path: '/system/store-router-permission',
        name: 'SystemStoreRouterPermission',
        component: consolePage,
        meta: {
          titleKey: 'router.console.system.storeRouterPermission',
          rank: 5,
          icon: 'i-lucide-shield',
        },
      },
    ],
  },
  {
    path: '/desktop',
    name: 'ArchitectureConsoleDesktop',
    redirect: '/desktop/boundary',
    meta: {
      titleKey: 'router.console.desktop.root',
      rank: 5,
      icon: 'i-lucide-monitor-cog',
    },
    children: [
      {
        path: '/desktop/boundary',
        name: 'DesktopBoundary',
        component: consolePage,
        meta: {
          titleKey: 'router.console.desktop.boundary',
          rank: 1,
          icon: 'i-lucide-between-horizontal-start',
        },
      },
      {
        path: '/desktop/tauri-mirror',
        name: 'DesktopTauriMirror',
        component: consolePage,
        meta: {
          titleKey: 'router.console.desktop.tauriMirror',
          rank: 2,
          icon: 'i-lucide-shield-ellipsis',
        },
      },
    ],
  },
])

export default architectureConsoleRoutes
