const routerMetaRoute: RouteConfig = {
  path: '/example/router-meta',
  name: 'ExampleRouterMeta',
  redirect: '/example/router-meta/index',
  meta: {
    titleKey: 'router.example.architecture.routerMeta.root',
    rank: 6,
    icon: 'i-lucide-route',
  },
  children: [
    {
      path: '/example/router-meta/index',
      name: 'ExampleRouterMetaIndex',
      component: () => import('@/views/example/architecture/router-meta/router-meta-index.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.index',
        rank: 1,
        icon: 'i-lucide-route',
      },
    },
    {
      path: '/example/router-meta/external-link',
      name: 'ExampleExternalLink',
      component: () => import('@/views/example/architecture/router-meta/external-link.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.externalLink',
        rank: 2,
        icon: 'i-lucide-external-link',
        isLink: true,
        linkUrl: 'https://vuejs.org',
      },
    },
    {
      path: '/example/router-meta/hide-breadcrumb',
      name: 'ExampleHideBreadcrumb',
      component: () => import('@/views/example/architecture/router-meta/hide-breadcrumb.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.hideBreadcrumb',
        rank: 3,
        icon: 'i-lucide-navigation',
        hideBreadcrumb: true,
      },
    },
    {
      path: '/example/router-meta/hidden-tag',
      name: 'ExampleHiddenTag',
      component: () => import('@/views/example/architecture/router-meta/hidden-tag.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.hiddenTag',
        rank: 4,
        icon: 'i-lucide-tag',
        hiddenTag: true,
      },
    },
    {
      path: '/example/router-meta/ratio-demo',
      name: 'ExampleRatioDemo',
      component: () => import('@/views/example/architecture/router-meta/ratio-layout.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.ratioLayout',
        rank: 5,
        icon: 'i-lucide-ratio',
        parent: 'ratio',
        ratio: '16:9',
      },
    },
    {
      path: '/example/router-meta/reuse-window',
      name: 'ExampleReuseWindow',
      component: () => import('@/views/example/architecture/router-meta/reuse-window.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.reuseWindow',
        rank: 6,
        icon: 'i-lucide-app-window',
        parent: 'fullscreen',
        reuseWindow: true,
      },
    },
    {
      path: '/example/router-meta/keep-alive',
      name: 'ExampleKeepAlive',
      component: () => import('@/views/example/architecture/router-meta/keep-alive.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.keepAlive',
        rank: 7,
        icon: 'i-lucide-database',
        keepAlive: true,
      },
    },
    {
      path: '/example/router-meta/transition-demo',
      name: 'ExampleTransitionDemo',
      component: () => import('@/views/example/architecture/router-meta/transition.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.transition',
        rank: 8,
        icon: 'i-lucide-sparkles',
        transition: {
          enterClass: 'zoomIn',
          leaveClass: 'zoomOut',
          duration: { enter: '600ms', leave: '400ms' },
        },
      },
    },
  ],
}

export { routerMetaRoute }

export default [routerMetaRoute] satisfies RouteConfig[]
