<script setup lang="ts" generic="T extends Record<string, unknown>">
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { TableController } from './engine/core/TableController'
import type { ProTableColumn } from './engine/types/column'
import ProTableCell from './components/ProTableCell'
import { VIRTUAL_GRID_DEFAULTS } from './engine/config'

const props = defineProps<{
  controller: TableController<T>
  columns: ProTableColumn<T>[]
  data: T[]
}>()

const scrollContainerRef = ref<HTMLElement | null>(null)
const processedRows = computed<T[]>(() => props.controller.processedRows.value)

function getRowByVirtualIndex(index: number): T | undefined {
  return processedRows.value[index]
}

function isStripedVirtualRow(index: number): boolean {
  return index % 2 !== 0
}

function handleRowClick(virtualIndex: number): void {
  const row = getRowByVirtualIndex(virtualIndex)
  if (!row) return
  props.controller.selectRow(row, 'single')
}

function isRowSelectedByVirtualIndex(virtualIndex: number): boolean {
  const row = getRowByVirtualIndex(virtualIndex)
  if (!row) return false
  return props.controller.isRowSelected(row)
}

const gridTemplateColumns = computed<string>(() => {
  const parts = props.columns.map(col => {
    if (col.width) return col.width
    if (col.minWidth && col.maxWidth) return `minmax(${col.minWidth}, ${col.maxWidth})`
    if (col.minWidth) return `minmax(${col.minWidth}, 1fr)`
    return VIRTUAL_GRID_DEFAULTS.gridColumnFallback
  })
  return parts.join(' ')
})

function getColumnKey(col: ProTableColumn<T>): string {
  return String(col.field ?? col.id)
}

function getColumnTitle(col: ProTableColumn<T>): string {
  if (typeof col.title === 'string') return col.title
  return String(col.field ?? col.id)
}

function renderCell(col: ProTableColumn<T>, row: T, index: number) {
  if (col.render) {
    return col.render({ row, index, column: col })
  }
  if (!col.field) return null
  const val = row[col.field]
  return val !== null && val !== undefined ? String(val) : ''
}

function getAlignClass(col: ProTableColumn<T>): string {
  if (col.align === 'center') return 'text-center'
  if (col.align === 'right') return 'text-right'
  return 'text-left'
}

function getColumnClass(col: ProTableColumn<T>, row: T): string {
  if (!col.className) return ''
  return typeof col.className === 'function' ? col.className(row) : col.className
}

function getBodyCellNodeByIndex(col: ProTableColumn<T>, index: number) {
  const row = processedRows.value[index]
  if (!row) return ''
  return renderCell(col, row, index)
}

function getBodyColumnClassByIndex(col: ProTableColumn<T>, index: number): string {
  const row = processedRows.value[index]
  if (!row) return ''
  return getColumnClass(col, row)
}

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: processedRows.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => VIRTUAL_GRID_DEFAULTS.estimateRowHeightPx,
    overscan: VIRTUAL_GRID_DEFAULTS.overscan,
  }))
)
</script>

<template>
  <div
    ref="scrollContainerRef"
    class="c-scrollbar-native layout-full overflow-auto"
  >
    <div class="relative layout-full">
      <div
        class="border-b-default border-border/15 bg-muted/30 font-medium py-sm px-md!"
        :style="{ display: 'grid', gridTemplateColumns }"
      >
        <div
          v-for="col in columns"
          :key="getColumnKey(col)"
          class="text-xs! font-semibold text-muted-foreground py-xs! px-md! uppercase tracking-wider text-left"
        >
          {{ getColumnTitle(col) }}
        </div>
      </div>
      <div
        :style="{
          height: rowVirtualizer.getTotalSize() + 'px',
          position: 'relative',
          width: '100%',
        }"
      >
        <div
          v-for="virtualRow in rowVirtualizer.getVirtualItems()"
          :key="String(virtualRow.key)"
          class="pro-table-row absolute top-0 left-0 w-full surface-item behavior-hover-transition border-b-default border-border/15 py-sm!"
          :style="{
            transform: 'translateY(' + virtualRow.start + 'px)',
            display: 'grid',
            gridTemplateColumns,
          }"
          :class="{
            'pro-table-row-striped': isStripedVirtualRow(virtualRow.index),
            'pro-table-row-selected': isRowSelectedByVirtualIndex(virtualRow.index),
          }"
          role="row"
          tabindex="0"
          :aria-selected="isRowSelectedByVirtualIndex(virtualRow.index)"
          @click="handleRowClick(virtualRow.index)"
          @keydown.enter.prevent="handleRowClick(virtualRow.index)"
        >
          <div
            v-for="col in columns"
            :key="getColumnKey(col)"
            class="row-y-center px-md! text-sm text-single-line-ellipsis"
          >
            <ProTableCell
              :node="getBodyCellNodeByIndex(col, virtualRow.index)"
              :align-class="getAlignClass(col)"
              :extra-class="getBodyColumnClassByIndex(col, virtualRow.index)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pro-table-row:hover {
  background-color: color-mix(in srgb, rgb(var(--primary)) 16%, rgb(var(--card)));
}

.pro-table-row-striped {
  /* PrimeVue striped background */
  background-color: color-mix(in srgb, rgb(var(--muted)) 60%, rgb(var(--card))) !important;
}

:global(html.dark) .pro-table-row-striped,
:global(.dark) .pro-table-row-striped {
  background-color: color-mix(in srgb, rgb(var(--muted)) 12%, rgb(var(--card))) !important;
}

.pro-table-row-striped:not(.pro-table-row-selected):hover {
  /* 斑马纹行 hover 时必须覆盖 striped 背景（否则 hover 背景会被 !important 锁死） */
  background-color: color-mix(in srgb, rgb(var(--primary)) 16%, rgb(var(--card))) !important;
}

.pro-table-row-selected {
  /* PrimeVue selected row (p-highlight / data-p-selected) */
  background-color: color-mix(in srgb, rgb(var(--accent)) 16%, rgb(var(--card))) !important;
}

:global(html.dark) .pro-table-row-selected,
:global(.dark) .pro-table-row-selected {
  background-color: color-mix(in srgb, rgb(var(--accent)) 100%, rgb(var(--card))) !important;
}

.pro-table-row-selected:hover {
  /* Hover state FOR selected rows */
  background-color: color-mix(in srgb, rgb(var(--accent)) 18%, rgb(var(--card))) !important;
}

:global(html.dark) .pro-table-row-selected:hover,
:global(.dark) .pro-table-row-selected:hover {
  background-color: color-mix(in srgb, rgb(var(--accent)) 100%, rgb(var(--card))) !important;
}

/* Selected cells: mimic PrimeVue highlight text shift */
.pro-table-row-selected .text-muted-foreground {
  color: rgb(var(--primary));
}
</style>
