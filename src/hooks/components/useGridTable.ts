// @/hooks/components/useRevoGrid.ts
/**
 * useRevoGrid 组合式函数 - 优化滚动时的数据更新
 *
 * 核心优化点：
 * 1. 提前初始化滚动监听，确保首次数据更新前就能拦截
 * 2. 增强 pending 队列机制，支持多次数据累积
 * 3. 优化滚动空闲检测，使用更合理的延迟时间
 * 4. 滚动时完全禁止 scrollTop 恢复，避免触发额外渲染
 */

import { generateIdFromKey } from '@/common'
import ActionCell from '@/components/modules/grid-table/components/ActionCell'
import {
  DEFAULT_GRID_COLOR_CONFIG,
  getGridSizeConfigByMode,
  type SizeMode,
} from '@/components/modules/grid-table/utils/constants'
import {
  addRowNumberColumn,
  colorConfigToCssVars,
  exportToCsv,
  exportToExcel,
  generateScrollbarStyles,
  mergeColorConfig,
  processColumnDefs,
  sizeConfigToGridOptions,
  transformDataForExport,
  validateColumnDefs,
  validateData,
} from '@/components/modules/grid-table/utils/helper'
import type {
  ExtendedColDef,
  GridColorConfig,
  GridSizeConfig,
  GridTableProps,
  UseRevoGridReturn,
} from '@/components/modules/grid-table/utils/types'
import { t } from '@/locales'
import { useSizeStore } from '@/stores/modules/size'
import type { GridApi, GridOptions } from 'ag-grid-community'
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

// ==================== 主要组合式函数 ====================

export function useRevoGrid(props: Ref<GridTableProps>, emit?: any): UseRevoGridReturn {
  // ==================== 响应式状态 ====================

  const gridApi = ref<GridApi | null>(null)

  const safeGridApiCall = <T>(callback: (api: GridApi) => T): T | undefined => {
    if (gridApi.value && !gridApi.value.isDestroyed()) {
      return callback(gridApi.value)
    }
    return undefined
  }

  const rowData = ref<any[]>(props.value.rowData || [])
  const selectedRows = ref<any[]>([])
  const gridContainer = ref<any>(null)
  const layoutReady = ref<boolean>(false)
  const widthsLocked = ref<boolean>(false)

  // ==================== 优化的滚动状态管理 ====================

  /** 是否处于用户滚动中 */
  const isUserScrolling = ref<boolean>(false)

  /** 滚动空闲计时器 */
  let scrollIdleTimer: number | null = null

  /** 待处理的数据队列（支持多次累积） */
  let pendingDataQueue: any[][] = []

  /** 网格视口元素引用 */
  let gridViewportEl: HTMLElement | null = null

  /** 最后一次滚动时间戳（DOM 兜底用） */
  let lastScrollTime = 0
  /** gridApi 事件处理器引用，便于卸载时移除 */
  let gridBodyScrollHandler: ((e: any) => void) | null = null
  let gridBodyScrollEndHandler: ((e: any) => void) | null = null

  /** 滚动空闲阈值（毫秒） - 已弃用（仅保留常量位置，避免误用） */
  const SCROLL_IDLE_THRESHOLD = 300
  // 已移除空闲刷新排队逻辑（通过直接丢弃滚动期更新实现）

  // ==================== 计算属性 ====================

  const mergedColorConfig = computed<GridColorConfig>(() => {
    return mergeColorConfig(DEFAULT_GRID_COLOR_CONFIG, props.value.colorConfig || {})
  })

  const sizeStore = useSizeStore()

  const mergedSizeConfig = computed<GridSizeConfig>(() => {
    const systemSizeMode = sizeStore.size as SizeMode
    const systemSizeConfig = getGridSizeConfigByMode(systemSizeMode)
    const userConfig = props.value.sizeConfig || {}
    const shouldFollowSystemSize = props.value.followSystemSize !== false

    const merged = {
      ...systemSizeConfig,
      ...userConfig,
      ...(shouldFollowSystemSize
        ? {
            rowHeight: systemSizeConfig.rowHeight,
            headerHeight: systemSizeConfig.headerHeight,
            minColumnWidth: systemSizeConfig.minColumnWidth,
            maxColumnWidth: systemSizeConfig.maxColumnWidth,
            scrollbarSize: systemSizeConfig.scrollbarSize,
          }
        : {}),
    }
    return merged
  })

  const processedColumnDefs = computed<ExtendedColDef[]>(() => {
    let columns = [...(props.value.columnDefs || [])]

    if (props.value.showRowNumbers) {
      columns = addRowNumberColumn(columns)
    }

    let withStyle = processColumnDefs(columns, mergedColorConfig.value, mergedSizeConfig.value)

    if (widthsLocked.value && gridApi.value) {
      const colMap = new Map<string, number>()
      gridApi.value.getColumns()?.forEach(col => {
        const id = col.getColId()
        const w = (col as any).getActualWidth
          ? (col as any).getActualWidth()
          : (col as any).actualWidth
        if (id && w) {
          colMap.set(id, Math.round(w))
        }
      })
      withStyle = withStyle.map(def => {
        const id = (def as any).colId || (def as any).field
        const w = id ? colMap.get(String(id)) : undefined
        if (w && w > 0) {
          return {
            ...def,
            width: w,
            minWidth: (def as any).minWidth || w,
            maxWidth:
              (def as any).maxWidth && (def as any).maxWidth < w ? w : (def as any).maxWidth,
          } as any
        }
        return def
      })
    }

    const needAutoSize =
      mergedSizeConfig.value.defaultColumnWidth === 'auto' ||
      withStyle.some(col => (col as any).width === undefined)
    if (needAutoSize && gridApi.value && layoutReady.value === false) {
      setTimeout(() => autoSizeColumns(), 0)
    }

    const normalized = withStyle.map(col => {
      const next: ExtendedColDef = { ...col }
      if (next.sortable === undefined) {
        next.sortable = !!props.value.enableSorting
      }
      if (next.filter === undefined) {
        ;(next as any).filter = !!props.value.enableFilter
      }
      return next
    })

    return normalized
  })

  let cachedGridOptions: GridOptions | null = null
  const mergedGridOptions = computed<GridOptions>(() => {
    if (cachedGridOptions) {
      return cachedGridOptions
    }
    const baseOptions = sizeConfigToGridOptions(mergedSizeConfig.value)

    const selection = (() => {
      if (!props.value.rowSelection) {
        return undefined
      }
      const isMultiple = props.value.rowSelection === 'multiple'
      const selectionObj: any = {
        mode: isMultiple ? 'multiRow' : 'singleRow',
        enableClickSelection: !!props.value.enableRowClickSelection,
        enableSelectionWithoutKeys: isMultiple ? true : false,
      }
      if (!selectionObj.enableClickSelection) {
        selectionObj.checkboxes = {
          headerCheckbox: isMultiple ? true : false,
          position: (props.value.selectionCheckboxPosition || 'left') as 'left' | 'right',
        }
      } else if (isMultiple) {
        selectionObj.checkboxes = {
          headerCheckbox: true,
          position: (props.value.selectionCheckboxPosition || 'left') as 'left' | 'right',
        }
      }
      return selectionObj
    })()

    const selectionColumnDef = (() => {
      if (!props.value.rowSelection) {
        return undefined
      }
      const pos = (props.value.selectionCheckboxPosition || 'left') as 'left' | 'right'
      return {
        headerName: '',
        pinned: pos,
        width: 48,
        minWidth: 40,
        maxWidth: 60,
        resizable: false,
        sortable: false,
        suppressHeaderMenuButton: true,
        suppressMovable: true,
      } as any
    })()

    const baseGridOptions: GridOptions = {
      ...baseOptions,
      loading: false,
      animateRows: false,
      localeText: buildAgGridLocaleText(),
      pagination: !!props.value.enablePagination,
      paginationPageSize: props.value.paginationPageSize,
      paginationPageSizeSelector: props.value.paginationPageSizeOptions,
      suppressScrollOnNewData: true,
      // 为无感知模式提供更稳定的滚动体验
      // rowBuffer 在类型上可能未声明，但社区版 API 支持，使用 any 规避类型限制
      ...(props.value.seamlessDataUpdateMode === 'transaction' ? ({ rowBuffer: 10 } as any) : {}),
      suppressRowVirtualisation:
        props.value.seamlessDataUpdateMode === 'transaction' ? (true as any) : (undefined as any),
      getRowId: params => {
        const id = params.data.id || params.data[Object.keys(params.data)[0]]
        const stringId = String(id || '')
        if (!stringId) {
          return `row-${Math.random().toString(36).substr(2, 9)}`
        }
        return generateIdFromKey(stringId)
      },
      rowSelection: selection,
      suppressRowTransform: true,
      domLayout: mergedSizeConfig.value.heightMode === 'auto' ? 'autoHeight' : 'normal',
      suppressRowHoverHighlight: props.value.enableRowHoverHighlight === false ? true : undefined,
      columnHoverHighlight: props.value.enableColumnHoverHighlight === false ? false : true,
      scrollbarWidth: mergedSizeConfig.value.scrollbarSize || 12,
      defaultColDef: {
        sortable: props.value.enableSorting ?? false,
        filter: props.value.enableFilter ?? false,
        resizable: props.value.enableColumnResize ?? false,
        suppressMovable: props.value.enableColumnDrag === false ? true : false,
        cellStyle: {
          textAlign: mergedSizeConfig.value.globalCellTextAlign || 'center',
          display: 'flex',
          alignItems:
            mergedSizeConfig.value.globalCellVerticalAlign === 'top'
              ? 'flex-start'
              : mergedSizeConfig.value.globalCellVerticalAlign === 'bottom'
                ? 'flex-end'
                : 'center',
          justifyContent:
            mergedSizeConfig.value.globalCellTextAlign === 'center'
              ? 'center'
              : mergedSizeConfig.value.globalCellTextAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
        },
        headerClass: `ag-header-${mergedSizeConfig.value.globalHeaderTextAlign || 'center'} ag-header-${mergedSizeConfig.value.globalHeaderVerticalAlign || 'middle'}`,
        ...baseOptions.defaultColDef,
      },
      selectionColumnDef,
      onGridReady: params => {
        gridApi.value = params.api
        emit?.('gridReady', params)
        props.value.gridOptions?.onGridReady?.(params)

        try {
          params.api.setGridOption('rowData', rowData.value)
        } catch (_e) {
          void 0
        }

        fitColumnsToViewport()

        setTimeout(() => {
          setMergedCellStyles()
          if (props.value.seamlessDataUpdateMode === 'transaction') {
            lockCurrentColumnWidths()
          }
          layoutReady.value = true
        }, 200)

        // ==================== 优化：提前绑定滚动监听 ====================
        initScrollListener(params.api)
        // 绑定 AG Grid 官方滚动事件（开始/结束）
        gridBodyScrollHandler = () => {
          isUserScrolling.value = true
        }
        gridBodyScrollEndHandler = () => {
          isUserScrolling.value = false
        }
        try {
          params.api.addEventListener('bodyScroll', gridBodyScrollHandler as any)
          params.api.addEventListener('bodyScrollEnd', gridBodyScrollEndHandler as any)
        } catch (_e) {
          // 静默
        }
      },
      onSelectionChanged: () => {
        const selected = safeGridApiCall(api => api.getSelectedRows())
        if (selected) {
          selectedRows.value = selected
          emit?.('selectionChanged', selectedRows.value)
        }
      },
      onSortChanged: _event => {
        emit?.('sortChanged', [])
      },
      onFilterChanged: _event => {
        emit?.('filterChanged', {})
      },
      onColumnResized: event => {
        emit?.('columnResized', event)
        fitColumnsToViewport()
      },
      onColumnMoved: event => {
        emit?.('columnMoved', event)
        fitColumnsToViewport()
      },
      onColumnVisible: event => {
        emit?.('columnVisible', event)
        fitColumnsToViewport()
      },
      onCellValueChanged: event => {
        emit?.('cellValueChanged', event)
      },
      onCellClicked: event => {
        emit?.('cellClicked', event)
        props.value.gridOptions?.onCellClicked?.(event)
      },
      onCellDoubleClicked: event => {
        emit?.('cellDoubleClicked', event)
        props.value.gridOptions?.onCellDoubleClicked?.(event)
      },
      onCellContextMenu: event => {
        emit?.('cellContextMenu', event)
        props.value.gridOptions?.onCellContextMenu?.(event)
      },
      onCellEditingStarted: event => {
        emit?.('cellEditingStarted', event)
      },
      onCellEditingStopped: event => {
        emit?.('cellEditingStopped', event)
      },
      onGridSizeChanged: event => {
        emit?.('gridSizeChanged', event)
        // 容器尺寸变化时，只有在非滚动状态下才适配列宽
        if (!isUserScrolling.value) {
          fitColumnsToViewport()
        }
      },
      onFirstDataRendered: () => {
        setTimeout(() => setMergedCellStyles(), 0)
      },
      onModelUpdated: () => {
        setTimeout(() => setMergedCellStyles(), 0)
      },
      onRowDataUpdated: () => {
        setTimeout(() => setMergedCellStyles(), 0)
      },

      // 滚动事件改为在 onGridReady 中通过 api.addEventListener 绑定
      ...(props.value.gridOptions?.onRowClicked
        ? { onRowClicked: props.value.gridOptions.onRowClicked }
        : {}),
      ...(props.value.gridOptions?.onCellClicked
        ? { onCellClicked: props.value.gridOptions.onCellClicked }
        : {}),
      ...(props.value.gridOptions?.onRowDoubleClicked
        ? { onRowDoubleClicked: props.value.gridOptions.onRowDoubleClicked }
        : {}),
      ...(props.value.gridOptions?.onCellDoubleClicked
        ? { onCellDoubleClicked: props.value.gridOptions.onCellDoubleClicked }
        : {}),
      ...(props.value.gridOptions?.onRowSelected
        ? { onRowSelected: props.value.gridOptions.onRowSelected }
        : {}),
      overlayLoadingTemplate:
        props.value.overlayLoadingTemplate ||
        `<span class="ag-overlay-loading-center">${t('common.loading')}</span>`,
      overlayNoRowsTemplate:
        props.value.overlayNoRowsTemplate ||
        `<span class="ag-overlay-loading-center">${t('common.gridTable.noRowsToShow')}</span>`,
      ...Object.fromEntries(
        Object.entries(props.value.gridOptions || {}).filter(
          ([key]) =>
            !key.startsWith('on') ||
            ![
              'onRowClicked',
              'onCellClicked',
              'onRowDoubleClicked',
              'onCellDoubleClicked',
              'onRowSelected',
            ].includes(key)
        )
      ),
    }

    const userGridOptions = props.value.gridOptions || {}

    cachedGridOptions = {
      ...baseGridOptions,
      components: {
        actionCell: ActionCell,
        ...baseGridOptions.components,
        ...userGridOptions.components,
      },
      ...Object.fromEntries(
        Object.entries(userGridOptions).filter(([key]) => key !== 'components')
      ),
    }
    return cachedGridOptions
  })

  const gridOptions = computed<GridOptions>(() => mergedGridOptions.value)

  // ==================== 优化：初始化滚动监听 ====================

  /**
   * 初始化滚动监听器
   * 提前绑定，确保首次数据更新前就能拦截滚动状态
   */
  const initScrollListener = (api: GridApi) => {
    const vp = (api as any).gridBodyCtrl?.eBodyViewport || null
    if (!vp) {
      return void 0
    }

    const onViewportScroll = () => {
      const now = Date.now()
      lastScrollTime = now

      // 立即标记为滚动状态
      if (!isUserScrolling.value) {
        isUserScrolling.value = true
      }

      // 清除旧的空闲计时器
      if (scrollIdleTimer) {
        clearTimeout(scrollIdleTimer)
      }

      // 设置新的空闲计时器
      scrollIdleTimer = window.setTimeout(() => {
        // 二次确认：防止计时器触发时又有新的滚动
        if (Date.now() - lastScrollTime >= SCROLL_IDLE_THRESHOLD) {
          isUserScrolling.value = false
          // 应用所有待处理的数据
          if (pendingDataQueue.length > 0) {
            // 合并所有待处理数据（取最新的一批）
            const latestData = pendingDataQueue[pendingDataQueue.length - 1]
            pendingDataQueue = []

            // 一次性同步提交
            applySeamlessTransaction(latestData, { preferSync: true })
          }

          // 滚动停止后，如果开启了列宽适配，延迟执行一次
          if (props.value.fitColumnsToViewport) {
            // 清除之前的延迟计时器
            if (fitColumnsAfterScrollTimeout) {
              clearTimeout(fitColumnsAfterScrollTimeout)
            }
            // 延迟 200ms 执行，确保滚动完全停止
            fitColumnsAfterScrollTimeout = window.setTimeout(() => {
              if (!isUserScrolling.value) {
                safeGridApiCall(api => api.sizeColumnsToFit())
              }
            }, 200)
          }
        }
      }, SCROLL_IDLE_THRESHOLD)
    }

    vp.addEventListener('scroll', onViewportScroll, { passive: true })
    gridViewportEl = vp
    ;(gridViewportEl as any).__revo_onScroll__ = onViewportScroll
  }

  // ==================== i18n 相关 ====================

  function buildAgGridLocaleText() {
    return {
      page: t('common.pagination.page'),
      to: t('common.pagination.to'),
      of: t('common.pagination.of'),
      pageSize: t('common.pagination.pageSize'),
      pageSizeSelectorLabel: t('common.pagination.pageSize'),
      next: t('common.pagination.next'),
      previous: t('common.pagination.previous'),
      first: t('common.pagination.first'),
      last: t('common.pagination.last'),
      firstPage: t('common.pagination.first'),
      lastPage: t('common.pagination.last'),
      nextPage: t('common.pagination.next'),
      previousPage: t('common.pagination.previous'),
      loadingOoo: t('common.loading'),
      noRowsToShow: t('common.gridTable.noRowsToShow'),
      filterOoo: t('common.filter.placeholder'),
      searchOoo: t('common.filter.placeholder'),
      equals: t('common.filter.equals'),
      notEqual: t('common.filter.notEqual'),
      notEquals: t('common.filter.notEqual'),
      contains: t('common.filter.contains'),
      notContains: t('common.filter.notContains'),
      startsWith: t('common.filter.startsWith'),
      endsWith: t('common.filter.endsWith'),
      blank: t('common.filter.blank'),
      notBlank: t('common.filter.notBlank'),
      lessThan: t('common.filter.lessThan'),
      lessThanOrEqual: t('common.filter.lessThanOrEqual'),
      greaterThan: t('common.filter.greaterThan'),
      greaterThanOrEqual: t('common.filter.greaterThanOrEqual'),
      inRange: t('common.filter.inRange'),
      applyFilter: t('common.filter.apply'),
      clearFilter: t('common.filter.clear'),
      resetFilter: t('common.filter.clear'),
      andCondition: t('common.filter.andCondition'),
      orCondition: t('common.filter.orCondition'),
    } as any
  }

  const onLocaleChanged = () => {
    if (gridApi.value && !gridApi.value.isDestroyed()) {
      try {
        gridApi.value.refreshHeader()
        gridApi.value.redrawRows()
      } catch (_err) {
        // 静默失败
      }
    }
  }
  onMounted(() => window.addEventListener('locale-changed', onLocaleChanged))
  onUnmounted(() => window.removeEventListener('locale-changed', onLocaleChanged))

  // ==================== 样式相关 ====================

  const gridStyle = computed<Record<string, string>>(() => {
    const cssVars = colorConfigToCssVars(mergedColorConfig.value)

    if (props.value.enableRowHoverHighlight === false) {
      cssVars['--ag-row-hover-color'] = 'transparent'
    }

    {
      const c = mergedColorConfig.value.cellFocusBackgroundColor
      if (props.value.enableCellFocusHighlight === false) {
        cssVars['--ag-cell-focus-background-color'] = 'transparent'
        cssVars['--ag-range-selection-border-color'] = 'transparent'
        cssVars['--ag-focus-border-color'] = 'transparent'
        cssVars['--ag-cell-focus-border-color'] = 'transparent'
      } else if (c) {
        cssVars['--ag-cell-focus-background-color'] = c
        cssVars['--ag-range-selection-border-color'] = 'transparent'
        cssVars['--ag-focus-border-color'] = 'transparent'
        cssVars['--ag-cell-focus-border-color'] = 'transparent'
      }
    }

    const { height, minHeight, maxHeight, heightMode, width, minWidth, maxWidth, widthMode } =
      mergedSizeConfig.value

    // ==================== 高度样式处理 ====================
    if (heightMode === 'fill') {
      cssVars['height'] = '100%'
      cssVars['min-height'] = minHeight ? `${minHeight}px` : '0'
      cssVars['max-height'] = maxHeight ? `${maxHeight}px` : 'none'
      cssVars['overflow'] = 'auto'
    } else if (heightMode === 'fixed') {
      cssVars['height'] = `${height || 0}px`
      cssVars['min-height'] = minHeight ? `${minHeight}px` : `${height || 0}px`
      cssVars['max-height'] = maxHeight ? `${maxHeight}px` : `${height || 0}px`
      cssVars['overflow'] = 'auto'
    } else {
      if (height && height > 0) {
        cssVars['height'] = `${height}px`
      }
      if (minHeight) {
        cssVars['min-height'] = `${minHeight}px`
      }
      if (maxHeight) {
        cssVars['max-height'] = `${maxHeight}px`
      }
    }

    // ==================== 宽度样式处理 ====================
    if (widthMode === 'fill') {
      cssVars['width'] = '100%'
      cssVars['min-width'] = minWidth ? `${minWidth}px` : '0'
      cssVars['max-width'] = maxWidth ? `${maxWidth}px` : 'none'
    } else if (widthMode === 'fixed') {
      cssVars['width'] = `${width || 0}px`
      cssVars['min-width'] = minWidth ? `${minWidth}px` : `${width || 0}px`
      cssVars['max-width'] = maxWidth ? `${maxWidth}px` : `${width || 0}px`
    } else {
      // 默认 fill 模式：撑满容器
      cssVars['width'] = '100%'
      if (minWidth) {
        cssVars['min-width'] = `${minWidth}px`
      }
      if (maxWidth) {
        cssVars['max-width'] = `${maxWidth}px`
      }
    }

    if (mergedSizeConfig.value.rowHeight) {
      cssVars['--ag-row-height'] = `${mergedSizeConfig.value.rowHeight}px`
    }
    if (mergedSizeConfig.value.headerHeight) {
      cssVars['--ag-header-height'] = `${mergedSizeConfig.value.headerHeight}px`
    }

    cssVars['--ag-border-radius'] = 'var(--rounded)'

    if (props.value.enableZebraStripe) {
      cssVars['--ag-odd-row-background-color'] =
        cssVars['--ag-odd-row-background-color'] || 'var(--bg200)'
    } else {
      if (cssVars['--ag-background-color']) {
        cssVars['--ag-odd-row-background-color'] = cssVars['--ag-background-color']
      }
    }

    const base = {
      ...cssVars,
      ...props.value.customStyle,
      borderRadius: 'var(--rounded)',
    } as Record<string, string>

    const splitColor = mergedColorConfig.value.borderColor || 'var(--bg300)'

    if (props.value.enableHorizontalSplitLine === false) {
      base['--ag-row-border-style'] = 'none'
      base['--ag-row-border-color'] = 'transparent'
      base['--ag-row-border-width'] = '0px'
    } else {
      base['--ag-row-border-style'] = 'solid'
      base['--ag-row-border-color'] = splitColor
      base['--ag-row-border-width'] = '1px'
    }

    if (props.value.enableVerticalSplitLine === false) {
      base['--ag-column-border-style'] = 'none'
      base['--ag-column-border-color'] = 'transparent'
      base['--ag-column-border-width'] = '0px'
    } else {
      base['--ag-column-border-style'] = 'solid'
      base['--ag-column-border-color'] = splitColor
      base['--ag-column-border-width'] = '1px'
    }

    if (props.value.enableVerticalSplitLine !== false) {
      base['--ag-cell-border-style'] = 'solid'
      base['--ag-cell-border-color'] = splitColor
      base['--ag-cell-border-width'] = '1px'
    }

    return base
  })

  const scrollbarStyles = computed<string>(() => {
    return generateScrollbarStyles(
      mergedColorConfig.value,
      mergedSizeConfig.value.scrollbarSize || 12,
      {
        enableHorizontalSplitLine: props.value.enableHorizontalSplitLine,
        enableVerticalSplitLine: props.value.enableVerticalSplitLine,
        enableCellFocusHighlight: props.value.enableCellFocusHighlight,
        enableRowHoverHighlight: props.value.enableRowHoverHighlight,
        enableColumnHoverHighlight: props.value.enableColumnHoverHighlight,
      }
    )
  })

  const toolbarStyle = computed<Record<string, string>>(() => {
    const config = mergedColorConfig.value
    return {
      backgroundColor: config.toolbarBackgroundColor || 'var(--bg200)',
    }
  })

  const statusBarStyle = computed<Record<string, string>>(() => {
    const config = mergedColorConfig.value
    return {
      backgroundColor: config.statusBarBackgroundColor || 'var(--bg200)',
      color: config.statusBarTextColor || 'var(--text100)',
    }
  })

  const gridClass = computed<string>(() => {
    const themeClass = 'ag-theme-alpine'
    const customClass = props.value.customClass || ''
    return `${themeClass} ${customClass}`.trim()
  })

  // ==================== 方法 ====================

  const autoSizeColumns = () => {
    safeGridApiCall(api => {
      const colIds: string[] = []
      api.getColumns()?.forEach(col => {
        colIds.push(col.getColId())
      })
      if (colIds.length) {
        api.autoSizeColumns(colIds, false)
      }
    })
  }

  /** 列宽适配防抖计时器 */
  let fitColumnsTimeout: number | null = null
  /** 滚动停止后延迟适配的计时器 */
  let fitColumnsAfterScrollTimeout: number | null = null

  /**
   * 使列宽适配视口（带滚动状态检查）
   * 在滚动时不触发，避免闪烁
   */
  const fitColumnsToViewport = () => {
    if (!props.value.fitColumnsToViewport) {
      return
    }

    // 如果正在滚动，延迟到滚动结束后执行
    if (isUserScrolling.value) {
      // 清除之前的延迟计时器
      if (fitColumnsAfterScrollTimeout) {
        clearTimeout(fitColumnsAfterScrollTimeout)
      }
      // 设置新的延迟计时器，在滚动停止后 300ms 执行
      fitColumnsAfterScrollTimeout = window.setTimeout(() => {
        if (!isUserScrolling.value) {
          safeGridApiCall(api => api.sizeColumnsToFit())
        }
      }, 300)
      return
    }

    // 在 transaction 模式下，如果布局已就绪且列宽已锁定，不重新计算
    if (
      props.value.seamlessDataUpdateMode === 'transaction' &&
      layoutReady.value &&
      widthsLocked.value
    ) {
      return
    }

    // 防抖处理，避免频繁调用
    if (fitColumnsTimeout) {
      clearTimeout(fitColumnsTimeout)
    }
    fitColumnsTimeout = window.setTimeout(() => {
      safeGridApiCall(api => api.sizeColumnsToFit())
    }, 50)
  }

  const lockCurrentColumnWidths = () => {
    safeGridApiCall(api => {
      const cols = api.getColumns() || []
      if (!cols.length) {
        return
      }
      cols.forEach(col => {
        const id = col.getColId()
        const actual = (col as any).getActualWidth
          ? (col as any).getActualWidth()
          : (col as any).actualWidth
        const w = Math.round(actual || 0)
        if (id && w > 0) {
          ;(api as any).setColumnWidth?.(id, w)
        }
      })
      const currentDefault = api.getGridOption('defaultColDef') || {}
      api.setGridOption('defaultColDef', {
        ...currentDefault,
        resizable: false,
      })
      widthsLocked.value = true
    })
  }

  const exportData = (format: 'csv' | 'excel') => {
    const data = getFilteredData()
    const displayData = transformDataForExport(
      data,
      processedColumnDefs.value,
      gridApi.value as any
    )
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')

    if (format === 'csv') {
      exportToCsv(displayData, `export-${timestamp}.csv`)
    } else {
      exportToExcel(displayData, `export-${timestamp}.xls`)
    }
  }

  const getFilteredData = (): any[] => {
    const filteredData: any[] = []
    safeGridApiCall(api => {
      api.forEachNodeAfterFilter(node => {
        if (node.data) {
          filteredData.push(node.data)
        }
      })
    })
    return filteredData.length > 0 ? filteredData : rowData.value
  }

  const setRowData = (data: any[]) => {
    rowData.value = data
    safeGridApiCall(api => api.setGridOption('rowData', data))
  }

  const addRow = (row: any) => {
    rowData.value.push(row)
    safeGridApiCall(api => {
      api.applyTransaction({ add: [row] })
    })
  }

  const addRows = (rows: any[]) => {
    rowData.value.push(...rows)
    safeGridApiCall(api => {
      api.applyTransaction({ add: rows })
    })
  }

  const loadMoreData = async (
    newRows: any[],
    options?: {
      preserveScrollPosition?: boolean
      scrollToBottom?: boolean
    }
  ) => {
    if (!newRows || newRows.length === 0) {
      return
    }

    const preserveScrollPosition = options?.preserveScrollPosition !== false
    const scrollToBottom = options?.scrollToBottom || false

    // ==================== 优化：滚动时不恢复位置 ====================
    let scrollTopBefore = 0
    if (preserveScrollPosition && !isUserScrolling.value && gridApi.value) {
      const gridBody = (gridApi.value as any).gridBodyCtrl?.eBodyViewport
      if (gridBody) {
        scrollTopBefore = gridBody.scrollTop
      }
    }

    rowData.value.push(...newRows)

    safeGridApiCall(api => {
      api.applyTransaction({ add: newRows })
    })

    // ==================== 优化：仅在非滚动状态下恢复位置 ====================
    if (preserveScrollPosition && scrollTopBefore > 0 && !isUserScrolling.value) {
      await new Promise(resolve => setTimeout(resolve, 0))
      safeGridApiCall(api => {
        const gridBody = (api as any).gridBodyCtrl?.eBodyViewport
        if (gridBody) {
          gridBody.scrollTop = scrollTopBefore
        }
      })
    }

    if (scrollToBottom) {
      await new Promise(resolve => setTimeout(resolve, 0))
      safeGridApiCall(api => {
        api.ensureIndexVisible(rowData.value.length - 1, 'bottom')
      })
    }
  }

  const updateRow = (row: any) => {
    if (gridApi.value) {
      const rowNode = gridApi.value.getRowNode(row.id || row.rowIndex)
      if (rowNode) {
        rowNode.setData(row)
      }
    }
  }

  const deleteRow = (row: any) => {
    if (gridApi.value) {
      const rowNode = gridApi.value.getRowNode(row.id || row.rowIndex)
      if (rowNode) {
        gridApi.value.applyTransaction({ remove: [row] })
      }
    }
  }

  const clearSelection = () => {
    safeGridApiCall(api => api.deselectAll())
  }

  const selectAll = () => {
    safeGridApiCall(api => api.selectAll())
  }

  const deselectAll = () => {
    safeGridApiCall(api => api.deselectAll())
  }

  const clearCellFocus = () => {
    safeGridApiCall(api => {
      try {
        if (typeof api.clearFocusedCell === 'function') {
          api.clearFocusedCell()
        } else if (typeof api.setFocusedCell === 'function') {
          api.setFocusedCell(0, '')
        } else {
          api.refreshCells({ force: true })
        }
      } catch (error) {
        console.warn('清除单元格聚焦失败:', error)
      }
    })

    if (gridContainer.value) {
      const containerElement = gridContainer.value.$el || gridContainer.value
      if (containerElement) {
        const focusedCells = containerElement.querySelectorAll('.ag-cell-focus')
        focusedCells.forEach((cell: Element) => {
          cell.classList.remove('ag-cell-focus')
        })
      }
    }
  }

  const copySelectedCellsToClipboard = () => {
    safeGridApiCall(api => {
      try {
        const focusedCell = api.getFocusedCell()
        if (!focusedCell) {
          return
        }

        const rowNode = api.getDisplayedRowAtIndex(focusedCell.rowIndex)
        if (!rowNode || !rowNode.data) {
          return
        }

        const column = api.getColumnDef(focusedCell.column.getColId())
        const field = focusedCell.column.getColId()
        const value = rowNode.data[field]

        let displayValue = value
        if (column && column.valueFormatter && typeof column.valueFormatter === 'function') {
          try {
            displayValue = column.valueFormatter({
              value: value,
              data: rowNode.data,
              node: rowNode,
              colDef: column,
              column: focusedCell.column,
              api: api,
              context: {},
            })
          } catch (_error) {
            displayValue = value
          }
        }

        const clipboardData = String(displayValue || '')

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(clipboardData).catch(() => {
            fallbackCopyToClipboard(clipboardData)
          })
        } else {
          fallbackCopyToClipboard(clipboardData)
        }
      } catch (_error) {
        // 静默处理错误
      }
    })
  }

  const fallbackCopyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-999999px'
    textarea.style.top = '-999999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    try {
      document.execCommand('copy')
    } catch (_err) {
      // 静默处理错误
    } finally {
      document.body.removeChild(textarea)
    }
  }

  // ==================== Loading 控制方法 ====================

  const showLoadingOverlay = () => {
    safeGridApiCall(api => {
      if ('setGridOption' in api) {
        ;(api as any).setGridOption('loading', true)
      } else {
        ;(api as any).showLoadingOverlay?.()
      }
    })
  }

  const hideOverlay = () => {
    safeGridApiCall(api => {
      if ('setGridOption' in api) {
        ;(api as any).setGridOption('loading', false)
      } else {
        ;(api as any).hideOverlay?.()
      }
    })
  }

  const showNoRowsOverlay = () => {
    safeGridApiCall(api => {
      ;(api as any).showNoRowsOverlay?.()
    })
  }

  const setLoading = (loading: boolean) => {
    safeGridApiCall(api => {
      if ('setGridOption' in api) {
        ;(api as any).setGridOption('loading', !!loading)
      } else {
        if (loading) {
          ;(api as any).showLoadingOverlay?.()
        } else {
          ;(api as any).hideOverlay?.()
        }
      }
    })
  }

  // ==================== 优化：无感知事务更新核心逻辑 ====================

  const computeRowId = (row: any): string => {
    const id = row?.id || row?.[Object.keys(row || {})[0]]
    const stringId = String(id || '')
    if (!stringId) {
      return `row-${Math.random().toString(36).substr(2, 9)}`
    }
    return generateIdFromKey(stringId)
  }

  /**
   * 应用无感知事务更新
   * @param nextRows 新数据
   * @param options 选项
   */
  const applySeamlessTransaction = (nextRows: any[], options?: { preferSync?: boolean }) => {
    // 滚动中：直接忽略本次更新
    // 如果正在滚动，入队并返回（统一由空闲时机消费）
    if (isUserScrolling.value) {
      pendingDataQueue.push(nextRows)
      if (pendingDataQueue.length > 3) {
        pendingDataQueue.shift()
      }
      return
    }
    const oldArr = rowData.value
    const oldMap = new Map<string, { index: number; row: any }>()
    for (let i = 0; i < oldArr.length; i++) {
      oldMap.set(computeRowId(oldArr[i]), { index: i, row: oldArr[i] })
    }

    const newMap = new Map<string, any>()
    const toAdd: any[] = []
    const toUpdate: any[] = []

    const isRowShallowChanged = (a: any, b: any) => {
      if (a === b) {
        return false
      }
      if (!a || !b) {
        return true
      }
      const aKeys = Object.keys(a)
      const bKeys = Object.keys(b)
      if (aKeys.length !== bKeys.length) {
        return true
      }
      for (let i = 0; i < aKeys.length; i++) {
        const k = aKeys[i]
        if (a[k] !== b[k]) {
          return true
        }
      }
      return false
    }

    for (let j = 0; j < nextRows.length; j++) {
      const r = nextRows[j]
      const rid = computeRowId(r)
      newMap.set(rid, r)
      const old = oldMap.get(rid)
      if (!old) {
        toAdd.push(r)
      } else {
        if (isRowShallowChanged(old.row, r)) {
          toUpdate.push(r)
        }
      }
    }

    const toRemove: any[] = []
    oldMap.forEach((val, id) => {
      if (!newMap.has(id)) {
        toRemove.push(val.row)
      }
    })

    // ==================== 优化：滚动时完全跳过 scrollTop 恢复 ====================
    let scrollTopBefore = 0
    const shouldRestoreScroll = !isUserScrolling.value && gridApi.value

    if (shouldRestoreScroll) {
      const gridBody = (gridApi.value as any).gridBodyCtrl?.eBodyViewport
      if (gridBody) {
        scrollTopBefore = gridBody.scrollTop
      }
    }

    // 应用事务更新
    safeGridApiCall(api => {
      if (toAdd.length || toUpdate.length || toRemove.length) {
        if (options?.preferSync) {
          // 同步更新（滚动停止后使用）
          api.applyTransaction({ add: toAdd, update: toUpdate, remove: toRemove })
        } else {
          // 异步批量更新（静止时使用）
          ;(api as any).applyTransactionAsync?.({ add: toAdd, update: toUpdate, remove: toRemove })
        }
      }
    })

    // 同步本地 rowData（保持同一引用）
    if (toRemove.length) {
      for (let i = oldArr.length - 1; i >= 0; i--) {
        const rid = computeRowId(oldArr[i])
        if (!newMap.has(rid)) {
          oldArr.splice(i, 1)
        }
      }
    }

    if (toUpdate.length) {
      const indexMap = new Map<string, number>()
      for (let i = 0; i < oldArr.length; i++) {
        indexMap.set(computeRowId(oldArr[i]), i)
      }
      for (const r of toUpdate) {
        const rid = computeRowId(r)
        const idx = indexMap.get(rid)
        if (idx !== undefined) {
          oldArr[idx] = r
        }
      }
    }

    if (toAdd.length) {
      oldArr.push(...toAdd)
    }

    // ==================== 优化：仅在非滚动状态下恢复滚动位置 ====================
    if (shouldRestoreScroll && scrollTopBefore > 0) {
      setTimeout(() => {
        safeGridApiCall(api => {
          const gridBody = (api as any).gridBodyCtrl?.eBodyViewport
          if (gridBody && !isUserScrolling.value) {
            gridBody.scrollTop = scrollTopBefore
          }
        })
      }, 0)
    }
  }

  // ==================== 优化：监听 rowData 变化 ====================

  watch(
    () => props.value.rowData,
    next => {
      const normalized = Array.isArray(next) ? next : []
      const mode = props.value.seamlessDataUpdateMode || 'off'

      // 原来位置：当 mode === 'transaction' 时
      if (mode === 'transaction') {
        if (isUserScrolling.value) {
          // 原来直接 return —— 改为入队
          // 保留最新一批即可，防止队列暴涨
          pendingDataQueue.push(normalized)
          if (pendingDataQueue.length > 3) {
            // 可调，保留最近 3 次
            pendingDataQueue.shift()
          }
          return
        }
        applySeamlessTransaction(normalized, { preferSync: false })
      } else if (mode === 'delta') {
        rowData.value = normalized
        safeGridApiCall(api => {
          if ('setGridOption' in api) {
            ;(api as any).setGridOption('rowData', normalized)
          } else {
            ;(api as any).setRowData?.(normalized)
          }
        })
      } else {
        rowData.value = normalized
        safeGridApiCall(api => {
          if ('setGridOption' in api) {
            ;(api as any).setGridOption('rowData', normalized)
          } else {
            ;(api as any).setRowData?.(normalized)
          }
        })
      }
    },
    { deep: false }
  )

  watch(
    () => props.value.columnDefs,
    () => {
      if (gridApi.value) {
        if (props.value.seamlessDataUpdateMode === 'transaction' && widthsLocked.value) {
          return
        }
        gridApi.value.setGridOption('columnDefs', processedColumnDefs.value)
        gridApi.value.refreshCells()
      }
    },
    { deep: true }
  )

  watch(
    () => props.value.colorConfig,
    () => {
      if (gridApi.value) {
        const containerElement = gridContainer.value?.$el || gridContainer.value
        if (containerElement) {
          Object.assign(containerElement.style, gridStyle.value)
        }
      }
    },
    { deep: true }
  )

  watch(
    () => props.value.sizeConfig,
    () => {
      if (gridApi.value) {
        const containerElement = gridContainer.value?.$el || gridContainer.value
        if (containerElement) {
          Object.assign(containerElement.style, gridStyle.value)
        }

        const sizeOptions = sizeConfigToGridOptions(mergedSizeConfig.value)

        if (sizeOptions.rowHeight) {
          gridApi.value.setGridOption('rowHeight', sizeOptions.rowHeight)
        }

        if (sizeOptions.headerHeight) {
          gridApi.value.setGridOption('headerHeight', sizeOptions.headerHeight)
        }

        const currentDefaultColDef = gridApi.value.getGridOption('defaultColDef') || {}
        gridApi.value.setGridOption('defaultColDef', {
          ...currentDefaultColDef,
          width: sizeOptions.defaultColDef?.width,
        })

        if (mergedSizeConfig.value.defaultColumnWidth === 'auto') {
          setTimeout(() => {
            autoSizeColumns()
          }, 0)
        }

        if (sizeOptions.defaultColDef?.minWidth) {
          gridApi.value.setGridOption('defaultColDef', {
            ...gridApi.value.getGridOption('defaultColDef'),
            minWidth: sizeOptions.defaultColDef.minWidth,
          })
        }

        if (sizeOptions.defaultColDef?.maxWidth) {
          gridApi.value.setGridOption('defaultColDef', {
            ...gridApi.value.getGridOption('defaultColDef'),
            maxWidth: sizeOptions.defaultColDef.maxWidth,
          })
        }

        gridApi.value.setGridOption('defaultColDef', {
          ...currentDefaultColDef,
          cellStyle: {
            ...currentDefaultColDef.cellStyle,
            textAlign: mergedSizeConfig.value.globalCellTextAlign || 'center',
            display: 'flex',
            alignItems:
              mergedSizeConfig.value.globalCellVerticalAlign === 'top'
                ? 'flex-start'
                : mergedSizeConfig.value.globalCellVerticalAlign === 'bottom'
                  ? 'flex-end'
                  : 'center',
            justifyContent:
              mergedSizeConfig.value.globalCellTextAlign === 'center'
                ? 'center'
                : mergedSizeConfig.value.globalCellTextAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
          },
          headerClass: `ag-header-${mergedSizeConfig.value.globalHeaderTextAlign || 'center'} ag-header-${mergedSizeConfig.value.globalHeaderVerticalAlign || 'middle'}`,
        })

        // 尺寸配置变化时，只有在非滚动状态下才适配列宽
        if (props.value.fitColumnsToViewport && !isUserScrolling.value) {
          fitColumnsToViewport()
        }
      }
    },
    { deep: true }
  )

  watch(
    () => sizeStore.size,
    () => {
      if (gridApi.value) {
        const containerElement = gridContainer.value?.$el || gridContainer.value
        if (containerElement) {
          Object.assign(containerElement.style, gridStyle.value)
        }

        const sizeOptions = sizeConfigToGridOptions(mergedSizeConfig.value)

        if (sizeOptions.rowHeight) {
          gridApi.value.setGridOption('rowHeight', sizeOptions.rowHeight)
        }

        if (sizeOptions.headerHeight) {
          gridApi.value.setGridOption('headerHeight', sizeOptions.headerHeight)
        }

        const currentDefaultColDef = gridApi.value.getGridOption('defaultColDef') || {}
        gridApi.value.setGridOption('defaultColDef', {
          ...currentDefaultColDef,
          width: sizeOptions.defaultColDef?.width,
        })

        if (mergedSizeConfig.value.defaultColumnWidth === 'auto') {
          setTimeout(() => {
            autoSizeColumns()
          }, 0)
        }

        if (sizeOptions.defaultColDef?.minWidth) {
          gridApi.value.setGridOption('defaultColDef', {
            ...gridApi.value.getGridOption('defaultColDef'),
            minWidth: sizeOptions.defaultColDef.minWidth,
          })
        }

        if (sizeOptions.defaultColDef?.maxWidth) {
          gridApi.value.setGridOption('defaultColDef', {
            ...gridApi.value.getGridOption('defaultColDef'),
            maxWidth: sizeOptions.defaultColDef.maxWidth,
          })
        }

        gridApi.value.setGridOption('defaultColDef', {
          ...currentDefaultColDef,
          cellStyle: {
            ...currentDefaultColDef.cellStyle,
            textAlign: mergedSizeConfig.value.globalCellTextAlign || 'center',
            display: 'flex',
            alignItems:
              mergedSizeConfig.value.globalCellVerticalAlign === 'top'
                ? 'flex-start'
                : mergedSizeConfig.value.globalCellVerticalAlign === 'bottom'
                  ? 'flex-end'
                  : 'center',
            justifyContent:
              mergedSizeConfig.value.globalCellTextAlign === 'center'
                ? 'center'
                : mergedSizeConfig.value.globalCellTextAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
          },
          headerClass: `ag-header-${mergedSizeConfig.value.globalHeaderTextAlign || 'center'} ag-header-${mergedSizeConfig.value.globalHeaderVerticalAlign || 'middle'}`,
        })

        // 系统尺寸变化时，只有在非滚动状态下才适配列宽
        if (props.value.fitColumnsToViewport && !isUserScrolling.value) {
          fitColumnsToViewport()
        }

        gridApi.value.refreshCells()
      }
    }
  )

  const setMergedCellStyles = () => {
    if (!gridContainer.value) {
      return
    }

    // 仅保留局部变量以备将来扩展（避免未使用警告）
    const _colorConfig = props.value.colorConfig || {}
    const _enableZebraStripe = props.value.enableZebraStripe || false

    const containerElement = (gridContainer.value as any).$el || gridContainer.value
    if (!containerElement || !containerElement.querySelectorAll) {
      return
    }

    // 仅针对真正配置了 rowSpan 的列进行处理，避免误判
    const rowSpanColIds = new Set<string>(
      processedColumnDefs.value
        .filter(col => (col as any).rowSpan)
        .map(col => String((col as any).colId || (col as any).field || ''))
        .filter(Boolean)
    )

    const allRows = Array.from(
      containerElement.querySelectorAll('.ag-center-cols-container .ag-row') || []
    ) as HTMLElement[]
    const allCells = containerElement.querySelectorAll('.ag-center-cols-container .ag-cell')

    // 清理上次打的标记（不再使用隐藏逻辑，避免出现空白）
    containerElement.querySelectorAll('.ag-span-master').forEach((el: Element) => {
      const elh = el as HTMLElement
      elh.classList.remove('ag-span-master')
      elh.style.zIndex = ''
      elh.style.position = ''
      elh.style.background = ''
      elh.style.backgroundColor = ''
    })

    // 兜底：如果历史运行留下了被隐藏的单元格，这里一并恢复
    containerElement.querySelectorAll('.ag-cell.ag-cell-hidden-by-span').forEach((el: Element) => {
      const elh = el as HTMLElement
      elh.style.visibility = ''
      elh.style.border = ''
      elh.classList.remove('ag-cell-hidden-by-span')
    })

    const defaultRowHeight = mergedSizeConfig.value.rowHeight || 38

    allCells.forEach((cell: Element) => {
      const style = (cell as HTMLElement).style
      const colId = (cell as HTMLElement).getAttribute('col-id') || ''

      // 非 rowSpan 列直接跳过，避免误伤
      if (!rowSpanColIds.has(colId)) {
        return
      }
      const computedStyle = window.getComputedStyle(cell)
      const height = parseInt(style.height || '') || parseInt(computedStyle.height)

      // 识别“跨行”的单元格：高度明显超过一行才视为跨行
      // 额外阈值：小于 1.8 行认为不是跨行（过滤轻微高度差）
      if (height < defaultRowHeight * 1.8) {
        return
      }
      const spanRows = Math.max(1, Math.round(height / Math.max(1, defaultRowHeight)))
      if (spanRows <= 1) {
        return
      }

      // 背景与层级，确保覆盖下面的格子
      const rowElement = (cell as HTMLElement).closest('.ag-row') as HTMLElement | null
      const rowIndex = rowElement ? allRows.indexOf(rowElement) : -1
      const isOddRow = rowIndex % 2 === 1

      // 不再修改任何背景/层级，完全交由 AG Grid 默认样式处理，避免串色/遮挡
      void isOddRow
    })
  }

  watch(
    () => [
      props.value.enableSorting,
      props.value.enableFilter,
      props.value.enableColumnResize,
      props.value.rowSelection,
      props.value.enableRowClickSelection,
      props.value.selectionCheckboxPosition,
      props.value.enableRowHoverHighlight,
      props.value.enableCellFocusHighlight,
      props.value.enableColumnDrag,
      props.value.enableZebraStripe,
      props.value.enableVerticalSplitLine,
      props.value.enableHorizontalSplitLine,
      props.value.fitColumnsToViewport,
    ],
    () => {
      if (gridApi.value && !gridApi.value.isDestroyed()) {
        const currentDefaultColDef = gridApi.value.getGridOption('defaultColDef') || {}
        gridApi.value.setGridOption('defaultColDef', {
          ...currentDefaultColDef,
          sortable: props.value.enableSorting ?? false,
          filter: props.value.enableFilter ?? false,
          resizable: props.value.enableColumnResize ?? false,
          suppressMovable: props.value.enableColumnDrag === false ? true : false,
        })

        setTimeout(() => {
          setMergedCellStyles()
        }, 100)

        const selection = (() => {
          if (!props.value.rowSelection) {
            return undefined
          }
          const isMultiple = props.value.rowSelection === 'multiple'
          const selectionObj: any = {
            mode: isMultiple ? 'multiRow' : 'singleRow',
            enableClickSelection: !!props.value.enableRowClickSelection,
            enableSelectionWithoutKeys: isMultiple ? true : false,
          }
          if (!selectionObj.enableClickSelection) {
            selectionObj.checkboxes = {
              headerCheckbox: isMultiple ? true : false,
              position: (props.value.selectionCheckboxPosition || 'left') as 'left' | 'right',
            }
          } else if (isMultiple) {
            selectionObj.checkboxes = {
              headerCheckbox: true,
              position: (props.value.selectionCheckboxPosition || 'left') as 'left' | 'right',
            }
          }
          return selectionObj
        })()

        const selectionColumnDef = (() => {
          if (!props.value.rowSelection) {
            return undefined
          }
          const pos = (props.value.selectionCheckboxPosition || 'left') as 'left' | 'right'
          return {
            headerName: '',
            pinned: pos,
            width: 48,
            minWidth: 40,
            maxWidth: 60,
            resizable: false,
            sortable: false,
            suppressHeaderMenuButton: true,
            suppressMovable: true,
          } as any
        })()

        gridApi.value.setGridOption('rowSelection', selection)
        gridApi.value.setGridOption('selectionColumnDef', selectionColumnDef)

        if (!(props.value.seamlessDataUpdateMode === 'transaction' && widthsLocked.value)) {
          gridApi.value.setGridOption('columnDefs', processedColumnDefs.value)
        }

        gridApi.value.setGridOption(
          'suppressRowHoverHighlight',
          props.value.enableRowHoverHighlight === false ? true : undefined
        )

        gridApi.value.setGridOption(
          'columnHoverHighlight',
          props.value.enableColumnHoverHighlight === false ? false : true
        )

        if (!(props.value.seamlessDataUpdateMode === 'transaction' && widthsLocked.value)) {
          gridApi.value.setGridOption('columnDefs', processedColumnDefs.value)
        }

        gridApi.value.refreshCells()

        // 配置变化时，只有在非滚动状态下才适配列宽
        if (props.value.fitColumnsToViewport && !isUserScrolling.value) {
          fitColumnsToViewport()
        }
      }
    },
    { deep: true }
  )

  // ==================== 生命周期 ====================

  const handleDocumentClick = (event: MouseEvent) => {
    if (gridContainer.value) {
      const containerElement = gridContainer.value.$el || gridContainer.value
      if (containerElement && !containerElement.contains(event.target as Node)) {
        clearCellFocus()
      }
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      if (gridContainer.value) {
        const containerElement = gridContainer.value.$el || gridContainer.value
        if (containerElement && containerElement.contains(event.target as Node)) {
          event.preventDefault()
          copySelectedCellsToClipboard()
        }
      }
    }
  }

  watch(
    () => props.value.enableCellFocusHighlight,
    enabled => {
      if (enabled) {
        document.addEventListener('click', handleDocumentClick)
      } else {
        document.removeEventListener('click', handleDocumentClick)
      }
    },
    { immediate: true }
  )

  watch(
    () => props.value.enableClipboard,
    enabled => {
      if (enabled) {
        document.addEventListener('keydown', handleKeyDown)
      } else {
        document.removeEventListener('keydown', handleKeyDown)
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (props.value.enableCellFocusHighlight) {
      document.addEventListener('click', handleDocumentClick)
    }
    if (props.value.enableClipboard) {
      document.addEventListener('keydown', handleKeyDown)
    }
    // 尝试提前绑定滚动监听（在 gridReady 前），以防数据先于监听到达
    // 使用容器查询 .ag-body-viewport，若未出现则重试几次
    let attempts = 0
    const tryAttach = () => {
      if (gridViewportEl) {
        return
      }
      const el = (gridContainer.value as any)?.$el || gridContainer.value
      const vp = el?.querySelector?.('.ag-body-viewport') || null
      if (vp) {
        // 与 initScrollListener 相同的逻辑
        const onViewportScroll = () => {
          const now = Date.now()
          lastScrollTime = now
          if (!isUserScrolling.value) {
            isUserScrolling.value = true
          }
          if (scrollIdleTimer) {
            clearTimeout(scrollIdleTimer)
          }
          scrollIdleTimer = window.setTimeout(() => {
            if (Date.now() - lastScrollTime >= SCROLL_IDLE_THRESHOLD) {
              isUserScrolling.value = false

              if (pendingDataQueue.length > 0) {
                const latestData = pendingDataQueue[pendingDataQueue.length - 1]
                pendingDataQueue = []
                applySeamlessTransaction(latestData, { preferSync: true })
              }

              // 滚动停止后，如果开启了列宽适配，延迟执行一次
              if (props.value.fitColumnsToViewport) {
                // 清除之前的延迟计时器
                if (fitColumnsAfterScrollTimeout) {
                  clearTimeout(fitColumnsAfterScrollTimeout)
                }
                // 延迟 200ms 执行，确保滚动完全停止
                fitColumnsAfterScrollTimeout = window.setTimeout(() => {
                  if (!isUserScrolling.value) {
                    safeGridApiCall(api => api.sizeColumnsToFit())
                  }
                }, 200)
              }
            }
          }, SCROLL_IDLE_THRESHOLD)
        }
        vp.addEventListener('scroll', onViewportScroll, { passive: true } as any)
        gridViewportEl = vp
        ;(gridViewportEl as any).__revo_onScroll__ = onViewportScroll
      } else if (attempts < 20) {
        attempts++
        setTimeout(tryAttach, 50)
      } else {
        console.warn('[GridTable] tryAttach: failed to find viewport after attempts')
      }
    }
    tryAttach()
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick)
    document.removeEventListener('keydown', handleKeyDown)

    // ==================== 优化：清理滚动监听和状态 ====================
    if (scrollIdleTimer) {
      clearTimeout(scrollIdleTimer)
      scrollIdleTimer = null
    }

    // 清理列宽适配计时器
    if (fitColumnsTimeout) {
      clearTimeout(fitColumnsTimeout)
      fitColumnsTimeout = null
    }
    if (fitColumnsAfterScrollTimeout) {
      clearTimeout(fitColumnsAfterScrollTimeout)
      fitColumnsAfterScrollTimeout = null
    }

    if (gridViewportEl && (gridViewportEl as any).__revo_onScroll__) {
      gridViewportEl.removeEventListener('scroll', (gridViewportEl as any).__revo_onScroll__)
      delete (gridViewportEl as any).__revo_onScroll__
      gridViewportEl = null
    }

    // 移除 AG Grid 官方滚动事件
    if (gridApi.value && !gridApi.value.isDestroyed()) {
      try {
        if (gridBodyScrollHandler) {
          gridApi.value.removeEventListener('bodyScroll', gridBodyScrollHandler as any)
        }
        if (gridBodyScrollEndHandler) {
          gridApi.value.removeEventListener('bodyScrollEnd', gridBodyScrollEndHandler as any)
        }
      } catch (_e) {
        // 静默
      }
    }

    // 清空待处理队列
    pendingDataQueue = []
    isUserScrolling.value = false
  })

  // ==================== 返回对象 ====================

  return {
    gridApi,
    rowData,
    selectedRows,
    gridContainer,
    layoutReady,
    gridOptions,
    mergedGridOptions,
    columnDefs: processedColumnDefs,
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
  }
}

// ==================== 辅助组合式函数 ====================

export function useGridValidation(columnDefs: Ref<ExtendedColDef[]>, rowData: Ref<any[]>) {
  const validationErrors = ref<string[]>([])

  const validate = () => {
    const columnErrors = validateColumnDefs(columnDefs.value)
    const dataErrors = validateData(rowData.value, columnDefs.value)
    validationErrors.value = [...columnErrors, ...dataErrors]
    return validationErrors.value.length === 0
  }

  const clearErrors = () => {
    validationErrors.value = []
  }

  return {
    validationErrors: computed(() => validationErrors.value),
    validate,
    clearErrors,
  }
}

export function useGridData(initialData: any[] = []) {
  const data = ref<any[]>(initialData)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const setData = (newData: any[]) => {
    data.value = newData
  }

  const addData = (item: any) => {
    data.value.push(item)
  }

  const updateData = (index: number, item: any) => {
    if (index >= 0 && index < data.value.length) {
      data.value[index] = item
    }
  }

  const removeData = (index: number) => {
    if (index >= 0 && index < data.value.length) {
      data.value.splice(index, 1)
    }
  }

  const clearData = () => {
    data.value = []
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  return {
    data,
    loading,
    error,
    setData,
    addData,
    updateData,
    removeData,
    clearData,
    setLoading,
    setError,
  }
}
