import { chartsRoute } from './charts'

import { primevueCollectionRoute } from './primevue-collection'

// Unified V2.3 Example Routes

const componentsRootRoute: RouteConfig = {
  path: '/example/components',
  name: 'ExampleComponents',
  redirect: '/example/charts',
  meta: {
    titleKey: 'router.example.components.root',
    rank: 2,
    icon: 'i-lucide-layers',
  },
  children: [
    primevueCollectionRoute,
    chartsRoute,
    {
      path: '/example/components/icons',
      name: 'ExampleIcons',
      component: () => import('@/views/example/components/icons/index.vue'),
      meta: {
        titleKey: 'router.example.components.icons',
        rank: 3,
        icon: 'i-lucide-brush',
        keepAlive: true,
      },
    },
    {
      path: '/example/components/c-scrollbar',
      name: 'ExampleComponentsCScrollbar',
      component: () => import('@/views/example/components/c-scrollbar/index.vue'),
      meta: {
        titleKey: 'router.example.components.cScrollbar',
        rank: 4,
        icon: 'i-lucide-scroll-text',
      },
    },
    {
      path: '/example/components/empty-state',
      name: 'ExampleComponentsEmptyState',
      component: () => import('@/views/example/components/empty-state/index.vue'),
      meta: {
        titleKey: 'router.example.components.emptyState',
        rank: 5,
        icon: 'i-lucide-circle-dashed',
      },
    },
    {
      path: '/example/components/animate-wrapper',
      name: 'ExampleComponentsAnimateWrapper',
      component: () => import('@/views/example/components/animate-wrapper/index.vue'),
      meta: {
        titleKey: 'router.example.components.animateWrapper',
        rank: 6,
        icon: 'i-lucide-sparkles',
      },
    },
  ],
}

export default [componentsRootRoute] satisfies RouteConfig[]
