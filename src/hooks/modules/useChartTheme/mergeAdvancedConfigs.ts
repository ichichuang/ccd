/**
 * 高级配置合并函数（ECharts 边界层）
 *
 * 仅依赖 useChartTheme 内部，消除对 UseEcharts 的循环依赖。option 与“函数返回配置”的调用
 * 使用类型断言/any 以兼容 UseEcharts 的 function-type props（如 animationConfig: () => ({...})）。
 */

import {
  DEFAULT_ANIMATION_CONFIG,
  getDefaultAxisPointerConfig,
  getDefaultBrushConfig,
  getDefaultMarkLineConfig,
  getDefaultMarkPointConfig,
  getDefaultToolboxConfig,
  getDefaultVisualMapConfig,
} from './defaults'
import type { ChartAdvancedConfig } from './types'

/**
 * 合并高级配置到 ECharts 选项
 * 采用函数式编程，返回新对象而不修改原对象
 * @param t - i18n 的 t，用于工具箱等文案；不传时使用英文 fallback
 */
export function mergeAdvancedConfigs(
  option: any,
  advancedConfig?: ChartAdvancedConfig,
  t?: (key: string) => string
): any {
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
        toolbox: { ...getDefaultToolboxConfig(t), ...toolboxConfig },
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
