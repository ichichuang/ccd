const proTableRoute: RouteConfig = {
  path: '/example/primevue-collection/pro-table',
  name: 'ExampleProTable',
  redirect: '/example/primevue-collection/pro-table/basic',
  meta: {
    titleKey: 'router.example.components.primevueCollection.proTable.root',
    rank: 5,
    icon: 'i-lucide-table',
  },
  children: [
    {
      path: '/example/primevue-collection/pro-table/basic',
      name: 'ExampleProTableBasic',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/basic/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.basic',
        rank: 0,
        icon: 'i-lucide-table',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/columns',
      name: 'ExampleProTableColumns',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/columns/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.columns',
        rank: 1,
        icon: 'i-lucide-columns-3',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/server',
      name: 'ExampleProTableServer',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/server/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.server',
        rank: 2,
        icon: 'i-lucide-globe',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/infinite',
      name: 'ExampleProTableInfinite',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/infinite/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.infinite',
        rank: 3,
        icon: 'i-lucide-arrow-down-to-line',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/virtual',
      name: 'ExampleProTableVirtual',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/virtual/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.virtual',
        rank: 4,
        icon: 'i-lucide-gauge',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/advanced',
      name: 'ExampleProTableAdvanced',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/advanced/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.advanced',
        rank: 5,
        icon: 'i-lucide-move-horizontal',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/api-events',
      name: 'ExampleProTableApiEvents',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/api-events/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.apiEvents',
        rank: 6,
        icon: 'i-lucide-webhook',
      },
    },
    {
      path: '/example/primevue-collection/pro-table/form-table-combo',
      name: 'ExampleProTableFormTableCombo',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-table/form-table-combo/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proTable.formTableCombo',
        rank: 8,
        icon: 'i-lucide-layout-grid',
      },
    },
  ],
}

export { proTableRoute }

export default [proTableRoute] satisfies RouteConfig[]
