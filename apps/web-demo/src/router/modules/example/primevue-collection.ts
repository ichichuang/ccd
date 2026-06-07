import { proFormRoute } from './pro-form'

import { proTableRoute } from './pro-table'

const primevueCollectionRoute: RouteConfig = {
  path: '/example/primevue-collection',
  name: 'ExamplePrimevueCollection',
  redirect: '/example/primevue-collection/overview',
  meta: {
    titleKey: 'router.example.components.primevueCollection.root',
    rank: 1,
    icon: 'i-lucide-layers',
  },
  children: [
    {
      path: '/example/primevue-collection/overview',
      name: 'ExamplePrimeVue',
      component: () => import('@/views/example/components/primevue-collection/overview/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.overview',
        rank: 1,
        icon: 'i-lucide-component',
      },
    },
    {
      path: '/example/primevue-collection/toast',
      name: 'ExamplePrimeVueToast',
      component: () => import('@/views/example/components/primevue-collection/toast/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.toast',
        rank: 2,
        icon: 'i-lucide-bell',
      },
    },
    {
      path: '/example/primevue-collection/prime-dialog',
      name: 'ExamplePrimeDialog',
      component: () =>
        import('@/views/example/components/primevue-collection/prime-dialog/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.primeDialog',
        rank: 3,
        icon: 'i-lucide-message-circle',
      },
    },
    proFormRoute,
    proTableRoute,
  ],
}

export { primevueCollectionRoute }

export default [primevueCollectionRoute] satisfies RouteConfig[]
