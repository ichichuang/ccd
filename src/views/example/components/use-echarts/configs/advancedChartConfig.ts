import type { EChartsOption } from 'echarts'

const heatmapData: number[][] = []
for (let i = 0; i < 7; i++) {
  for (let j = 0; j < 24; j++) {
    heatmapData.push([j, i, Math.random() * 100])
  }
}

export const heatmapOption: EChartsOption = {
  tooltip: { position: 'top' },
  grid: { height: '50%', top: '15%' },
  xAxis: { type: 'category', data: Array.from({ length: 24 }, (_, i) => `${i}时`) },
  yAxis: { type: 'category', data: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] },
  visualMap: {
    min: 0,
    max: 100,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '5%',
  },
  series: [{ type: 'heatmap', data: heatmapData }],
}

export const multiSeriesLineOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['系列1', '系列2', '系列3'], top: '18%', left: '0%' },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '28%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
  yAxis: { type: 'value' },
  series: [
    { name: '系列1', type: 'line', data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234] },
    { name: '系列2', type: 'line', data: [220, 182, 191, 234, 290, 330, 310, 201, 154, 190] },
    { name: '系列3', type: 'line', data: [150, 232, 201, 154, 190, 330, 410, 201, 154, 90] },
  ],
}

export const barWithMarkOption: EChartsOption = {
  grid: { top: '22%', left: '8%', right: '6%', bottom: '10%', containLabel: true },
  xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
  yAxis: { type: 'value' },
  series: [{ name: '数量', type: 'bar', data: [10, 22, 18, 9, 30] }],
}
