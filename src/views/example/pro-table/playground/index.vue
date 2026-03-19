<script setup lang="ts">
import type { HeightMode } from '@/components/ProTable/engine/types/props'
import { employeeColumns } from './columns'
import type { EmployeeRow } from './columns'

defineOptions({ name: 'ExampleProTablePlaygroundPage' })

// ── Mock data ──────────────────────────────────────────────────────────────
const DEPARTMENTS = ['工程', '设计', '产品', '运营'] as const
const STATUSES = ['active', 'inactive', 'pending'] as const

function makeMockData(): EmployeeRow[] {
  const names = [
    '张伟',
    '王芳',
    '李娜',
    '刘洋',
    '陈静',
    '杨帆',
    '赵磊',
    '黄梅',
    '周明',
    '吴丹',
    '徐刚',
    '孙悦',
    '马超',
    '朱琳',
    '胡浩',
    '林雪',
    '何欣',
    '郭峰',
    '高敏',
    '谢涛',
    '罗健',
    '梁晨',
    '宋杰',
    '唐颖',
    '许磊',
    '韩冰',
    '冯婷',
    '邓阳',
    '曹薇',
    '彭强',
    '蒋文',
    '苏航',
    '沈欢',
    '卢彬',
    '姜超',
  ]
  return names.map((name, i) => ({
    id: i + 1,
    name,
    department: DEPARTMENTS[i % DEPARTMENTS.length] as string,
    status: STATUSES[i % STATUSES.length] as 'active' | 'inactive' | 'pending',
    salary: 8000 + (i % 5) * 3000 + Math.floor((i * 17) % 2000),
    joinedAt: `202${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
  }))
}

const mockData = ref<EmployeeRow[]>(makeMockData())

// ── Control panel state ────────────────────────────────────────────────────
const stripedRows = ref<boolean>(false)
const showHorizontalLines = ref<boolean>(true)
const showVerticalLines = ref<boolean>(false)
const selectable = ref<false | 'single' | 'checkbox'>(false)
const showToolbar = ref<boolean>(true)
const globalFilter = ref<boolean>(true)
const isLoading = ref<boolean>(false)
const rowHover = ref<boolean>(true)
const heightMode = ref<HeightMode>('fill')
const selectionPinned = ref<'left' | 'right' | false>(false)
const tableLayout = ref<'auto' | 'fixed'>('auto')

const HEIGHT_MODE_OPTIONS: { label: string; value: HeightMode }[] = [
  { label: 'fill（撑满剩余空间）', value: 'fill' },
  { label: 'auto（随内容自适应）', value: 'auto' },
  { label: 'fixed（固定高度 50vh，响应式）', value: 'fixed' },
]

const TABLE_LAYOUT_OPTIONS: { label: string; value: 'auto' | 'fixed' }[] = [
  { label: 'auto', value: 'auto' },
  { label: 'fixed', value: 'fixed' },
]

const SELECTION_OPTIONS: { label: string; value: false | 'single' | 'checkbox' }[] = [
  { label: '无选择', value: false },
  { label: '单选', value: 'single' },
  { label: '多选 (Checkbox)', value: 'checkbox' },
]

const SELECTION_PINNED_OPTIONS: { label: string; value: 'left' | 'right' | false }[] = [
  { label: '不固定', value: false },
  { label: '固定在左', value: 'left' },
  { label: '固定在右', value: 'right' },
]

// ── Row class demo (not toggleable — constant demonstration) ───────────────
function rowClassName(row: EmployeeRow): string {
  return row.status === 'inactive' ? 'opacity-60' : ''
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="layout-full px-padding-md md:px-padding-lg col-stack-sm min-h-0"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-b-default">
      <div class="w-full py-padding-sm row-y-center gap-md">
        <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
          <Icons
            name="i-lucide-settings-2"
            class="text-primary fs-2xl"
          />
        </div>
        <div class="col-stack-xs">
          <h1 class="fs-2xl font-bold text-foreground m-0">ProTable — 全量能力展示</h1>
          <p class="text-muted fs-sm m-0">
            斑马纹 · 网格线 · 行选择 · 工具栏 · 高度模式 · 固定列 · 自定义行样式
          </p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 min-h-0 col-stack-sm">
      <!-- Control Panel -->
      <div class="shrink-0 border-b-default">
        <div class="w-full py-padding-sm">
          <div class="panel-base">
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-settings-2"
                class="text-primary"
                size="sm"
              />
              <span class="fs-sm font-semibold text-foreground tracking-wider uppercase">
                能力控制台 / Playground Controls
              </span>
            </div>

            <!-- 3-column grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-xl">
              <!-- Group: 外观 -->
              <div class="bg-muted/5 rounded-scale-md p-padding-md col-stack-md">
                <div class="row-y-center gap-xs mb-padding-xs">
                  <Icons
                    name="i-lucide-palette"
                    size="xs"
                    class="text-muted-foreground shrink-0"
                  />
                  <p class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                    外观
                  </p>
                </div>
                <div class="row-between">
                  <label
                    for="ctrl-striped"
                    class="fs-sm text-foreground cursor-pointer"
                  >
                    斑马纹
                  </label>
                  <ToggleSwitch
                    v-model="stripedRows"
                    input-id="ctrl-striped"
                    class="shrink-0"
                  />
                </div>
                <div class="row-between">
                  <label
                    for="ctrl-hlines"
                    class="fs-sm text-foreground cursor-pointer"
                  >
                    横向分割线
                  </label>
                  <ToggleSwitch
                    v-model="showHorizontalLines"
                    input-id="ctrl-hlines"
                    class="shrink-0"
                  />
                </div>
                <div class="row-between">
                  <label
                    for="ctrl-vlines"
                    class="fs-sm text-foreground cursor-pointer"
                  >
                    纵向分割线
                  </label>
                  <ToggleSwitch
                    v-model="showVerticalLines"
                    input-id="ctrl-vlines"
                    class="shrink-0"
                  />
                </div>
              </div>

              <!-- Group: 交互 -->
              <div class="bg-muted/5 rounded-scale-md p-padding-md col-stack-md">
                <div class="row-y-center gap-xs mb-padding-xs">
                  <Icons
                    name="i-lucide-mouse-pointer"
                    size="xs"
                    class="text-muted-foreground shrink-0"
                  />
                  <p class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                    交互
                  </p>
                </div>
                <div class="row-y-center gap-md">
                  <label class="fs-sm text-foreground shrink-0 w-[var(--spacing-3xl)]">
                    选择模式
                  </label>
                  <Select
                    v-model="selectable"
                    :options="SELECTION_OPTIONS"
                    option-label="label"
                    option-value="value"
                    class="flex-1 min-w-0"
                  />
                </div>
                <div class="row-y-center gap-md">
                  <label class="fs-sm text-foreground shrink-0 w-[var(--spacing-3xl)]">
                    固定选择列
                  </label>
                  <Select
                    v-model="selectionPinned"
                    :options="SELECTION_PINNED_OPTIONS"
                    option-label="label"
                    option-value="value"
                    class="flex-1 min-w-0"
                  />
                </div>
                <div class="row-between mt-padding-xs">
                  <label
                    for="ctrl-toolbar"
                    class="fs-sm text-foreground cursor-pointer"
                  >
                    工具栏
                  </label>
                  <ToggleSwitch
                    v-model="showToolbar"
                    input-id="ctrl-toolbar"
                    class="shrink-0"
                  />
                </div>
                <div class="row-between">
                  <label
                    for="ctrl-filter"
                    class="fs-sm text-foreground cursor-pointer"
                  >
                    全局搜索
                  </label>
                  <ToggleSwitch
                    v-model="globalFilter"
                    input-id="ctrl-filter"
                    class="shrink-0"
                  />
                </div>
                <div class="row-between">
                  <label
                    for="ctrl-loading"
                    class="fs-sm text-foreground cursor-pointer"
                  >
                    加载中（模拟）
                  </label>
                  <ToggleSwitch
                    v-model="isLoading"
                    input-id="ctrl-loading"
                    class="shrink-0"
                  />
                </div>
                <div class="row-between">
                  <label class="fs-sm text-foreground shrink-0">悬停高亮</label>
                  <ToggleSwitch
                    v-model="rowHover"
                    class="shrink-0"
                  />
                </div>
              </div>

              <!-- Group: 布局 -->
              <div class="bg-muted/5 rounded-scale-md p-padding-md col-stack-md">
                <div class="row-y-center gap-xs mb-padding-xs">
                  <Icons
                    name="i-lucide-layout"
                    size="xs"
                    class="text-muted-foreground shrink-0"
                  />
                  <p class="fs-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                    布局
                  </p>
                </div>
                <div class="row-y-center gap-md">
                  <label class="fs-sm text-foreground shrink-0 w-[var(--spacing-3xl)]">
                    高度模式
                  </label>
                  <Select
                    v-model="heightMode"
                    :options="HEIGHT_MODE_OPTIONS"
                    option-label="label"
                    option-value="value"
                    class="flex-1 min-w-0"
                  />
                </div>
                <div class="row-y-center gap-md">
                  <label class="fs-sm text-foreground shrink-0 w-[var(--spacing-3xl)]">
                    表格分布
                  </label>
                  <Select
                    v-model="tableLayout"
                    :options="TABLE_LAYOUT_OPTIONS"
                    option-label="label"
                    option-value="value"
                    class="flex-1 min-w-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ProTable -->
      <div class="flex-1 min-h-0">
        <ProTable
          :columns="employeeColumns"
          :data="mockData"
          :loading="isLoading"
          title="员工列表"
          row-key="id"
          :striped-rows="stripedRows"
          :show-horizontal-lines="showHorizontalLines"
          :show-vertical-lines="showVerticalLines"
          :selectable="selectable"
          :selection-pinned="selectionPinned"
          :show-toolbar="showToolbar"
          :global-filter="globalFilter"
          :row-hover="rowHover"
          :height-mode="heightMode"
          :height="'var(--spacing-5xl)'"
          :table-layout="tableLayout"
          :row-class-name="rowClassName"
          :pagination="{ pageSize: 10, pageSizeOptions: [10, 20, 50] }"
        />
      </div>
    </div>
  </div>
</template>
