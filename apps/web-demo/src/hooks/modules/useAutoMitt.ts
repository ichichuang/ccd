import emitter, { type Events } from '@/utils/mitt'
import type { Handler } from 'mitt'
import { createAutoMittHook } from '@ccd/vue-hooks'

/**
 * useAutoMitt — 带生命周期自动清理的事件总线 hook（推荐在组件内使用）
 *
 * 与 useMitt 相比，此 hook 在组件卸载（onUnmounted）时自动取消所有通过 on() 注册的
 * 订阅，防止已销毁组件继续接收事件、操作废弃响应式数据，从而避免内存泄漏与 Vue warn。
 *
 * ⚠️ 必须在组件 setup 上下文中调用（auto-import 环境下 onUnmounted 可用）。
 * 在非组件上下文（router guards、utils 等）中请使用 useMitt()。
 */
const useAutoMittBase = createAutoMittHook<Events>(emitter)

export const useAutoMitt = (): {
  on: <T extends keyof Events>(type: T, handler: Handler<Events[T]>) => void
  off: <T extends keyof Events>(type: T, handler?: Handler<Events[T]>) => void
  emit: <T extends keyof Events>(type: T, event: Events[T]) => void
} => {
  const { on, off } = useAutoMittBase()

  return {
    on,
    off,
    emit: <T extends keyof Events>(type: T, event: Events[T]) => {
      emitter.emit(type, event)
    },
  }
}
