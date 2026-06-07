const utilsRootRoute: RouteConfig = {
  path: '/example/utils',
  name: 'ExampleUtils',
  redirect: '/example/utils/safe-storage',
  meta: {
    titleKey: 'router.example.utils.root',
    rank: 4,
    icon: 'i-lucide-wrench',
  },
  children: [
    {
      path: '/example/utils/safe-storage',
      name: 'ExampleUtilSafeStorage',
      component: () => import('@/views/example/utils/safe-storage.vue'),
      meta: { titleKey: 'router.example.utils.safeStorage', rank: 0, icon: 'i-lucide-lock' },
    },
    {
      path: '/example/utils/http-advanced',
      name: 'ExampleUtilHttpAdvanced',
      component: () => import('@/views/example/utils/http-advanced.vue'),
      meta: { titleKey: 'router.example.utils.httpAdvanced', rank: 1, icon: 'i-lucide-radar' },
    },
    {
      path: '/example/utils/lodash',
      name: 'ExampleUtilLodash',
      component: () => import('@/views/example/utils/lodash.vue'),
      meta: { titleKey: 'router.example.utils.lodash', rank: 2, icon: 'i-lucide-braces' },
    },
    {
      path: '/example/utils/device-sync',
      name: 'ExampleUtilDeviceSync',
      component: () => import('@/views/example/utils/device-sync.vue'),
      meta: { titleKey: 'router.example.utils.deviceSync', rank: 3, icon: 'i-lucide-smartphone' },
    },
    {
      path: '/example/utils/strings-format',
      name: 'ExampleUtilStringsFormat',
      component: () => import('@/views/example/utils/strings-format.vue'),
      meta: { titleKey: 'router.example.utils.stringsFormat', rank: 4, icon: 'i-lucide-text' },
    },
    {
      path: '/example/utils/type-casters',
      name: 'ExampleUtilTypeCasters',
      component: () => import('@/views/example/utils/type-casters.vue'),
      meta: { titleKey: 'router.example.utils.typeCasters', rank: 5, icon: 'i-lucide-shapes' },
    },
    {
      path: '/example/utils/ids',
      name: 'ExampleUtilIds',
      component: () => import('@/views/example/utils/ids.vue'),
      meta: { titleKey: 'router.example.utils.ids', rank: 6, icon: 'i-lucide-hash' },
    },
    {
      path: '/example/utils/color-utils',
      name: 'ExampleUtilColorUtils',
      component: () => import('@/views/example/utils/color-utils.vue'),
      meta: { titleKey: 'router.example.utils.colorUtils', rank: 7, icon: 'i-lucide-palette' },
    },
  ],
}

export default [utilsRootRoute] satisfies RouteConfig[]
