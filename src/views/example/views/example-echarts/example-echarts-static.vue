<script setup lang="ts">
import { useColorStore } from '@/stores'
import { computed } from 'vue'
const colorStore = useColorStore()
// 获取主题颜色
const accent100 = computed(() => colorStore.getAccent100)
const textColor100 = computed(() => colorStore.getText100)
const textColor200 = computed(() => colorStore.getText200)
const bgColor200 = computed(() => colorStore.getBg200)
const bgColor300 = computed(() => colorStore.getBg300)

// 柱状图配置 - 静态样式展示
const barChartOption = computed(() => ({
  title: {
    text: '月度销售数据（柱状图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'shadow' as const,
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '16%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: {
      lineStyle: {
        width: 2,
      },
    },
    axisTick: {
      alignWithLabel: true,
    },
    axisLabel: {
      color: textColor200.value,
      rotate: 0,
    },
  },
  yAxis: {
    type: 'value' as const,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
      formatter: '{value}万',
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        type: 'dashed' as const,
      },
    },
  },
  dataZoom: [
    {
      type: 'slider' as const,
      show: true,
      xAxisIndex: [0],
      bottom: 10,
      height: 20,
      borderColor: textColor200.value,
      fillerColor: '#87afff20',
      handleStyle: {
        color: '#ff6b6b',
      },
    },
  ],
  series: [
    {
      name: '销售额',
      type: 'bar' as const,
      data: [120, 200, 150, 80, 70, 110, 130, 180, 160, 140, 190, 220],
      itemStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#87afff' },
            { offset: 1, color: '#5470c6' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
        shadowBlur: 10,
        shadowColor: '#87afff30',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markPoint: {
        data: [
          { type: 'max' as const, name: '最大值' },
          { type: 'min' as const, name: '最小值' },
        ],
        itemStyle: {
          color: '#ff6b6b',
        },
        label: {
          color: textColor100.value,
        },
      },
      markLine: {
        data: [{ type: 'average' as const, name: '平均值' }],
        lineStyle: {
          color: '#ffa726',
          type: 'dashed' as const,
        },
        label: {
          color: '#ffa726',
        },
      },
      animationDelay: (idx: number) => idx * 100,
    },
    {
      name: '利润',
      type: 'bar' as const,
      data: [60, 100, 75, 40, 35, 55, 65, 90, 80, 70, 95, 110],
      itemStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#ffd93d' },
            { offset: 1, color: '#ff6b6b' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
        shadowBlur: 10,
        shadowColor: '#ffd93d30',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markPoint: {
        data: [
          { type: 'max' as const, name: '最大值' },
          { type: 'min' as const, name: '最小值' },
        ],
        itemStyle: {
          color: '#ff6b6b',
        },
        label: {
          color: textColor100.value,
        },
      },
      animationDelay: (idx: number) => idx * 100 + 50,
    },
  ],
}))

// 折线图配置 - 静态样式展示
const lineChartOption = computed(() => ({
  title: {
    text: '用户增长趋势（折线图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'cross' as const,
      crossStyle: {
        color: '#ffa726',
      },
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '16%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      alignWithLabel: true,
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
  },
  yAxis: {
    type: 'value' as const,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
      formatter: '{value}人',
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        type: 'dashed' as const,
      },
    },
  },
  dataZoom: [
    {
      type: 'inside' as const,
      xAxisIndex: [0],
      start: 0,
      end: 100,
    },
    {
      type: 'slider' as const,
      show: true,
      xAxisIndex: [0],
      bottom: 10,
      height: 20,
      borderColor: textColor200.value,
      fillerColor: '#87afff20',
      handleStyle: {
        color: '#ff6b6b',
      },
    },
  ],
  series: [
    {
      name: '新用户',
      type: 'line' as const,
      data: [120, 132, 101, 134, 90, 230, 210],
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#87afff' },
            { offset: 1, color: '#5470c6' },
          ],
        },
      },
      itemStyle: {
        color: '#ff6b6b',
        borderColor: textColor100.value,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#87afff30',
      },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: accent100.value + '30' },
            { offset: 1, color: accent100.value + '05' },
          ],
        },
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markPoint: {
        data: [
          { type: 'max' as const, name: '最大值' },
          { type: 'min' as const, name: '最小值' },
        ],
        itemStyle: {
          color: '#ff6b6b',
        },
        label: {
          color: textColor100.value,
        },
      },
      markLine: {
        data: [{ type: 'average' as const, name: '平均值' }],
        lineStyle: {
          color: '#ffa726',
          type: 'dashed' as const,
        },
        label: {
          color: '#ffa726',
        },
      },
      animationDelay: (idx: number) => idx * 100,
    },
    {
      name: '活跃用户',
      type: 'line' as const,
      data: [220, 182, 191, 234, 290, 330, 310],
      smooth: true,
      symbol: 'rect',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#ffd93d' },
            { offset: 1, color: '#ff6b6b' },
          ],
        },
      },
      itemStyle: {
        color: '#ff6b6b',
        borderColor: textColor100.value,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#87afff30',
      },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: accent100.value + '30' },
            { offset: 1, color: accent100.value + '05' },
          ],
        },
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markPoint: {
        data: [
          { type: 'max' as const, name: '最大值' },
          { type: 'min' as const, name: '最小值' },
        ],
        itemStyle: {
          color: '#ff6b6b',
        },
        label: {
          color: textColor100.value,
        },
      },
      animationDelay: (idx: number) => idx * 100 + 50,
    },
    {
      name: '总用户',
      type: 'line' as const,
      data: [150, 232, 201, 154, 190, 330, 410],
      smooth: true,
      symbol: 'diamond',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#4ecdc4' },
            { offset: 1, color: '#26a69a' },
          ],
        },
      },
      itemStyle: {
        color: '#ffa726',
        borderColor: textColor100.value,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#87afff30',
      },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: accent100.value + '30' },
            { offset: 1, color: accent100.value + '05' },
          ],
        },
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markPoint: {
        data: [
          { type: 'max' as const, name: '最大值' },
          { type: 'min' as const, name: '最小值' },
        ],
        itemStyle: {
          color: '#ff6b6b',
        },
        label: {
          color: textColor100.value,
        },
      },
      animationDelay: (idx: number) => idx * 100 + 100,
    },
  ],
}))

// 饼图配置 - 静态样式展示
const pieChartOption = computed(() => ({
  title: {
    text: '产品市场份额（饼图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: '{a} <br/>{b}: {c} ({d}%)',
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
    formatter: (name: string) => {
      const data = [
        { value: 1048, name: '产品A' },
        { value: 735, name: '产品B' },
        { value: 580, name: '产品C' },
        { value: 484, name: '产品D' },
        { value: 300, name: '产品E' },
      ]
      const item = data.find(d => d.name === name)
      return item ? `${name} (${item.value})` : name
    },
  },
  series: [
    {
      name: '市场份额',
      type: 'pie' as const,
      radius: ['40%', '70%'],
      center: ['50%', '60%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: textColor100.value,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: textColor200.value + '10',
      },
      label: {
        show: true,
        position: 'outside' as const,
        formatter: '{b}\n{d}%',
        fontSize: 12,
        fontWeight: 'bold' as const,
        color: '#ff6b6b',
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10,
        lineStyle: {
          color: '#ffa726',
          width: 1,
        },
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowColor: textColor200.value + '20',
        },
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold' as const,
        },
      },
      data: [
        {
          value: 1048,
          name: '产品A',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#87afff' },
                { offset: 1, color: '#5470c6' },
              ],
            },
          },
        },
        {
          value: 735,
          name: '产品B',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#ffd93d' },
                { offset: 1, color: '#ff6b6b' },
              ],
            },
          },
        },
        {
          value: 580,
          name: '产品C',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#4ecdc4' },
                { offset: 1, color: '#26a69a' },
              ],
            },
          },
        },
        {
          value: 484,
          name: '产品D',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#ffa726' },
                { offset: 1, color: '#ff7043' },
              ],
            },
          },
        },
        {
          value: 300,
          name: '产品E',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#ab47bc' },
                { offset: 1, color: '#7b1fa2' },
              ],
            },
          },
        },
      ],
      animationType: 'scale' as const,
      animationEasing: 'elasticOut' as const,
      animationDelay: (_idx: number) => Math.random() * 200,
    },
  ],
}))

// 散点图配置 - 静态样式展示
const scatterChartOption = computed(() => ({
  title: {
    text: '身高体重分布（散点图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: (params: any) => {
      return `${params.seriesName}<br/>身高: ${params.data[0]}cm<br/>体重: ${params.data[1]}kg`
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
  },
  grid: {
    left: '3%',
    right: '10%',
    bottom: '24%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'value' as const,
    name: '身高 (cm)',
    nameLocation: 'middle' as const,
    nameGap: 30,
    nameTextStyle: {
      color: textColor200.value,
      fontSize: 12,
    },
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        type: 'dashed' as const,
      },
    },
  },
  yAxis: {
    type: 'value' as const,
    name: '体重 (kg)',
    nameLocation: 'middle' as const,
    nameGap: 50,
    nameTextStyle: {
      color: textColor200.value,
      fontSize: 12,
    },
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        type: 'dashed' as const,
      },
    },
  },
  dataZoom: [
    {
      type: 'slider' as const,
      show: true,
      xAxisIndex: [0],
      bottom: 10,
      height: 20,
      borderColor: textColor200.value,
      fillerColor: '#87afff20',
      handleStyle: {
        color: '#ff6b6b',
      },
    },
    {
      type: 'slider' as const,
      show: true,
      yAxisIndex: [0],
      right: 10,
      width: 20,
      borderColor: textColor200.value,
      fillerColor: '#87afff20',
      handleStyle: {
        color: '#ff6b6b',
      },
    },
  ],
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
      symbolSize: (data: number[]) => {
        const height = data[0]
        const weight = data[1]
        const bmi = weight / Math.pow(height / 100, 2)
        return Math.max(8, Math.min(20, bmi * 2))
      },
      itemStyle: {
        color: {
          type: 'radial' as const,
          x: 0.5,
          y: 0.5,
          r: 0.5,
          colorStops: [
            { offset: 0, color: '#87afff' },
            { offset: 1, color: '#5470c6' },
          ],
        },
        borderColor: textColor100.value,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#87afff30',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markLine: {
        data: [
          {
            type: 'average' as const,
            name: '平均值',
            lineStyle: {
              color: '#ffa726',
              type: 'dashed' as const,
            },
            label: {
              color: '#ffa726',
            },
          },
        ],
      },
      animationDelay: (idx: number) => idx * 50,
    },
    {
      name: '女生',
      type: 'scatter' as const,
      data: [
        [137.2, 51.6],
        [150.5, 59.0],
      ],
      symbolSize: (data: number[]) => {
        const height = data[0]
        const weight = data[1]
        const bmi = weight / Math.pow(height / 100, 2)
        return Math.max(8, Math.min(20, bmi * 2))
      },
      itemStyle: {
        color: {
          type: 'radial' as const,
          x: 0.5,
          y: 0.5,
          r: 0.5,
          colorStops: [
            { offset: 0, color: '#ffd93d' },
            { offset: 1, color: '#ff6b6b' },
          ],
        },
        borderColor: textColor100.value,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#ffd93d30',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markLine: {
        data: [
          {
            type: 'average' as const,
            name: '平均值',
            lineStyle: {
              color: '#ffa726',
              type: 'dashed' as const,
            },
            label: {
              color: '#ffa726',
            },
          },
        ],
      },
      animationDelay: (idx: number) => idx * 50 + 100,
    },
  ],
}))

// 雷达图配置 - 静态样式展示
const radarChartOption = computed(() => ({
  title: {
    text: '产品性能评估（雷达图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'item' as const,
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
  },
  radar: {
    center: ['50%', '60%'],
    radius: '60%',
    indicator: [
      { name: '性能', max: 100 },
      { name: '可靠性', max: 100 },
      { name: '易用性', max: 100 },
      { name: '安全性', max: 100 },
      { name: '价格', max: 100 },
    ],
    axisName: {
      color: textColor200.value,
      fontSize: 12,
      fontWeight: 'bold' as const,
    },
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 1,
      },
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        width: 1,
      },
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: ['#87afff10', '#87afff05'],
      },
    },
  },
  series: [
    {
      type: 'radar' as const,
      data: [
        {
          value: [80, 90, 70, 85, 60],
          name: '产品A',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#87afff' },
                { offset: 1, color: '#5470c6' },
              ],
            },
          },
          lineStyle: {
            color: '#5470c6',
            width: 3,
          },
          areaStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: accent100.value + '30' },
                { offset: 1, color: accent100.value + '05' },
              ],
            },
          },
          symbol: 'circle',
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: '#87afff50',
            },
          },
        },
        {
          value: [70, 75, 85, 80, 85],
          name: '产品B',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#ffd93d' },
                { offset: 1, color: '#ff6b6b' },
              ],
            },
          },
          lineStyle: {
            color: '#ff6b6b',
            width: 3,
          },
          areaStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: accent100.value + '30' },
                { offset: 1, color: accent100.value + '05' },
              ],
            },
          },
          symbol: 'rect',
          symbolSize: 8,
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: '#87afff50',
            },
          },
        },
      ],
      animationDelay: (idx: number) => idx * 200,
    },
  ],
}))

// 漏斗图配置 - 静态样式展示
const funnelChartOption = computed(() => ({
  title: {
    text: '销售转化漏斗（漏斗图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: '{a} <br/>{b}: {c}%',
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
  },
  series: [
    {
      name: '转化漏斗',
      type: 'funnel' as const,
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: 100,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending' as const,
      gap: 2,
      label: {
        show: true,
        position: 'inside' as const,
        formatter: '{b}\n{c}%',
        fontSize: 12,
        fontWeight: 'bold' as const,
        color: textColor100.value,
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid' as const,
        },
      },
      itemStyle: {
        borderColor: textColor100.value,
        borderWidth: 1,
        shadowBlur: 10,
        shadowColor: textColor200.value + '10',
      },
      emphasis: {
        label: {
          fontSize: 14,
        },
        itemStyle: {
          shadowBlur: 20,
          shadowColor: textColor200.value + '20',
        },
      },
      data: [
        {
          value: 100,
          name: '展示',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#87afff' },
                { offset: 1, color: '#5470c6' },
              ],
            },
          },
        },
        {
          value: 80,
          name: '点击',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#ffd93d' },
                { offset: 1, color: '#ff6b6b' },
              ],
            },
          },
        },
        {
          value: 60,
          name: '访问',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#4ecdc4' },
                { offset: 1, color: '#26a69a' },
              ],
            },
          },
        },
        {
          value: 40,
          name: '咨询',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#ffa726' },
                { offset: 1, color: '#ff7043' },
              ],
            },
          },
        },
        {
          value: 20,
          name: '订单',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#ab47bc' },
                { offset: 1, color: '#7b1fa2' },
              ],
            },
          },
        },
      ],
      animationDelay: (idx: number) => idx * 100,
    },
  ],
}))

// 仪表盘配置 - 静态样式展示
const gaugeChartOption = computed(() => ({
  title: {
    text: '任务完成度（仪表盘）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  series: [
    {
      type: 'gauge' as const,
      center: ['50%', '60%'],
      radius: '80%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 8,
          color: [
            [0.3, accent100.value],
            [0.7, textColor200.value],
            [1, bgColor300.value],
          ] as [number, string][],
        },
      },
      axisTick: {
        distance: -8,
        length: 8,
        lineStyle: {
          color: textColor100.value,
          width: 2,
        },
      },
      splitLine: {
        distance: -12,
        length: 12,
        lineStyle: {
          color: textColor100.value,
          width: 3,
        },
      },
      axisLabel: {
        color: '#ffa726',
        fontSize: 12,
        distance: -20,
        formatter: (value: number) => {
          if (value === 0) {
            return '0'
          }
          if (value === 50) {
            return '50'
          }
          if (value === 100) {
            return '100'
          }
          return ''
        },
      },
      pointer: {
        itemStyle: {
          color: '#ff6b6b',
          shadowBlur: 10,
          shadowColor: '#87afff30',
        },
        length: '80%',
        width: 6,
      },
      title: {
        offsetCenter: [0, '70%'],
        fontSize: 16,
        color: '#ff6b6b',
        fontWeight: 'bold' as const,
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        color: '#ff6b6b',
        fontSize: 24,
        fontWeight: 'bold' as const,
        offsetCenter: [0, '40%'],
      },
      data: [
        {
          value: 75.5,
          name: '完成率',
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: accent100.value },
                { offset: 1, color: textColor200.value },
              ],
            },
          },
        },
      ],
      animationDuration: 2000,
      animationEasing: 'cubicOut' as const,
    },
  ],
}))

// K线图配置 - 静态样式展示
const candlestickChartOption = computed(() => ({
  title: {
    text: '股票价格走势（K线图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'cross' as const,
    },
    formatter: (params: any) => {
      const data = params[0].data
      return `日期: ${params[0].axisValue}<br/>开盘: ${data[1]}<br/>收盘: ${data[2]}<br/>最低: ${data[3]}<br/>最高: ${data[4]}`
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',
    top: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    data: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      alignWithLabel: true,
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
  },
  yAxis: {
    type: 'value' as const,
    scale: true,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
      formatter: '{value}元',
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        type: 'dashed' as const,
      },
    },
  },
  dataZoom: [
    {
      type: 'slider' as const,
      show: true,
      xAxisIndex: [0],
      bottom: 10,
      height: 20,
      borderColor: textColor200.value,
      fillerColor: '#87afff20',
      handleStyle: {
        color: '#ff6b6b',
      },
    },
  ],
  series: [
    {
      name: 'K线',
      type: 'candlestick' as const,
      data: [
        [20, 34, 10, 38],
        [40, 35, 30, 50],
        [31, 38, 33, 44],
        [38, 15, 5, 42],
        [14, 30, 14, 35],
        [30, 45, 28, 50],
      ],
      itemStyle: {
        color: '#ff6b6b',
        color0: accent100.value,
        borderColor: textColor200.value,
        borderColor0: accent100.value,
        borderWidth: 1,
      },
      emphasis: {
        itemStyle: {
          color: '#ffa726',
          color0: accent100.value,
          borderColor: textColor200.value,
          borderColor0: accent100.value,
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: textColor200.value + '30',
        },
      },
      markPoint: {
        data: [
          {
            name: '最高点',
            type: 'max' as const,
            valueDim: 'highest' as const,
            itemStyle: {
              color: '#ff6b6b',
            },
            label: {
              color: textColor100.value,
            },
          },
          {
            name: '最低点',
            type: 'min' as const,
            valueDim: 'lowest' as const,
            itemStyle: {
              color: '#ff6b6b',
            },
            label: {
              color: textColor100.value,
            },
          },
        ],
      },
      markLine: {
        data: [
          {
            name: '平均线',
            type: 'average' as const,
            valueDim: 'close' as const,
            lineStyle: {
              color: '#ffa726',
              type: 'dashed' as const,
            },
            label: {
              color: '#ffa726',
            },
          },
        ],
      },
      animationDelay: (idx: number) => idx * 100,
    },
  ],
}))

// 热力图配置 - 静态样式展示
const heatmapChartOption = computed(() => ({
  title: {
    text: '每周活跃时段（热力图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    position: 'top' as const,
    formatter: (params: any) => {
      return `${params.data[1]} ${params.data[0]}时<br/>活跃度: ${params.data[2]}`
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
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
    splitArea: {
      show: true,
    },
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
  },
  yAxis: {
    type: 'category' as const,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    splitArea: {
      show: true,
    },
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
  },
  visualMap: {
    min: 0,
    max: 100,
    left: 'right',
    top: 'center',
    calculable: true,
    orient: 'vertical' as const,
    inRange: {
      color: ['#87afff', '#ffd93d', '#ff6b6b'],
    },
    textStyle: {
      color: textColor200.value,
    },
    formatter: '{value}',
  },
  series: [
    {
      name: '活跃度',
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
      label: {
        show: true,
        color: textColor100.value,
        fontSize: 10,
        fontWeight: 'bold' as const,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: textColor200.value + '50',
        },
      },
      animationDelay: (idx: number) => idx * 10,
    },
  ],
}))

// 桑基图配置 - 静态样式展示
const sankeyChartOption = computed(() => ({
  title: {
    text: '能量流向图（桑基图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: (params: any) => {
      if (params.dataType === 'node') {
        return `${params.data.name}<br/>值: ${params.data.value || 'N/A'}`
      } else {
        return `${params.data.source} → ${params.data.target}<br/>流量: ${params.data.value}`
      }
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  series: [
    {
      name: '能量流向',
      type: 'sankey' as const,
      layout: 'none' as const,
      data: [
        {
          name: '能源A',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#87afff' },
                { offset: 1, color: '#5470c6' },
              ],
            },
          },
        },
        {
          name: '能源B',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#ffd93d' },
                { offset: 1, color: '#ff6b6b' },
              ],
            },
          },
        },
        {
          name: '转换1',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#4ecdc4' },
                { offset: 1, color: '#26a69a' },
              ],
            },
          },
        },
        {
          name: '转换2',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#ffa726' },
                { offset: 1, color: '#ff7043' },
              ],
            },
          },
        },
        {
          name: '使用1',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#ab47bc' },
                { offset: 1, color: '#7b1fa2' },
              ],
            },
          },
        },
        {
          name: '使用2',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#66bb6a' },
                { offset: 1, color: '#388e3c' },
              ],
            },
          },
        },
        {
          name: '使用3',
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#ef5350' },
                { offset: 1, color: '#c62828' },
              ],
            },
          },
        },
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
      lineStyle: {
        color: 'gradient' as const,
        curveness: 0.5,
      },
      label: {
        show: true,
        position: 'right' as const,
        fontSize: 12,
        color: '#ff6b6b',
        fontWeight: 'bold' as const,
      },
      emphasis: {
        focus: 'adjacency' as const,
        lineStyle: {
          color: '#ff6b6b',
          width: 3,
        },
      },
      animationDuration: 2000,
      animationEasing: 'cubicOut' as const,
    },
  ],
}))

// 箱型图配置 - 静态样式展示
const boxplotChartOption = computed(() => ({
  title: {
    text: '数据分布情况（箱型图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: (params: any) => {
      const data = params.data
      return `组别: ${params.name}<br/>最小值: ${data[0]}<br/>下四分位数: ${data[1]}<br/>中位数: ${data[2]}<br/>上四分位数: ${data[3]}<br/>最大值: ${data[4]}`
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
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
    data: ['A组', 'B组', 'C组', 'D组', 'E组'],
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      alignWithLabel: true,
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
  },
  yAxis: {
    type: 'value' as const,
    name: '数值',
    nameLocation: 'middle' as const,
    nameGap: 50,
    nameTextStyle: {
      color: textColor200.value,
      fontSize: 12,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        type: 'dashed' as const,
      },
    },
  },
  series: [
    {
      name: '数据分布',
      type: 'boxplot' as const,
      data: [
        [850, 740, 900, 1070, 930],
        [960, 940, 960, 980, 960],
        [880, 880, 880, 880, 880],
        [890, 810, 810, 820, 800],
        [960, 1060, 960, 960, 1060],
      ],
      itemStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#87afff' },
            { offset: 1, color: '#5470c6' },
          ],
        },
        borderColor: textColor100.value,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: '#87afff30',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: '#87afff50',
        },
      },
      markPoint: {
        data: [
          {
            name: '异常值',
            type: 'max' as const,
            itemStyle: {
              color: '#ff6b6b',
            },
            label: {
              color: textColor100.value,
            },
          },
        ],
      },
      markLine: {
        data: [
          {
            name: '平均值',
            type: 'average' as const,
            lineStyle: {
              color: '#ffa726',
              type: 'dashed' as const,
            },
            label: {
              color: '#ffa726',
            },
          },
        ],
      },
      animationDelay: (idx: number) => idx * 100,
    },
  ],
}))

// 旭日图配置 - 静态样式展示
const sunburstChartOption = computed(() => ({
  title: {
    text: '层级数据结构（旭日图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'item' as const,
    formatter: (params: any) => {
      return `${params.name}<br/>值: ${params.value}<br/>占比: ${params.percent}%`
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  series: [
    {
      name: '层级数据',
      type: 'sunburst' as const,
      radius: [0, '90%'],
      center: ['50%', '50%'],
      data: [
        {
          name: 'A',
          value: 10,
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#87afff' },
                { offset: 1, color: '#5470c6' },
              ],
            },
          },
          children: [
            {
              name: 'A-1',
              value: 3,
              itemStyle: {
                color: {
                  type: 'radial' as const,
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    { offset: 0, color: '#ffd93d' },
                    { offset: 1, color: '#ff6b6b' },
                  ],
                },
              },
              children: [
                {
                  name: 'A-1-a',
                  value: 1,
                  itemStyle: {
                    color: '#4ecdc4',
                  },
                },
                {
                  name: 'A-1-b',
                  value: 2,
                  itemStyle: {
                    color: '#26a69a',
                  },
                },
              ],
            },
            {
              name: 'A-2',
              value: 7,
              itemStyle: {
                color: {
                  type: 'radial' as const,
                  x: 0.5,
                  y: 0.5,
                  r: 0.5,
                  colorStops: [
                    { offset: 0, color: '#4ecdc4' },
                    { offset: 1, color: '#26a69a' },
                  ],
                },
              },
              children: [
                {
                  name: 'A-2-a',
                  value: 4,
                  itemStyle: {
                    color: '#ffa726',
                  },
                },
                {
                  name: 'A-2-b',
                  value: 3,
                  itemStyle: {
                    color: '#ff7043',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'B',
          value: 8,
          itemStyle: {
            color: {
              type: 'radial' as const,
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 0, color: '#ab47bc' },
                { offset: 1, color: '#7b1fa2' },
              ],
            },
          },
          children: [
            {
              name: 'B-1',
              value: 3,
              itemStyle: {
                color: '#ef5350',
              },
            },
            {
              name: 'B-2',
              value: 5,
              itemStyle: {
                color: '#c62828',
              },
            },
          ],
        },
      ],
      label: {
        show: true,
        formatter: (params: any) => {
          return params.name
        },
        fontSize: 12,
        fontWeight: 'bold' as const,
        color: textColor100.value,
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 5,
        lineStyle: {
          color: textColor100.value,
          width: 1,
        },
      },
      emphasis: {
        focus: 'ancestor' as const,
        itemStyle: {
          shadowBlur: 20,
          shadowColor: textColor200.value + '30',
        },
      },
      animationType: 'scale' as const,
      animationEasing: 'elasticOut' as const,
      animationDelay: (_idx: number) => Math.random() * 200,
    },
  ],
}))

// 主题河流图配置 - 静态样式展示
const themeRiverChartOption = computed(() => ({
  title: {
    text: '时序数据演变（主题河流图）',
    left: 'center',
    textStyle: {
      fontWeight: 'bold' as const,
      color: accent100.value,
    },
  },
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'line' as const,
      lineStyle: {
        color: '#ffa726',
        width: 1,
        type: 'dashed' as const,
      },
    },
    formatter: (params: any) => {
      const data = params[0].data
      return `时间: ${data[0]}<br/>类别: ${data[2]}<br/>数值: ${data[1]}`
    },
    backgroundColor: bgColor200.value,
    borderColor: textColor200.value,
    borderWidth: 1,
    textStyle: {
      color: textColor100.value,
    },
  },
  legend: {
    top: 30,
    left: 'center',
    itemGap: 20,
    textStyle: {
      fontSize: 12,
      color: textColor200.value,
    },
  },
  singleAxis: {
    type: 'time' as const,
    name: '时间',
    nameLocation: 'middle' as const,
    nameGap: 30,
    nameTextStyle: {
      color: textColor200.value,
      fontSize: 12,
    },
    axisLine: {
      lineStyle: {
        color: '#ffa726',
        width: 2,
      },
    },
    axisTick: {
      lineStyle: {
        color: '#ffa726',
      },
    },
    axisLabel: {
      color: textColor200.value,
      fontSize: 11,
      formatter: (value: number) => {
        const date = new Date(value)
        return `${date.getMonth() + 1}月`
      },
    },
    splitLine: {
      lineStyle: {
        color: bgColor300.value,
        type: 'dashed' as const,
      },
    },
  },
  series: [
    {
      name: '时序数据',
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
      itemStyle: {
        borderColor: textColor100.value,
        borderWidth: 1,
        shadowBlur: 10,
        shadowColor: textColor200.value + '10',
      },
      label: {
        show: true,
        position: 'inside' as const,
        formatter: (params: any) => {
          return params.data[2]
        },
        fontSize: 12,
        fontWeight: 'bold' as const,
        color: textColor100.value,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 20,
          shadowColor: textColor200.value + '30',
        },
        label: {
          fontSize: 14,
        },
      },
      animationDuration: 2000,
      animationEasing: 'cubicOut' as const,
    },
  ],
}))
</script>

<template lang="pug">
.grid.grid-cols-1.gap-gapl.p-paddingl(class='lg:grid-cols-2 xl:grid-cols-3')
  UseEcharts.c-card(:option='barChartOption')
  UseEcharts.c-card(:option='lineChartOption')
  UseEcharts.c-card(:option='pieChartOption')
  UseEcharts.c-card(:option='scatterChartOption')
  UseEcharts.c-card(:option='radarChartOption')
  UseEcharts.c-card(:option='funnelChartOption')
  UseEcharts.c-card(:option='gaugeChartOption')
  UseEcharts.c-card(:option='candlestickChartOption')
  UseEcharts.c-card(:option='heatmapChartOption')
  UseEcharts.c-card(:option='sankeyChartOption')
  UseEcharts.c-card(:option='boxplotChartOption')
  UseEcharts.c-card(:option='sunburstChartOption')
  UseEcharts.c-card(:option='themeRiverChartOption')
</template>
