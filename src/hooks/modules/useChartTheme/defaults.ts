/**
 * 图表默认配置（唯一数据源，供 useChartTheme 与 UseEcharts 共用）
 * 消除 useChartTheme 对 use-echarts 的循环依赖
 */
import { getChartSystemVariables } from '@/utils/theme/chartUtils'
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

// 默认工具箱配置
export function getDefaultToolboxConfig(): ChartToolboxConfig {
  const systemVars = getChartSystemVariables()

  return {
    show: false,
    right: `${systemVars.paddings}%`,
    top: `${systemVars.gapl}px`,
    feature: {
      saveAsImage: {
        title: '保存为图片',
        type: 'png',
        backgroundColor: 'auto',
      },
      restore: {
        title: '还原',
      },
      dataView: {
        title: '数据视图',
        readOnly: false,
      },
      dataZoom: {
        title: {
          zoom: '区域缩放',
          back: '区域缩放还原',
        },
      },
      reset: {
        title: '重置',
      },
    },
    iconStyle: {
      borderColor: systemVars.textColor200,
    },
    emphasis: {
      iconStyle: {
        borderColor: systemVars.textColor100,
      },
    },
  }
}

// 默认标记点配置
export function getDefaultMarkPointConfig(): ChartMarkPointConfig {
  const systemVars = getChartSystemVariables()

  return {
    show: false,
    data: [],
    itemStyle: {
      color: systemVars.primaryColor,
      borderColor: systemVars.bgColor200,
      borderWidth: 2,
    },
    label: {
      show: true,
      position: 'top',
      fontSize: systemVars.fontSizeSmall,
      color: systemVars.textColor100,
    },
    emphasis: {
      itemStyle: {
        color: systemVars.warnColor,
      },
    },
  }
}

// 默认标记线配置
export function getDefaultMarkLineConfig(): ChartMarkLineConfig {
  const systemVars = getChartSystemVariables()

  return {
    show: false,
    data: [],
    lineStyle: {
      color: systemVars.primaryColor,
      width: 2,
      type: 'solid',
    },
    label: {
      show: true,
      position: 'end',
      fontSize: systemVars.fontSizeSmall,
      color: systemVars.textColor100,
    },
    emphasis: {
      lineStyle: {
        color: systemVars.warnColor,
        width: 3,
      },
    },
  }
}

// 默认可视化映射配置
export function getDefaultVisualMapConfig(): ChartVisualMapConfig {
  const systemVars = getChartSystemVariables()

  return {
    show: false,
    type: 'continuous',
    min: 0,
    max: 100,
    dimension: 2,
    inRange: {
      color: [systemVars.infoColor, systemVars.warnColor, systemVars.dangerColor],
    },
    outOfRange: {
      color: [systemVars.textColor200],
    },
    left: 'left',
    bottom: `${systemVars.gap}%`,
    orient: 'horizontal',
    textStyle: {
      fontSize: systemVars.fontSizeSmall,
      color: systemVars.textColor100,
    },
  }
}

// 默认画刷配置
export function getDefaultBrushConfig(): ChartBrushConfig {
  const systemVars = getChartSystemVariables()

  return {
    show: false,
    brushType: 'rect',
    brushStyle: {
      borderWidth: 1,
      color: `${systemVars.primaryColor}30`,
      borderColor: `${systemVars.primaryColor}80`,
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

  return {
    show: true,
    type: 'line',
    lineStyle: {
      color: systemVars.textColor200,
      width: 1,
      type: 'dashed',
    },
    shadowStyle: {
      color: `${systemVars.textColor200}30`,
    },
    label: {
      show: true,
      backgroundColor: systemVars.bgColor300,
      borderColor: systemVars.bgColor300,
      borderWidth: 1,
      color: systemVars.textColor100,
      fontSize: systemVars.fontSizeSmall,
    },
    triggerTooltip: true,
    triggerOn: 'mousemove|click',
    axis: 'auto',
    animation: true,
    animationDuration: 200,
    animationEasing: 'cubicOut',
  }
}
