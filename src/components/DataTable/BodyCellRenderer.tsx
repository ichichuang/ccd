/**
 * BodyCellRenderer - 表格单元格渲染器
 *
 * 用于渲染 DataTable 列配置中 column.body(rowData, column) 的返回值（VNode 或 string）。
 * 仅用于 DataTable 列 body 模板内部，不单独对外使用。
 *
 * 错误处理：DEV 下显示 [Render Error] 并 console.error；生产环境静默返回 null，不抛错。
 */
import { defineComponent, type PropType, type VNode } from 'vue'
import type { DataTableColumn } from './utils/types'

export default defineComponent({
  name: 'BodyCellRenderer',
  props: {
    /** 列 body 渲染函数 (rowData, column) => VNode | string */
    bodyFn: {
      type: Function as PropType<(rowData: unknown, column: DataTableColumn) => VNode | string>,
      required: true,
    },
    /** 当前行数据，与 DataTable 行数据类型一致 */
    rowData: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    /** 列配置 */
    column: {
      type: Object as PropType<DataTableColumn>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      try {
        const result = props.bodyFn(props.rowData, props.column)
        if (typeof result === 'string') return result
        return result
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('[BodyCellRenderer] Render error:', e)
          return <span class="text-danger fs-xs">[Render Error]</span>
        }
        return null
      }
    }
  },
})
