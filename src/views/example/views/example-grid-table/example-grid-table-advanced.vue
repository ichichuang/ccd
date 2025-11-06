<script setup lang="ts">
import type { ExtendedColDef } from '@/components/modules/grid-table'
import { GridTable } from '@/components/modules/grid-table'
import { onMounted, onUnmounted, ref } from 'vue'

// ==================== 列定义 ====================

const columnDefs = ref<ExtendedColDef[]>([
  {
    field: 'id',
    headerName: 'ID',
    pinned: 'left',
  },
  {
    field: 'name',
    headerName: '姓名',
  },
  {
    field: 'age',
    headerName: '年龄',
    sortable: true,
  },
  {
    field: 'email',
    headerName: '邮箱',
    width: 240,
  },
  {
    field: 'department',
    headerName: '部门',
  },
  {
    field: 'position',
    headerName: '职位',
  },
  {
    field: 'salary',
    headerName: '薪资',
    sortable: true,
    valueFormatter: (params: any) => {
      return `¥${params.value?.toLocaleString() || 0}`
    },
  },
  {
    field: 'status',
    headerName: '状态',
    valueGetter: (params: any) => {
      const status = params.data?.status
      const statusMap = {
        active: '在职',
        inactive: '离职',
        pending: '待定',
      }
      return statusMap[status as keyof typeof statusMap] || status
    },
  },
  {
    field: 'joinDate',
    headerName: '入职日期',
    valueFormatter: (params: any) => {
      if (!params.value) {
        return ''
      }
      return new Date(params.value).toLocaleDateString('zh-CN')
    },
  },
  {
    field: 'phone',
    headerName: '电话',
  },
  {
    field: 'address',
    headerName: '地址',
  },
])

// ==================== 假数据 ====================

// 基础静态数据（两张表共享的初始模板）
const baseData = [
  {
    id: 1,
    name: '张三',
    age: 28,
    email: 'zhangsan@example.com',
    department: '技术部',
    position: '前端工程师',
    salary: 15000,
    status: 'active',
    joinDate: '2022-03-15',
    phone: '13800138001',
    address: '北京市朝阳区',
  },
  {
    id: 2,
    name: '李四',
    age: 32,
    email: 'lisi@example.com',
    department: '技术部',
    position: '后端工程师',
    salary: 18000,
    status: 'active',
    joinDate: '2021-08-20',
    phone: '13800138002',
    address: '上海市浦东新区',
  },
  {
    id: 3,
    name: '王五',
    age: 25,
    email: 'wangwu@example.com',
    department: '设计部',
    position: 'UI设计师',
    salary: 12000,
    status: 'active',
    joinDate: '2023-01-10',
    phone: '13800138003',
    address: '广州市天河区',
  },
  {
    id: 4,
    name: '赵六',
    age: 35,
    email: 'zhaoliu@example.com',
    department: '产品部',
    position: '产品经理',
    salary: 20000,
    status: 'active',
    joinDate: '2020-06-01',
    phone: '13800138004',
    address: '深圳市南山区',
  },
  {
    id: 5,
    name: '钱七',
    age: 29,
    email: 'qianqi@example.com',
    department: '运营部',
    position: '运营专员',
    salary: 10000,
    status: 'inactive',
    joinDate: '2022-11-15',
    phone: '13800138005',
    address: '杭州市西湖区',
  },
  {
    id: 6,
    name: '孙八',
    age: 27,
    email: 'sunba@example.com',
    department: '技术部',
    position: '测试工程师',
    salary: 13000,
    status: 'active',
    joinDate: '2023-05-20',
    phone: '13800138006',
    address: '成都市武侯区',
  },
  {
    id: 7,
    name: '周九',
    age: 31,
    email: 'zhoujiu@example.com',
    department: '市场部',
    position: '市场专员',
    salary: 11000,
    status: 'active',
    joinDate: '2022-09-01',
    phone: '13800138007',
    address: '武汉市江汉区',
  },
  {
    id: 8,
    name: '吴十',
    age: 26,
    email: 'wushi@example.com',
    department: '人事部',
    position: '人事专员',
    salary: 9000,
    status: 'pending',
    joinDate: '2023-08-15',
    phone: '13800138008',
    address: '南京市鼓楼区',
  },
  {
    id: 9,
    name: '郑十一',
    age: 33,
    email: 'zhengshiyi@example.com',
    department: '财务部',
    position: '会计',
    salary: 14000,
    status: 'active',
    joinDate: '2021-12-01',
    phone: '13800138009',
    address: '西安市雁塔区',
  },
  {
    id: 10,
    name: '王十二',
    age: 24,
    email: 'wangshier@example.com',
    department: '技术部',
    position: '实习生',
    salary: 5000,
    status: 'active',
    joinDate: '2023-10-01',
    phone: '13800138010',
    address: '重庆市渝中区',
  },
  {
    id: 11,
    name: '李十三',
    age: 30,
    email: 'lishisan@example.com',
    department: '销售部',
    position: '销售经理',
    salary: 16000,
    status: 'active',
    joinDate: '2022-01-15',
    phone: '13800138011',
    address: '天津市和平区',
  },
  {
    id: 12,
    name: '张十四',
    age: 28,
    email: 'zhangshisi@example.com',
    department: '客服部',
    position: '客服主管',
    salary: 12000,
    status: 'active',
    joinDate: '2022-07-01',
    phone: '13800138012',
    address: '苏州市姑苏区',
  },
  {
    id: 13,
    name: '刘十五',
    age: 35,
    email: 'liushiwu@example.com',
    department: '技术部',
    position: '架构师',
    salary: 25000,
    status: 'active',
    joinDate: '2020-03-01',
    phone: '13800138013',
    address: '长沙市岳麓区',
  },
  {
    id: 14,
    name: '陈十六',
    age: 27,
    email: 'chenshiliu@example.com',
    department: '设计部',
    position: '平面设计师',
    salary: 11000,
    status: 'active',
    joinDate: '2023-02-20',
    phone: '13800138014',
    address: '福州市鼓楼区',
  },
  {
    id: 15,
    name: '杨十七',
    age: 29,
    email: 'yangshiqi@example.com',
    department: '运营部',
    position: '运营经理',
    salary: 15000,
    status: 'active',
    joinDate: '2022-05-10',
    phone: '13800138015',
    address: '郑州市金水区',
  },
]
// 表格一：纯展示分页器（静态数据，不参与下拉加载）
const rowDataStatic = ref([...baseData])
// 表格二：动态数据源（用于触底加载更多）
const rowDataDynamic = ref([...baseData])
// 表格三：动态数据源（空数据开始）
const rowDataDynamic2 = ref<any[]>([])
// 仅在演示页通过 props 开启分页，其余参数使用默认设置
const enablePagination = ref(true)
const isLoading = ref(false)
const noMore = ref(false)
const advancedTableRef = ref<any>(null)

// ==================== 事件演示 ====================
// 说明：以下事件均来自 GridTable 组件（见 utils/types.ts 中的 GridTableEmits 定义）
// 约定：每个回调仅演示打印“事件名称 + 携带参数”，便于在控制台观察触发时机与数据结构
const onSelectionChanged = (rows: any[]) => console.log('选择变化', rows)
const onSortChanged = (model: any[]) => console.log('排序变化', model)
const onFilterChanged = (model: any) => console.log('过滤变化', model)
const onColumnResized = (event: any) => console.log('列尺寸变化', event)
const onColumnMoved = (event: any) => console.log('列移动', event)
const onColumnVisible = (event: any) => console.log('列显隐变化', event)
const onRowDataChanged = (data: any[]) => console.log('行数据变化', data)
const onCellValueChanged = (event: any) => console.log('单元格值变化', event)
const onCellClicked = (event: any) => console.log('单元格点击', event)
const onCellDoubleClicked = (event: any) => console.log('单元格双击', event)
const onCellContextMenu = (event: any) => console.log('单元格右键', event)
// 触底事件打印
const onReachBottom = (p: { scrollTop: number; clientHeight: number; scrollHeight: number }) => {
  console.log('触底', p)
  if (isLoading.value || noMore.value) {
    return
  }

  // 如果已满 40 条，就不再加载
  if (rowDataDynamic.value.length >= 40) {
    noMore.value = true
    return
  }

  isLoading.value = true
  advancedTableRef.value?.setLoading(true) // 显示
  // 模拟调用 API 加载更多数据（3秒延迟）
  setTimeout(async () => {
    const baseId = (rowDataDynamic.value[rowDataDynamic.value.length - 1]?.id || 0) + 1
    const more = Array.from({ length: 5 }).map((_, i) => ({
      id: baseId + i,
      name: `新增-${baseId + i}`,
      age: 20 + ((baseId + i) % 15),
      email: `new${baseId + i}@example.com`,
      department: '技术部',
      position: '运营专员',
      salary: 10000 + (i % 5) * 500,
      status: 'active',
      joinDate: '2024-01-01',
      phone: '13800138000',
      address: '新增地址',
    }))

    rowDataDynamic.value.push(...more)

    // 关闭加载状态
    isLoading.value = false
    advancedTableRef.value?.setLoading(false) // 隐藏
  }, 1000)
}
const onCellEditingStarted = (event: any) => console.log('开始编辑', event)
const onCellEditingStopped = (event: any) => console.log('结束编辑', event)
const onGridReady = (params: { api: any }) => console.log('网格就绪', params)
const onGridSizeChanged = (event: any) => console.log('网格尺寸变化', event)

const loadData = () => {
  rowDataDynamic2.value = [...baseData]
}
const clearData = () => {
  rowDataDynamic2.value = []
}
const dynamicData = () => {
  rowDataDynamic2.value = rowDataDynamic2.value.map(item => ({
    ...item,
    age: item.age + Math.floor(Math.random() * 50) + 1,
  }))
}

// ==================== 实时数据源（示例4） ====================

// 创建新的模拟实时数据源
const rowDataRealtime = ref<any[]>([])
let realtimeTimer: number | null = null

const createRealtimeBaseData = (count = 30) => {
  const baseId = 1000
  return Array.from({ length: count }).map((_, i) => ({
    id: baseId + i,
    name: `实时-${baseId + i}`,
    age: 20 + ((baseId + i) % 15),
    email: `realtime${baseId + i}@example.com`,
    department: ['技术部', '产品部', '设计部', '运营部'][i % 4],
    position: ['工程师', '测试', '经理', '专员'][i % 4],
    salary: 9000 + (i % 10) * 800,
    status: ['active', 'inactive', 'pending'][i % 3],
    joinDate: '2024-01-01',
    phone: '13800138000',
    address: `实时地址-${i}`,
  }))
}

// 每 1s 模拟实时更新部分字段，替换数组引用，触发无感知更新
const startRealtime = () => {
  if (realtimeTimer) {
    return
  }
  // 初始化基础数据
  rowDataRealtime.value = createRealtimeBaseData(30)
  realtimeTimer = window.setInterval(() => {
    const next = rowDataRealtime.value.map(item => {
      // 轻量字段抖动：年龄、薪资、状态
      const ageDelta = Math.floor(Math.random() * 3) - 1 // -1 ~ 1
      const salaryDelta = (Math.floor(Math.random() * 5) - 2) * 200 // -400 ~ 400
      const statuses = ['active', 'inactive', 'pending']
      const status = Math.random() < 0.15 ? statuses[Math.floor(Math.random() * 3)] : item.status
      return {
        ...item,
        age: Math.max(18, item.age + ageDelta),
        salary: Math.max(3000, item.salary + salaryDelta),
        status,
      }
    })
    // 替换引用以触发 GridTable 的行数据监听
    rowDataRealtime.value = next
  }, 1000)
}

const stopRealtime = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

onMounted(() => {
  startRealtime()
})

onUnmounted(() => {
  stopRealtime()
})
</script>

<template lang="pug">
div
  .c-accent100.mb-gaps 分页器
  // 表格示例 1：仅展示分页器（静态数据）
  GridTable(
    :column-defs='columnDefs',
    :row-data='rowDataStatic',
    :size-config='{ heightMode: "fixed" }',
    :enable-pagination='enablePagination'
  )

  .c-accent100.mb-gaps.mt-gap 事件
  // 表格示例 2：动态数据 + 触底加载
  GridTable(
    :column-defs='columnDefs',
    :row-data='rowDataDynamic',
    :size-config='{ heightMode: "fixed", height: 420 }',
    :bottom-reach-offset='20',
    ref='advancedTableRef',
    @reach-bottom='onReachBottom',
    @selection-changed='onSelectionChanged',
    @sort-changed='onSortChanged',
    @filter-changed='onFilterChanged',
    @column-resized='onColumnResized',
    @column-moved='onColumnMoved',
    @column-visible='onColumnVisible',
    @row-data-changed='onRowDataChanged',
    @cell-value-changed='onCellValueChanged',
    @cell-clicked='onCellClicked',
    @cell-double-clicked='onCellDoubleClicked',
    @cell-context-menu='onCellContextMenu',
    @cell-editing-started='onCellEditingStarted',
    @cell-editing-stopped='onCellEditingStopped',
    @grid-ready='onGridReady',
    @grid-size-changed='onGridSizeChanged',
    :show-toolbar='true',
    :show-status-bar='true'
  )

  .c-accent100.mb-gaps.mt-gap 动态数据 {{ rowDataDynamic2.length }}
  .mb-gaps.between-start
    Button(label='加载数据', @click='loadData')
    Button(label='清空数据', @click='clearData')
    Button(label='动态年龄数据', @click='dynamicData')
  // 表格示例 3：动态数据源（空数据开始）
  GridTable(
    :column-defs='columnDefs',
    :row-data='rowDataDynamic2',
    :size-config='{ heightMode: "fixed", height: 300, defaultColumnWidth: 140 }',
    :fit-columns-to-viewport='false'
  )

  .c-accent100.mb-gaps.mt-gap 实时数据源 {{ rowDataRealtime.length }}
  // 表格示例 4：实时数据源
  GridTable(
    :column-defs='columnDefs',
    :row-data='rowDataRealtime',
    :size-config='{ heightMode: "fixed", height: 300, defaultColumnWidth: 140 }',
    :fit-columns-to-viewport='false',
    :enable-sorting='true',
    :enable-column-drag='true'
  )
</template>
