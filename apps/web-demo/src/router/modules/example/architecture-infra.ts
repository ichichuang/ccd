const infraRootRoute: RouteConfig = {
  path: '/example/infra',
  name: 'ExampleInfra',
  redirect: '/example/infra/route-provider',
  meta: {
    titleKey: 'router.example.architecture.infra.root',
    rank: 16,
    icon: 'i-lucide-network',
  },
  children: [
    {
      path: '/example/infra/route-provider',
      name: 'ExampleInfraRouteProvider',
      component: () => import('@/views/example/architecture/infra/route-provider.vue'),
      meta: {
        titleKey: 'router.example.architecture.infra.routeProvider',
        rank: 1,
        icon: 'i-lucide-route',
      },
    },
    {
      path: '/example/infra/token-provider',
      name: 'ExampleInfraTokenProvider',
      component: () => import('@/views/example/architecture/infra/token-provider.vue'),
      meta: {
        titleKey: 'router.example.architecture.infra.tokenProvider',
        rank: 2,
        icon: 'i-lucide-key-round',
      },
    },
  ],
}

export { infraRootRoute }

export default [infraRootRoute] satisfies RouteConfig[]
