import { defineRouteModule } from '@/router/utils/routeModules'

const globalSettingsPage = () => import('@/views/system/settings/index.vue')

const systemRoute: RouteConfig = {
  path: '/system/settings',
  name: 'SystemGlobalSettings',
  component: globalSettingsPage,
  meta: {
    titleKey: 'router.system.settings',
    icon: 'i-lucide-sliders-horizontal',
    rank: 40,
  },
}

export default defineRouteModule(systemRoute)
