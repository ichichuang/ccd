<script setup lang="ts">
import type { ProTableLoadParams, SortState, FilterState } from '@/components/ProTable'
import { apiEventsColumns, makeApiMockData } from './columns'
import type { ApiEventsRow } from './columns'

defineOptions({ name: 'ExampleProTableApiEventsPage' })

// ── Data (Server-mode state) ───────────────────────────────────────────────
const tableData = ref<ApiEventsRow[]>([])
const totalCount = ref<number>(0)
const isLoading = ref<boolean>(false)
const lastParams = ref<ProTableLoadParams | null>(null)

const selectedRows = ref<ApiEventsRow[]>([])
const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)

// ── Event log ──────────────────────────────────────────────────────────────
interface EventLogEntry {
  time: string
  event: string
  detail: string
}

const eventLog = ref<EventLogEntry[]>([])
const MAX_LOG_ENTRIES = 50
const { now, formatDate, isInitialized } = useDateUtils()
const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => {
    const { start, stop } = useTimeoutFn(
      () => {
        stop()
        resolve()
      },
      ms,
      { immediate: false }
    )
    start()
  })

interface ProTableApiRef {
  clearSelection?: () => void
  clearFilters?: () => void
  exportCSV?: () => void
}

function pushLog(event: string, detail: unknown): void {
  const current = now()
  const time = current && isInitialized.value ? formatDate(current, 'HH:mm:ss.SSS') : '--:--:--.---'
  eventLog.value.unshift({
    time,
    event,
    detail: typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2),
  })
  if (eventLog.value.length > MAX_LOG_ENTRIES) {
    eventLog.value.length = MAX_LOG_ENTRIES
  }
}

function clearLog(): void {
  eventLog.value = []
}

// ── Fake API (simulated server-side mode) ──────────────────────────────────
interface FakeApiResult {
  rows: ApiEventsRow[]
  total: number
}

function applyFilterAndSort(allRows: ApiEventsRow[], params: ProTableLoadParams): ApiEventsRow[] {
  let result = [...allRows]

  const globalKeyword = params.filter.global?.trim()
  if (globalKeyword) {
    const keyword = globalKeyword.toLowerCase()
    result = result.filter(row => {
      const name = String(row.name ?? '').toLowerCase()
      const desc = String(row.description ?? '').toLowerCase()
      return name.includes(keyword) || desc.includes(keyword)
    })
  }

  const sortField = params.sort.field
  const sortDir = params.sort.direction
  if (sortField && sortDir) {
    const factor = sortDir === 'asc' ? 1 : -1
    result.sort((a, b) => {
      const av = a[sortField as keyof ApiEventsRow]
      const bv = b[sortField as keyof ApiEventsRow]
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * factor
      }
      const as = String(av ?? '')
      const bs = String(bv ?? '')
      return as.localeCompare(bs, 'zh-CN') * factor
    })
  }

  return result
}

function fakeApiRequest(params: ProTableLoadParams): Promise<FakeApiResult> {
  return new Promise((resolve, reject) => {
    try {
      const allRows = makeApiMockData()
      const processed = applyFilterAndSort(allRows, params)
      const total = processed.length
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      const pageRows = processed.slice(start, end)

      const delay = 500 + Math.floor(Math.random() * 500)
      void waitFor(delay).then(() => {
        resolve({ rows: pageRows, total })
      })
    } catch (err) {
      reject(err)
    }
  })
}

async function loadData(params: ProTableLoadParams): Promise<void> {
  lastParams.value = params
  isLoading.value = true

  pushLog('request:start', params)

  const startTime = performance.now()

  try {
    const res = await fakeApiRequest(params)
    tableData.value = res.rows
    totalCount.value = res.total

    const duration = Math.round(performance.now() - startTime)

    pushLog('request:success', {
      total: res.total,
      page: params.page,
      pageSize: params.pageSize,
      durationMs: duration,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '模拟 API 请求失败'
    tableData.value = []
    totalCount.value = 0

    pushLog('request:error', {
      message,
      params,
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadData({
    page: 1,
    pageSize: 5,
    sort: { field: null, direction: null },
    filter: { global: '', columns: {} },
  })
})

// ── Toolbar Actions demo ───────────────────────────────────────────────────
const tableRef = ref<ProTableApiRef | null>(null)

function handleExportCSV(): void {
  tableRef.value?.exportCSV?.()
  pushLog('toolbar:export-csv', { message: '导出 CSV（通过 ref.exportCSV()）' })
}

// ── Event handlers ─────────────────────────────────────────────────────────
function onSelectionChange(rows: ApiEventsRow[]): void {
  selectedRows.value = rows
  pushLog('@selection-change', {
    count: rows.length,
    ids: rows.map(r => r.id),
  })
}

function onRowClick(row: ApiEventsRow): void {
  pushLog('@row-click', { id: row.id, name: row.name })
}

function onSort(state: SortState): void {
  pushLog('@sort-change', state)
}

function onFilter(state: FilterState): void {
  pushLog('@filter-change', state)
}

function onPageChange(page: number, pageSize: number): void {
  pushLog('@page-change', { page, pageSize })
}

function onRefresh(): void {
  pushLog('@refresh', { message: '用户点击了刷新按钮' })
  const params =
    lastParams.value ??
    ({
      page: 1,
      pageSize: 5,
      sort: { field: null, direction: null },
      filter: { global: '', columns: {} },
    } satisfies ProTableLoadParams)

  void loadData(params)
}

function onTableLoad(params: ProTableLoadParams): void {
  pushLog('@load', params)
  void loadData(params)
}

// ── Programmatic API demo ──────────────────────────────────────────────────
function handleClearSelection(): void {
  tableRef.value?.clearSelection?.()
  pushLog('api:clearSelection', { message: '通过 ref 清空选择' })
}

function handleClearFilters(): void {
  tableRef.value?.clearFilters?.()
  pushLog('api:clearFilters', { message: '通过 ref 清空过滤' })
}

onMounted(() => {
  tableContainerHeight.value = tableContainerRef.value?.clientHeight ?? 0
})
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-md md:px-lg flex flex-col gap-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-b-default">
      <div class="w-full py-sm flex flex-row items-center gap-md">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-code-xml"
            class="text-primary text-2xl"
          />
        </div>
        <div class="flex flex-col gap-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProTable — API 与事件</h1>
          <p class="text-muted-foreground text-sm m-0">
            捕获并展示表格全部内部事件；演示通过 Ref 调用程序化接口。
          </p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <section
      ref="tableContainerRef"
      class="col-fill"
    >
      <template v-if="tableContainerHeight && tableContainerHeight > 0">
        <div
          class="row-start items-start gap-lg layout-full min-h-0"
          :style="{ height: tableContainerHeight + 'px' }"
        >
          <!-- Main Table Area -->
          <div class="flex-1 min-w-0 h-full flex flex-col gap-sm">
            <div
              class="shrink-0 bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg"
            >
              <div class="row-between w-full pb-sm gap-sm flex-wrap">
                <div class="flex flex-row items-center gap-xs shrink-0">
                  <Icons
                    name="i-lucide-terminal"
                    size="xs"
                    class="text-muted-foreground"
                  />
                  <span
                    class="text-xs text-muted-foreground font-semibold uppercase tracking-wider"
                  >
                    接口演示
                  </span>
                </div>
                <div class="flex flex-row items-center gap-sm flex-wrap">
                  <Button
                    label="清空选择"
                    size="small"
                    severity="secondary"
                    @click="handleClearSelection"
                  />
                  <Button
                    label="清空过滤"
                    size="small"
                    severity="secondary"
                    @click="handleClearFilters"
                  />
                  <Button
                    label="导出 CSV"
                    size="small"
                    severity="secondary"
                    @click="handleExportCSV"
                  />
                </div>
              </div>
            </div>

            <div class="flex-1 min-h-0">
              <ProTable
                ref="tableRef"
                :columns="apiEventsColumns"
                :data="tableData"
                :total="totalCount"
                :loading="isLoading"
                :server-mode="true"
                row-key="id"
                selectable="checkbox"
                :pagination="{ pageSize: 5, pageSizeOptions: [5, 10, 20] }"
                @update:selected="onSelectionChange"
                @row-click="onRowClick"
                @sort-change="onSort"
                @filter-change="onFilter"
                @page-change="onPageChange"
                @refresh="onRefresh"
                @load="onTableLoad"
              />
            </div>
          </div>

          <!-- Right Event Log Panel -->
          <div class="layout-sidepanel shrink-0 h-full">
            <div
              class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg h-full"
            >
              <div class="row-between w-full pb-sm border-b-default">
                <div class="flex flex-row items-center gap-sm">
                  <Icons
                    name="i-lucide-scroll-text"
                    size="sm"
                    class="text-primary"
                  />
                  <span class="text-sm font-semibold text-foreground">
                    事件日志
                    <span class="text-muted-foreground text-xs font-normal">
                      ({{ eventLog.length }} 条)
                    </span>
                  </span>
                </div>
                <Button
                  label="清空日志"
                  size="small"
                  severity="danger"
                  text
                  @click="clearLog"
                />
              </div>
              <CScrollbar class="flex-1 min-h-0 bg-muted font-mono rounded-md p-sm">
                <div
                  v-if="eventLog.length === 0"
                  class="h-full col-center gap-xs py-xl text-center"
                >
                  <Icons
                    name="i-lucide-inbox"
                    size="xl"
                    class="text-secondary-foreground mb-padding-xs"
                  />
                  <div class="text-secondary-foreground text-sm">暂无 API 调用日志</div>
                  <div class="text-muted-foreground text-xs">
                    对表格进行筛选、排序、翻页或刷新操作后，这里会实时显示相关事件。
                  </div>
                </div>
                <template v-else>
                  <div
                    v-for="(entry, idx) in eventLog"
                    :key="idx"
                    class="flex flex-row items-center gap-md py-xs border-border/40 last:border-b-0 hover:bg-foreground/5"
                  >
                    <span
                      class="text-xs text-muted-foreground shrink-0 w-[var(--spacing-4xl)] text-right"
                    >
                      {{ entry.time }}
                    </span>
                    <span
                      class="text-xs text-primary font-bold shrink-0 min-w-[var(--spacing-5xl)]"
                    >
                      {{ entry.event }}
                    </span>
                    <pre
                      class="text-xs text-foreground/80 m-0 break-words whitespace-pre-wrap flex-1 min-w-0"
                      >{{ entry.detail }}</pre
                    >
                  </div>
                </template>
              </CScrollbar>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
