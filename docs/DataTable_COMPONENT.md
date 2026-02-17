# DataTable 表格封装

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及交互式数据表格时必读。
>
> 项目基于 PrimeVue DataTable 的二次封装，支持列配置驱动、API 加载、分页/无限滚动、列持久化、筛选排序、导出等。当需要**交互式数据表格**时，优先使用 `DataTable`，避免从零写 `<table>` 或直接裸用 PrimeVue DataTable 拼装复杂逻辑。

## 1. 概述

- **组件**：`DataTable`（`src/components/DataTable`）
- **入口**：`import { DataTable } from '@/components/DataTable'`
- **能力**：列配置驱动、本地数据 / API 数据、服务端分页 / 客户端分页 / 无限滚动、全局搜索与列级筛选、单列/多列排序、行选择、CSV/JSON/XLSX 导出、列顺序/列宽/隐藏列持久化（需 `tableId`）、自定义 header/footer/expansion 插槽

## 2. 快速使用

```vue
<script setup lang="ts">
import { DataTable } from '@/components/DataTable'
import type { DataTableColumn } from '@/components/DataTable'

const columns: DataTableColumn<{ id: number; name: string }>[] = [
  { field: 'id', header: 'ID', width: 80 },
  { field: 'name', header: '名称' },
]
const data = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
]
</script>
<template>
  <DataTable
    :columns="columns"
    :data="data"
  />
</template>
```

API 分页示例：

```vue
<DataTable
  table-id="user-list"
  :columns="columns"
  :api="{ api: '/api/users', mode: 'pagination', type: 'get' }"
  pagination
/>
```

## 3. 与 PrimeVue 的分工

| 场景                      | 使用                                                                        |
| ------------------------- | --------------------------------------------------------------------------- |
| 简单静态表格、一次性展示  | PrimeVue `<DataTable>`                                                      |
| 需分页/排序/筛选/导出/API | **DataTable**                                                               |
| 完全自定义表格逻辑        | 使用 DataTable 的 composables（useTableData、useTableLayout 等）做 headless |

## 4. 核心能力

- **列配置**：`DataTableColumn` 支持 field、header、body、headerRenderer、customFooter、align、sortable、filterable、exportable、width/minWidth/maxWidth 等；列级筛选值由 `setColumnFilter` / `getColumnFilters()` 控制。
- **数据源**：`data` 本地数据，或 `api` 配置（executeTableApi 统一返回 `{ list, total?, hasNext? }`）。
- **分页**：`pagination=true` 且无 api 时为客户端分页；`api.mode === 'pagination'` 时为服务端分页；expose：`goToPage`、`setPageSize`、`paginationState`。
- **无限滚动**：`api.mode === 'infinite'`，触底加载；阈值见 `constants.INFINITE_SCROLL_THRESHOLD_PX`。
- **筛选/排序**：全局搜索（globalFilter）、列级筛选（setColumnFilter/clearColumnFilter）；单列/多列排序（setSort/setMultiSort）。
- **行选择**：selectable、selectionMode(single/multiple)、rowSelectable；expose：clearSelection、selectAll、selectRow、unselectRow。
- **导出**：exportable，支持 csv/json/xlsx；expose：exportData(format)。
- **列持久化**：提供 `tableId` 时，列顺序/列宽/隐藏列持久化到 dataTable store；expose：getTablePreferences、resetTablePreferences（当 tableId 存在时）。

## 5. Expose API 速查

通过 ref 调用：`tableRef.value.refresh()` 等。

| 方法/属性                                              | 说明                       |
| ------------------------------------------------------ | -------------------------- |
| refresh                                                | 重新加载数据并更新列宽     |
| data / selectedRows                                    | 当前数据 / 选中行          |
| paginationState                                        | 分页状态                   |
| sortState / filterState                                | 排序/筛选状态              |
| clearFilters / clearSort                               | 清空筛选/排序              |
| setSort / setMultiSort                                 | 设置单列/多列排序          |
| setColumnFilter / clearColumnFilter / getColumnFilters | 列级筛选                   |
| clearSelection / selectAll / selectRow / unselectRow   | 选择操作                   |
| goToPage / setPageSize / setGlobalFilter               | 分页与全局搜索             |
| exportData(format?)                                    | 导出 csv/xlsx/json         |
| getColumnWidths / updateColumnWidths                   | 列宽测量与刷新             |
| getTablePreferences / resetTablePreferences            | 列持久化读写（需 tableId） |

### 5.1 DataTableProps / 列配置核心字段

| 类别     | 字段 / 类型                              | 说明                                                             |
| -------- | ---------------------------------------- | ---------------------------------------------------------------- |
| **数据** | `columns`                                | 必填，列配置数组（DataTableColumn\<T\>[]）                       |
|          | `data`                                   | 本地数据源（与 api 二选一）                                      |
|          | `api`                                    | API 配置（DataTableApiConfig），mode: 'pagination' \| 'infinite' |
| **分页** | `pagination`                             | 是否显示分页器                                                   |
|          | `paginatorConfig`                        | 每页条数、可选条数等，默认见 constants                           |
| **选择** | `selectable` / `selectionMode`           | 是否可选、single \| multiple                                     |
|          | `rowSelectable`                          | 是否允许行点击选中                                               |
|          | `selectedRows` (v-model)                 | 选中行双绑                                                       |
| **表格** | `tableId`                                | 表格唯一标识，提供时启用列持久化（顺序/列宽/隐藏列）             |
|          | `globalFilter`                           | 是否显示全局搜索框                                               |
|          | `exportable`                             | 是否显示导出按钮                                                 |
|          | `footerMode`                             | 'custom' \| 'column-aligned'（列对齐 footer）                    |
| **列**   | `DataTableColumn.field`                  | 字段名                                                           |
|          | `header` / `body`                        | 表头文案、单元格渲染（可返回 VNode 或 string，TSX 时用 body）    |
|          | `headerRenderer` / `customFooter`        | 自定义表头、列 footer                                            |
|          | `sortable` / `filterable` / `exportable` | 列级开关                                                         |
|          | `width` / `minWidth` / `maxWidth`        | 列宽                                                             |

## 6. 更多示例

无限滚动 + API：

```vue
<DataTable
  table-id="feed"
  :columns="columns"
  :api="{ api: '/api/feed', mode: 'infinite', type: 'post', infinite: { pageSize: 20 } }"
  show-footer
/>
```

带选择与导出：

```vue
<DataTable
  ref="tableRef"
  table-id="order-list"
  :columns="columns"
  :data="list"
  selectable
  selection-mode="multiple"
  exportable
  pagination
  global-filter
  @update:selected-rows="onSelected"
/>
```

## 7. 注意事项

- **列 body 自定义**：列 `body` 可返回 VNode 或 string；需返回 VNode 时使用 TSX（`<script setup lang="tsx">` 或 .tsx 组件），禁止 `h()`，见 `.cursor/rules/24-tsx-rendering.mdc`。
- **tableId 与列持久化**：提供 `tableId` 后，列顺序、列宽、隐藏列会写入 dataTable store；expose 的 `getTablePreferences` / `resetTablePreferences` 仅在提供 tableId 时可用。
- **API 错误与刷新**：请求失败时组件将 `apiData` 置空并结束 loading；用户可通过 ref 调用 `refresh()` 重新加载；业务 API 仍应定义在 `src/api/<module>/`，executeTableApi 仅作组件内部执行器。
- **列宽与 footer 对齐**：`footerMode="column-aligned"` 时，footer 与表体列宽同步；列宽在 DOM 渲染后测量，若表格异步渲染可稍后调用 `updateColumnWidths()`。

## 8. 与项目规范

- **请求**：表格 API 由组件内部 `executeTableApi` 调用 `@/utils/http`，业务 API 仍定义在 `src/api/<module>/`；禁止在业务页面直接使用 executeTableApi 替代 src/api。
- **通知**：导出成功/失败使用 `window.$message`（见 `docs/TOAST_AND_MESSAGE.md`）。
- **样式**：UnoCSS 语义类 + 设计系统变量；图标使用 `Icons` 组件。
- **类型**：列配置与 Props 见 `@/components/DataTable` 导出的类型（DataTableColumn、DataTableProps、DataTableExpose、DataTableApiConfig 等）。
