/**
 * RenderFn - 渲染函数桥接组件
 *
 * 用于 DataTable 中 customFooter 等需要传入 (params) => VNode 的场景，
 * 将「函数 + 参数」封装为可渲染的组件，便于在模板中使用。
 *
 * 使用 defineComponent：本组件需从 setup 返回 render 函数以动态渲染 VNode，
 * script setup 无法直接返回 render，故采用此形式。符合 TSX 渲染规范。
 *
 * 错误处理：DEV 下显示 [Render Error] 并 console.error；生产环境静默返回 null，不抛错。
 */
import { defineComponent, type PropType, type VNode } from 'vue'

export default defineComponent({
  name: 'RenderFn',
  props: {
    /** 渲染函数 (params) => VNode | VNode[] */
    fn: {
      type: Function as PropType<(params?: any) => VNode | VNode[]>,
      required: true,
    },
    /** 传入渲染函数的参数，类型由调用方决定 */
    params: {
      type: [Object, Array, String, Number, Boolean] as PropType<any>,
      default: undefined,
    },
  },
  setup(props) {
    return () => {
      try {
        const result = props.fn(props.params)
        if (result == null) return null
        return result
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('[RenderFn] Render error:', e)
          return <span class="text-danger fs-xs">[Render Error]</span>
        }
        return null
      }
    }
  },
})
