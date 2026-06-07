// Unified V2.3 Example Routes
import { defineRouteModule } from '@/router/utils/routeModules'
import architectureRoutes from './example/architecture'
import commonRoutes from './example/common'
import componentsRoutes from './example/components'
import hooksRoutes from './example/hooks'
import systemConfigurationRoutes from './example/system-configuration'
import utilsRoutes from './example/utils'

const exampleRoutes = defineRouteModule<RouteConfig[]>([
  ...systemConfigurationRoutes,
  ...componentsRoutes,
  ...hooksRoutes,
  ...utilsRoutes,
  ...commonRoutes,
  ...architectureRoutes,
])

export default exampleRoutes
