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
        component: () => import('@/views/example/PrimeVue/PrimeVue.vue'),
        meta: {
          title: 'PrimeVue',
          rank: 1,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      {
        path: '/example/primevue-dialog',
        name: 'ExamplePrimeVueDialog',
        component: () => import('@/views/example/PrimeVueDialog/PrimeVueDialog.vue'),
        meta: {
          title: 'PrimeVue Dialog',
          rank: 2,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      {
        path: '/example/primevue-toast',
        name: 'ExamplePrimeVueToast',
        component: () => import('@/views/example/PrimeVueToast/PrimeVueToast.vue'),
        meta: {
          title: 'PrimeVue Toast',
          rank: 3,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      // SchemaForm
      {
        path: '/example/schema-form',
        name: 'ExampleSchemaForm',
        component: () => import('@/views/example/SchemaForm/SchemaForm.vue'),
        meta: {
          title: 'SchemaForm',
          rank: 4,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      // DataTable
      {
        path: '/example/data-table',
        name: 'ExampleDataTable',
        component: () => import('@/views/example/DataTable/DataTable.vue'),
        meta: {
          title: 'DataTable',
          rank: 5,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      // UseEcharts
      {
        path: '/example/use-echarts',
        name: 'ExampleUseEcharts',
        component: () => import('@/views/example/UseEcharts/UseEcharts.vue'),
        meta: {
          title: 'UseEcharts',
          rank: 6,
          icon: 'i-lucide-layout-dashboard',
        },
      },
      // Icons
      {
        path: '/example/icons',
        name: 'ExampleIcons',
        component: () => import('@/views/example/IconsExample/IconsExample.vue'),
        meta: {
          title: 'Icons',
          rank: 7,
          icon: 'i-lucide-layout-dashboard',
          keepAlive: true,
        },
      },
    ],
  },
]

export default exampleRoutes
