<script setup lang="ts">
import { throttle } from '@#/index'
import { RenderTSX } from '@/components/modules/render-tsx'
import { useLocale } from '@/hooks'
import { useSizeStore } from '@/stores'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { DEFAULT_PAGINATOR_CONFIG, DEFAULT_TABLE_SIZE_CONFIG } from './utils/constants'
import {
  exportToCSV,
  exportToJSON,
  getColumnHeader,
  getColumnWidthsFromTable,
  parseWidth,
} from './utils/helper'
import type {
  ColumnWidthInfo,
  FilterState,
  FooterMode,
  PaginationState,
  SortState,
  VxeTableColumn,
  VxeTableEmits,
  VxeTableExpose,
  VxeTableProps,
} from './utils/types'
const sizeStore = useSizeStore()
const appFontSizes = computed(() => sizeStore.getFontSizesValue)
const appFontSize = computed(() => sizeStore.getFontSizeValue)
const appFontSizex = computed(() => sizeStore.getFontSizexValue)
const paddings = computed(() => sizeStore.getPaddingsValue)
const padding = computed(() => sizeStore.getPaddingValue)
const paddingx = computed(() => sizeStore.getPaddingxValue)
// Body 渲染组件（避免递归更新）
// 使用函数式组件，在 render 函数中调用 body 函数
const bodyCellRenderer = defineComponent({
  name: 'BodyCellRenderer',
  props: {
    bodyFn: {
      type: Function,
      required: true,
    },
    rowData: {
      type: Object,
      required: true,
    },
    column: {
      type: Object,
      required: true,
    },
  },
  setup(props: any) {
    // 直接返回 render 函数，避免在 setup 中创建响应式引用
    return () => {
      try {
        // 直接调用 bodyFn，不进行响应式包装
        const result = props.bodyFn(props.rowData, props.column)
        // 如果返回的是字符串，转换为文本节点
        if (typeof result === 'string') {
          return h('span', result)
        }
        // 如果返回的是 VNode，直接返回
        return result
      } catch (error) {
        console.error('Body 渲染函数执行失败:', error)
        return h('span', { class: 'text-red-500' }, '渲染错误')
      }
    }
  },
})

// Props 定义
const props = withDefaults(defineProps<VxeTableProps>(), {
  selectable: false,
  selectionMode: 'multiple',
  selectionFrozen: false,
  selectionAlignFrozen: 'left',
  rowSelectable: false,
  pagination: false,
  paginatorPosition: 'center',
  sortable: false,
  filterable: false,
  globalFilter: false,
  showHeader: true,
  showFooter: false,
  footerMode: 'custom',
  exportable: false,
  showGridlines: false,
  stripedRows: false,
})

// Emits 定义
const emit = defineEmits<VxeTableEmits>()

// 国际化
const { $t: t } = useLocale()

// 表格引用
const tableRef = ref<InstanceType<typeof DataTable>>()
const tableWrapperRef = ref<HTMLElement>()
const tableWrapperFullRef = ref<HTMLElement>()
const footerColumnsWrapperRef = ref<HTMLElement | null>(null)

// 响应式数据
const selectedRows = ref<any[]>(props.selectedRows || [])
// 搜索输入框的值（实时更新，用于显示）
const searchInputValue = ref('')
// 实际用于筛选的值（防抖更新）
const globalFilterValue = ref('')
const sortField = ref<string | undefined>()
const sortOrder = ref<1 | -1 | 0 | undefined>()
const columnWidths = ref<ColumnWidthInfo[]>([])
const selectionColumnWidth = ref<number | undefined>(undefined)
const editModeComputed = computed(() => {
  if (!props.editable) {
    return undefined
  }
  return props.editMode || 'cell'
})

// ID 字段（用于行选择）
const idField = computed(() => {
  // 尝试从第一行数据中获取 ID 字段
  if (props.data.length > 0) {
    const firstRow = props.data[0]
    if ('id' in firstRow) {
      return 'id'
    }
    if ('_id' in firstRow) {
      return '_id'
    }
  }
  return undefined
})

// 计算属性：处理 sortOrder（确保类型正确，兼容 PrimeVue DataTable）
const sortOrderComputed = computed({
  get: (): number | undefined => {
    const order = sortOrder.value
    if (order === undefined) {
      return undefined
    }
    if (order === 1 || order === -1 || order === 0) {
      return order
    }
    return undefined
  },
  set: (value: number | undefined) => {
    if (value === undefined || value === 1 || value === -1 || value === 0) {
      sortOrder.value = value as 1 | -1 | 0 | undefined
    }
  },
})

// 分页状态
const paginationState = ref<PaginationState>({
  page: 1,
  rows: props.paginatorConfig?.rows || DEFAULT_PAGINATOR_CONFIG.rows || 10,
  first: 0,
  totalRecords: props.data.length,
})

// 排序状态
const sortState = ref<SortState>({
  sortField: undefined,
  sortOrder: undefined,
})

// 筛选状态（仅用于全局搜索）
const filterState = ref<FilterState>({
  filters: {},
  globalFilterValue: '',
})

// 计算属性：处理 selectionMode（根据 selectable 和 selectionMode 计算）
const selectionModeComputed = computed(() => {
  // 如果 selectable 为 false，返回 undefined（不启用选择）
  if (props.selectable === false) {
    return undefined
  }
  // 如果 selectionMode 为 null，返回 undefined
  if (props.selectionMode === null) {
    return undefined
  }
  // 默认返回 'multiple' 或用户指定的值
  return props.selectionMode || 'multiple'
})

// 计算属性：处理行点击选择
const rowSelectableComputed = computed(() => {
  return props.rowSelectable !== false // 默认 true
})

// 计算属性：国际化文本
const searchPlaceholder = computed(() => {
  return (t('components.table.search') as string) || '搜索'
})

const exportLabel = computed(() => {
  return (t('components.table.export') as string) || '导出'
})

const refreshLabel = computed(() => {
  return (t('components.table.refresh') as string) || '刷新'
})

// 计算属性：空数据提示（如果需要可以在模板中使用）
// const emptyMessageText = computed(() => {
//   return (t('components.table.emptyMessage') as string) || '暂无数据'
// })

// 计算属性：加载中提示（如果需要可以在模板中使用）
// const loadingText = computed(() => {
//   return (t('components.table.loading') as string) || '加载中...'
// })

const exportSuccessText = computed(() => {
  return (t('components.table.exportSuccess') as string) || '导出成功'
})

const exportFailedText = computed(() => {
  return (t('components.table.exportFailed') as string) || '导出失败'
})

const refreshSuccessText = computed(() => {
  return (t('components.table.refreshSuccess') as string) || '刷新成功'
})

const refreshFailedText = computed(() => {
  return (t('components.table.refreshFailed') as string) || '刷新失败'
})

const exportXLSXWarningText = computed(() => {
  return (t('components.table.exportXLSX') as string) || 'XLSX 导出功能需要安装 xlsx 库'
})

// 计算属性
const footerMode = computed<FooterMode>(() => props.footerMode || 'custom')

// 计算属性：分页器对齐方式
const paginatorJustifyContent = computed(() => {
  const position = props.paginatorPosition || 'center'
  if (position === 'left') {
    return 'flex-start'
  }
  if (position === 'right') {
    return 'flex-end'
  }
  return 'center'
})

/**
 * 筛选数据（客户端搜索）
 * 根据搜索关键词筛选数据，匹配所有列
 */
const filteredData = computed(() => {
  if (!props.globalFilter || !globalFilterValue.value || globalFilterValue.value.trim() === '') {
    return props.data
  }

  const searchText = globalFilterValue.value.toLowerCase().trim()

  return props.data.filter((row: any) => {
    // 遍历所有列，检查是否有任何列包含搜索文本
    return props.columns.some((col: VxeTableColumn) => {
      const fieldValue = (row as any)[col.field]
      if (fieldValue === null || fieldValue === undefined) {
        return false
      }

      // 将值转换为字符串并转为小写进行匹配
      const valueStr = String(fieldValue).toLowerCase()
      return valueStr.includes(searchText)
    })
  })
})

/**
 * 获取列底部渲染参数
 */
const getColumnFooterParams = (column: VxeTableColumn, columnIndex: number) => {
  return {
    rows: props.data.map(row => {
      return {
        value: (row as any)[column.field],
        row,
        column,
        columnIndex,
      }
    }),
    column,
    columnIndex,
  }
}

/**
 * 获取底部列对齐容器样式
 */
const footerColumnsStyle = computed(() => {
  if (footerMode.value !== 'column-aligned' || columnWidths.value.length === 0) {
    return {}
  }

  const hasSelectionColumn = props.selectable && selectionModeComputed.value !== null
  const selectionWidth = selectionColumnWidth.value ?? 48 // 选择列宽度

  // 计算总宽度（包括选择列）
  const totalWidth =
    columnWidths.value.reduce((sum, col) => {
      return sum + col.width
    }, 0) + (hasSelectionColumn ? selectionWidth : 0)

  // 构建 grid 模板列（如果有选择列，先添加选择列）
  const gridColumns = hasSelectionColumn
    ? selectionAlignFrozenValue.value === 'right'
      ? [...columnWidths.value.map(col => `${col.width}px`), `${selectionWidth}px`]
      : [`${selectionWidth}px`, ...columnWidths.value.map(col => `${col.width}px`)]
    : columnWidths.value.map(col => `${col.width}px`)

  return {
    display: 'grid',
    gridTemplateColumns: gridColumns.join(' '),
    width: `${totalWidth}px`,
  }
})

/**
 * 格式化宽度值（将数字转换为字符串格式）
 */
const formatWidth = (width: string | number | undefined): string | undefined => {
  if (!width) {
    return undefined
  }
  if (typeof width === 'number') {
    return `${width}px`
  }
  if (typeof width === 'string') {
    // 如果是纯数字字符串，添加 px 单位
    if (/^\d+$/.test(width.trim())) {
      return `${width.trim()}px`
    }
    // 如果已经有单位，直接返回
    return width
  }
  return undefined
}

// 尺寸配置（合并默认值）
const sizeConfig = computed(() => ({
  ...DEFAULT_TABLE_SIZE_CONFIG,
  ...props.sizeConfig,
}))

// 容器样式计算
const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  const config = sizeConfig.value

  // 宽度处理（移除了 fill 模式，只保留 auto 和 fixed）
  if (config.widthMode === 'fixed') {
    style.width = formatWidth(config.width) || '100%'
  } else if (config.widthMode === 'auto') {
    // 自适应模式：默认宽度 100%，但可以根据内容调整
    style.width = '100%'
    if (config.minWidth) {
      style.minWidth = formatWidth(config.minWidth) || 'auto'
    }
    if (config.maxWidth) {
      style.maxWidth = formatWidth(config.maxWidth) || 'none'
    }
  }

  // 高度处理
  if (config.heightMode === 'fill') {
    // 撑满模式：使用 100% 高度，并设置 flex: 1 确保在 flex 容器中撑满
    style.height = '100%'
    style.flex = '1 1 auto'
  } else if (config.heightMode === 'fixed') {
    style.height = formatWidth(config.height) || 'auto'
  } else if (config.heightMode === 'auto') {
    // 自适应模式：不设置固定高度，让内容决定
    if (config.minHeight) {
      style.minHeight = formatWidth(config.minHeight) || 'auto'
    }
    if (config.maxHeight) {
      style.maxHeight = formatWidth(config.maxHeight) || 'none'
    }
  }

  return style
})

// 容器类名计算
const containerClass = computed(() => {
  const classes: string[] = []
  const config = sizeConfig.value

  // 根据 size 设置字体类名
  if (props.size === 'small') {
    classes.push('fs-appFontSizes')
  } else if (props.size === 'large') {
    classes.push('fs-appFontSizex')
  }

  // 根据尺寸模式添加类名
  if (config.heightMode === 'fill') {
    classes.push('height-fill')
  }
  if (config.heightMode === 'fixed') {
    classes.push('height-fixed')
  }
  if (config.columnWidthMode === 'equal') {
    classes.push('column-fit')
  }

  return classes.join(' ')
})

// 表格滚动配置计算
const scrollableComputed = computed(() => {
  const config = sizeConfig.value
  // 使用用户显式设置的 scrollable
  if (props.scrollable !== undefined) {
    return props.scrollable
  }
  // 当高度模式为 fill 或 fixed 时，启用滚动
  // fill 模式需要滚动来显示超出容器高度的内容
  // fixed 模式需要滚动来显示固定高度内的内容
  return config.heightMode === 'fill' || config.heightMode === 'fixed'
})

// 计算实际可用高度（用于 fill 模式）
const calculatedHeight = ref<string | undefined>(undefined)
// 计算实际可用高度（用于 fixed 模式）
const calculatedFixedHeight = ref<string | undefined>(undefined)

// 计算表格可用高度（父容器高度 - 头部高度 - 底部高度）
const calculateAvailableHeight = () => {
  if (!tableWrapperFullRef.value || !tableWrapperRef.value) {
    calculatedHeight.value = undefined
    return
  }

  const config = sizeConfig.value
  if (config.heightMode !== 'fill') {
    calculatedHeight.value = undefined
    return
  }

  // 使用 nextTick 确保 DOM 已完全渲染
  nextTick(() => {
    // 获取父容器的实际高度
    const fullHeight = tableWrapperFullRef.value?.offsetHeight
    if (!fullHeight || fullHeight === 0) {
      calculatedHeight.value = undefined
      return
    }

    // 获取头部高度
    const headerElement = tableWrapperRef.value?.querySelector('.vxe-table-header')
    const headerHeight = headerElement ? (headerElement as HTMLElement).offsetHeight : 0

    // 获取底部高度
    const footerElement = tableWrapperRef.value?.querySelector('.vxe-table-footer')
    const footerHeight = footerElement ? (footerElement as HTMLElement).offsetHeight : 0

    // 获取分页器高度（如果存在）
    const paginatorElement = tableWrapperRef.value?.querySelector('.p-paginator')
    const paginatorHeight = paginatorElement ? (paginatorElement as HTMLElement).offsetHeight : 0

    // 计算可用高度 = 父容器高度 - 头部 - 底部 - 分页器
    const availableHeight = fullHeight - headerHeight - footerHeight - paginatorHeight

    if (availableHeight > 0) {
      calculatedHeight.value = `${availableHeight}px`
    } else {
      calculatedHeight.value = undefined
    }
  })
}

// 计算固定高度模式下的可用高度（配置高度 - 头部 - 底部 - 分页器）
const calculateFixedHeight = () => {
  const config = sizeConfig.value
  if (config.heightMode !== 'fixed' || !config.height) {
    calculatedFixedHeight.value = undefined
    return
  }

  nextTick(() => {
    const totalHeight = parseWidth(config.height)
    if (!totalHeight || totalHeight <= 0) {
      calculatedFixedHeight.value = undefined
      return
    }

    const headerElement = tableWrapperRef.value?.querySelector('.vxe-table-header')
    const headerHeight = headerElement ? (headerElement as HTMLElement).offsetHeight : 0

    const footerElement = tableWrapperRef.value?.querySelector('.vxe-table-footer')
    const footerHeight = footerElement ? (footerElement as HTMLElement).offsetHeight : 0

    const paginatorElement = tableWrapperRef.value?.querySelector('.p-paginator')
    const paginatorHeight = paginatorElement ? (paginatorElement as HTMLElement).offsetHeight : 0

    const availableHeight = totalHeight - headerHeight - footerHeight - paginatorHeight
    calculatedFixedHeight.value = availableHeight > 0 ? `${availableHeight}px` : undefined
  })
}

const selectionAlignFrozenValue = computed(() => props.selectionAlignFrozen || 'left')

const scrollHeightComputed = computed(() => {
  const config = sizeConfig.value
  // 固定高度：直接使用配置值
  if (config.heightMode === 'fixed' && config.height) {
    return calculatedFixedHeight.value || formatWidth(config.height) || undefined
  }
  // 撑满高度：使用计算后的可用高度
  if (config.heightMode === 'fill') {
    return calculatedHeight.value || undefined
  }
  // 自适应高度：不强制滚动
  return undefined
})

const renderEditorContent = (
  column: VxeTableColumn,
  data: Record<string, any>,
  field: string | undefined
) => {
  if (!column.editorRenderer || !field) {
    return ''
  }
  const value = field in data ? data[field] : undefined
  return column.editorRenderer({ data, value, field })
}

// 计算列宽百分比（用于 equal 模式）
const columnWidthPercentages = computed(() => {
  const config = sizeConfig.value
  if (config.columnWidthMode !== 'equal') {
    return null
  }

  const totalColumns = props.columns.length
  if (totalColumns === 0) {
    return null
  }

  // 计算每列的百分比
  const percentage = 100 / totalColumns
  return props.columns.map(() => `${percentage}%`)
})

/**
 * 获取列样式（增强版，支持列宽模式）
 */
const getColumnStyle = (column: VxeTableColumn, index?: number) => {
  const style: Record<string, string> = {}
  const config = sizeConfig.value

  if (config.columnWidthMode === 'auto') {
    // 自适应：不设置宽度，让内容决定
    // 但可以设置 minWidth 和 maxWidth
    if (column.minWidth) {
      style.minWidth = formatWidth(column.minWidth) || ''
    }
    if (column.maxWidth) {
      style.maxWidth = formatWidth(column.maxWidth) || ''
    }
  } else if (config.columnWidthMode === 'fixed') {
    // 固定：使用列配置的宽度
    if (column.width) {
      style.width = formatWidth(column.width) || ''
    }
    if (column.minWidth) {
      style.minWidth = formatWidth(column.minWidth) || ''
    }
    if (column.maxWidth) {
      style.maxWidth = formatWidth(column.maxWidth) || ''
    }
  } else if (config.columnWidthMode === 'equal') {
    // 等宽：使用百分比宽度
    const percentages = columnWidthPercentages.value
    if (percentages && index !== undefined && percentages[index]) {
      style.width = percentages[index]
    }
    // 仍然可以设置 minWidth 和 maxWidth 作为约束
    if (column.minWidth) {
      style.minWidth = formatWidth(column.minWidth) || ''
    }
    if (column.maxWidth) {
      style.maxWidth = formatWidth(column.maxWidth) || ''
    }
  }

  if (props.size === 'small') {
    style.height = `${appFontSizes.value + paddings.value * 2}px`
  } else if (props.size === 'large') {
    style.height = `${appFontSizex.value + paddingx.value * 0.78 * 2}px`
  } else if (props.size === 'normal') {
    style.height = `${appFontSize.value + padding.value * 0.96 * 2}px`
  } else {
    style.height = `${appFontSize.value + padding.value * 0.96 * 2}px`
  }

  if (column.align) {
    style.textAlign = column.align
  } else {
    style.textAlign = 'left'
  }

  return Object.keys(style).length > 0 ? style : undefined
}

/**
 * 获取单列底部样式
 */
const getColumnFooterStyle = (column: VxeTableColumn) => {
  const widthInfo = columnWidths.value.find(w => w.field === column.field)
  if (!widthInfo) {
    return {}
  }

  return {
    width: `${widthInfo.width}px`,
    minWidth: widthInfo.minWidth ? `${widthInfo.minWidth}px` : undefined,
    maxWidth: widthInfo.maxWidth ? `${widthInfo.maxWidth}px` : undefined,
  }
}

/**
 * 获取列宽度
 */
const getColumnWidths = (): ColumnWidthInfo[] => {
  if (!tableWrapperRef.value) {
    return []
  }

  // 获取表格元素
  const tableElement = tableWrapperRef.value.querySelector('.p-datatable')
  if (!tableElement) {
    return []
  }

  // 检查是否有选择列
  const hasSelectionColumn = props.selectable && selectionModeComputed.value !== null
  const { widths, selectionWidth } = getColumnWidthsFromTable(
    tableElement as HTMLElement,
    props.columns,
    hasSelectionColumn,
    selectionAlignFrozenValue.value
  )
  if (selectionWidth !== undefined) {
    selectionColumnWidth.value = selectionWidth
  }
  return widths
}

/**
 * 更新列宽度
 */
const updateColumnWidths = () => {
  // 使用 setTimeout 确保表格 DOM 已完全渲染
  setTimeout(() => {
    nextTick(() => {
      if (!tableWrapperRef.value) {
        console.warn('[VxeTable] updateColumnWidths: tableWrapperRef is not available')
        return
      }

      // 获取表格元素
      const tableElement = tableWrapperRef.value.querySelector('.p-datatable')
      if (!tableElement) {
        console.warn('[VxeTable] updateColumnWidths: table element not found')
        return
      }

      // 检查是否有选择列
      const hasSelectionColumn = props.selectable && selectionModeComputed.value !== null
      const { widths, selectionWidth } = getColumnWidthsFromTable(
        tableElement as HTMLElement,
        props.columns,
        hasSelectionColumn,
        selectionAlignFrozenValue.value
      )
      if (selectionWidth !== undefined) {
        selectionColumnWidth.value = selectionWidth
      }
      if (widths.length > 0) {
        columnWidths.value = widths
        emit('column-widths-change', widths)
      } else {
        console.warn('[VxeTable] updateColumnWidths: no widths found')
      }
    })
  }, 200)
}

/**
 * 刷新数据
 */
const refresh = () => {
  try {
    // 触发刷新事件，由父组件处理数据刷新
    updateColumnWidths()
    // 显示刷新成功提示
    if (window.$toast) {
      window.$toast.success(refreshSuccessText.value)
    }
  } catch (error) {
    // 显示刷新失败提示
    if (window.$toast) {
      window.$toast.error(refreshFailedText.value)
    }
    console.error('刷新失败:', error)
  }
}

/**
 * 导出数据
 */
const handleExport = (format: 'csv' | 'xlsx' | 'json' = 'csv') => {
  const filename = props.exportConfig?.filename || 'table-export'
  const exportData = selectedRows.value.length > 0 ? selectedRows.value : props.data

  try {
    if (format === 'csv') {
      exportToCSV(exportData, props.columns, `${filename}.csv`)
      if (window.$toast) {
        window.$toast.success(exportSuccessText.value)
      }
    } else if (format === 'json') {
      exportToJSON(exportData, `${filename}.json`)
      if (window.$toast) {
        window.$toast.success(exportSuccessText.value)
      }
    } else if (format === 'xlsx') {
      // XLSX 导出需要额外的库，这里先提示
      const warningMsg = exportXLSXWarningText.value
      console.warn(warningMsg)
      if (window.$toast) {
        window.$toast.warn(warningMsg)
      }
    }
  } catch (error) {
    console.error('导出失败:', error)
    if (window.$toast) {
      window.$toast.error(exportFailedText.value)
    }
  }
}

/**
 * 清除筛选（清除全局搜索）
 */
const clearFilters = () => {
  globalFilterValue.value = ''
  searchInputValue.value = ''
  filterState.value = { filters: {}, globalFilterValue: '' }
}

/**
 * 清除排序
 */
const clearSort = () => {
  sortField.value = undefined
  sortOrder.value = undefined
  sortState.value = { sortField: undefined, sortOrder: undefined }
  // 调用 DataTable 的清除排序方法
  if (tableRef.value && typeof (tableRef.value as any).clearSort === 'function') {
    ;(tableRef.value as any).clearSort()
  }
}

/**
 * 设置排序
 */
const setSort = (field: string, order: 1 | -1 | 0 = 1) => {
  sortField.value = field
  sortOrder.value = order
  sortState.value = {
    sortField: field,
    sortOrder: order,
    multiSortMeta: undefined,
  }
}

/**
 * 设置筛选（已废弃，使用全局搜索代替）
 */
const setFilter = (_field: string, _value: any, _matchMode?: string) => {
  console.warn('[VxeTable] setFilter 已废弃，请使用全局搜索功能')
  // 为了保持 API 兼容性，更新 filterState（但不实际筛选）
  filterState.value = {
    filters: {},
    globalFilterValue: globalFilterValue.value || '',
  }
}

/**
 * 检查行是否被选中
 */
const isRowSelected = (row: any): boolean => {
  const field = idField.value
  if (field) {
    return selectedRows.value.some(
      (selected: any) => (selected as any)[field] === (row as any)[field]
    )
  }
  return selectedRows.value.includes(row)
}

/**
 * 检查是否全选
 */
const isAllSelected = computed(() => {
  if (props.data.length === 0) {
    return false
  }
  return props.data.every(row => isRowSelected(row))
})

/**
 * 处理复选框变化
 */
const handleCheckboxChange = (checked: boolean, row: any) => {
  const field = idField.value
  if (checked) {
    // 选中
    if (selectionModeComputed.value === 'single') {
      selectedRows.value = [row]
    } else {
      if (!isRowSelected(row)) {
        selectedRows.value = [...selectedRows.value, row]
      }
    }
  } else {
    // 取消选中
    if (field) {
      selectedRows.value = selectedRows.value.filter(
        (selected: any) => (selected as any)[field] !== (row as any)[field]
      )
    } else {
      selectedRows.value = selectedRows.value.filter(selected => selected !== row)
    }
  }
  emit('update:selectedRows', selectedRows.value)
}

/**
 * 处理全选变化
 */
const handleSelectAllChange = (checked: boolean) => {
  if (checked) {
    // 全选
    selectedRows.value = [...props.data]
  } else {
    // 取消全选
    selectedRows.value = []
  }
  emit('update:selectedRows', selectedRows.value)
}

/**
 * 全选
 */
const selectAll = () => {
  if (selectionModeComputed.value === 'multiple') {
    // 使用 filteredData 而不是 props.data，确保只选择当前可见的数据
    selectedRows.value = [...filteredData.value]
    emit('update:selectedRows', selectedRows.value)
  }
}

/**
 * 清除选择
 */
const clearSelection = () => {
  selectedRows.value = []
  emit('update:selectedRows', selectedRows.value)
}

/**
 * 选择单行
 */
const selectRow = (row: any): boolean => {
  const field = idField.value
  const isSelected = selectedRows.value.some((selected: any) => {
    if (field) {
      return (selected as any)[field] === (row as any)[field]
    }
    return selected === row
  })

  if (isSelected) {
    return false // 已经选中
  }

  // 添加到选中列表
  if (selectionModeComputed.value === 'single') {
    selectedRows.value = [row]
  } else {
    selectedRows.value = [...selectedRows.value, row]
  }
  emit('update:selectedRows', selectedRows.value)
  return true
}

/**
 * 取消选择单行
 */
const unselectRow = (row: any): boolean => {
  const field = idField.value
  const beforeLength = selectedRows.value.length

  if (field) {
    selectedRows.value = selectedRows.value.filter(
      (selected: any) => (selected as any)[field] !== (row as any)[field]
    )
  } else {
    selectedRows.value = selectedRows.value.filter(selected => selected !== row)
  }

  const afterLength = selectedRows.value.length
  if (beforeLength !== afterLength) {
    emit('update:selectedRows', selectedRows.value)
    return true
  }
  return false
}

/**
 * 获取表格实例
 */
const getTableInstance = () => {
  return tableRef.value
}

// 事件处理
const handlePageChange = (event: any) => {
  paginationState.value = {
    page: event.page + 1,
    rows: event.rows,
    first: event.first,
    totalRecords:
      event.totalRecords || (props.globalFilter ? filteredData.value.length : props.data.length),
  }
  emit('page-change', event)
}

/**
 * 跳转到指定页面
 */
const goToPage = (page: number): void => {
  if (page < 1) {
    page = 1
  }
  const totalRecords = paginationState.value.totalRecords || 0
  const rows = paginationState.value.rows || 10
  const totalPages = Math.ceil(totalRecords / rows)
  if (page > totalPages && totalPages > 0) {
    page = totalPages
  }
  paginationState.value.page = page
  paginationState.value.first = (page - 1) * rows
  // 触发分页变化事件
  const pageEvent = {
    page: page - 1, // PrimeVue 使用 0-based 索引
    rows,
    first: paginationState.value.first,
    totalRecords,
  }
  emit('page-change', pageEvent as any)
}

/**
 * 设置每页显示数量
 */
const setPageSize = (size: number): void => {
  if (size < 1) {
    size = 1
  }
  const totalRecords = paginationState.value.totalRecords || 0
  paginationState.value.rows = size
  paginationState.value.first = 0
  paginationState.value.page = 1
  // 触发分页变化事件
  const pageEvent = {
    page: 0, // PrimeVue 使用 0-based 索引
    rows: size,
    first: 0,
    totalRecords,
  }
  emit('page-change', pageEvent as any)
}

const handleSortChange = (event: any) => {
  // 同步到内部状态
  sortField.value = event.sortField || undefined
  sortOrder.value = event.sortOrder || undefined

  // 更新 sortState
  sortState.value = {
    sortField: event.sortField || undefined,
    sortOrder: event.sortOrder || undefined,
    multiSortMeta: event.multiSortMeta || undefined,
  }
  emit('sort-change', event)
}

// handleFilterChange 已移除，不再支持列筛选功能

// 全局筛选变化处理（内部函数，用于实际更新筛选值）
const _handleGlobalFilterChange = (val: string | undefined) => {
  globalFilterValue.value = val || ''
  filterState.value = {
    ...filterState.value,
    globalFilterValue: globalFilterValue.value,
  }
  // 重置到第一页（当搜索时）
  if (props.pagination && paginationState.value.page !== 1) {
    paginationState.value.first = 0
    paginationState.value.page = 1
  }
}

// 使用防抖包裹搜索处理函数（300ms 延迟）
const debouncedHandleGlobalFilterChange = throttle(_handleGlobalFilterChange, 600)

// 搜索输入框变化处理（实时更新输入框值，防抖更新筛选值）
const handleGlobalFilterChange = (val: string | undefined) => {
  // 实时更新输入框显示的值
  searchInputValue.value = val || ''
  // 防抖更新实际筛选值
  debouncedHandleGlobalFilterChange(val)
}

/**
 * 设置全局搜索
 */
const setGlobalFilter = (value: string) => {
  searchInputValue.value = value
  globalFilterValue.value = value
  filterState.value = {
    ...filterState.value,
    globalFilterValue: value,
  }
  // 重置到第一页（当搜索时）
  if (props.pagination && paginationState.value.page !== 1) {
    paginationState.value.first = 0
    paginationState.value.page = 1
  }
}

// 行点击处理（根据 rowSelectable 决定是否选择）
const handleRowClick = (event: any) => {
  emit('row-click', event)

  // 如果启用了选择且允许通过点击行选择
  if (props.selectable !== false && rowSelectableComputed.value && selectionModeComputed.value) {
    const row = event.data
    const isSelected = selectedRows.value.some((selected: any) => {
      if (idField.value) {
        return (selected as any)[idField.value] === (row as any)[idField.value]
      }
      return selected === row
    })

    if (selectionModeComputed.value === 'single') {
      // 单选模式：直接选择当前行
      selectedRows.value = [row]
      emit('update:selectedRows', selectedRows.value)
    } else if (selectionModeComputed.value === 'multiple') {
      // 多选模式：切换选择状态
      if (isSelected) {
        selectedRows.value = selectedRows.value.filter((selected: any) => {
          if (idField.value) {
            return (selected as any)[idField.value] !== (row as any)[idField.value]
          }
          return selected !== row
        })
      } else {
        selectedRows.value = [...selectedRows.value, row]
      }
      emit('update:selectedRows', selectedRows.value)
    }
  }
}

const handleCellEditComplete = (event: any) => {
  try {
    const { data, field, newValue } = event || {}
    if (data && field) {
      ;(data as any)[field] = newValue
    }
    emit('cell-edit-complete', event)
  } catch (error) {
    console.error('cell-edit-complete error', error)
  }
}

const handleRowSelect = (event: any) => {
  selectedRows.value = Array.isArray(event.data) ? event.data : [event.data]
  emit('row-select', event)
  emit('update:selectedRows', selectedRows.value)
  // 如果是全选操作，也触发 select-all 事件
  if (
    event.type === 'checkbox' &&
    Array.isArray(event.data) &&
    event.data.length === props.data.length
  ) {
    emit('select-all', { originalEvent: event.originalEvent, checked: true, data: event.data })
  }
}

const handleRowUnselect = (event: any) => {
  selectedRows.value = selectedRows.value.filter((row: any) => row !== event.data)
  emit('row-unselect', event)
  emit('update:selectedRows', selectedRows.value)
}

// handleSelectAll 已移除，因为 PrimeVue DataTable 不支持 select-all 事件
// 全选操作通过 handleRowSelect 中的逻辑处理

// 监听数据变化，更新分页总数
watch(
  () => props.data.length,
  () => {
    // 如果启用了搜索，使用筛选后的数据长度
    if (props.globalFilter && globalFilterValue.value) {
      paginationState.value.totalRecords = filteredData.value.length
    } else {
      paginationState.value.totalRecords = props.data.length
    }
    if (footerMode.value === 'column-aligned') {
      updateColumnWidths()
    }
    // 数据变化后重新设置滚动监听
    nextTick(() => {
      setTimeout(() => {
        setupScrollListener()
      }, 100)
    })
  }
)

// 监听筛选后的数据变化，更新分页总数
watch(
  () => filteredData.value.length,
  () => {
    if (props.globalFilter) {
      paginationState.value.totalRecords = filteredData.value.length
      // 如果当前页超出范围，重置到第一页
      const totalPages = Math.ceil(filteredData.value.length / paginationState.value.rows)
      if (paginationState.value.page > totalPages && totalPages > 0) {
        paginationState.value.page = 1
        paginationState.value.first = 0
      }
    }
  }
)

// 监听列配置变化，更新列宽度
watch(
  () => props.columns,
  () => {
    if (footerMode.value === 'column-aligned') {
      updateColumnWidths()
    }
  },
  { deep: true }
)

// 监听加载状态变化
watch(
  () => props.loading,
  () => {
    if (props.loading === false && footerMode.value === 'column-aligned') {
      nextTick(() => {
        updateColumnWidths()
      })
    }
    if (props.loading === false) {
      if (sizeConfig.value.heightMode === 'fill') {
        setTimeout(() => {
          calculateAvailableHeight()
        }, 100)
      }
      if (sizeConfig.value.heightMode === 'fixed') {
        setTimeout(() => {
          calculateFixedHeight()
        }, 100)
      }
    }
  }
)

// 监听高度模式变化
watch(
  () => sizeConfig.value.heightMode,
  () => {
    if (sizeConfig.value.heightMode === 'fill') {
      setTimeout(() => {
        calculateAvailableHeight()
      }, 200)
      calculatedFixedHeight.value = undefined
    } else if (sizeConfig.value.heightMode === 'fixed') {
      setTimeout(() => {
        calculateFixedHeight()
      }, 200)
      calculatedHeight.value = undefined
    } else {
      calculatedHeight.value = undefined
      calculatedFixedHeight.value = undefined
    }
  }
)

// 监听头部和底部显示状态变化
watch([() => props.showHeader, () => props.showFooter, () => props.pagination], () => {
  if (sizeConfig.value.heightMode === 'fill') {
    setTimeout(() => {
      calculateAvailableHeight()
    }, 100)
  }
  if (sizeConfig.value.heightMode === 'fixed') {
    setTimeout(() => {
      calculateFixedHeight()
    }, 100)
  }
})

// 监听底部模式变化，更新列宽度
watch([() => footerMode.value, () => props.selectable, () => selectionModeComputed.value], () => {
  if (footerMode.value === 'column-aligned') {
    // 延迟执行，确保 DOM 已更新
    setTimeout(() => {
      updateColumnWidths()
    }, 100)
  }
})

// 窗口大小变化处理
const handleResize = throttle(() => {
  if (footerMode.value === 'column-aligned') {
    updateColumnWidths()
  }
  // 当高度模式为 fill 时，重新计算高度
  if (sizeConfig.value.heightMode === 'fill') {
    calculateAvailableHeight()
  }
  if (sizeConfig.value.heightMode === 'fixed') {
    calculateFixedHeight()
  }
}, 600)

// 监听表格横向滚动，同步底部容器滚动
const handleTableScroll = () => {
  // 获取表格的滚动容器
  const tableElement = tableWrapperRef.value?.querySelector('.p-datatable')
  const tableWrapper = tableElement?.querySelector('.p-datatable-wrapper') as HTMLElement

  if (tableWrapper) {
    // 同步底部容器滚动（如果存在）
    if (footerMode.value === 'column-aligned' && footerColumnsWrapperRef.value) {
      footerColumnsWrapperRef.value.scrollLeft = tableWrapper.scrollLeft
    }
  }
}

// 设置滚动监听的辅助函数
const setupScrollListener = () => {
  const tableElement = tableWrapperRef.value?.querySelector('.p-datatable')
  const tableWrapper = tableElement?.querySelector('.p-datatable-wrapper') as HTMLElement
  if (tableWrapper) {
    // 移除旧的监听（避免重复添加）
    tableWrapper.removeEventListener('scroll', handleTableScroll)
    // 添加新的监听
    tableWrapper.addEventListener('scroll', handleTableScroll)
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)

  // 添加滚动监听（用于滚动条自动隐藏和底部同步）
  setTimeout(() => {
    setupScrollListener()

    if (footerMode.value === 'column-aligned') {
      updateColumnWidths()
    }
  }, 100)

  // 当高度模式为 fill 时，计算可用高度
  if (sizeConfig.value.heightMode === 'fill') {
    setTimeout(() => {
      calculateAvailableHeight()
    }, 200)
  }

  // 当高度模式为 fixed 时，计算可用高度
  if (sizeConfig.value.heightMode === 'fixed') {
    setTimeout(() => {
      calculateFixedHeight()
    }, 200)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  // 移除滚动监听
  const tableElement = tableWrapperRef.value?.querySelector('.p-datatable')
  const tableWrapper = tableElement?.querySelector('.p-datatable-wrapper') as HTMLElement
  if (tableWrapper) {
    tableWrapper.removeEventListener('scroll', handleTableScroll)
  }
})

// 暴露 API
defineExpose<VxeTableExpose>({
  get data() {
    return props.data
  },
  get selectedRows() {
    return selectedRows.value
  },
  get paginationState() {
    return paginationState.value
  },
  get sortState() {
    return sortState.value
  },
  get filterState() {
    return filterState.value
  },
  get columnWidths() {
    return columnWidths.value
  },
  refresh,
  exportData: handleExport,
  clearFilters,
  clearSort,
  setSort,
  setFilter,
  clearSelection,
  selectAll,
  selectRow,
  unselectRow,
  goToPage,
  setPageSize,
  setGlobalFilter,
  getTableInstance,
  getColumnWidths,
  updateColumnWidths,
})
</script>

<template lang="pug">
.relative.full
  .full.absolute.z--1(ref='tableWrapperFullRef')
  .vxe-table-wrapper(ref='tableWrapperRef', :class='containerClass', :style='containerStyle')
    // 头部区域
    .vxe-table-header(v-if='showHeader')
      .vxe-table-header-left
        slot(
          name='header-left',
          :data='data',
          :selected-rows='selectedRows',
          :column-widths='columnWidths'
        )
      .vxe-table-header-right
        // 全局搜索
        IconField.center(v-if='globalFilter')
          InputIcon
            Icons(name='ri-search-line')
          InputText.w-full(
            :model-value='searchInputValue',
            :placeholder='searchPlaceholder',
            @update:model-value='handleGlobalFilterChange'
          )
        // 导出按钮
        Button(
          v-if='exportable',
          :label='exportLabel',
          severity='secondary',
          @click='() => handleExport()'
        )
          template(#icon)
            Icons(name='ri-download-line')
        // 刷新按钮
        Button(:label='refreshLabel', severity='secondary', @click='refresh')
          template(#icon)
            Icons(name='ri-refresh-line')

    // 表格主体
    DataTable(
      ref='tableRef',
      :value='filteredData',
      :loading='loading',
      :paginator='pagination',
      :rows='paginationState.rows',
      :first='paginationState.first',
      :total-records='paginationState.totalRecords',
      :rows-per-page-options='paginatorConfig?.rowsPerPageOptions || DEFAULT_PAGINATOR_CONFIG.rowsPerPageOptions',
      :selection-mode='selectionModeComputed',
      :data-key='idField',
      v-model:selection='selectedRows',
      v-model:sort-field='sortField',
      v-model:sort-order='sortOrderComputed',
      :show-gridlines='showGridlines',
      :striped-rows='stripedRows',
      :edit-mode='editModeComputed',
      :size='size',
      :scrollable='scrollableComputed',
      :scroll-height='scrollHeightComputed',
      :row-class='rowClass',
      :row-style='rowStyle',
      @page='handlePageChange',
      @sort='handleSortChange',
      @row-select='handleRowSelect',
      @row-unselect='handleRowUnselect',
      @row-click='handleRowClick',
      @row-dblclick='(e: any) => emit("row-dblclick", e)',
      @cell-edit-complete='handleCellEditComplete'
    )
      // 选择列（当启用选择功能时显示，位置可左右）
      template(
        v-if='props.selectable && selectionModeComputed && selectionAlignFrozenValue === "left"'
      )
        Column(
          :header-style='{ width: "48px" }',
          :style='{ width: "48px" }',
          :frozen='props.selectionFrozen',
          :align-frozen='selectionAlignFrozenValue'
        )
          // 自定义选择列头部（全选复选框）
          template(#header)
            Checkbox(
              v-if='selectionModeComputed === "multiple"',
              :model-value='isAllSelected',
              :binary='true',
              @update:model-value='(checked: boolean) => handleSelectAllChange(checked)'
            )
          // 自定义选择列内容（行复选框）
          template(#body='{ data }')
            Checkbox(
              :model-value='isRowSelected(data)',
              :binary='true',
              @update:model-value='(checked: boolean) => handleCheckboxChange(checked, data)'
            )

      // 动态列渲染
      Column(
        v-for='(col, colIndex) in columns',
        :key='col.field',
        :field='col.field',
        :header='getColumnHeader(col)',
        :sortable='col.sortable !== false && sortable !== false',
        :exportable='col.exportable !== false',
        :frozen='col.frozen',
        :align-frozen='col.alignFrozen',
        :style='getColumnStyle(col, colIndex)'
      )
        // 自定义头部
        template(v-if='col.headerRenderer', #header)
          component(:is='col.headerRenderer')

        // 自定义内容
        template(v-if='col.body', #body='{ data }')
          component(:is='bodyCellRenderer', :body-fn='col.body', :row-data='data', :column='col')
        // 自定义编辑器（cell 编辑）
        template(
          v-if='props.editable && editModeComputed === "cell" && col.editable && col.editorRenderer',
          #editor='{ data, field }'
        )
          component(
            :is='bodyCellRenderer',
            :body-fn='() => renderEditorContent(col, data, field)',
            :row-data='data',
            :column='col'
          )

      // 选择列在右侧时渲染在末尾
      template(
        v-if='props.selectable && selectionModeComputed && selectionAlignFrozenValue === "right"'
      )
        Column(
          :header-style='{ width: "48px" }',
          :style='{ width: "48px" }',
          :frozen='props.selectionFrozen',
          :align-frozen='selectionAlignFrozenValue'
        )
          template(#header)
            Checkbox(
              v-if='selectionModeComputed === "multiple"',
              :model-value='isAllSelected',
              :binary='true',
              @update:model-value='(checked: boolean) => handleSelectAllChange(checked)'
            )
          template(#body='{ data }')
            Checkbox(
              :model-value='isRowSelected(data)',
              :binary='true',
              @update:model-value='(checked: boolean) => handleCheckboxChange(checked, data)'
            )

    // 底部区域（在分页器上方）
    .vxe-table-footer(v-if='showFooter')
      // 模式1: 完全自定义
      template(v-if='footerMode === "custom"')
        slot(
          name='footer',
          :data='data',
          :selected-rows='selectedRows',
          :column-widths='columnWidths'
        )

      // 模式2: 列对齐模式
      template(v-else-if='footerMode === "column-aligned"')
        ScrollbarWrapper(
          ref='scrollbarRef',
          :style='{ height: "100%", width: "100%" }',
          :size='1',
          :wrapper-class='"c-border border-t-none! "',
          direction='horizontal',
          auto-hide='leave',
          @scroll-horizontal='() => {}',
          :color-scheme='{ thumbColor: "transparent", thumbHoverColor: "transparent", thumbActiveColor: "transparent", trackColor: "transparent", trackHoverColor: "transparent", trackActiveColor: "transparent" }'
        )
          .vxe-table-footer-columns(:style='footerColumnsStyle')
            // 选择列容器（如果有选择列）
            template(v-if='selectable && selectionModeComputed')
              template(v-if='selectionAlignFrozenValue === "left"')
                .vxe-table-footer-column(
                  :style='{ width: selectionColumnWidth ? `${selectionColumnWidth}px` : "48px" }'
                )
            // 数据列容器
            template(v-for='(column, index) in columns', :key='column.field')
              .vxe-table-footer-column.c-border.border-y-none.border-r-none(
                class='p-0!',
                :style='getColumnFooterStyle(column)'
              )
                RenderTSX(
                  v-if='column.customFooter',
                  :dom='column.customFooter',
                  :params='getColumnFooterParams(column, index)'
                )
            // 右侧选择列容器
            template(
              v-if='selectable && selectionModeComputed && selectionAlignFrozenValue === "right"'
            )
              .vxe-table-footer-column(
                :style='{ width: selectionColumnWidth ? `${selectionColumnWidth}px` : "48px" }'
              )

    // 分页器（当 DataTable 不使用内置分页器时显示，或需要自定义位置时使用）
    // 注意：如果 DataTable 使用内置分页器，这里不应该显示
    // 如果需要自定义分页器位置，可以禁用 DataTable 内置分页器，然后在这里显示
</template>

<style lang="scss" scoped>
.vxe-table-wrapper {
  display: flex;
  flex-direction: column;

  // 当高度模式为 fill 或 fixed 时，确保容器可以撑满，并让表格主体部分也能撑满
  &.height-fill,
  &.height-fixed {
    height: 100%;

    :deep(.p-datatable) {
      height: 100%;
      display: flex;
      flex-direction: column;

      .p-datatable-wrapper {
        flex: 1;
        overflow: auto;
        min-height: 0; // 确保 flex 子元素可以正确收缩
      }
    }
  }

  // 当列宽模式为 equal 时，使用固定表格布局
  &.column-fit {
    :deep(.p-datatable) {
      table-layout: fixed;
      width: 100%;

      .p-datatable-table {
        table-layout: fixed;
        width: 100%;
      }
    }
  }
}

// 分页器位置样式（通过深度选择器控制分页器位置）
:deep(.p-paginator) {
  display: flex !important;
  justify-content: v-bind('paginatorJustifyContent') !important;
}

.vxe-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--paddings) 0;
  gap: var(--gaps);
  border-radius: var(--rounded);
  &-left {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--gaps);
  }

  &-right {
    display: flex;
    gap: var(--gaps);
    align-items: center;
  }
}

.vxe-table-footer {
  border-radius: var(--rounded);
  .vxe-table-footer-columns {
    .vxe-table-footer-column:first-child {
      border-left: none;
    }
    .vxe-table-footer-column:last-child {
      border-right: none;
    }
  }

  &-columns-wrapper {
    // 用于横向滚动同步的包装器
    // 滚动条样式可以通过 CSS 自定义
    &::-webkit-scrollbar {
      height: 0px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: var(--rounded);
    }
  }

  &-columns {
    display: grid;
    gap: 0;
    // 列宽度由 JS 动态计算
  }

  &-column {
    // 无样式，完全由用户自定义
    padding: var(--paddings);
  }
}
</style>
