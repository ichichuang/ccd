// 高级配置合并函数

import {
  DEFAULT_ANIMATION_CONFIG,
  getDefaultAxisPointerConfig,
  getDefaultBrushConfig,
  getDefaultMarkLineConfig,
  getDefaultMarkPointConfig,
  getDefaultToolboxConfig,
  getDefaultVisualMapConfig,
} from '@/components/use-echarts/utils/constants'
import type { ChartAdvancedConfig } from '@/components/use-echarts/utils/types'

/**
 * 合并高级配置到 ECharts 选项
 * 采用函数式编程，返回新对象而不修改原对象
 */
export function mergeAdvancedConfigs(option: any, advancedConfig?: ChartAdvancedConfig): any {
  if (!advancedConfig || !option || typeof option !== 'object') {
    return option
  }

  let mergedOption = { ...option }

  // 合并动画配置
  if (advancedConfig.animationConfig) {
    const animationConfig =
      typeof advancedConfig.animationConfig === 'function'
        ? (advancedConfig.animationConfig as any)()
        : { ...DEFAULT_ANIMATION_CONFIG, ...advancedConfig.animationConfig }
    mergedOption = {
      ...mergedOption,
      animation: animationConfig.animation,
      animationDuration: animationConfig.duration,
      animationEasing: animationConfig.easing,
      animationDelay: animationConfig.delay,
      animationDurationUpdate: animationConfig.animationDurationUpdate,
      animationEasingUpdate: animationConfig.animationEasingUpdate,
    }
  }

  // 合并工具箱配置
  if (advancedConfig.toolboxConfig) {
    const toolboxConfig =
      typeof advancedConfig.toolboxConfig === 'function'
        ? (advancedConfig.toolboxConfig as any)()
        : advancedConfig.toolboxConfig
    if (toolboxConfig && toolboxConfig.show) {
      mergedOption = {
        ...mergedOption,
        toolbox: { ...getDefaultToolboxConfig(), ...toolboxConfig },
      }
    }
  }

  // 合并标记点配置
  if (advancedConfig.markPointConfig) {
    const markPointConfig =
      typeof advancedConfig.markPointConfig === 'function'
        ? (advancedConfig.markPointConfig as any)()
        : advancedConfig.markPointConfig
    if (markPointConfig && markPointConfig.show) {
      const finalMarkPointConfig = { ...getDefaultMarkPointConfig(), ...markPointConfig }
      if (mergedOption.series && Array.isArray(mergedOption.series)) {
        mergedOption = {
          ...mergedOption,
          series: mergedOption.series.map((series: any) => {
            if (!series.markPoint) {
              return { ...series, markPoint: finalMarkPointConfig }
            }
            return series
          }),
        }
      }
    }
  }

  // 合并标记线配置
  if (advancedConfig.markLineConfig) {
    const markLineConfig =
      typeof advancedConfig.markLineConfig === 'function'
        ? (advancedConfig.markLineConfig as any)()
        : advancedConfig.markLineConfig
    if (markLineConfig && markLineConfig.show) {
      const finalMarkLineConfig = { ...getDefaultMarkLineConfig(), ...markLineConfig }
      if (mergedOption.series && Array.isArray(mergedOption.series)) {
        mergedOption = {
          ...mergedOption,
          series: mergedOption.series.map((series: any) => {
            if (!series.markLine) {
              return { ...series, markLine: finalMarkLineConfig }
            }
            return series
          }),
        }
      }
    }
  }

  // 合并可视化映射配置
  if (advancedConfig.visualMapConfig) {
    const visualMapConfig =
      typeof advancedConfig.visualMapConfig === 'function'
        ? (advancedConfig.visualMapConfig as any)()
        : advancedConfig.visualMapConfig
    if (visualMapConfig && visualMapConfig.show) {
      mergedOption = {
        ...mergedOption,
        visualMap: { ...getDefaultVisualMapConfig(), ...visualMapConfig },
      }
    }
  }

  // 合并画刷配置
  if (advancedConfig.brushConfig) {
    const brushConfig =
      typeof advancedConfig.brushConfig === 'function'
        ? (advancedConfig.brushConfig as any)()
        : advancedConfig.brushConfig
    if (brushConfig && brushConfig.show) {
      mergedOption = {
        ...mergedOption,
        brush: { ...getDefaultBrushConfig(), ...brushConfig },
      }
    }
  }

  // 合并坐标轴指示器配置
  if (advancedConfig.axisPointerConfig) {
    const axisPointerConfig =
      typeof advancedConfig.axisPointerConfig === 'function'
        ? (advancedConfig.axisPointerConfig as any)()
        : { ...getDefaultAxisPointerConfig(), ...advancedConfig.axisPointerConfig }
    mergedOption = {
      ...mergedOption,
      tooltip: {
        ...mergedOption.tooltip,
        axisPointer: axisPointerConfig,
      },
    }
  }

  // 合并图例悬停联动配置
  if (advancedConfig.legendHoverLink !== undefined) {
    mergedOption = {
      ...mergedOption,
      legendHoverLink: advancedConfig.legendHoverLink,
    }
  }

  // 合并背景颜色
  if (advancedConfig.backgroundColor) {
    mergedOption = {
      ...mergedOption,
      backgroundColor: advancedConfig.backgroundColor,
    }
  }

  return mergedOption
}
