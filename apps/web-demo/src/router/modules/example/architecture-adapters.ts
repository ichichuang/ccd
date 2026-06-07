const adaptersRootRoute: RouteConfig = {
  path: '/example/adapters',
  name: 'ExampleAdapters',
  redirect: '/example/adapters/http',
  meta: {
    titleKey: 'router.example.architecture.adapters.root',
    rank: 15,
    icon: 'i-lucide-plug',
  },
  children: [
    {
      path: '/example/adapters/http',
      name: 'ExampleAdapterHttp',
      component: () => import('@/views/example/architecture/adapters/http-adapter.vue'),
      meta: {
        titleKey: 'router.example.architecture.adapters.httpAdapter',
        rank: 1,
        icon: 'i-lucide-webhook',
      },
    },
    {
      path: '/example/adapters/echarts',
      name: 'ExampleAdapterEcharts',
      component: () => import('@/views/example/architecture/adapters/echarts-adapter.vue'),
      meta: {
        titleKey: 'router.example.architecture.adapters.echartsAdapter',
        rank: 2,
        icon: 'i-lucide-chart-bar',
      },
    },
  ],
}

export { adaptersRootRoute }

export default [adaptersRootRoute] satisfies RouteConfig[]
