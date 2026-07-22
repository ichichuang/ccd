import { parseZodHttpPayload } from '@/adapters/http.adapter'
import {
  systemAsyncRouteItemSchema,
  type SystemAsyncRouteItem,
} from '@/types/dto/system.dto'

const DEMO_DYNAMIC_ROUTES: SystemAsyncRouteItem[] = [
  {
    path: '/demo/access-overview',
    name: 'DemoAccessOverview',
    component: 'showcase/hooks/auth-permission/index',
    meta: {
      title: 'Demo access overview',
      icon: 'i-lucide-shield-check',
      parent: 'admin',
      rank: 15,
      roles: ['admin', 'user'],
      auths: ['example:architecture:read'],
      showLink: true,
      keepAlive: false,
    },
  },
]

export function requestDemoSystemAsyncRoutes(): Promise<SystemAsyncRouteItem[]> {
  return Promise.resolve(
    parseZodHttpPayload(systemAsyncRouteItemSchema.array(), DEMO_DYNAMIC_ROUTES)
  )
}
