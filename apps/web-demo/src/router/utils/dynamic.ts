/**
 * 动态路由管理：注入、移除、清空动态路由
 * 职责：仅负责与 Vue Router 实例交互的增删动态路由，不包含菜单或转换逻辑。
 */

import { appLogger } from '@/adapters/logger.adapter'
import type { Router } from 'vue-router'
import { transformToVueRoutes } from './transform'

/**
 * 动态路由管理器
 */
export function createDynamicRouteManager(router: Router) {
  let dynamicRoutes: RouteConfig[] = []

  return {
    addRoute(route: RouteConfig) {
      if (!route.name) {
        appLogger.error(
          '🪒-Router: 动态路由缺少 name，已忽略当前路由。请为该路由配置唯一的 name。',
          route
        )
        return
      }

      const existingIndex = dynamicRoutes.findIndex(r => r.name === route.name)
      if (existingIndex !== -1) {
        dynamicRoutes = dynamicRoutes.map((r, i) => (i === existingIndex ? route : r))
      } else {
        dynamicRoutes = [...dynamicRoutes, route]
      }

      const vueRoute = transformToVueRoutes([route])[0]
      if (vueRoute.name && !router.hasRoute(vueRoute.name)) {
        router.addRoute(vueRoute)
      }
    },

    addRoutes(routes: RouteConfig[]) {
      routes.forEach(route => this.addRoute(route))
    },

    removeRoute(name: string) {
      const exists = dynamicRoutes.some(r => r.name === name)
      if (exists) {
        dynamicRoutes = dynamicRoutes.filter(r => r.name !== name)
        if (router.hasRoute(name)) {
          router.removeRoute(name)
        }
      }
    },

    clearRoutes() {
      dynamicRoutes.forEach(route => {
        if (route.name && router.hasRoute(route.name)) {
          router.removeRoute(route.name)
        }
      })
      dynamicRoutes = []
    },

    getRoutes() {
      return [...dynamicRoutes]
    },

    resetRouter() {
      this.clearRoutes()
    },
  }
}
