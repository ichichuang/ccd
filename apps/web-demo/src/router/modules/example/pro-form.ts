const proFormRoute: RouteConfig = {
  path: '/example/primevue-collection/pro-form',
  name: 'ExampleProForm',
  redirect: '/example/primevue-collection/pro-form/basic',
  meta: {
    titleKey: 'router.example.components.primevueCollection.proForm.root',
    rank: 4,
    icon: 'i-lucide-form-input',
  },
  children: [
    {
      path: '/example/primevue-collection/pro-form/playground',
      name: 'ExampleProFormPlayground',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/playground/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.playground',
        rank: 0,
        icon: 'i-lucide-flask-conical',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/basic',
      name: 'ExampleProFormBasic',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/basic/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.basic',
        rank: 1,
        icon: 'i-lucide-form-input',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/group',
      name: 'ExampleProFormGroup',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/group/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.group',
        rank: 2,
        icon: 'i-lucide-folder-tree',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/validation',
      name: 'ExampleProFormValidation',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/validation/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.validation',
        rank: 3,
        icon: 'i-lucide-shield-check',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/dag',
      name: 'ExampleProFormDag',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/dag/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.dag',
        rank: 4,
        icon: 'i-lucide-align-center-vertical',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/reactions',
      name: 'ExampleProFormReactions',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/reactions/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.reactions',
        rank: 5,
        icon: 'i-lucide-link',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/advanced',
      name: 'ExampleProFormAdvanced',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/advanced/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.advanced',
        rank: 6,
        icon: 'i-lucide-layers',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/plugins',
      name: 'ExampleProFormPlugins',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/plugins/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.plugins',
        rank: 7,
        icon: 'i-lucide-plug',
      },
    },
    {
      path: '/example/primevue-collection/pro-form/api-events',
      name: 'ExampleProFormApiEvents',
      component: () =>
        import('@/views/example/components/primevue-collection/pro-form/api-events/index.vue'),
      meta: {
        titleKey: 'router.example.components.primevueCollection.proForm.apiEvents',
        rank: 8,
        icon: 'i-lucide-webhook',
      },
    },
  ],
}

export { proFormRoute }

export default [proFormRoute] satisfies RouteConfig[]
