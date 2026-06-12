import { defineRouteModule } from '@/router/utils/routeModules'

const consolePage = () => import('@/views/architecture-console/ConsolePage.vue')

const runtimeRoute: RouteConfig = {
  path: '/runtime',
  name: 'RuntimeRoot',
  redirect: '/runtime/http',
  meta: {
    titleKey: 'router.console.runtime.root',
    icon: 'i-lucide-cpu',
    rank: 20,
  },
  children: [
    {
      path: '/runtime/http',
      name: 'RuntimeHttp',
      component: consolePage,
      meta: {
        titleKey: 'router.console.runtime.http',
        icon: 'i-lucide-webhook',
        rank: 1,
      },
    },
    {
      path: '/runtime/safe-storage',
      name: 'RuntimeSafeStorage',
      component: consolePage,
      meta: {
        titleKey: 'router.console.runtime.safeStorage',
        icon: 'i-lucide-lock-keyhole',
        rank: 2,
      },
    },
    {
      path: '/runtime/browser-runtime',
      name: 'RuntimeBrowser',
      component: consolePage,
      meta: {
        titleKey: 'router.console.runtime.browser',
        icon: 'i-lucide-globe-2',
        rank: 3,
      },
    },
    {
      path: '/runtime/state',
      name: 'RuntimeState',
      component: consolePage,
      meta: {
        titleKey: 'router.console.runtime.state',
        icon: 'i-lucide-database',
        rank: 4,
      },
    },
  ],
}

export default defineRouteModule(runtimeRoute)
