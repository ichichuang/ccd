/**
 * 消息内容组件
 * 用于 info/success/warning/error/confirm 等便捷对话框
 * 使用 UnoCSS 语义类：text-center、text-primary、text-success、text-warn、text-danger、text-foreground
 */
import type { VNode } from 'vue'

interface Props {
  message: string
  class?: string
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- TSX 组件导出使用 PascalCase
export const MessageContent = ({ message, class: cls }: Props): VNode => (
  <div class={cls ?? 'text-center text-foreground'}>{message}</div>
)
