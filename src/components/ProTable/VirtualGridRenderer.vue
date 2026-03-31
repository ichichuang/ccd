<script setup lang="ts" generic="T extends Record<string, unknown>">
import { h, resolveComponent } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { TableController } from './engine/core/TableController'
import type { ProTableColumn } from './engine/types/column'
import ProTableCell from './components/ProTableCell'
import { VIRTUAL_GRID_DEFAULTS } from './engine/config'
import { objectGet } from '@/utils/lodashes'

const props = defineProps<{
  controller: TableController<T>
  columns: ProTableColumn<T>[]
  data: T[]
  stripedRows?: boolean
  showHorizontalLines?: boolean
  showVerticalLines?: boolean
  rowHover?: boolean
  rowClassName?: (row: T, index: number) => string
  selectable?: false | 'single' | 'checkbox'
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
  if (!props.selectable) return
  const row = getRowByVirtualIndex(virtualIndex)
  if (!row) return
  props.controller.selectRow(row, props.selectable === 'checkbox' ? 'checkbox' : 'single')
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

const ResolvedTag = resolveComponent('Tag')

function renderCell(col: ProTableColumn<T>, row: T, index: number) {
  if (col.render) {
    return col.render({ row, index, column: col })
  }
  if (!col.field) return null

  const val = col.field.includes('.') ? objectGet(row, col.field) : row[col.field]

  if (col.valueEnum) {
    const key = val != null ? String(val) : ''
    const enumItem = col.valueEnum[key]
    if (!enumItem) return key
    if (typeof enumItem === 'string') return enumItem
    if (!enumItem.severity) return enumItem.label
    return h(ResolvedTag, { value: enumItem.label, severity: enumItem.severity })
  }

  return val != null ? String(val) : ''
}

function getHeaderAlignClass(col: ProTableColumn<T>): string {
  const headerAlign = col.headerAlign ?? col.align
  if (headerAlign === 'center') return 'justify-center text-center'
  if (headerAlign === 'right') return 'justify-end text-right'
  return 'justify-start text-left'
}

function getRowClassByVirtualIndex(index: number): string {
  if (!props.rowClassName) return ''
  const row = getRowByVirtualIndex(index)
  if (!row) return ''
  return props.rowClassName(row, index)
}

function getAlignClass(col: ProTableColumn<T>): string {
  if (col.align === 'center') return 'text-center'
  if (col.align === 'right') return 'text-right'
  return 'text-left'
}

function getBodyJustifyClass(col: ProTableColumn<T>): string {
  if (col.align === 'center') return 'justify-center'
  if (col.align === 'right') return 'justify-end'
  return 'justify-start'
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
    // Use real DOM height to avoid visual drift caused by estimateSize vs actual `py-*` row padding.
    measureElement: element => element.getBoundingClientRect().height,
  }))
)

function setVirtualRowRef(node: Element | ComponentPublicInstance | null, index: number): void {
  // Vue v-for ref callback can receive ComponentPublicInstance; we only measure real DOM elements.
  if (!(node instanceof Element)) return

  // Write back the real height to the virtualizer so `start/end` stays aligned.
  rowVirtualizer.value.resizeItem(index, node.getBoundingClientRect().height)
}
</script>

<template>
  <div
    ref="scrollContainerRef"
    class="c-scrollbar-native layout-full overflow-auto"
  >
    <div class="relative">
      <div
        :class="[
          'bg-muted font-medium py-sm px-md!',
          { 'border-b border-border': showHorizontalLines },
        ]"
        :style="{ display: 'grid', gridTemplateColumns, position: 'sticky', top: '0px', zIndex: 1 }"
      >
        <div
          v-for="(col, colIndex) in columns"
          :key="getColumnKey(col)"
          :class="[
            'text-xs! font-semibold text-muted-foreground py-xs! px-md! uppercase tracking-wider',
            getHeaderAlignClass(col),
            { 'pro-table-v-line': showVerticalLines && colIndex < columns.length - 1 },
          ]"
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
        class="grid! grid-cols-1! gap-0!"
      >
        <div
          v-for="virtualRow in rowVirtualizer.getVirtualItems()"
          :key="String(virtualRow.key)"
          :ref="el => setVirtualRowRef(el, virtualRow.index)"
          class="pro-table-row absolute top-0 left-0 w-full transition-all duration-md ease-out py-sm!"
          :style="{
            transform: 'translateY(' + virtualRow.start + 'px)',
            display: 'grid',
            gridTemplateColumns,
          }"
          :class="[
            {
              'pro-table-row-hoverable': rowHover,
              'pro-table-row-striped': stripedRows && isStripedVirtualRow(virtualRow.index),
              'pro-table-row-selected': isRowSelectedByVirtualIndex(virtualRow.index),
              'pro-table-row-h-line': showHorizontalLines,
            },
            getRowClassByVirtualIndex(virtualRow.index),
          ]"
          role="row"
          tabindex="0"
          :aria-selected="isRowSelectedByVirtualIndex(virtualRow.index)"
          @click="handleRowClick(virtualRow.index)"
          @keydown.enter.prevent="handleRowClick(virtualRow.index)"
        >
          <div
            v-for="(col, colIndex) in columns"
            :key="getColumnKey(col)"
            :class="[
              'flex flex-row items-center px-md! text-sm text-ellipsis-1',
              getBodyJustifyClass(col),
              { 'pro-table-v-line': showVerticalLines && colIndex < columns.length - 1 },
            ]"
          >
            <ProTableCell
              class="w-full"
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
/* ── Hover (gated by .pro-table-row-hoverable) ─────────────────────────────── */
.pro-table-row-hoverable:hover {
  background-color: color-mix(in srgb, rgb(var(--primary)) 16%, rgb(var(--card)));
}

/* ── Striped rows ──────────────────────────────────────────────────────────── */
.pro-table-row-striped {
  background-color: color-mix(in srgb, rgb(var(--muted)) 60%, rgb(var(--card))) !important;
}

:global(html.dark) .pro-table-row-striped,
:global(.dark) .pro-table-row-striped {
  background-color: color-mix(in srgb, rgb(var(--muted)) 12%, rgb(var(--card))) !important;
}

.pro-table-row-hoverable.pro-table-row-striped:not(.pro-table-row-selected):hover {
  background-color: color-mix(in srgb, rgb(var(--primary)) 16%, rgb(var(--card))) !important;
}

/* ── Selected rows ─────────────────────────────────────────────────────────── */
.pro-table-row-selected {
  background-color: color-mix(in srgb, rgb(var(--accent)) 16%, rgb(var(--card))) !important;
}

:global(html.dark) .pro-table-row-selected,
:global(.dark) .pro-table-row-selected {
  background-color: color-mix(in srgb, rgb(var(--accent)) 100%, rgb(var(--card))) !important;
}

.pro-table-row-hoverable.pro-table-row-selected:hover {
  background-color: color-mix(in srgb, rgb(var(--accent)) 18%, rgb(var(--card))) !important;
}

:global(html.dark) .pro-table-row-hoverable.pro-table-row-selected:hover,
:global(.dark) .pro-table-row-hoverable.pro-table-row-selected:hover {
  background-color: color-mix(in srgb, rgb(var(--accent)) 100%, rgb(var(--card))) !important;
}

.pro-table-row-selected .text-muted-foreground {
  color: rgb(var(--primary));
}

/* ── Gridlines ─────────────────────────────────────────────────────────────── */
.pro-table-row-h-line {
  border-bottom: 1px solid rgb(var(--border));
}

.pro-table-v-line {
  border-right: 1px solid rgb(var(--border));
}
</style>
