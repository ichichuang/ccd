// ECharts 系列样式边界：参数与 ECharts 系列类型一致，内部使用 any 避免强依赖 echarts 内部类型。
import type { ThemeConfig } from './types'

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
    line: opacityConfig.lineArea ?? opacityConfig.area ?? 0.8,
    area: opacityConfig.area ?? 0.8,
    bar: opacityConfig.bar ?? 0.8,
    scatter: opacityConfig.scatter ?? 0.8,
    effectScatter: opacityConfig.scatter ?? 0.8,
    radar: opacityConfig.radar ?? 0.8,
    funnel: opacityConfig.funnel ?? 0.8,
    gauge: opacityConfig.gauge ?? 0.8,
    pie: 0.8,
    heatmap: 0.8,
    treemap: 0.8,
    sunburst: 0.8,
    sankey: 0.8,
    themeRiver: 0.8,
    boxplot: 0.8,
    candlestick: 0.8,
    graph: 0.8,
    lines: 0.8,
    map: 0.8,
    parallel: 0.8,
    pictorialBar: 0.8,
    liquidFill: 0.8,
    wordCloud: 0.8,
  }

  const defaultOpacity = opacityMap[type] ?? 0.8

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
    default:
      // 对于其他类型，应用到 itemStyle
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

  return result
}
