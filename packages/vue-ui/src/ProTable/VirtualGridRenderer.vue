<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { SizeMode } from '@ccd/design-tokens'
import { objectGet } from '@ccd/shared-utils'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import Tag from 'primevue/tag'
import { computed, h, nextTick, ref, useTemplateRef } from 'vue'
import type { ComponentPublicInstance, VNode } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import type { TableController } from './engine/core/TableController'
import type { ProTableColumn } from './engine/types/column'
import type { SortState } from './engine/types/tableState'
import ProTableCell from './components/ProTableCell'
import { VIRTUAL_GRID_DEFAULTS } from './engine/config'
import { Icons } from '../Icons'

defineOptions({ name: 'VirtualGridRenderer' })

const props = withDefaults(
  defineProps<{
    controller: TableController<T>
    columns: ProTableColumn<T>[]
    data: T[]
    /** 与 ProTable 表格区密度一致，驱动虚拟行 padding / 字号 */
    density?: SizeMode
    stripedRows?: boolean
    showHorizontalLines?: boolean
    showVerticalLines?: boolean
    rowHover?: boolean
    rowClassName?: (row: T, index: number) => string
    selectable?: false | 'single' | 'checkbox'
  }>(),
  { density: 'comfortable', rowClassName: undefined, selectable: false }
)

const emit = defineEmits<{
  'sort-change': [sort: SortState]
}>()

const virtualHeaderShellClass = computed(() => {
  const d = props.density ?? 'comfortable'
  const map: Record<SizeMode, string> = {
    compact: 'px-sm min-w-0 bg-muted font-medium py-xs',
    comfortable: 'px-md min-w-0 bg-muted font-medium py-sm',
    loose: 'px-lg min-w-0 bg-muted font-medium py-md',
  }
  return map[d]
})

const virtualHeaderTitleClass = computed(() => {
  const d = props.density ?? 'comfortable'
  const map: Record<SizeMode, string> = {
    compact:
      'flex flex-row items-center gap-xs w-full text-xs! font-semibold text-muted-foreground uppercase tracking-wider',
    comfortable:
      'flex flex-row items-center gap-xs w-full text-xs! font-semibold text-muted-foreground uppercase tracking-wider',
    loose:
      'flex flex-row items-center gap-xs w-full text-sm! font-semibold text-muted-foreground uppercase tracking-wider',
  }
  return map[d]
})

const virtualBodyCellClass = computed(() => {
  const d = props.density ?? 'comfortable'
  const map: Record<SizeMode, string> = {
    compact: 'flex flex-row items-center text-xs text-ellipsis-1 px-sm py-xs',
    comfortable: 'flex flex-row items-center text-sm text-ellipsis-1 px-md py-sm',
    loose: 'flex flex-row items-center text-base text-ellipsis-1 px-lg py-md',
  }
  return map[d]
})

const virtualEstimateRowPx = computed(() => {
  const d = props.density ?? 'comfortable'
  const map: Record<SizeMode, number> = {
    compact: 40,
    comfortable: VIRTUAL_GRID_DEFAULTS.estimateRowHeightPx,
    loose: 56,
  }
  return map[d]
})

const scrollContainerRef = useTemplateRef<HTMLElement>('scrollContainerRef')
const centerHeaderScrollRef = useTemplateRef<HTMLElement>('centerHeaderScrollRef')
const centerBodyScrollRef = useTemplateRef<HTMLElement>('centerBodyScrollRef')
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

const leftPinnedColumns = computed<ProTableColumn<T>[]>(() =>
  props.columns.filter(col => col.pinned === 'left')
)
const rightPinnedColumns = computed<ProTableColumn<T>[]>(() =>
  props.columns.filter(col => col.pinned === 'right')
)
const centerColumns = computed<ProTableColumn<T>[]>(() =>
  props.columns.filter(col => col.pinned !== 'left' && col.pinned !== 'right')
)

type VirtualGridSection = 'left' | 'center' | 'right'

function buildFixedGridTrack(col: ProTableColumn<T>): string {
  if (col.width) return col.width
  if (col.minWidth) return col.minWidth
  if (col.maxWidth) return col.maxWidth
  return VIRTUAL_GRID_DEFAULTS.flexColumnMinBase
}

function buildGridTemplate(cols: ProTableColumn<T>[], section: VirtualGridSection): string {
  if (cols.length === 0) return ''

  if (section !== 'center') {
    return cols.map(col => buildFixedGridTrack(col)).join(' ')
  }

  const flexMinBase = VIRTUAL_GRID_DEFAULTS.flexColumnMinBase
  const explicitFlexIndices = cols
    .map((_, i) => i)
    .filter(i => cols[i].virtualFill === true && !cols[i].width)

  let flexIndex: number | null = null
  if (explicitFlexIndices.length > 0) {
    flexIndex = explicitFlexIndices[explicitFlexIndices.length - 1]
    const isDev = Boolean((import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV)
    if (isDev && explicitFlexIndices.length > 1) {
      console.warn(
        '[VirtualGridRenderer] Multiple center columns have virtualFill:true without width; only the last one uses minmax(..., 1fr).'
      )
    }
  } else if (VIRTUAL_GRID_DEFAULTS.virtualFillLastCenterColumn) {
    for (let i = cols.length - 1; i >= 0; i--) {
      if (!cols[i].width) {
        flexIndex = i
        break
      }
    }
  }

  return cols
    .map((col, i) => {
      if (flexIndex === i) {
        const base = col.minWidth ?? flexMinBase
        return `minmax(${base}, 1fr)`
      }
      return buildFixedGridTrack(col)
    })
    .join(' ')
}

const leftGridTemplateColumns = computed<string>(() =>
  buildGridTemplate(leftPinnedColumns.value, 'left')
)
const centerGridTemplateColumns = computed<string>(() =>
  buildGridTemplate(centerColumns.value, 'center')
)
const rightGridTemplateColumns = computed<string>(() =>
  buildGridTemplate(rightPinnedColumns.value, 'right')
)

function getColumnKey(col: ProTableColumn<T>): string {
  return String(col.field ?? col.id)
}

function renderHeader(col: ProTableColumn<T>): VNode | string {
  if (col.headerRender) return col.headerRender()
  if (typeof col.title === 'function') return col.title()
  return col.title ?? col.id
}

function handleSortClick(col: ProTableColumn<T>): void {
  if (!col.sortable) return
  props.controller.updateSort(String(col.field ?? col.id))
  emit('sort-change', { ...props.controller.state.sort })
}

function sortIcon(col: ProTableColumn<T>): string {
  const field = String(col.field ?? col.id)
  if (props.controller.state.sort.field !== field) return 'i-lucide-chevrons-up-down'
  if (props.controller.state.sort.direction === 'asc') return 'i-lucide-chevron-up'
  return 'i-lucide-chevron-down'
}

function getAriaSort(col: ProTableColumn<T>): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable) return undefined
  const field = String(col.field ?? col.id)
  if (props.controller.state.sort.field !== field) return 'none'
  if (props.controller.state.sort.direction === 'asc') return 'ascending'
  if (props.controller.state.sort.direction === 'desc') return 'descending'
  return 'none'
}

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
    return h(Tag, { value: enumItem.label, severity: enumItem.severity })
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

const measuredRowHeights = new Map<number, number>()

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: processedRows.value.length,
    getScrollElement: () => scrollContainerRef.value,
    estimateSize: () => virtualEstimateRowPx.value,
    overscan: VIRTUAL_GRID_DEFAULTS.overscan,
    // Use real DOM height to avoid visual drift caused by estimateSize vs actual `py-*` row padding.
    measureElement: element => element.getBoundingClientRect().height,
  }))
)

/**
 * TanStack updates internal scrollOffset from scroll events only. scrollToOffset() can no-op when DOM
 * is already at the target (no scroll event → stale offset → blank body). Double rAF waits for clamp;
 * synthetic scroll forces observeElementOffset to re-read element.scrollTop.
 */
/**
 * Guard against "blank viewport after resize" without causing recursive updates.
 * We only force a scroll-sync when virtualItems is unexpectedly empty.
 */
const _resizeSyncPending = ref(false)
useResizeObserver(scrollContainerRef, () => {
  if (_resizeSyncPending.value) return
  const scroller = scrollContainerRef.value
  if (!scroller) return

  _resizeSyncPending.value = true
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        _resizeSyncPending.value = false
        const el = scrollContainerRef.value
        if (!el) return
        const items = rowVirtualizer.value.getVirtualItems()
        if (processedRows.value.length > 0 && items.length === 0) {
          el.dispatchEvent(new Event('scroll', { bubbles: false }))
        }
      })
    })
  })
})

function setVirtualRowRef(node: Element | ComponentPublicInstance | null, index: number): void {
  // Vue v-for ref callback can receive ComponentPublicInstance; we only measure real DOM elements.
  if (!(node instanceof Element)) return

  // Write back the real height to the virtualizer so `start/end` stays aligned.
  const height = node.getBoundingClientRect().height
  if (measuredRowHeights.get(index) === height) return
  measuredRowHeights.set(index, height)
  rowVirtualizer.value.resizeItem(index, height)
}

// Sync horizontal scroll between center header and center body.
useEventListener(centerHeaderScrollRef, 'scroll', () => {
  const header = centerHeaderScrollRef.value
  const body = centerBodyScrollRef.value
  if (!header || !body) return
  if (Math.abs(body.scrollLeft - header.scrollLeft) < 1) return
  body.scrollLeft = header.scrollLeft
})

useEventListener(centerBodyScrollRef, 'scroll', () => {
  const header = centerHeaderScrollRef.value
  const body = centerBodyScrollRef.value
  if (!header || !body) return
  if (Math.abs(header.scrollLeft - body.scrollLeft) < 1) return
  header.scrollLeft = body.scrollLeft
})
</script>

<template>
  <div
    ref="scrollContainerRef"
    role="grid"
    class="c-scrollbar-native layout-full overflow-auto"
  >
    <div class="relative">
      <!-- Header: left / center (x-scroll) / right -->
      <div
        :class="[{ 'border-b border-border': showHorizontalLines }]"
        class="sticky top-0 z-layout"
      >
        <div class="row-start w-full">
          <!-- Left pinned header -->
          <div
            v-if="leftPinnedColumns.length"
            class="shrink-0 relative z-layout bg-muted border-r border-border shadow-sm"
            :style="{ display: 'grid', gridTemplateColumns: leftGridTemplateColumns }"
          >
            <div
              v-for="(col, colIndex) in leftPinnedColumns"
              :key="'lh-' + getColumnKey(col)"
              role="columnheader"
              :aria-sort="getAriaSort(col)"
              :class="[
                virtualHeaderShellClass,
                {
                  'pro-table-v-line': showVerticalLines && colIndex < leftPinnedColumns.length - 1,
                },
              ]"
            >
              <div
                :class="[
                  virtualHeaderTitleClass,
                  getHeaderAlignClass(col),
                  { 'cursor-pointer': col.sortable },
                ]"
                :tabindex="col.sortable ? 0 : -1"
                @click="handleSortClick(col)"
                @keydown.enter.prevent="handleSortClick(col)"
                @keydown.space.prevent="handleSortClick(col)"
              >
                <ProTableCell :node="renderHeader(col)" />
                <Icons
                  v-if="col.sortable"
                  :name="sortIcon(col)"
                  size="xs"
                  class="text-muted-foreground shrink-0"
                />
              </div>
            </div>
          </div>

          <!-- Center header -->
          <div
            ref="centerHeaderScrollRef"
            class="flex-1 min-w-0 overflow-x-auto scrollbar-none"
          >
            <div
              :style="{
                display: 'inline-grid',
                gridTemplateColumns: centerGridTemplateColumns,
                width: 'max-content',
                minWidth: '100%',
              }"
            >
              <div
                v-for="(col, colIndex) in centerColumns"
                :key="'ch-' + getColumnKey(col)"
                role="columnheader"
                :aria-sort="getAriaSort(col)"
                :class="[
                  virtualHeaderShellClass,
                  { 'pro-table-v-line': showVerticalLines && colIndex < centerColumns.length - 1 },
                ]"
              >
                <div
                  :class="[
                    virtualHeaderTitleClass,
                    getHeaderAlignClass(col),
                    { 'cursor-pointer': col.sortable },
                  ]"
                  :tabindex="col.sortable ? 0 : -1"
                  @click="handleSortClick(col)"
                  @keydown.enter.prevent="handleSortClick(col)"
                  @keydown.space.prevent="handleSortClick(col)"
                >
                  <ProTableCell :node="renderHeader(col)" />
                  <Icons
                    v-if="col.sortable"
                    :name="sortIcon(col)"
                    size="xs"
                    class="text-muted-foreground shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right pinned header -->
          <div
            v-if="rightPinnedColumns.length"
            class="shrink-0 relative z-layout bg-muted border-l border-border shadow-sm"
            :style="{ display: 'grid', gridTemplateColumns: rightGridTemplateColumns }"
          >
            <div
              v-for="(col, colIndex) in rightPinnedColumns"
              :key="'rh-' + getColumnKey(col)"
              role="columnheader"
              :aria-sort="getAriaSort(col)"
              :class="[
                virtualHeaderShellClass,
                {
                  'pro-table-v-line': showVerticalLines && colIndex < rightPinnedColumns.length - 1,
                },
              ]"
            >
              <div
                :class="[
                  virtualHeaderTitleClass,
                  getHeaderAlignClass(col),
                  { 'cursor-pointer': col.sortable },
                ]"
                :tabindex="col.sortable ? 0 : -1"
                @click="handleSortClick(col)"
                @keydown.enter.prevent="handleSortClick(col)"
                @keydown.space.prevent="handleSortClick(col)"
              >
                <ProTableCell :node="renderHeader(col)" />
                <Icons
                  v-if="col.sortable"
                  :name="sortIcon(col)"
                  size="xs"
                  class="text-muted-foreground shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Body: left / center (x-scroll) / right -->
      <div class="row-start w-full">
        <!-- Left pinned body -->
        <div
          v-if="leftPinnedColumns.length"
          class="shrink-0 relative z-content bg-card border-r border-border overflow-hidden shadow-sm"
          :style="{
            display: 'grid',
            gridTemplateColumns: leftGridTemplateColumns,
            width: 'max-content',
          }"
        >
          <div
            :style="{
              height: rowVirtualizer.getTotalSize() + 'px',
              position: 'relative',
              width: '100%',
            }"
          >
            <div
              v-for="virtualRow in rowVirtualizer.getVirtualItems()"
              :key="'lb-' + String(virtualRow.key)"
              class="pro-table-row absolute top-0 left-0 w-full transition-all duration-md ease-out"
              :style="{
                transform: 'translateY(' + virtualRow.start + 'px)',
                display: 'grid',
                gridTemplateColumns: leftGridTemplateColumns,
                height: virtualRow.size + 'px',
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
                v-for="(col, colIndex) in leftPinnedColumns"
                :key="'lbc-' + getColumnKey(col)"
                :class="[
                  virtualBodyCellClass,
                  getBodyJustifyClass(col),
                  {
                    'pro-table-v-line':
                      showVerticalLines && colIndex < leftPinnedColumns.length - 1,
                  },
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

        <!-- Center body -->
        <div
          ref="centerBodyScrollRef"
          class="flex-1 min-w-0 overflow-x-auto scrollbar-none"
        >
          <div
            :style="{
              height: rowVirtualizer.getTotalSize() + 'px',
              position: 'relative',
              width: 'max-content',
              minWidth: '100%',
            }"
            class="grid! grid-cols-1! gap-0!"
          >
            <div
              v-for="virtualRow in rowVirtualizer.getVirtualItems()"
              :key="'cb-' + String(virtualRow.key)"
              :ref="el => setVirtualRowRef(el, virtualRow.index)"
              class="pro-table-row absolute top-0 left-0 transition-all duration-md ease-out"
              :style="{
                transform: 'translateY(' + virtualRow.start + 'px)',
                display: 'grid',
                gridTemplateColumns: centerGridTemplateColumns,
                width: 'max-content',
                minWidth: '100%',
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
                v-for="(col, colIndex) in centerColumns"
                :key="'cbc-' + getColumnKey(col)"
                :class="[
                  virtualBodyCellClass,
                  getBodyJustifyClass(col),
                  { 'pro-table-v-line': showVerticalLines && colIndex < centerColumns.length - 1 },
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

        <!-- Right pinned body -->
        <div
          v-if="rightPinnedColumns.length"
          class="shrink-0 relative z-content bg-card border-l border-border overflow-hidden shadow-sm"
          :style="{
            display: 'grid',
            gridTemplateColumns: rightGridTemplateColumns,
            width: 'max-content',
          }"
        >
          <div
            :style="{
              height: rowVirtualizer.getTotalSize() + 'px',
              position: 'relative',
              width: '100%',
            }"
          >
            <div
              v-for="virtualRow in rowVirtualizer.getVirtualItems()"
              :key="'rb-' + String(virtualRow.key)"
              class="pro-table-row absolute top-0 left-0 w-full transition-all duration-md ease-out"
              :style="{
                transform: 'translateY(' + virtualRow.start + 'px)',
                display: 'grid',
                gridTemplateColumns: rightGridTemplateColumns,
                height: virtualRow.size + 'px',
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
                v-for="(col, colIndex) in rightPinnedColumns"
                :key="'rbc-' + getColumnKey(col)"
                :class="[
                  virtualBodyCellClass,
                  getBodyJustifyClass(col),
                  {
                    'pro-table-v-line':
                      showVerticalLines && colIndex < rightPinnedColumns.length - 1,
                  },
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

:global(html.dark .pro-table-row-striped),
:global(.dark .pro-table-row-striped) {
  background-color: color-mix(in srgb, rgb(var(--muted)) 12%, rgb(var(--card))) !important;
}

.pro-table-row-hoverable.pro-table-row-striped:not(.pro-table-row-selected):hover {
  background-color: color-mix(in srgb, rgb(var(--primary)) 16%, rgb(var(--card))) !important;
}

/* ── Selected rows ─────────────────────────────────────────────────────────── */
.pro-table-row-selected {
  background-color: color-mix(in srgb, rgb(var(--accent)) 16%, rgb(var(--card))) !important;
}

:global(html.dark .pro-table-row-selected),
:global(.dark .pro-table-row-selected) {
  background-color: color-mix(in srgb, rgb(var(--accent)) 100%, rgb(var(--card))) !important;
}

.pro-table-row-hoverable.pro-table-row-selected:hover {
  background-color: color-mix(in srgb, rgb(var(--accent)) 18%, rgb(var(--card))) !important;
}

:global(html.dark .pro-table-row-hoverable.pro-table-row-selected:hover),
:global(.dark .pro-table-row-hoverable.pro-table-row-selected:hover) {
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
