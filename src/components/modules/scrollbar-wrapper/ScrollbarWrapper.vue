<script setup lang="ts">
/**
 * ScrollbarWrapper 组件
 * 基于 OverlayScrollbars v2 的滚动条包装器组件
 * 完全使用 CSS 变量来控制滚动条样式，避免直接操作 DOM
 */
import { debounce, throttle } from '@/common'
import { INTERVAL, STRATEGY } from '@/constants/modules/layout'
import { useColorStore, useLayoutStore } from '@/stores'
import { env } from '@/utils/modules/env'
import { OverlayScrollbars } from 'overlayscrollbars'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import type { StyleValue } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, onUpdated, ref, useAttrs, watch } from 'vue'
import { defaultProps, getDeviceConfig, mergeOptions } from './utils/constants'
import type { Rect, ScrollbarExposed, ScrollbarWrapperProps, ScrollEvent } from './utils/types'

const layoutStore = useLayoutStore()
const colorStore = useColorStore()
const $attrs = useAttrs()

// 禁用默认的属性继承，手动控制 class 和 style 的继承
defineOptions({
  inheritAttrs: false,
})

// 定义属性和默认值
// 注意：class 和 style 不作为 props，它们会通过 $attrs 自动继承到根元素
const props = withDefaults(defineProps<ScrollbarWrapperProps>(), {
  ...defaultProps,
  // 为对象/函数类型的 props 提供默认值
  wrapperStyle: () => ({}),
  contentStyle: () => ({}),
  colorScheme: () => ({}),
  options: () => ({}),
  // 为可选字符串/数组类型的 props 提供默认值（解决类型推断问题）
  wrapperClass: undefined,
  contentClass: undefined,
})

// 组件引用
const overlayScrollbarsRef = ref<any>()
const scrollbarInstance = ref<OverlayScrollbars | null>(null)

// 滚动位置记忆相关
const scrollPositionKey = ref<string>('')
// 新增状态：标记是否正在执行滚动位置恢复
const isRestoringScroll = ref(false)
// 标记是否需要恢复滚动位置
const needsRestore = ref(false)
// 用于检测内容是否稳定的上一次 scrollHeight
let lastStableScrollHeight = 0

// 初始化滚动位置 key
const initScrollPositionKey = () => {
  const prefix = env.piniaKeyPrefix || ''

  if (props.scrollPositionKey) {
    scrollPositionKey.value = `${prefix}-${props.scrollPositionKey}`
  } else {
    // 生成一个稳定的 key，基于当前路由
    const route = window.location.pathname
    const baseKey = `scroll-${route.replace(/\//g, '-')}-default`
    scrollPositionKey.value = `${prefix} -${baseKey}`
  }
}

// ==================== 配置计算 ====================

// ==================== 配置计算 ====================

// 动态计算滚动条配置
const computedScrollbarConfig: any = computed(() => {
  const baseConfig: any = {
    scrollbars: {
      // 简化后的逻辑：false -> 'never', true -> 'leave', 字符串 -> 直接使用
      autoHide: props.autoHide === false ? 'never' : props.autoHide || 'leave',

      autoHideDelay: props.autoHideDelay || 0,
      clickScroll: props.clickScroll !== false,
      dragScroll: true,
      pointers: ['mouse', 'touch', 'pen'],
    },
    // ... 其他配置保持不变
    overflow: {
      x: props.direction === 'vertical' ? 'hidden' : 'scroll',
      y: props.direction === 'horizontal' ? 'hidden' : 'scroll',
    },
  }

  return mergeOptions(baseConfig, props.options)
})

// 定义事件
const emit = defineEmits<{
  'wrapper-resize': [rect: Rect]
  'content-resize': [rect: Rect]
  scroll: [event: ScrollEvent]
  'scroll-horizontal': [event: ScrollEvent]
  'scroll-vertical': [event: ScrollEvent]
  'scroll-start': []
  'scroll-end': []
  'container-click': [event: MouseEvent]
  initialized: [instance: OverlayScrollbars]
  updated: [instance: OverlayScrollbars]
  destroyed: []
}>()

// ==================== OverlayScrollbars CSS 变量 ====================

// 动态计算 OverlayScrollbars 的 CSS 变量
const overlayScrollbarsCssVars = computed(() => {
  // 颜色变量 - 从 colorStore 获取
  const handleBg = props.colorScheme?.thumbColor || colorStore.getBg300
  const handleBgHover = props.colorScheme?.thumbHoverColor || colorStore.getPrimary200
  const handleBgActive = props.colorScheme?.thumbActiveColor || colorStore.getPrimary100
  const trackBg = props.colorScheme?.trackColor || colorStore.getBg100
  const trackBgHover = props.colorScheme?.trackHoverColor || colorStore.getBg200
  const trackBgActive = props.colorScheme?.trackActiveColor || colorStore.getBg300

  // 尺寸变量
  const handleSize = scrollbarHandleSize.value
  const handleSizeHover = scrollbarHandleSizeHover.value
  const handleSizeActive = scrollbarHandleSizeActive.value
  const trackSizeValue = scrollbarTrackSize.value
  const paddingPerp = scrollbarPaddingPerpendicular.value
  const paddingAxisValue = scrollbarPaddingAxis.value

  const vars = {
    // 使用 --custom-os- 前缀，避免被 OverlayScrollbars 默认主题覆盖
    // 颜色变量
    '--custom-os-handle-bg': handleBg,
    '--custom-os-handle-bg-hover': handleBgHover,
    '--custom-os-handle-bg-active': handleBgActive,
    '--custom-os-track-bg': trackBg,
    '--custom-os-track-bg-hover': trackBgHover,
    '--custom-os-track-bg-active': trackBgActive,

    // 尺寸变量（符合 OverlayScrollbars v2 官方规范）
    // --os-size: 整个滚动条区域的尺寸（垂直滚动条的宽度）
    '--custom-os-size': trackSizeValue,
    // --os-handle-perpendicular-size: 滑块默认状态的尺寸（垂直滚动条 = 滑块宽度）
    '--custom-os-handle-perpendicular-size': handleSize,
    // --os-handle-perpendicular-size-hover: 滑块悬停状态的尺寸
    '--custom-os-handle-perpendicular-size-hover': handleSizeHover,
    // --os-handle-perpendicular-size-active: 滑块激活/拖拽状态的尺寸
    '--custom-os-handle-perpendicular-size-active': handleSizeActive,
    // --os-padding-perpendicular: 垂直于滚动方向的内边距（垂直滚动条的左右内边距）
    '--custom-os-padding-perpendicular': paddingPerp,
    // --os-padding-axis: 沿滚动方向的内边距（垂直滚动条的上下内边距）
    '--custom-os-padding-axis': paddingAxisValue,

    // 形状变量
    '--custom-os-handle-border-radius': '20px',
    '--custom-os-track-border-radius': '20px',
    '--custom-os-handle-min-size': '20px',
    '--custom-os-handle-max-size': 'none',

    // 边框变量
    '--custom-os-handle-border': 'none',
    '--custom-os-track-border': 'none',
  }

  return vars
})

// 注意：CSS 变量通过 computed 自动响应式更新，并通过 :style 绑定到组件
// 无需手动监听主题变化，Vue 会自动处理响应式更新

// 处理 $attrs 中的 class 和 style（避免在模板中使用类型断言触发过滤器警告）
const rootClass = computed(() => {
  const baseClass = props.direction === 'vertical' ? 'is-vertical' : 'is-horizontal'
  const attrsClass = $attrs.class
  if (!attrsClass) {
    return baseClass
  }
  return [baseClass, attrsClass]
})

const rootStyle = computed(() => {
  return ($attrs.style as StyleValue | undefined) || undefined
})

// 过滤掉 class 和 style，避免传递给 OverlayScrollbarsComponent
// 这些属性已经通过 rootClass 和 rootStyle 应用到根元素了
const filteredAttrs = computed(() => {
  // 从 $attrs 中解构并排除 class 和 style
  const { class: _unusedClass, style: _unusedStyle, ...rest } = $attrs
  return rest
})

// ==================== 尺寸计算 ====================

// 设备配置 computed（统一管理，避免重复计算）
const deviceConfig = computed(() => getDeviceConfig(layoutStore.getIsMobile))

// 计算滚动条滑块尺寸（handle/thumb 的宽度 - 默认状态）
const scrollbarHandleSize = computed(() => {
  if (typeof props.size === 'number' && props.size > 0) {
    return `${props.size}px`
  }
  return `${deviceConfig.value.size}px`
})

// 计算滚动条滑块尺寸（悬停状态）
const scrollbarHandleSizeHover = computed(() => {
  if (typeof props.sizeHover === 'number' && props.sizeHover > 0) {
    return `${props.sizeHover}px`
  }
  // 如果没有设置 sizeHover，默认使用 size 的值
  return scrollbarHandleSize.value
})

// 计算滚动条滑块尺寸（激活/拖拽状态）
const scrollbarHandleSizeActive = computed(() => {
  if (typeof props.sizeActive === 'number' && props.sizeActive > 0) {
    return `${props.sizeActive}px`
  }
  // 如果没有设置 sizeActive，使用 sizeHover 的值
  return scrollbarHandleSizeHover.value
})

// 计算滚动条轨道尺寸（整个滚动条区域的宽度，对应 --os-size）
const scrollbarTrackSize = computed(() => {
  if (typeof props.trackSize === 'number' && props.trackSize > 0) {
    return `${props.trackSize}px`
  }
  // 如果没有设置轨道尺寸，自动计算
  // 获取滑块尺寸
  const handleSize =
    typeof props.size === 'number' && props.size > 0 ? props.size : deviceConfig.value.size

  // 获取 padding 值（左右各一个）
  const paddingPerp =
    typeof props.paddingPerpendicular === 'number' && props.paddingPerpendicular > 0
      ? props.paddingPerpendicular
      : deviceConfig.value.paddingPerpendicular

  // 轨道尺寸 = 滑块尺寸 + 左右 padding
  // 由于 padding 在滑块两侧，所以需要 * 2
  return `${handleSize + paddingPerp * 2}px`
})

// 计算滚动条填充 - 垂直方向（perpendicular）
const scrollbarPaddingPerpendicular = computed(() => {
  if (props.paddingPerpendicular > 0) {
    return `${props.paddingPerpendicular}px`
  }
  return `${deviceConfig.value.paddingPerpendicular}px`
})

// 计算滚动条填充 - 轴方向（axis）
const scrollbarPaddingAxis = computed(() => {
  if (props.paddingAxis > 0) {
    return `${props.paddingAxis}px`
  }
  return `${deviceConfig.value.paddingAxis}px`
})

// ==================== 滚动状态管理 ====================

let scrollTimer: NodeJS.Timeout | null = null
let saveScrollTimer: NodeJS.Timeout | null = null
let lastScrollLeft = 0
let lastScrollTop = 0
let isScrolling = false

// 自动滚动到底部相关状态
let contentObserver: ResizeObserver | null = null
let mutationObserver: MutationObserver | null = null
let lastContentHeight = 0
let isUserScrolling = false
let userScrollTimer: NodeJS.Timeout | null = null

// 恢复后内容增长监听相关状态
let restoreAfterGrowthObserver: ResizeObserver | null = null
let restoreAfterGrowthTimer: NodeJS.Timeout | null = null

// ==================== 节流/防抖函数 ====================

// 节流/防抖函数包装器（在 setup 顶层创建一次，避免重复创建）
const throttleFunction = (() => {
  const wait = INTERVAL
  const mode = STRATEGY
  if (mode === 'throttle') {
    return (func: (...args: any[]) => void) => throttle(func, wait)
  }
  if (mode === 'debounce') {
    return (func: (...args: any[]) => void) => debounce(func, wait)
  }
  return (func: (...args: any[]) => void) => func
})()

// ==================== 滚动位置记忆 (持久化存储) ====================

// ✅ 修改 1：使用 layout store 保存滚动位置
const saveScrollPosition = () => {
  if (!props.rememberScrollPosition) {
    return
  }

  const scrollEl = getScrollEl()
  if (scrollEl) {
    const { scrollLeft, scrollTop, scrollHeight, clientHeight, scrollWidth, clientWidth } = scrollEl
    try {
      const maxScrollTop = scrollHeight - clientHeight
      const maxScrollLeft = scrollWidth - clientWidth

      // ✅ 优化：始终保存距离底部的距离（优先使用相对位置）
      const distanceFromBottom = maxScrollTop - scrollTop
      const distanceFromRight = maxScrollLeft - scrollLeft

      // ✅ 优化：isAtBottom 仅作为兼容性标记，优先使用 distanceFromBottom
      // 如果距离底部 < 20px，视为"在底部"
      const isAtBottom = distanceFromBottom < 20
      const isAtRight = distanceFromRight < 20

      const position = {
        scrollLeft,
        scrollTop,
        isAtBottom, // 兼容性标记（距离底部 < 20px）
        isAtRight, // 兼容性标记（距离右侧 < 20px）
        scrollHeight, // 保存时的内容高度，用于参考
        clientHeight, // 保存时的可视高度，用于参考
        distanceFromBottom, // 距离底部的距离（像素）- 优先使用
        distanceFromRight, // 距离右侧的距离（像素）- 优先使用
      }
      // ✅ 使用 layout store 存储滚动位置
      layoutStore.setScrollPosition(scrollPositionKey.value, position)
    } catch (e) {
      console.error('❌ [ScrollbarWrapper] 存储滚动位置失败:', e)
    }
  }
}

// ✅ 重构后的滚动位置恢复函数（移除 setTimeout 重试机制）
const restoreScrollPosition = (onFinished?: () => void) => {
  if (!props.rememberScrollPosition) {
    onFinished?.()
    return
  }

  const savedPosition = getSavedScrollPosition()
  if (!savedPosition) {
    onFinished?.()
    return
  }

  const scrollEl = getScrollEl()
  if (!scrollEl) {
    onFinished?.()
    return
  }

  // 强制更新，确保 scrollHeight 等尺寸为最新值
  scrollbarInstance.value?.update(true)

  const { scrollHeight, clientHeight, scrollWidth, clientWidth } = scrollEl
  const maxScrollTop = scrollHeight - clientHeight
  const maxScrollLeft = scrollWidth - clientWidth

  // ✅ 优化：优先使用 distanceFromBottom/distanceFromRight 进行相对位置恢复
  const savedDistanceFromBottom = savedPosition.distanceFromBottom ?? 0
  const savedDistanceFromRight = savedPosition.distanceFromRight ?? 0
  const savedScrollTop = savedPosition.scrollTop || 0
  const savedScrollLeft = savedPosition.scrollLeft || 0

  // 计算恢复位置
  let restoreScrollTop = savedScrollTop
  let restoreScrollLeft = savedScrollLeft

  // ✅ 优化：优先使用 distanceFromBottom（如果 < 20px，视为在底部）
  if (savedDistanceFromBottom < 20 && maxScrollTop >= 0) {
    // 视为"在底部"，直接滚动到底部
    restoreScrollTop = maxScrollTop
  } else if (savedDistanceFromBottom >= 0) {
    // 使用相对位置恢复
    const calculatedScrollTop = maxScrollTop - savedDistanceFromBottom
    if (calculatedScrollTop >= 0 && calculatedScrollTop <= maxScrollTop) {
      restoreScrollTop = calculatedScrollTop
    } else if (restoreScrollTop > maxScrollTop) {
      restoreScrollTop = maxScrollTop
    }
  } else if (restoreScrollTop > maxScrollTop) {
    restoreScrollTop = maxScrollTop
  }

  // ✅ 优化：优先使用 distanceFromRight（如果 < 20px，视为在右侧）
  if (savedDistanceFromRight < 20 && maxScrollLeft >= 0) {
    // 视为"在右侧"，直接滚动到右侧
    restoreScrollLeft = maxScrollLeft
  } else if (savedDistanceFromRight >= 0) {
    // 使用相对位置恢复
    const calculatedScrollLeft = maxScrollLeft - savedDistanceFromRight
    if (calculatedScrollLeft >= 0 && calculatedScrollLeft <= maxScrollLeft) {
      restoreScrollLeft = calculatedScrollLeft
    } else if (restoreScrollLeft > maxScrollLeft) {
      restoreScrollLeft = maxScrollLeft
    }
  } else if (restoreScrollLeft > maxScrollLeft) {
    restoreScrollLeft = maxScrollLeft
  }

  // 执行滚动恢复
  scrollEl.scrollTo({
    left: restoreScrollLeft,
    top: restoreScrollTop,
    behavior: 'instant',
  })

  // 等待滚动完成后再执行回调
  requestAnimationFrame(() => {
    onFinished?.()
  })
}

// ✅ 读取已保存的滚动位置（从 layout store 读取）
const getSavedScrollPosition = (): {
  scrollLeft: number
  scrollTop: number
  isAtBottom?: boolean
  isAtRight?: boolean
  scrollHeight?: number
  clientHeight?: number
  distanceFromBottom?: number
  distanceFromRight?: number
} | null => {
  try {
    // ✅ 使用 layout store 读取滚动位置
    return layoutStore.getScrollPosition(scrollPositionKey.value)
  } catch (error) {
    console.error('❌ [ScrollbarWrapper] 读取滚动位置失败:', error)
    return null
  }
}

// ✅ 修改 3：清除 layout store 中的滚动位置记忆
const clearScrollPosition = () => {
  if (props.rememberScrollPosition) {
    try {
      layoutStore.clearScrollPosition(scrollPositionKey.value)
    } catch (e) {
      console.error('❌ [ScrollbarWrapper] 清除滚动位置失败:', e)
    }
  }
}

// ==================== 自动滚动到底部 ====================

// 检查是否应该自动滚动到底部
const shouldAutoScrollToBottom = () => {
  if (!props.autoScrollToBottom) {
    return false
  }

  const scrollEl = getScrollEl()
  if (!scrollEl) {
    return false
  }

  // 如果用户正在手动滚动，则不自动滚动
  if (isUserScrolling) {
    return false
  }

  // 检查是否已经在底部附近（允许 10px 误差）
  const { scrollTop, scrollHeight, clientHeight } = scrollEl
  return scrollTop + clientHeight >= scrollHeight - 10
}

// 自动滚动到底部
const autoScrollToBottom = () => {
  if (!shouldAutoScrollToBottom()) {
    return
  }

  const scrollEl = getScrollEl()
  if (scrollEl) {
    scrollEl.scrollTo({
      top: scrollEl.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// ==================== 滚动事件处理 ====================

// 处理滚动事件（使用预创建的节流/防抖函数）
const handleScroll = throttleFunction((event: Event) => {
  const scrollEl = event.target as HTMLElement
  if (!scrollEl) {
    return
  }

  const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = scrollEl

  // 计算滚动方向和距离
  const deltaX = scrollLeft - lastScrollLeft
  const deltaY = scrollTop - lastScrollTop

  // 检测用户是否在手动滚动
  if (deltaX !== 0 || deltaY !== 0) {
    isUserScrolling = true

    if (userScrollTimer) {
      clearTimeout(userScrollTimer)
    }

    // 1秒后认为用户停止手动滚动
    userScrollTimer = setTimeout(() => {
      isUserScrolling = false
    }, 1000)
  }

  // 确定滚动方向
  let direction: 'horizontal' | 'vertical' | 'both' = 'both'
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    direction = 'horizontal'
  } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
    direction = 'vertical'
  }

  // 构造滚动事件数据
  const scrollEventData: ScrollEvent = {
    scrollLeft,
    scrollTop,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
    direction,
    deltaX,
    deltaY,
  }

  // 触发滚动开始事件（仅在第一次滚动时触发）
  if (!isScrolling && (deltaX !== 0 || deltaY !== 0)) {
    isScrolling = true
    emit('scroll-start')
  }

  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }

  // 抛出滚动事件
  emit('scroll', scrollEventData)

  if (deltaX !== 0) {
    emit('scroll-horizontal', scrollEventData)
  }
  if (deltaY !== 0) {
    emit('scroll-vertical', scrollEventData)
  }

  // 设置滚动结束检测定时器（使用全局间隔）
  scrollTimer = setTimeout(() => {
    if (isScrolling) {
      isScrolling = false
      emit('scroll-end')
    }
  }, INTERVAL)

  // 更新上次滚动位置（即使在恢复状态也要更新，用于计算 delta）
  lastScrollLeft = scrollLeft
  lastScrollTop = scrollTop

  // 保存滚动位置（防抖处理，避免频繁保存）
  if (props.rememberScrollPosition) {
    // ✅ 关键检查：如果在恢复状态，则不保存滚动位置
    if (isRestoringScroll.value) {
      // 在恢复期间，禁止任何保存操作覆盖正确的记忆位置
      // 但不影响其他滚动事件处理（如 emit 事件、更新位置等）
      return
    }

    if (saveScrollTimer) {
      clearTimeout(saveScrollTimer)
    }
    saveScrollTimer = setTimeout(() => {
      saveScrollPosition()
    }, INTERVAL) // 使用全局间隔，避免频繁操作
  }
})

// ==================== 尺寸变化处理 ====================

const handleWrapperResize = (rect: Rect) => {
  emit('wrapper-resize', rect)
}

const handleContentResize = (rect: Rect) => {
  emit('content-resize', rect)
}

// ==================== 内容变化监听 ====================

// 设置内容变化监听器
const setupContentChangeListeners = (instance: OverlayScrollbars) => {
  if (!props.autoScrollToBottom) {
    return
  }

  const contentEl = instance.elements().content
  if (!contentEl) {
    return
  }

  // 初始化内容高度
  lastContentHeight = contentEl.scrollHeight

  // 设置 ResizeObserver 监听内容尺寸变化
  if (typeof ResizeObserver !== 'undefined') {
    contentObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newHeight = entry.target.scrollHeight

        // 如果内容高度增加，触发自动滚动
        if (newHeight > lastContentHeight) {
          lastContentHeight = newHeight
          nextTick(() => {
            setTimeout(() => {
              autoScrollToBottom()
            }, 50)
          })
        } else {
          lastContentHeight = newHeight
        }
      }
    })
    contentObserver.observe(contentEl)
  }

  // 设置 MutationObserver 监听DOM变化
  if (typeof MutationObserver !== 'undefined') {
    mutationObserver = new MutationObserver(mutations => {
      let shouldCheckScroll = false

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheckScroll = true
          break
        }

        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName
          if (attrName === 'style' || attrName === 'class') {
            shouldCheckScroll = true
            break
          }
        }
      }

      if (shouldCheckScroll) {
        nextTick(() => {
          setTimeout(() => {
            const newHeight = contentEl.scrollHeight
            if (newHeight > lastContentHeight) {
              lastContentHeight = newHeight
              autoScrollToBottom()
            }
          }, 50)
        })
      }
    })

    mutationObserver.observe(contentEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    })
  }
}

// 清理内容变化监听器
const cleanupContentChangeListeners = () => {
  if (contentObserver) {
    contentObserver.disconnect()
    contentObserver = null
  }

  if (mutationObserver) {
    mutationObserver.disconnect()
    mutationObserver = null
  }
}

const handleClickSelf = (event: MouseEvent) => {
  emit('container-click', event)
}

// ==================== OverlayScrollbars 事件处理 ====================

// ✅ 恢复后继续监听内容增长，如果内容继续增长则重新恢复位置
const setupRestoreAfterContentGrowth = (instance: OverlayScrollbars) => {
  if (!props.rememberScrollPosition) {
    return
  }

  const viewport = instance.elements().viewport
  const contentEl = instance.elements().content
  if (!viewport || !contentEl) {
    return
  }

  // 清理之前的监听器
  if (restoreAfterGrowthObserver) {
    restoreAfterGrowthObserver.disconnect()
    restoreAfterGrowthObserver = null
  }
  if (restoreAfterGrowthTimer) {
    clearTimeout(restoreAfterGrowthTimer)
    restoreAfterGrowthTimer = null
  }

  let lastScrollHeight = viewport.scrollHeight

  // 使用 ResizeObserver 监听内容高度变化
  if (typeof ResizeObserver !== 'undefined') {
    restoreAfterGrowthObserver = new ResizeObserver(() => {
      const currentScrollHeight = viewport.scrollHeight

      // 如果内容高度增加，延迟恢复位置（避免频繁恢复）
      if (currentScrollHeight > lastScrollHeight) {
        lastScrollHeight = currentScrollHeight

        // 清除之前的定时器
        if (restoreAfterGrowthTimer) {
          clearTimeout(restoreAfterGrowthTimer)
        }

        // 延迟恢复，等待内容稳定
        restoreAfterGrowthTimer = setTimeout(() => {
          // 检查是否还在恢复状态，如果不在则重新恢复位置
          if (!isRestoringScroll.value) {
            // ✅ 使用 layout store 读取滚动位置
            const savedPosition = layoutStore.getScrollPosition(scrollPositionKey.value)

            if (savedPosition) {
              const { scrollHeight, clientHeight, scrollWidth, clientWidth } = viewport
              const maxScrollTop = scrollHeight - clientHeight
              const maxScrollLeft = scrollWidth - clientWidth

              // ✅ 优化：优先使用 distanceFromBottom
              const savedDistanceFromBottom = savedPosition.distanceFromBottom ?? 0
              const savedDistanceFromRight = savedPosition.distanceFromRight ?? 0
              const savedScrollTop = savedPosition.scrollTop || 0
              const savedScrollLeft = savedPosition.scrollLeft || 0

              // 计算恢复位置
              let restoreScrollTop = savedScrollTop
              let restoreScrollLeft = savedScrollLeft

              // ✅ 优化：优先使用 distanceFromBottom（如果 < 20px，视为在底部）
              if (savedDistanceFromBottom < 20 && maxScrollTop >= 0) {
                restoreScrollTop = maxScrollTop
              } else if (savedDistanceFromBottom >= 0) {
                const calculatedScrollTop = maxScrollTop - savedDistanceFromBottom
                if (calculatedScrollTop >= 0 && calculatedScrollTop <= maxScrollTop) {
                  restoreScrollTop = calculatedScrollTop
                } else if (restoreScrollTop > maxScrollTop) {
                  restoreScrollTop = maxScrollTop
                }
              } else if (restoreScrollTop > maxScrollTop) {
                restoreScrollTop = maxScrollTop
              }

              // ✅ 优化：优先使用 distanceFromRight（如果 < 20px，视为在右侧）
              if (savedDistanceFromRight < 20 && maxScrollLeft >= 0) {
                restoreScrollLeft = maxScrollLeft
              } else if (savedDistanceFromRight >= 0) {
                const calculatedScrollLeft = maxScrollLeft - savedDistanceFromRight
                if (calculatedScrollLeft >= 0 && calculatedScrollLeft <= maxScrollLeft) {
                  restoreScrollLeft = calculatedScrollLeft
                } else if (restoreScrollLeft > maxScrollLeft) {
                  restoreScrollLeft = maxScrollLeft
                }
              } else if (restoreScrollLeft > maxScrollLeft) {
                restoreScrollLeft = maxScrollLeft
              }

              // 内容高度足够，可以恢复到记忆位置
              if (scrollHeight >= restoreScrollTop + clientHeight) {
                // ✅ 关键修复：设置恢复标记，避免恢复过程中的滚动事件触发保存
                isRestoringScroll.value = true
                viewport.scrollTo({
                  left: restoreScrollLeft,
                  top: restoreScrollTop,
                  behavior: 'instant',
                })

                // ✅ 验证恢复位置是否正确
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    const actualScrollTop = viewport.scrollTop
                    const currentMaxScrollTop = viewport.scrollHeight - viewport.clientHeight

                    // 如果保存时不在底部，验证相对位置
                    if (savedDistanceFromBottom >= 20 && savedDistanceFromBottom >= 0) {
                      const expectedScrollTop = currentMaxScrollTop - savedDistanceFromBottom
                      if (Math.abs(actualScrollTop - expectedScrollTop) > 5) {
                        // 位置不正确，重新滚动
                        viewport.scrollTo({
                          left: restoreScrollLeft,
                          top: expectedScrollTop,
                          behavior: 'instant',
                        })
                      }
                    }

                    // 延迟取消恢复标记
                    setTimeout(() => {
                      isRestoringScroll.value = false
                    }, 300)
                  })
                })
              }
            }
          }
        }, 300) // 延迟 300ms 等待内容稳定
      }
    })

    restoreAfterGrowthObserver.observe(contentEl)
  }
}

const handleInitialized = (instance: OverlayScrollbars) => {
  // 保存实例引用
  scrollbarInstance.value = instance

  emit('initialized', instance)

  // 初始化滚动位置
  const viewport = instance.elements().viewport
  if (viewport) {
    lastScrollLeft = viewport.scrollLeft
    lastScrollTop = viewport.scrollTop
  }

  // 注意：CSS 变量通过 :style 绑定自动应用，无需手动调用

  // 设置内容变化监听器
  setupContentChangeListeners(instance)

  // 添加滚动监听器 (必须在 restore 之前添加，才能接收到 scrollTo 触发的事件)
  nextTick(() => addScrollListener())

  // ✅ 标记需要恢复滚动位置，由 onUpdated 钩子处理
  if (props.rememberScrollPosition) {
    needsRestore.value = true
    lastStableScrollHeight = 0
  }

  // 设置恢复后内容增长监听
  setupRestoreAfterContentGrowth(instance)

  // 添加尺寸监听器
  if (typeof ResizeObserver !== 'undefined') {
    const wrapperEl = overlayScrollbarsRef.value?.$el
    const contentEl = instance.elements().content

    if (wrapperEl) {
      const wrapperObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const rect = entry.contentRect
          handleWrapperResize({
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
          })
        }
      })
      wrapperObserver.observe(wrapperEl)
    }

    if (contentEl) {
      const contentResizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const rect = entry.contentRect
          handleContentResize({
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
          })
        }
      })
      contentResizeObserver.observe(contentEl)
    }
  }
}

const handleUpdated = (instance: OverlayScrollbars) => {
  emit('updated', instance)
}

const handleDestroyed = () => {
  cleanupContentChangeListeners()
  emit('destroyed')
}

// ==================== 暴露的方法 ====================

// 获取 OverlayScrollbars 实例
const getOverlayScrollbars = (): OverlayScrollbars | null => {
  return overlayScrollbarsRef.value?.osInstance() || null
}

// 获取滚动元素（视口元素）
const getScrollEl = (): HTMLElement | null => {
  const instance = getOverlayScrollbars()
  return instance ? instance.elements().viewport : null
}

// 获取视口元素
const getViewport = (): HTMLElement | null => {
  const instance = getOverlayScrollbars()
  return instance ? instance.elements().viewport : null
}

// 获取内容元素
const getContent = (): HTMLElement | null => {
  const instance = getOverlayScrollbars()
  return instance ? instance.elements().content : null
}

// 滚动方法
const scrollTo = (options: ScrollToOptions) => {
  const scrollEl = getScrollEl()
  if (scrollEl) {
    scrollEl.scrollTo(options)
  }
}

const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  scrollTo({ top: 0, behavior })
}

const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
  const scrollEl = getScrollEl()
  if (scrollEl) {
    scrollTo({ top: scrollEl.scrollHeight, behavior })
  }
}

const scrollToLeft = (behavior: ScrollBehavior = 'smooth') => {
  scrollTo({ left: 0, behavior })
}

const scrollToRight = (behavior: ScrollBehavior = 'smooth') => {
  const scrollEl = getScrollEl()
  if (scrollEl) {
    scrollTo({ left: scrollEl.scrollWidth, behavior })
  }
}

// 更新 OverlayScrollbars 选项
const updateOptions = (options: any) => {
  const instance = getOverlayScrollbars()
  if (instance) {
    instance.options(options)
  }
}

// 销毁 OverlayScrollbars 实例
const destroy = () => {
  const instance = getOverlayScrollbars()
  if (instance) {
    instance.destroy()
  }
}

// 添加滚动事件监听器
const addScrollListener = () => {
  const scrollEl = getScrollEl()
  if (scrollEl) {
    lastScrollLeft = scrollEl.scrollLeft
    lastScrollTop = scrollEl.scrollTop
    scrollEl.addEventListener('scroll', handleScroll, { passive: true })
  }
}

// 移除滚动事件监听器
const removeScrollListener = () => {
  const scrollEl = getScrollEl()
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', handleScroll)
  }

  if (scrollTimer) {
    clearTimeout(scrollTimer)
    scrollTimer = null
  }

  if (userScrollTimer) {
    clearTimeout(userScrollTimer)
    userScrollTimer = null
  }

  if (saveScrollTimer) {
    clearTimeout(saveScrollTimer)
    saveScrollTimer = null
  }
}

// ==================== 监听器 ====================

// 监听配置变化
watch(
  () => computedScrollbarConfig.value,
  newConfig => {
    nextTick(() => updateOptions(newConfig))
  },
  { deep: true }
)
// 控制容器是否已挂载并准备好显示
const isContainerReady = ref(false)
// ==================== 生命周期 ====================

onMounted(() => {
  // 确保在组件挂载到 DOM 后才渲染内容
  isContainerReady.value = true
  // 初始化滚动位置 key
  initScrollPositionKey()
})

// ✅ 使用 onUpdated 钩子检测内容是否渲染稳定，然后执行滚动恢复
onUpdated(() => {
  // 如果不需要恢复，直接返回
  if (!needsRestore.value || !props.rememberScrollPosition) {
    return
  }

  const scrollEl = getScrollEl()
  if (!scrollEl) {
    return
  }

  const currentScrollHeight = scrollEl.scrollHeight
  const clientHeight = scrollEl.clientHeight

  // 如果 scrollHeight 为 0 或很小，说明内容还未渲染，继续等待
  if (currentScrollHeight <= clientHeight && currentScrollHeight < 100) {
    return
  }

  // 如果 scrollHeight 仍在增长，继续等待
  if (currentScrollHeight > lastStableScrollHeight) {
    lastStableScrollHeight = currentScrollHeight
    return
  }

  // 如果 scrollHeight 不再增长（连续两次相同），说明内容已经稳定
  // 执行滚动恢复
  if (currentScrollHeight === lastStableScrollHeight && currentScrollHeight > 0) {
    needsRestore.value = false
    isRestoringScroll.value = true

    restoreScrollPosition(() => {
      // 恢复完成后，延迟取消恢复标记
      setTimeout(() => {
        isRestoringScroll.value = false
      }, 300)
    })
  }
})

onUnmounted(() => {
  removeScrollListener()
  cleanupContentChangeListeners()
  destroy()

  // 清理恢复后内容增长监听器
  if (restoreAfterGrowthObserver) {
    restoreAfterGrowthObserver.disconnect()
    restoreAfterGrowthObserver = null
  }
  if (restoreAfterGrowthTimer) {
    clearTimeout(restoreAfterGrowthTimer)
    restoreAfterGrowthTimer = null
  }
})

// 暴露给父组件的方法和属性
defineExpose<ScrollbarExposed>({
  overlayScrollbarsRef,
  getOverlayScrollbars,
  getScrollEl,
  getViewport,
  getContent,
  scrollTo,
  scrollToTop,
  scrollToBottom,
  scrollToLeft,
  scrollToRight,
  addScrollListener,
  removeScrollListener,
  updateOptions,
  destroy,
  // 滚动位置记忆相关方法
  saveScrollPosition,
  restoreScrollPosition,
  clearScrollPosition,
  scrollPositionKey: scrollPositionKey,
})
</script>

<template>
  <div
    v-if="isContainerReady"
    class="overlay-scrollbar-wrapper"
    :class="rootClass"
    :style="rootStyle"
  >
    <!-- OverlayScrollbars 组件 - CSS 变量直接设置在这里 -->
    <OverlayScrollbarsComponent
      class="full"
      ref="overlayScrollbarsRef"
      :options="computedScrollbarConfig"
      :class="props.wrapperClass"
      :style="[overlayScrollbarsCssVars, props.wrapperStyle]"
      @os-initialized="handleInitialized"
      @os-updated="handleUpdated"
      @os-destroyed="handleDestroyed"
      v-bind="filteredAttrs"
    >
      <div
        class="full"
        :class="props.contentClass"
        :style="props.contentStyle"
        @click.self="handleClickSelf"
      >
        <slot />
      </div>
    </OverlayScrollbarsComponent>
  </div>
</template>

<style lang="scss">
/**
 * ScrollbarWrapper 样式
 * 完全基于 OverlayScrollbars v2 的 CSS 变量系统
 * 不直接操作 DOM 元素样式
 */

/* 基础容器样式 */
.overlay-scrollbar-wrapper {
  background: transparent;
  width: 100%;
  height: 100%;
}

/* 根据方向控制滚动条显示 */
.overlay-scrollbar-wrapper.is-vertical :deep(.os-scrollbar-horizontal) {
  display: none !important;
}

.overlay-scrollbar-wrapper.is-horizontal :deep(.os-scrollbar-vertical) {
  display: none !important;
}

/**
 * 覆盖 OverlayScrollbars 默认主题的 CSS 变量
 * 使用 !important 确保我们的自定义变量优先级最高
 */
.overlay-scrollbar-wrapper :deep(.os-theme-dark),
.overlay-scrollbar-wrapper :deep(.os-theme-light) {
  /* 颜色变量 - 继承父元素的自定义变量 */
  --os-handle-bg: var(--custom-os-handle-bg) !important;
  --os-handle-bg-hover: var(--custom-os-handle-bg-hover) !important;
  --os-handle-bg-active: var(--custom-os-handle-bg-active) !important;
  --os-track-bg: var(--custom-os-track-bg) !important;
  --os-track-bg-hover: var(--custom-os-track-bg-hover) !important;
  --os-track-bg-active: var(--custom-os-track-bg-active) !important;

  /* 尺寸变量 - 支持三种交互状态 */
  --os-size: var(--custom-os-size) !important;
  --os-handle-perpendicular-size: var(--custom-os-handle-perpendicular-size) !important;
  --os-handle-perpendicular-size-hover: var(--custom-os-handle-perpendicular-size-hover) !important;
  --os-handle-perpendicular-size-active: var(
    --custom-os-handle-perpendicular-size-active
  ) !important;
  --os-padding-perpendicular: var(--custom-os-padding-perpendicular) !important;
  --os-padding-axis: var(--custom-os-padding-axis) !important;

  /* 形状变量 */
  --os-handle-border-radius: var(--custom-os-handle-border-radius) !important;
  --os-track-border-radius: var(--custom-os-track-border-radius) !important;
  --os-handle-min-size: var(--custom-os-handle-min-size) !important;
  --os-handle-max-size: var(--custom-os-handle-max-size) !important;

  /* 边框变量 */
  --os-handle-border: var(--custom-os-handle-border) !important;
  --os-handle-border-hover: var(--custom-os-handle-border) !important;
  --os-handle-border-active: var(--custom-os-handle-border) !important;
  --os-track-border: var(--custom-os-track-border) !important;
  --os-track-border-hover: var(--custom-os-track-border) !important;
  --os-track-border-active: var(--custom-os-track-border) !important;
}
</style>
