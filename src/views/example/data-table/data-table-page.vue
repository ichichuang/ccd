<script setup lang="tsx">
/**
 * DataTable 示例
 * 1. 基础表格：静态数据，右侧展示全部功能控制
 * 2. api驱动：远程加载 + 分页
 * 3. api无限滚动：远程加载 + 无限滚动
 * 4. 高级功能：行展开、列级筛选、外部搜索、列偏好（持久化）等
 */
import type {
  DataTableColumn,
  DataTableExpose,
  PaginationState,
  SortState,
} from '@/components/DataTable'
import { DataTable as CDataTable } from '@/components/DataTable'
import type { DataTableUserPreferences, TableSizeConfig } from '@/components/DataTable/utils/types'
import { castArray, castColumns, castRecord } from '@/utils/typeCasters'
import { basicColumns, basicData } from './configs/basicTableConfig.tsx'
import { apiTableColumns, apiTableConfig } from './configs/apiTableConfig'
import { infiniteTableColumns, infiniteTableConfig } from './configs/infiniteTableConfig'
import { complexColumns, complexData } from './configs/complexTableConfig.tsx'
import { customColumns, customData } from './configs/customColumnConfig.tsx'
import type { SubscriptionRecord } from './configs/customColumnConfig.tsx'
import { styleColumns, styleData } from './configs/styleTableConfig'
import type { StyleProduct } from './configs/styleTableConfig'
import TableActions from './components/TableActions.vue'
import TableLayoutControls from './components/TableLayoutControls.vue'
import type { TableColumnConfig } from './components/TableLayoutControls.vue'

type TabKey =
  | 'basic'
  | 'api'
  | 'infinite'
  | 'filterSort'
  | 'editing'
  | 'grouping'
  | 'style'
  | 'expose'

const tableRef = ref<DataTableExpose<unknown>>()
const activeTab = ref<TabKey>('basic')
const activeTabModel = computed({
  get: () => activeTab.value,
  set: (v: string | number) => {
    activeTab.value = v as TabKey
  },
}) as import('vue').Ref<string | number>
/** 已选中的行 */
const selectedRows = ref<object[]>([])
/** 行编辑状态（editing Tab 使用） */
const editingRows = ref<unknown[]>([])

/** 可编辑 Tab 使用的数据副本（避免直接修改原始 customData） */
const initialEditingData: SubscriptionRecord[] = customData.map((item: SubscriptionRecord) => ({
  ...item,
}))
const editingData = ref<SubscriptionRecord[]>(initialEditingData)

// ========== 头部功能控制（基础表格全部可调，api/infinite 仅部分） ==========
/** 是否启用分页 */
const globalPagination = ref<boolean>(true)
/** 是否启用全局搜索（搜索框） */
const globalFilter = ref<boolean>(true)
/** 是否显示导出按钮 */
const globalExportable = ref<boolean>(true)
/** 是否启用行选择（多选/单选） */
const globalSelectable = ref<boolean>(false)
/** 是否显示表尾 */
const showFooter = ref<boolean>(true)
/** 表尾模式：custom 自定义插槽 / column-aligned 底部列与数据列对齐 */
const footerMode = ref<'custom' | 'column-aligned'>('column-aligned')
/** 是否显示表头栏（搜索、导出等） */
const showHeader = ref<boolean>(true)
/** 是否完全自定义表头（覆盖默认表头） */
const showCustomHeader = ref<boolean>(false)
/** 是否显示表头右侧插槽（新增、删除等按钮） */
const showCustomHeaderRight = ref<boolean>(true)

/** 是否启用列排序 */
const globalSortable = ref<boolean>(true)
/** 是否启用列筛选 */
const globalFilterable = ref<boolean>(false)

// ========== 选择相关（selectable 开启时生效） ==========
/** 选择模式：single 单选 / multiple 多选 */
const globalSelectionMode = ref<'single' | 'multiple'>('multiple')
/** 是否支持行点击选择 */
const globalRowSelectable = ref<boolean>(true)
/** 是否将选择列固定（横向滚动时不动） */
const globalSelectionFrozen = ref<boolean>(true)
/** 选择列固定位置：left 左侧 / right 右侧 */
const globalSelectionAlignFrozen = ref<'left' | 'right'>('left')

/** 六、方案二：responsiveLayout（scroll 横向滚动 / stack 窄屏堆叠） */
const globalResponsiveLayout = ref<'scroll' | 'stack'>('scroll')
/** 六、方案二：metaKeySelection（多选时需 Ctrl/⌘ 才能勾选） */
const globalMetaKeySelection = ref<boolean>(false)

// ========== 布局与样式（基础表格展示，api/infinite 也支持） ==========
/** 布局尺寸：高度模式、宽度模式等 */
const layoutSizeConfig = ref<TableSizeConfig>({
  heightMode: 'fill',
  widthMode: 'auto',
})
/** 样式：边框、网格线、斑马纹、行悬停 */
const styleConfig = ref<{
  bordered: boolean
  showGridlines: boolean
  stripedRows: boolean
  rowHover: boolean
}>({
  bordered: true,
  showGridlines: true,
  stripedRows: false,
  rowHover: true,
})

// ========== 列交互 ==========
/** 列配置：可拖拽排序、可调整宽度、列宽模式、内容对齐 */
const columnConfig = ref<TableColumnConfig>({
  reorderableColumns: false,
  resizableColumns: false,
  columnResizeMode: 'fit',
  contentAlign: 'left',
})

// ========== 其它 ==========
/** 表格尺寸：small 小号 / normal 正常 / large 大号 */
const globalSize = ref<'small' | 'normal' | 'large'>('normal')
/** 分页器位置：left 左 / center 中 / right 右 */
const globalPaginatorPosition = ref<'left' | 'center' | 'right'>('center')

/** 表格状态快照（用于右侧状态展示：数据量、分页、排序等） */
const tableState = ref<{
  data: object[]
  selectedRows: object[]
  paginationState?: PaginationState
  sortState?: SortState
}>({ data: [], selectedRows: [] })

/** expose Tab：最近一次操作标记 */
const lastExposeAction = ref<string | null>(null)

/** 5.2 行事件 demo：最近一次 row-select/row-unselect/row-click/row-dblclick */
const lastRowEvent = ref<{ type: string; data?: unknown; index?: number } | null>(null)

/** 5.2/5.5 单元格编辑完成事件：最近一次 cell-edit-complete */
const lastCellEdit = ref<{
  field: string
  newValue: unknown
  index: number
  data?: unknown
} | null>(null)

/** 八方案2：row-edit-init 事件（行进入编辑状态时触发） */
const lastRowEditInit = ref<unknown | null>(null)

/** 八方案4：sort-change 事件（列头点击排序时触发） */
const lastSortChange = ref<{ sortField: string | null; sortOrder: number | null } | null>(null)

/** 八方案3：getTableInstance 返回的实例类型（用于 State 展示） */
const tableInstanceType = ref<string | null>(null)

/** 高级 Tab 使用的列偏好（列顺序、列宽、隐藏列等），用于教学展示 useTablePersistence 暴露的能力 */
const tableAdvancedPreferences = ref<DataTableUserPreferences | null>(null)

/** 5.4 style Tab：带 headerRenderer 的列配置（Name 列使用 TSX 自定义表头） */
const styleColumnsWithHeaderRenderer = computed<DataTableColumn<object>[]>(() =>
  castColumns<DataTableColumn<object>>(
    (styleColumns as DataTableColumn<StyleProduct>[]).map(col =>
      col.field === 'name'
        ? {
            ...col,
            headerRenderer: () => (
              <div class="flex items-center gap-xs">
                <span>Name (headerRenderer)</span>
              </div>
            ),
          }
        : col
    )
  )
)

/** 当前 Tab 对应的列配置 */
const currentColumns = computed<DataTableColumn<object>[]>(() => {
  switch (activeTab.value) {
    case 'basic':
      return castColumns<DataTableColumn<object>>(basicColumns)
    case 'api':
      return castColumns<DataTableColumn<object>>(apiTableColumns)
    case 'infinite':
      return castColumns<DataTableColumn<object>>(infiniteTableColumns)
    case 'filterSort':
    case 'editing':
      return castColumns<DataTableColumn<object>>(customColumns)
    case 'grouping':
      return castColumns<DataTableColumn<object>>(complexColumns)
    case 'style':
      return styleColumnsWithHeaderRenderer.value
    case 'expose':
      return castColumns<DataTableColumn<object>>(basicColumns)
    default:
      return castColumns<DataTableColumn<object>>(basicColumns)
  }
})

/** 六、方案二：basic Tab 清空数据开关（用于演示 emptyMessage） */
const basicDataCleared = ref<boolean>(false)

/** 当前 Tab 对应的数据（仅本地数据模式下生效） */
const currentData = computed<object[]>(() => {
  switch (activeTab.value) {
    case 'basic':
      return basicDataCleared.value ? [] : basicData
    case 'filterSort':
      return castArray<SubscriptionRecord, object>(customData)
    case 'editing':
      return castArray<SubscriptionRecord, object>(editingData.value)
    case 'grouping':
      return castArray<unknown, object>(complexData)
    case 'style':
      return castArray<StyleProduct, object>(styleData)
    case 'expose':
      return castArray<unknown, object>(basicData)
    default:
      return []
  }
})

/** 当前 Tab 对应的 API 配置（仅 api/infinite 模式） */
const currentApi = computed<typeof apiTableConfig | undefined>(() => {
  if (activeTab.value === 'api') return apiTableConfig
  if (activeTab.value === 'infinite') return infiniteTableConfig
  return undefined
})

/** 当前 Tab 对应的 tableId（用于列持久化） */
const currentTableId = computed<string | undefined>(() => {
  switch (activeTab.value) {
    case 'basic':
      return 'example-data-table-basic'
    case 'api':
      return 'example-data-table-api'
    case 'infinite':
      return 'example-data-table-infinite'
    case 'filterSort':
      return 'example-data-table-filter-sort'
    case 'editing':
      return 'example-data-table-editing'
    case 'grouping':
      return 'example-data-table-grouping'

    case 'style':
      return 'example-data-table-style'
    case 'expose':
      return 'example-data-table-expose'
    default:
      return undefined
  }
})

// ========== DataTable Props（根据 Tab 计算有效值） ==========

/** 列排序开关：filterSort 模式始终开启，其它模式遵循全局配置 */
const sortableEffective = computed<boolean>(() => {
  if (activeTab.value === 'filterSort') {
    return true
  }
  return globalSortable.value
})

/** 列筛选开关：filterSort 模式始终开启，其它模式遵循全局配置 */
const filterableEffective = computed<boolean>(() => {
  if (activeTab.value === 'filterSort') {
    return true
  }
  return globalFilterable.value
})

/** 是否启用编辑：仅在 editing Tab 下开启 */
const editableEffective = computed<boolean>(() => activeTab.value === 'editing')

/** 5.5 编辑模式：editing Tab 可切换 row / cell */
const editModeToggle = ref<'row' | 'cell'>('row')

/** 编辑模式：仅在 editing Tab 下生效 */
const editModeEffective = computed<'cell' | 'row' | undefined>(() => {
  if (!editableEffective.value) return undefined
  return editModeToggle.value
})

/** 5.3 行分组模式：grouping Tab 可切换 rowspan / subheader */
const groupingRowGroupMode = ref<'rowspan' | 'subheader'>('subheader')

/** 行分组模式：仅在 grouping Tab 下开启 */
const rowGroupModeEffective = computed<'rowspan' | 'subheader' | undefined>(() => {
  if (activeTab.value === 'grouping') {
    return groupingRowGroupMode.value
  }
  return undefined
})

/** 5.3 分组可折叠：expandableRowGroups + v-model:expandedRowGroups */
const expandableRowGroupsEnabled = ref<boolean>(true)
const expandedRowGroups = ref<unknown[]>([])

/** 5.3 expandableRowGroups 与 expandedRowGroups 仅在 grouping Tab 且开启时生效 */
const expandableRowGroupsEffective = computed<boolean>(() => {
  return activeTab.value === 'grouping' && expandableRowGroupsEnabled.value
})

/** 行分组字段（grouping Tab 可切换） */
const groupByField = ref<'customer' | 'status'>('customer')

/** 行分组字段：仅在 grouping Tab 下生效 */
const groupRowsByEffective = computed<string | string[] | undefined>(() => {
  if (activeTab.value === 'grouping') {
    return groupByField.value
  }
  return undefined
})

/** 是否为 API 模式（api 或 infinite） */
const useApiMode = computed<boolean>(
  () => activeTab.value === 'api' || activeTab.value === 'infinite'
)

/** 导出配置（5.1 演示 exportConfig：filename、includeHeader 等） */
const exportConfigEffective = computed<{ filename: string; includeHeader: boolean } | undefined>(
  () => {
    if (!globalExportable.value) return undefined
    return {
      filename: `DataTable-export-${activeTab.value}`,
      includeHeader: true,
    }
  }
)

/** 5.4 componentsProps：向 PrimeVue DataTable 透传 props（style Tab 演示 data-testid） */
const componentsPropsEffective = computed<Record<string, unknown>>(() => {
  if (activeTab.value === 'style') {
    return { 'data-testid': 'example-style-datatable' }
  }
  return {}
})

/** 六、方案二：style Tab 行级样式 rowClass（缺货行高亮） */
function styleRowClass(data: object): string {
  const d = data as StyleProduct
  if (d.status === 'OUTOFSTOCK') return 'bg-danger/10'
  if (d.status === 'LOWSTOCK') return 'bg-warn/5!'
  return ''
}

/** 六、方案二：style Tab 行级样式 rowStyle（高价格行加粗） */
function styleRowStyle(data: object): Record<string, string> {
  const d = data as StyleProduct
  if (d.price >= 100) return { fontWeight: '600' }
  return {}
}

const styleRowClassEffective = computed<((data: object) => string) | undefined>(() =>
  activeTab.value === 'style' ? styleRowClass : undefined
)
const styleRowStyleEffective = computed<((data: object) => Record<string, string>) | undefined>(
  () => (activeTab.value === 'style' ? styleRowStyle : undefined)
)

/** 六、方案二：emptyMessage 空状态文案 */
const emptyMessageEffective = computed<string>(() => '暂无数据')

/** 是否启用分页：api 固定开启、infinite 固定关闭，其它 Tab 遵循全局分页开关 */
const paginationEffective = computed<boolean>(() => {
  if (activeTab.value === 'api') return true
  if (activeTab.value === 'infinite') return false
  return globalPagination.value
})

/** 是否展示分页开关：API / 无限滚动 Tab 固定行为，其它 Tab 可切换 */
const showPaginationToggle = computed<boolean>(
  () => activeTab.value !== 'api' && activeTab.value !== 'infinite'
)

watch(activeTab, tab => {
  selectedRows.value = []
  tableState.value = { data: [], selectedRows: [] }
  lastRowEvent.value = null
  lastCellEdit.value = null
  lastRowEditInit.value = null
  lastSortChange.value = null
  if (tab !== 'grouping') expandedRowGroups.value = []
  if (tab !== 'basic') basicDataCleared.value = false
  if (tab === 'api') globalPagination.value = true
  if (tab === 'infinite') globalPagination.value = false
})

watch(selectedRows, () => setTimeout(syncTableState, 50), { deep: true })

onMounted(() => setTimeout(syncTableState, 500))

/** 同步表格状态到 tableState（用于右侧状态展示） */
function syncTableState(): void {
  if (tableRef.value) {
    tableState.value = {
      data: (tableRef.value.data ?? []) as object[],
      selectedRows: (tableRef.value.selectedRows ?? []) as object[],
      paginationState: tableRef.value.paginationState,
      sortState: tableRef.value.sortState,
    }
  }
}

/** 刷新表格（重新请求 API 或重新计算） */
function handleRefresh(): void {
  tableRef.value?.refresh()
  setTimeout(syncTableState, 300)
}
/** 导出 CSV */
function handleExportCsv(): void {
  tableRef.value?.exportData('csv')
}
/** 导出 JSON */
function handleExportJson(): void {
  tableRef.value?.exportData('json')
}

/** 导出 XLSX（5.1 高级能力 demo） */
function handleExportXlsx(): void {
  tableRef.value?.exportData('xlsx')
}
/** 清空全局搜索与筛选 */
function handleClearFilters(): void {
  tableRef.value?.clearFilters()
}
/** 清空列排序 */
function handleClearSort(): void {
  tableRef.value?.clearSort()
}
/** 全选当前页数据 */
function handleSelectAll(): void {
  tableRef.value?.selectAll()
  setTimeout(syncTableState, 100)
}
/** 清空选中行 */
function handleClearSelection(): void {
  tableRef.value?.clearSelection()
  setTimeout(syncTableState, 100)
}

/** 八方案2：row-edit-init 事件（行进入编辑状态时触发） */
function handleRowEditInit(event: unknown): void {
  lastRowEditInit.value = event
  console.log('[DataTableExample][editing] row-edit-init:', event)
}

/** 八方案4：sort-change 事件（列头点击排序时触发） */
function handleSortChange(event: { sortField: string | null; sortOrder: number | null }): void {
  lastSortChange.value = event
  console.log('[DataTableExample][basic] sort-change:', event)
  syncTableState()
}

/** 八方案3：getTableInstance 获取 PrimeVue DataTable 实例 */
function handleExposeGetTableInstance(): void {
  if (!tableRef.value?.getTableInstance) return
  const instance = tableRef.value.getTableInstance()
  console.log('[DataTableExample][expose] table instance:', instance)
  console.log('[DataTableExample][expose] instance type:', typeof instance)
  lastExposeAction.value = 'getTableInstance'
  tableInstanceType.value = typeof instance
  setTimeout(syncTableState, 50)
}

/** editing Tab：行编辑保存事件 */
function handleRowEditSave(event: unknown): void {
  const typedEvent = event as { data: SubscriptionRecord; index: number }
  if (activeTab.value !== 'editing') return
  const updated: SubscriptionRecord[] = editingData.value.map((item: SubscriptionRecord) => ({
    ...item,
  }))

  const newRow = { ...typedEvent.data }
  // 行保存成功后，执行所有具备 onEditUpdate 逻辑的列，更新派生字段
  currentColumns.value.forEach(col => {
    if (typeof col.onEditUpdate === 'function') {
      col.onEditUpdate(newRow)
    }
  })

  updated[typedEvent.index] = newRow
  editingData.value = updated
  editingRows.value = []
  setTimeout(syncTableState, 100)
}

/** editing Tab：行编辑取消事件 */
function handleRowEditCancel(): void {
  if (activeTab.value !== 'editing') return
  editingRows.value = []
}

/** editing Tab：打印当前编辑行与编辑数据 */
function handleEditingPrint(): void {
  if (activeTab.value !== 'editing') return
  console.log('[DataTableExample][editing] editingRows:', editingRows.value)
  console.log('[DataTableExample][editing] editingData:', editingData.value)
}

/** 六、方案三：infinite Tab scroll-bottom 事件（组件内部已用于触底加载，此处打印供埋点/懒加载参考） */
function handleInfiniteScrollBottom(event: unknown): void {
  const e = event as { distanceToBottom?: number; scrollTop?: number; clientHeight?: number }
  console.log('[DataTableExample][infinite] scroll-bottom:', e)
}

/** 5.5 editing Tab：切换到 cell 模式时清空行编辑状态 */
function handleEditModeCell(): void {
  editModeToggle.value = 'cell'
  editingRows.value = []
}

/** editing Tab：还原编辑数据为初始值 */
function handleEditingReset(): void {
  if (activeTab.value !== 'editing') return
  editingData.value = customData.map((item: SubscriptionRecord) => ({ ...item }))
  editingRows.value = []
  setTimeout(syncTableState, 100)
}
// 高级 Tab：列级筛选与外部搜索示例已迁移到专用示例文件，此处移除未使用实现，避免类型与 lints 报错

/** 高级 Tab：查看当前表格的列偏好（useTablePersistence -> getTablePreferences） */
function showAdvancedPreferences(): void {
  if (!tableRef.value || !tableRef.value.getTablePreferences) {
    tableAdvancedPreferences.value = null
    return
  }
  tableAdvancedPreferences.value = tableRef.value.getTablePreferences()
}

/** 高级 Tab：重置列偏好，并刷新状态快照 */
function resetAdvancedPreferences(): void {
  if (!tableRef.value || !tableRef.value.resetTablePreferences) return
  tableRef.value.resetTablePreferences()
  setTimeout(() => {
    showAdvancedPreferences()
    syncTableState()
  }, 200)
}

/** filterSort Tab：应用一个示例性的多列排序（amount 降序 + status 升序） */
function applyFilterSortMultiSort(): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'filterSort') return
  const sorter = tableRef.value.setMultiSort
  if (!sorter) return
  sorter([
    { field: 'amount', order: -1 },
    { field: 'status', order: 1 },
  ])
  setTimeout(syncTableState, 100)
}

/** filterSort Tab：打印当前列筛选状态到控制台 */
function logFilterSortColumnFilters(): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'filterSort') return
  if (!tableRef.value.getColumnFilters) return
  const filters = tableRef.value.getColumnFilters()
  console.log('[DataTableExample][filterSort] column filters:', filters)
}

/** expose Tab：获取当前表格的第一行数据（若存在） */
function getFirstRowForExpose(): unknown | null {
  if (!tableRef.value) return null
  const data = (tableRef.value.data ?? []) as unknown[]
  if (!Array.isArray(data) || data.length === 0) return null
  return data[0] ?? null
}

/** expose Tab：跳转到指定页并更新状态快照 */
function handleExposeGoToPage(page: number): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'expose') return
  if (!tableRef.value.goToPage) return
  tableRef.value.goToPage(page)
  lastExposeAction.value = `goToPage(${page})`
  setTimeout(syncTableState, 100)
}

/** expose Tab：设置每页条数并更新状态快照 */
function handleExposeSetPageSize(size: number): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'expose') return
  if (!tableRef.value.setPageSize) return
  tableRef.value.setPageSize(size)
  lastExposeAction.value = `setPageSize(${size})`
  setTimeout(syncTableState, 100)
}

/** expose Tab：选中第一行（如果存在） */
function handleExposeSelectFirstRow(): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'expose') return
  if (!tableRef.value.selectRow) return
  const first = getFirstRowForExpose()
  if (!first) return
  tableRef.value.selectRow(first as unknown)
  lastExposeAction.value = 'selectFirstRow'
  setTimeout(syncTableState, 100)
}

/** expose Tab：取消选中第一行（如果存在） */
function handleExposeUnselectFirstRow(): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'expose') return
  if (!tableRef.value.unselectRow) return
  const first = getFirstRowForExpose()
  if (!first) return
  tableRef.value.unselectRow(first as unknown)
  lastExposeAction.value = 'unselectFirstRow'
  setTimeout(syncTableState, 100)
}

/** expose Tab：打印列筛选状态 */
function handleExposePrintColumnFilters(): void {
  if (!tableRef.value) return
  if (!tableRef.value.getColumnFilters) return
  const filters = tableRef.value.getColumnFilters()
  console.log('[DataTableExample][expose] column filters:', filters)
  lastExposeAction.value = 'printColumnFilters'
}

/** expose Tab：打印当前列宽信息 */
function handleExposePrintColumnWidths(): void {
  if (!tableRef.value) return
  if (!tableRef.value.getColumnWidths) return
  const widths = tableRef.value.getColumnWidths()
  console.log('[DataTableExample][expose] column widths:', widths)
  lastExposeAction.value = 'printColumnWidths'
}

/** expose Tab：触发列宽重新测量 */
function handleExposeUpdateColumnWidths(): void {
  if (!tableRef.value) return
  if (!tableRef.value.updateColumnWidths) return
  tableRef.value.updateColumnWidths()
  lastExposeAction.value = 'updateColumnWidths'
  setTimeout(syncTableState, 100)
}

/** expose Tab：保存当前列偏好（顺序/宽度/隐藏列） */
function handleExposeSavePreferences(): void {
  if (!tableRef.value) return
  if (!tableRef.value.saveTablePreferences) return
  tableRef.value.saveTablePreferences()
  // 保存后可以重新读取一次偏好用于状态展示
  showAdvancedPreferences()
  lastExposeAction.value = 'saveTablePreferences'
}

/** basic Tab：示例 expose 操作 - 跳转到第 3 页 */
function handleBasicGoToThirdPage(): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'basic') return
  if (!tableRef.value.goToPage) return
  tableRef.value.goToPage(3)
  setTimeout(syncTableState, 100)
}

/** basic Tab：示例 expose 操作 - 每页 50 条 */
function handleBasicSetPageSize(): void {
  if (!tableRef.value) return
  if (activeTab.value !== 'basic') return
  if (!tableRef.value.setPageSize) return
  tableRef.value.setPageSize(50)
  setTimeout(syncTableState, 100)
}

/** grouping Tab：切换分组字段 */
function handleGroupingSwitch(field: 'customer' | 'status'): void {
  if (activeTab.value !== 'grouping') return
  groupByField.value = field
  expandedRowGroups.value = []
  setTimeout(syncTableState, 100)
}

/** 5.3 grouping Tab：全部展开 */
function handleGroupingExpandAll(): void {
  if (activeTab.value !== 'grouping') return
  const field: string = groupByField.value
  const uniqueValues = [
    Array.from(
      new Set(
        complexData.map((d: { customer: string; status: string }) => d[field as keyof typeof d])
      )
    ),
  ]
  expandedRowGroups.value = uniqueValues.map(v => ({ [field]: v }))
  setTimeout(syncTableState, 100)
}

/** 5.3 grouping Tab：全部折叠 */
function handleGroupingCollapseAll(): void {
  if (activeTab.value !== 'grouping') return
  expandedRowGroups.value = []
  setTimeout(syncTableState, 100)
}

/** 5.2 行事件：统一处理 row-select/row-unselect/row-click/row-dblclick */
function handleRowSelect(event: unknown): void {
  const e = event as { data?: unknown; index?: number }
  lastRowEvent.value = { type: 'row-select', data: e.data, index: e.index }
  console.log('[DataTableExample][row-event] row-select:', e)
}

function handleRowUnselect(event: unknown): void {
  const e = event as { data?: unknown; index?: number }
  lastRowEvent.value = { type: 'row-unselect', data: e.data, index: e.index }
  console.log('[DataTableExample][row-event] row-unselect:', e)
}

function handleRowClick(event: unknown): void {
  const e = event as { data?: unknown; index?: number }
  lastRowEvent.value = { type: 'row-click', data: e.data, index: e.index }
  console.log('[DataTableExample][row-event] row-click:', e)
}

function handleRowDblclick(event: unknown): void {
  const e = event as { data?: unknown; index?: number }
  lastRowEvent.value = { type: 'row-dblclick', data: e.data, index: e.index }
  console.log('[DataTableExample][row-event] row-dblclick:', e)
}

/** 5.2/5.5 单元格编辑完成 */
function handleCellEditComplete(event: unknown): void {
  const e = event as {
    data?: SubscriptionRecord
    newValue?: unknown
    field?: string
    index?: number
  }
  lastCellEdit.value = {
    field: e.field ?? '',
    newValue: e.newValue,
    index: e.index ?? -1,
    data: e.data,
  }
  console.log('[DataTableExample][cell-edit] cell-edit-complete:', e)
  if (activeTab.value === 'editing' && e.data && typeof e.field === 'string') {
    const idx =
      e.index != null && e.index >= 0
        ? e.index
        : editingData.value.findIndex(
            (r: SubscriptionRecord) => r.id === (e.data as SubscriptionRecord)?.id
          )
    if (idx >= 0) {
      const updated: SubscriptionRecord[] = editingData.value.map((item: SubscriptionRecord) => ({
        ...item,
      }))
      const row = castRecord(updated[idx])
      if (row) row[e.field] = e.newValue

      // 单格编辑成功后，执行对应列的 onEditUpdate 逻辑（如计算总价）
      const col = currentColumns.value.find(c => c.field === e.field)
      if (col && typeof col.onEditUpdate === 'function') {
        col.onEditUpdate(row)
      }

      editingData.value = updated as SubscriptionRecord[]
    }
  }
  setTimeout(syncTableState, 100)
}
</script>

<template>
  <div class="h-full flex flex-col min-h-0">
    <Tabs
      v-model:value="activeTabModel"
      class="flex-1 min-h-0 flex flex-col"
    >
      <div class="shrink-0 flex justify-between items-center border-b-default pr-padding-md">
        <TabList class="border-0!">
          <Tab value="basic">基础表格</Tab>
          <Tab value="api">API 驱动</Tab>
          <Tab value="infinite">API 无限滚动</Tab>
          <Tab value="filterSort">列筛选 &amp; 多列排序</Tab>
          <Tab value="editing">可编辑表格</Tab>
          <Tab value="grouping">分组表格</Tab>
          <Tab value="style">样式 &amp; 汇总</Tab>
          <Tab value="expose">Expose 操作</Tab>
        </TabList>
      </div>

      <TabPanels class="flex-1 min-h-0 flex flex-col overflow-hidden p-0">
        <TabPanel
          :value="activeTab"
          class="flex-1 min-h-0 flex flex-col p-padding-md"
        >
          <div class="flex-1 min-h-0 flex flex-row gap-md items-stretch">
            <!-- 左侧：仅表格 -->
            <CScrollbar class="flex-1 min-h-0 layout-full">
              <CDataTable
                :key="activeTab"
                ref="tableRef"
                v-model:selected-rows="selectedRows"
                v-model:expanded-row-groups="expandedRowGroups"
                :table-id="currentTableId"
                :columns="currentColumns"
                :data="!useApiMode ? currentData : undefined"
                :api="currentApi"
                :pagination="paginationEffective"
                :global-filter="globalFilter"
                :exportable="globalExportable"
                :export-config="exportConfigEffective"
                :selectable="globalSelectable"
                :selection-mode="globalSelectable ? globalSelectionMode : undefined"
                :row-selectable="globalRowSelectable"
                :selection-frozen="globalSelectionFrozen"
                :selection-align-frozen="globalSelectionAlignFrozen"
                :show-header="showHeader"
                :sortable="sortableEffective"
                :filterable="filterableEffective"
                :sort-mode="activeTab === 'filterSort' ? 'multiple' : 'single'"
                :editable="editableEffective"
                :edit-mode="editModeEffective"
                :row-group-mode="rowGroupModeEffective"
                :group-rows-by="groupRowsByEffective"
                :expandable-row-groups="expandableRowGroupsEffective"
                :show-footer="showFooter"
                :footer-mode="footerMode"
                :size-config="
                  activeTab === 'infinite'
                    ? { ...layoutSizeConfig, heightMode: 'fill' }
                    : layoutSizeConfig
                "
                :bordered="styleConfig.bordered"
                :show-gridlines="styleConfig.showGridlines"
                :striped-rows="styleConfig.stripedRows"
                :row-hover="styleConfig.rowHover"
                :reorderable-columns="columnConfig.reorderableColumns"
                :resizable-columns="columnConfig.resizableColumns"
                :column-resize-mode="columnConfig.columnResizeMode"
                :content-align="columnConfig.contentAlign ?? 'left'"
                :size="globalSize"
                :paginator-position="globalPaginatorPosition"
                :paginator-config="{
                  rows: 20,
                }"
                :components-props="componentsPropsEffective"
                :row-class="styleRowClassEffective"
                :row-style="styleRowStyleEffective"
                :empty-message="emptyMessageEffective"
                :responsive-layout="globalResponsiveLayout"
                :meta-key-selection="globalMetaKeySelection"
                @update:expanded-row-groups="(val: unknown[]) => expandedRowGroups = val"
                @update:selected-rows="(val: object[]) => selectedRows = val"
                @row-select="handleRowSelect"
                @row-unselect="handleRowUnselect"
                @row-click="handleRowClick"
                @row-dblclick="handleRowDblclick"
                @cell-edit-complete="handleCellEditComplete"
                @row-edit-init="handleRowEditInit"
                @row-edit-save="handleRowEditSave"
                @row-edit-cancel="handleRowEditCancel"
                @sort-change="handleSortChange"
                @column-widths-change="syncTableState"
                @page-change="syncTableState"
                @scroll-bottom="handleInfiniteScrollBottom"
              >
                <!-- 行展开示例将迁移到专门的分组/展开 Tab 中，此处暂不挂载 expansion 插槽 -->

                <!-- grouping Tab：分组头/尾与展开内容 -->
                <template
                  v-if="activeTab === 'grouping'"
                  #groupheader="{ data }"
                >
                  <div class="px-padding-md py-padding-xs bg-muted fs-sm font-medium">
                    <span class="text-muted-foreground">
                      {{ groupByField === 'customer' ? 'Customer' : 'Status' }}:
                    </span>
                    <span class="ml-margin-xs text-foreground">
                      {{ groupByField === 'customer' ? data.customer : data.status }}
                    </span>
                  </div>
                </template>

                <template
                  v-if="activeTab === 'grouping'"
                  #groupfooter="{ data }"
                >
                  <div
                    class="px-padding-md py-padding-xs bg-surface-ground fs-xs text-muted-foreground"
                  >
                    分组小计金额:
                    {{
                      complexData
                        .filter(order => order.customer === data.customer)
                        .reduce((sum, order) => sum + order.amount, 0)
                    }}
                  </div>
                </template>

                <template
                  v-if="activeTab === 'grouping'"
                  #expansion="{ data }"
                >
                  <div class="px-padding-md py-padding-sm bg-card/60 flex flex-col gap-xs fs-xs">
                    <div class="font-medium mb-margin-xs">订单明细 (Items)</div>
                    <div
                      v-for="item in data.items"
                      :key="item.name"
                      class="flex justify-between items-center"
                    >
                      <span class="text-foreground">{{ item.name }} × {{ item.quantity }}</span>
                      <span class="text-muted-foreground">¥{{ item.price * item.quantity }}</span>
                    </div>
                  </div>
                </template>

                <template
                  v-if="showCustomHeader"
                  #header
                >
                  <div
                    class="flex items-center justify-between px-padding-md py-padding-sm bg-primary-50 border-b border-primary-200 rounded-t-md"
                  >
                    <div class="font-bold text-primary-700 flex items-center gap-sm">
                      <Icons
                        name="i-lucide-rocket"
                        size="sm"
                      />
                      <span>🚀 全局自定义表头 (Full Custom Header)</span>
                    </div>
                    <div class="flex gap-sm">
                      <Button
                        label="自定义按钮 A"
                        size="small"
                        severity="info"
                      />
                      <Button
                        label="自定义按钮 B"
                        size="small"
                        severity="warning"
                      />
                    </div>
                  </div>
                </template>

                <template
                  v-if="showCustomHeaderRight"
                  #header-right
                >
                  <Button
                    icon="i-lucide-plus"
                    label="新增"
                    size="small"
                    severity="success"
                  />
                  <Button
                    icon="i-lucide-trash"
                    label="删除"
                    size="small"
                    severity="danger"
                    outlined
                  />
                </template>

                <template
                  v-if="showFooter && footerMode === 'custom'"
                  #footer="{ data, pagination }"
                >
                  <div
                    class="fs-sm text-muted-foreground px-padding-md py-padding-sm flex items-center gap-md"
                  >
                    <span>共 {{ data?.length ?? 0 }} 条</span>
                    <template v-if="paginationEffective && pagination && pagination.rows > 0">
                      <span>·</span>
                      <span>
                        当前页 {{ Math.min(pagination.first + 1, data?.length ?? 0) }}-{{
                          Math.min(pagination.first + pagination.rows, data?.length ?? 0)
                        }}
                      </span>
                    </template>
                  </div>
                </template>
              </CDataTable>
            </CScrollbar>

            <!-- 右侧：全部控制 -->
            <div
              class="layout-sidepanel shrink-0 min-h-0 flex flex-col hidden xl:flex border-l border-border bg-surface-ground"
            >
              <CScrollbar class="flex-1 min-h-0 layout-full">
                <div class="p-padding-xl flex flex-col gap-2xl">
                  <!-- 头部功能 -->
                  <div>
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      头部功能 (Header)
                    </h3>
                    <!-- 基础头部控制：所有 Tab 通用的最小集合 -->
                    <div class="flex flex-col gap-md">
                      <!-- 分页开关：除 API / 无限滚动外可手动控制 -->
                      <div
                        v-if="showPaginationToggle"
                        class="flex items-center justify-between"
                      >
                        <label class="fs-sm">分页 (Pagination)</label>
                        <ToggleSwitch v-model="globalPagination" />
                      </div>
                      <div
                        v-else-if="activeTab === 'api'"
                        class="flex items-center justify-between text-muted-foreground fs-sm"
                      >
                        <span>分页</span>
                        <span>已启用（API 分页模式，page/_limit 映射到请求参数）</span>
                      </div>
                      <div
                        v-else-if="activeTab === 'infinite'"
                        class="flex items-center justify-between text-muted-foreground fs-sm"
                      >
                        <span>分页</span>
                        <span>关闭（无限滚动模式，仅触底加载下一页）</span>
                      </div>

                      <!-- 全局搜索：表头搜索框 -->
                      <div class="flex items-center justify-between">
                        <label class="fs-sm">全局搜索 (GlobalFilter)</label>
                        <ToggleSwitch v-model="globalFilter" />
                      </div>
                      <!-- 导出：CSV/JSON 导出按钮 -->
                      <div class="flex items-center justify-between">
                        <label class="fs-sm">导出 (Exportable)</label>
                        <ToggleSwitch v-model="globalExportable" />
                      </div>

                      <!-- 表头栏：搜索、导出等区域 -->
                      <div class="flex items-center justify-between">
                        <label class="fs-sm">显示表头栏 (ShowHeader)</label>
                        <ToggleSwitch v-model="showHeader" />
                      </div>
                      <template v-if="showHeader">
                        <div
                          class="flex items-center justify-between pl-padding-md bg-muted/30 rounded-scale-sm py-padding-xs my-margin-xs"
                        >
                          <label class="fs-sm text-muted-foreground">
                            完全自定义 (Full Override)
                          </label>
                          <ToggleSwitch v-model="showCustomHeader" />
                        </div>
                        <div
                          v-if="!showCustomHeader"
                          class="flex items-center justify-between pl-padding-md bg-muted/30 rounded-scale-sm py-padding-xs my-margin-xs"
                        >
                          <label class="fs-sm text-muted-foreground">右侧插槽 (Header Right)</label>
                          <ToggleSwitch v-model="showCustomHeaderRight" />
                        </div>
                      </template>
                    </div>

                    <!-- 行选择 / 表尾 / 列排序 / 列筛选：主要用于基础表格场景 -->
                    <div
                      v-if="activeTab === 'basic'"
                      class="mt-margin-md pt-padding-md flex flex-col gap-md"
                    >
                      <!-- 行选择：单选/多选复选框 -->
                      <div class="flex items-center justify-between">
                        <label class="fs-sm">行选择 (Selectable)</label>
                        <ToggleSwitch v-model="globalSelectable" />
                      </div>
                      <template v-if="globalSelectable">
                        <div
                          class="flex flex-col gap-sm pl-padding-md bg-muted/30 rounded-scale-sm p-padding-sm"
                        >
                          <label class="fs-sm font-medium">选择模式 (Selection Mode)</label>
                          <div class="flex gap-sm">
                            <Button
                              label="单选"
                              size="small"
                              :severity="globalSelectionMode === 'single' ? 'primary' : 'secondary'"
                              @click="globalSelectionMode = 'single'"
                            />
                            <Button
                              label="多选"
                              size="small"
                              :severity="
                                globalSelectionMode === 'multiple' ? 'primary' : 'secondary'
                              "
                              @click="globalSelectionMode = 'multiple'"
                            />
                          </div>
                          <!-- 是否支持点击行进行选择 -->
                          <div class="flex items-center justify-between">
                            <label class="fs-sm text-muted-foreground">
                              行点击选择 (RowSelectable)
                            </label>
                            <ToggleSwitch v-model="globalRowSelectable" />
                          </div>
                          <!-- 横向滚动时选择列是否固定 -->
                          <div class="flex items-center justify-between">
                            <label class="fs-sm text-muted-foreground">
                              选择列固定 (SelectionFrozen)
                            </label>
                            <ToggleSwitch v-model="globalSelectionFrozen" />
                          </div>
                          <div class="flex items-center justify-between">
                            <label class="fs-sm text-muted-foreground">
                              MetaKeySelection (Ctrl/⌘ 多选)
                            </label>
                            <ToggleSwitch v-model="globalMetaKeySelection" />
                          </div>
                          <div
                            v-if="globalSelectionFrozen"
                            class="flex flex-col gap-sm"
                          >
                            <label class="fs-sm text-muted-foreground">固定位置（左/右）</label>
                            <div class="flex gap-sm">
                              <Button
                                label="左"
                                size="small"
                                :severity="
                                  globalSelectionAlignFrozen === 'left' ? 'primary' : 'secondary'
                                "
                                @click="globalSelectionAlignFrozen = 'left'"
                              />
                              <Button
                                label="右"
                                size="small"
                                :severity="
                                  globalSelectionAlignFrozen === 'right' ? 'primary' : 'secondary'
                                "
                                @click="globalSelectionAlignFrozen = 'right'"
                              />
                            </div>
                          </div>
                        </div>
                      </template>

                      <div class="flex flex-col gap-sm">
                        <label class="fs-sm text-muted-foreground">
                          响应布局 (responsiveLayout)
                        </label>
                        <div class="flex gap-sm">
                          <Button
                            label="scroll"
                            size="small"
                            :severity="
                              globalResponsiveLayout === 'scroll' ? 'primary' : 'secondary'
                            "
                            @click="globalResponsiveLayout = 'scroll'"
                          />
                          <Button
                            label="stack"
                            size="small"
                            :severity="globalResponsiveLayout === 'stack' ? 'primary' : 'secondary'"
                            @click="globalResponsiveLayout = 'stack'"
                          />
                        </div>
                        <span class="fs-xs text-muted-foreground">
                          stack 模式在窄屏下自动堆叠字段
                        </span>
                      </div>

                      <!-- 列排序：表头点击排序 -->
                      <div class="flex items-center justify-between">
                        <label class="fs-sm">列排序 (Sortable)</label>
                        <ToggleSwitch v-model="globalSortable" />
                      </div>
                      <!-- 列筛选：列头筛选器 -->
                      <div class="flex items-center justify-between">
                        <label class="fs-sm">列筛选 (Filterable)</label>
                        <ToggleSwitch v-model="globalFilterable" />
                      </div>

                      <!-- 表尾：底部汇总区域 -->
                      <div class="flex items-center justify-between">
                        <label class="fs-sm">显示表尾 (ShowFooter)</label>
                        <ToggleSwitch v-model="showFooter" />
                      </div>
                      <div
                        v-if="showFooter"
                        class="flex flex-col gap-sm pl-padding-md bg-muted/30 rounded-scale-sm p-padding-sm"
                      >
                        <label class="fs-sm text-muted-foreground">表尾模式 (Footer Mode)</label>
                        <div class="flex gap-sm">
                          <Button
                            label="Custom"
                            size="small"
                            :severity="footerMode === 'custom' ? 'primary' : 'secondary'"
                            @click="footerMode = 'custom'"
                          />
                          <Button
                            label="Column-aligned"
                            size="small"
                            :severity="footerMode === 'column-aligned' ? 'primary' : 'secondary'"
                            @click="footerMode = 'column-aligned'"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- api Tab：API 配置说明与分页状态调试 -->
                  <div v-if="activeTab === 'api'">
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      API 分页说明 (Pagination)
                    </h3>
                    <p class="fs-xs text-muted-foreground mb-margin-sm">
                      通过 DataTableApiConfig 配置服务端分页：mode="pagination"，pageParam="_page"，
                      pageSizeParam="_limit"。DataTable
                      会将当前页与每页条数映射到对应请求参数，并在分页变化时自动重新请求。
                    </p>
                    <p class="fs-xs text-muted-foreground mb-margin-sm">
                      六、方案一 sort/filter：sort.sortFieldParam、sortOrderParam 映射排序参数；
                      filter.filterParam 映射全局搜索；filter.columnFilterParam 映射列级筛选。
                      可通过 Network 面板观察请求参数。
                    </p>
                    <div class="flex flex-wrap gap-sm">
                      <Button
                        label="打印当前分页状态"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="
                          () =>
                            console.log(
                              '[DataTableExample][api] pagination:',
                              tableState.paginationState
                            )
                        "
                      />
                    </div>
                  </div>

                  <!-- infinite Tab：无限滚动说明 -->
                  <div v-if="activeTab === 'infinite'">
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      无限滚动 (Infinite Scroll)
                    </h3>
                    <p class="fs-xs text-muted-foreground">
                      使用 mode="infinite" 与 infinite.pageSize/pageParam/pageSizeParam
                      配置触底加载， INFINITE_SCROLL_THRESHOLD_PX
                      控制触发阈值。分页开关被固定关闭，仅依赖滚动位置加载更多数据。
                    </p>
                    <p class="fs-xs text-muted-foreground mt-margin-xs">
                      六、方案三 scroll-bottom：组件内部已基于该事件实现自动加载下一页；示例中绑定
                      @scroll-bottom 打印事件，可供埋点或懒加载其他资源使用。
                    </p>
                  </div>
                  <!-- filterSort Tab：列筛选 & 多列排序示例 -->
                  <div v-if="activeTab === 'filterSort'">
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      列筛选 &amp; 多列排序
                    </h3>
                    <p class="fs-xs text-muted-foreground mb-margin-sm">
                      使用列配置（filterType / filterOptions / filterRenderer）与 multiSort
                      能力，演示列级 筛选与多列排序的组合用法。
                    </p>
                    <p class="fs-xs text-muted-foreground mb-margin-xs">
                      使用列配置的 filterType/filterOptions/filterRenderer 构建列头筛选；multiSort
                      模式支持多列排序， 通过按钮示例调用 setMultiSort。
                    </p>
                    <div class="flex flex-wrap gap-sm">
                      <Button
                        label="应用多列排序 (amount↓, status↑)"
                        size="small"
                        severity="secondary"
                        @click="applyFilterSortMultiSort"
                      />
                      <Button
                        label="打印列筛选状态"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="logFilterSortColumnFilters"
                      />
                    </div>
                  </div>

                  <!-- editing Tab：可编辑表格示例（5.5 editMode row/cell） -->
                  <div v-if="activeTab === 'editing'">
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      可编辑表格 (Editing)
                    </h3>
                    <p class="fs-xs text-muted-foreground mb-margin-sm">
                      使用列配置的 editable/editorRenderer 将金额列变为可编辑状态。row 模式通过
                      v-model:editing-rows 和 row-edit-save/row-edit-cancel 管理；cell
                      模式支持单格编辑，通过 cell-edit-complete 记录最近编辑。
                      <strong>八方案2 row-edit-init</strong>
                      ：行进入编辑状态时触发。
                    </p>
                    <div class="flex flex-wrap gap-sm mb-margin-sm">
                      <span class="text-muted-foreground fs-sm self-center">editMode:</span>
                      <Button
                        label="row"
                        size="small"
                        :severity="editModeToggle === 'row' ? 'primary' : 'secondary'"
                        @click="editModeToggle = 'row'"
                      />
                      <Button
                        label="cell"
                        size="small"
                        :severity="editModeToggle === 'cell' ? 'primary' : 'secondary'"
                        @click="handleEditModeCell"
                      />
                    </div>
                    <div class="flex flex-wrap gap-sm mb-margin-sm">
                      <Button
                        label="打印当前编辑行"
                        size="small"
                        severity="secondary"
                        @click="handleEditingPrint"
                      />
                      <Button
                        label="还原数据"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="handleEditingReset"
                      />
                    </div>
                    <div
                      v-if="lastRowEditInit"
                      class="mt-margin-sm"
                    >
                      <p class="fs-xs text-muted-foreground mb-margin-xs">
                        最近一次 row-edit-init 事件：
                      </p>
                      <pre
                        class="bg-muted p-padding-xs rounded fs-xs break-all whitespace-pre-wrap"
                        >{{ JSON.stringify(lastRowEditInit, null, 2) }}</pre
                      >
                    </div>
                    <pre class="fs-xs font-mono break-all whitespace-pre-wrap mt-margin-xs">{{
                      JSON.stringify(
                        {
                          editingRows,
                          editingData,
                          lastCellEdit: lastCellEdit ?? undefined,
                          lastRowEditInit: lastRowEditInit ?? undefined,
                        },
                        null,
                        2
                      )
                    }}</pre>
                  </div>

                  <!-- grouping Tab：分组表格说明（5.3 rowspan / expandableRowGroups） -->
                  <div v-if="activeTab === 'grouping'">
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      分组表格 (Grouping)
                    </h3>
                    <p class="fs-xs text-muted-foreground mb-margin-sm">
                      使用 rowGroupMode 与 groupRowsBy 字段对订单按客户或状态分组，通过
                      groupheader/groupfooter 插槽展示分组标题与小计，并在 expansion
                      插槽中展示订单明细。
                    </p>
                    <div class="flex flex-wrap gap-sm mb-margin-sm">
                      <Button
                        label="按客户分组 (customer)"
                        size="small"
                        :severity="groupByField === 'customer' ? 'primary' : 'secondary'"
                        @click="handleGroupingSwitch('customer')"
                      />
                      <Button
                        label="按状态分组 (status)"
                        size="small"
                        :severity="groupByField === 'status' ? 'primary' : 'secondary'"
                        @click="handleGroupingSwitch('status')"
                      />
                    </div>
                    <div class="flex flex-wrap gap-sm mb-margin-sm">
                      <span class="text-muted-foreground fs-sm self-center">rowGroupMode:</span>
                      <Button
                        label="rowspan"
                        size="small"
                        :severity="groupingRowGroupMode === 'rowspan' ? 'primary' : 'secondary'"
                        @click="groupingRowGroupMode = 'rowspan'"
                      />
                      <Button
                        label="subheader"
                        size="small"
                        :severity="groupingRowGroupMode === 'subheader' ? 'primary' : 'secondary'"
                        @click="groupingRowGroupMode = 'subheader'"
                      />
                    </div>
                    <div class="flex items-center gap-sm mb-margin-sm">
                      <span class="text-muted-foreground fs-sm">expandableRowGroups</span>
                      <ToggleSwitch v-model="expandableRowGroupsEnabled" />
                    </div>
                    <div
                      v-if="expandableRowGroupsEnabled"
                      class="flex flex-wrap gap-sm mb-margin-sm"
                    >
                      <Button
                        label="全部展开"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="handleGroupingExpandAll"
                      />
                      <Button
                        label="全部折叠"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="handleGroupingCollapseAll"
                      />
                    </div>
                    <p class="fs-xs text-muted-foreground">
                      当前: rowGroupMode=
                      <span class="font-mono text-foreground">{{ groupingRowGroupMode }}</span>
                      , 分组字段=
                      <span class="font-mono text-foreground">{{ groupByField }}</span>
                      , 已展开分组数=
                      <span class="font-mono text-foreground">{{ expandedRowGroups.length }}</span>
                    </p>
                  </div>

                  <!-- 布局与样式：高度/宽度模式、边框、网格线、列拖拽等 -->
                  <div>
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      布局与样式 (Layout)
                    </h3>
                    <TableLayoutControls
                      v-model:size-config="layoutSizeConfig"
                      v-model:style-config="styleConfig"
                      v-model:size="globalSize"
                      v-model:paginator-position="globalPaginatorPosition"
                      v-model:column-config="columnConfig"
                      :show-paginator-position="paginationEffective"
                    />
                  </div>

                  <!-- style Tab：样式说明 -->
                  <div v-if="activeTab === 'style'">
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      列样式 &amp; 汇总 (Style)
                    </h3>
                    <p class="fs-xs text-muted-foreground mb-margin-sm">
                      使用 styleColumns 展示列级样式能力：通过 bodyClass/body
                      自定义价格/状态等单元格的颜色与粗细， 并结合 align
                      控制数量列的对齐方式，所有样式均通过 UnoCSS 语义类完成。
                    </p>
                    <ul class="list-disc pl-padding-md fs-xs text-muted-foreground">
                      <li>
                        Name 列使用 bodyClass="font-bold" 突出产品名称；
                        <strong>5.4 headerRenderer</strong>
                        ：自定义 TSX 表头（图标 + 文案）；
                        <strong>八方案5 minWidth/maxWidth</strong>
                        ：150–300px 列宽限制。
                      </li>
                      <li>
                        Price 列通过函数型 bodyClass 根据价格高低动态应用 text-danger/font-bold；
                        <strong>八方案5</strong>
                        ：minWidth 100、maxWidth 200。
                      </li>
                      <li>Status 列根据 INSTOCK/LOWSTOCK/OUTOFSTOCK 显示不同语义色。</li>
                      <li>
                        Category、Quantity 列设置
                        <strong>八方案1 exportable: false</strong>
                        ，导出时会被排除。
                      </li>
                      <li>
                        Quantity 列使用 align="center"；
                        <strong>八方案6 bodyStyle</strong>
                        ：库存&lt;5 时应用红色背景（内联样式）。
                      </li>
                      <li>
                        <strong>5.4 componentsProps</strong>
                        ：向 PrimeVue DataTable 透传 data-testid，便于 E2E 测试定位。
                      </li>
                      <li>
                        <strong>六、方案二 rowClass/rowStyle</strong>
                        ：OUTOFSTOCK 行使用 bg-danger/10，LOWSTOCK 使用 bg-warn/5；价格≥100 行使用
                        rowStyle 加粗。
                      </li>
                    </ul>
                  </div>

                  <!-- 操作：刷新、导出、清空筛选/排序、全选/清空选择 -->
                  <div>
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      操作 (Actions)
                    </h3>
                    <TableActions
                      :selectable="globalSelectable"
                      :selection-mode="globalSelectionMode"
                      @refresh="handleRefresh"
                      @export-csv="handleExportCsv"
                      @export-json="handleExportJson"
                      @export-xlsx="handleExportXlsx"
                      @clear-filters="handleClearFilters"
                      @clear-sort="handleClearSort"
                      @select-all="handleSelectAll"
                      @clear-selection="handleClearSelection"
                    />
                    <div
                      v-if="activeTab === 'basic'"
                      class="mt-margin-md pt-padding-md flex flex-wrap gap-sm"
                    >
                      <Button
                        label="跳转到第 3 页"
                        size="small"
                        severity="secondary"
                        @click="handleBasicGoToThirdPage"
                      />
                      <Button
                        :label="basicDataCleared ? '恢复数据' : '清空数据'"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="basicDataCleared = !basicDataCleared"
                      />
                      <Button
                        label="每页 50 条"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="handleBasicSetPageSize"
                      />
                    </div>
                  </div>

                  <!-- expose Tab：通过按钮演示 DataTable 暴露的 API -->
                  <div v-if="activeTab === 'expose'">
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      Expose API 示例
                    </h3>
                    <p class="fs-xs text-muted-foreground mb-margin-sm">
                      通过按钮直接调用 DataTable 暴露的
                      API（分页、选择、筛选、列宽与列偏好等），便于在示例中直观观察行为。
                    </p>

                    <div class="flex flex-col gap-sm">
                      <!-- 分页相关 -->
                      <div class="flex flex-wrap gap-sm">
                        <Button
                          label="跳转到第 2 页"
                          size="small"
                          severity="secondary"
                          @click="handleExposeGoToPage(2)"
                        />
                        <Button
                          label="每页 50 条"
                          size="small"
                          severity="secondary"
                          outlined
                          @click="handleExposeSetPageSize(50)"
                        />
                      </div>

                      <!-- 选择相关 -->
                      <div class="flex flex-wrap gap-sm">
                        <Button
                          label="选中第 1 行"
                          size="small"
                          severity="secondary"
                          @click="handleExposeSelectFirstRow"
                        />
                        <Button
                          label="取消第 1 行"
                          size="small"
                          severity="secondary"
                          outlined
                          @click="handleExposeUnselectFirstRow"
                        />
                      </div>

                      <!-- 筛选 & 列宽 & 实例 -->
                      <div class="flex flex-wrap gap-sm">
                        <Button
                          label="打印列筛选"
                          size="small"
                          severity="secondary"
                          @click="handleExposePrintColumnFilters"
                        />
                        <Button
                          label="打印列宽信息"
                          size="small"
                          severity="secondary"
                          @click="handleExposePrintColumnWidths"
                        />
                        <Button
                          label="刷新列宽测量"
                          size="small"
                          severity="secondary"
                          outlined
                          @click="handleExposeUpdateColumnWidths"
                        />
                        <Button
                          label="获取表格实例"
                          size="small"
                          severity="secondary"
                          outlined
                          @click="handleExposeGetTableInstance"
                        />
                      </div>

                      <!-- 列偏好持久化 -->
                      <div class="flex flex-wrap gap-sm">
                        <Button
                          label="查看列偏好"
                          size="small"
                          severity="secondary"
                          outlined
                          @click="showAdvancedPreferences"
                        />
                        <Button
                          label="保存列偏好"
                          size="small"
                          severity="secondary"
                          outlined
                          @click="handleExposeSavePreferences"
                        />
                        <Button
                          label="重置列偏好"
                          size="small"
                          severity="secondary"
                          outlined
                          @click="resetAdvancedPreferences"
                        />
                      </div>
                      <div class="mt-margin-md fs-xs text-muted-foreground">
                        <div class="font-medium mb-margin-xs">Expose API 速查表:</div>
                        <ul class="list-disc pl-padding-md">
                          <li>分页: goToPage / setPageSize</li>
                          <li>选择: selectRow / unselectRow</li>
                          <li>筛选: getColumnFilters</li>
                          <li>列宽: getColumnWidths / updateColumnWidths</li>
                          <li>实例: getTableInstance（八方案3，返回 PrimeVue DataTable 实例）</li>
                          <li>
                            列偏好: getTablePreferences / saveTablePreferences /
                            resetTablePreferences
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- 表格状态：已选行数、布局、分页、排序、JSON 快照 -->
                  <div>
                    <h3
                      class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider mb-margin-md"
                    >
                      表格状态 (State)
                    </h3>
                    <div class="flex flex-col gap-md fs-sm">
                      <div v-if="tableState.selectedRows?.length">
                        <span class="text-muted-foreground">已选行数:</span>
                        {{ tableState.selectedRows.length }}
                      </div>
                      <div class="flex flex-col gap-xs">
                        <span class="text-muted-foreground">布局:</span>
                        {{ layoutSizeConfig.heightMode }} / {{ layoutSizeConfig.widthMode }}
                      </div>
                      <div v-if="tableState.paginationState">
                        <span class="text-muted-foreground">分页:</span>
                        第 {{ tableState.paginationState.page }} 页 / 每页
                        {{ tableState.paginationState.rows }} 条 / 共
                        {{ tableState.paginationState.totalRecords ?? '-' }} 条
                      </div>
                      <div v-if="tableState.sortState?.sortField">
                        <span class="text-muted-foreground">排序:</span>
                        {{ tableState.sortState.sortField }}
                        {{
                          tableState.sortState.sortOrder === 1
                            ? '↑'
                            : tableState.sortState.sortOrder === -1
                              ? '↓'
                              : ''
                        }}
                      </div>
                      <div v-if="activeTab === 'infinite'">
                        <span class="text-muted-foreground">已加载条数 (Infinite):</span>
                        <span class="font-mono text-foreground">
                          {{ tableState.data.length }}
                        </span>
                      </div>
                      <div
                        v-if="lastRowEvent"
                        class="text-primary"
                      >
                        <span class="text-muted-foreground">最近行事件 (5.2):</span>
                        {{ lastRowEvent?.type }}
                        <span
                          v-if="lastRowEvent?.index != null"
                          class="text-muted-foreground"
                        >
                          @index {{ lastRowEvent.index }}
                        </span>
                      </div>
                      <div
                        v-if="lastCellEdit"
                        class="text-primary"
                      >
                        <span class="text-muted-foreground">最近单元格编辑 (5.2/5.5):</span>
                        {{ lastCellEdit?.field }} = {{ lastCellEdit?.newValue }}
                      </div>
                      <div
                        v-if="lastSortChange && activeTab === 'basic'"
                        class="text-primary"
                      >
                        <span class="text-muted-foreground">最近排序变化 (八方案4):</span>
                        {{ lastSortChange?.sortField ?? '-' }}
                        {{
                          lastSortChange?.sortOrder === 1
                            ? '↑'
                            : lastSortChange?.sortOrder === -1
                              ? '↓'
                              : ''
                        }}
                      </div>
                      <div
                        v-if="tableInstanceType && activeTab === 'expose'"
                        class="text-primary"
                      >
                        <span class="text-muted-foreground">表格实例类型 (八方案3):</span>
                        {{ tableInstanceType }}
                      </div>
                    </div>
                    <pre class="fs-xs font-mono break-all whitespace-pre-wrap mt-margin-md">{{
                      JSON.stringify(
                        {
                          selectedCount: tableState.selectedRows?.length ?? 0,
                          paginationState: tableState.paginationState,
                          sortState: tableState.sortState,
                          columnPreferences: tableAdvancedPreferences,
                          lastExposeAction,
                          lastRowEvent: lastRowEvent ?? undefined,
                          lastCellEdit: lastCellEdit ?? undefined,
                          lastSortChange: lastSortChange ?? undefined,
                          tableInstanceType: tableInstanceType ?? undefined,
                          ...(activeTab === 'grouping' && { expandedRowGroups: expandedRowGroups }),
                        },
                        null,
                        2
                      )
                    }}</pre>
                    <!-- END JSON Dump -->
                  </div>
                </div>
              </CScrollbar>
            </div>
            <!-- 右侧结束 -->
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
