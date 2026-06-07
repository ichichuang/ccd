import { permissionRoute } from './architecture-permission'

import { routerMetaRoute } from './architecture-router-meta'

import { layoutInspectorRoute } from './architecture-system-states'

import { adaptersRootRoute } from './architecture-adapters'

import { directivesRootRoute } from './architecture-directives'

import { infraRootRoute } from './architecture-infra'

import { storesRootRoute } from './architecture-stores'

const architectureAdvancedRootRoute: RouteConfig = {
  path: '/example/architecture',
  name: 'ExampleArchitectureAdvanced',
  redirect: '/example/permission/roles',
  meta: {
    titleKey: 'router.example.architecture.root',
    rank: 6,
    icon: 'i-lucide-sparkles',
  },
  children: [
    layoutInspectorRoute,
    permissionRoute,
    routerMetaRoute,
    directivesRootRoute,
    adaptersRootRoute,
    infraRootRoute,
    storesRootRoute,
  ],
}

export default [architectureAdvancedRootRoute] satisfies RouteConfig[]
