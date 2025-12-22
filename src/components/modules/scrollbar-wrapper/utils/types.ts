import type { OverlayScrollbars, PartialOptions } from 'overlayscrollbars'
import type { Ref, StyleValue } from 'vue'

// ==================== 基础类型定义 ====================

/**
 * 滚动方向类型
 * - 'horizontal': 仅水平滚动
 * - 'vertical': 仅垂直滚动
 * - 'both': 双向滚动（水平+垂直）
 */
export type ScrollDirection = 'horizontal' | 'vertical' | 'both'

/**
 * 自动隐藏行为类型
 * - 'scroll': 滚动时显示，停止后隐藏
 * - 'leave': 鼠标离开时隐藏
 * - 'move': 鼠标移动时显示，停止后隐藏
 * - 'never': 永不自动隐藏
 */
export type AutoHideBehavior = 'scroll' | 'leave' | 'move' | 'never'

/**
 * 滚动事件节流类型
 * - 'throttle': 节流模式，固定时间间隔执行
 * - 'debounce': 防抖模式，等待指定时间后执行
 * - 'none': 不使用节流/防抖，每次滚动都触发
 */
export type ThrottleType = 'throttle' | 'debounce' | 'none'

/**
 * 矩形区域信息接口
 * 用于描述元素的位置和尺寸信息，通常由 ResizeObserver 或 getBoundingClientRect 返回
 */
export interface Rect {
  /** 左边界位置 */
  left: number
  /** 上边界位置 */
  top: number
  /** 右边界位置 */
  right: number
  /** 下边界位置 */
  bottom: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** X 坐标（等同于 left） */
  x: number
  /** Y 坐标（等同于 top） */
  y: number
}

/**
 * 滚动事件数据接口
 * 包含滚动时的所有相关信息，用于滚动事件回调
 */
export interface ScrollEvent {
  /** 水平滚动距离（像素） */
  scrollLeft: number
  /** 垂直滚动距离（像素） */
  scrollTop: number
  /** 内容总宽度（包含不可见部分） */
  scrollWidth: number
  /** 内容总高度（包含不可见部分） */
  scrollHeight: number
  /** 可视区域宽度 */
  clientWidth: number
  /** 可视区域高度 */
  clientHeight: number
  /** 主要滚动方向，基于滚动增量计算 */
  direction: ScrollDirection
  /** 水平滚动增量（相对于上次滚动位置的变化量） */
  deltaX?: number
  /** 垂直滚动增量（相对于上次滚动位置的变化量） */
  deltaY?: number
}

// ==================== 组件 Props 类型 ====================

/**
 * 滚动条组件属性接口
 *
 * 定义 ScrollbarWrapper 组件接受的所有 props，基于 OverlayScrollbars v2 实现
 *
 * @example
 * ```vue
 * <!-- 基础使用 -->
 * <ScrollbarWrapper>
 *   <div>内容</div>
 * </ScrollbarWrapper>
 *
 * <!-- 自定义滚动方向和样式 -->
 * <ScrollbarWrapper
 *   direction="vertical"
 *   :size="8"
 *   :auto-hide="false"
 *   @scroll="handleScroll"
 * >
 *   <div>内容</div>
 * </ScrollbarWrapper>
 *
 * <!-- 记住滚动位置 -->
 * <ScrollbarWrapper
 *   :remember-scroll-position="true"
 *   scroll-position-key="my-scroll-key"
 * >
 *   <div>内容</div>
 * </ScrollbarWrapper>
 * ```
 */
export interface ScrollbarWrapperProps {
  /**
   * 包装器类名
   *
   * 应用于 OverlayScrollbarsComponent 的类名
   *
   * @default undefined
   * @example
   * - wrapper-class="custom-wrapper"
   */
  wrapperClass?: string | string[]

  /**
   * 包装器样式对象
   *
   * 应用于 OverlayScrollbarsComponent 的样式，会与内部 CSS 变量合并
   *
   * @default undefined
   * @example
   * - :wrapper-style="{ borderRadius: '8px' }"
   */
  wrapperStyle?: StyleValue

  /**
   * 内容容器类名
   *
   * 应用于内容容器的类名
   *
   * @default undefined
   * @example
   * - content-class="custom-content"
   */
  contentClass?: string | string[]

  /**
   * 内容容器样式对象
   *
   * 应用于内容容器的样式
   *
   * @default undefined
   * @example
   * - :content-style="{ padding: '16px' }"
   */
  contentStyle?: StyleValue

  /**
   * 滚动方向
   *
   * - 'horizontal': 仅水平滚动
   * - 'vertical': 仅垂直滚动
   * - 'both': 双向滚动（水平+垂直）
   *
   * @default 'vertical'
   * @example
   * - direction="vertical"
   * - direction="horizontal"
   * - direction="both"
   */
  direction?: ScrollDirection

  /**
   * 滚动条滑块尺寸（像素）
   *
   * 对应 OverlayScrollbars CSS 变量 `--os-handle-perpendicular-size`
   * - `0`: 使用动态计算（桌面端: 8px, 移动端: 4px）
   * - 其他数值: 直接使用指定像素值
   *
   * @default 0
   * @example
   * - :size="8" - 8px 滑块
   * - :size="4" - 4px 滑块（适合移动端）
   */
  size?: number

  /**
   * 鼠标悬停时的滑块尺寸（像素）
   *
   * 对应 CSS 变量 `--os-handle-perpendicular-size-hover`
   * - `0`: 使用 `size` 的值
   * - 其他数值: 使用指定像素值
   *
   * @default 0
   * @example
   * - :size-hover="10" - 悬停时显示 10px 滑块
   */
  sizeHover?: number

  /**
   * 激活/拖拽时的滑块尺寸（像素）
   *
   * 对应 CSS 变量 `--os-handle-perpendicular-size-active`
   * - `0`: 使用 `sizeHover` 或 `size` 的值
   * - 其他数值: 使用指定像素值
   *
   * @default 0
   * @example
   * - :size-active="12" - 激活时显示 12px 滑块
   */
  sizeActive?: number

  /**
   * 整个滚动条区域尺寸（像素）
   *
   * 对应 CSS 变量 `--os-size`
   * - `0`: 自动计算为 `size + 4px`
   * - 其他数值: 使用指定像素值
   *
   * @default 0
   * @example
   * - :track-size="12" - 滚动条轨道宽度 12px
   */
  trackSize?: number

  /**
   * 滚动条垂直于滚动方向的内边距（像素）
   *
   * 对应 CSS 变量 `--os-padding-perpendicular`
   * - `0`: 使用动态计算
   * - 其他数值: 使用指定像素值
   *
   * @default 0
   * @example
   * - :padding-perpendicular="2" - 2px 内边距
   */
  paddingPerpendicular?: number

  /**
   * 滚动条沿滚动方向的内边距（像素）
   *
   * 对应 CSS 变量 `--os-padding-axis`
   * - `0`: 使用动态计算
   * - 其他数值: 使用指定像素值
   *
   * @default 0
   * @example
   * - :padding-axis="2" - 2px 内边距
   */
  paddingAxis?: number

  /**
   * 是否启用点击滚动功能
   *
   * 启用后，点击滚动条轨道区域可以快速滚动到该位置
   *
   * @default true
   * @example
   * - :click-scroll="true" - 启用点击滚动
   * - :click-scroll="false" - 禁用点击滚动
   */
  clickScroll?: boolean

  /**
   * 是否自动隐藏滚动条，或指定自动隐藏行为
   *
   * - `true`: 使用默认的 'leave' 行为（鼠标离开时隐藏）
   * - `false`: 等同于 'never'（永不隐藏）
   * - `'scroll'`: 滚动时显示，停止后隐藏
   * - `'leave'`: 鼠标离开时隐藏
   * - `'move'`: 鼠标移动时显示，停止后隐藏
   * - `'never'`: 永不自动隐藏
   *
   * @default true
   * @example
   * - :auto-hide="false" - 永不隐藏
   * - auto-hide="never" - 永不隐藏
   * - auto-hide="scroll" - 滚动时显示
   */
  autoHide?: boolean | AutoHideBehavior

  /**
   * 自动隐藏延迟时间（毫秒）
   *
   * 滚动停止后多久开始隐藏滚动条，0 表示立即隐藏
   *
   * @default 0
   * @example
   * - :auto-hide-delay="300" - 300ms 后隐藏
   */
  autoHideDelay?: number

  /**
   * 滚动事件节流类型
   *
   * - `'throttle'`: 节流模式，固定时间间隔执行（推荐，性能更好）
   * - `'debounce'`: 防抖模式，等待指定时间后执行
   * - `'none'`: 不使用节流/防抖，每次滚动都触发（性能较差）
   *
   * @default 'throttle'
   * @example
   * - throttle-type="throttle" - 节流模式
   * - throttle-type="debounce" - 防抖模式
   */
  throttleType?: ThrottleType

  /**
   * 节流/防抖等待时间（毫秒）
   *
   * 推荐值：
   * - `16`: 约 60fps（默认值，适合大多数场景）
   * - `100`: 适合不需要频繁更新的场景
   *
   * @default 16
   * @example
   * - :throttle-wait="16" - 16ms（60fps）
   * - :throttle-wait="100" - 100ms
   */
  throttleWait?: number

  /**
   * 自定义颜色方案
   *
   * 用于自定义滚动条的颜色，支持滑块、轨道、边框在不同状态下的颜色配置
   * 如果不提供，则使用系统主题色
   *
   * @default undefined
   * @example
   * - :color-scheme="{ thumbColor: '#ff0000', trackColor: '#f0f0f0' }"
   */
  colorScheme?: ColorScheme

  /**
   * 自定义 OverlayScrollbars 选项配置
   *
   * 用于传入 OverlayScrollbars 的原生配置选项，会与组件内部配置合并
   * 详见 [OverlayScrollbars 文档](https://kingsora.github.io/OverlayScrollbars)
   *
   * @default undefined
   * @example
   * - :options="{ scrollbars: { autoHide: 'never' } }"
   */
  options?: PartialOptions

  /**
   * 当内容增加时是否自动滚动到底部
   *
   * 适用于聊天消息、日志等场景，新内容出现时自动滚动到底部
   *
   * @default true
   * @example
   * - :auto-scroll-to-bottom="true" - 自动滚动到底部
   * - :auto-scroll-to-bottom="false" - 不自动滚动
   */
  autoScrollToBottom?: boolean

  /**
   * 是否记住滚动位置
   *
   * 启用后，组件会在本地存储中保存滚动位置，下次渲染时自动恢复
   * 需要配合 `scrollPositionKey` 使用以确保唯一性
   *
   * @default false
   * @example
   * - :remember-scroll-position="true" - 记住滚动位置
   */
  rememberScrollPosition?: boolean

  /**
   * 滚动位置存储的唯一标识符
   *
   * 用于在本地存储中标识不同的滚动位置，确保不同场景的滚动位置互不干扰
   * 如果不提供，则使用组件实例的自动生成ID（基于路由路径）
   *
   * @default undefined
   * @example
   * - scroll-position-key="chat-messages" - 聊天消息的滚动位置
   * - scroll-position-key="article-content" - 文章内容的滚动位置
   */
  scrollPositionKey?: string
}

// ==================== 事件类型 ====================

/**
 * 滚动组件事件接口
 *
 * 定义 ScrollbarWrapper 组件发出的所有事件
 * 在 Vue 模板中使用 kebab-case 格式（如 @wrapper-resize、@scroll-horizontal）
 *
 * @example
 * ```vue
 * <ScrollbarWrapper
 *   @scroll="handleScroll"
 *   @scroll-start="handleScrollStart"
 *   @scroll-end="handleScrollEnd"
 *   @wrapper-resize="handleWrapperResize"
 *   @initialized="handleInitialized"
 * >
 *   <div>内容</div>
 * </ScrollbarWrapper>
 * ```
 */
export interface ScrollbarEmits {
  /**
   * 包装器大小改变事件
   *
   * 当包装器尺寸发生变化时触发（通过 ResizeObserver 监听）
   *
   * @param rect 包装器的新尺寸和位置信息
   * @example
   * ```vue
   * <ScrollbarWrapper @wrapper-resize="(rect) => console.log(rect.width, rect.height)">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  wrapperResize: (rect: Rect) => void

  /**
   * 内容大小改变事件
   *
   * 当内容尺寸发生变化时触发（通过 ResizeObserver 监听）
   *
   * @param rect 内容容器的新尺寸和位置信息
   * @example
   * ```vue
   * <ScrollbarWrapper @content-resize="handleContentResize">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  contentResize: (rect: Rect) => void

  /**
   * 容器点击事件
   *
   * 仅在点击容器空白区域时触发（使用 @click.self）
   *
   * @param event 鼠标事件对象
   * @example
   * ```vue
   * <ScrollbarWrapper @container-click="handleContainerClick">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  containerClick: (event: MouseEvent) => void

  /**
   * 通用滚动事件
   *
   * 每次滚动时都会触发，包含完整的滚动信息
   * 注意：会根据 `throttleType` 进行节流/防抖处理
   *
   * @param event 滚动事件数据
   * @example
   * ```vue
   * <ScrollbarWrapper @scroll="(event) => console.log(event.scrollTop)">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  scroll: (event: ScrollEvent) => void

  /**
   * 水平滚动事件
   *
   * 仅在水平方向滚动时触发
   *
   * @param event 滚动事件数据
   * @example
   * ```vue
   * <ScrollbarWrapper @scroll-horizontal="handleHorizontalScroll">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  scrollHorizontal: (event: ScrollEvent) => void

  /**
   * 垂直滚动事件
   *
   * 仅在垂直方向滚动时触发
   *
   * @param event 滚动事件数据
   * @example
   * ```vue
   * <ScrollbarWrapper @scroll-vertical="handleVerticalScroll">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  scrollVertical: (event: ScrollEvent) => void

  /**
   * 滚动开始事件
   *
   * 滚动开始时触发一次
   *
   * @example
   * ```vue
   * <ScrollbarWrapper @scroll-start="handleScrollStart">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  scrollStart: () => void

  /**
   * 滚动结束事件
   *
   * 滚动停止后触发（通过防抖延迟检测）
   *
   * @example
   * ```vue
   * <ScrollbarWrapper @scroll-end="handleScrollEnd">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  scrollEnd: () => void

  /**
   * OverlayScrollbars 初始化完成事件
   *
   * 组件初始化完成后触发，可以在此事件中获取 OverlayScrollbars 实例
   *
   * @param instance OverlayScrollbars 实例
   * @example
   * ```vue
   * <ScrollbarWrapper @initialized="(instance) => console.log('初始化完成', instance)">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  initialized: (instance: OverlayScrollbars) => void

  /**
   * OverlayScrollbars 更新事件
   *
   * 配置更新后触发
   *
   * @param instance OverlayScrollbars 实例
   * @example
   * ```vue
   * <ScrollbarWrapper @updated="handleUpdated">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  updated: (instance: OverlayScrollbars) => void

  /**
   * OverlayScrollbars 销毁事件
   *
   * 组件销毁时触发，用于清理资源
   *
   * @example
   * ```vue
   * <ScrollbarWrapper @destroyed="handleDestroyed">
   *   <div>内容</div>
   * </ScrollbarWrapper>
   * ```
   */
  destroyed: () => void
}

// ==================== 暴露方法类型 ====================

/**
 * 滚动组件暴露的方法接口
 *
 * 定义 ScrollbarWrapper 组件通过 defineExpose 暴露给父组件的方法和属性
 * 可以通过模板 ref 访问这些方法和属性
 *
 * @example
 * ```vue
 * <template>
 *   <ScrollbarWrapper ref="scrollbarRef">
 *     <div>内容</div>
 *   </ScrollbarWrapper>
 * </template>
 *
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import type { ScrollbarExposed } from '@/components/modules/scrollbar-wrapper'
 *
 * const scrollbarRef = ref<ScrollbarExposed>()
 *
 * // 滚动到底部
 * scrollbarRef.value?.scrollToBottom('smooth')
 *
 * // 获取滚动实例
 * const instance = scrollbarRef.value?.getOverlayScrollbars()
 * </script>
 * ```
 */
export interface ScrollbarExposed {
  /**
   * OverlayScrollbars 实例引用
   *
   * 用于直接访问 Vue 组件实例（OverlayScrollbarsComponent）
   */
  overlayScrollbarsRef: Ref<any>

  /**
   * 获取 OverlayScrollbars 实例
   *
   * 返回当前滚动条实例，如果尚未初始化则返回 null
   *
   * @returns OverlayScrollbars 实例或 null
   * @example
   * ```typescript
   * const instance = scrollbarRef.value?.getOverlayScrollbars()
   * if (instance) {
   *   instance.scroll({ top: 100 })
   * }
   * ```
   */
  getOverlayScrollbars: () => OverlayScrollbars | null

  /**
   * 获取滚动元素
   *
   * 返回实际的滚动 DOM 元素（viewport 元素）
   *
   * @returns 滚动 DOM 元素或 null
   * @example
   * ```typescript
   * const scrollEl = scrollbarRef.value?.getScrollEl()
   * if (scrollEl) {
   *   console.log(scrollEl.scrollTop)
   * }
   * ```
   */
  getScrollEl: () => HTMLElement | null

  /**
   * 获取视口元素
   *
   * 返回 OverlayScrollbars 的视口元素
   *
   * @returns 视口 DOM 元素或 null
   */
  getViewport: () => HTMLElement | null

  /**
   * 获取内容元素
   *
   * 返回 OverlayScrollbars 的内容元素
   *
   * @returns 内容 DOM 元素或 null
   */
  getContent: () => HTMLElement | null

  /**
   * 滚动到指定位置
   *
   * 支持 ScrollToOptions 参数，可以同时指定位置和滚动行为
   *
   * @param options 滚动选项（left、top、behavior）
   * @example
   * ```typescript
   * scrollbarRef.value?.scrollTo({ top: 100, behavior: 'smooth' })
   * scrollbarRef.value?.scrollTo({ left: 50, top: 100 })
   * ```
   */
  scrollTo: (options: ScrollToOptions) => void

  /**
   * 滚动到顶部
   *
   * @param behavior 滚动行为，可选值：'smooth' | 'instant' | 'auto'
   * @default 'auto'
   * @example
   * ```typescript
   * scrollbarRef.value?.scrollToTop('smooth')
   * scrollbarRef.value?.scrollToTop()
   * ```
   */
  scrollToTop: (behavior?: ScrollBehavior) => void

  /**
   * 滚动到底部
   *
   * @param behavior 滚动行为，可选值：'smooth' | 'instant' | 'auto'
   * @default 'auto'
   * @example
   * ```typescript
   * scrollbarRef.value?.scrollToBottom('smooth')
   * ```
   */
  scrollToBottom: (behavior?: ScrollBehavior) => void

  /**
   * 滚动到左侧
   *
   * @param behavior 滚动行为，可选值：'smooth' | 'instant' | 'auto'
   * @default 'auto'
   * @example
   * ```typescript
   * scrollbarRef.value?.scrollToLeft('smooth')
   * ```
   */
  scrollToLeft: (behavior?: ScrollBehavior) => void

  /**
   * 滚动到右侧
   *
   * @param behavior 滚动行为，可选值：'smooth' | 'instant' | 'auto'
   * @default 'auto'
   * @example
   * ```typescript
   * scrollbarRef.value?.scrollToRight('smooth')
   * ```
   */
  scrollToRight: (behavior?: ScrollBehavior) => void

  /**
   * 添加滚动监听器
   *
   * 手动添加滚动事件监听（通常在移除后需要重新添加时使用）
   *
   * @example
   * ```typescript
   * scrollbarRef.value?.addScrollListener()
   * ```
   */
  addScrollListener: () => void

  /**
   * 移除滚动监听器
   *
   * 手动移除滚动事件监听（通常在需要临时禁用滚动事件时使用）
   *
   * @example
   * ```typescript
   * scrollbarRef.value?.removeScrollListener()
   * ```
   */
  removeScrollListener: () => void

  /**
   * 更新 OverlayScrollbars 选项
   *
   * 动态修改滚动条配置，会触发 OverlayScrollbars 的更新
   *
   * @param options OverlayScrollbars 配置选项
   * @example
   * ```typescript
   * scrollbarRef.value?.updateOptions({
   *   scrollbars: { autoHide: 'never' }
   * })
   * ```
   */
  updateOptions: (options: PartialOptions) => void

  /**
   * 销毁 OverlayScrollbars 实例
   *
   * 清理资源，通常在组件卸载时调用
   *
   * @example
   * ```typescript
   * scrollbarRef.value?.destroy()
   * ```
   */
  destroy: () => void

  /**
   * 保存当前滚动位置到本地存储
   *
   * 手动保存滚动位置，通常不需要手动调用（组件会自动保存）
   *
   * @example
   * ```typescript
   * scrollbarRef.value?.saveScrollPosition()
   * ```
   */
  saveScrollPosition: () => void

  /**
   * 从本地存储恢复滚动位置
   *
   * 手动恢复滚动位置，通常不需要手动调用（组件会自动恢复）
   *
   * @param callback 恢复完成后的回调函数
   * @example
   * ```typescript
   * scrollbarRef.value?.restoreScrollPosition(() => {
   *   console.log('滚动位置已恢复')
   * })
   * ```
   */
  restoreScrollPosition: (callback?: () => void) => void

  /**
   * 清除滚动位置记忆
   *
   * 清除本地存储中保存的滚动位置
   *
   * @example
   * ```typescript
   * scrollbarRef.value?.clearScrollPosition()
   * ```
   */
  clearScrollPosition: () => void

  /**
   * 滚动位置存储的唯一标识符
   *
   * 用于在本地存储中标识滚动位置，可以在外部修改或读取
   */
  scrollPositionKey: Ref<string>
}

// ==================== 颜色方案类型 ====================

/**
 * 自定义颜色方案接口
 *
 * 定义滚动条各个状态下的颜色配置，支持所有 CSS 颜色值格式
 * 如果不提供，组件会使用系统主题色
 *
 * @example
 * ```typescript
 * const colorScheme: ColorScheme = {
 *   thumbColor: '#3b82f6',
 *   thumbHoverColor: '#2563eb',
 *   thumbActiveColor: '#1d4ed8',
 *   trackColor: 'rgba(0, 0, 0, 0.05)',
 *   trackHoverColor: 'rgba(0, 0, 0, 0.1)',
 * }
 * ```
 */
export interface ColorScheme {
  /**
   * 滚动条滑块默认颜色
   *
   * 支持所有 CSS 颜色值格式（hex、rgb、rgba、hsl、颜色名称、CSS 变量等）
   *
   * @default undefined（使用系统主题色）
   * @example
   * - thumbColor: '#3b82f6'
   * - thumbColor: 'rgb(59, 130, 246)'
   * - thumbColor: 'var(--primary-color)'
   */
  thumbColor?: string

  /**
   * 滚动条滑块悬停时的颜色
   *
   * 鼠标悬停在滚动条上时显示的颜色
   *
   * @default undefined（使用 thumbColor 或系统主题色）
   * @example
   * - thumbHoverColor: '#2563eb'
   */
  thumbHoverColor?: string

  /**
   * 滚动条滑块激活时的颜色
   *
   * 拖拽滚动条时显示的颜色
   *
   * @default undefined（使用 thumbHoverColor 或 thumbColor）
   * @example
   * - thumbActiveColor: '#1d4ed8'
   */
  thumbActiveColor?: string

  /**
   * 滚动条轨道默认颜色
   *
   * 滚动条背景轨道的颜色
   *
   * @default undefined（使用系统主题色）
   * @example
   * - trackColor: 'rgba(0, 0, 0, 0.05)'
   */
  trackColor?: string

  /**
   * 滚动条轨道悬停时的颜色
   *
   * 鼠标悬停在轨道上时显示的颜色
   *
   * @default undefined（使用 trackColor）
   * @example
   * - trackHoverColor: 'rgba(0, 0, 0, 0.1)'
   */
  trackHoverColor?: string

  /**
   * 滚动条轨道激活时的颜色
   *
   * 轨道被激活时显示的颜色
   *
   * @default undefined（使用 trackHoverColor 或 trackColor）
   * @example
   * - trackActiveColor: 'rgba(0, 0, 0, 0.15)'
   */
  trackActiveColor?: string

  /**
   * 滚动条边框默认颜色
   *
   * 滚动条边框的颜色
   *
   * @default undefined（使用系统主题色）
   * @example
   * - borderColor: 'rgba(0, 0, 0, 0.1)'
   */
  borderColor?: string

  /**
   * 滚动条悬停时的边框颜色
   *
   * 鼠标悬停时滚动条边框的颜色
   *
   * @default undefined（使用 borderColor）
   * @example
   * - borderHoverColor: 'rgba(0, 0, 0, 0.2)'
   */
  borderHoverColor?: string

  /**
   * 滚动条激活时的边框颜色
   *
   * 滚动条被激活时边框的颜色
   *
   * @default undefined（使用 borderHoverColor 或 borderColor）
   * @example
   * - borderActiveColor: 'rgba(0, 0, 0, 0.3)'
   */
  borderActiveColor?: string
}
