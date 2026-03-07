/**
 * 动态路由管理：注入、移除、清空动态路由
 * 职责：仅负责与 Vue Router 实例交互的增删动态路由，不包含菜单或转换逻辑。
 */

import type { Router } from 'vue-router'
import { transformToVueRoutes } from './transform'

/**
 * 动态路由管理器
 */
export function createDynamicRouteManager(router: Router) {
  const dynamicRoutes: RouteConfig[] = []

  return {
    addRoute(route: RouteConfig) {
      if (!route.name) {
        console.error(
          '🪒-Router: 动态路由缺少 name，已忽略当前路由。请为该路由配置唯一的 name。',
          route
        )
        return
      }

      const existingIndex = dynamicRoutes.findIndex(r => r.path === route.path)
      if (existingIndex !== -1) {
        dynamicRoutes[existingIndex] = route
      } else {
        dynamicRoutes.push(route)
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
      const index = dynamicRoutes.findIndex(r => r.name === name)
      if (index !== -1) {
        dynamicRoutes.splice(index, 1)
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
      dynamicRoutes.length = 0
    },

    getRoutes() {
      return [...dynamicRoutes]
    },

    resetRouter() {
      this.clearRoutes()
    },
  }
}
