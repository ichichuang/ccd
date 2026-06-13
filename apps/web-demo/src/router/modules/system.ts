import { defineRouteModule } from '@/router/utils/routeModules'

const consolePage = () => import('@/views/architecture-console/ConsolePage.vue')
const globalSettingsPage = () => import('@/views/system/settings/index.vue')

const systemRoute: RouteConfig = {
  path: '/system',
  name: 'SystemRoot',
  redirect: '/system/theme',
  meta: {
    titleKey: 'router.console.system.root',
    icon: 'i-lucide-settings',
    rank: 40,
  },
  children: [
    {
      path: '/system/theme',
      name: 'SystemTheme',
      component: consolePage,
      meta: {
        titleKey: 'router.console.system.theme',
        icon: 'i-lucide-palette',
        rank: 1,
      },
    },
    {
      path: '/system/size-breakpoints',
      name: 'SystemSizeBreakpoints',
      component: consolePage,
      meta: {
        titleKey: 'router.console.system.sizeBreakpoints',
        icon: 'i-lucide-monitor-smartphone',
        rank: 2,
      },
    },
    {
      path: '/system/layout',
      name: 'SystemLayout',
      component: consolePage,
      meta: {
        titleKey: 'router.console.system.layout',
        icon: 'i-lucide-layout-dashboard',
        rank: 3,
      },
    },
    {
      path: '/system/unocss',
      name: 'SystemUnocss',
      component: consolePage,
      meta: {
        titleKey: 'router.console.system.unocss',
        icon: 'i-lucide-diamond',
        rank: 4,
      },
    },
    {
      path: '/system/settings',
      name: 'SystemGlobalSettings',
      component: globalSettingsPage,
      meta: {
        titleKey: 'router.console.system.globalSettings',
        icon: 'i-lucide-sliders-horizontal',
        rank: 5,
      },
    },
  ],
}

export default defineRouteModule(systemRoute)
