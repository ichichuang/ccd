import { defineRouteModule } from '@/router/utils/routeModules'

const consolePage = () => import('@/views/architecture-console/ConsolePage.vue')

const uiRoute: RouteConfig = {
  path: '/ui',
  name: 'UiRoot',
  redirect: '/ui/primevue-adapter',
  meta: {
    titleKey: 'router.console.ui.root',
    icon: 'i-lucide-component',
    rank: 30,
  },
  children: [
    {
      path: '/ui/primevue-adapter',
      name: 'UiPrimeVueAdapter',
      component: consolePage,
      meta: {
        titleKey: 'router.console.ui.primevueAdapter',
        icon: 'i-lucide-plug',
        rank: 1,
      },
    },
    {
      path: '/ui/pro-form',
      name: 'UiProForm',
      component: consolePage,
      meta: {
        titleKey: 'router.console.ui.proForm',
        icon: 'i-lucide-form-input',
        rank: 2,
      },
    },
    {
      path: '/ui/pro-table',
      name: 'UiProTable',
      component: consolePage,
      meta: {
        titleKey: 'router.console.ui.proTable',
        icon: 'i-lucide-table',
        rank: 3,
      },
    },
    {
      path: '/ui/charts',
      name: 'UiCharts',
      component: consolePage,
      meta: {
        titleKey: 'router.console.ui.charts',
        icon: 'i-lucide-chart-no-axes-combined',
        rank: 4,
      },
    },
    {
      path: '/ui/feedback',
      name: 'UiFeedback',
      component: consolePage,
      meta: {
        titleKey: 'router.console.ui.feedback',
        icon: 'i-lucide-message-circle',
        rank: 5,
      },
    },
  ],
}

export default defineRouteModule(uiRoute)
