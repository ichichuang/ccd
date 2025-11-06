<script setup lang="ts">
// @/components/modules/grid-table/GridTable.vue
/**
 * GridTable 组件
 *
 * 基于 AG Grid 社区版的二次封装表格组件
 * 提供动态配色、尺寸控制和丰富的功能配置
 */

import { debounce } from '@#/index'
import { INTERVAL } from '@/constants/modules/layout'
import { useElementSize } from '@/hooks'
import { useRevoGrid } from '@/hooks/components/useGridTable'
import { t } from '@/locales'
import { AgGridVue } from 'ag-grid-vue3'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  DEFAULT_GRID_COLOR_CONFIG,
  DEFAULT_GRID_SIZE_CONFIG,
  createDefaultGridTableProps,
} from './utils/constants'
import type { GridTableEmits, GridTableProps } from './utils/types'

// ==================== Props 定义 ====================

type Props = GridTableProps

const props = withDefaults(defineProps<Props>(), createDefaultGridTableProps())

// 将传入的配色与尺寸配置与默认值进行合并，确保有完整的有效配置
const mergedColorConfig = computed(() => ({
  ...DEFAULT_GRID_COLOR_CONFIG,
  ...(props.colorConfig || {}),
}))

const mergedSizeConfig = computed(() => ({
  ...DEFAULT_GRID_SIZE_CONFIG,
  ...(props.sizeConfig || {}),
}))

// 组合后的 props，确保下游始终拿到合并后的配置
const mergedProps = computed<GridTableProps>(() => ({
  ...props,
  colorConfig: mergedColorConfig.value,
  sizeConfig: mergedSizeConfig.value,
}))

// 注意：mergedGridOptions 现在由 useRevoGrid 提供，包含 ActionCell 等组件的合并逻辑

// ==================== Emits 定义 ====================

const emit = defineEmits<GridTableEmits>()

// ==================== 使用组合式函数 ====================

// 用于强制重新渲染 AgGridVue 组件的 key
const gridKey = ref(0)
const tableContainerRef = ref<HTMLElement | HTMLDivElement | null>(null)
// 当系统语言切换时，强制重建组件，兜底确保分页/过滤等全部应用新文案
const handleLocaleChanged = () => {
  gridKey.value++
}

const {
  gridApi,
  rowData,
  selectedRows,
  gridContainer,
  layoutReady,
  mergedGridOptions,
  columnDefs,
  gridStyle,
  gridClass,
  scrollbarStyles,
  toolbarStyle,
  statusBarStyle,
  autoSizeColumns,
  exportData,
  getFilteredData,
  setRowData,
  addRow,
  addRows,
  loadMoreData,
  updateRow,
  deleteRow,
  clearSelection,
  selectAll,
  deselectAll,
  clearCellFocus,
  copySelectedCellsToClipboard,
  showLoadingOverlay,
  hideOverlay,
  showNoRowsOverlay,
  setLoading,
} = useRevoGrid(mergedProps, emit)

// ==================== 容器样式和类名计算 ====================

// 容器样式计算属性
const containerStyle = computed(() => {
  const widthMode = mergedSizeConfig.value.widthMode || 'fill'
  const { width, minWidth, maxWidth } = mergedSizeConfig.value

  const baseStyle: Record<string, string> = {
    opacity: layoutReady.value ? '1' : '0',
    visibility: layoutReady.value ? 'visible' : 'hidden',
  }

  if (widthMode === 'fixed' && width) {
    baseStyle.width = `${width}px`
  }

  if (minWidth) {
    baseStyle.minWidth = `${minWidth}px`
  }
  if (maxWidth) {
    baseStyle.maxWidth = `${maxWidth}px`
  }

  return baseStyle
})

// 容器类名计算属性
const containerClass = computed(() => {
  const classes: string[] = []

  // 高度类
  if (mergedSizeConfig.value.heightMode === 'fixed') {
    classes.push(`h-${mergedSizeConfig.value.height}`)
  } else {
    classes.push('h-full')
  }

  // 宽度类
  const widthMode = mergedSizeConfig.value.widthMode || 'fill'
  if (widthMode === 'fill') {
    classes.push('w-full')
  }

  return classes
})

// ==================== 无感知更新模式：条件绑定 rowData ====================

/**
 * 在 transaction 模式下，不将 rowData 直接绑定到 AgGridVue
 * 而是通过 api.setGridOption('rowData', ...) 在 gridReady 时初始化
 * 后续通过 applyTransaction 进行增量更新，避免 AgGridVue 响应式系统触发全量重绘
 */
const bindRowData = computed(() => props.seamlessDataUpdateMode !== 'transaction')

// 注意：enableCellSpan 是 AG Grid 企业版功能，社区版不支持
// 已移除 enableCellSpan 相关的监听和重新渲染逻辑

// ==================== 动态样式注入 ====================

let styleElement: HTMLStyleElement | null = null

// 注入滚动条样式
const injectScrollbarStyles = () => {
  // 移除旧的样式元素
  if (styleElement) {
    document.head.removeChild(styleElement)
  }

  // 创建新的样式元素
  styleElement = document.createElement('style')
  styleElement.id = 'ag-grid-scrollbar-styles'
  styleElement.textContent = scrollbarStyles.value
  document.head.appendChild(styleElement)
}

// 监听滚动条样式变化
watch(
  scrollbarStyles,
  () => {
    injectScrollbarStyles()
  },
  { immediate: true }
)

// 绑定/解绑滚动监听（可重复调用，内部会处理清理）
const bindScrollListener = () => {
  const el = (gridContainer.value as any)?.$el || gridContainer.value
  if (!el) {
    return
  }
  const old = (el as any).__ag_onScroll__
  if (old) {
    el.removeEventListener('scroll', old, true)
  }
  const viewport = (el.querySelector('.ag-body-viewport') as HTMLElement | null) || el
  ;(el as any).__ag_lastScrollTop__ = (viewport && (viewport as any).scrollTop) || 0
  const onScrollHandler = () => {
    const vp = el.querySelector('.ag-body-viewport') as HTMLElement | null
    if (!vp) {
      return
    }
    const last = (el as any).__ag_lastScrollTop__ || 0
    const current = vp.scrollTop
    if (current <= last) {
      ;(el as any).__ag_lastScrollTop__ = current
      return
    }
    const clientHeight = vp.clientHeight
    const scrollHeight = vp.scrollHeight
    const offset = props.bottomReachOffset ?? 120
    if (current + clientHeight >= scrollHeight - offset) {
      emit('reachBottom', { scrollTop: current, clientHeight, scrollHeight })
    }
    ;(el as any).__ag_lastScrollTop__ = current
  }
  const debouncedOnScroll = debounce(onScrollHandler, 100)
  ;(el as any).__ag_onScroll__ = debouncedOnScroll
  el.addEventListener('scroll', debouncedOnScroll, true)
}

const unbindScrollListener = () => {
  const el = (gridContainer.value as any)?.$el || gridContainer.value
  if (el && (el as any).__ag_onScroll__) {
    el.removeEventListener('scroll', (el as any).__ag_onScroll__, true)
    delete (el as any).__ag_onScroll__
    if ((el as any).__ag_lastScrollTop__ !== undefined) {
      delete (el as any).__ag_lastScrollTop__
    }
  }
}

// 组件挂载时注入样式与绑定滚动
onMounted(() => {
  injectScrollbarStyles()
  bindScrollListener()
  // 监听容器尺寸变化,按策略触发图表自适应
  useElementSize(
    tableContainerRef,
    () => {
      console.log('=1111111')

      handleLocaleChanged()
    },
    { mode: 'none', delay: INTERVAL }
  )
})

// 组件卸载时清理样式
onUnmounted(() => {
  if (styleElement) {
    document.head.removeChild(styleElement)
    styleElement = null
  }
  // 卸载滚动监听
  unbindScrollListener()
})

// 当 key 变化导致 AgGrid 重新挂载后，重新绑定滚动监听
watch(
  () => gridKey.value,
  async () => {
    await nextTick()
    bindScrollListener()
  },
  { deep: true, immediate: true }
)

// ==================== 事件处理 ====================
// 事件处理已移至 useRevoGrid 中的 gridOptions 配置

// ==================== 暴露给父组件的方法 ====================

defineExpose({
  gridApi,
  autoSizeColumns,
  exportData,
  getFilteredData,
  setRowData,
  addRow,
  addRows,
  loadMoreData,
  updateRow,
  deleteRow,
  clearSelection,
  selectAll,
  deselectAll,
  clearCellFocus,
  copySelectedCellsToClipboard,
  showLoadingOverlay,
  hideOverlay,
  showNoRowsOverlay,
  setLoading,
})
</script>

<template lang="pug">
.between-col.bg-bg100.border.border-bg300.rounded-rounded.overflow-hidden(
  :class='containerClass',
  :style='containerStyle',
  ref='tableContainerRef'
)
  // 工具栏区域
  .between.items-center.justify-between.border-b.border-bg300.rounded-rounded.px-padding.py-paddings(
    v-if='props.showToolbar',
    :style='toolbarStyle'
  )
    .between.items-center
      slot(name='toolbar-left')
    .flex-1.justify-center
      slot(name='toolbar-center')
    .between.items-center
      slot(name='toolbar-right')
        .p-paddings.c-transitions(@click='autoSizeColumns')
          .fs-appFontSizex.c-cp(
            v-if='props.enableColumnResize',
            class='icon-line-md:arrows-horizontal-alt hover:color-accent100',
            v-tooltip.top='t("components.gridTable.autoSizeColumns")'
          )
        .p-paddings.c-transitions(@click='exportData("csv")')
          .fs-appFontSizex.c-cp(
            class='icon-line-md:download hover:color-accent100',
            v-tooltip.top='t("components.gridTable.exportCsv")'
          )
        .p-paddings.c-transitions(@click='exportData("excel")')
          .fs-appFontSizex.c-cp(
            class='icon-line-md:document-list-twotone hover:color-accent100',
            v-tooltip.top='t("components.gridTable.exportExcel")'
          )

  // 表格主体
  .flex-1.min-h-0.overflow-hidden
    AgGridVue(
      :key='gridKey',
      ref='gridContainer',
      :class='gridClass',
      :style='gridStyle',
      :column-defs='columnDefs',
      :row-data='bindRowData ? rowData : undefined',
      :grid-options='mergedGridOptions',
      :locale-text='mergedGridOptions.localeText'
    )

  // 状态栏区域
  .between.items-center.justify-between.p-gaps.border-t.border-bg300.fs-appFontSizes.rounded-rounded(
    v-if='props.showStatusBar',
    :style='statusBarStyle'
  )
    .between.items-center.gap-gaps
      slot(name='status-left')
        span {{ t('components.gridTable.totalCount', { count: rowData.length }) }}
        span(v-if='selectedRows.length > 0') | {{ t('components.gridTable.selectedCount', { count: selectedRows.length }) }}
    .flex-1.justify-center
      slot(name='status-center')
    .between.items-center.gap-gaps
      slot(name='status-right')
</template>

<style scoped>
/* 动态滚动条样式 */
:deep(.ag-theme-alpine) {
  /* 滚动条样式将通过 JavaScript 动态注入 */
}

/* 修复过滤菜单 z-index 层级问题 - 只处理层级，不改变定位 */
:deep(.ag-theme-alpine .ag-menu) {
  z-index: 9999 !important;
}

:deep(.ag-theme-alpine .ag-filter-menu) {
  z-index: 9999 !important;
}

:deep(.ag-theme-alpine .ag-popup-child) {
  z-index: 9999 !important;
}

/* 确保过滤菜单在所有元素之上 */
:deep(.ag-theme-alpine .ag-menu.ag-filter-menu) {
  z-index: 10000 !important;
}

/* 确保过滤菜单的弹出层正确显示 */
:deep(.ag-theme-alpine .ag-popup-positioned-under) {
  z-index: 10000 !important;
}

/* 过滤菜单内容样式优化 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-filter) {
  background: var(--bg100);
  border: 1px solid var(--bg300);
  border-radius: var(--rounded);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 过滤输入框样式 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-input-field-input) {
  background: var(--bg200) !important;
  border: 1px solid var(--bg300) !important;
  color: var(--text100) !important;
}

:deep(.ag-theme-alpine .ag-filter-menu .ag-input-field-input:focus) {
  border-color: var(--primary100) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(var(--primary100-rgb), 0.2) !important;
}

/* 过滤选择器样式 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-picker-field-wrapper) {
  background: var(--bg200) !important;
  border: 1px solid var(--bg300) !important;
  color: var(--text100) !important;
}

:deep(.ag-theme-alpine .ag-filter-menu .ag-picker-field-wrapper:hover) {
  border-color: var(--primary100) !important;
}

:deep(.ag-theme-alpine .ag-filter-menu .ag-picker-field-wrapper:focus) {
  border-color: var(--primary100) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(var(--primary100-rgb), 0.2) !important;
}

/* 过滤选择器显示字段样式 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-picker-field-display) {
  color: var(--text100) !important;
}

/* 过滤选择器图标样式 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-picker-field-icon) {
  color: var(--text200) !important;
}

/* 过滤菜单中的所有输入框和选择器 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-input-wrapper) {
  background: var(--bg200) !important;
  border: 1px solid var(--bg300) !important;
}

:deep(.ag-theme-alpine .ag-filter-menu .ag-input-wrapper:focus-within) {
  border-color: var(--primary100) !important;
  box-shadow: 0 0 0 2px rgba(var(--primary100-rgb), 0.2) !important;
}

/* 过滤菜单中的标签样式 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-label) {
  color: var(--text200) !important;
}

/* 过滤菜单中的占位符样式 */
:deep(.ag-theme-alpine .ag-filter-menu .ag-input-field-input::placeholder) {
  color: var(--text200) !important;
}

/* ==================== 圆角样式配置 ==================== */

/* 只设置表格最外层容器的圆角 */
:deep(.ag-theme-alpine) {
  border-radius: var(--rounded);
}

/* ==================== 合并单元格边框修复 ==================== */

/* 注意：这些样式只在用户开启横向分割线时才生效，通过 AG Grid 的配置控制 */

/* 当横向分割线开启时，为合并单元格添加底部边框 */
:deep(.ag-theme-alpine[style*='--ag-row-border-style: solid']) .ag-cell[style*='height: 76px'] {
  border-bottom: 1px solid var(--bg300) !important;
}

:deep(.ag-theme-alpine[style*='--ag-row-border-style: solid']) .ag-cell[style*='height: 114px'] {
  border-bottom: 1px solid var(--bg300) !important;
}

:deep(.ag-theme-alpine[style*='--ag-row-border-style: solid']) .ag-cell[style*='height: 152px'] {
  border-bottom: 1px solid var(--bg300) !important;
}

/* 当横向分割线开启时，为包含合并单元格的行添加底部边框 */
:deep(.ag-theme-alpine[style*='--ag-row-border-style: solid'])
  .ag-row:has(.ag-cell[style*='height: 76px']) {
  border-bottom: 1px solid var(--bg300) !important;
}

/* 当横向分割线开启时，为合并单元格下方的行添加顶部边框 */
:deep(.ag-theme-alpine[style*='--ag-row-border-style: solid'])
  .ag-row:has(.ag-cell[style*='height: 76px'])
  + .ag-row {
  border-top: 1px solid var(--bg300) !important;
}
/* ==================== 合并单元格覆盖与隐藏 ==================== */
/* 主跨行/跨列单元格：提高层级并覆盖背景 */
::deep(.ag-theme-alpine .ag-cell.ag-span-master) {
  position: relative !important;
  z-index: 2 !important;
  overflow: hidden;
}
/* 被跨行覆盖的下方同列单元格：隐藏并移除边框 */
::deep(.ag-theme-alpine .ag-cell.ag-cell-hidden-by-span) {
  visibility: hidden !important;
  border: none !important;
}
</style>
