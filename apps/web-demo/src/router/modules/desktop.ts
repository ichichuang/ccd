import { defineRouteModule } from '@/router/utils/routeModules'

const desktopRoute: RouteConfig = {
  path: '/desktop',
  name: 'DesktopBoundary',
  component: () => import('@/views/architecture-console/ConsolePage.vue'),
  meta: {
    titleKey: 'router.console.desktop.root',
    icon: 'i-lucide-monitor',
    rank: 50,
  },
}

export default defineRouteModule(desktopRoute)
