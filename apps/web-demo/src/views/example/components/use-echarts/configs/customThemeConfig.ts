import type { EChartsOption } from 'echarts'
import type { ChartThemeConfig } from '@ccd/vue-charts'

export const customThemeOption: EChartsOption = {
  color: ['#ef4444', '#f97316', '#eab308', '#22c55e'], // 红, 橙, 黄, 绿
  xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
  yAxis: { type: 'value' },
  series: [
    { name: '红系', type: 'line', areaStyle: {}, data: [10, 22, 18, 9, 30] },
    { name: '橙系', type: 'line', areaStyle: {}, data: [8, 18, 20, 12, 25] },
    { name: '黄系', type: 'line', areaStyle: {}, data: [6, 14, 16, 14, 18] },
    { name: '绿系', type: 'line', areaStyle: {}, data: [4, 10, 12, 16, 14] },
  ],
}

export const initialThemeConfigOverride: Partial<ChartThemeConfig> = {
  enableTheme: true,
  opacity: { lineArea: 0.5 },
}
