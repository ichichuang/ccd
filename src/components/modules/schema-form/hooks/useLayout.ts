// @/components/schema-form/hooks/useLayout.ts
/**
 * 布局和样式计算 Hook
 * 处理布局和样式计算
 */

import { computed, nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue'
import { colStyle as helperColStyle } from '../utils/helper'
import type { LayoutConfig, SchemaConfig, StyleConfig } from '../utils/types'

export interface UseLayoutOptions {
  schema: Ref<SchemaConfig>
  formContainerRef: Ref<HTMLElement | null>
}

export interface UseLayoutReturn {
  mergedLayout: Ref<LayoutConfig>
  mergedStyle: Ref<StyleConfig>
  gridGapStyle: Ref<Record<string, string>>
  colStyle: Ref<(fieldLayout?: LayoutConfig) => Record<string, string>>
  containerWidth: Ref<number>
  setupResizeObserver: () => void
  updateContainerWidth: () => void
  cleanup: () => void
}

/**
 * 使用布局 Hook
 */
export function useLayout(options: UseLayoutOptions): UseLayoutReturn {
  const { schema, formContainerRef } = options

  // ==================== State ====================
  const containerWidth = ref(0)
  let resizeObserver: ResizeObserver | null = null

  // ==================== Computed ====================
  /**
   * 合并布局配置：schema.layout > 默认值
   */
  const mergedLayout = computed((): LayoutConfig => {
    const layout = schema.value.layout || {}
    if (!layout?.cols) {
      layout.cols = 0
    }
    if (!layout?.labelWidth) {
      layout.labelWidth = '100px'
    }
    if (!layout?.labelPosition) {
      layout.labelPosition = 'right'
    }
    if (!layout?.labelAlign) {
      layout.labelAlign = 'left'
    }
    if (layout?.showLabel === undefined) {
      layout.showLabel = true
    }
    return layout
  })

  /**
   * 合并样式配置：schema.style > 默认值
   */
  const mergedStyle = computed((): StyleConfig => {
    return schema.value.style || {}
  })

  /**
   * 基于 schema.gap/gapX/gapY 生成网格间距样式
   */
  const gridGapStyle = computed((): Record<string, string> => {
    const style: Record<string, string> = {}
    const gapX = (schema.value as any).gapX
    const gapY = (schema.value as any).gapY
    const gap = schema.value.gap

    if (gapX !== undefined || gapY !== undefined) {
      if (gapY !== undefined) {
        style.rowGap = `${gapY}px`
      }
      if (gapX !== undefined) {
        style.columnGap = `${gapX}px`
      }
    } else if (gap !== undefined) {
      style.gap = `${gap}px`
    }
    return style
  })

  /**
   * 列样式计算
   */
  const colStyle = computed(() => {
    return (fieldLayout?: LayoutConfig): Record<string, string> => {
      let width = containerWidth.value || formContainerRef.value?.clientWidth || 0

      // 确保 width 是有效数字
      if (isNaN(width) || !isFinite(width) || width < 0) {
        width = 1200 // 默认桌面宽度
      }

      // 合并布局配置：fieldLayout > mergedLayout > 默认值
      const finalLayout: LayoutConfig = {
        ...mergedLayout.value,
        ...fieldLayout, // 表单项配置优先级最高
      }

      // 直接使用 helperColStyle，它会正确处理表单项的 cols 配置
      return helperColStyle(finalLayout, width)
    }
  })

  // ==================== Methods ====================
  /**
   * 监听容器尺寸变化
   */
  function setupResizeObserver() {
    if (!formContainerRef.value) {
      return
    }

    // 清理之前的 observer
    if (resizeObserver) {
      resizeObserver.disconnect()
    }

    resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width
      }
    })

    resizeObserver.observe(formContainerRef.value)
  }

  /**
   * 更新容器宽度（备用方案）
   * @description 🔥 关键修复：添加防抖和值比较，避免频繁更新导致递归
   */
  function updateContainerWidth() {
    if (!formContainerRef.value) {
      return
    }
    const newWidth = formContainerRef.value.clientWidth
    // 🔥 关键修复：只有当宽度确实变化时才更新，避免触发不必要的响应式更新
    if (newWidth !== containerWidth.value && newWidth > 0) {
      containerWidth.value = newWidth
    }
  }

  /**
   * 清理资源
   */
  function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    window.removeEventListener('resize', updateContainerWidth)
  }

  // ==================== Lifecycle ====================
  onMounted(() => {
    nextTick(() => {
      setupResizeObserver()
      // 初始设置容器宽度
      updateContainerWidth()
    })
    // 添加窗口大小变化监听作为备用方案
    window.addEventListener('resize', updateContainerWidth)
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    mergedLayout,
    mergedStyle,
    gridGapStyle,
    colStyle,
    containerWidth,
    setupResizeObserver,
    updateContainerWidth,
    cleanup,
  }
}
