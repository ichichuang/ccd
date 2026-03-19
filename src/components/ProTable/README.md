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

Core capabilities include:

Feature Supported

---

Row model ✓
Sorting ✓
Filtering ✓
Pagination ✓
Row selection ✓
Column visibility ✓
Column pinning ✓
Virtual scroll ✓
Column grouping ✓
Server mode ✓
Inline editing ✓
Tree table ✓

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
- hierarchical row structure
- row expansion
- virtualization compatibility

Core concepts:

    Row
    RowModel
    RowTree
    FlatRowList

## 2.2 Sorting Engine

Provides flexible column sorting.

Supported sorting modes:

- single column
- multi column
- server sorting
- custom comparator

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

- column filtering
- global search
- fuzzy search
- server filtering

Filter types:

    text
    number
    select
    date
    custom predicate

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

- single row selection
- multi selection
- checkbox selection
- range selection

Selection state:

    selectedRowIds
    selectedRows
    selectionMode

## 2.6 Column Visibility Engine

Controls column show / hide logic.

Features:

- dynamic column toggle
- column preference persistence
- responsive visibility rules

Example state:

    columnVisibility: Record<string, boolean>

## 2.7 Column Pinning Engine

Column pinning allows fixed columns.

Supported modes:

- left pinned columns
- right pinned columns
- dynamic pinning

Pin state:

    pinnedLeft: string[]
    pinnedRight: string[]

## 2.8 Virtual Scroll Engine

Virtual scrolling ensures performance for large datasets.

Capabilities:

- row virtualization
- column virtualization
- dynamic row height
- overscan rendering

Benefits:

- handles 100k+ rows
- minimal DOM usage
- smooth scrolling

---

# 3 Column Schema

The column schema defines table structure.

Example:

```ts
export interface ProTableColumn<T = any> {
  id: string

  title: string

  width?: number

  minWidth?: number

  sortable?: boolean

  filterable?: boolean

  resizable?: boolean

  pinned?: 'left' | 'right'

  renderer?: (row: T) => any

  headerRenderer?: () => any

  meta?: Record<string, any>
}
```

Column schema supports:

- custom renderer
- custom header
- cell formatter
- column grouping
- column metadata

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
export interface ProTableProps<T> {
  columns: ProTableColumn<T>[]

  data: T[]

  loading?: boolean

  pagination?: boolean

  virtualScroll?: boolean

  selectable?: boolean

  rowKey?: string

  heightMode?: 'fill' | 'auto' | 'fixed'

  height?: string
}
```

Example usage:

```vue
<ProTable :columns="columns" :data="data" virtual-scroll selectable />
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

# 6 Plugin System

Plugins allow extending ProTable functionality.

Plugin examples:

- export plugin
- column resize plugin
- row drag plugin
- clipboard plugin

Plugin lifecycle:

    registerPlugin()
    install()
    extendEngine()

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
10k virtualization
100k virtualization + worker

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

    class="flex items-center gap-2 text-sm text-muted"

---

# Conclusion

ProTable Architecture v1.0 provides a scalable foundation for building a
**world‑class enterprise table component** in Vue 3.

Key strengths:

- headless engine design
- strong TypeScript support
- high performance rendering
- extensible plugin ecosystem
- seamless design system integration

This architecture allows teams to build **customized ProTable
implementations tailored to complex enterprise applications**.
