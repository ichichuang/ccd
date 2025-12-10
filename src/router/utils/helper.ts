/* 注册路由 */
import { getAuthRoutes } from '@/api/modules/auth'
import { cloneDeep } from '@/common'
import { rootRedirect } from '@/constants'
import { usePermissionStore } from '@/stores'
import { computed } from 'vue'
import type { Router } from 'vue-router'
import { createDynamicRouteManager, processAsyncRoutes } from './common'
import { usePermissionGuard } from './permission'

export const registerRouterGuards = ({
  router,
  debug = false,
  routeUtils,
  staticRoutes,
}: {
  router: Router
  debug?: boolean
  routeUtils: RouteUtils
  staticRoutes: RouteConfig[]
}) => {
  const dynamicRouteManager = createDynamicRouteManager(router)

  // 加载动态路由
  const initDynamicRoutes = async (): Promise<any> => {
    const permissionStore = usePermissionStore()
    permissionStore.setStaticRoutes([...staticRoutes, ...rootRedirect])
    const dynamicRoutes = computed(() => permissionStore.getDynamicRoutes)
    const allRoutes = computed(() => permissionStore.getAllRoutes)

    let asyncRoutes: RouteConfig[] = []

    // 如果本地已有动态路由数据
    if (dynamicRoutes.value.length > 0) {
      if (debug) {
        console.log('🪒 Router: 从本地获取的动态路由')
      }
      const cloneDynamicRoutes = cloneDeep(dynamicRoutes.value) as BackendRouteConfig[]
      asyncRoutes = processAsyncRoutes(cloneDynamicRoutes)

      // 设置动态路由已加载状态
      permissionStore.setDynamicRoutesLoaded(true)

      // 同步处理，直接添加路由
      dynamicRouteManager.addRoutes([...asyncRoutes])
      dynamicRouteManager.addRoutes([...rootRedirect])

      // 修复：获取完整的路由列表（静态 + 动态 + 错误页）
      // 注意：这里应该传递原始的路由配置，而不是 router.getRoutes() 的扁平化结果
      const completeRoutes = [...staticRoutes, ...asyncRoutes, ...rootRedirect]

      if (debug) {
        console.log('🪒 Router: 静态路由数量:', staticRoutes.length)
        console.log('🪒 Router: 动态路由数量:', asyncRoutes.length)
        console.log('🪒 Router: 总路由数量:', completeRoutes.length)
      }

      routeUtils.updateRouteUtils(completeRoutes)

      if (debug) {
        console.log('🪒 Router: 添加动态路由成功', dynamicRouteManager.getRoutes())
        console.log('🪒 Router: 更新 routeUtils 完成，总路由数:', completeRoutes.length)
      }

      return allRoutes.value
    } else {
      // 需要从后端获取动态路由数据
      if (debug) {
        console.log('🪒 Router: 从后端接口获取的动态路由')
      }

      try {
        // 响应拦截器已经返回了 data 字段，所以返回的就是路由数组
        const routes = await getAuthRoutes()

        // 保存到 store
        permissionStore.setDynamicRoutes(routes)
        permissionStore.setDynamicRoutesLoaded(true)

        // 处理路由配置
        asyncRoutes = processAsyncRoutes(routes)

        // 添加路由
        dynamicRouteManager.addRoutes([...asyncRoutes])
        dynamicRouteManager.addRoutes([...rootRedirect])

        // 修复：获取完整的路由列表（静态 + 动态 + 错误页）
        // 注意：这里应该传递原始的路由配置，而不是 router.getRoutes() 的扁平化结果
        const completeRoutes = [...staticRoutes, ...asyncRoutes, ...rootRedirect]

        if (debug) {
          console.log('🪒 Router: 静态路由数量:', staticRoutes.length)
          console.log('🪒 Router: 动态路由数量:', asyncRoutes.length)
          console.log('🪒 Router: 总路由数量:', completeRoutes.length)
        }

        routeUtils.updateRouteUtils(completeRoutes)

        if (debug) {
          console.log('🪒 Router: 添加动态路由成功', dynamicRouteManager.getRoutes())
          console.log('🪒 Router: 更新 routeUtils 完成，总路由数:', completeRoutes.length)
        }
      } catch (error) {
        console.error('🪒 Router: 获取动态路由失败:', error)
        throw error
      }
    }
  }

  // 注册权限守卫
  usePermissionGuard({ router, debug, initDynamicRoutes })

  return dynamicRouteManager
}
