const directivesRootRoute: RouteConfig = {
  path: '/example/directives',
  name: 'ExampleDirectives',
  redirect: '/example/directives/auth',
  meta: {
    titleKey: 'router.example.architecture.directives.root',
    rank: 14,
    icon: 'i-lucide-sparkles',
  },
  children: [
    {
      path: '/example/directives/auth',
      name: 'ExampleDirectiveAuth',
      component: () => import('@/views/example/architecture/directives/auth.vue'),
      meta: {
        titleKey: 'router.example.architecture.directives.auth',
        rank: 1,
        icon: 'i-lucide-shield',
      },
    },
  ],
}

export { directivesRootRoute }

export default [directivesRootRoute] satisfies RouteConfig[]
