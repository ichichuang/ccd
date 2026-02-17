import type { EChartsOption } from 'echarts'

export const eventsRefOption: EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['系列1', '系列2'], top: '5%' },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '20%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: ['1', '2', '3', '4', '5'] },
  yAxis: { type: 'value' },
  dataZoom: [{ type: 'slider', start: 0, end: 100 }],
  series: [
    { name: '系列1', type: 'line', data: [120, 132, 101, 134, 90] },
    { name: '系列2', type: 'line', data: [220, 182, 191, 234, 290] },
  ],
}
