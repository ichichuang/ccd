const exampleRoutes: RouteConfig[] = [
  {
    path: '/example',
    name: 'Example',
    children: [
      // primevue
      {
        path: '/example/primevue',
        name: 'ExamplePrimeVue',
        component: () => import('@/views/example/primevue.vue'),
        meta: {
          title: 'PrimeVue',
          rank: 1,
        },
      },
      {
        path: '/example/primevue-dialog',
        name: 'ExamplePrimeVueDialog',
        component: () => import('@/views/example/primevue-dialog.vue'),
        meta: {
          title: 'PrimeVue Dialog',
          rank: 2,
          parent: 'fullscreen',
        },
      },
      {
        path: '/example/primevue-toast',
        name: 'ExamplePrimeVueToast',
        component: () => import('@/views/example/primevue-toast.vue'),
        meta: {
          title: 'PrimeVue Toast',
          rank: 3,
          parent: 'fullscreen',
        },
      },
    ],
  },
]

export default exampleRoutes
