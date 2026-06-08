import { routerMetaRouteNames, routerMetaRoutePaths } from './shared/router-meta.paths'

const routerMetaRoute: RouteConfig = {
  path: routerMetaRoutePaths.root,
  name: routerMetaRouteNames.root,
  redirect: routerMetaRoutePaths.index,
  meta: {
    titleKey: 'router.example.architecture.routerMeta.root',
    rank: 6,
    icon: 'i-lucide-route',
  },
  children: [
    {
      path: routerMetaRoutePaths.index,
      name: routerMetaRouteNames.index,
      component: () => import('@/views/example/architecture/router-meta/router-meta-index.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.index',
        rank: 1,
        icon: 'i-lucide-route',
      },
    },
    {
      path: routerMetaRoutePaths.externalLink,
      name: routerMetaRouteNames.externalLink,
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
      path: routerMetaRoutePaths.hideBreadcrumb,
      name: routerMetaRouteNames.hideBreadcrumb,
      component: () => import('@/views/example/architecture/router-meta/hide-breadcrumb.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.hideBreadcrumb',
        rank: 3,
        icon: 'i-lucide-navigation',
        hideBreadcrumb: true,
      },
    },
    {
      path: routerMetaRoutePaths.hiddenTag,
      name: routerMetaRouteNames.hiddenTag,
      component: () => import('@/views/example/architecture/router-meta/hidden-tag.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.hiddenTag',
        rank: 4,
        icon: 'i-lucide-tag',
        hiddenTag: true,
      },
    },
    {
      path: routerMetaRoutePaths.ratioDemo,
      name: routerMetaRouteNames.ratioDemo,
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
      path: routerMetaRoutePaths.reuseWindow,
      name: routerMetaRouteNames.reuseWindow,
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
      path: routerMetaRoutePaths.keepAlive,
      name: routerMetaRouteNames.keepAlive,
      component: () => import('@/views/example/architecture/router-meta/keep-alive.vue'),
      meta: {
        titleKey: 'router.example.architecture.routerMeta.keepAlive',
        rank: 7,
        icon: 'i-lucide-database',
        keepAlive: true,
      },
    },
    {
      path: routerMetaRoutePaths.transitionDemo,
      name: routerMetaRouteNames.transitionDemo,
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
