const storesRootRoute: RouteConfig = {
  path: '/example/stores',
  name: 'ExampleStores',
  redirect: '/example/stores/locale',
  meta: {
    titleKey: 'router.example.architecture.stores.root',
    rank: 17,
    icon: 'i-lucide-database',
  },
  children: [
    {
      path: '/example/stores/locale',
      name: 'ExampleStoreLocale',
      component: () => import('@/views/example/architecture/stores/locale.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.locale',
        rank: 1,
        icon: 'i-lucide-globe',
      },
    },
    {
      path: '/example/stores/theme',
      name: 'ExampleStoreTheme',
      component: () => import('@/views/example/architecture/stores/theme.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.theme',
        rank: 2,
        icon: 'i-lucide-palette',
      },
    },
    {
      path: '/example/stores/table-drawer',
      name: 'ExampleStoreTableDrawer',
      component: () => import('@/views/example/architecture/stores/table-drawer.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.tableDrawer',
        rank: 3,
        icon: 'i-lucide-panel-right',
      },
    },
    {
      path: '/example/stores/layout',
      name: 'ExampleStoreLayout',
      component: () => import('@/views/example/architecture/stores/layout.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.layout',
        rank: 4,
        icon: 'i-lucide-layout-dashboard',
      },
    },
    {
      path: '/example/stores/user',
      name: 'ExampleStoreUser',
      component: () => import('@/views/example/architecture/stores/user.vue'),
      meta: { titleKey: 'router.example.architecture.stores.user', rank: 5, icon: 'i-lucide-user' },
    },
    {
      path: '/example/stores/size',
      name: 'ExampleStoreSize',
      component: () => import('@/views/example/architecture/stores/size.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.size',
        rank: 6,
        icon: 'i-lucide-maximize',
      },
    },
    {
      path: '/example/stores/device',
      name: 'ExampleStoreDevice',
      component: () => import('@/views/example/architecture/stores/device.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.device',
        rank: 7,
        icon: 'i-lucide-smartphone',
      },
    },
    {
      path: '/example/stores/permission',
      name: 'ExampleStorePermission',
      component: () => import('@/views/example/architecture/stores/permission.vue'),
      meta: {
        titleKey: 'router.example.architecture.stores.permission',
        rank: 8,
        icon: 'i-lucide-shield',
      },
    },
  ],
}

export { storesRootRoute }

export default [storesRootRoute] satisfies RouteConfig[]
