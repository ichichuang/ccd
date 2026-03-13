import type { Scheduler } from '../dependency/Scheduler'

export interface RecomputeCapableController {
  recomputeFields(orderedFields: string[]): void
}

/**
 * 表单事务管理器
 *
 * - 支持嵌套事务（depth 计数）
 * - 在最外层事务提交时，统一计算受影响字段的更新顺序并回调 onFlush
 */
export class TransactionManager {
  private depth = 0
  private readonly pendingUpdates = new Set<string>()
  private readonly scheduler: Scheduler

  constructor(scheduler: Scheduler) {
    this.scheduler = scheduler
  }

  begin(): void {
    this.depth += 1
  }

  /**
   * 标记某个字段在当前事务中发生了更新
   */
  updateField(field: string): void {
    this.pendingUpdates.add(field)
  }

  /**
   * 提交一次事务：
   * - 若仍在嵌套事务中，仅减少 depth，不触发 flush
   * - 若退出最外层事务且存在待处理字段，则调用调度器计算顺序并执行 onFlush
   *
   * 若在未显式 begin 的情况下直接调用 commit，则视为单次更新：
   * - depth 为 0，此时立即根据 pendingUpdates 触发一次 flush
   */
  commit(
    onFlush: (orderedFields: string[]) => void,
    controller?: RecomputeCapableController
  ): void {
    if (this.depth === 0) {
      if (this.pendingUpdates.size === 0) return
      const ordered = this.scheduler.getUpdateOrder(Array.from(this.pendingUpdates))
      this.pendingUpdates.clear()
      controller?.recomputeFields(ordered)
      onFlush(ordered)
      return
    }

    this.depth -= 1

    if (this.depth > 0 || this.pendingUpdates.size === 0) {
      return
    }

    const ordered = this.scheduler.getUpdateOrder(Array.from(this.pendingUpdates))
    this.pendingUpdates.clear()
    controller?.recomputeFields(ordered)
    onFlush(ordered)
  }

  /**
   * 重置事务状态，一般用于 FormEngine 重新初始化时
   */
  reset(): void {
    this.depth = 0
    this.pendingUpdates.clear()
  }
}
