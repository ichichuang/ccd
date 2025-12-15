<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { useVxeTable } from '@/hooks'
import { useDialog } from '@/hooks/components/useDialog'
import { ref } from 'vue'

const { openDialog, info, success, error } = useDialog()

// ==================== 数据类型定义 ====================
interface UserData {
  id: number
  name: string
  email: string
  age: number
  status: 'active' | 'inactive' | 'pending'
  role: string
  createdAt: string
  avatar?: string
}

// ==================== 示例数据 ====================
const generateMockData = (count: number): UserData[] => {
  const roles = ['管理员', '编辑', '查看者', '访客']
  const statuses: UserData['status'][] = ['active', 'inactive', 'pending']
  const data: UserData[] = []

  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      name: `用户 ${i}`,
      email: `user${i}@example.com`,
      age: 20 + Math.floor(Math.random() * 40),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    })
  }

  return data
}

// 初始数据
const tableData = ref<UserData[]>(generateMockData(50))
const loading = ref<boolean>(false)
const rowStyleHighlight = (row: UserData) => {
  if (row.status === 'inactive') {
    return { background: 'rgba(255, 99, 132, 0.08)' }
  }
  if (row.status === 'active') {
    return { background: 'rgba(99, 132, 99, 0.08)' }
  }
  return {}
}

const rowClassHighlight = (row: UserData) => {
  return row.role === '管理员' ? 'color-primary100' : ''
}

// ==================== 对齐示例列配置 ====================
const alignedColumns: VxeTableColumn<UserData>[] = [
  {
    field: 'id',
    header: 'ID（居中）',
    width: 80,
    sortable: true,
    align: 'center',
  },
  {
    field: 'name',
    header: '姓名（居左）',
    width: 150,
    sortable: true,
    align: 'left',
  },
  {
    field: 'email',
    header: '邮箱（居左）',
    width: 220,
    sortable: false,
    align: 'left',
  },
  {
    field: 'role',
    header: '角色（居中）',
    width: 120,
    sortable: true,
    align: 'center',
  },
  {
    field: 'status',
    header: '状态（居右）',
    width: 120,
    sortable: true,
    align: 'right',
    body: (rowData: UserData) => {
      const statusMap: Record<UserData['status'], { label: string; class: string }> = {
        active: { label: '活跃', class: 'text-green-500' },
        inactive: { label: '禁用', class: 'text-red-500' },
        pending: { label: '待审核', class: 'text-yellow-500' },
      }
      const status = statusMap[rowData.status]
      return <span class={status.class}>{status.label}</span>
    },
  },
]

// ==================== 列配置 ====================
const columns: VxeTableColumn<UserData>[] = [
  {
    field: 'id',
    header: 'ID',
    sortable: true,
  },
  {
    field: 'name',
    header: '姓名',
    width: 150,
    sortable: true,
  },
  {
    field: 'email',
    header: '邮箱',
    width: 200,
    sortable: false,
  },
  {
    field: 'age',
    header: '年龄',
    width: 100,
    sortable: true,
  },
  {
    field: 'role',
    header: '角色',
    width: 120,
    sortable: true,
  },
  {
    field: 'status',
    header: '状态',
    width: 120,
    sortable: true,
    body: (rowData: UserData, _column: VxeTableColumn<UserData>) => {
      const statusMap: Record<UserData['status'], { label: string; class: string }> = {
        active: { label: '活跃', class: 'text-green-500' },
        inactive: { label: '禁用', class: 'text-red-500' },
        pending: { label: '待审核', class: 'text-yellow-500' },
      }
      const status = statusMap[rowData.status]
      return <span class={status.class}>{status.label}</span>
    },
  },
  {
    field: 'createdAt',
    header: '创建时间',
    sortable: true,
  },
]

// ==================== 表格 Ref 管理 ====================
const tableRef = ref<any>(null)

// ==================== 使用 useVxeTable Hook ====================
const {
  selectedRows,
  paginationState,
  sortState,
  filterState,
  expandedRows,
  columnWidths,
  refresh,
  loadData,
  updateRow,
  deleteRow,
  addRow,
  updateRows,
  deleteRows,
  selectRow,
  unselectRow,
  selectAll,
  clearSelection,
  toggleRowSelection,
  getSelectedRowIds,
  isRowSelected,
  goToPage,
  setPageSize,
  getCurrentPage,
  getTotalPages,
  previousPage,
  nextPage,
  setSort,
  clearSort,
  getCurrentSort,
  setGlobalFilter,
  getCurrentFilters,
  exportData,
  getRowById,
  findRows,
  getRowIndex,
  getTotalRecords,
  isEmpty,
  isLoading,
  getColumnWidths,
  updateColumnWidths,
} = useVxeTable<UserData>({
  tableRef,
  idField: 'id',
})

// ==================== 表格操作函数 ====================

// 刷新数据
const handleRefresh = async () => {
  loading.value = true
  try {
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 1000))
    tableData.value = generateMockData(50)
    await refresh()
    success('数据刷新成功')
  } catch (_err) {
    error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

// 加载新数据
const handleLoadData = () => {
  const newData = generateMockData(30)
  loadData(newData)
  tableData.value = newData
  success('数据加载成功')
}

// 更新行
const handleUpdateRow = () => {
  const firstRow = tableData.value[0]
  if (firstRow) {
    const updated = updateRow(firstRow, {
      name: `更新后的 ${firstRow.name}`,
      age: firstRow.age + 1,
    })
    if (updated) {
      // 同步更新 tableData
      const index = tableData.value.findIndex(r => r.id === firstRow.id)
      if (index >= 0) {
        tableData.value[index] = {
          ...tableData.value[index],
          name: `更新后的 ${firstRow.name}`,
          age: firstRow.age + 1,
        }
      }
      success('行更新成功')
    } else {
      error('行更新失败')
    }
  }
}

// 删除行
const handleDeleteRow = () => {
  const firstRow = tableData.value[0]
  if (firstRow) {
    const deleted = deleteRow(firstRow)
    if (deleted) {
      // 同步更新 tableData
      tableData.value = tableData.value.filter(r => r.id !== firstRow.id)
      success('行删除成功')
    } else {
      error('行删除失败')
    }
  }
}

// 添加行
const handleAddRow = () => {
  const newRow: UserData = {
    id: Date.now(),
    name: `新用户 ${Date.now()}`,
    email: `newuser${Date.now()}@example.com`,
    age: 25,
    status: 'pending',
    role: '访客',
    createdAt: new Date().toLocaleDateString(),
  }
  const added = addRow(newRow, 'first')
  if (added) {
    // 同步更新 tableData
    tableData.value.unshift(newRow)
    success('行添加成功')
  } else {
    error('行添加失败')
  }
}

// 选择行
const handleSelectRow = () => {
  const firstRow = tableData.value[0]
  if (firstRow) {
    const selected = selectRow(firstRow)
    if (selected) {
      success(`已选择: ${firstRow.name}`)
    } else {
      info('该行已被选择')
    }
  }
}

// 清除选择
const handleClearSelection = () => {
  clearSelection()
  success('已清除所有选择')
}

// 获取选中行ID
const handleGetSelectedRowIds = () => {
  const ids = getSelectedRowIds()
  if (ids.length > 0) {
    info(`选中的行ID: ${ids.join(', ')}`)
  } else {
    info('未选中任何行')
  }
}

// 取消选择行
const handleUnselectRow = () => {
  const firstRow = tableData.value[0]
  if (firstRow) {
    const unselected = unselectRow(firstRow)
    if (unselected) {
      success(`已取消选择: ${firstRow.name}`)
    } else {
      info('该行未被选择')
    }
  }
}

// 全选
const handleSelectAll = () => {
  selectAll()
  success('已全选所有行')
}

// 切换选择状态
const handleToggleRowSelection = () => {
  const firstRow = tableData.value[0]
  if (firstRow) {
    const isSelected = toggleRowSelection(firstRow)
    success(isSelected ? `已选择: ${firstRow.name}` : `已取消选择: ${firstRow.name}`)
  }
}

// 检查行是否被选中
const handleIsRowSelected = () => {
  const firstRow = tableData.value[0]
  if (firstRow) {
    const selected = isRowSelected(firstRow)
    info(selected ? '第一行已被选中' : '第一行未被选中')
  }
}

// 批量更新数据
const handleUpdateRows = () => {
  const updates = [
    { row: tableData.value[0], data: { name: `批量更新 ${Date.now()}` } },
    { row: tableData.value[1], data: { age: 99 } },
  ]
  const count = updateRows(updates)
  if (count > 0) {
    // 同步更新 tableData
    updates.forEach(({ row, data }) => {
      const index = tableData.value.findIndex(r => r.id === (row as UserData).id)
      if (index >= 0) {
        tableData.value[index] = { ...tableData.value[index], ...data }
      }
    })
    success(`批量更新了 ${count} 行`)
  } else {
    error('批量更新失败')
  }
}

// 批量删除数据
const handleDeleteRows = () => {
  const rowsToDelete = [tableData.value[0], tableData.value[1]].filter(Boolean)
  if (rowsToDelete.length > 0) {
    const count = deleteRows(rowsToDelete)
    if (count > 0) {
      // 同步更新 tableData
      const idsToDelete = rowsToDelete.map(r => r.id)
      tableData.value = tableData.value.filter(r => !idsToDelete.includes(r.id))
      success(`批量删除了 ${count} 行`)
    } else {
      error('批量删除失败')
    }
  }
}

// 分页操作
const handleGoToPage = () => {
  const currentPage = getCurrentPage()
  const totalPages = getTotalPages()
  const nextPage = currentPage < totalPages ? currentPage + 1 : 1
  goToPage(nextPage)
  success(`跳转到第 ${nextPage} 页`)
}

const handleSetPageSize = () => {
  setPageSize(20)
  success('每页显示数量已设置为 20')
}

// 上一页
const handlePreviousPage = () => {
  previousPage()
  success('已跳转到上一页')
}

// 下一页
const handleNextPage = () => {
  nextPage()
  success('已跳转到下一页')
}

// 排序操作
const handleSetSort = () => {
  setSort('name', 1)
  success('按姓名升序排序')
}

const handleClearSort = () => {
  clearSort()
  success('已清除排序')
}

// 获取当前排序
const handleGetCurrentSort = () => {
  const sort = getCurrentSort()
  if (sort) {
    info(
      `当前排序: ${sort.sortField} ${sort.sortOrder === 1 ? '升序' : sort.sortOrder === -1 ? '降序' : '无'}`
    )
  } else {
    info('当前无排序')
  }
}

// 全局搜索操作
const handleSetGlobalFilter = () => {
  setGlobalFilter('用户 1')
  success('已设置全局搜索: "用户 1"')
}

// 获取当前筛选
const handleGetCurrentFilters = () => {
  const filters = getCurrentFilters()
  if (filters) {
    info(`当前筛选: ${JSON.stringify(filters)}`)
  } else {
    info('当前无筛选')
  }
}

// 导出数据
const handleExportData = () => {
  exportData('csv', 'table-data')
  success('数据导出成功')
}

// 查找行
const handleFindRows = () => {
  const results = findRows((row: UserData) => row.age > 30)
  if (results.length > 0) {
    info(`找到 ${results.length} 条年龄大于30的记录`)
  } else {
    info('未找到符合条件的记录')
  }
}

// 获取行信息
const handleGetRowById = () => {
  const row = getRowById(1)
  if (row) {
    openDialog({
      header: '行信息',
      contentRenderer: () => {
        return <pre>{JSON.stringify(row, null, 2)}</pre>
      },
      hideClose: true,
      hideFooter: true,
    })
  } else {
    error('未找到ID为1的行')
  }
}

// 获取行索引
const handleGetRowIndex = () => {
  const firstRow = tableData.value[0]
  if (firstRow) {
    const index = getRowIndex(firstRow)
    info(`第一行的索引: ${index}`)
  }
}

// 获取表格信息
const handleGetTableInfo = () => {
  const info = {
    totalRecords: getTotalRecords(),
    currentPage: getCurrentPage(),
    totalPages: getTotalPages(),
    isEmpty: isEmpty(),
    isLoading: isLoading(),
    selectedCount: selectedRows.value.length,
    expandedCount: expandedRows.value.length,
    columnWidthsCount: columnWidths.value.length,
    paginationState: paginationState.value,
    sortState: sortState.value,
    filterState: filterState.value,
  }
  openDialog({
    header: '表格信息',
    contentRenderer: () => {
      return <pre>{JSON.stringify(info, null, 2)}</pre>
    },
    hideClose: true,
    hideFooter: true,
  })
}

// 获取列宽度
const handleGetColumnWidths = () => {
  const widths = getColumnWidths()
  if (widths.length > 0) {
    info(`列宽度信息: ${JSON.stringify(widths, null, 2)}`)
  } else {
    info('暂无列宽度信息')
  }
}

// 更新列宽度
const handleUpdateColumnWidths = () => {
  updateColumnWidths()
  // 延迟显示结果，因为 updateColumnWidths 内部使用了 setTimeout
  setTimeout(() => {
    const widths = getColumnWidths()
    if (widths.length > 0) {
      const widthsInfo = widths.map(w => `${w.field}: ${w.width}px`).join(', ')
      success(`已更新列宽度: ${widthsInfo}`)
    } else {
      info('未获取到列宽度信息，请确保表格已完全渲染')
    }
  }, 300)
}

// 行点击事件
const handleRowClick = (event: any) => {
  console.log('行点击:', event)
  info(`点击了行: ${event.data.name}`)
}

// 行选择事件
const handleRowSelect = (event: any) => {
  console.log('行选择:', event)
}

// 分页变化事件
const handlePageChange = (event: any) => {
  console.log('分页变化:', event)
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 操作按钮区域（吸顶区域）
  .bg-bg200.p-padding.rounded-rounded.px-padding.between-col.items-start.sticky.top-0.z-2.gap-gaps.z-9999
    b VxeTable 组件基础示例 + useVxeTable Hook 演示
    .fs-appFontSizes 展示 VxeTable 组件的基本功能和使用 useVxeTable hook 的各种操作方法
    div
      .fs-appFontSizes.color-accent100 数据操作
      .between-start.gap-gap
        Button(size='small', @click='handleRefresh') 刷新数据
        Button(size='small', @click='handleLoadData') 加载新数据
        Button(size='small', @click='handleUpdateRow') 更新第一行
        Button(size='small', @click='handleUpdateRows') 批量更新
        Button(size='small', @click='handleDeleteRow') 删除第一行
        Button(size='small', @click='handleDeleteRows') 批量删除
        Button(size='small', @click='handleAddRow') 添加新行
    div
      .fs-appFontSizes.color-accent100 选择操作
      .between-start.gap-gap
        Button(size='small', @click='handleSelectRow') 选择第一行
        Button(size='small', @click='handleUnselectRow') 取消选择第一行
        Button(size='small', @click='handleSelectAll') 全选
        Button(size='small', @click='handleToggleRowSelection') 切换选择状态
        Button(size='small', @click='handleIsRowSelected') 检查是否选中
        Button(size='small', @click='handleClearSelection') 清除选择
        Button(size='small', @click='handleGetSelectedRowIds') 获取选中ID
    div
      .fs-appFontSizes.color-accent100 分页操作
      .between-start.gap-gap
        Button(size='small', @click='handlePreviousPage') 上一页
        Button(size='small', @click='handleNextPage') 下一页
        Button(size='small', @click='handleGoToPage') 跳转页面
        Button(size='small', @click='handleSetPageSize') 设置每页数量
    div
      .fs-appFontSizes.color-accent100 排序操作
      .between-start.gap-gap
        Button(size='small', @click='handleSetSort') 设置排序
        Button(size='small', @click='handleClearSort') 清除排序
        Button(size='small', @click='handleGetCurrentSort') 获取当前排序
    div
      .fs-appFontSizes.color-accent100 搜索操作
      .between-start.gap-gap
        Button(size='small', @click='handleSetGlobalFilter') 设置全局搜索
        Button(size='small', @click='handleGetCurrentFilters') 获取当前筛选
    div
      .fs-appFontSizes.color-accent100 其他操作
      .between-start.gap-gap
        Button(size='small', @click='handleExportData') 导出数据
        Button(size='small', @click='handleFindRows') 查找行
        Button(size='small', @click='handleGetRowById') 获取行信息
        Button(size='small', @click='handleGetRowIndex') 获取行索引
        Button(size='small', @click='handleGetColumnWidths') 获取列宽度
        Button(size='small', @click='handleUpdateColumnWidths') 更新列宽度
        Button(size='small', @click='handleGetTableInfo') 获取表格信息

  .p-padding
    // 表格组件
    VxeTable(
      ref='tableRef',
      :data='tableData',
      :columns='columns',
      :loading='loading',
      :pagination='true',
      :sortable='true',
      :global-filter='true',
      :exportable='true',
      :selectable='true',
      selection-mode='multiple',
      :row-selectable='true',
      :paginator-position='"left"',
      :show-gridlines='true',
      :striped-rows='true',
      @row-click='handleRowClick',
      @row-select='handleRowSelect',
      @page-change='handlePageChange'
    )
      template(#header-left='{ data, selectedRows: selected }')
        .between-start.gap-gap
          span.fs-appFontSizes 共 {{ data.length }} 条数据
          span.fs-appFontSizes(v-if='selected && selected.length > 0') 已选择 {{ selected.length }} 条

  // 行样式 / 自定义状态渲染示例
  .p-padding
    .bg-bg200.p-padding.rounded-rounded.between-col.gap-gap
      b.fs-appFontSizex 行样式 / 自定义状态渲染
      .fs-appFontSizes.color-text200 使用 rowStyle/rowClass 高亮状态与角色
      VxeTable(
        :data='tableData',
        :columns='columns',
        :show-gridlines='true',
        :striped-rows='true',
        :row-style='rowStyleHighlight',
        :row-class='rowClassHighlight'
      )

  // 列对齐示例
  .p-padding
    .bg-bg200.p-padding.rounded-rounded.between-col.gap-gap
      b.fs-appFontSizex 列对齐示例（居左/居中/居右）
      .fs-appFontSizes.color-text200 使用列的 align 设置不同对齐方式
      VxeTable(
        :data='tableData',
        :columns='alignedColumns',
        :show-gridlines='true',
        :striped-rows='true'
      )

  .full.c-card.fs-appFontSizes.between-col.gap-gap
    span.fs-appFontSizex 表格状态实时预览：
    .full.between-col.justify-start.gap-gap
      div
        b 选中行：
        pre.c-border-primary.p-paddings {{ JSON.stringify(selectedRows, null, 2) }}
      div
        b 分页状态：
        pre.c-border-primary.p-paddings {{ JSON.stringify(paginationState, null, 2) }}
      div
        b 排序状态：
        pre.c-border-primary.p-paddings {{ JSON.stringify(sortState, null, 2) }}
      div
        b 筛选状态：
        pre.c-border-primary.p-paddings {{ JSON.stringify(filterState, null, 2) }}
</template>

<style lang="scss" scoped>
pre {
  margin: 0;
  max-height: 200px;
  overflow: auto;
}
</style>
