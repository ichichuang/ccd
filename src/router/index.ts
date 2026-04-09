// Router 统一管理入口
import { isTauri } from '@/utils/env'
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
import { autoImportModulesSync } from '@/router/utils/moduleLoader'
import { registerRouterGuards } from './utils/guards'
import { rootRedirect } from '@/constants/router'

// 核心业务路由与示例路由全量打包（用于线上 Demo 展示）
const routeModules = import.meta.glob('./modules/**/*.ts', { eager: true })
const importedRoutes = autoImportModulesSync<RouteModule>(
  routeModules as Record<string, { default?: unknown; [key: string]: unknown }>,
  './modules/'
)

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

// 将所有路由模块合并为一个数组并排序
const staticRoutes: RouteConfig[] = processRouteModules(importedRoutes)
const sortedStaticRoutes: RouteConfig[] = sortRoutes(staticRoutes)
// 添加 parentPaths 并归一化 ratio 默认值
const routesWithParentPaths = addParentPathsToLeafRoutes(sortedStaticRoutes)
const normalizedStaticRoutes = normalizeRatioMetaOnRoutes(routesWithParentPaths)

// 创建路由工具集（用于菜单渲染、面包屑等）
export const routeUtils = createRouteUtils(normalizedStaticRoutes)

// 类型安全的路由转换函数
function createInitialRoutes(routes: RouteConfig[]): RouteRecordRaw[] {
  return transformToVueRoutes(routes)
}

// 转换为 Vue Router 兼容格式
// 将错误页与 CatchAll 的 rootRedirect 一并纳入初始静态路由，避免依赖鉴权动态注入
const initialRoutes: RouteRecordRaw[] = createInitialRoutes([
  ...normalizedStaticRoutes,
  ...rootRedirect,
])

// 创建路由实例
// Tauri 桌面端强制 Hash 模式：tauri:// 协议不支持 HTML5 History，刷新会白屏
const router = createRouter({
  history:
    isTauri() || import.meta.env.VITE_ROUTER_MODE === 'hash'
      ? createWebHashHistory()
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

// 注册路由
registerRouterGuards({
  router,
  routeUtils,
  // 向权限系统与菜单暴露的 staticRoutes 也包含错误页与 CatchAll
  staticRoutes: [...normalizedStaticRoutes, ...rootRedirect],
  dynamicRouteManager,
})

// 注入路由能力到 infra 层，供 Store 等通过 getRouterCapabilities() 使用，避免 Store 直接依赖 router/utils
// 此处不从 helper 导入，避免 index ↔ helper 循环依赖导致 getAdminMenuTree 未初始化
import { setRouterCapabilities } from '@/infra/router/routeProvider'
setRouterCapabilities({
  getAdminMenuTree: () => routeUtils.getAdminMenuTree(),
  getFlatRouteList: () => routeUtils.flatRoutes,
})

export default router
