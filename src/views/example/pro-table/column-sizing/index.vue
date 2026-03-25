<script setup lang="ts">
import { columnSizingColumns, makeMockData } from './columns'
import type { ColumnSizingRow } from './columns'

defineOptions({ name: 'ExampleProTableColumnSizingPage' })

const mockData = ref<ColumnSizingRow[]>(makeMockData())

// ── Control state ──────────────────────────────────────────────────────────

const resizableColumns = ref<boolean>(true)
const columnResizeMode = ref<'fit' | 'expand'>('fit')
const tableLayout = ref<'auto' | 'fixed'>('auto')
const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)

const RESIZE_MODE_OPTIONS: { label: string; value: 'fit' | 'expand' }[] = [
  { label: 'fit', value: 'fit' },
  { label: 'expand', value: 'expand' },
]

const TABLE_LAYOUT_OPTIONS: { label: string; value: 'auto' | 'fixed' }[] = [
  { label: 'auto', value: 'auto' },
  { label: 'fixed', value: 'fixed' },
]

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
            name="i-lucide-move-horizontal"
            class="text-primary text-2xl"
          />
        </div>
        <div class="flex flex-col gap-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProTable — 列宽与尺寸</h1>
          <p class="text-muted-foreground text-sm m-0">
            演示 width / minWidth / maxWidth 约束、resizable 拖拽缩放以及 tableLayout auto / fixed
            切换。
          </p>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="flex-1 min-h-0 flex flex-col gap-sm">
      <!-- Control panel -->
      <div class="shrink-0 border-b-default">
        <div class="w-full py-sm">
          <div class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg">
            <div class="flex flex-row items-center gap-sm border-b-default pb-sm mb-padding-sm">
              <Icons
                name="i-lucide-settings-2"
                class="text-primary"
                size="sm"
              />
              <span class="text-sm font-semibold text-foreground tracking-wider uppercase">
                列宽控制台 / Column Sizing
              </span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-xl">
              <div class="bg-muted/5 rounded-md p-md col-stack-md">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                  拖拽缩放
                </p>
                <div class="row-between">
                  <label
                    for="ctrl-resize"
                    class="text-sm text-foreground cursor-pointer"
                  >
                    启用状态
                  </label>
                  <ToggleSwitch
                    v-model="resizableColumns"
                    input-id="ctrl-resize"
                    class="shrink-0"
                  />
                </div>
              </div>

              <div class="bg-muted/5 rounded-md p-md col-stack-md">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                  缩放模式
                </p>
                <div class="flex flex-row items-center gap-md">
                  <label class="text-sm text-foreground shrink-0 w-[var(--spacing-2xl)]">
                    Mode
                  </label>
                  <Select
                    v-model="columnResizeMode"
                    :options="RESIZE_MODE_OPTIONS"
                    option-label="label"
                    option-value="value"
                    class="flex-1 min-w-0"
                  />
                </div>
              </div>

              <div class="bg-muted/5 rounded-md p-md col-stack-md">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider m-0">
                  Table Layout
                </p>
                <div class="flex flex-row items-center gap-md">
                  <label class="text-sm text-foreground shrink-0 w-[var(--spacing-2xl)]">
                    Layout
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
      <section
        ref="tableContainerRef"
        class="col-fill"
      >
        <template v-if="tableContainerHeight && tableContainerHeight > 0">
          <div :style="{ height: tableContainerHeight + 'px' }">
            <ProTable
              :columns="columnSizingColumns"
              :data="mockData"
              row-key="id"
              :resizable-columns="resizableColumns"
              :column-resize-mode="columnResizeMode"
              :table-layout="tableLayout"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>
