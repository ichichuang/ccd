<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { onUnmounted, ref } from 'vue'

// ==================== 数据类型定义 ====================
interface MqttData {
  id: string
  name: string
  value: number
  status: 'online' | 'offline' | 'warning'
  timestamp: string
  location: string
  temperature?: number
  humidity?: number
}

// ==================== 表格数据 ====================
// 默认表格为空
const tableData = ref<MqttData[]>([])
const loading = ref<boolean>(false)

// ==================== 列配置 ====================
const columns: VxeTableColumn<MqttData>[] = [
  {
    field: 'id',
    header: '设备ID',
    width: 120,
    sortable: true,
    align: 'center',
  },
  {
    field: 'name',
    header: '设备名称',
    width: 150,
    sortable: true,
  },
  {
    field: 'location',
    header: '位置',
    width: 150,
    sortable: true,
  },
  {
    field: 'value',
    header: '数值',
    width: 100,
    sortable: true,
    align: 'right',
    body: (rowData: MqttData) => {
      return <span class="font-bold">{rowData.value.toFixed(2)}</span>
    },
  },
  {
    field: 'temperature',
    header: '温度(°C)',
    width: 120,
    sortable: true,
    align: 'right',
    body: (rowData: MqttData) => {
      if (rowData.temperature !== undefined) {
        return <span>{rowData.temperature.toFixed(1)}°C</span>
      }
      return <span class="color-text3">-</span>
    },
  },
  {
    field: 'humidity',
    header: '湿度(%)',
    width: 120,
    sortable: true,
    align: 'right',
    body: (rowData: MqttData) => {
      if (rowData.humidity !== undefined) {
        return <span>{rowData.humidity.toFixed(1)}%</span>
      }
      return <span class="color-text3">-</span>
    },
  },
  {
    field: 'status',
    header: '状态',
    width: 120,
    sortable: true,
    align: 'center',
    body: (rowData: MqttData) => {
      const statusMap: Record<MqttData['status'], { label: string; class: string }> = {
        online: { label: '在线', class: 'text-green-500' },
        offline: { label: '离线', class: 'text-red-500' },
        warning: { label: '警告', class: 'text-yellow-500' },
      }
      const status = statusMap[rowData.status]
      return <span class={status.class}>{status.label}</span>
    },
  },
  {
    field: 'timestamp',
    header: '更新时间',
    width: 180,
    sortable: true,
  },
]

// ==================== MQTT 模拟 ====================
let mqttInterval: ReturnType<typeof setInterval> | null = null
const isSimulating = ref<boolean>(false)
const receivedCount = ref<number>(0)
const updatedCount = ref<number>(0)
const addedCount = ref<number>(0)

// 生成模拟 MQTT 数据
const generateMqttData = (): MqttData => {
  const locations = ['车间A', '车间B', '仓库1', '仓库2', '办公室', '实验室']
  const statuses: MqttData['status'][] = ['online', 'offline', 'warning']
  const deviceIds = ['DEV001', 'DEV002', 'DEV003', 'DEV004', 'DEV005', 'DEV006', 'DEV007', 'DEV008']
  const deviceNames = [
    '传感器A',
    '传感器B',
    '温度计',
    '湿度计',
    '压力计',
    '流量计',
    '控制器',
    '监控器',
  ]

  // 随机选择一个设备 ID（可能是已存在的，也可能是新的）
  const deviceId = deviceIds[Math.floor(Math.random() * deviceIds.length)]
  const deviceName = deviceNames[Math.floor(Math.random() * deviceNames.length)]

  return {
    id: deviceId,
    name: deviceName,
    value: Math.random() * 100,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: new Date().toLocaleString('zh-CN'),
    location: locations[Math.floor(Math.random() * locations.length)],
    temperature: Math.random() > 0.3 ? Math.random() * 40 + 10 : undefined,
    humidity: Math.random() > 0.3 ? Math.random() * 100 : undefined,
  }
}

// 处理接收到的 MQTT 数据
const handleMqttData = (data: MqttData) => {
  receivedCount.value += 1

  // 查找是否已存在相同 id 的数据
  const existingIndex = tableData.value.findIndex(item => item.id === data.id)

  if (existingIndex !== -1) {
    // 如果存在，更新对应行
    tableData.value[existingIndex] = { ...data }
    updatedCount.value += 1
    console.log(`[MQTT] 更新设备 ${data.id} 的数据`)
  } else {
    // 如果不存在，添加新行
    tableData.value.push({ ...data })
    addedCount.value += 1
    console.log(`[MQTT] 添加新设备 ${data.id} 的数据`)
  }
}

// 开始模拟 MQTT 数据接收
const startMqttSimulation = () => {
  if (isSimulating.value) {
    return
  }

  isSimulating.value = true
  receivedCount.value = 0
  updatedCount.value = 0
  addedCount.value = 0

  // 立即接收第一条数据
  const firstData = generateMqttData()
  handleMqttData(firstData)

  // 每隔 1-3 秒随机接收一条数据
  mqttInterval = setInterval(
    () => {
      const data = generateMqttData()
      handleMqttData(data)
    },
    1000 + Math.random() * 2000
  ) // 1-3 秒随机间隔
}

// 停止模拟 MQTT 数据接收
const stopMqttSimulation = () => {
  if (mqttInterval) {
    clearInterval(mqttInterval)
    mqttInterval = null
  }
  isSimulating.value = false
}

// 清空表格数据
const clearTableData = () => {
  tableData.value = []
  receivedCount.value = 0
  updatedCount.value = 0
  addedCount.value = 0
}

// 手动添加一条数据（用于测试）
const addManualData = () => {
  const data = generateMqttData()
  handleMqttData(data)
}

// 组件卸载时清理定时器
onUnmounted(() => {
  stopMqttSimulation()
})
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 动态表格示例（主容器，与 basic 保持一致结构）
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b VxeTable 动态表格示例（MQTT 数据模拟）
    .fs-appFontSizes 模拟从 MQTT 接收数据，动态更新表格内容
    .between.items-start.gap-gap.w-full
      .flex-1.grid.grid-cols-1.gap-gap(class='sm:grid-cols-2 lg:grid-cols-4')
        .between-col
          .fs-appFontSizes.color-accent100 模拟控制
          .between-start.gap-gap
            Button(
              size='small',
              :severity='isSimulating ? "danger" : "primary"',
              :disabled='isSimulating',
              @click='startMqttSimulation'
            ) {{ isSimulating ? '运行中' : '开始模拟' }}
            Button(
              size='small',
              severity='secondary',
              :disabled='!isSimulating',
              @click='stopMqttSimulation'
            ) 停止模拟

        .between-col
          .fs-appFontSizes.color-accent100 数据统计
          .between-start.gap-gap.fs-appFontSizes
            span 接收: {{ receivedCount }}
            span 新增: {{ addedCount }}
            span 更新: {{ updatedCount }}

        .between-col
          .fs-appFontSizes.color-accent100 表格数据
          .between-start.gap-gap.fs-appFontSizes
            span 当前: {{ tableData.length }} 条

        .between-col
          .fs-appFontSizes.color-accent100 操作
          .between-start.gap-gap
            Button(
              size='small',
              severity='secondary',
              @click='addManualData',
              :disabled='isSimulating'
            ) 手动添加
            Button(
              size='small',
              severity='danger',
              @click='clearTableData',
              :disabled='isSimulating'
            ) 清空数据

    // 使用说明
    .c-border-accent.p-padding.fs-appFontSizes
      div
        b 使用说明：
      ul.mt-1
        li
          strong 模拟 MQTT 数据：
          | 点击"开始模拟"按钮后，系统会每隔 1-3 秒随机接收一条 MQTT 数据
        li
          strong 数据更新逻辑：
          | 以设备 ID 为 key，如果 ID 已存在则更新对应行，如果不存在则添加新行
        li
          strong 手动操作：
          | 可以手动添加数据或清空表格（模拟停止时）
        li
          strong 实时统计：
          | 显示接收总数、新增数量、更新数量

    // 表格
    .h-500
      VxeTable(
        :data='tableData',
        :columns='columns',
        :loading='loading',
        :pagination='true',
        :sortable='true',
        :scrollable='true',
        :show-gridlines='true',
        :striped-rows='true'
      )
        template(#header-left='{ data }')
          .between-start.gap-gap
            span.fs-appFontSizes 共 {{ data?.length ?? 0 }} 条数据
            span.fs-appFontSizes(v-if='isSimulating')
              | 状态:
              span.color-green-500 接收中...

  // 说明文档（独立说明卡片）
  .c-border-accent.p-padding.fs-appFontSizes.between-col.justify-start.items-start.gap-gap
    b.fs-appFontSizex 动态表格功能说明
    .between-col.gap-gaps
      div
        b 功能概述：
        ul
          li 动态表格适用于实时数据更新场景，如 IoT 设备监控、实时日志等
          li 模拟从 MQTT 消息队列接收数据，动态更新表格内容
          li 支持数据的实时添加和更新，无需刷新页面

      div
        b 数据更新逻辑：
        ul
          li
            strong 以 ID 为 Key：
            | 使用数据中的
            code id
            | 字段作为唯一标识
          li
            strong 更新已存在数据：
            | 如果表格中已存在相同 ID 的数据，则更新该行的所有字段
          li
            strong 添加新数据：
            | 如果表格中不存在该 ID，则添加为新行
          li
            strong 实时更新：
            | 数据更新后，表格会自动刷新显示最新内容

      div
        b 使用场景：
        ul
          li IoT 设备监控：实时接收设备状态数据
          li 实时日志：动态显示系统日志
          li 消息队列：处理 MQTT、WebSocket 等实时数据流
          li 数据采集：实时采集和展示传感器数据

      div
        b 技术实现：
        ul
          li 使用 Vue 3 的响应式系统，数据更新自动触发视图更新
          li 通过
            code findIndex
            | 查找已存在的数据
          li 使用对象展开运算符更新数据，保持响应性
          li 使用定时器模拟 MQTT 数据接收

      div
        b 注意事项：
        ul
          li 确保数据中的
            code id
            | 字段唯一且稳定
          li 大量数据更新时，建议使用虚拟滚动提升性能
          li 实际项目中，应该使用真实的 MQTT 客户端库（如 mqtt.js）
          li 注意清理定时器，避免内存泄漏
</template>
