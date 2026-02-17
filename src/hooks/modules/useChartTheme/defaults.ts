/**
 * 图表默认配置（唯一数据源，供 useChartTheme 与 UseEcharts 共用）
 * 消除 useChartTheme 对 UseEcharts 的循环依赖
 */
import { getChartSizeTokens, getChartSystemVariables } from '@/utils/theme/chartUtils'
import { withAlpha } from './utils'
import type {
  ChartAnimationConfig,
  ChartAxisPointerConfig,
  ChartBrushConfig,
  ChartMarkLineConfig,
  ChartMarkPointConfig,
  ChartToolboxConfig,
  ChartVisualMapConfig,
} from './types'
// 默认动画配置
export const DEFAULT_ANIMATION_CONFIG: ChartAnimationConfig = {
  animation: true,
  duration: 1000,
  easing: 'cubicOut',
  delay: 0,
  animationUpdate: true,
  animationDurationUpdate: 300,
  animationEasingUpdate: 'cubicInOut',
}

/** 工具箱文案 fallback（无 t 时使用英文） */
const TOOLBOX_FALLBACK: Record<string, string> = {
  ['chart.toolbox.saveAsImage']: 'Save as image',
  ['chart.toolbox.restore']: 'Restore',
  ['chart.toolbox.dataView']: 'Data view',
  ['chart.toolbox.dataZoomZoom']: 'Area zoom',
  ['chart.toolbox.dataZoomBack']: 'Restore area zoom',
  ['chart.toolbox.reset']: 'Reset',
}

// 默认工具箱配置（t 为 i18n 的 t 时使用翻译，否则用英文 fallback）
export function getDefaultToolboxConfig(t?: (key: string) => string): ChartToolboxConfig {
  const systemVars = getChartSystemVariables()
  const title = (key: string) => (t ? t(key) : (TOOLBOX_FALLBACK[key] ?? key))

  return {
    show: false,
    right: `${systemVars.paddings}%`,
    top: `${systemVars.gapl}px`,
    feature: {
      saveAsImage: {
        title: title('chart.toolbox.saveAsImage'),
        type: 'png',
        backgroundColor: 'auto',
      },
      restore: {
        title: title('chart.toolbox.restore'),
      },
      dataView: {
        title: title('chart.toolbox.dataView'),
        readOnly: false,
      },
      dataZoom: {
        title: {
          zoom: title('chart.toolbox.dataZoomZoom'),
          back: title('chart.toolbox.dataZoomBack'),
        },
      },
      reset: {
        title: title('chart.toolbox.reset'),
      },
    },
    iconStyle: {
      borderColor: systemVars.mutedForeground,
    },
    emphasis: {
      iconStyle: {
        borderColor: systemVars.foreground,
      },
    },
  }
}

// 默认标记点配置
export function getDefaultMarkPointConfig(): ChartMarkPointConfig {
  const systemVars = getChartSystemVariables()
  const size = getChartSizeTokens()

  return {
    show: false,
    data: [],
    itemStyle: {
      color: systemVars.primary,
      borderColor: systemVars.background,
      borderWidth: size.strokeSeries,
    },
    label: {
      show: true,
      position: 'top',
      fontSize: size.fontSm,
      color: systemVars.foreground,
    },
    emphasis: {
      itemStyle: {
        color: systemVars.warn,
      },
    },
  }
}

// 默认标记线配置
export function getDefaultMarkLineConfig(): ChartMarkLineConfig {
  const systemVars = getChartSystemVariables()
  const size = getChartSizeTokens()

  return {
    show: false,
    data: [],
    lineStyle: {
      color: systemVars.primary,
      width: size.strokeSeries,
      type: 'solid',
    },
    label: {
      show: true,
      position: 'insideEndTop',
      fontSize: size.fontSm,
      color: systemVars.foreground,
    },
    emphasis: {
      lineStyle: {
        color: systemVars.warn,
        width: size.strokeSeries + size.strokeHairline,
      },
    },
  }
}

// 默认可视化映射配置
export function getDefaultVisualMapConfig(): ChartVisualMapConfig {
  const systemVars = getChartSystemVariables()
  const size = getChartSizeTokens()

  return {
    show: false,
    type: 'continuous',
    min: 0,
    max: 100,
    dimension: 2,
    inRange: {
      color: [systemVars.info, systemVars.warn, systemVars.danger],
    },
    outOfRange: {
      color: [systemVars.mutedForeground],
    },
    left: 'left',
    bottom: `${systemVars.gap}%`,
    orient: 'horizontal',
    textStyle: {
      fontSize: size.fontSm,
      color: systemVars.foreground,
    },
  }
}

// 默认画刷配置
export function getDefaultBrushConfig(): ChartBrushConfig {
  const systemVars = getChartSystemVariables()
  const size = getChartSizeTokens()

  return {
    show: false,
    brushType: 'rect',
    brushStyle: {
      borderWidth: size.strokeHairline,
      color: withAlpha(systemVars.primary, 0.19) ?? systemVars.primary,
      borderColor: withAlpha(systemVars.primary, 0.5) ?? systemVars.primary,
    },
    areas: [],
    left: 'center',
    top: 'top',
    width: '80%',
    height: '60%',
  }
}

// 默认坐标轴指示器配置
export function getDefaultAxisPointerConfig(): ChartAxisPointerConfig {
  const systemVars = getChartSystemVariables()
  const size = getChartSizeTokens()

  return {
    show: true,
    type: 'line',
    lineStyle: {
      color: systemVars.mutedForeground,
      width: size.strokeHairline,
      type: 'dashed',
    },
    shadowStyle: {
      color: withAlpha(systemVars.mutedForeground, 0.19) ?? systemVars.mutedForeground,
    },
    label: {
      show: true,
      backgroundColor: systemVars.card,
      borderColor: systemVars.card,
      borderWidth: size.strokeHairline,
      color: systemVars.foreground,
      fontSize: size.fontSm,
    },
    triggerTooltip: true,
    triggerOn: 'mousemove|click',
    axis: 'auto',
    animation: true,
    animationDuration: 200,
    animationEasing: 'cubicOut',
  }
}
