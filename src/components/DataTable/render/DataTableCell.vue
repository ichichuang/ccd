<script setup lang="ts">
/**
 * DataTableCell - 纯展示单元格（#body 槽内容）
 * 仅通过 props 接收数据，无 Pinia/API。不包装 PrimeVue Column，仅渲染单元格内容。
 */
import BodyCellRenderer from '../BodyCellRenderer'
import type { DataTableColumn } from '../utils/types'

defineOptions({ name: 'DataTableCell' })

export interface DataTableCellProps {
  /** 当前行数据 */
  rowData: Record<string, unknown>
  /** 列配置 */
  column: DataTableColumn<unknown>
  /** 内容对齐（来自表格 contentAlign） */
  contentAlign?: 'left' | 'center' | 'right'
  /** 解析后的单元格 class（含 string[]） */
  bodyClass?: string | string[] | Record<string, boolean>
  /** 解析后的单元格 style */
  bodyStyle?: Record<string, string | number> | import('vue').CSSProperties
  /** 无 body 时的默认显示值 */
  cellValue: unknown
  /** 列 body 渲染函数（存在时用 BodyCellRenderer 渲染） */
  bodyFn?: (rowData: unknown, column: DataTableColumn<unknown>) => import('vue').VNode | string
  /** 是否为 expander 列且使用 expanderBody 自绘 */
  isExpanderWithBody?: boolean
  /** 当前行是否已展开（仅 expander 时有效） */
  isExpanded?: boolean
  /** 切换展开（仅 expander 时有效） */
  onToggle?: () => void
}

const props = withDefaults(defineProps<DataTableCellProps>(), {
  contentAlign: 'left',
  bodyClass: undefined,
  bodyStyle: undefined,
  bodyFn: undefined,
  isExpanderWithBody: false,
  isExpanded: false,
  onToggle: undefined,
})

const justifyContent =
  props.contentAlign === 'center'
    ? 'center'
    : props.contentAlign === 'right'
      ? 'flex-end'
      : 'flex-start'
</script>

<template>
  <!-- 情况 1：expander + expanderBody，自绘展开单元格 -->
  <BodyCellRenderer
    v-if="isExpanderWithBody && column.expanderBody"
    :body-fn="
      row =>
        (column as import('../utils/types').DataTableColumn<object>).expanderBody!(
          row as object,
          column,
          {
            isExpanded: !!isExpanded,
            toggle: onToggle ?? (() => {}),
          }
        )
    "
    :row-data="rowData"
    :column="column"
  />
  <!-- 情况 2：普通列 -->
  <div
    v-else-if="!column.expander"
    class="w-full h-full flex items-center"
    :class="bodyClass"
    :style="{ ...(bodyStyle as Record<string, string>), justifyContent }"
  >
    <BodyCellRenderer
      v-if="bodyFn"
      :body-fn="bodyFn"
      :row-data="rowData"
      :column="column"
    />
    <template v-else>
      {{ cellValue }}
    </template>
  </div>
</template>
