import type { Ref } from 'vue'
import type { EChartsOption } from 'echarts'
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

  // 只在主题切换时重新计算图表系统变量，避免每次 metrics tick 都触发 getComputedStyle 读取
  const chartVars = computed(() => {
    void themeStore.themeName
    void themeStore.mode
    void themeStore.isDark
    return getChartSystemVariables()
  })

  // 静态 option：grid/tooltip/axis/渐变/动画 等不依赖 metrics 数据
  const baseOption = computed<EChartsOption>(() => {
    const vars = chartVars.value

    const animationConfig = {
      animationEasing: 'cubic-bezier(0.16, 1, 0.3, 1)' as any,
      animationDuration: 1000,
      animationDurationUpdate: 400,
      animationEasingUpdate: 'cubic-bezier(0.16, 1, 0.3, 1)' as any,
    }

    return {
      ...animationConfig,
      grid: {
        top: vars.gapSm,
        bottom: vars.gapSm,
        left: vars.gapSm,
        right: vars.gapSm,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        borderColor: vars.border,
        borderWidth: 1,
        textStyle: {
          color: vars.foreground,
          fontSize: vars.fontSizeSm,
        },
        padding: vars.paddingLg,
        transitionDuration: 0.3,
        shadowBlur: 10,
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLine: { lineStyle: { color: vars.border } },
        axisLabel: { color: vars.mutedForeground, fontSize: vars.fontSizeSm },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: vars.mutedForeground, fontSize: vars.fontSizeSm },
        splitLine: { lineStyle: { color: vars.border, type: 'dashed' } },
      },
      series: [
        {
          name: 'CPU Usage',
          type: 'line',
          data: [],
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: vars.primary,
          },
          // Gradient Fill Area
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: vars.primary.replace('rgb', 'rgba').replace(')', ', 0.3)') },
                { offset: 1, color: vars.primary.replace('rgb', 'rgba').replace(')', ', 0.01)') },
              ],
            },
          },
        },
        {
          name: 'Memory Load',
          type: 'line',
          data: [],
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: vars.success,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: vars.success.replace('rgb', 'rgba').replace(')', ', 0.2)') },
                { offset: 1, color: vars.success.replace('rgb', 'rgba').replace(')', ', 0.01)') },
              ],
            },
          },
        },
      ],
    }
  })

  // 动态 option：每次 tick 只更新 xAxis.data / series[*].data
  const chartOptions = computed((): EChartsOption => {
    const data = dataRef.value
    const base = baseOption.value

    const xData = data.map(d => d.timestamp)
    const cpuData = data.map(d => d.cpuUsage)
    const memoryData = data.map(d => d.memoryLoad)

    const seriesArr = Array.isArray(base.series) ? base.series : []
    const cpuSeries = seriesArr[0] ?? { type: 'line', name: 'CPU Usage' }
    const memSeries = seriesArr[1] ?? { type: 'line', name: 'Memory Load' }

    return {
      ...base,
      xAxis: {
        ...(base.xAxis as any),
        data: xData,
      },
      series: [
        {
          ...cpuSeries,
          data: cpuData,
        },
        {
          ...memSeries,
          data: memoryData,
        },
      ],
    } as unknown as EChartsOption
  })

  return {
    chartOptions,
  }
}
