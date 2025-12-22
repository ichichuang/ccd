import type { VNode } from 'vue'

/**
 * TSX 渲染函数类型
 *
 * 用于动态渲染 TSX/JSX 内容的函数类型
 * 接收可选参数，返回 VNode 或 VNode 数组
 *
 * @example
 * ```typescript
 * const renderFunction: TSXRenderFunction = (params) => {
 *   return <div>Hello {params?.name}</div>
 * }
 * ```
 */
export type TSXRenderFunction = (params?: any) => VNode | VNode[]

/**
 * RenderTSX 组件 Props 接口
 *
 * 用于动态渲染 TSX/JSX 内容的组件属性
 *
 * 这是一个 "headless" 组件，专注于渲染逻辑和错误处理，不包含布局相关的属性。
 * 父组件可以通过外层包装元素来控制样式和布局。
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 父组件控制样式和布局 -->
 *   <div class="my-wrapper" :style="{ padding: '16px' }">
 *     <RenderTSX
 *       :dom="renderFunction"
 *       :params="{ name: 'World' }"
 *       :error-boundary="true"
 *     />
 *   </div>
 * </template>
 *
 * <script setup lang="ts">
 * import { RenderTSX } from '@/components/modules/render-tsx'
 * import type { TSXRenderFunction } from '@/components/modules/render-tsx'
 *
 * const renderFunction: TSXRenderFunction = (params) => {
 *   return <div>Hello {params?.name}</div>
 * }
 * </script>
 * ```
 */
export interface RenderTSXProps {
  /**
   * TSX 渲染函数（必填）
   *
   * 接收参数并返回 VNode 或 VNode 数组的函数
   * 可以是 TSX/JSX 函数，也可以是返回 VNode 的普通函数
   *
   * @example
   * ```typescript
   * const renderFn: TSXRenderFunction = (params) => {
   *   return h('div', { class: 'my-component' }, params?.text)
   * }
   * ```
   */
  dom: TSXRenderFunction

  /**
   * 传递给渲染函数的参数
   *
   * 可以是任何类型的值（对象、数组、字符串、数字、布尔值等）
   * 渲染函数可以通过第一个参数接收这些值
   *
   * @default undefined
   * @example
   * - :params="{ name: 'John', age: 30 }"
   * - :params="['item1', 'item2']"
   * - :params="123"
   */
  params?: any

  /**
   * 是否启用错误边界
   *
   * 启用后，组件会捕获渲染过程中的错误，并显示回退内容
   * 如果禁用，错误会向上传播到父组件
   *
   * @default true
   * @example
   * - :error-boundary="true" - 启用错误边界（推荐）
   * - :error-boundary="false" - 禁用错误边界
   */
  errorBoundary?: boolean

  /**
   * 错误时的回退组件
   *
   * 当渲染出错时显示的内容，可以是 VNode 或返回 VNode 的函数
   * 如果不提供，会使用默认的错误提示
   *
   * @default undefined
   * @example
   * ```typescript
   * // VNode 形式
   * const fallback = h('div', { class: 'error' }, '出错了')
   *
   * // 函数形式
   * const fallback = () => h('div', { class: 'error' }, '出错了')
   * ```
   */
  fallback?: VNode | (() => VNode)
}

/**
 * 渲染错误信息接口
 *
 * 包含渲染错误的所有相关信息
 */
export interface RenderError {
  /** 错误对象 */
  error: Error
  /** 错误信息描述 */
  info: string
  /** 渲染时的参数 */
  params?: any
  /** 错误发生的时间戳 */
  timestamp: number
}

/**
 * 组件状态接口
 *
 * 用于跟踪组件内部状态
 */
export interface RenderTSXState {
  /** 是否发生错误 */
  hasError: boolean
  /** 错误对象 */
  error: Error | null
  /** 上次渲染时间戳 */
  lastRenderTime: number
}
