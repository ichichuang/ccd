const layoutInspectorRoute: RouteConfig = {
  path: '/example/system-states',
  name: 'ExampleSystemStates',
  component: () => import('@/views/example/architecture/system-states/index.vue'),
  meta: {
    titleKey: 'router.example.architecture.systemStates',
    rank: 4,
    icon: 'i-lucide-panel-right',
  },
}

export { layoutInspectorRoute }

export default [layoutInspectorRoute] satisfies RouteConfig[]
