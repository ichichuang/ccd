import { defineComponent, isVNode } from 'vue'
import type { PropType, VNode } from 'vue'

/**
 * Renders either a VNode or a primitive value inside a DataTable cell.
 * Needed because Vue templates cannot interpolate VNode objects directly.
 */
export default defineComponent({
  name: 'ProTableCell',
  props: {
    node: {
      type: [String, Number, Object, null] as PropType<VNode | string | number | null>,
      default: null,
    },
    alignClass: {
      type: String,
      default: 'text-left',
    },
    extraClass: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return (): VNode => {
      const content = isVNode(props.node)
        ? props.node
        : props.node !== null && props.node !== undefined
          ? String(props.node)
          : ''
      const cls = [props.alignClass, props.extraClass].filter(Boolean).join(' ')
      return <div class={cls}>{typeof content === 'string' ? <span>{content}</span> : content}</div>
    }
  },
})
