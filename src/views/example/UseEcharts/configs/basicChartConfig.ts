import type { EChartsOption } from 'echarts'

export const lineOption: EChartsOption = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  yAxis: { type: 'value' },
  series: [{ name: '销量', type: 'line', data: [120, 200, 150, 80, 70, 110, 130] }],
}

/** 带面积填充的折线图，用于验证全局 lineArea 透明度控制 */
export const lineWithAreaOption: EChartsOption = {
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  yAxis: { type: 'value' },
  series: [
    {
      name: '销量',
      type: 'line',
      areaStyle: {},
      data: [120, 200, 150, 80, 70, 110, 130],
    },
  ],
}

export const barOption: EChartsOption = {
  xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
  yAxis: { type: 'value' },
  series: [{ name: '数量', type: 'bar', data: [10, 22, 18, 9, 30] }],
}

export const pieOption: EChartsOption = {
  series: [
    {
      name: '占比',
      type: 'pie',
      radius: '60%',
      data: [
        { value: 1048, name: 'A' },
        { value: 735, name: 'B' },
        { value: 580, name: 'C' },
        { value: 484, name: 'D' },
      ],
    },
  ],
}
