import type { EChartsOption } from 'echarts'

export const CONNECT_GROUP_ID = 'use-echarts-connect-demo'

const sharedCategories = ['1', '2', '3', '4', '5', '6', '7']
const sharedValues = [12, 22, 18, 9, 30, 15, 24]

/** 左图：折线（同一组数据） */
export const connectLineOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: sharedCategories },
  yAxis: { type: 'value' },
  series: [{ name: '数据', type: 'line', data: sharedValues }],
}

/** 右图：柱状（同一组数据，不同展示方式） */
export const connectBarOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: sharedCategories },
  yAxis: { type: 'value' },
  series: [{ name: '数据', type: 'bar', data: sharedValues }],
}

/** 第三图：面积折线（同一组数据，不同展示方式） */
export const connectAreaOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: sharedCategories },
  yAxis: { type: 'value' },
  series: [
    {
      name: '数据',
      type: 'line',
      areaStyle: {},
      data: sharedValues,
    },
  ],
}

/** 饼图：同一组数据，按类目汇总 */
export const connectPieOption: EChartsOption = {
  tooltip: { trigger: 'item' },
  legend: { top: '5%' },
  series: [
    {
      name: '数据',
      type: 'pie',
      radius: '60%',
      center: ['50%', '60%'],
      data: sharedCategories.map((name, index) => ({
        name,
        value: sharedValues[index],
      })),
      emphasis: {
        focus: 'self',
      },
    },
  ],
}
