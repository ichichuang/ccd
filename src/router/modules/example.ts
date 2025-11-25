const exampleRoutes: RouteConfig[] = [
  {
    path: '/example',
    name: 'Example',
    component: () => import('@/views/example/index.vue'),
    meta: {
      titleKey: 'router.example.title',
      rank: 1,
      icon: 'icon-line-md:marker-filled',
    },
    children: [
      {
        path: 'layout',
        name: 'ExampleLayout',
        meta: {
          titleKey: 'router.example.layout.title',
          rank: 3,
          icon: 'icon-line-md:folder-filled',
        },
        children: [
          {
            path: 'screen',
            name: 'ExampleLayoutScreen',
            component: () => import('@/views/example/layout/example-screen.vue'),
            meta: {
              titleKey: 'router.example.layout.screen',
              rank: 1,
              parent: 'screen',
              icon: 'icon-line-md:monitor-screenshot-twotone',
            },
          },
          {
            path: 'fullscreen',
            name: 'ExampleLayoutFullscreen',
            component: () => import('@/views/example/layout/example-fullscreen.vue'),
            meta: {
              titleKey: 'router.example.layout.fullscreen',
              rank: 1,
              parent: 'fullscreen',
              icon: 'icon-line-md:monitor-twotone',
            },
          },
          {
            path: 'test',
            name: 'ExampleLayoutTest',
            component: () => import('@/views/example/layout/example-test.vue'),
            meta: {
              titleKey: 'router.example.layout.test',
              rank: 3,
              parent: 'fullscreen',
              icon: 'icon-line-md:clipboard-check-twotone-to-clipboard-twotone-transition',
            },
          },
          {
            path: 'ratio',
            name: 'ExampleLayoutRatio',
            component: () => import('@/views/example/layout/example-ratio.vue'),
            meta: {
              titleKey: 'router.example.layout.ratio',
              rank: 4,
              parent: 'ratio',
              icon: 'icon-line-md:monitor-twotone',
              ratio: '16:9',
            },
          },
        ],
      },
      {
        path: 'components',
        name: 'ExampleComponents',
        meta: {
          titleKey: 'router.example.components.title',
          rank: 1,
          icon: 'icon-line-md:beer-alt-filled-loop',
        },
        children: [
          {
            path: 'menu',
            name: 'ExampleComponentsMenu',
            component: () => import('@/views/example/views/example-menu.vue'),
            meta: {
              titleKey: 'router.example.components.menu',
              rank: 1,
            },
          },
          {
            path: 'dialog',
            name: 'ExampleComponentsDialog',
            component: () => import('@/views/example/views/example-dialog.vue'),
            meta: {
              titleKey: 'router.example.components.dialog',
              rank: 2,
            },
          },
          {
            path: 'toast',
            name: 'ExampleComponentsToast',
            component: () => import('@/views/example/views/example-toast.vue'),
            meta: {
              titleKey: 'router.example.components.toast',
              rank: 3,
            },
          },
          {
            path: 'schema-form',
            name: 'ExampleComponentsSchemaForm',
            meta: {
              rank: 4,
              titleKey: 'router.example.components.schemaForm.title',
            },
            children: [
              {
                path: 'basic',
                name: 'ExampleComponentsSchemaFormBasic',
                component: () =>
                  import('@/views/example/views/example-shema-form/example-schema-form-basic.vue'),
                meta: {
                  titleKey: 'router.example.components.schemaForm.basic',
                  rank: 1,
                },
              },
              {
                path: 'remember',
                name: 'ExampleComponentsSchemaFormRemember',
                component: () =>
                  import(
                    '@/views/example/views/example-shema-form/example-schema-form-remember.vue'
                  ),
                meta: {
                  titleKey: 'router.example.components.schemaForm.remember',
                  rank: 2,
                },
              },
              {
                path: 'step',
                name: 'ExampleComponentsSchemaFormStep',
                component: () =>
                  import('@/views/example/views/example-shema-form/example-schema-form-step.vue'),
                meta: {
                  titleKey: 'router.example.components.schemaForm.step',
                  rank: 3,
                },
              },
              {
                path: 'section',
                name: 'ExampleComponentsSchemaFormSection',
                component: () =>
                  import(
                    '@/views/example/views/example-shema-form/example-schema-form-section.vue'
                  ),
                meta: {
                  titleKey: 'router.example.components.schemaForm.section',
                  rank: 4,
                },
              },
            ],
          },
          {
            path: 'vxe-table',
            name: 'ExampleComponentsVxeTable',
            meta: {
              titleKey: 'router.example.components.vxetable.title',
              rank: 5,
            },
            children: [
              {
                path: 'default',
                name: 'ExampleComponentsVxeTableDefault',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-default.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.default',
                  rank: 1,
                },
              },
            ],
          },
          {
            path: 'echarts',
            name: 'ExampleComponentsEcharts',
            meta: {
              titleKey: 'router.example.components.echarts.title',
              rank: 6,
            },
            children: [
              {
                path: 'default',
                name: 'ExampleComponentsEchartsDefault',
                component: () =>
                  import('@/views/example/views/example-echarts/example-echarts-default.vue'),
                meta: {
                  titleKey: 'router.example.components.echarts.default',
                  rank: 1,
                  parent: 'screen',
                },
              },
              {
                path: 'static',
                name: 'ExampleComponentsEchartsStatic',
                component: () =>
                  import('@/views/example/views/example-echarts/example-echarts-static.vue'),
                meta: {
                  titleKey: 'router.example.components.echarts.static',
                  rank: 2,
                },
              },
              {
                path: 'event',
                name: 'ExampleComponentsEchartsEvent',
                component: () =>
                  import('@/views/example/views/example-echarts/example-echarts-event.vue'),
                meta: {
                  titleKey: 'router.example.components.echarts.event',
                  rank: 3,
                },
              },
              {
                path: 'dynamic',
                name: 'ExampleComponentsEchartsDynamic',
                component: () =>
                  import('@/views/example/views/example-echarts/example-echarts-dynamic.vue'),
                meta: {
                  titleKey: 'router.example.components.echarts.dynamic',
                  rank: 4,
                  parent: 'fullscreen',
                },
              },
              {
                path: 'linkage',
                name: 'ExampleComponentsEchartsLinkage',
                component: () =>
                  import('@/views/example/views/example-echarts/example-echarts-linkage.vue'),
                meta: {
                  titleKey: 'router.example.components.echarts.linkage',
                  rank: 5,
                },
              },
            ],
          },
          {
            path: 'datepicker',
            name: 'ExampleComponentsDatepicker',
            component: () => import('@/views/example/views/example-datepicker.vue'),
            meta: {
              titleKey: 'router.example.components.datepicker.title',
              rank: 7,
            },
          },
        ],
      },
      {
        path: 'function',
        name: 'ExampleFunction',
        meta: {
          titleKey: 'router.example.function.title',
          icon: 'icon-line-md:calendar',
          rank: 2,
        },
        children: [
          {
            path: 'date',
            name: 'ExampleFunctionDate',
            component: () => import('@/views/example/views/example-date.vue'),
            meta: {
              titleKey: 'router.example.function.date',
              rank: 1,
              icon: 'icon-line-md:calendar',
            },
          },
        ],
      },
    ],
  },
]

export default exampleRoutes
