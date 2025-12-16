<script setup lang="ts" generic="T">
import { throttle } from '@#/index'
import { RenderTSX } from '@/components/modules/render-tsx'
import { useLocale } from '@/hooks'
import { useTablePersistence } from '@/hooks/components/useTablePersistence'
import { useElementSize } from '@/hooks/modules/useElementSize'
import { useSizeStore } from '@/stores'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { executeVxeTableApi } from './utils/api'
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
  VxeTableExtendedProps,
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
      } catch {
        return h('span', { class: 'color-dangerColor' }, '渲染错误')
      }
    }
  },
})

// Props 定义
// 使用统一的 VxeTableExtendedProps<T>，由 ./utils/types 提供单一事实来源
const props = withDefaults(defineProps<VxeTableExtendedProps<T>>(), {
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
  // 默认开启行悬停高亮，提升非选择模式下的交互体验
  rowHover: true,
  // 【新增】列功能配置默认值
  reorderableColumns: false,
  resizableColumns: false,
  columnResizeMode: 'fit',
  // 【新增】虚拟滚动配置默认值
  virtualScrollerOptions: undefined,
  componentsProps: () => ({}) as Record<string, any>,
})

/**
 * 统一的组件层透传 props（用于传给 DataTable 等底层组件）
 */
const componentsProps = computed(() => props.componentsProps ?? {})

// Emits 定义（带上泛型 T，确保事件中携带的数据类型安全）
const emit = defineEmits<VxeTableEmits<T>>()

// 国际化
const { $t: t } = useLocale()

// ==================== 表格持久化 ====================
// 将 props 转为 computed 传给 hook
const tableIdRef = computed(() => props.tableId)
const originalColumnsRef = computed(() => props.columns)

// 初始化持久化逻辑
const {
  effectiveColumns, // 使用这个代替 props.columns 渲染
  handleColumnResize: handlePersistenceColumnResize,
  handleColumnReorder: handlePersistenceColumnReorder,
} = useTablePersistence(tableIdRef, originalColumnsRef)

// 表格引用
const tableRef = ref<InstanceType<typeof DataTable>>()
const tableWrapperRef = ref<HTMLElement | null>(null)
const tableWrapperFullRef = ref<HTMLElement | null>(null)
const scrollbarRef = ref<any>(null) // 用于引用 ScrollbarWrapper 组件实例
const scrollWrapperRef = ref<HTMLElement | null>(null)

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

// 源数据：如果传入 api，则优先使用 api 返回的数据
const apiData = ref<any[]>([])
const apiLoading = ref(false)
const apiError = ref<string | null>(null)

// 无限滚动模式状态
const infinitePage = ref(1)
const infiniteHasNext = ref(true)
const infiniteTotal = ref(0)
const isTriggeringInfiniteLoad = ref(false) // 防止重复触发触底加载
const isWarningLock = ref(false) // 防止重复弹窗警告

const sourceData = computed<any[]>(() => {
  if (props.api) {
    return apiData.value
  }
  return props.data || []
})

// 合并 loading 状态：外部传入的 loading 或内部 API 请求的 loading
const loading = computed(() => {
  if (props.api) {
    return apiLoading.value || props.loading || false
  }
  return props.loading || false
})

/**
 * 当传入 api 时，自动请求数据
 * api 和 data 可以同时传入，但 api 优先（控制台会给出提示）
 * @param isInfiniteNext - 是否为无限滚动模式的下一页加载
 * @param forceRefresh - 是否强制刷新（禁用缓存）
 */
const loadApiData = async (isInfiniteNext = false, forceRefresh = false) => {
  if (!props.api) {
    return
  }

  // 无限滚动模式：检查是否还有下一页
  if (props.api.mode === 'infinite' && isInfiniteNext && !infiniteHasNext.value) {
    return
  }

  // 防止重复请求
  if (apiLoading.value) {
    return
  }

  apiLoading.value = true
  apiError.value = null

  try {
    let pageSize: number | undefined
    let currentPage: number | undefined

    if (props.api.mode === 'infinite') {
      pageSize = props.api.infinite?.pageSize || 20
      currentPage = isInfiniteNext ? infinitePage.value : 1
    } else if (props.api.mode === 'pagination') {
      // FIX: 优先使用 paginationState (UI状态) 中的 rows，而不是配置的初始值
      // 这样当用户在界面修改每页条数时，才能正确发起请求
      pageSize = paginationState.value.rows || props.api.pagination?.pageSize || 10
      currentPage = paginationState.value.page || 1
    }

    // 调用 executeVxeTableApi 时传入配置
    // 如果 forceRefresh 为 true，则传入 enableCache: false 以禁用缓存
    const result = await executeVxeTableApi(
      props.api,
      currentPage,
      pageSize,
      forceRefresh ? { enableCache: false } : undefined
    )

    if (props.api.mode === 'infinite' && isInfiniteNext) {
      // 无限滚动模式：追加数据

      apiData.value = [...apiData.value, ...result.list]
      infiniteHasNext.value = result.hasNext ?? false
      infiniteTotal.value = typeof result.total === 'number' ? result.total : apiData.value.length

      if (result.hasNext) {
        infinitePage.value += 1
      } else {
        // 没有更多数据
      }
    } else {
      // 分页模式或首次加载：替换数据
      apiData.value = result.list

      if (props.api.mode === 'infinite') {
        infinitePage.value = 1
        // 首次加载：如果返回了 hasNext，使用它；否则根据数据量判断
        if (typeof result.hasNext === 'boolean') {
          infiniteHasNext.value = result.hasNext
        } else {
          // 如果没有 hasNext 字段，根据返回的数据量判断
          const pageSize = props.api.infinite?.pageSize || 20
          infiniteHasNext.value = result.list.length >= pageSize
        }
        infiniteTotal.value = typeof result.total === 'number' ? result.total : result.list.length
        infinitePage.value = 2 // 下次加载第 2 页
      } else if (props.api.mode === 'pagination') {
        // 分页模式：更新总数
        paginationState.value.totalRecords =
          typeof result.total === 'number' ? result.total : result.list.length
      } else {
        // 默认模式：更新总数
        paginationState.value.totalRecords =
          typeof result.total === 'number' ? result.total : apiData.value.length
      }
    }
  } catch (error) {
    apiError.value = error instanceof Error ? error.message : '加载数据失败'
  } finally {
    apiLoading.value = false
  }
}

/**
 * 无限滚动模式：处理触底事件
 */
const handleInfiniteScrollBottom = () => {
  // 防止加载中重复触发
  if (isTriggeringInfiniteLoad.value) {
    return
  }

  // 场景1：满足加载条件 -> 加载下一页
  if (props.api?.mode === 'infinite' && infiniteHasNext.value && !loading.value) {
    isTriggeringInfiniteLoad.value = true
    loadApiData(true).finally(() => {
      // 延迟重置标志，防止快速连续触发
      setTimeout(() => {
        isTriggeringInfiniteLoad.value = false
      }, 500)
    })
  }
  // 场景2：没有更多数据了 -> 提示用户（使用节流锁防止重复弹窗）
  else if (props.api?.mode === 'infinite' && !infiniteHasNext.value) {
    // 如果处于警告冷却期，直接返回
    if (isWarningLock.value) {
      return
    }

    // 上锁
    isWarningLock.value = true

    // 弹出提示（可选，建议注释掉改用底部 UI 提示）
    // if (window.$message) {
    //   window.$message.warn('没有更多数据了')
    // }

    // 2秒冷却时间，防止连续弹窗
    setTimeout(() => {
      isWarningLock.value = false
    }, 2000)
  }
}

// ID 字段（用于行选择）
const idField = computed(() => {
  // 尝试从第一行数据中获取 ID 字段
  if (sourceData.value.length > 0) {
    const firstRow = sourceData.value[0]
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
  totalRecords: sourceData.value.length,
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

/**
 * 分组展开行的双向绑定
 */
const expandedRowGroupsComputed = computed<any>({
  get: () => props.expandedRowGroups as any,
  set: val => {
    emit('update:expandedRowGroups', (val || []) as any[])
  },
})

const onRowGroupExpand = (event: any) => {
  emit('rowgroup-expand', event)
}

const onRowGroupCollapse = (event: any) => {
  emit('rowgroup-collapse', event)
}

// 列顺序变更事件处理
const onColumnReorder = (event: any) => {
  // 先处理持久化
  handlePersistenceColumnReorder(event)
  // 然后抛出事件
  emit('column-reorder', event)
}

// 列宽调整事件处理
const onColumnResizeEnd = (event: any) => {
  // 先处理持久化
  handlePersistenceColumnResize(event)
  // 然后抛出事件
  emit('column-resize-end', event)
  // 延迟更新列宽度（用于底部对齐模式等）
  if (footerMode.value === 'column-aligned') {
    setTimeout(() => {
      updateColumnWidths()
    }, 100)
  }
}

/**
 * Selection 计算属性拦截器
 * - 解决 PrimeVue 在 single 模式下使用「单对象」而组件内部统一维护「数组」的问题
 * - 对外始终通过 update:selectedRows 以 T[] 的形式暴露
 */
const selectionComputed = computed({
  get: () => {
    if (selectionModeComputed.value === 'single') {
      return selectedRows.value[0] || null
    }
    return selectedRows.value
  },
  set: (val: any) => {
    let newRows: any[] = []

    if (selectionModeComputed.value === 'single') {
      if (val) {
        newRows = Array.isArray(val) ? val : [val]
      } else {
        newRows = []
      }
    } else {
      newRows = (val as any[]) || []
    }

    selectedRows.value = newRows
    emit('update:selectedRows', newRows as T[])
  },
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

// 计算属性：加载中提示（用于无限滚动底部提示）
const loadingText = computed(() => {
  return (t('components.table.loading') as string) || '加载中...'
})

// 计算属性：没有更多数据文案（用于无限滚动底部提示）
const noMoreDataText = computed(() => {
  return (t('components.table.noMoreData') as string) || '没有更多数据了'
})

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

// 计算是否显示底部容器
// 逻辑：如果 props.showFooter 为 true，或者处于无限滚动模式且有数据时，都显示底部
const showFooterComputed = computed(() => {
  return props.showFooter || (props.api?.mode === 'infinite' && sourceData.value.length > 0)
})

// 计算是否显示无限滚动的状态提示
const showInfiniteStatus = computed(() => {
  return props.api?.mode === 'infinite' && sourceData.value.length > 0
})

// 计算属性：是否开启懒加载模式
// 仅在 API 分页模式下开启，告知 DataTable 数据不是全量的，需要依赖 totalRecords 计算页数
const isLazy = computed(() => {
  return props.api?.mode === 'pagination'
})

// 计算是否显示刷新按钮
// 逻辑：仅在 API 模式且为分页模式时显示
const showRefreshButton = computed(() => {
  return props.api?.mode === 'pagination'
})

// 统一的插槽上下文 (Slot Context)
const slotProps = computed(() => ({
  // 数据相关
  data: sourceData.value, // 当前所有已加载的数据
  filteredData: filteredData.value, // 筛选后的数据
  apiData: apiData.value, // API 返回的原始数据

  // 状态相关
  selectedRows: selectedRows.value,
  loading: loading.value,

  // 分页相关
  pagination: paginationState.value, // { page: 当前页码, rows: 每页条数(pageSize), first: 第一条记录的索引, totalRecords: 总记录数 }
  infiniteState: {
    // 无限滚动专属状态
    page: infinitePage.value,
    hasNext: infiniteHasNext.value,
    total: infiniteTotal.value,
  },

  // 排序与筛选
  sortState: sortState.value,
  filterState: filterState.value,

  // 布局信息
  columnWidths: columnWidths.value,
}))

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
    return sourceData.value
  }

  const searchText = globalFilterValue.value.toLowerCase().trim()

  return sourceData.value.filter((row: any) => {
    // 遍历所有列，检查是否有任何列包含搜索文本
    return computedColumns.value.some((col: VxeTableColumn) => {
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
    rows: sourceData.value.map(row => {
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

  const totalColumns = computedColumns.value.length
  if (totalColumns === 0) {
    return null
  }

  // 计算每列的百分比
  const percentage = 100 / totalColumns
  return computedColumns.value.map(() => `${percentage}%`)
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
 * 获取表头样式（专门处理对齐）
 */
const getColumnHeaderClass = (column: VxeTableColumn) => {
  let className: string = ''

  if (column.align) {
    if (column.align === 'center') {
      className = 'vxe-column-header-center'
    } else if (column.align === 'right') {
      className = 'vxe-column-header-right'
    } else {
      className = 'vxe-column-header-left'
    }
  }
  return className
}

/**
 * 获取列级别的透传 props（用于为 Column 传入官方未封装的属性）
 */
const getColumnComponentsProps = (column: VxeTableColumn<T>) => {
  return column.componentsProps ?? {}
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
    computedColumns.value,
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
        return
      }

      // 获取表格元素
      const tableElement = tableWrapperRef.value.querySelector('.p-datatable')
      if (!tableElement) {
        return
      }

      // 检查是否有选择列
      const hasSelectionColumn = props.selectable && selectionModeComputed.value !== null
      const { widths, selectionWidth } = getColumnWidthsFromTable(
        tableElement as HTMLElement,
        computedColumns.value,
        hasSelectionColumn,
        selectionAlignFrozenValue.value
      )
      if (selectionWidth !== undefined) {
        selectionColumnWidth.value = selectionWidth
      }
      if (widths.length > 0) {
        columnWidths.value = widths
        emit('column-widths-change', widths)

        // 注意：列宽持久化已由 useTablePersistence hook 处理
        // 这里不再需要手动保存
      }
    })
  }, 200)
}

/**
 * 刷新数据
 */
/**
 * 刷新数据（内部实现）
 * 修改：增加 API 重新请求逻辑
 */
const _refresh = async () => {
  try {
    // 1. 如果是 API 模式，重新请求当前页数据
    if (props.api) {
      // 传入 true，表示强制刷新，禁用缓存
      await loadApiData(false, true)
    }

    // 2. 触发列宽更新（保持原有逻辑）
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
 * 刷新数据（节流版本）
 * 使用节流防止频繁点击，节流时间 1000ms
 */
const refresh = throttle(_refresh, 1000)

/**
 * 导出数据
 */
const handleExport = (format: 'csv' | 'xlsx' | 'json' = 'csv') => {
  const filename = props.exportConfig?.filename || 'table-export'
  const exportData = selectedRows.value.length > 0 ? selectedRows.value : sourceData.value

  try {
    if (format === 'csv') {
      exportToCSV(exportData, computedColumns.value, `${filename}.csv`)
      if (window.$toast) {
        window.$toast.success(exportSuccessText.value)
      }
    } else if (format === 'json') {
      exportToJSON(exportData, `${filename}.json`)
      if (window.$toast) {
        window.$toast.success(exportSuccessText.value)
      }
    } else if (format === 'xlsx') {
      // XLSX 导出需要额外的库，这里仅进行提示
      const warningMsg = exportXLSXWarningText.value
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
  if (sourceData.value.length === 0) {
    return false
  }
  return sourceData.value.every(row => isRowSelected(row))
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
    selectedRows.value = [...sourceData.value]
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
    // FIX: 如果是分页模式，尽量保留现有的 totalRecords，防止闪烁或错误重置
    totalRecords:
      props.api?.mode === 'pagination'
        ? paginationState.value.totalRecords
        : event.totalRecords ||
          (props.globalFilter ? filteredData.value.length : sourceData.value.length),
  }

  // 分页模式：切换分页时自动调用 API 加载数据
  if (props.api?.mode === 'pagination') {
    void loadApiData()
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

  // 分页模式：切换每页数量时自动调用 API 加载数据
  if (props.api?.mode === 'pagination') {
    void loadApiData()
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
    event.data.length === sourceData.value.length
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
  () => sourceData.value.length,
  () => {
    // FIX: 在 API 分页模式下，totalRecords 由接口返回的 total 决定，
    // 不应该被当前页数据(sourceData)的长度覆盖。
    if (props.api?.mode !== 'pagination') {
      // 仅在非分页模式（客户端分页或无限滚动）下自动计算总数
      if (props.globalFilter && globalFilterValue.value) {
        paginationState.value.totalRecords = filteredData.value.length
      } else {
        paginationState.value.totalRecords = sourceData.value.length
      }
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
      // FIX: 在 API 分页模式下，totalRecords 由接口返回的 total 决定，
      // 不应该被筛选后的数据长度覆盖。
      if (props.api?.mode !== 'pagination') {
        paginationState.value.totalRecords = filteredData.value.length
        // 如果当前页超出范围，重置到第一页
        const totalPages = Math.ceil(filteredData.value.length / paginationState.value.rows)
        if (paginationState.value.page > totalPages && totalPages > 0) {
          paginationState.value.page = 1
          paginationState.value.first = 0
        }
      }
    }
  }
)

// ==================== 列持久化处理 ====================
// 注意：列持久化逻辑已迁移到 useTablePersistence hook
// 这里保留 computedColumns 作为 effectiveColumns 的别名，以保持向后兼容
// effectiveColumns 已经在 useTablePersistence 中定义
const computedColumns = effectiveColumns

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
watch([() => props.showHeader, () => showFooterComputed.value, () => props.pagination], () => {
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

/**
 * 统一处理布局更新
 * 包含：列宽同步(底部对齐模式)、高度计算(Fill/Fixed模式)
 */
const updateLayout = () => {
  if (footerMode.value === 'column-aligned') {
    updateColumnWidths()
  }

  if (sizeConfig.value.heightMode === 'fill') {
    calculateAvailableHeight()
  } else if (sizeConfig.value.heightMode === 'fixed') {
    calculateFixedHeight()
  }
}

// 监听容器尺寸变化，自动更新布局（节流避免高频计算）
useElementSize(
  tableWrapperFullRef,
  () => {
    updateLayout()
  },
  { mode: 'throttle', delay: 200 }
)

// 监听表格滚动：同步底部容器滚动，并在接近底部时触发 scroll-bottom 事件
const handleTableScroll = (event: Event) => {
  const target = (event.target as HTMLElement) || scrollWrapperRef.value
  if (!target) {
    return
  }

  // FIX: 同步底部容器横向滚动
  // 使用 ScrollbarWrapper 组件暴露的 scrollTo 方法
  if (footerMode.value === 'column-aligned' && scrollbarRef.value) {
    scrollbarRef.value.scrollTo({ left: target.scrollLeft })
  }

  // 触底检测（用于无限滚动场景）
  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight
  const threshold = 40 // 触发阈值，单位：px

  if (distanceToBottom <= threshold) {
    const scrollBottomEvent = {
      originalEvent: event,
      distanceToBottom,
      scrollTop: target.scrollTop,
      scrollHeight: target.scrollHeight,
      clientHeight: target.clientHeight,
    }

    // 如果配置了无限滚动模式，自动处理
    if (props.api?.mode === 'infinite') {
      handleInfiniteScrollBottom()
    }

    // 始终派发事件，让外部也可以监听
    emit('scroll-bottom', scrollBottomEvent)
  }
}

// 设置滚动监听的辅助函数（PrimeVue 可滚动表格实际滚动容器为 .p-datatable-scrollable-body）
const setupScrollListener = () => {
  const tableElement = tableWrapperRef.value?.querySelector('.p-datatable')
  if (!tableElement) {
    return
  }

  // 1. 优先按类名查找 PrimeVue 定义的滚动容器
  // FIX: 增加 .p-datatable-table-container (PrimeVue 非 scrollable 模式或新版的容器类名)
  let scrollBody =
    (tableElement.querySelector('.p-datatable-scrollable-body') as HTMLElement | null) ??
    (tableElement.querySelector('.p-datatable-wrapper') as HTMLElement | null) ??
    (tableElement.querySelector('.p-datatable-table-container') as HTMLElement | null)

  // 2. 如果按类名没找到，兜底：在表格内部查找第一个"具备滚动能力"（横向或纵向）的元素
  if (!scrollBody) {
    const allElements = tableElement.querySelectorAll<HTMLElement>('*')
    for (const el of Array.from(allElements)) {
      const style = window.getComputedStyle(el)

      // FIX: 同时检查纵向和横向滚动
      const isOverflowY = style.overflowY === 'auto' || style.overflowY === 'scroll'
      const isOverflowX = style.overflowX === 'auto' || style.overflowX === 'scroll'

      const hasScrollY = isOverflowY && el.scrollHeight > el.clientHeight
      const hasScrollX = isOverflowX && el.scrollWidth > el.clientWidth

      // 只要满足任意一个方向的滚动条件，就认为是滚动容器
      if (hasScrollY || hasScrollX) {
        scrollBody = el
        break
      }
    }
  }

  if (!scrollBody) {
    return
  }

  // 移除旧的监听（避免重复添加）
  if (scrollWrapperRef.value) {
    scrollWrapperRef.value.removeEventListener('scroll', handleTableScroll)
  }

  scrollWrapperRef.value = scrollBody
  scrollBody.addEventListener('scroll', handleTableScroll)
}

onMounted(() => {
  // 注意：列配置恢复已由 useTablePersistence hook 在 watch 中自动处理
  // 这里只需要确保表格渲染完成后更新列宽度（用于底部对齐模式等）
  if (props.tableId) {
    nextTick(() => {
      setTimeout(() => {
        if (footerMode.value === 'column-aligned') {
          updateColumnWidths()
        }
      }, 300)
    })
  }

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

  // 如果配置了 api，自动加载一次数据
  if (props.api?.immediate !== false) {
    // 分页模式：初始化分页配置
    if (props.api && props.api.mode === 'pagination' && props.api.pagination?.pageSize) {
      paginationState.value.rows = props.api.pagination.pageSize
    }

    void loadApiData()
  }
})

onUnmounted(() => {
  // 移除滚动监听
  if (scrollWrapperRef.value) {
    scrollWrapperRef.value.removeEventListener('scroll', handleTableScroll)
  }
})

// 暴露 API
defineExpose<VxeTableExpose>({
  get data() {
    return sourceData.value
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
        slot(name='header-left', v-bind='slotProps')
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
          InputIcon
            Icons.c-transitions.c-cp(
              name='RiCloseFill',
              class='hover:color-dangerColor',
              @click='clearFilters'
            )
        // 导出按钮
        Button.gap-2(
          v-if='exportable',
          severity='secondary',
          @click='() => handleExport()',
          size='small'
        )
          Icons(name='ri-download-line')
          span {{ exportLabel }}
        // 刷新按钮
        Button.gap-2(
          v-if='showRefreshButton',
          severity='secondary',
          @click='refresh',
          size='small'
        )
          Icons(name='ri-refresh-line')
          span {{ refreshLabel }}

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
      :lazy='isLazy',
      :selection-mode='selectionModeComputed',
      :data-key='idField',
      v-model:selection='selectionComputed',
      v-model:sort-field='sortField',
      v-model:sort-order='sortOrderComputed',
      :show-gridlines='showGridlines',
      :striped-rows='stripedRows',
      :edit-mode='editModeComputed',
      :size='size',
      :scrollable='scrollableComputed',
      :scroll-height='scrollHeightComputed',
      :virtual-scroller-options='props.virtualScrollerOptions',
      :row-class='rowClass',
      :row-style='rowStyle',
      :row-hover='props.rowHover',
      :row-group-mode='props.rowGroupMode',
      :group-rows-by='props.groupRowsBy',
      :expandable-row-groups='props.expandableRowGroups',
      v-model:expanded-row-groups='expandedRowGroupsComputed',
      :reorderable-columns='props.reorderableColumns',
      :resizable-columns='props.resizableColumns',
      :column-resize-mode='props.columnResizeMode',
      @page='handlePageChange',
      @sort='handleSortChange',
      @row-select='handleRowSelect',
      @row-unselect='handleRowUnselect',
      @row-click='handleRowClick',
      @row-dblclick='(e: any) => emit("row-dblclick", e)',
      @cell-edit-complete='handleCellEditComplete',
      @rowgroup-expand='onRowGroupExpand',
      @rowgroup-collapse='onRowGroupCollapse',
      @column-reorder='onColumnReorder',
      @column-resize-end='onColumnResizeEnd',
      v-bind='componentsProps'
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
        v-for='(col, colIndex) in computedColumns',
        :key='col.field',
        :field='String(col.field)',
        :header='getColumnHeader(col)',
        :sortable='col.sortable !== false && sortable !== false',
        :exportable='col.exportable !== false',
        :frozen='col.frozen',
        :align-frozen='col.alignFrozen',
        :style='getColumnStyle(col, colIndex)',
        :header-class='getColumnHeaderClass(col)',
        v-bind='getColumnComponentsProps(col)'
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

      // 分组插槽透传（Row Grouping）
      template(#groupheader='slotProps')
        slot(name='groupheader', v-bind='slotProps')
      template(#groupfooter='slotProps')
        slot(name='groupfooter', v-bind='slotProps')

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
    .vxe-table-footer(v-if='showFooterComputed')
      // 模式1: 完全自定义
      template(v-if='footerMode === "custom"')
        .c-border
          slot(name='footer', v-bind='slotProps')
          // 无限滚动状态提示 (仅在 custom 模式下显示)
          .center.p-paddings.fs-appFontSizes.color-text200(v-if='showInfiniteStatus')
            // 加载中
            .center.gap-gaps(v-if='loading')
              Icons(name='RiLoaderLine', animation='spin', size='s')
              | {{ loadingText }}
            // 没有更多数据
            .center.gap-gaps(v-else-if='!infiniteHasNext')
              Icons(name='HiSolidRefresh', size='s')
              | {{ noMoreDataText }}

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
            template(v-for='(column, index) in computedColumns', :key='column.field')
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

:deep(.vxe-column-header-center) {
  .p-datatable-column-header-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
:deep(.vxe-column-header-right) {
  .p-datatable-column-header-content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
:deep(.vxe-column-header-left) {
  .p-datatable-column-header-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
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
