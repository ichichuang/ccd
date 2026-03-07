<!-- DataTable V2 - Schema 驱动，支持 api 函数与 rowActions -->
<script setup lang="tsx" generic="T extends object">
import DataTableV2Cell from './DataTableV2Cell'
import type {
  DataTableAction,
  DataTableApiParams,
  DataTableApiResult,
  DataTableColumn,
} from '@/types/data-table'
import { castColumn, castValue } from '@/utils/typeCasters'

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn<T>[]
    rowActions?: DataTableAction<T>[]
    api?: ((params: DataTableApiParams) => Promise<DataTableApiResult<T>>) | undefined
    pageSize?: number
  }>(),
  {
    pageSize: 10,
    rowActions: () => [],
    api: undefined,
  }
)

const loading = ref(false)
const tableData = ref<T[]>([])
const totalRecords = ref(0)
const currentPage = ref(1)
const pageSizeRef = ref(props.pageSize)

async function fetchData() {
  if (!props.api) return
  loading.value = true
  try {
    const result = await props.api({
      page: currentPage.value,
      pageSize: pageSizeRef.value,
    })
    tableData.value = result.data
    totalRecords.value = result.total
  } catch (e) {
    if (import.meta.env.DEV) console.error('[DataTableV2] Fetch error:', e)
    tableData.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

const dataToRender = computed<T[]>(() => {
  if (props.api) return tableData.value as T[]
  return []
})

const first = computed(() => (currentPage.value - 1) * pageSizeRef.value)

function handlePageChange(event: { page: number; rows: number }) {
  currentPage.value = event.page + 1
  pageSizeRef.value = event.rows
  void fetchData()
}

function getCellValue(row: object, field: string): unknown {
  return (row as Record<string, unknown>)[field]
}

// --- Template Type Helpers ---
// 强制转换为子组件期望的 object 边界，解决泛型逆变(Contravariance)报错
const getSafeRender = (col: DataTableColumn<T>) =>
  castValue<NonNullable<DataTableColumn<object>['render']>>(col.render)
const getSafeRow = (data: unknown) => data as object
const getSafeColumn = (col: unknown) => castColumn<DataTableColumn<object>>(col)
const getSafeField = (col: DataTableColumn<T>) => (col.field as string) || ''

function shouldShowAction(action: DataTableAction<T>, row: T): boolean {
  if (!action.vIf) return true
  return action.vIf(row)
}

onMounted(() => {
  if (props.api) void fetchData()
})

watch(
  () => props.api,
  () => {
    if (props.api) void fetchData()
  }
)

defineExpose({
  refresh: () => fetchData(),
  data: dataToRender,
  loading,
  currentPage,
  pageSize: pageSizeRef,
  totalRecords,
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <DataTable
      :value="dataToRender"
      :loading="loading"
      :rows="pageSizeRef"
      :first="first"
      :total-records="totalRecords"
      :lazy="true"
      scrollable
      scroll-height="flex"
      striped-rows
      row-hover
      class="flex-1 min-h-0"
    >
      <template #empty>
        <EmptyState
          v-if="!loading"
          icon="i-lucide-inbox"
          :title="$t('common.noData')"
        />
      </template>

      <Column
        v-for="col in columns"
        :key="String(col.field)"
        :field="String(col.field)"
        :header="col.header"
        :style="
          col.width
            ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
            : undefined
        "
      >
        <template #body="{ data }">
          <DataTableV2Cell
            v-if="col.render"
            :render="getSafeRender(col)"
            :row="getSafeRow(data)"
            :column="getSafeColumn(col)"
          />
          <template v-else>
            {{ getCellValue(getSafeRow(data), getSafeField(col)) }}
          </template>
        </template>
      </Column>

      <Column
        v-if="rowActions?.length"
        :header="$t('common.actions')"
        class="w-[8.75rem]"
        frozen
        align-frozen="right"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-xs">
            <template
              v-for="action in rowActions ?? []"
              :key="action.label"
            >
              <Button
                v-if="shouldShowAction(action, data)"
                :label="action.label"
                :icon="action.icon"
                :severity="action.severity ?? 'secondary'"
                size="small"
                text
                class="p-0! min-w-0!"
                @click="action.onClick(data)"
              />
            </template>
          </div>
        </template>
      </Column>
    </DataTable>

    <div
      v-if="!!api"
      class="border-t-default bg-card"
    >
      <Paginator
        :rows="pageSizeRef"
        :first="first"
        :total-records="totalRecords"
        :rows-per-page-options="[10, 20, 50]"
        @page="handlePageChange"
      />
    </div>
  </div>
</template>
