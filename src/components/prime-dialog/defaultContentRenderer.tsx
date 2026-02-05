/**
 * 默认空内容渲染器
 * 在无 contentRenderer 时提供占位，避免对话框 body 空白
 * 使用 UnoCSS 语义类：p-scale-md（间距）、min-h-12（最小高度）
 */
import type { VNode } from 'vue'
import type { DialogOptionsBase } from './utils/types'

export const defaultContentRenderer = ({
  options: _options,
  index: _index,
}: {
  options: DialogOptionsBase
  index: number
}): VNode => <div class="p-padding-md" />
