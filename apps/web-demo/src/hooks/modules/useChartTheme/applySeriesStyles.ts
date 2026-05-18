// ECharts 系列样式边界：参数与 ECharts 系列类型一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'
import { withAlpha } from './utils'
import { DEFAULT_OPACITY_VALUES } from './constants'

/**
 * 通用样式应用函数，用于设置 itemStyle 和 label
 */
function applyItemStyleAndLabel(
  series: any,
  seriesColor: string,
  labelColor: string,
  fontSize: number,
  lineHeight?: number
): any {
  return {
    ...series,
    itemStyle: {
      ...series.itemStyle,
      color: series.itemStyle?.color ?? seriesColor,
    },
    label: {
      ...series.label,
      color: series.label?.color ?? labelColor,
      fontSize: series.label?.fontSize ?? fontSize,
      lineHeight: series.label?.lineHeight ?? lineHeight,
    },
  }
}

/**
 * 线条样式应用函数（函数式版本）
 */
function applyLineStyles(series: any, seriesColor: string, strokeWidth: number): any {
  if (series.type !== 'line' && series.type !== 'area') {
    return series
  }

  const result = {
    ...series,
    lineStyle: {
      ...series.lineStyle,
      color: series.lineStyle?.color ?? seriesColor,
      width: series.lineStyle?.width ?? strokeWidth,
    },
  }

  // 区域样式（面积图）
  if (series.type === 'line' && series.areaStyle) {
    result.areaStyle = {
      ...series.areaStyle,
      color: series.areaStyle?.color ?? seriesColor,
    }
  }

  return result
}

/**
 * 透明度配置应用函数（函数式版本）
 */
function applyOpacityConfig(series: any, opacityConfig: any): any {
  if (!opacityConfig) {
    return series
  }

  const type = series.type

  // 透明度配置映射表
  const opacityMap: { [key: string]: number } = {
    line: opacityConfig.lineArea ?? opacityConfig.area ?? DEFAULT_OPACITY_VALUES.area,
    area: opacityConfig.area ?? DEFAULT_OPACITY_VALUES.area,
    bar: opacityConfig.bar ?? DEFAULT_OPACITY_VALUES.bar,
    scatter: opacityConfig.scatter ?? DEFAULT_OPACITY_VALUES.scatter,
    effectScatter:
      opacityConfig.effectScatter ?? opacityConfig.scatter ?? DEFAULT_OPACITY_VALUES.effectScatter,
    radar: opacityConfig.radar ?? DEFAULT_OPACITY_VALUES.radar,
    funnel: opacityConfig.funnel ?? DEFAULT_OPACITY_VALUES.funnel,
    gauge: opacityConfig.gauge ?? DEFAULT_OPACITY_VALUES.gauge,
    // 其它类型在默认 token 中未显式覆盖时，保持原行为（0.8）避免影响既有视觉预期
    pie: DEFAULT_OPACITY_VALUES.funnel,
    heatmap: DEFAULT_OPACITY_VALUES.funnel,
    treemap: DEFAULT_OPACITY_VALUES.funnel,
    sunburst: DEFAULT_OPACITY_VALUES.funnel,
    sankey: DEFAULT_OPACITY_VALUES.funnel,
    themeRiver: DEFAULT_OPACITY_VALUES.funnel,
    boxplot: DEFAULT_OPACITY_VALUES.funnel,
    candlestick: DEFAULT_OPACITY_VALUES.funnel,
    graph: DEFAULT_OPACITY_VALUES.funnel,
    lines: DEFAULT_OPACITY_VALUES.funnel,
    map: DEFAULT_OPACITY_VALUES.funnel,
    parallel: DEFAULT_OPACITY_VALUES.funnel,
    pictorialBar: opacityConfig.bar ?? DEFAULT_OPACITY_VALUES.bar,
    liquidFill: DEFAULT_OPACITY_VALUES.funnel,
    wordCloud: DEFAULT_OPACITY_VALUES.funnel,
  }

  const defaultOpacity = opacityMap[type] ?? DEFAULT_OPACITY_VALUES.bar

  // 应用透明度到不同的样式属性
  let result = { ...series }

  switch (type) {
    case 'line':
      if (series.areaStyle) {
        result = {
          ...result,
          areaStyle: {
            ...series.areaStyle,
            opacity: series.areaStyle?.opacity ?? defaultOpacity,
          },
        }
      }
      break
    case 'area':
      if (series.areaStyle) {
        result = {
          ...result,
          areaStyle: {
            ...series.areaStyle,
            opacity: series.areaStyle?.opacity ?? defaultOpacity,
          },
        }
      }
      break
    case 'radar':
      if (series.areaStyle) {
        result = {
          ...result,
          areaStyle: {
            ...series.areaStyle,
            opacity: series.areaStyle?.opacity ?? defaultOpacity,
          },
        }
      }
      break
    case 'bar':
    case 'pictorialBar':
      // 柱类：优先将透明度写入 color 的 rgba（ECharts fill 路径更稳）；渐变/非字符串 color 回退 itemStyle.opacity
      // 用户显式设置 itemStyle.opacity 时保持用户值
      {
        const userOpacity = series.itemStyle?.opacity
        if (userOpacity !== undefined && userOpacity !== null) {
          result = {
            ...result,
            itemStyle: {
              ...series.itemStyle,
              opacity: userOpacity,
            },
          }
          break
        }
        const baseColor = result.itemStyle?.color
        if (typeof baseColor === 'string') {
          const tinted = withAlpha(baseColor, defaultOpacity)
          if (
            tinted !== undefined &&
            tinted !== baseColor &&
            typeof tinted === 'string' &&
            tinted.startsWith('rgba(')
          ) {
            result = {
              ...result,
              itemStyle: {
                ...series.itemStyle,
                color: tinted,
                opacity: 1,
              },
            }
            break
          }
        }
        result = {
          ...result,
          itemStyle: {
            ...series.itemStyle,
            opacity: series.itemStyle?.opacity ?? defaultOpacity,
          },
        }
      }
      break
    default:
      // 对于其他类型，应用到 itemStyle（bar / pictorialBar 已单独处理）
      result = {
        ...result,
        itemStyle: {
          ...series.itemStyle,
          opacity: series.itemStyle?.opacity ?? defaultOpacity,
        },
      }
      break
  }

  // 特殊处理：为某些图表类型设置额外的透明度
  if (['heatmap', 'treemap', 'sunburst'].includes(type)) {
    result = {
      ...result,
      visualMap: {
        ...series.visualMap,
        inRange: {
          ...series.visualMap?.inRange,
          opacity: series.visualMap?.inRange?.opacity ?? defaultOpacity,
        },
      },
    }
  }

  return result
}

/**
 * 应用 markArea 样式到系列（填充/边框/标签），避免保留 ECharts 默认颜色与尺寸
 */
function applyMarkAreaStyles(series: any, config: ThemeConfig): any {
  const markArea = series?.markArea
  if (!markArea) return series

  const styled = {
    ...markArea,
    itemStyle: {
      ...markArea.itemStyle,
      color: markArea.itemStyle?.color ?? withAlpha(config.accent, 0.12),
      borderColor: markArea.itemStyle?.borderColor ?? withAlpha(config.border, 0.35),
      borderWidth: markArea.itemStyle?.borderWidth ?? config.size.strokeHairline,
    },
    label: {
      ...markArea.label,
      color: markArea.label?.color ?? config.foreground,
      fontSize: markArea.label?.fontSize ?? config.size.fontSm,
    },
    emphasis: markArea.emphasis
      ? {
          ...markArea.emphasis,
          itemStyle: {
            ...markArea.emphasis.itemStyle,
            color: markArea.emphasis.itemStyle?.color ?? withAlpha(config.accent, 0.18),
            borderColor: markArea.emphasis.itemStyle?.borderColor ?? withAlpha(config.border, 0.45),
          },
          label: {
            ...markArea.emphasis.label,
            color: markArea.emphasis.label?.color ?? config.foreground,
          },
        }
      : markArea.emphasis,
  }

  return {
    ...series,
    markArea: styled,
  }
}

/**
 * 基础系列样式应用函数（函数式版本）
 */
export function applySeriesStyles(series: any, index: number, config: ThemeConfig): any {
  const seriesColor = config.color.colors[index % config.color.colors.length]

  // 应用通用样式
  let result = applyItemStyleAndLabel(
    series,
    seriesColor,
    config.foreground,
    config.size.fontSm,
    config.size.lineHeightSm
  )

  // 应用线条样式
  result = applyLineStyles(result, seriesColor, config.size.strokeSeries)

  // 符号尺寸：仅在用户未显式配置时注入默认值（与 SizeMode 对齐）
  if (
    result &&
    result.symbolSize === undefined &&
    (result.type === 'line' ||
      result.type === 'area' ||
      result.type === 'scatter' ||
      result.type === 'effectScatter')
  ) {
    result = {
      ...result,
      symbolSize: config.size.symbolSm,
    }
  }

  // 应用透明度配置
  result = applyOpacityConfig(result, config.opacity)

  // 应用 markArea（系列的辅助区间标注）
  result = applyMarkAreaStyles(result, config)

  return result
}
