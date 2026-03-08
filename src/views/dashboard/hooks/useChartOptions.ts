import type { Ref } from 'vue'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts/core'
import { useThemeStore } from '@/stores/modules/theme'
import { getChartSystemVariables } from '@/utils/theme/chartUtils'
import type { SystemMetricsDTO } from '../page.state'

/**
 * Hook to build ultra-premium ECharts options for System Metrics.
 * Strictly follows .cursor/rules/40-echarts-visualization.mdc
 * @param dataRef - Reactive ref of metrics data for live chart updates
 */
export function useChartOptions(dataRef: Ref<SystemMetricsDTO[]>) {
  const themeStore = useThemeStore()

  const chartOptions = computed<EChartsOption>(() => {
    // Explicitly track theme state to trigger re-evaluation when the user switches light/dark mode
    void themeStore.themeName
    void themeStore.mode
    void themeStore.isDark

    const data = dataRef.value
    const vars = getChartSystemVariables()

    // Premium Animation Config
    const animationConfig = {
      animationEasing: 'cubic-bezier(0.16, 1, 0.3, 1)' as any,
      animationDuration: 1000,
      animationDurationUpdate: 400,
      animationEasingUpdate: 'cubic-bezier(0.16, 1, 0.3, 1)' as any,
    }

    return {
      ...animationConfig,
      grid: {
        top: vars.gapl,
        bottom: vars.gapl,
        left: vars.gapl,
        right: vars.gapl,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        // Glass Tooltip Aesthetic
        backgroundColor: vars.card.replace('rgb', 'rgba').replace(')', ', 0.92)'),
        borderColor: vars.border,
        borderWidth: 1,
        textStyle: {
          color: vars.foreground,
          fontSize: vars.fontSizeSmall,
        },
        padding: vars.paddings,
        transitionDuration: 0.3,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 10,
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.timestamp),
        axisLine: { lineStyle: { color: vars.border } },
        axisLabel: { color: vars.mutedForeground, fontSize: vars.fontSizeSmall },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: vars.mutedForeground, fontSize: vars.fontSizeSmall },
        splitLine: { lineStyle: { color: vars.border, type: 'dashed' } },
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'line',
          data: data.map(d => d.cpuUsage),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: vars.primary,
          },
          // Gradient Fill Area
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: vars.primary.replace('rgb', 'rgba').replace(')', ', 0.3)') },
              { offset: 1, color: vars.primary.replace('rgb', 'rgba').replace(')', ', 0.01)') },
            ]),
          },
        },
        {
          name: 'Memory Load',
          type: 'line',
          data: data.map(d => d.memoryLoad),
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: vars.success,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: vars.success.replace('rgb', 'rgba').replace(')', ', 0.2)') },
              { offset: 1, color: vars.success.replace('rgb', 'rgba').replace(')', ', 0.01)') },
            ]),
          },
        },
      ],
    }
  })

  return {
    chartOptions,
  }
}
