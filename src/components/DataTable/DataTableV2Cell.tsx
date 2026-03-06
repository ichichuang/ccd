/**
 * DataTableV2Cell - V2 单元格渲染器
 *
 * 执行 column.render(row) 并安全渲染返回值（VNode 或原始值）。
 */
import type { DataTableColumn } from '@/types/data-table'
import type { VNode } from 'vue'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'DataTableV2Cell',
  props: {
    render: {
      type: Function as PropType<
        (row: object) => VNode | string | number | boolean | null | undefined
      >,
      required: true,
    },
    row: {
      type: Object as PropType<object>,
      required: true,
    },
    column: {
      type: Object as PropType<DataTableColumn<object>>,
      default: undefined,
    },
  },
  setup(props) {
    return () => {
      try {
        const result = props.render(props.row as object)
        if (result === null || result === undefined) return null
        if (
          typeof result === 'string' ||
          typeof result === 'number' ||
          typeof result === 'boolean'
        ) {
          return String(result)
        }
        return result as VNode
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('[DataTableV2Cell] Render error:', e)
          return <span class="text-danger fs-xs">[Render Error]</span>
        }
        return null
      }
    }
  },
})
