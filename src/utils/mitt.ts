import mitt, { type Emitter, type Handler, type WildcardHandler } from 'mitt'

/**
 * 全局事件类型定义
 * 仅定义实际使用的事件，避免 YAGNI
 */
export type Events = {
  // 窗口尺寸变化 (由 Device Store 触发)
  windowResize: { width: number; height: number }

  // ===== 多语言与时区相关事件 =====
  /**
   * 语言变更事件
   * 由 Locale Store 等模块在语言切换后触发
   * 例如 'zh-CN' | 'en-US'
   */
  localeChange: string

  /**
   * 时区变更事件
   * 由 Locale Store 或其他与时区策略相关的模块触发
   * 例如 'Asia/Shanghai' | 'UTC'
   */
  timezoneChange: string

  // ===== DataTable 列宽变更（由 useTableLayout 发出，DataTable 订阅后转发 Vue emit） =====
  tableColumnWidthsChange: {
    tableId?: string
    widths: { field: string; width: number; minWidth?: number; maxWidth?: number }[]
  }
}

// 创建全局单例
const emitter: Emitter<Events> = mitt<Events>()

export default emitter

/**
 * useMitt Hook
 * 重新封装以提供更好的类型提示和开发体验
 */
export const useMitt = () => {
  return {
    /**
     * 监听特定事件
     */
    on: <T extends keyof Events>(type: T, handler: Handler<Events[T]>) => {
      emitter.on(type, handler)
    },

    /**
     * 移除特定事件监听
     */
    off: <T extends keyof Events>(type: T, handler?: Handler<Events[T]>) => {
      emitter.off(type, handler)
    },

    /**
     * 触发事件
     */
    emit: <T extends keyof Events>(type: T, event: Events[T]) => {
      emitter.emit(type, event)
    },

    /**
     * 监听所有事件
     * [FIX] 直接传递 handler，避免包装函数导致 off 失效
     */
    onAll: (handler: WildcardHandler<Events>) => {
      emitter.on('*', handler)
    },

    /**
     * 移除所有事件监听
     * [FIX] 直接传递 handler，确保引用一致；未传 handler 时 no-op
     */
    offAll: (handler?: WildcardHandler<Events>) => {
      if (handler != null) emitter.off('*', handler)
    },

    /**
     * 清空所有事件监听
     */
    clear: () => {
      emitter.all.clear()
    },
  }
}
