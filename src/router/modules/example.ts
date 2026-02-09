const exampleRoutes: RouteConfig[] = [
  {
    path: '/example',
    name: 'Example',
    meta: {
      title: '示例',
      rank: 2,
      icon: 'i-lucide-layout-dashboard',
    },
    children: [
      {
        path: '/example/primevue',
        name: 'ExamplePrimeVue',
        component: () => import('@/views/example/primevue.vue'),
        meta: {
          title: 'PrimeVue',
          rank: 1,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      {
        path: '/example/primevue-dialog',
        name: 'ExamplePrimeVueDialog',
        component: () => import('@/views/example/primevue-dialog.vue'),
        meta: {
          title: 'PrimeVue Dialog',
          rank: 2,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      {
        path: '/example/primevue-toast',
        name: 'ExamplePrimeVueToast',
        component: () => import('@/views/example/primevue-toast.vue'),
        meta: {
          title: 'PrimeVue Toast',
          rank: 3,
          icon: 'i-lucide-layout-dashboard',
        },
      },
    ],
  },
]

export default exampleRoutes
