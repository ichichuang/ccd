import type { ComponentPublicInstance, VNode } from 'vue'
import { defineComponent, Fragment, h, onErrorCaptured, ref } from 'vue'
import { createErrorFallback, isDevelopment, safeRender } from './utils/helpers'
import type { TSXRenderFunction } from './utils/types'

export default defineComponent({
  name: 'RenderTSX',
  props: {
    dom: {
      type: Function as unknown as () => TSXRenderFunction,
      required: true,
      validator: (value: any) => typeof value === 'function',
    },
    params: {
      type: [Object, Array, String, Number, Boolean] as unknown as () => any,
      default: null,
    },
    errorBoundary: {
      type: Boolean,
      default: true,
    },
    fallback: {
      type: [Object, Function] as unknown as () => VNode | (() => VNode),
      default: () => h('div', { class: 'render-tsx-error' }, '渲染失败'),
    },
    class: {
      type: String,
      default: '',
    },
    style: {
      type: Object as unknown as () => Record<string, any>,
      default: () => ({}),
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

    /** 渲染内容 */
    const renderContent = (): VNode => {
      try {
        if (hasError.value) {
          // 显示错误回退内容
          const fallbackContent =
            typeof props.fallback === 'function' ? props.fallback() : props.fallback

          return fallbackContent || createErrorFallback(error.value || undefined, isDevelopment())
        }

        // 安全渲染 TSX 内容
        const result = safeRender(props.dom, props.params)

        // 确保返回的是 VNode 或 VNode 数组
        if (Array.isArray(result)) {
          return h(Fragment, {}, result)
        }

        return result
      } catch (err) {
        // 捕获同步错误
        handleError(err as Error, null, 'render')
        return createErrorFallback(err as Error, isDevelopment())
      }
    }

    // 注册错误捕获
    if (props.errorBoundary) {
      onErrorCaptured(handleError)
    }

    return () =>
      h(
        'div',
        {
          class: ['full', props.class].filter(Boolean).join(' '),
          style: props.style,
        },
        [renderContent()]
      )
  },
})
