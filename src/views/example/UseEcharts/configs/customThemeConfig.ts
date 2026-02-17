import type { EChartsOption } from 'echarts'
import type { ChartThemeConfig } from '@/hooks/modules/useChartTheme/types'

export const customThemeOption: EChartsOption = {
  xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
  yAxis: { type: 'value' },
  series: [
    { name: '系列1', type: 'line', areaStyle: {}, data: [10, 22, 18, 9, 30] },
    { name: '系列2', type: 'line', areaStyle: {}, data: [5, 15, 25, 12, 20] },
  ],
}

export const initialThemeConfigOverride: Partial<ChartThemeConfig> = {
  enableTheme: true,
  opacity: { lineArea: 0.5 },
}
