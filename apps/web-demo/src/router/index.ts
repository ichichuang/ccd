// Router 统一管理入口
import {
  addParentPathsToLeafRoutes,
  createRouteUtils,
  normalizeRatioMetaOnRoutes,
  sortRoutes,
  transformToVueRoutes,
} from '@/router/utils/transform'
import { createDynamicRouteManager } from '@/router/utils/dynamic'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { autoImportModules } from '@/router/utils/moduleLoader'
import { registerRouterGuards } from './utils/guards'
import { rootRedirect } from '@/constants/router'
import coreRoutes from './modules/core'

type RouteModuleFile = { default?: RouteModule; [key: string]: unknown }

// 业务静态路由模块以 lazy manifest 暴露；core routes 保持启动关键路径同步注册。
const routeModuleLoaders = import.meta.glob<RouteModuleFile>('./modules/**/*.ts')
let normalizedStaticRoutes: RouteConfig[] = []
let staticRoutesLoadPromise: Promise<RouteConfig[]> | null = null

// 类型安全的路由模块处理函数
function processRouteModules(modules: Record<string, RouteModule>): RouteConfig[] {
  const routes: RouteConfig[] = []

  for (const [moduleName, moduleExports] of Object.entries(modules)) {
    try {
      // 支持单个路由配置或路由数组
      const moduleRoutes = Array.isArray(moduleExports) ? moduleExports : [moduleExports]

      // 类型检查和过滤
      const validRoutes = moduleRoutes.filter((route): route is RouteConfig => {
        if (!route || typeof route !== 'object') {
          console.warn(`⚠️ 路由模块 ${moduleName} 导出的不是有效的路由对象`)
          return false
        }

        if (typeof route.path !== 'string' || !route.path) {
          console.warn(`⚠️ 路由模块 ${moduleName} 缺少有效的 path 属性`)
          return false
        }

        return true
      })

      routes.push(...validRoutes)
    } catch (error) {
      console.error(`❌ 处理路由模块 ${moduleName} 时发生错误:`, error)
    }
  }

  return routes
}

function normalizeStaticRoutes(routes: RouteConfig[]): RouteConfig[] {
  const sortedStaticRoutes = sortRoutes(routes)
  const routesWithParentPaths = addParentPathsToLeafRoutes(sortedStaticRoutes)
  return normalizeRatioMetaOnRoutes(routesWithParentPaths)
}

// 创建路由工具集（用于菜单渲染、面包屑等），静态模块加载后原地更新。
export const routeUtils = createRouteUtils([])

// 类型安全的路由转换函数
function createInitialRoutes(routes: RouteConfig[]): RouteRecordRaw[] {
  return transformToVueRoutes(routes)
}

// 初始保留登录/根路由与错误页；其他静态业务路由通过 lazy manifest 后台注册。
const initialRoutes: RouteRecordRaw[] = createInitialRoutes([...coreRoutes, ...rootRedirect])

// 创建路由实例
const router = createRouter({
  // history 模式
  history:
    import.meta.env.VITE_ROUTER_MODE === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH)
      : createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: initialRoutes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 创建动态路由管理器
export const dynamicRouteManager = createDynamicRouteManager(router)

export async function ensureStaticRoutesLoaded(): Promise<RouteConfig[]> {
  if (staticRoutesLoadPromise) {
    return staticRoutesLoadPromise
  }

  staticRoutesLoadPromise = autoImportModules<RouteModule>(routeModuleLoaders, './modules/').then(
    importedRoutes => {
      const { core: _coreRoutes, ...businessRouteModules } = importedRoutes
      normalizedStaticRoutes = normalizeStaticRoutes(processRouteModules(businessRouteModules))
      dynamicRouteManager.addRoutes(normalizedStaticRoutes)
      routeUtils.updateRouteUtils(normalizedStaticRoutes)
      return normalizedStaticRoutes
    }
  )

  return staticRoutesLoadPromise
}

export function getStaticRoutesSnapshot(): RouteConfig[] {
  return [...normalizedStaticRoutes]
}

// 注册路由
registerRouterGuards({
  router,
  routeUtils,
  loadStaticRoutes: ensureStaticRoutesLoaded,
  dynamicRouteManager,
})

export default router
