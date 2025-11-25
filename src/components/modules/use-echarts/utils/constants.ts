import { useColorStore, useSizeStore } from '@/stores'
import type {
  ChartAnimationConfig,
  ChartAxisPointerConfig,
  ChartBrushConfig,
  ChartMarkLineConfig,
  ChartMarkPointConfig,
  ChartToolboxConfig,
  ChartVisualMapConfig,
  DefaultOpacityValues,
} from './types'

// 默认透明度配置
export const DEFAULT_OPACITY_VALUES: DefaultOpacityValues = {
  lineArea: 0.3, // 折线图区域填充透明度
  area: 0.3, // 面积图透明度
  bar: 1, // 柱状图透明度（实色）
  scatter: 0.6, // 散点图透明度
  effectScatter: 0.6, // 特效散点图透明度
  radar: 0.2, // 雷达图透明度
  funnel: 0.8, // 漏斗图透明度
  gauge: 1, // 仪表盘透明度（实色）
}

// 获取系统变量的函数
const getSystemVariables = () => {
  const colorStore = useColorStore()
  const sizeStore = useSizeStore()

  return {
    // 颜色变量
    textColor100: colorStore.getText100,
    textColor200: colorStore.getText200,
    bgColor200: colorStore.getBg200,
    bgColor300: colorStore.getBg300,
    accent100: colorStore.getAccent100,
    primaryColor: colorStore.getPrimaryColor,
    successColor: colorStore.getSuccessColor,
    infoColor: colorStore.getInfoColor,
    warnColor: colorStore.getWarnColor,
    dangerColor: colorStore.getDangerColor,
    helpColor: colorStore.getHelpColor,
    contrastColor: colorStore.getContrastColor,
    secondaryColor: colorStore.getSecondaryColor,

    // 尺寸变量
    fontSize: sizeStore.getFontSizeValue,
    fontSizeSmall: sizeStore.getFontSizesValue,
    paddings: sizeStore.getPaddingsValue,
    gap: sizeStore.getGap,
    gapl: sizeStore.getGapl,
  }
}

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
export const getDefaultToolboxConfig = (): ChartToolboxConfig => {
  const systemVars = getSystemVariables()

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
export const getDefaultMarkPointConfig = (): ChartMarkPointConfig => {
  const systemVars = getSystemVariables()

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
export const getDefaultMarkLineConfig = (): ChartMarkLineConfig => {
  const systemVars = getSystemVariables()

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
export const getDefaultVisualMapConfig = (): ChartVisualMapConfig => {
  const systemVars = getSystemVariables()

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
export const getDefaultBrushConfig = (): ChartBrushConfig => {
  const systemVars = getSystemVariables()

  return {
    show: false,
    brushType: 'rect',
    brushStyle: {
      borderWidth: 1,
      color: `${systemVars.primaryColor}30`, // 添加透明度
      borderColor: `${systemVars.primaryColor}80`, // 添加透明度
    },
    areas: [],
    left: 'center',
    top: 'top',
    width: '80%',
    height: '60%',
  }
}

// 默认坐标轴指示器配置
export const getDefaultAxisPointerConfig = (): ChartAxisPointerConfig => {
  const systemVars = getSystemVariables()

  return {
    show: true,
    type: 'line',
    lineStyle: {
      color: systemVars.textColor200,
      width: 1,
      type: 'dashed',
    },
    shadowStyle: {
      color: `${systemVars.textColor200}30`, // 添加透明度
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

// 默认组件 Props
export const createDefaultUseEchartsProps = () => ({
  option: () => ({}),
  width: '100%',
  height: '30vh',
  theme: 'default',
  renderer: 'canvas' as const,
  autoResize: true,
  style: () => ({}),
  backgroundColor: 'transparent',
  lazyLoad: false,
  loading: false,
  loadingOptions: () => ({}),
  manualUpdate: false,
  themeConfig: () => ({
    enableTheme: true,
    opacity: DEFAULT_OPACITY_VALUES,
  }),
  animationConfig: () => DEFAULT_ANIMATION_CONFIG,
  onEvents: () => ({}),
  toolboxConfig: () => getDefaultToolboxConfig(),
  markPointConfig: () => getDefaultMarkPointConfig(),
  markLineConfig: () => getDefaultMarkLineConfig(),
  visualMapConfig: () => getDefaultVisualMapConfig(),
  brushConfig: () => getDefaultBrushConfig(),
  axisPointerConfig: () => getDefaultAxisPointerConfig(),
  legendHoverLink: true,
})

// 支持透明度的图表类型
export const TRANSPARENT_CHART_TYPES = [
  'line',
  'area',
  'scatter',
  'effectScatter',
  'radar',
  'funnel',
] as const

// 实色图表类型（不需要透明度）
export const SOLID_CHART_TYPES = ['bar', 'gauge'] as const

// 所有支持的图表类型
export const ALL_CHART_TYPES = [...TRANSPARENT_CHART_TYPES, ...SOLID_CHART_TYPES] as const

export type TransparentChartType = (typeof TRANSPARENT_CHART_TYPES)[number]
export type SolidChartType = (typeof SOLID_CHART_TYPES)[number]
export type AllChartType = (typeof ALL_CHART_TYPES)[number]
