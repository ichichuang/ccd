/** 任务看板演示 — 优先级与状态（use-pro-table 示例） */

export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskBoardStatus = 'done' | 'active' | 'todo'

export const TASK_PRIORITY_CLASS: Record<TaskPriority, string> = {
  high: 'text-danger font-medium',
  medium: 'text-warn font-medium',
  low: 'text-muted-foreground',
}

export const TASK_BOARD_STATUS_DISPLAY: Record<TaskBoardStatus, { label: string; cls: string }> = {
  done: { label: '完成', cls: 'text-success font-medium' },
  active: { label: '进行中', cls: 'text-primary font-medium' },
  todo: { label: '待办', cls: 'text-muted-foreground' },
}
