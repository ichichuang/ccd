import mitt, { type Emitter, type EventType } from 'mitt'

// 定义事件类型
type Events = {
  // 全局事件
  appLoading: boolean
  appError: string
  appSuccess: string
  appNotification: { type: 'success' | 'error' | 'warning' | 'info'; message: string }

  // 用户相关事件
  userLogin: any
  userLogout: void
  userProfileUpdate: any

  // 路由相关事件
  routerBeforeRoute: string
  routerAfterRoute: string

  // 组件间通信事件
  componentRefresh: string
  componentClose: string
  componentOpen: string

  // 数据相关事件
  dataRefresh: string
  dataUpdate: { key: string; data: any }
  dataDelete: string

  // 主题相关事件
  themeChange: 'light' | 'dark'
  themeToggle: void

  // 语言相关事件
  localeChange: string
  localeReload: void

  // 布局相关事件
  layoutSidebarToggle: void
  layoutSidebarCollapse: boolean
  layoutFullscreen: boolean

  // 通用事件
  [key: string]: any
}

// 创建全局事件发射器实例
const emitter: Emitter<Events> = mitt<Events>()

// 导出事件发射器实例
export default emitter

// 导出类型
export type { Emitter, Events, EventType }

// 导出便捷方法
export const useMitt = () => {
  return {
    // 监听事件
    on: <T extends keyof Events>(type: T, handler: any) => {
      emitter.on(type, handler)
    },

    // 移除事件监听
    off: <T extends keyof Events>(type: T, handler?: any) => {
      emitter.off(type, handler)
    },

    // 触发事件
    emit: <T extends keyof Events>(type: T, data?: any) => {
      emitter.emit(type, data)
    },

    // 监听所有事件
    onAll: (handler: (type: string, data?: any) => void) => {
      emitter.on('*', handler)
    },

    // 移除所有事件监听
    offAll: (handler?: any) => {
      emitter.off('*', handler)
    },

    // 清空所有事件
    clear: () => {
      emitter.all.clear()
    },

    // 获取所有事件监听器
    getAll: () => {
      return emitter.all
    },
  }
}
