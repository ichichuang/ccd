<script setup lang="ts">
import { ref } from 'vue'

// 柱状图配置
const barChartOption = ref({
  title: {
    text: '月度销售数据（柱状图）',
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {},
  xAxis: {
    type: 'category' as const,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  yAxis: {
    type: 'value' as const,
    name: '单位/万元',
  },
  series: [
    {
      name: '销售额',
      type: 'bar' as const,
      data: [120, 200, 150, 80, 70, 110, 130, 180, 160, 140, 190, 220],
    },
    {
      name: '利润',
      type: 'bar' as const,
      data: [60, 100, 75, 40, 35, 55, 65, 90, 80, 70, 95, 110],
    },
  ],
})

// 折线图配置
const lineChartOption = ref({
  title: {
    text: '用户增长趋势（折线图）',
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {},
  xAxis: {
    type: 'category' as const,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: {
    type: 'value' as const,
  },
  series: [
    {
      name: '新用户',
      type: 'line' as const,
      data: [120, 132, 101, 134, 90, 230, 210],
    },
    {
      name: '活跃用户',
      type: 'line' as const,
      data: [220, 182, 191, 234, 290, 330, 310],
    },
    {
      name: '总用户',
      type: 'line' as const,
      data: [150, 232, 201, 154, 190, 330, 410],
    },
  ],
})

// 饼图配置
const pieChartOption = ref({
  title: {
    text: '产品市场份额（饼图）',
  },

  legend: {},
  series: [
    {
      name: '市场份额',
      type: 'pie' as const,
      data: [
        { value: 1048, name: '产品A' },
        { value: 735, name: '产品B' },
        { value: 580, name: '产品C' },
        { value: 484, name: '产品D' },
        { value: 300, name: '产品E' },
      ],
    },
  ],
})

// 散点图配置
const scatterChartOption = ref({
  title: {
    text: '身高体重分布（散点图）',
  },
  tooltip: {
    trigger: 'item' as const,
  },
  xAxis: {
    type: 'value' as const,
  },
  yAxis: {
    type: 'value' as const,
  },
  series: [
    {
      name: '男生',
      type: 'scatter' as const,
      data: [
        [161.2, 51.6],
        [167.5, 59.0],
        [159.5, 49.2],
        [157.0, 63.0],
        [155.8, 53.6],
        [170.0, 59.0],
        [159.1, 47.6],
        [166.0, 69.8],
        [176.2, 66.8],
        [160.2, 75.2],
        [172.5, 55.2],
        [170.9, 54.2],
        [172.9, 62.5],
        [153.4, 42.0],
        [160.0, 50.0],
        [147.2, 49.8],
        [168.2, 49.2],
        [175.0, 73.2],
        [157.0, 47.8],
        [167.6, 68.8],
      ],
    },
    {
      name: '女生',
      type: 'scatter' as const,
      data: [
        [137.2, 51.6],
        [150.5, 59.0],
      ],
    },
  ],
})

// 雷达图配置
const radarChartOption = ref({
  color: ['#ec70f8', '#7b7cf9'],
  title: {
    text: '产品性能评估（雷达图）',
  },
  tooltip: {},
  legend: {},
  radar: {
    indicator: [
      { name: '性能', max: 100 },
      { name: '可靠性', max: 100 },
      { name: '易用性', max: 100 },
      { name: '安全性', max: 100 },
      { name: '价格', max: 100 },
    ],
  },
  series: [
    {
      type: 'radar' as const,
      data: [
        {
          value: [80, 90, 70, 85, 60],
          name: '产品A',
        },
        {
          value: [70, 75, 85, 80, 85],
          name: '产品B',
        },
      ],
    },
  ],
})

// 漏斗图配置
const funnelChartOption = ref({
  title: {
    text: '销售转化漏斗（漏斗图）',
  },
  tooltip: {
    trigger: 'item' as const,
  },
  legend: {},
  series: [
    {
      type: 'funnel' as const,
      data: [
        { value: 100, name: '展示' },
        { value: 80, name: '点击' },
        { value: 60, name: '访问' },
        { value: 40, name: '咨询' },
        { value: 20, name: '订单' },
      ],
    },
  ],
})

// 仪表盘配置
const gaugeChartOption = ref({
  title: {
    text: '任务完成度（仪表盘）',
  },
  series: [
    {
      type: 'gauge' as const,
      data: [
        {
          value: 75.5,
          name: '完成率',
        },
      ],
    },
  ],
})

// K线图配置
const candlestickChartOption = ref({
  title: {
    text: '股票价格走势（K线图）',
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  xAxis: {
    type: 'category' as const,
    data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
  },
  yAxis: {
    type: 'value' as const,
  },
  series: [
    {
      type: 'candlestick' as const,
      data: [
        [20, 34, 10, 38],
        [40, 35, 30, 50],
        [31, 38, 33, 44],
        [38, 15, 5, 42],
        [14, 30, 14, 35],
        [30, 45, 28, 50],
      ],
    },
  ],
})

// 热力图配置
const heatmapChartOption = ref({
  title: {
    text: '每周活跃时段（热力图）',
  },
  tooltip: {},
  xAxis: {
    type: 'category' as const,
    data: [
      '0时',
      '2时',
      '4时',
      '6时',
      '8时',
      '10时',
      '12时',
      '14时',
      '16时',
      '18时',
      '20时',
      '22时',
    ],
  },
  yAxis: {
    type: 'category' as const,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  visualMap: {
    min: 0,
    max: 100,
  },
  series: [
    {
      type: 'heatmap' as const,
      data: [
        [0, 0, 5],
        [1, 0, 10],
        [2, 0, 8],
        [3, 0, 15],
        [4, 0, 20],
        [5, 0, 35],
        [6, 0, 50],
        [7, 0, 70],
        [8, 0, 80],
        [9, 0, 60],
        [10, 0, 45],
        [11, 0, 30],
        [0, 1, 8],
        [1, 1, 12],
        [2, 1, 10],
        [3, 1, 18],
        [4, 1, 25],
        [5, 1, 40],
        [6, 1, 55],
        [7, 1, 75],
        [8, 1, 85],
        [9, 1, 65],
        [10, 1, 50],
        [11, 1, 35],
        [0, 2, 6],
        [1, 2, 11],
        [2, 2, 9],
        [3, 2, 16],
        [4, 2, 22],
        [5, 2, 38],
        [6, 2, 52],
        [7, 2, 72],
        [8, 2, 82],
        [9, 2, 62],
        [10, 2, 48],
        [11, 2, 32],
        [0, 3, 7],
        [1, 3, 13],
        [2, 3, 11],
        [3, 3, 19],
        [4, 3, 28],
        [5, 3, 42],
        [6, 3, 58],
        [7, 3, 78],
        [8, 3, 88],
        [9, 3, 68],
        [10, 3, 52],
        [11, 3, 38],
        [0, 4, 9],
        [1, 4, 14],
        [2, 4, 12],
        [3, 4, 20],
        [4, 4, 30],
        [5, 4, 45],
        [6, 4, 60],
        [7, 4, 80],
        [8, 4, 90],
        [9, 4, 70],
        [10, 4, 55],
        [11, 4, 40],
        [0, 5, 15],
        [1, 5, 25],
        [2, 5, 22],
        [3, 5, 35],
        [4, 5, 48],
        [5, 5, 65],
        [6, 5, 75],
        [7, 5, 90],
        [8, 5, 95],
        [9, 5, 85],
        [10, 5, 70],
        [11, 5, 55],
        [0, 6, 12],
        [1, 6, 20],
        [2, 6, 18],
        [3, 6, 28],
        [4, 6, 40],
        [5, 6, 55],
        [6, 6, 68],
        [7, 6, 85],
        [8, 6, 92],
        [9, 6, 78],
        [10, 6, 62],
        [11, 6, 48],
      ],
    },
  ],
})

// 桑基图配置
const sankeyChartOption = ref({
  title: {
    text: '能量流向图（桑基图）',
  },
  tooltip: {},
  series: [
    {
      type: 'sankey' as const,
      data: [
        { name: '能源A' },
        { name: '能源B' },
        { name: '转换1' },
        { name: '转换2' },
        { name: '使用1' },
        { name: '使用2' },
        { name: '使用3' },
      ],
      links: [
        { source: '能源A', target: '转换1', value: 5 },
        { source: '能源A', target: '转换2', value: 3 },
        { source: '能源B', target: '转换1', value: 8 },
        { source: '转换1', target: '使用1', value: 6 },
        { source: '转换1', target: '使用2', value: 7 },
        { source: '转换2', target: '使用2', value: 1 },
        { source: '转换2', target: '使用3', value: 2 },
      ],
    },
  ],
})

// 箱型图配置
const boxplotChartOption = ref({
  title: {
    text: '数据分布情况（箱型图）',
  },
  tooltip: {},
  xAxis: {
    type: 'category' as const,
    data: ['A组', 'B组', 'C组', 'D组', 'E组'],
  },
  yAxis: {
    type: 'value' as const,
  },
  series: [
    {
      type: 'boxplot' as const,
      data: [
        [850, 740, 900, 1070, 930],
        [960, 940, 960, 980, 960],
        [880, 880, 880, 880, 880],
        [890, 810, 810, 820, 800],
        [960, 1060, 960, 960, 1060],
      ],
    },
  ],
})

// 旭日图配置
const sunburstChartOption = ref({
  title: {
    text: '层级数据结构（旭日图）',
  },
  tooltip: {},
  series: [
    {
      type: 'sunburst' as const,
      data: [
        {
          name: 'A',
          value: 10,
          children: [
            {
              name: 'A-1',
              value: 3,
              children: [
                { name: 'A-1-a', value: 1 },
                { name: 'A-1-b', value: 2 },
              ],
            },
            {
              name: 'A-2',
              value: 7,
              children: [
                { name: 'A-2-a', value: 4 },
                { name: 'A-2-b', value: 3 },
              ],
            },
          ],
        },
        {
          name: 'B',
          value: 8,
          children: [
            { name: 'B-1', value: 3 },
            { name: 'B-2', value: 5 },
          ],
        },
      ],
    },
  ],
})

// 主题河流图配置
const themeRiverChartOption = ref({
  title: {
    text: '时序数据演变（主题河流图）',
  },
  tooltip: {},
  singleAxis: {
    type: 'time' as const,
  },
  series: [
    {
      type: 'themeRiver' as const,
      data: [
        ['2024-01-01', 10, '类别A'] as [string, number, string],
        ['2024-02-01', 15, '类别A'] as [string, number, string],
        ['2024-03-01', 35, '类别A'] as [string, number, string],
        ['2024-04-01', 38, '类别A'] as [string, number, string],
        ['2024-05-01', 22, '类别A'] as [string, number, string],
        ['2024-01-01', 35, '类别B'] as [string, number, string],
        ['2024-02-01', 36, '类别B'] as [string, number, string],
        ['2024-03-01', 37, '类别B'] as [string, number, string],
        ['2024-04-01', 22, '类别B'] as [string, number, string],
        ['2024-05-01', 24, '类别B'] as [string, number, string],
        ['2024-01-01', 21, '类别C'] as [string, number, string],
        ['2024-02-01', 25, '类别C'] as [string, number, string],
        ['2024-03-01', 27, '类别C'] as [string, number, string],
        ['2024-04-01', 23, '类别C'] as [string, number, string],
        ['2024-05-01', 24, '类别C'] as [string, number, string],
      ],
    },
  ],
})

// 带波纹动画的散点图配置
const effectScatterChartOption = ref({
  title: {
    text: '城市人口分布（带波纹散点图）',
  },
  tooltip: {
    trigger: 'item' as const,
  },
  legend: {},
  xAxis: {
    type: 'value' as const,
    name: 'GDP（亿元）',
  },
  yAxis: {
    type: 'value' as const,
    name: '人口（万人）',
  },
  series: [
    {
      name: '一线城市',
      type: 'effectScatter' as const,
      data: [
        [120, 200, 2000],
        [200, 300, 3000],
        [150, 250, 2500],
        [180, 280, 2800],
      ],
      symbolSize: (val: number[]) => val[2] / 10,
      showEffectOn: 'render' as const,
      rippleEffect: {
        brushType: 'stroke' as const,
      },
      hoverAnimation: true,
      label: {
        formatter: '{b}',
        position: 'right' as const,
        show: true,
      },
      emphasis: {
        scale: true,
      },
    },
    {
      name: '二线城市',
      type: 'effectScatter' as const,
      data: [
        [80, 150, 800],
        [90, 180, 900],
        [70, 120, 700],
        [85, 160, 850],
      ],
      symbolSize: (val: number[]) => val[2] / 15,
      showEffectOn: 'render' as const,
      rippleEffect: {
        brushType: 'stroke' as const,
      },
      hoverAnimation: true,
      label: {
        formatter: '{b}',
        position: 'right' as const,
        show: true,
      },
      emphasis: {
        scale: true,
      },
    },
  ],
})

// 象形柱图配置
const pictorialBarChartOption = ref({
  title: {
    text: '销售业绩对比（象形柱图）',
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {},
  xAxis: {
    type: 'category' as const,
    data: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
  yAxis: {
    type: 'value' as const,
  },
  series: [
    {
      name: '销售额',
      type: 'pictorialBar' as const,
      symbol: 'rect',
      symbolSize: [20, 4],
      symbolOffset: [0, -2],
      symbolPosition: 'end' as const,
      data: [120, 200, 150, 80],
    },
    {
      name: '利润',
      type: 'pictorialBar' as const,
      symbol: 'rect',
      symbolSize: [20, 4],
      symbolOffset: [0, -2],
      symbolPosition: 'end' as const,
      data: [60, 100, 75, 40],
    },
  ],
})

// 关系图配置
const graphChartOption = ref({
  title: {
    text: '社交网络关系图',
  },
  tooltip: {},
  legend: {},
  series: [
    {
      type: 'graph' as const,
      layout: 'force' as const,
      data: [
        { name: '张三', value: 100, category: 0 },
        { name: '李四', value: 80, category: 0 },
        { name: '王五', value: 60, category: 1 },
        { name: '赵六', value: 90, category: 1 },
        { name: '钱七', value: 70, category: 2 },
        { name: '孙八', value: 85, category: 2 },
      ],
      links: [
        { source: '张三', target: '李四' },
        { source: '张三', target: '王五' },
        { source: '李四', target: '赵六' },
        { source: '王五', target: '钱七' },
        { source: '赵六', target: '孙八' },
        { source: '钱七', target: '孙八' },
      ],
      categories: [{ name: '管理层' }, { name: '技术部' }, { name: '市场部' }],
      roam: true,
      label: {
        show: true,
        position: 'right' as const,
      },
      force: {
        repulsion: 100,
      },
      emphasis: {
        focus: 'adjacency' as const,
        lineStyle: {
          width: 10,
        },
      },
    },
  ],
})

// 树图配置
const treeChartOption = ref({
  title: {
    text: '组织架构图（树图）',
  },
  tooltip: {
    trigger: 'item' as const,
    triggerOn: 'mousemove' as const,
  },
  series: [
    {
      type: 'tree' as const,
      data: [
        {
          name: 'CEO',
          children: [
            {
              name: '技术部',
              children: [{ name: '前端组' }, { name: '后端组' }, { name: '测试组' }],
            },
            {
              name: '市场部',
              children: [{ name: '销售组' }, { name: '推广组' }],
            },
            {
              name: '人事部',
              children: [{ name: '招聘组' }, { name: '培训组' }],
            },
          ],
        },
      ],
      top: '5%',
      left: '7%',
      bottom: '2%',
      right: '20%',
      symbolSize: 7,
      label: {
        position: 'left' as const,
        verticalAlign: 'middle' as const,
        align: 'right' as const,
      },
      leaves: {
        label: {
          position: 'right' as const,
          verticalAlign: 'middle' as const,
          align: 'left' as const,
        },
      },
      emphasis: {
        focus: 'descendant' as const,
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750,
    },
  ],
})

// 矩形树图配置
const treemapChartOption = ref({
  title: {
    text: '销售数据分布（矩形树图）',
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: '{b}: {c}',
  },
  series: [
    {
      type: 'treemap' as const,
      data: [
        {
          name: '华东区',
          value: 1000,
          children: [
            { name: '上海', value: 400 },
            { name: '杭州', value: 300 },
            { name: '南京', value: 300 },
          ],
        },
        {
          name: '华北区',
          value: 800,
          children: [
            { name: '北京', value: 500 },
            { name: '天津', value: 200 },
            { name: '石家庄', value: 100 },
          ],
        },
        {
          name: '华南区',
          value: 600,
          children: [
            { name: '广州', value: 300 },
            { name: '深圳', value: 200 },
            { name: '珠海', value: 100 },
          ],
        },
        {
          name: '西南区',
          value: 400,
          children: [
            { name: '成都', value: 200 },
            { name: '重庆', value: 150 },
            { name: '昆明', value: 50 },
          ],
        },
      ],
      roam: false,
      nodeClick: 'zoomToNode' as const,
      breadcrumb: {
        show: true,
      },
      label: {
        show: true,
        formatter: '{b}',
      },
      upperLabel: {
        show: true,
        height: 30,
      },
      emphasis: {
        focus: 'self' as const,
      },
    },
  ],
})

// 平行坐标图配置
const parallelChartOption = ref({
  title: {
    text: '汽车性能对比（平行坐标图）',
  },
  tooltip: {
    trigger: 'item' as const,
  },
  legend: {},
  parallelAxis: [
    { dim: 0, name: '价格（万元）' },
    { dim: 1, name: '油耗（L/100km）' },
    { dim: 2, name: '功率（马力）' },
    { dim: 3, name: '加速（秒）' },
    { dim: 4, name: '舒适度' },
  ],
  series: [
    {
      type: 'parallel' as const,
      data: [
        [12, 6.5, 150, 8.5, 8],
        [15, 7.2, 180, 7.8, 9],
        [18, 8.1, 200, 7.2, 7],
        [22, 9.5, 250, 6.8, 9],
        [25, 10.2, 300, 6.2, 8],
        [30, 12.5, 350, 5.8, 10],
      ],
      lineStyle: {
        width: 2,
        opacity: 0.7,
      },
      emphasis: {
        focus: 'series' as const,
        lineStyle: {
          width: 4,
          opacity: 1,
        },
      },
    },
  ],
})

// 线图层配置
const linesChartOption = ref({
  title: {
    text: '线图层配置',
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  // cartesian2d 需要提供 xAxis 和 yAxis
  xAxis: { type: 'value' as const },
  yAxis: { type: 'value' as const },
  series: [
    {
      type: 'lines' as const,
      coordinateSystem: 'cartesian2d' as const,
      data: [
        {
          coords: [
            [100, 100],
            [200, 150],
          ],
        },
        {
          coords: [
            [150, 120],
            [250, 180],
          ],
        },
        {
          coords: [
            [120, 140],
            [220, 200],
          ],
        },
        {
          coords: [
            [180, 110],
            [280, 160],
          ],
        },
      ],
      effect: {
        show: true,
        period: 6,
        trailLength: 0.7,
        symbolSize: 3,
      },
      lineStyle: {
        width: 1,
        opacity: 0.4,
        curveness: 0.3,
      },
    },
    {
      type: 'scatter' as const,
      coordinateSystem: 'cartesian2d' as const,
      data: [
        [100, 100, '北京'],
        [200, 150, '上海'],
        [150, 120, '广州'],
        [250, 180, '深圳'],
        [120, 140, '杭州'],
        [220, 200, '南京'],
        [180, 110, '成都'],
        [280, 160, '重庆'],
      ],
      symbolSize: 8,
      label: {
        show: true,
        formatter: '{c}',
        position: 'top' as const,
      },
    },
  ],
})
</script>

<template lang="pug">
.p-paddingl.bg-bg200
  .grid.grid-cols-1.gap-gap(class='lg:grid-cols-2 xl:grid-cols-3')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='barChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='lineChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='pieChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='scatterChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='radarChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='funnelChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='gaugeChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='candlestickChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='heatmapChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='sankeyChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='boxplotChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='sunburstChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='themeRiverChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='effectScatterChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='pictorialBarChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='graphChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='treeChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='treemapChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='parallelChartOption')
    UseEcharts.bg-bg100.rounded-rounded.p-padding(:option='linesChartOption')
</template>
