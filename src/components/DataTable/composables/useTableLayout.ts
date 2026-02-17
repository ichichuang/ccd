/**
 * useTableLayout - 表格布局/尺寸/滚动 Composable
 * 负责：containerStyle、scrollable、高度计算、滚动监听、ResizeObserver、列宽测量
 */

import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  DEFAULT_TABLE_SIZE_CONFIG,
  INFINITE_SCROLL_THRESHOLD_PX,
  MIN_AUTO_HEIGHT_THRESHOLD_PX,
  TABLE_SELECTION_COLUMN_WIDTH_PX,
} from '../utils/constants'
import { useMitt } from '@/utils/mitt'
import { getColumnWidthsFromTable } from '../utils/helper'
import type { ColumnWidthInfo, DataTableColumn, DataTableProps, FooterMode } from '../utils/types'

export interface UseTableLayoutOptions<T> {
  props: DataTableProps<T>
  visibleColumns: ComputedRef<DataTableColumn<T>[]>
  sourceData: ComputedRef<T[]>
  filteredData: ComputedRef<T[]>
  loading: ComputedRef<boolean>
  infiniteHasNext: Ref<boolean>
  selectionModeComputed: ComputedRef<'single' | 'multiple' | undefined>
  loadApiData: (isInfiniteNext?: boolean, forceRefresh?: boolean) => Promise<void>
  slots: Record<string, unknown>
}

export interface UseTableLayoutReturn<T> {
  tableWrapperRef: Ref<HTMLElement | null>
  tableWrapperFullRef: Ref<HTMLElement | null>
  scrollbarRef: Ref<unknown>
  scrollWrapperRef: Ref<HTMLElement | null>
  containerStyle: ComputedRef<Record<string, string>>
  scrollableComputed: ComputedRef<boolean>
  calculatedHeight: Ref<string | undefined>
  scrollHeightComputed: ComputedRef<string | undefined>
  columnWidths: Ref<ColumnWidthInfo[]>
  selectionColumnWidth: Ref<number | undefined>
  footerMode: ComputedRef<FooterMode>
  selectionAlignFrozen: ComputedRef<'left' | 'right'>
  sizeConfig: ComputedRef<DataTableProps<T>['sizeConfig'] & typeof DEFAULT_TABLE_SIZE_CONFIG>
  updateColumnWidths: (retryCount?: number) => void
  scheduleFooterWidthUpdate: () => void
  computeColumnAlignedFooterStyles: () => { footerColumnsStyle: Record<string, string> }
  footerColumnsStyle: ComputedRef<Record<string, string>>
  handleTableScroll: (e: Event) => void
  setupScrollListener: () => void
  calculateAvailableHeight: () => void
}

export function useTableLayout<T extends object>(
  options: UseTableLayoutOptions<T>
): UseTableLayoutReturn<T> {
  const {
    props,
    visibleColumns,
    sourceData,
    filteredData,
    loading,
    infiniteHasNext,
    selectionModeComputed,
    loadApiData,
    slots,
  } = options

  const tableWrapperRef = ref<HTMLElement | null>(null)
  const tableWrapperFullRef = ref<HTMLElement | null>(null)
  const scrollbarRef = ref<unknown>(null)
  const scrollWrapperRef = ref<HTMLElement | null>(null)
  const columnWidths = ref<ColumnWidthInfo[]>([])
  const selectionColumnWidth = ref<number | undefined>()
  const calculatedHeight = ref<string | undefined>()

  const sizeConfig = computed(() => ({ ...DEFAULT_TABLE_SIZE_CONFIG, ...props.sizeConfig }))
  const footerMode = computed(() => props.footerMode ?? 'custom')
  const selectionAlignFrozen = computed(() => props.selectionAlignFrozen ?? 'left')

  const formatWidth = (w: string | number | undefined) => {
    if (!w) return undefined
    if (typeof w === 'number') return `${w}px`
    if (typeof w === 'string' && /^\d+$/.test(w.trim())) return `${w.trim()}px`
    return w
  }

  const containerStyle = computed(() => {
    const config = sizeConfig.value
    const style: Record<string, string> = {}
    if (config.widthMode === 'fixed') style.width = formatWidth(config.width) ?? '100%'
    else style.width = '100%'
    if (config.heightMode === 'fill') {
      style.height = '100%'
      style.flex = '1 1 auto'
    } else if (config.heightMode === 'fixed') {
      style.height = formatWidth(config.height) ?? 'auto'
    }
    return style
  })

  // 确保返回 boolean（非 undefined），解决 ComputedRef<boolean | undefined> 类型问题
  const scrollableComputed = computed<boolean>(
    () =>
      (props.scrollable ?? sizeConfig.value.heightMode === 'fill') ||
      sizeConfig.value.heightMode === 'fixed' ||
      Boolean(props.resizableColumns && props.columnResizeMode === 'expand')
  )

  const scrollHeightComputed = computed(() => {
    if (sizeConfig.value.heightMode === 'fill' || sizeConfig.value.heightMode === 'fixed') {
      return 'flex'
    }
    return undefined
  })

  /** 列宽测量 MutationObserver — 首次测量失败时监听 DOM 变化自动重测 */
  let columnWidthObserver: MutationObserver | null = null

  const disposeColumnWidthObserver = () => {
    if (columnWidthObserver) {
      columnWidthObserver.disconnect()
      columnWidthObserver = null
    }
  }

  const measureColumnWidths = () => {
    if (!tableWrapperRef.value) return false
    const tableEl = tableWrapperRef.value.querySelector('.p-datatable')
    if (!tableEl) return false
    const hasSel = props.selectable && selectionModeComputed.value
    const { widths, selectionWidth } = getColumnWidthsFromTable(
      tableEl as HTMLElement,
      visibleColumns.value,
      Boolean(hasSel),
      selectionAlignFrozen.value,
      {
        selectionFrozen: props.selectionFrozen ?? false,
        hasExpansionColumn: Boolean(slots.expansion),
      }
    )
    selectionColumnWidth.value = hasSel
      ? (selectionWidth ?? TABLE_SELECTION_COLUMN_WIDTH_PX)
      : undefined
    if (widths.length) {
      columnWidths.value = widths
      useMitt().emit('tableColumnWidthsChange', {
        tableId: props.tableId,
        widths: widths.map(w => ({
          field: w.field,
          width: w.width,
          minWidth: w.minWidth,
          maxWidth: w.maxWidth,
        })),
      })
      return true
    }
    return false
  }

  const updateColumnWidths = (retryCount = 0) => {
    nextTick(() => {
      // 使用 rAF 等待浏览器完成渲染后再测量，比固定 setTimeout 更可靠
      requestAnimationFrame(() => {
        const success = measureColumnWidths()
        if (!success && retryCount < 3) {
          // 首次和二次重试：短延后再测（兼容 PrimeVue 异步渲染）
          setTimeout(() => updateColumnWidths(retryCount + 1), 100 + retryCount * 50)
        } else if (!success && !columnWidthObserver && tableWrapperRef.value) {
          // 最终回退：使用 MutationObserver 监听 DOM 变化，一旦表格内容更新就重新测量
          const tableEl = tableWrapperRef.value.querySelector('.p-datatable')
          if (tableEl) {
            columnWidthObserver = new MutationObserver(() => {
              const measured = measureColumnWidths()
              if (measured) disposeColumnWidthObserver()
            })
            columnWidthObserver.observe(tableEl, { childList: true, subtree: true })
            // 安全超时：5 秒后自动断开 MutationObserver
            setTimeout(disposeColumnWidthObserver, 5000)
          }
        }
      })
    })
  }

  /** 使用 rAF 调度 footer 列宽更新，避免同一帧内多次触发 */
  let footerRafId: number | null = null
  const scheduleFooterWidthUpdate = () => {
    if (footerMode.value !== 'column-aligned') return
    if (footerRafId !== null) cancelAnimationFrame(footerRafId)
    footerRafId = requestAnimationFrame(() => {
      footerRafId = null
      updateColumnWidths()
    })
  }

  const computeColumnAlignedFooterStyles = (): { footerColumnsStyle: Record<string, string> } => {
    const widths = columnWidths.value
    const hasSel = props.selectable && selectionModeComputed.value
    const selW = selectionColumnWidth.value ?? TABLE_SELECTION_COLUMN_WIDTH_PX

    if (footerMode.value !== 'column-aligned' || widths.length === 0) {
      return { footerColumnsStyle: {} }
    }

    const totalW = widths.reduce((s, c) => s + c.width, 0) + (hasSel ? selW : 0)
    const gridCols = hasSel
      ? selectionAlignFrozen.value === 'right'
        ? [...widths.map(c => `${c.width}px`), `${selW}px`]
        : [`${selW}px`, ...widths.map(c => `${c.width}px`)]
      : widths.map(c => `${c.width}px`)

    return {
      footerColumnsStyle: {
        display: 'grid',
        gridTemplateColumns: gridCols.join(' '),
        width: `${totalW}px`,
      },
    }
  }

  const footerColumnsStyle = computed(() => computeColumnAlignedFooterStyles().footerColumnsStyle)

  const handleTableScroll = (e: Event) => {
    const target = e.target as HTMLElement
    if (footerMode.value === 'column-aligned' && scrollbarRef.value) {
      ;(scrollbarRef.value as { scrollTo?: (opts: { left: number }) => void }).scrollTo?.({
        left: target.scrollLeft,
      })
    }
    const { scrollTop, scrollHeight, clientHeight } = target
    if (
      scrollHeight - scrollTop - clientHeight < INFINITE_SCROLL_THRESHOLD_PX &&
      props.api?.mode === 'infinite' &&
      infiniteHasNext.value &&
      !loading.value
    ) {
      void loadApiData(true)
    }
  }

  /**
   * setupScrollListener - 滚动监听
   * 兼容 PrimeVue 3.x 和 4.x 的 DOM 结构差异
   */
  const setupScrollListener = () => {
    if (!tableWrapperRef.value) return
    const tableEl = tableWrapperRef.value.querySelector('.p-datatable')
    let scrollBody: Element | null = null

    if (tableEl) {
      // 覆盖 PrimeVue 3.x 和 4.x 的所有可能容器
      const potentialScrollables = [
        tableEl.querySelector('.p-datatable-table-container'), // PrimeVue 4.x
        tableEl.querySelector('.p-datatable-viewport'), // VirtualScroller
        tableEl.querySelector('.p-datatable-wrapper'), // PrimeVue 3.x Standard
        tableEl.querySelector('.p-datatable-scrollable-body'), // Legacy/Specific
        tableEl.querySelector('[data-pc-section="wrapper"]'), // PrimeVue 4.x data-pc
      ]

      for (const el of potentialScrollables) {
        if (
          el &&
          (el.scrollHeight > el.clientHeight ||
            getComputedStyle(el).overflowY === 'auto' ||
            getComputedStyle(el).overflowY === 'scroll')
        ) {
          scrollBody = el
          break
        }
      }
    }

    const wrapper = tableWrapperRef.value
    if (scrollBody) {
      scrollWrapperRef.value = scrollBody as HTMLElement
      scrollBody.removeEventListener('scroll', handleTableScroll as EventListener)
      scrollBody.addEventListener('scroll', handleTableScroll as EventListener, { passive: true })
    } else {
      wrapper.addEventListener('scroll', handleTableScroll as EventListener, {
        capture: true,
        passive: true,
      })
      scrollWrapperRef.value = wrapper
    }
  }

  /** 高度计算 — 使用 rAF 确保在布局完成后测量（防抖：合并短时间内多次调用） */
  let heightRafId: number | null = null
  const calculateAvailableHeight = () => {
    if (!tableWrapperFullRef.value || sizeConfig.value.heightMode !== 'fill') return
    if (heightRafId !== null) cancelAnimationFrame(heightRafId)
    heightRafId = requestAnimationFrame(() => {
      heightRafId = null
      const h = tableWrapperFullRef.value?.offsetHeight ?? 0
      if (h > MIN_AUTO_HEIGHT_THRESHOLD_PX) calculatedHeight.value = `${h}px`
    })
  }

  let resizeObserver: ResizeObserver | null = null
  const setupResizeObserver = () => {
    if (resizeObserver) resizeObserver.disconnect()
    if (!tableWrapperFullRef.value) return
    resizeObserver = new ResizeObserver(() => {
      calculateAvailableHeight()
      scheduleFooterWidthUpdate()
    })
    resizeObserver.observe(tableWrapperFullRef.value)
  }

  // Watch data changes
  watch([() => sourceData.value.length, () => filteredData.value.length], () => {
    if (props.api?.mode !== 'pagination') {
      // totalRecords is managed externally
    }
    scheduleFooterWidthUpdate()
    nextTick(() => {
      setTimeout(setupScrollListener, 100)
      if (infiniteHasNext.value && !loading.value && scrollWrapperRef.value) {
        const { scrollHeight, clientHeight } = scrollWrapperRef.value
        const style = getComputedStyle(scrollWrapperRef.value)
        const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll'
        if (isScrollable && scrollHeight <= clientHeight && sourceData.value.length > 0) {
          void loadApiData(true)
        }
      }
    })
  })

  // Watch selection/footer/column changes for footer alignment recalculation
  watch(
    [() => props.selectable, selectionModeComputed, footerMode, () => visibleColumns.value],
    scheduleFooterWidthUpdate,
    { deep: true }
  )

  watch([() => props.selectable, selectionModeComputed], () => {
    if (footerMode.value === 'column-aligned') {
      setTimeout(scheduleFooterWidthUpdate, 350)
    }
  })

  watch([() => props.bordered, () => props.showGridlines, () => props.size], () => {
    if (footerMode.value === 'column-aligned') {
      setTimeout(scheduleFooterWidthUpdate, 250)
    }
  })

  onMounted(() => {
    nextTick(() => {
      setupResizeObserver()
      setTimeout(() => {
        setupScrollListener()
        scheduleFooterWidthUpdate()
      }, 100)
    })
    if (sizeConfig.value.heightMode === 'fill') setTimeout(calculateAvailableHeight, 200)
  })

  onUnmounted(() => {
    if (scrollWrapperRef.value) {
      scrollWrapperRef.value.removeEventListener('scroll', handleTableScroll as EventListener)
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    disposeColumnWidthObserver()
    if (footerRafId !== null) cancelAnimationFrame(footerRafId)
    if (heightRafId !== null) cancelAnimationFrame(heightRafId)
  })

  return {
    tableWrapperRef,
    tableWrapperFullRef,
    scrollbarRef,
    scrollWrapperRef,
    containerStyle,
    scrollableComputed,
    calculatedHeight,
    scrollHeightComputed,
    columnWidths,
    selectionColumnWidth,
    footerMode,
    selectionAlignFrozen,
    sizeConfig,
    updateColumnWidths,
    scheduleFooterWidthUpdate,
    computeColumnAlignedFooterStyles,
    footerColumnsStyle,
    handleTableScroll,
    setupScrollListener,
    calculateAvailableHeight,
  }
}
