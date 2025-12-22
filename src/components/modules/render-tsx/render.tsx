import type { ComponentPublicInstance, PropType, VNode } from 'vue'
import { defineComponent, Fragment, h, onErrorCaptured, ref } from 'vue'
import { createErrorFallback, isDevelopment } from './utils/helpers'
import type { TSXRenderFunction } from './utils/types'

export default defineComponent({
  name: 'RenderTSX',
  props: {
    dom: {
      type: Function as PropType<TSXRenderFunction>,
      required: true,
    },
    params: {
      type: [Object, Array, String, Number, Boolean],
      default: null,
    },
    errorBoundary: {
      type: Boolean,
      default: true,
    },
    fallback: {
      type: [Object, Function] as PropType<VNode | (() => VNode)>,
      default: () => h('div', { class: 'render-tsx-error' }, '渲染失败'),
    },
  },
  setup(props) {
    const hasError = ref(false)
    const error = ref<Error | null>(null)

    /** 错误捕获处理 */
    const handleError = (err: Error, instance: ComponentPublicInstance | null, info: string) => {
      hasError.value = true
      error.value = err

      // 开发环境下输出错误信息
      if (isDevelopment()) {
        console.error('RenderTSX 组件渲染错误:', {
          error: err,
          info,
          params: props.params,
        })
      }

      // 阻止错误继续向上传播
      return false
    }

    // 注册错误捕获
    if (props.errorBoundary) {
      onErrorCaptured(handleError)
    }

    // 直接返回渲染函数，合并所有逻辑
    return () => {
      // 1. 首先检查是否有已捕获的错误
      if (hasError.value) {
        const fallbackContent =
          typeof props.fallback === 'function' ? props.fallback() : props.fallback
        return fallbackContent || createErrorFallback(error.value || undefined, isDevelopment())
      }

      // 2. 尝试渲染内容
      try {
        const result = props.dom(props.params)

        // 3. 处理数组结果（Fragment）
        if (Array.isArray(result)) {
          return h(Fragment, {}, result)
        }

        return result
      } catch (err) {
        // 4. 捕获同步错误
        handleError(err as Error, null, 'render')
        const fallbackContent =
          typeof props.fallback === 'function' ? props.fallback() : props.fallback
        return fallbackContent || createErrorFallback(err as Error, isDevelopment())
      }
    }
  },
})
