<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// 联动组 ID
const LINKAGE_GROUP_ID = 'sales-dashboard'

// 模拟销售数据（12个月）
interface SalesData {
  month: string
  totalSales: number // 总销售额（万元）
  growthRate: number // 同比增长率（%）
  products: {
    phone: number // 手机销售额
    computer: number // 电脑销售额
    accessory: number // 配件销售额
  }
  channels: {
    online: number // 线上销售额
    offline: number // 线下销售额
    agent: number // 代理销售额
    direct: number // 直销销售额
  }
}

const rawSalesData: SalesData[] = [
  {
    month: '1月',
    totalSales: 120,
    growthRate: 15.2,
    products: { phone: 50, computer: 40, accessory: 30 },
    channels: { online: 60, offline: 30, agent: 20, direct: 10 },
  },
  {
    month: '2月',
    totalSales: 200,
    growthRate: 22.5,
    products: { phone: 80, computer: 70, accessory: 50 },
    channels: { online: 100, offline: 50, agent: 35, direct: 15 },
  },
  {
    month: '3月',
    totalSales: 150,
    growthRate: 18.8,
    products: { phone: 60, computer: 55, accessory: 35 },
    channels: { online: 75, offline: 40, agent: 25, direct: 10 },
  },
  {
    month: '4月',
    totalSales: 180,
    growthRate: 20.3,
    products: { phone: 70, computer: 65, accessory: 45 },
    channels: { online: 90, offline: 45, agent: 30, direct: 15 },
  },
  {
    month: '5月',
    totalSales: 220,
    growthRate: 25.6,
    products: { phone: 90, computer: 80, accessory: 50 },
    channels: { online: 110, offline: 60, agent: 35, direct: 15 },
  },
  {
    month: '6月',
    totalSales: 250,
    growthRate: 28.4,
    products: { phone: 100, computer: 90, accessory: 60 },
    channels: { online: 125, offline: 70, agent: 40, direct: 15 },
  },
  {
    month: '7月',
    totalSales: 280,
    growthRate: 30.1,
    products: { phone: 110, computer: 100, accessory: 70 },
    channels: { online: 140, offline: 80, agent: 45, direct: 15 },
  },
  {
    month: '8月',
    totalSales: 300,
    growthRate: 32.5,
    products: { phone: 120, computer: 110, accessory: 70 },
    channels: { online: 150, offline: 85, agent: 50, direct: 15 },
  },
  {
    month: '9月',
    totalSales: 270,
    growthRate: 29.8,
    products: { phone: 105, computer: 95, accessory: 70 },
    channels: { online: 135, offline: 75, agent: 45, direct: 15 },
  },
  {
    month: '10月',
    totalSales: 320,
    growthRate: 35.2,
    products: { phone: 130, computer: 120, accessory: 70 },
    channels: { online: 160, offline: 90, agent: 55, direct: 15 },
  },
  {
    month: '11月',
    totalSales: 350,
    growthRate: 38.6,
    products: { phone: 140, computer: 130, accessory: 80 },
    channels: { online: 175, offline: 100, agent: 60, direct: 15 },
  },
  {
    month: '12月',
    totalSales: 380,
    growthRate: 40.5,
    products: { phone: 150, computer: 140, accessory: 90 },
    channels: { online: 190, offline: 110, agent: 65, direct: 15 },
  },
]

// 当前 dataZoom 范围（用于动态更新饼图和雷达图）
const dataZoomRange = ref({ start: 0, end: 100 })

// 计算当前范围内的数据
const currentRangeData = computed(() => {
  const startIndex = Math.floor((dataZoomRange.value.start / 100) * rawSalesData.length)
  const endIndex = Math.ceil((dataZoomRange.value.end / 100) * rawSalesData.length)
  return rawSalesData.slice(startIndex, endIndex)
})

// 左上角：主图表（柱状图+折线图混合）
const mainChartOption = ref<any>({
  title: {
    text: '产品销售数据概览 (2024)',
    left: 'center',
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'cross' as const,
    },
  },
  legend: {
    data: ['总销售额', '同比增长率'],
    top: 30,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '26%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    data: rawSalesData.map(item => item.month),
    axisPointer: {
      type: 'shadow' as const,
    },
  },
  yAxis: [
    {
      type: 'value' as const,
      name: '销售额（万元）',
      position: 'left' as const,
    },
    {
      type: 'value' as const,
      name: '同比增长率（%）',
      position: 'right' as const,
      axisLabel: {
        formatter: '{value}%',
      },
    },
  ],
  dataZoom: [
    {
      type: 'slider' as const,
      show: true,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      bottom: 10,
    },
    {
      // 鼠标滚轮缩放 dataZoom
      type: 'inside' as const,
      xAxisIndex: [0],
      zoomOnMouseWheel: true,
      moveOnMouseWheel: false,
    },
  ],
  series: [
    {
      name: '总销售额',
      type: 'bar' as const,
      data: rawSalesData.map(item => item.totalSales),
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
    },
    {
      name: '同比增长率',
      type: 'line' as const,
      yAxisIndex: 1,
      data: rawSalesData.map(item => item.growthRate),
      smooth: true,
      lineStyle: {
        width: 3,
      },
      symbol: 'circle',
      symbolSize: 8,
    },
  ],
})

// 右上角：饼图（产品构成）
const pieChartOption = computed<any>(() => {
  const rangeData = currentRangeData.value
  const totalPhone = rangeData.reduce((sum, item) => sum + item.products.phone, 0)
  const totalComputer = rangeData.reduce((sum, item) => sum + item.products.computer, 0)
  const totalAccessory = rangeData.reduce((sum, item) => sum + item.products.accessory, 0)

  return {
    title: {
      text: '产品销售构成',
      left: 'center',
    },
    tooltip: {
      trigger: 'item' as const,
      formatter: '{a} <br/>{b}: {c}万元 ({d}%)',
    },
    legend: {
      orient: 'vertical' as const,
      left: 'left',
      top: 'middle',
      data: ['手机', '电脑', '配件'],
    },
    series: [
      {
        name: '销售额',
        type: 'pie' as const,
        radius: '50%',
        center: ['60%', '50%'],
        data: [
          { value: totalPhone, name: '手机' },
          { value: totalComputer, name: '电脑' },
          { value: totalAccessory, name: '配件' },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
})

// 左下角：雷达图（渠道分布）
const radarChartOption = computed<any>(() => {
  const rangeData = currentRangeData.value
  const avgOnline =
    rangeData.reduce((sum, item) => sum + item.channels.online, 0) / rangeData.length
  const avgOffline =
    rangeData.reduce((sum, item) => sum + item.channels.offline, 0) / rangeData.length
  const avgAgent = rangeData.reduce((sum, item) => sum + item.channels.agent, 0) / rangeData.length
  const avgDirect =
    rangeData.reduce((sum, item) => sum + item.channels.direct, 0) / rangeData.length

  const currentMax = Math.max(avgOnline, avgOffline, avgAgent, avgDirect)

  // 🔥 关键修复：将动态计算出的 max 值向上取整到一个更“漂亮”的数字
  // 例如，如果 max 是 128，我们把它变成 150
  // 如果 max 是 83，我们把它变成 100
  let maxValue = 100 // 默认一个最小值
  if (currentMax > 0) {
    // 找到数量级 (10, 100, 1000...)
    const orderOfMagnitude = Math.pow(10, Math.floor(Math.log10(currentMax)))
    // 向上取整到该数量级的一半
    maxValue = Math.ceil(currentMax / (orderOfMagnitude / 2)) * (orderOfMagnitude / 2)
  }
  return {
    title: {
      text: '渠道分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item' as const,
    },
    legend: {
      show: false,
    },
    radar: {
      indicator: [
        { name: '线上', max: maxValue },
        { name: '线下', max: maxValue },
        { name: '代理', max: maxValue },
        { name: '直销', max: maxValue },
      ],
      center: ['50%', '60%'],
      radius: '60%',
    },
    series: [
      {
        name: '渠道分布',
        type: 'radar' as const,
        data: [
          {
            value: [avgOnline, avgOffline, avgAgent, avgDirect],
            name: '平均销售额',
            areaStyle: {
              opacity: 0.3,
            },
          },
        ],
      },
    ],
  }
})

// 右下角：堆叠面积图（销售详情）
const areaChartOption = ref<any>({
  title: {
    text: '各产品销售详情',
    left: 'center',
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'cross' as const,
    },
    // 🔥 关键修复 1：添加 position 函数
    // 告诉 tooltip 如何智能地定位自己，防止超出边界
    position: (pos: any, params: any, dom: any, rect: any, size: any) => {
      const obj: Record<string, number> = { top: 60 } // 默认顶部位置
      // size.viewSize[0] 是图表容器的宽度
      // pos[0] 是 tooltip 的默认 x 坐标
      // size.contentSize[0] 是 tooltip 自身的宽度
      // 如果 tooltip 的右侧超出了容器边界，就把它定位到鼠标左侧
      if (pos[0] + size.contentSize[0] > size.viewSize[0]) {
        obj.left = pos[0] - size.contentSize[0] - 20 // 减去自身宽度，并留出一些间距
      } else {
        obj.left = pos[0] + 20 // 否则定位到鼠标右侧
      }
      return obj
    },
  },
  legend: {
    data: ['手机', '电脑', '配件'],
    top: 30,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    boundaryGap: true,
    data: rawSalesData.map(item => item.month),
  },
  yAxis: {
    type: 'value' as const,
    name: '销售额（万元）',
  },
  dataZoom: [
    {
      type: 'slider' as const,
      show: true,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      bottom: 10,
    },
    {
      // 鼠标滚轮缩放 dataZoom
      type: 'inside' as const,
      xAxisIndex: [0],
      zoomOnMouseWheel: true,
      moveOnMouseWheel: false,
    },
  ],
  series: [
    {
      name: '手机',
      type: 'line' as const,
      stack: 'total',
      areaStyle: {},
      data: rawSalesData.map(item => item.products.phone),
      smooth: true,
    },
    {
      name: '电脑',
      type: 'line' as const,
      stack: 'total',
      areaStyle: {},
      data: rawSalesData.map(item => item.products.computer),
      smooth: true,
    },
    {
      name: '配件',
      type: 'line' as const,
      stack: 'total',
      areaStyle: {},
      data: rawSalesData.map(item => item.products.accessory),
      smooth: true,
    },
  ],
})

// 图表引用
const mainChartRef = ref()
const pieChartRef = ref()
const radarChartRef = ref()
const areaChartRef = ref()

// 将主图表的高亮同步到其他图表（当前主要同步到面积图）
const syncHighlight = (dataIndex: number) => {
  const areaInstance = areaChartRef.value?.getEchartsInstance?.()
  if (areaInstance) {
    isSyncingHighlight = true
    areaInstance.dispatchAction({
      type: 'showTip',
      xAxisIndex: 0,
      seriesIndex: 0,
      dataIndex,
    })
    isSyncingHighlight = false
  }
}

// 将面积图的高亮同步到主图
const syncMainHighlight = (dataIndex: number) => {
  const mainInstance = mainChartRef.value?.getEchartsInstance?.()
  if (mainInstance) {
    isSyncingHighlight = true
    mainInstance.dispatchAction({
      type: 'showTip',
      xAxisIndex: 0,
      seriesIndex: 0,
      dataIndex,
    })
    isSyncingHighlight = false
  }
}

// 清理两个图表上的 tooltip / 轴指示器
const clearAllHighlights = () => {
  const mainInstance = mainChartRef.value?.getEchartsInstance?.()
  const areaInstance = areaChartRef.value?.getEchartsInstance?.()

  mainInstance?.dispatchAction({
    type: 'hideTip',
  })
  mainInstance?.dispatchAction({
    type: 'updateAxisPointer',
    currTrigger: 'leave',
  })

  areaInstance?.dispatchAction({
    type: 'hideTip',
  })
  areaInstance?.dispatchAction({
    type: 'updateAxisPointer',
    currTrigger: 'leave',
  })
}

// 在多个图表之间同步图例选择（这里主要在饼图和面积图之间）
const bindLegendSync = (source: any, targets: any[]) => {
  if (!source) {
    return
  }
  source.on('legendselectchanged', (params: any) => {
    const actionType = params.selected[params.name] ? 'legendSelect' : 'legendUnSelect'
    targets.forEach(target => {
      if (!target) {
        return
      }
      target.dispatchAction({
        type: actionType,
        name: params.name,
      })
    })
  })
}

// dataZoom 联动时的重入保护，避免相互触发造成死循环
let isSyncingDataZoom = false
// 高亮联动时的重入保护，避免相互触发造成死循环
let isSyncingHighlight = false

/**
 * 从 dataZoom 事件参数中提取 start/end
 * 兼容滑块拖拽(start/end) 和 鼠标滚轮(batch[0].start/end) 两种形式
 */
const extractDataZoomRange = (params: any): { start: number; end: number } | null => {
  if (params && params.start !== undefined && params.end !== undefined) {
    return {
      start: params.start,
      end: params.end,
    }
  }

  const batchItem = Array.isArray(params?.batch) ? params.batch[0] : null
  if (batchItem && batchItem.start !== undefined && batchItem.end !== undefined) {
    return {
      start: batchItem.start,
      end: batchItem.end,
    }
  }

  return null
}

/**
 * 从 updateAxisPointer / mouseover 事件中提取当前 dataIndex
 */
const extractHoverDataIndex = (event: any): number | undefined => {
  if (typeof event?.dataIndex === 'number') {
    return event.dataIndex
  }

  const axisInfo = Array.isArray(event?.axesInfo) ? event.axesInfo[0] : undefined
  if (typeof axisInfo?.dataIndex === 'number') {
    return axisInfo.dataIndex
  }

  return undefined
}

// 监听图表事件，实现 dataZoom、highlight、legend 联动
onMounted(() => {
  // 使用 setTimeout 确保图表已初始化
  setTimeout(() => {
    const mainInstance = mainChartRef.value?.getEchartsInstance?.()
    const pieInstance = pieChartRef.value?.getEchartsInstance?.()
    const radarInstance = radarChartRef.value?.getEchartsInstance?.()
    const areaInstance = areaChartRef.value?.getEchartsInstance?.()

    // 主图 & 面积图：dataZoom 双向联动 + 高亮联动
    if (mainInstance && areaInstance) {
      // 主图 dataZoom 改变时，更新全局范围，并同步到面积图
      mainInstance.on('datazoom', (params: any) => {
        if (isSyncingDataZoom) {
          return
        }
        const range = extractDataZoomRange(params)
        if (!range) {
          return
        }

        isSyncingDataZoom = true
        // 更新全局范围，驱动饼图和雷达图
        dataZoomRange.value = {
          start: range.start,
          end: range.end,
        }
        // 同步到面积图
        areaInstance.dispatchAction({
          type: 'dataZoom',
          start: range.start,
          end: range.end,
        })
        isSyncingDataZoom = false
      })

      // 面积图 dataZoom 改变时，同步到主图
      areaInstance.on('datazoom', (params: any) => {
        if (isSyncingDataZoom) {
          return
        }
        const range = extractDataZoomRange(params)
        if (!range) {
          return
        }

        isSyncingDataZoom = true
        // 更新全局范围，驱动饼图和雷达图
        dataZoomRange.value = {
          start: range.start,
          end: range.end,
        }
        // 同步到主图
        mainInstance.dispatchAction({
          type: 'dataZoom',
          start: range.start,
          end: range.end,
        })
        isSyncingDataZoom = false
      })

      // 主图轴指示器变更时，高亮面积图对应月份（兼容鼠标移动和联动场景）
      // 注意：事件名区分大小写，应为 'updateAxisPointer'
      mainInstance.on('updateAxisPointer', (event: any) => {
        const dataIndex = extractHoverDataIndex(event)
        if (typeof dataIndex === 'number') {
          syncHighlight(dataIndex)
        }
      })

      // 兼容性：主图 mouseover 时也触发一次高亮（保证某些情况下仍能联动）
      mainInstance.on('mouseover', (params: any) => {
        if (typeof params.dataIndex === 'number') {
          syncHighlight(params.dataIndex)
        }
      })

      // 主图鼠标移出时，隐藏面积图中的 tooltip
      mainInstance.on('globalout', () => {
        clearAllHighlights()
      })
      // 主图 mouseout 时也隐藏一次，避免局部移出未触发 globalout 的情况
      mainInstance.on('mouseout', () => {
        clearAllHighlights()
      })

      // 面积图轴指示器变更时，高亮主图对应月份
      // 注意：事件名区分大小写，应为 'updateAxisPointer'
      // 面积图轴指示器变更时，高亮主图对应月份
      areaInstance.on('updateAxisPointer', (event: any) => {
        if (isSyncingHighlight) {
          return
        }
        const dataIndex = extractHoverDataIndex(event)
        if (typeof dataIndex === 'number') {
          syncMainHighlight(dataIndex)
        }
      })

      // 兼容性：面积图 mouseover 时也触发一次高亮
      areaInstance.on('mouseover', (params: any) => {
        if (isSyncingHighlight) {
          return
        }
        if (typeof params.dataIndex === 'number') {
          syncMainHighlight(params.dataIndex)
        }
      })

      // 面积图鼠标移出时，隐藏主图中的 tooltip
      areaInstance.on('globalout', () => {
        clearAllHighlights()
      })
      // 面积图 mouseout 时也隐藏一次，避免局部移出未触发 globalout 的情况
      areaInstance.on('mouseout', () => {
        clearAllHighlights()
      })
    }

    // 饼图和面积图之间的图例联动（打开/关闭系列同步）
    if (pieInstance && areaInstance) {
      bindLegendSync(pieInstance, [areaInstance])
      bindLegendSync(areaInstance, [pieInstance])
    }

    // 雷达图目前只参与数据展示，如需更多联动可在此扩展
    if (radarInstance) {
      // 预留扩展点
      void radarInstance
    }

    // 主图轴指示器变更时，高亮面积图对应月份
    mainInstance.on('updateAxisPointer', (event: any) => {
      if (isSyncingHighlight) {
        return
      }
      const dataIndex = extractHoverDataIndex(event)
      if (typeof dataIndex === 'number') {
        syncHighlight(dataIndex)
      }
    })

    // 兼容性：主图 mouseover 时也触发一次高亮
    mainInstance.on('mouseover', (params: any) => {
      if (isSyncingHighlight) {
        return
      }
      if (typeof params.dataIndex === 'number') {
        syncHighlight(params.dataIndex)
      }
    })
  }, 500)
})
</script>

<template lang="pug">
.full.between-col.gap-gapl
  .grid.grid-cols-1.gap-gap(class='lg:grid-cols-2')
    //- 左上角：主图表
    .c-card.p-padding
      UseEcharts(
        height='400px',
        ref='mainChartRef',
        :option='mainChartOption',
        :group='LINKAGE_GROUP_ID',
        :connect-config='{ enabled: true, dataZoomSync: true, legendSync: true }'
      )

    //- 右上角：饼图
    .c-card.p-padding
      UseEcharts(
        height='400px',
        ref='pieChartRef',
        :option='pieChartOption',
        :group='LINKAGE_GROUP_ID',
        :connect-config='{ enabled: true, legendSync: true }'
      )

    //- 左下角：雷达图
    .c-card.p-padding
      UseEcharts(
        height='400px',
        ref='radarChartRef',
        :option='radarChartOption',
        :group='LINKAGE_GROUP_ID',
        :connect-config='{ enabled: true }'
      )

    //- 右下角：堆叠面积图
    .c-card.p-padding
      UseEcharts(
        height='400px',
        ref='areaChartRef',
        :option='areaChartOption',
        :group='LINKAGE_GROUP_ID',
        :connect-config='{ enabled: true, dataZoomSync: true, legendSync: true }'
      )
  .p-padding
    b.fs-appFontSizex 此示例展示了四个图表之间的联动效果：
    ul.appFontSizes
      li
        strong dataZoom 联动：
        | 拖动主图表或面积图的滑块，两个图表的显示范围会同步更新
      li
        strong highlight 联动：
        | 鼠标在主图表上移动时，其他图表会同步高亮对应数据
      li
        strong legend 联动：
        | 点击任意图表的图例，其他图表会同步显示/隐藏对应系列
      li
        strong 动态数据更新：
        | 饼图和雷达图会根据主图表的 dataZoom 范围动态更新数据
</template>

<style lang="scss" scoped></style>
