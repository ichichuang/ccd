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
                path: 'basic',
                name: 'ExampleComponentsVxeTableBasic',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-basic.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.basic',
                  rank: 1,
                  icon: 'fc-list',
                },
              },
              {
                path: 'size',
                name: 'ExampleComponentsVxeTableSize',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-size.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.size',
                  rank: 2,
                  icon: 'fc-list',
                },
              },
              {
                path: 'layout',
                name: 'ExampleComponentsVxeTableLayout',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-layout.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.layout',
                  rank: 3,
                  icon: 'fc-list',
                },
              },
              {
                path: 'style',
                name: 'ExampleComponentsVxeTableStyle',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-style.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.style',
                  rank: 4,
                  icon: 'fc-list',
                },
              },
              {
                path: 'merge',
                name: 'ExampleComponentsVxeTableMerge',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-merge.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.merge',
                  rank: 5,
                  icon: 'fc-list',
                },
              },
              {
                path: 'advanced',
                name: 'ExampleComponentsVxeTableAdvanced',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-advanced.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.advanced',
                  rank: 6,
                  icon: 'fc-list',
                },
              },
              {
                path: 'dynamic',
                name: 'ExampleComponentsVxeTableDynamic',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-dynamic.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.dynamic',
                  rank: 7,
                  icon: 'fc-list',
                },
              },
              {
                path: 'scroll',
                name: 'ExampleComponentsVxeTableScroll',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-scroll.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.scroll',
                  rank: 8,
                  icon: 'fc-list',
                },
              },
              {
                path: 'pagination',
                name: 'ExampleComponentsVxeTablePagination',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-pagination.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.pagination',
                  rank: 9,
                  icon: 'fc-list',
                },
              },
              {
                path: 'column-capabilities',
                name: 'ExampleComponentsVxeTableColumnCapabilities',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-column-capabilities.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.columnCapabilities',
                  rank: 10,
                  icon: 'fc-list',
                },
              },
              {
                path: 'persistence',
                name: 'ExampleComponentsVxeTablePersistence',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-persistence.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.persistence',
                  rank: 11,
                  icon: 'fc-list',
                },
              },
              {
                path: 'virtual-scroll',
                name: 'ExampleComponentsVxeTableVirtualScroll',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-virtual-scroll.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.virtualScroll',
                  rank: 12,
                  icon: 'fc-list',
                },
              },
              {
                path: 'filter',
                name: 'ExampleComponentsVxeTableFilter',
                component: () =>
                  import('@/views/example/views/example-vxe-table/example-vxe-table-filter.vue'),
                meta: {
                  titleKey: 'router.example.components.vxetable.filter',
                  rank: 13,
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
              titleKey: 'router.example.components.datepicker',
              rank: 8,
              icon: 'fc-calendar',
            },
          },
          {
            path: 'icons',
            name: 'ExampleComponentsIcons',
            meta: {
              titleKey: 'router.example.components.icons.title',
              rank: 9,
              icon: 'fc-edit-image',
            },
            children: [
              {
                path: 'custom',
                name: 'ExampleComponentsIconsCustom',
                component: () =>
                  import('@/views/example/views/example-icons/example-icons-custom.vue'),
                meta: {
                  titleKey: 'router.example.components.icons.custom',
                  rank: 1,
                  icon: 'fc-edit-image',
                },
              },
              {
                path: 'component',
                name: 'ExampleComponentsIconsComponent',
                component: () =>
                  import('@/views/example/views/example-icons/example-icons-component.vue'),
                meta: {
                  titleKey: 'router.example.components.icons.component',
                  rank: 2,
                  icon: 'fc-edit-image',
                },
              },
            ],
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
          {
            path: 'crud',
            name: 'ExampleHttpCrud',
            component: () =>
              import('@/views/example/views/example-http/example-http-crud/example-http-crud.vue'),
            meta: {
              titleKey: 'router.example.http.crud',
              rank: 2,
              icon: 'fc-edit-image',
            },
          },
          {
            path: 'upload',
            name: 'ExampleHttpUpload',
            component: () => import('@/views/example/views/example-http/example-http-upload.vue'),
            meta: {
              titleKey: 'router.example.http.upload',
              rank: 3,
              icon: 'fc-upload',
            },
          },
          {
            path: 'upload-chunk',
            name: 'ExampleHttpUploadChunk',
            component: () =>
              import('@/views/example/views/example-http/example-http-upload-chunk.vue'),
            meta: {
              titleKey: 'router.example.http.uploadChunk',
              rank: 4,
              icon: 'fc-stack-of-photos',
            },
          },
          {
            path: 'download',
            name: 'ExampleHttpDownload',
            component: () => import('@/views/example/views/example-http/example-http-download.vue'),
            meta: {
              titleKey: 'router.example.http.download',
              rank: 5,
              icon: 'fc-download',
            },
          },
          {
            path: 'health',
            name: 'ExampleHttpHealth',
            component: () => import('@/views/example/views/example-http/example-http-health.vue'),
            meta: {
              titleKey: 'router.example.http.health',
              rank: 6,
              icon: 'fc-approval',
            },
          },
          {
            path: 'patch',
            name: 'ExampleHttpPatch',
            component: () => import('@/views/example/views/example-http/example-http-patch.vue'),
            meta: {
              titleKey: 'router.example.http.patch',
              rank: 7,
              icon: 'fc-edit-image',
            },
          },
          {
            path: 'cache',
            name: 'ExampleHttpCache',
            component: () => import('@/views/example/views/example-http/example-http-cache.vue'),
            meta: {
              titleKey: 'router.example.http.cache',
              rank: 8,
              icon: 'fc-bookmark',
            },
          },
          {
            path: 'connection',
            name: 'ExampleHttpConnection',
            component: () =>
              import('@/views/example/views/example-http/example-http-connection.vue'),
            meta: {
              titleKey: 'router.example.http.connection',
              rank: 9,
              icon: 'fc-link',
            },
          },
          {
            path: 'stats',
            name: 'ExampleHttpStats',
            component: () => import('@/views/example/views/example-http/example-http-stats.vue'),
            meta: {
              titleKey: 'router.example.http.stats',
              rank: 10,
              icon: 'fc-bar-chart',
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
          {
            path: 'loading',
            name: 'ExampleLayoutLoading',
            meta: {
              titleKey: 'router.example.layout.loading.title',
              rank: 4,
              icon: 'fc-close-up-mode',
            },
            children: [
              {
                path: 'basic',
                name: 'ExampleLayoutLoadingBasic',
                component: () =>
                  import('@/views/example/layout/example-loading/example-loading-basic.vue'),
                meta: {
                  titleKey: 'router.example.layout.loading.basic',
                  rank: 1,
                  icon: 'fc-close-up-mode',
                },
              },
              {
                path: 'cube',
                name: 'ExampleLayoutLoadingCube',
                component: () =>
                  import('@/views/example/layout/example-loading/example-loading-cube.vue'),
                meta: {
                  titleKey: 'router.example.layout.loading.cube',
                  rank: 2,
                  icon: 'fc-close-up-mode',
                },
              },
              {
                path: 'pulse',
                name: 'ExampleLayoutLoadingPulse',
                component: () =>
                  import('@/views/example/layout/example-loading/example-loading-pulse.vue'),
                meta: {
                  titleKey: 'router.example.layout.loading.pulse',
                  rank: 3,
                  icon: 'fc-close-up-mode',
                },
              },
              {
                path: 'dots',
                name: 'ExampleLayoutLoadingDots',
                component: () =>
                  import('@/views/example/layout/example-loading/example-loading-dots.vue'),
                meta: {
                  titleKey: 'router.example.layout.loading.dots',
                  rank: 4,
                  icon: 'fc-close-up-mode',
                },
              },
              {
                path: 'wave',
                name: 'ExampleLayoutLoadingWave',
                component: () =>
                  import('@/views/example/layout/example-loading/example-loading-wave.vue'),
                meta: {
                  titleKey: 'router.example.layout.loading.wave',
                  rank: 5,
                  icon: 'fc-close-up-mode',
                },
              },
            ],
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
