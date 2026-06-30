# ProTable Architecture v1.0

A **world‑class enterprise data table architecture** designed for modern
Vue 3 + TypeScript applications.

This architecture is designed to integrate seamlessly with:

- **Vue 3 + Composition API**
- **TypeScript Full Type Safety**
- **PrimeVue UI**
- **UnoCSS Utility Styling**
- **Custom Design Token System**
- **Responsive Layout Engine**
- **Headless Table Logic**

The goal is to create a **fully extensible ProTable system** comparable
to the best features of:

- TanStack Table
- vxe-table
- AG Grid
- PrimeVue DataTable
- NaiveUI Table

---

# 1 Overview

## 1.1 Design Goals

The ProTable architecture is designed with the following principles:

- Headless engine design
- Fully typed TypeScript API
- High performance for large datasets
- Plugin driven extensibility
- Rendering flexibility
- Full keyboard accessibility
- Responsive multi‑device compatibility
- Seamless integration with design tokens

## 1.2 Feature Matrix

This table reflects what the component **ships today** and is the source of truth
for current support. Sections further down describe the broader target
architecture; where a capability is not yet implemented it is called out inline.

| Feature               | Status | Notes                                                                    |
| --------------------- | ------ | ------------------------------------------------------------------------ |
| Row model (flat)      | ✓      | Single flat row list; no tree/hierarchy.                                 |
| Sorting               | ✓      | Default single column, 3-state (asc → desc → unsorted); client + server. |
| Custom sort compare   | ✓      | Per-column client-side comparator via `sortCompare`.                     |
| Global search         | ✓      | Default substring; opt-in local fuzzy ranking via `globalSearchMode`.    |
| Per-column filtering  | ✓      | `text`, `select`, `number`, and date-only `date` filters.                |
| Pagination            | ✓      | Client + server; mutually exclusive with virtual/infinite scroll.        |
| Infinite scroll       | ✓      | Request-mode append; replaces pagination when enabled.                   |
| Row selection         | ✓      | `single` and `checkbox` (multiple); optional `maxSelection`.             |
| Column visibility     | ✓      | Toggle + reorder; persisted when `stateKey` is set.                      |
| Column pinning        | ✓      | Left / right via `pinned` (configured per column).                       |
| Virtual scroll        | ✓      | Row virtualization (TanStack) with measured row height.                  |
| CSV export            | ✓      | Current page or selected rows.                                           |
| Region fullscreen     | ✓      | Scoped pseudo-fullscreen with Escape to exit.                            |
| Server mode           | ✓      | `request` / `api` / `apiUrl` (+ `apiExecutor`) adapters.                 |
| Multi-column sorting  | ✓      | Opt-in via `sortMode="multiple"`; DataTable + VirtualGridRenderer paths. |
| Column grouping       | ✓      | Opt-in via `columnGroups`; DataTable + VirtualGridRenderer paths.        |
| Tree table            | ✗      | Not implemented.                                                         |
| Inline editing        | ◐      | DataTable cell + row editing; VirtualGridRenderer cell editing only.     |
| Range selection       | ✓      | Checkbox mode Shift-click; DataTable + VirtualGridRenderer paths.        |
| Column virtualization | ✗      | Only rows are virtualized.                                               |

## 1.3 Architecture Layers

The system is divided into layered responsibilities:

    UI Layer
    │
    ├── ProTable Component
    │
    ├── Rendering Layer
    │     ├── Cell Renderer
    │     ├── Header Renderer
    │     ├── Toolbar Renderer
    │
    ├── State Engine
    │     ├── Row Model
    │     ├── Sorting
    │     ├── Filtering
    │     ├── Pagination
    │     ├── Selection
    │     ├── Column Visibility
    │     ├── Column Pinning
    │
    └── Core Data Engine

---

# 2 Core Engine

## 2.1 Row Model Engine

Responsible for transforming raw dataset into renderable rows.

Responsibilities:

- row indexing
- virtualization compatibility

Core concepts:

    Row
    RowModel
    FlatRowList

> Hierarchical / tree row models and row expansion are part of the target
> architecture but are **not implemented** today — the row model is flat.

## 2.2 Sorting Engine

Provides column sorting.

Supported sorting modes:

- default single column, 3-state cycle (ascending → descending → unsorted)
- opt-in multi-column sorting via `sortMode="multiple"`
- server sorting (request/api modes)
- per-column client-side comparators via `sortCompare`

Single-column sorting remains the default and preserves the existing state shape:

```ts
sort: { field: 'name', direction: 'asc' }
```

Multi-column sorting is opt-in:

```vue
<ProTable :columns="columns" :data="rows" sort-mode="multiple" />
```

In multiple mode, each sortable column cycles independently through
ascending → descending → unsorted. Sort priority follows activation order. The
primary sort is mirrored to `sort.field` and `sort.direction` for compatibility,
and the ordered criteria are exposed through `sort.multi`:

```ts
sort: {
  field: 'owner',
  direction: 'asc',
  multi: [
    { field: 'owner', direction: 'asc' },
    { field: 'records', direction: 'desc' },
  ],
}
```

DataTable and VirtualGridRenderer both use the same controller state. For
accessibility, `aria-sort` is applied to the primary sorted column only; secondary
sorted columns expose their direction and priority through the sortable header
control label.

Per-column custom comparators are client-side only:

```ts
const statusOrder = ['guarded', 'request', 'preview', 'ready'] as const

const columns: ProTableColumn<Row>[] = [
  {
    id: 'status',
    field: 'status',
    title: 'Status',
    sortable: 'custom',
    sortCompare: (leftValue, rightValue, context) => {
      const leftRank = statusOrder.findIndex(item => item === leftValue)
      const rightRank = statusOrder.findIndex(item => item === rightValue)
      const safeLeftRank = leftRank < 0 ? statusOrder.length : leftRank
      const safeRightRank = rightRank < 0 ? statusOrder.length : rightRank
      return safeLeftRank - safeRightRank
    },
  },
]
```

`sortCompare(leftValue, rightValue, context)` receives the resolved column values
plus typed row context:

```ts
interface ProTableSortCompareContext<T extends Record<string, unknown>> {
  field: string
  column: ProTableColumn<T>
  leftRow: T
  rightRow: T
}
```

Comparator return values follow the standard `Array.prototype.sort` contract:
negative means the left row sorts first in ascending order, positive means the
right row sorts first, and `0` keeps the original row order as the stable
fallback. Descending order inverts the comparator result.

`sortable: 'custom'` documents that a column is intended to use a custom
comparator. For backward compatibility, a sortable column without `sortCompare`
still uses the default comparator. Columns with `sortable: true` may also provide
`sortCompare`; the comparator is selected by the sorted column, not by the
literal sortable flag value.

Sorting pipeline:

    Raw Data
       ↓
    Filter Engine
       ↓
    Sort Engine
       ↓
    Pagination Engine

## 2.3 Filtering Engine

Filtering system supports:

- global search
  - default: case-insensitive substring across searchable columns
  - opt-in: ranked fuzzy matching with `globalSearchMode: 'fuzzy'`
- per-column filtering
- server filtering (request/api modes)

Per-column filter types (UI + engine):

    text     — case-insensitive substring match
    select   — exact match against `filterOptions`
    number   — equality match
    date     — DatePicker input; date-only equality for Date, ISO string, and timestamp values

`globalSearchMode` affects client-side/global search ranking only. Server,
`request`, `api`, and `apiUrl` modes keep the existing `FilterState` payload:
`filter.global` remains the search string and `filter.columns` remains the
per-column value map.

Sort payload compatibility is preserved:

- default single-sort mode sends the existing `{ field, direction }` sort object;
- multi-sort mode keeps `sort.field` and `sort.direction` as the primary sort;
- multi-sort mode adds `sort.multi` for `request` / `load` consumers;
- `api` / `apiUrl` formatted query params keep `sortBy` and `order` as the
  primary sort and add `multiSort` as a JSON string only when multiple active
  criteria exist.
- `sortCompare` functions are never serialized into `request`, `api`, `apiUrl`,
  or `load` payloads. Remote sorting receives only field/direction metadata.

The built-in date filter UI emits `YYYY-MM-DD` strings. The local filtering
engine also normalizes `Date`, ISO string, and timestamp values for row data and
programmatic filters.

Custom filter predicates are **not implemented**.

## 2.4 Pagination Engine

Pagination modes:

- client pagination
- server pagination
- infinite scrolling

Pagination state:

    pageIndex
    pageSize
    total

## 2.5 Selection Engine

Selection supports:

- single row selection (`selectable="single"`)
- multi / checkbox selection (`selectable="checkbox"`)
- Shift-click range selection in checkbox mode
- optional `maxSelection` cap

Range selection uses the last plain checkbox / row selection as its anchor and
selects the inclusive range in the current processed row order after local
filtering, sorting, and pagination have been applied. It is supported by both
the PrimeVue DataTable path and the VirtualGridRenderer path.

Keyboard activation remains a plain row toggle. Pressing `Enter` on the active
virtual-grid row does not start a range selection.

When `maxSelection` is set, range selection keeps existing selected rows outside
the range and appends range rows in processed order until the remaining capacity
is full. Overflow range rows are ignored.

Selection state:

    selectedRowIds
    selectedRows
    selectionMode

## 2.6 Column Visibility Engine

Controls column show / hide logic.

Features:

- dynamic column toggle (column settings panel)
- column order + visibility persistence (when `stateKey` is set)

Example state:

    columnVisibility: Record<string, boolean>

## 2.7 Column Pinning Engine

Column pinning allows fixed columns.

Supported modes:

- left pinned columns (`pinned: 'left'`)
- right pinned columns (`pinned: 'right'`)

> Pinning is configured per column. Runtime ("dynamic") pin toggling is **not
> implemented**.

Pin state:

    pinnedLeft: string[]
    pinnedRight: string[]

## 2.8 Column Grouping

Column grouping is an opt-in header composition feature for both ProTable
render paths: PrimeVue DataTable and VirtualGridRenderer.

API shape:

```ts
export interface ProTableColumnGroup {
  id: string
  title: string | (() => VNode)
  columnIds: string[]
  headerAlign?: 'left' | 'center' | 'right'
}

export type ProTableColumnGroupRow = ProTableColumnGroup[]
```

Use `columnGroups` as an array of header rows. Each group references leaf column
ids; ProTable derives `colspan` from the current visible and ordered leaf
columns:

```ts
const columnGroups: ProTableColumnGroupRow[] = [
  [
    { id: 'identity', title: 'Identity', columnIds: ['name', 'team'] },
    { id: 'metrics', title: 'Metrics', columnIds: ['score', 'status'] },
  ],
]
```

```vue
<ProTable :columns="columns" :column-groups="columnGroups" :data="rows" />
```

Support status:

- DataTable path: supported. Group rows render above the leaf header row, while
  sortable and filterable controls remain on leaf header cells.
- VirtualGridRenderer path: supported. Group rows render above the existing leaf
  header row, center grouped headers synchronize with horizontal body scroll,
  and virtual data row `aria-rowindex` values are offset by the extra header
  rows.
- Column visibility/order: supported. Group spans are recalculated from
  `visibleColumns` after hidden columns and user ordering are applied.
- Column pinning: supported when group spans align with the current pinned
  sections. If a group becomes non-contiguous or crosses left / center / right
  sections, ProTable splits that group into separate visible header cells instead
  of spanning across frozen boundaries.

Footer groups and custom group-row styling beyond `headerAlign` are not
implemented.

## 2.9 Inline Cell and Row Editing

Inline editing is opt-in and column-scoped.

Support status:

- DataTable path: supported for cell editing and row editing.
- VirtualGridRenderer path: supported for cell editing only when
  `editMode="cell"` and the target column has `editable: true` plus a bound
  `field`.
- VirtualGridRenderer row editing: not implemented. When `editMode="row"` is
  used with `virtualScroll`, row editing is ignored, the runtime keeps
  rendering the virtual grid, and dev mode emits a warning.
- VirtualGridRenderer interaction: double-click an editable gridcell, or press
  Enter / F2 while the editable gridcell is active. Escape cancels. Enter or
  editor blur commits.
- Persistence: caller-owned. ProTable emits an event and does not mutate
  `props.data` internally.
- Request / server / `api` / `apiUrl` modes: compatible, but persistence still
  belongs to the application layer. Save the emitted change through your own
  adapter/API flow, then refresh or update caller-owned rows.

Table opt-in:

```vue
<ProTable
  :columns="columns"
  :data="rows"
  edit-mode="cell"
  @cell-edit-complete="handleCellEditComplete"
/>

<ProTable :columns="columns" :data="rows" edit-mode="row" @row-edit-save="handleRowEditSave" />
```

Column opt-in:

```ts
const columns: ProTableColumn<UserRow>[] = [
  { id: 'name', field: 'name', title: 'Name', editable: true, editorType: 'text' },
  { id: 'age', field: 'age', title: 'Age', editable: true, editorType: 'number' },
  {
    id: 'status',
    field: 'status',
    title: 'Status',
    editable: true,
    editorType: 'select',
    editorOptions: [
      { label: 'Ready', value: 'ready' },
      { label: 'Draft', value: 'draft' },
    ],
  },
  { id: 'dueAt', field: 'dueAt', title: 'Due', editable: true, editorType: 'date' },
]
```

Cell edit payload:

```ts
interface ProTableCellEditCompletePayload<T extends Record<string, unknown>> {
  row: T
  rowKey: string
  column: ProTableColumn<T>
  field: string
  oldValue: unknown
  newValue: unknown
  // PrimeVue-compatible event context. VirtualGridRenderer emits the same shape.
  primeEvent: ProTableCellEditCompletePrimeEvent<T>
}
```

Row edit save payload:

```ts
interface ProTableRowEditSavePayload<T extends Record<string, unknown>> {
  row: T
  rowKey: string
  oldRow: T
  newRow: T
  changedFields: Array<{
    field: string
    column: ProTableColumn<T>
    oldValue: unknown
    newValue: unknown
  }>
  primeEvent: ProTableRowEditSavePrimeEvent<T>
}
```

Caller-owned local persistence example:

```ts
function handleCellEditComplete(payload: ProTableCellEditCompletePayload<UserRow>) {
  rows.value = rows.value.map(row =>
    row.id === payload.rowKey ? { ...row, [payload.field]: payload.newValue } : row
  )
}

function handleRowEditSave(payload: ProTableRowEditSavePayload<UserRow>) {
  rows.value = rows.value.map(row =>
    row.id === payload.rowKey ? { ...row, ...payload.newRow } : row
  )
}
```

## 2.10 Virtual Scroll Engine

Virtual scrolling ensures performance for large datasets.

Capabilities:

- row virtualization (`@tanstack/vue-virtual`)
- measured (variable) row height
- overscan rendering

> Column virtualization is **not implemented** — only rows are virtualized.
> Grouped headers are supported in VirtualGridRenderer, but column
> virtualization is still not implemented; grouping spans visible row-virtualized
> columns only.

Benefits:

- handles large row counts with minimal DOM
- smooth scrolling

Accessibility contract:

- the virtual grid exposes `aria-rowcount` and `aria-colcount`
- the header row uses `aria-rowindex="1"`; rendered data rows use the virtual row index plus the header offset
- body cells expose `role="gridcell"` and 1-based `aria-colindex` across left-pinned, center, and right-pinned columns
- the grid has one tab stop and uses arrow keys, Home, End, and Enter for deterministic navigation / row activation
- loading state is surfaced with `aria-busy`

---

# 3 Column Schema

The column schema defines table structure.

Example:

```ts
import type { VNode } from 'vue'

export interface ProTableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  id: string
  title: string | (() => VNode)
  field?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  sortable?: boolean | 'custom'
  sortCompare?: (
    leftValue: unknown,
    rightValue: unknown,
    context: ProTableSortCompareContext<T>
  ) => number
  filterable?: boolean
  filterType?: 'text' | 'select' | 'date' | 'number'
  editable?: boolean
  editorType?: 'text' | 'number' | 'select' | 'date'
  editorOptions?: SelectOption[]
  pinned?: 'left' | 'right' | false
  hidden?: boolean
  headerAlign?: 'left' | 'center' | 'right'
  align?: 'left' | 'center' | 'right'
  render?: (params: ColumnRenderParams<T>) => VNode | string | number | null
  headerRender?: () => VNode | string
  meta?: Record<string, unknown>
}

export interface ProTableSortCompareContext<T extends Record<string, unknown>> {
  field: string
  column: ProTableColumn<T>
  leftRow: T
  rightRow: T
}

export interface ProTableColumnGroup {
  id: string
  title: string | (() => VNode)
  columnIds: string[]
  headerAlign?: 'left' | 'center' | 'right'
}

export type ProTableColumnGroupRow = ProTableColumnGroup[]
```

Column schema supports:

- custom renderer (`render`)
- custom header (`headerRender` / functional `title`)
- enum/tag formatting (`valueEnum`)
- DataTable-path cell/row editing and VirtualGridRenderer cell editing
  (`editable`, `editorType`, `editorOptions`)
- column metadata (`meta`)

---

# 4 State Machine

The ProTable engine follows a deterministic state machine.

    Initial State
         │
         ├── Filtering
         │
         ├── Sorting
         │
         ├── Pagination
         │
         └── Selection

State changes trigger recalculation pipelines.

State flow:

    User Interaction
         ↓
    State Update
         ↓
    Engine Recalculate
         ↓
    Render Update

---

# 5 Component API

Main component:

    <ProTable />

Example props:

```ts
export interface ProTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: ProTableColumn<T>[]
  columnGroups?: ProTableColumnGroupRow[]
  data?: T[]
  loading?: boolean
  pagination?: boolean | PaginationConfig
  total?: number
  serverMode?: boolean
  sortMode?: 'single' | 'multiple'
  globalFilter?: boolean
  globalSearchMode?: 'substring' | 'fuzzy'
  editMode?: 'cell' | 'row' | false
  virtualScroll?: boolean
  infiniteScroll?: boolean
  selectable?: false | 'single' | 'checkbox'
  rowKey?: string
  heightMode?: 'fill' | 'auto' | 'fixed'
  height?: string

  request?: RequestFn<T>
  api?: ProTableApiFn
  apiUrl?: string
  apiMethod?: 'GET' | 'POST'
  apiExecutor?: ProTableApiExecutor
  apiConfig?: ProTableApiConfig
  dataKey?: string
  totalKey?: string
  requestConfig?: { immediate?: boolean; accumulate?: boolean }
  searchParams?: Record<string, unknown>
  urlSync?: boolean | ProTableUrlSyncOptions
}
```

Example usage:

```vue
<ProTable :columns="columns" :data="data" virtual-scroll selectable />
```

Config-driven API mode must inject an executor so the component stays
decoupled from the HTTP implementation:

```vue
<script setup lang="ts">
import { get } from '@/utils/http/methods'
import type { ProTableApiExecutor } from '@ccd/vue-ui'

const apiExecutor: ProTableApiExecutor = ({ url, query, config }) =>
  get(url, { ...config, params: query })
</script>

<template>
  <ProTable
    api-url="/api/v1/users"
    data-key="list"
    total-key="total"
    :api-executor="apiExecutor"
    :columns="columns"
    server-mode
  />
</template>
```

---

# 5.1 Layout & Sizing

ProTable supports three height modes via the `heightMode` prop.

## heightMode: 'fill' (default)

Table expands to fill the parent container.

Requires the parent to have a constrained height (e.g. admin layout
canvas). Uses `col-fill` + `scroll-height="flex"` so the table body
scrolls within the available space.

```vue
<!-- default — no prop needed -->
<ProTable :columns="columns" :data="data" />
```

## heightMode: 'auto'

Table height grows naturally with row count.

No scrollable container is applied. Suitable for embedding inside cards,
dialogs, or pages with their own scrollbar.

```vue
<ProTable :columns="columns" :data="data" height-mode="auto" />
```

## heightMode: 'fixed'

Table body scrolls within a fixed pixel or viewport height.

Use the `height` prop to set the exact value. Falls back to `400px`
when `height` is omitted.

```vue
<ProTable :columns="columns" :data="data" height-mode="fixed" height="360px" />
```

| `heightMode`     | Wrapper class | `scrollable` | `scroll-height` | Typical scene          |
| ---------------- | ------------- | ------------ | --------------- | ---------------------- |
| `fill` (default) | `col-fill`    | ✓            | `flex`          | Full-page admin route  |
| `auto`           | `w-full`      | ✗            | —               | Embedded card / Dialog |
| `fixed`          | `w-full`      | ✓            | `height` prop   | Dashboard widget       |

---

# 6 Extensibility

> There is **no plugin-registration API** (`registerPlugin` / `install` /
> `extendEngine` are part of the target architecture only). ProTable is extended
> today through the points below.

Built-in capabilities:

- CSV export (current page / selected rows) via the toolbar
- column resize (PrimeVue `resizableColumns` / `columnResizeMode`)
- column reorder + visibility persistence (`stateKey`)

Per-instance extension points:

- `render` / `headerRender` column functions for arbitrary cell/header content
- `valueEnum` for label/severity tag mapping
- `#toolbar-extra` and `#empty` slots
- exposed methods (`reload`, `exportData`, `setPage`, `toggleColumnVisibility`,
  `getState`, `getSelection`, …) via template ref

---

# 7 Performance Architecture

Performance strategies:

- virtual scrolling
- memoized row model
- shallow reactive state
- batched updates

Large dataset optimization:

Rows Strategy

---

1k normal render
10k virtualization (virtual-scroll mode)
100k+ virtualization (virtual-scroll mode)

---

# 8 Directory Structure

Recommended directory structure:

    src/components/pro-table

    pro-table/
    ├── components
    │   ├── ProTable.vue
    │   ├── ProTableHeader.vue
    │   ├── ProTableBody.vue
    │   └── ProTableToolbar.vue
    │
    ├── engine
    │   ├── rowModel.ts
    │   ├── sorting.ts
    │   ├── filtering.ts
    │   ├── pagination.ts
    │   ├── selection.ts
    │   ├── columnVisibility.ts
    │   └── columnPinning.ts
    │
    ├── virtual
    │   └── virtualScrollEngine.ts
    │
    ├── types
    │   ├── column.ts
    │   ├── tableState.ts
    │   └── props.ts
    │
    └── composables
        └── useProTable.ts

---

# 9 PrimeVue Integration

ProTable integrates with PrimeVue components:

- Button
- Checkbox
- Dropdown
- InputText
- Menu
- Dialog

This allows rapid UI construction while keeping the core engine
headless.

---

# 10 UnoCSS Integration

Styling is handled through UnoCSS utility classes.

Benefits:

- minimal CSS
- fast styling
- design token support

Example:

    class="flex items-center gap-2 text-sm text-muted-foreground"

---

# Conclusion

ProTable Architecture v1.0 provides a scalable foundation for building a
**world‑class enterprise table component** in Vue 3.

Key strengths:

- headless engine design
- strong TypeScript support
- high performance rendering (row virtualization)
- per-instance extension points (render functions, slots, exposed methods)
- seamless design system integration

This architecture allows teams to build **customized ProTable
implementations tailored to complex enterprise applications**.
