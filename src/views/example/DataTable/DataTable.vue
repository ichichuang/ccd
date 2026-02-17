<script setup lang="ts">
/**
 * DataTable 示例 - 三种模式
 * 1. 基础表格：静态数据，右侧展示全部功能控制
 * 2. api驱动：远程加载 + 分页
 * 3. api无限滚动：远程加载 + 无限滚动
 */
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue'
import { ref, computed, watch, onMounted } from 'vue'
import { DataTable } from '@/components/DataTable'
import type {
  DataTableColumn,
  DataTableExpose,
  PaginationState,
  SortState,
} from '@/components/DataTable'
import type { TableSizeConfig } from '@/components/DataTable/utils/types'
import { basicColumns, basicData } from './configs/basicTableConfig.tsx'
import { apiTableColumns, apiTableConfig } from './configs/apiTableConfig'
import { infiniteTableColumns, infiniteTableConfig } from './configs/infiniteTableConfig'
import { customColumns, customData } from './configs/customColumnConfig.tsx'
import TableActions from './components/TableActions.vue'
import TableLayoutControls from './components/TableLayoutControls.vue'
import type { TableColumnConfig } from './components/TableLayoutControls.vue'

type TabKey = 'basic' | 'api' | 'infinite' | 'advanced'

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

// ========== 头部功能控制（基础表格全部可调，api/infinite 仅部分） ==========
/** 是否启用分页 */
const globalPagination = ref(true)
/** 是否启用全局搜索（搜索框） */
const globalFilter = ref(true)
/** 是否显示导出按钮 */
const globalExportable = ref(true)
/** 是否启用行选择（多选/单选） */
const globalSelectable = ref(false)
/** 是否显示表尾 */
const showFooter = ref(true)
/** 表尾模式：custom 自定义插槽 / column-aligned 底部列与数据列对齐 */
const footerMode = ref<'custom' | 'column-aligned'>('column-aligned')
/** 是否显示表头栏（搜索、导出等） */
const showHeader = ref(true)
/** 是否完全自定义表头（覆盖默认表头） */
const showCustomHeader = ref(false)
/** 是否显示表头右侧插槽（新增、删除等按钮） */
const showCustomHeaderRight = ref(true)

/** 是否启用列排序 */
const globalSortable = ref(true)
/** 是否启用列筛选 */
const globalFilterable = ref(false)

// ========== 选择相关（selectable 开启时生效） ==========
/** 选择模式：single 单选 / multiple 多选 */
const globalSelectionMode = ref<'single' | 'multiple'>('multiple')
/** 是否支持行点击选择 */
const globalRowSelectable = ref(true)
/** 是否将选择列固定（横向滚动时不动） */
const globalSelectionFrozen = ref(true)
/** 选择列固定位置：left 左侧 / right 右侧 */
const globalSelectionAlignFrozen = ref<'left' | 'right'>('left')

// ========== 布局与样式（基础表格展示，api/infinite 也支持） ==========
/** 布局尺寸：高度模式、宽度模式等 */
const layoutSizeConfig = ref<TableSizeConfig>({
  heightMode: 'fill',
  widthMode: 'auto',
})
/** 样式：边框、网格线、斑马纹、行悬停 */
const styleConfig = ref({
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
  data: unknown[]
  selectedRows: unknown[]
  paginationState?: PaginationState
  sortState?: SortState
}>({ data: [], selectedRows: [] })

/** 当前 Tab 对应的列配置 */
const currentColumns = computed<DataTableColumn<object>[]>(() => {
  switch (activeTab.value) {
    case 'api':
      return apiTableColumns as unknown as DataTableColumn<object>[]
    case 'infinite':
      return infiniteTableColumns as unknown as DataTableColumn<object>[]
    case 'advanced':
      return customColumns as unknown as DataTableColumn<object>[]
    default:
      return basicColumns as unknown as DataTableColumn<object>[]
  }
})

/** 当前 Tab 对应的数据（仅基础/高级模式有静态数据） */
const currentData = computed<object[]>(() => {
  if (activeTab.value === 'basic') return basicData
  if (activeTab.value === 'advanced') return customData
  return []
})

/** 当前 Tab 对应的 API 配置（仅 api/infinite 模式） */
const currentApi = computed(() => {
  if (activeTab.value === 'api') return apiTableConfig
  if (activeTab.value === 'infinite') return infiniteTableConfig
  return undefined
})

/** 是否为 API 模式（api 或 infinite） */
const useApiMode = computed(() => activeTab.value === 'api' || activeTab.value === 'infinite')

/** 是否启用分页：api 固定开启、infinite 固定关闭、基础/高级可调 */
const paginationEffective = computed(() => {
  if (activeTab.value === 'api') return true
  if (activeTab.value === 'infinite') return false
  return globalPagination.value
})

/** 是否展示分页开关（仅基础表格和高级功能可调） */
const showPaginationToggle = computed(
  () => activeTab.value === 'basic' || activeTab.value === 'advanced'
)

watch(activeTab, tab => {
  selectedRows.value = []
  tableState.value = { data: [], selectedRows: [] }
  if (tab === 'api') globalPagination.value = true
  if (tab === 'infinite') globalPagination.value = false
  if (tab === 'advanced') {
    showFooter.value = true
    footerMode.value = 'column-aligned'
  }
})

watch(selectedRows, () => setTimeout(syncTableState, 50), { deep: true })

onMounted(() => setTimeout(syncTableState, 500))

/** 同步表格状态到 tableState（用于右侧状态展示） */
function syncTableState() {
  if (tableRef.value) {
    tableState.value = {
      data: tableRef.value.data as unknown[],
      selectedRows: (tableRef.value.selectedRows ?? []) as unknown[],
      paginationState: tableRef.value.paginationState,
      sortState: tableRef.value.sortState,
    }
  }
}

/** 刷新表格（重新请求 API 或重新计算） */
function handleRefresh() {
  tableRef.value?.refresh()
  setTimeout(syncTableState, 300)
}
/** 导出 CSV */
function handleExportCsv() {
  tableRef.value?.exportData('csv')
}
/** 导出 JSON */
function handleExportJson() {
  tableRef.value?.exportData('json')
}
/** 清空全局搜索与筛选 */
function handleClearFilters() {
  tableRef.value?.clearFilters()
}
/** 清空列排序 */
function handleClearSort() {
  tableRef.value?.clearSort()
}
/** 全选当前页数据 */
function handleSelectAll() {
  tableRef.value?.selectAll()
  setTimeout(syncTableState, 100)
}
/** 清空选中行 */
function handleClearSelection() {
  tableRef.value?.clearSelection()
  setTimeout(syncTableState, 100)
}
</script>

<template>
  <div class="h-full flex flex-col min-h-0">
    <Tabs
      v-model:value="activeTabModel"
      class="flex-1 min-h-0 flex flex-col"
    >
      <div class="shrink-0 flex justify-between items-center border-b-default pr-md">
        <TabList class="border-0!">
          <Tab value="basic">基础表格</Tab>
          <Tab value="api">API 驱动</Tab>
          <Tab value="infinite">API 无限滚动</Tab>
          <Tab value="advanced">高级功能</Tab>
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
              <DataTable
                :key="activeTab"
                ref="tableRef"
                v-model:selected-rows="selectedRows"
                :columns="currentColumns"
                :data="!useApiMode ? currentData : undefined"
                :api="currentApi"
                :pagination="paginationEffective"
                :global-filter="globalFilter"
                :exportable="globalExportable"
                :selectable="globalSelectable"
                :selection-mode="globalSelectable ? globalSelectionMode : undefined"
                :row-selectable="globalRowSelectable"
                :selection-frozen="globalSelectionFrozen"
                :selection-align-frozen="globalSelectionAlignFrozen"
                :show-header="showHeader"
                :sortable="globalSortable"
                :filterable="globalFilterable"
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
                @column-widths-change="syncTableState"
                @page-change="syncTableState"
              >
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
              </DataTable>
            </CScrollbar>

            <!-- 右侧：全部控制 -->
            <div class="w-80 shrink-0 min-h-0 flex flex-col hidden xl:flex">
              <CScrollbar class="flex-1 min-h-0 layout-full">
                <!-- 头部功能 -->
                <div class="card bg-card component-border p-padding-md mb-md">
                  <h3 class="fs-lg font-medium mb-margin-sm border-b-default pb-2">
                    头部功能 (Header)
                  </h3>
                  <div class="flex flex-col gap-md">
                    <!-- 分页开关：是否启用客户端分页 -->
                    <div
                      v-if="showPaginationToggle"
                      class="flex items-center justify-between"
                    >
                      <label class="text-sm">分页 (Pagination)</label>
                      <ToggleSwitch v-model="globalPagination" />
                    </div>
                    <div
                      v-else-if="activeTab === 'api'"
                      class="flex items-center justify-between text-muted-foreground fs-sm"
                    >
                      <span>分页</span>
                      <span>已启用（API 模式）</span>
                    </div>
                    <div
                      v-else-if="activeTab === 'infinite'"
                      class="flex items-center justify-between text-muted-foreground fs-sm"
                    >
                      <span>分页</span>
                      <span>关闭（无限滚动）</span>
                    </div>
                    <!-- 全局搜索：表头搜索框 -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm">全局搜索 (GlobalFilter)</label>
                      <ToggleSwitch v-model="globalFilter" />
                    </div>
                    <!-- 导出：CSV/JSON 导出按钮 -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm">导出 (Exportable)</label>
                      <ToggleSwitch v-model="globalExportable" />
                    </div>
                    <!-- 行选择：单选/多选复选框 -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm">行选择 (Selectable)</label>
                      <ToggleSwitch v-model="globalSelectable" />
                    </div>
                    <template v-if="globalSelectable">
                      <div class="flex flex-col gap-sm pl-padding-md border-l-2 border-border">
                        <label class="text-sm font-medium">选择模式 (Selection Mode)</label>
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
                            :severity="globalSelectionMode === 'multiple' ? 'primary' : 'secondary'"
                            @click="globalSelectionMode = 'multiple'"
                          />
                        </div>
                        <!-- 是否支持点击行进行选择 -->
                        <div class="flex items-center justify-between">
                          <label class="text-sm text-muted-foreground"
                            >行点击选择 (RowSelectable)</label
                          >
                          <ToggleSwitch v-model="globalRowSelectable" />
                        </div>
                        <!-- 横向滚动时选择列是否固定 -->
                        <div class="flex items-center justify-between">
                          <label class="text-sm text-muted-foreground"
                            >选择列固定 (SelectionFrozen)</label
                          >
                          <ToggleSwitch v-model="globalSelectionFrozen" />
                        </div>
                        <div
                          v-if="globalSelectionFrozen"
                          class="flex flex-col gap-sm"
                        >
                          <label class="text-sm text-muted-foreground">固定位置（左/右）</label>
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
                    <!-- 列排序：表头点击排序 -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm">列排序 (Sortable)</label>
                      <ToggleSwitch v-model="globalSortable" />
                    </div>
                    <!-- 列筛选：列头筛选器 -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm">列筛选 (Filterable)</label>
                      <ToggleSwitch v-model="globalFilterable" />
                    </div>

                    <!-- 表尾：底部汇总区域 -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm">显示表尾 (ShowFooter)</label>
                      <ToggleSwitch v-model="showFooter" />
                    </div>
                    <div
                      v-if="showFooter"
                      class="flex flex-col gap-sm pl-padding-md border-l-2 border-border"
                    >
                      <label class="text-sm text-muted-foreground">表尾模式 (Footer Mode)</label>
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

                    <!-- 表头栏：搜索、导出等区域 -->
                    <div class="flex items-center justify-between">
                      <label class="text-sm">显示表头栏 (ShowHeader)</label>
                      <ToggleSwitch v-model="showHeader" />
                    </div>
                    <template v-if="showHeader">
                      <div
                        class="flex items-center justify-between pl-padding-md border-l-2 border-border my-sm"
                      >
                        <label class="text-sm text-muted-foreground"
                          >完全自定义 (Full Override)</label
                        >
                        <ToggleSwitch v-model="showCustomHeader" />
                      </div>
                      <div
                        v-if="!showCustomHeader"
                        class="flex items-center justify-between pl-padding-md border-l-2 border-border my-sm"
                      >
                        <label class="text-sm text-muted-foreground">右侧插槽 (Header Right)</label>
                        <ToggleSwitch v-model="showCustomHeaderRight" />
                      </div>
                    </template>
                  </div>
                </div>

                <!-- 布局与样式：高度/宽度模式、边框、网格线、列拖拽等 -->
                <div class="card bg-card component-border p-padding-md mb-md">
                  <h3 class="fs-lg font-medium mb-margin-sm border-b-default pb-2">
                    布局与样式 (Layout & Style)
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

                <!-- 操作：刷新、导出、清空筛选/排序、全选/清空选择 -->
                <div class="card bg-card component-border p-padding-md mb-md">
                  <h3 class="fs-lg font-medium mb-margin-sm border-b-default pb-2">
                    操作 (Actions)
                  </h3>
                  <TableActions
                    :selectable="globalSelectable"
                    :selection-mode="globalSelectionMode"
                    @refresh="handleRefresh"
                    @export-csv="handleExportCsv"
                    @export-json="handleExportJson"
                    @clear-filters="handleClearFilters"
                    @clear-sort="handleClearSort"
                    @select-all="handleSelectAll"
                    @clear-selection="handleClearSelection"
                  />
                </div>

                <!-- 表格状态：已选行数、布局、分页、排序、JSON 快照 -->
                <div class="card bg-card component-border p-padding-md">
                  <h3 class="fs-lg font-medium mb-margin-sm border-b-default pb-2">
                    表格状态 (State)
                  </h3>
                  <div class="flex flex-col gap-md fs-sm">
                    <div v-if="tableState.selectedRows?.length">
                      <span class="text-muted-foreground">已选行数: </span>
                      {{ tableState.selectedRows.length }}
                    </div>
                    <div class="flex flex-col gap-xs">
                      <span class="text-muted-foreground">布局: </span>
                      {{ layoutSizeConfig.heightMode }} / {{ layoutSizeConfig.widthMode }}
                    </div>
                    <div v-if="tableState.paginationState">
                      <span class="text-muted-foreground">分页: </span>
                      第 {{ tableState.paginationState.page }} 页 / 每页
                      {{ tableState.paginationState.rows }} 条 / 共
                      {{ tableState.paginationState.totalRecords ?? '-' }} 条
                    </div>
                    <div v-if="tableState.sortState?.sortField">
                      <span class="text-muted-foreground">排序: </span>
                      {{ tableState.sortState.sortField }}
                      {{
                        tableState.sortState.sortOrder === 1
                          ? '↑'
                          : tableState.sortState.sortOrder === -1
                            ? '↓'
                            : ''
                      }}
                    </div>
                  </div>
                  <pre class="fs-xs font-mono break-all whitespace-pre-wrap mt-margin-md">{{
                    JSON.stringify(
                      {
                        selectedCount: tableState.selectedRows?.length ?? 0,
                        paginationState: tableState.paginationState,
                        sortState: tableState.sortState,
                      },
                      null,
                      2
                    )
                  }}</pre>
                </div>
              </CScrollbar>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
