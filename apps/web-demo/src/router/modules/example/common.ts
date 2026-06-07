const commonRootRoute: RouteConfig = {
  path: '/example/common',
  name: 'ExampleCommon',
  redirect: '/example/common/constants',
  meta: {
    titleKey: 'router.example.common.root',
    rank: 5,
    icon: 'i-lucide-list',
  },
  children: [
    {
      path: '/example/common/constants',
      name: 'ExampleCommonConstants',
      component: () => import('@/views/example/common/constants.vue'),
      meta: { titleKey: 'router.example.common.constants', rank: 1, icon: 'i-lucide-book' },
    },
    {
      path: '/example/common/enums',
      name: 'ExampleCommonEnums',
      component: () => import('@/views/example/common/enums.vue'),
      meta: { titleKey: 'router.example.common.enums', rank: 2, icon: 'i-lucide-list-checks' },
    },
    {
      path: '/example/common/types',
      name: 'ExampleCommonTypes',
      component: () => import('@/views/example/common/types.vue'),
      meta: { titleKey: 'router.example.common.types', rank: 3, icon: 'i-lucide-shapes' },
    },
  ],
}

export default [commonRootRoute] satisfies RouteConfig[]
