<script setup lang="tsx">
import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'
import { useProTable } from '@/components/ProTable'

defineOptions({ name: 'ExampleHookUseProTable' })

// ── Types ─────────────────────────────────────────────────────────
interface TaskRow extends Record<string, unknown> {
  id: number
  title: string
  assignee: string
  priority: 'high' | 'medium' | 'low'
  status: 'done' | 'active' | 'todo'
}

const PRIORITY_CLS: Record<string, string> = {
  high: 'text-danger font-medium',
  medium: 'text-warn font-medium',
  low: 'text-muted-foreground',
}

const STATUS_CLS: Record<string, { label: string; cls: string }> = {
  done: { label: '完成', cls: 'text-success font-medium' },
  active: { label: '进行中', cls: 'text-primary font-medium' },
  todo: { label: '待办', cls: 'text-muted-foreground' },
}

// ── Columns ───────────────────────────────────────────────────────
const columns: ProTableColumn<TaskRow>[] = [
  { id: 'id', title: 'ID', field: 'id', width: '60px', sortable: true, align: 'right' },
  { id: 'title', title: '任务名称', field: 'title', sortable: true },
  { id: 'assignee', title: '负责人', field: 'assignee', sortable: true },
  {
    id: 'priority',
    title: '优先级',
    field: 'priority',
    width: '100px',
    sortable: true,
    render: ({ row }: ColumnRenderParams<TaskRow>) => (
      <span class={PRIORITY_CLS[row.priority]}>{row.priority}</span>
    ),
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    width: '100px',
    render: ({ row }: ColumnRenderParams<TaskRow>) => {
      const cfg = STATUS_CLS[row.status] ?? STATUS_CLS.todo
      return <span class={cfg.cls}>{cfg.label}</span>
    },
  },
]

// ── Mock Data ─────────────────────────────────────────────────────
const NAMES = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆'] as const
const PRIORITIES: TaskRow['priority'][] = ['high', 'medium', 'low']
const STATUSES: TaskRow['status'][] = ['done', 'active', 'todo']

function makeTasks(): TaskRow[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `任务 #${i + 1} — ${['数据迁移', '接口联调', '权限重构', '性能优化', 'UI 走查', '文档补全'][i % 6]}`,
    assignee: NAMES[i % NAMES.length] as string,
    priority: PRIORITIES[i % PRIORITIES.length] as TaskRow['priority'],
    status: STATUSES[i % STATUSES.length] as TaskRow['status'],
  }))
}

const dataRef = ref<TaskRow[]>(makeTasks())

// ── useProTable Hook ──────────────────────────────────────────────
const {
  state,
  processedRows,
  visibleColumns,
  totalCount,
  toggleSort,
  setGlobalFilter,
  selectRow,
  clearSelection,
  isRowSelected,
  toggleColumnVisibility,
  isColumnVisible,
  setPage,
  setPageSize,
} = useProTable<TaskRow>({
  columns,
  data: dataRef.value,
  dataRef,
  rowKey: 'id',
  paginationEnabled: true,
  initialPageSize: 8,
})

// ── Local UI State ────────────────────────────────────────────────
const filterText = ref<string>('')

function onFilterInput(): void {
  setGlobalFilter(filterText.value)
}

function onRowClick(row: TaskRow): void {
  selectRow(row, 'checkbox')
}

const stateJson = computed<string>(() => {
  return JSON.stringify(
    {
      sort: state.sort,
      filter: { global: state.filter.global },
      pagination: state.pagination,
      selectedCount: state.selection.selectedRows.length,
      visibleColumnCount: visibleColumns.value.length,
    },
    null,
    2
  )
})
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col"
  >
    <!-- Hero Header -->
    <header class="shrink-0 border-border/15">
      <div class="layout-container py-sm row-center gap-md">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-code-xml"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stretch gap-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">useProTable Hook</h1>
          <p class="text-muted-foreground text-sm m-0">
            不使用 &lt;ProTable&gt; 组件，直接通过 Hook
            控制排序、过滤、分页与选中状态，自行渲染表格。
          </p>
        </div>
      </div>
    </header>
    <div class="shrink-0 px-md py-xs text-xs text-muted-foreground border-border/15">
      覆盖能力：useProTable · processedRows · visibleColumns · toggleSort · setGlobalFilter ·
      selectRow · toggleColumnVisibility · setPage · setPageSize。
    </div>

    <!-- Content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="layout-container py-md col-stretch gap-xl pb-xl">
        <!-- Controls -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-center gap-sm pb-sm mb-sm">
            <Icons
              name="i-lucide-sliders-horizontal"
              class="text-primary"
            />
            <span class="font-bold text-foreground uppercase tracking-tight">
              Hook API 控制面板
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <!-- Filter -->
            <div class="col-stretch gap-sm">
              <span class="text-xs text-muted-foreground font-bold uppercase">setGlobalFilter</span>
              <InputText
                v-model="filterText"
                placeholder="输入关键词过滤..."
                size="small"
                @input="onFilterInput"
              />
            </div>

            <!-- Pagination -->
            <div class="col-stretch gap-sm">
              <span class="text-xs text-muted-foreground font-bold uppercase">
                setPage / setPageSize
              </span>
              <div class="row-start gap-sm flex-wrap">
                <Button
                  v-for="p in Math.min(4, Math.ceil(totalCount / state.pagination.pageSize))"
                  :key="p"
                  :label="`Page ${p}`"
                  size="small"
                  :severity="state.pagination.page === p ? 'primary' : 'secondary'"
                  @click="setPage(p)"
                />
                <Select
                  :model-value="state.pagination.pageSize"
                  :options="[5, 8, 15]"
                  size="small"
                  class="w-20"
                  @update:model-value="(v: unknown) => setPageSize(Number(v))"
                />
              </div>
            </div>

            <!-- Column Visibility -->
            <div class="col-stretch gap-sm">
              <span class="text-xs text-muted-foreground font-bold uppercase">
                toggleColumnVisibility
              </span>
              <div class="row-start gap-sm flex-wrap">
                <Button
                  v-for="col in columns"
                  :key="col.id"
                  :label="typeof col.title === 'string' ? col.title : col.id"
                  size="small"
                  :severity="isColumnVisible(col.id) ? 'primary' : 'secondary'"
                  @click="toggleColumnVisibility(col.id)"
                />
              </div>
            </div>

            <!-- Selection -->
            <div class="col-stretch gap-sm">
              <span class="text-xs text-muted-foreground font-bold uppercase">clearSelection</span>
              <div class="row-start gap-sm items-center">
                <Button
                  label="清空选中"
                  size="small"
                  severity="secondary"
                  @click="clearSelection"
                />
                <Tag
                  :value="`已选 ${state.selection.selectedRows.length} 行`"
                  severity="info"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Custom Rendered Table -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-between gap-sm pb-sm mb-sm">
            <div class="row-center gap-sm">
              <Icons
                name="i-lucide-table"
                class="text-primary"
              />
              <span class="font-bold text-foreground uppercase tracking-tight">
                自渲染表格 ({{ processedRows.length }} / {{ totalCount }})
              </span>
            </div>
            <Tag
              :value="`Page ${state.pagination.page}`"
              severity="secondary"
            />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b-default border-border/40">
                  <th
                    v-for="col in visibleColumns"
                    :key="col.id"
                    class="px-md py-sm text-left text-xs text-muted-foreground font-bold uppercase cursor-pointer hover:text-foreground"
                    :class="{ 'text-right': col.align === 'right' }"
                    @click="col.sortable ? toggleSort(col.field ?? col.id) : undefined"
                  >
                    <div class="row-center gap-xs">
                      <span>{{ typeof col.title === 'string' ? col.title : col.id }}</span>
                      <Icons
                        v-if="col.sortable && state.sort.field === (col.field ?? col.id)"
                        :name="
                          state.sort.direction === 'asc'
                            ? 'i-lucide-arrow-up'
                            : 'i-lucide-arrow-down'
                        "
                        size="xs"
                        class="text-primary"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in processedRows"
                  :key="row.id"
                  class="border-b-default border-border/20 cursor-pointer hover:bg-foreground/5 transition-colors"
                  :class="{ 'bg-primary/5': isRowSelected(row) }"
                  @click="onRowClick(row)"
                >
                  <td
                    v-for="col in visibleColumns"
                    :key="col.id"
                    class="px-md py-sm"
                    :class="{ 'text-right': col.align === 'right' }"
                  >
                    <component
                      :is="
                        () =>
                          col.render
                            ? col.render({ row, column: col, index: 0 })
                            : String(row[col.field ?? col.id] ?? '')
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- State Inspector -->
        <section class="material-elevated col-stretch gap-md">
          <div class="row-center gap-sm mb-sm">
            <Icons
              name="i-lucide-braces"
              class="text-accent"
            />
            <span class="font-bold text-foreground uppercase tracking-tight text-sm">
              Hook State (JSON)
            </span>
          </div>
          <pre class="code-preview text-xs text-muted-foreground m-0">{{ stateJson }}</pre>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>
