const exampleRoutes: RouteConfig[] = [
  {
    path: '/example',
    name: 'Example',
    component: () => import('@/views/example/index.vue'),
    meta: {
      titleKey: 'router.example.title',
      rank: 1,
      icon: 'fc-bookmark',
    },
    children: [
      {
        path: 'components',
        name: 'ExampleComponents',
        meta: {
          titleKey: 'router.example.components.title',
          rank: 1,
          icon: 'fc-approval',
        },
        children: [
          {
            path: 'menu',
            name: 'ExampleComponentsMenu',
            component: () => import('@/views/example/views/example-menu.vue'),
            meta: {
              titleKey: 'router.example.components.menu',
              rank: 1,
              icon: 'fc-menu',
            },
          },
          {
            path: 'dialog',
            name: 'ExampleComponentsDialog',
            component: () => import('@/views/example/views/example-dialog.vue'),
            meta: {
              titleKey: 'router.example.components.dialog',
              rank: 2,
              icon: 'fc-display',
            },
          },
          {
            path: 'toast',
            name: 'ExampleComponentsToast',
            component: () => import('@/views/example/views/example-toast.vue'),
            meta: {
              titleKey: 'router.example.components.toast',
              rank: 3,
              icon: 'fc-info',
            },
          },
          {
            path: 'message',
            name: 'ExampleComponentsMessage',
            component: () => import('@/views/example/views/example-message.vue'),
            meta: {
              titleKey: 'router.example.components.message',
              rank: 4,
              icon: 'fc-info',
            },
          },
          {
            path: 'schema-form',
            name: 'ExampleComponentsSchemaForm',
            meta: {
              rank: 5,
              titleKey: 'router.example.components.schemaForm.title',
              icon: 'fc-edit-image',
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
                  icon: 'fc-edit-image',
                },
              },
              {
                path: 'remember',
                name: 'ExampleComponentsSchemaFormRemember',
                component: () =>
                  import('@/views/example/views/example-shema-form/example-schema-form-remember.vue'),
                meta: {
                  titleKey: 'router.example.components.schemaForm.remember',
                  rank: 2,
                  icon: 'fc-bookmark',
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
                  icon: 'fc-stack-of-photos',
                },
              },
              {
                path: 'section',
                name: 'ExampleComponentsSchemaFormSection',
                component: () =>
                  import('@/views/example/views/example-shema-form/example-schema-form-section.vue'),
                meta: {
                  titleKey: 'router.example.components.schemaForm.section',
                  rank: 4,
                  icon: 'fc-list',
                },
              },
            ],
          },
          {
            path: 'vxe-table',
            name: 'ExampleComponentsVxeTable',
            meta: {
              titleKey: 'router.example.components.vxetable.title',
              rank: 6,
              icon: 'fc-list',
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
                  icon: 'fc-list',
                },
              },
            ],
          },
          {
            path: 'echarts',
            name: 'ExampleComponentsEcharts',
            meta: {
              titleKey: 'router.example.components.echarts.title',
              rank: 7,
              icon: 'fc-bar-chart',
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
                  parent: 'fullscreen',
                  icon: 'fc-bar-chart',
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
                  icon: 'fc-line-chart',
                  parent: 'fullscreen',
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
                  icon: 'fc-approval',
                  parent: 'fullscreen',
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
                  icon: 'fc-refresh',
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
                  icon: 'fc-link',
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
              rank: 8,
              icon: 'fc-calendar',
            },
          },
        ],
      },
      {
        path: 'function',
        name: 'ExampleFunction',
        meta: {
          titleKey: 'router.example.function.title',
          icon: 'fc-calendar',
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
              icon: 'fc-calendar',
            },
          },
          // afeStorage
          {
            path: 'safeStorage',
            name: 'ExampleSafeStorage',
            meta: {
              titleKey: 'router.example.safeStorage.title',
              rank: 2,
              icon: 'fc-alarm-clock',
            },
            children: [
              {
                path: 'safe-storage',
                name: 'ExampleSafeStorageSafeStorage',
                component: () =>
                  import('@/views/example/views/example-safe-storage/example-safe-storage.vue'),
                meta: {
                  titleKey: 'router.example.safeStorage.title',
                  rank: 1,
                  icon: 'fc-alarm-clock',
                },
              },
              {
                path: 'crypto',
                name: 'ExampleSafeStorageCrypto',
                component: () =>
                  import('@/views/example/views/example-safe-storage/example-safe-storage-crypto.vue'),
                meta: {
                  titleKey: 'router.example.safeStorage.crypto',
                  rank: 1,
                  icon: 'fc-bookmark',
                },
              },
              {
                path: 'lzstring',
                name: 'ExampleSafeStorageLzstring',
                component: () =>
                  import('@/views/example/views/example-safe-storage/example-safe-storage-lzstring.vue'),
                meta: {
                  titleKey: 'router.example.safeStorage.lzstring',
                  rank: 2,
                  icon: 'fc-bookmark',
                },
              },
            ],
          },
        ],
      },
      {
        path: 'http',
        name: 'ExampleHttp',
        meta: {
          titleKey: 'router.example.http.title',
          icon: 'fc-mind-map',
          rank: 3,
        },
        children: [
          {
            path: 'basic',
            name: 'ExampleHttpBasic',
            component: () => import('@/views/example/views/example-http/example-http-basic.vue'),
            meta: {
              titleKey: 'router.example.http.basic',
              rank: 1,
              icon: 'fc-mind-map',
            },
          },
        ],
      },
      {
        path: 'layout',
        name: 'ExampleLayout',
        meta: {
          titleKey: 'router.example.layout.title',
          rank: 4,
          icon: 'fc-folder',
        },
        children: [
          {
            path: 'fullscreen',
            name: 'ExampleLayoutFullscreen',
            component: () => import('@/views/example/layout/example-fullscreen.vue'),
            meta: {
              titleKey: 'router.example.layout.fullscreen',
              rank: 1,
              parent: 'fullscreen',
              icon: 'fc-display',
            },
          },
          {
            path: 'test',
            name: 'ExampleLayoutTest',
            component: () => import('@/views/example/layout/example-test.vue'),
            meta: {
              titleKey: 'router.example.layout.test',
              rank: 2,
              parent: 'fullscreen',
              icon: 'fc-approval',
            },
          },
          {
            path: 'ratio',
            name: 'ExampleLayoutRatio',
            component: () => import('@/views/example/layout/example-ratio.vue'),
            meta: {
              titleKey: 'router.example.layout.ratio',
              rank: 3,
              parent: 'ratio',
              icon: 'fc-display',
              ratio: '16:9',
            },
          },
        ],
      },
      // 重定向空页面
      {
        path: 'error',
        name: 'ExampleError',
        meta: {
          titleKey: 'router.error.title',
          icon: 'fc-cancel',
        },
        children: [
          {
            path: '404',
            name: 'ExampleError404',
            component: () => import('@/views/notfound/not-found-page.vue'),
            meta: {
              titleKey: 'router.error.notFound',
              icon: 'fc-cancel',
              parent: 'fullscreen',
            },
          },
          {
            path: '403',
            name: 'ExampleError403',
            component: () => import('@/views/notfound/forbidden-page.vue'),
            meta: {
              titleKey: 'router.error.forbidden',
              icon: 'fc-cancel',
              parent: 'fullscreen',
            },
          },
          {
            path: '500',
            name: 'ExampleError500',
            component: () => import('@/views/notfound/server-error-page.vue'),
            meta: {
              titleKey: 'router.error.serverError',
              icon: 'fc-cancel',
              parent: 'fullscreen',
            },
          },
        ],
      },
    ],
  },
]

export default exampleRoutes
