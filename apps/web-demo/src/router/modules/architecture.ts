import { defineRouteModule } from '@/router/utils/routeModules'

const consolePage = () => import('@/views/architecture-console/ConsolePage.vue')

const architectureRoute: RouteConfig = {
  path: '/architecture',
  name: 'ArchitectureRoot',
  redirect: '/architecture/topology',
  meta: {
    titleKey: 'router.console.architecture.root',
    icon: 'i-lucide-git-branch',
    rank: 10,
  },
  children: [
    {
      path: '/architecture/topology',
      name: 'ArchitectureTopology',
      component: consolePage,
      meta: {
        titleKey: 'router.console.architecture.topology',
        icon: 'i-lucide-network',
        rank: 1,
      },
    },
    {
      path: '/architecture/package-boundaries',
      name: 'ArchitecturePackageBoundaries',
      component: consolePage,
      meta: {
        titleKey: 'router.console.architecture.packageBoundaries',
        icon: 'i-lucide-package-check',
        rank: 2,
      },
    },
    {
      path: '/architecture/runtime-boundaries',
      name: 'ArchitectureRuntimeBoundaries',
      component: consolePage,
      meta: {
        titleKey: 'router.console.architecture.runtimeBoundaries',
        icon: 'i-lucide-shield',
        rank: 3,
      },
    },
    {
      path: '/architecture/governance',
      name: 'ArchitectureGovernance',
      component: consolePage,
      meta: {
        titleKey: 'router.console.architecture.governance',
        icon: 'i-lucide-list-checks',
        rank: 4,
      },
    },
  ],
}

export default defineRouteModule(architectureRoute)
