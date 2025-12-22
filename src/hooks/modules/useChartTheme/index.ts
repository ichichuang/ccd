// useChartTheme 主函数 - 响应式版本

import type { Ref } from 'vue'
import { computed, type ComputedRef } from 'vue'
import type {
  ChartAdvancedConfig,
  ChartOpacityConfig,
} from '@/components/modules/use-echarts/utils/types'
import { DEFAULT_OPACITY_VALUES } from '@/components/modules/use-echarts/utils/constants'
import { useColorStore, useSizeStore } from '@/stores'
import { deepCloneWithFunctions } from './utils'
import type { ThemeConfig } from './types'
import { applyFontStylesToTargets } from './applyFontStyles'
import { applySeriesStyles } from './applySeriesStyles'
import { applyAxisStyles } from './applyAxisStyles'
import { applyTooltipStyles } from './applyTooltipStyles'
import { applyDataZoomStyles } from './applyDataZoomStyles'
import { applyPieStyles } from './applyPieStyles'
import { applyRadarStyles } from './applyRadarStyles'
import { applyFunnelStyles } from './applyFunnelStyles'
import { applyBoxplotStyles } from './applyBoxplotStyles'
import { applyEffectScatterStyles } from './applyEffectScatterStyles'
import { applyGaugeStyles } from './applyGaugeStyles'
import { applyThemeRiverStyles } from './applyThemeRiverStyles'
import { applyCandlestickStyles } from './applyCandlestickStyles'
import { applyHeatmapStyles } from './applyHeatmapStyles'
import { applySankeyStyles } from './applySankeyStyles'
import { applySunburstStyles } from './applySunburstStyles'
import { applyGraphStyles } from './applyGraphStyles'
import { applyTreeStyles } from './applyTreeStyles'
import { applyTreemapStyles } from './applyTreemapStyles'
import { applyParallelStyles } from './applyParallelStyles'
import { applyPictorialBarStyles } from './applyPictorialBarStyles'
import { applyLinesStyles } from './applyLinesStyles'
import { applyStylesToArray } from './utils'
import { mergeAdvancedConfigs } from './mergeAdvancedConfigs'

// 将十六进制颜色转换为带透明度的 rgba 字符串；如果解析失败则返回原色
const withAlpha = (color: string | undefined, alpha: number): string | undefined => {
  if (!color || typeof color !== 'string') {
    return color
  }
  const hex = color.replace('#', '')
  if (hex.length === 6 || hex.length === 3) {
    const fullHex =
      hex.length === 3
        ? hex
            .split('')
            .map(ch => ch + ch)
            .join('')
        : hex
    const r = parseInt(fullHex.substring(0, 2), 16)
    const g = parseInt(fullHex.substring(2, 4), 16)
    const b = parseInt(fullHex.substring(4, 6), 16)
    if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
  return color
}

/**
 * 构建主题配置对象
 */
function buildThemeConfig(): ThemeConfig {
  const colorStore = useColorStore()
  const sizeStore = useSizeStore()

  // 获取主题颜色
  const textColor100 = colorStore.getText100
  const textColor200 = colorStore.getText200
  const bgColor200 = colorStore.getBg200
  const bgColor300 = colorStore.getBg300
  const accent100 = colorStore.getAccent100

  // 获取主题尺寸
  const paddings = sizeStore.getPaddingsValue
  const gap = sizeStore.getGap
  const gapl = sizeStore.getGapl
  const fontSize = sizeStore.getFontSizeValue
  const fontSizeSmall = sizeStore.getFontSizesValue

  // 获取颜色数组
  const primaryColors = [
    colorStore.getPrimaryColor,
    colorStore.getPrimaryColorHover,
    colorStore.getPrimaryColorActive,
    colorStore.getPrimaryColorBorder,
  ]
  const successColors = [
    colorStore.getSuccessColor,
    colorStore.getSuccessColorHover,
    colorStore.getSuccessColorActive,
    colorStore.getSuccessColorBorder,
  ]
  const infoColors = [
    colorStore.getInfoColor,
    colorStore.getInfoColorHover,
    colorStore.getInfoColorActive,
    colorStore.getInfoColorBorder,
  ]
  const warnColors = [
    colorStore.getWarnColor,
    colorStore.getWarnColorHover,
    colorStore.getWarnColorActive,
    colorStore.getWarnColorBorder,
  ]
  const dangerColors = [
    colorStore.getDangerColor,
    colorStore.getDangerColorHover,
    colorStore.getDangerColorActive,
    colorStore.getDangerColorBorder,
  ]
  const helpColors = [
    colorStore.getHelpColor,
    colorStore.getHelpColorHover,
    colorStore.getHelpColorActive,
    colorStore.getHelpColorBorder,
  ]
  const contrastColors = [
    colorStore.getContrastColor,
    colorStore.getContrastColorHover,
    colorStore.getContrastColorActive,
    colorStore.getContrastColorBorder,
  ]
  const secondaryColors = [
    colorStore.getSecondaryColor,
    colorStore.getSecondaryColorHover,
    colorStore.getSecondaryColorActive,
    colorStore.getSecondaryColorBorder,
  ]

  const colors = [
    primaryColors[0],
    successColors[0],
    infoColors[0],
    warnColors[0],
    dangerColors[0],
    helpColors[0],
    contrastColors[0],
    secondaryColors[0],
    primaryColors[1],
    secondaryColors[1],
    successColors[1],
    infoColors[1],
    warnColors[1],
    dangerColors[1],
    helpColors[1],
    contrastColors[1],
    primaryColors[2],
    successColors[2],
    infoColors[2],
    warnColors[2],
    dangerColors[2],
    helpColors[2],
    contrastColors[2],
    secondaryColors[2],
    primaryColors[3],
    successColors[3],
    infoColors[3],
    warnColors[3],
    dangerColors[3],
    helpColors[3],
    contrastColors[3],
    secondaryColors[3],
  ]

  return {
    font: {
      textColor: textColor100,
      textColorSecondary: textColor200,
      fontSize,
      fontSizeSmall,
    },
    color: {
      colors,
      primaryColors,
      successColors,
      infoColors,
      warnColors,
      dangerColors,
      helpColors,
      contrastColors,
      secondaryColors,
    },
    opacity: DEFAULT_OPACITY_VALUES,
    paddings,
    gap,
    gapl,
    textColor100,
    textColor200,
    bgColor200,
    bgColor300,
    accent100,
  }
}

/**
 * 应用主题到 ECharts 配置（函数式版本）
 */
function applyThemeToOption(
  option: any,
  opacityConfig?: ChartOpacityConfig,
  advancedConfig?: ChartAdvancedConfig
): any {
  if (!option || typeof option !== 'object') {
    return option
  }

  // 深拷贝原始配置，避免修改原始对象
  const mergedOption = deepCloneWithFunctions(option)

  // 合并透明度配置
  const finalOpacityConfig = { ...DEFAULT_OPACITY_VALUES, ...opacityConfig }

  // 构建主题配置对象
  const themeConfig: ThemeConfig = {
    ...buildThemeConfig(),
    opacity: finalOpacityConfig,
  }

  // 设置全局调色盘
  if (Array.isArray(mergedOption.colors) && !mergedOption.color) {
    mergedOption.color = mergedOption.colors
  }
  if (!mergedOption.color) {
    mergedOption.color = themeConfig.color.colors
  }
  // 若用户提供了自定义 color，则将后续主题内部使用的调色盘切换为该自定义颜色
  if (Array.isArray(mergedOption.color) && mergedOption.color.length > 0) {
    themeConfig.color.colors = mergedOption.color as string[]
  }

  // 应用字体样式到标题和图例
  if (mergedOption.title) {
    mergedOption.title = applyFontStylesToTargets([mergedOption.title], themeConfig.font)[0]
    if (!mergedOption.title.textStyle?.fontSize) {
      mergedOption.title = {
        ...mergedOption.title,
        textStyle: {
          ...mergedOption.title.textStyle,
          fontSize: themeConfig.font.fontSize * 1.3,
        },
      }
    }
    mergedOption.title = {
      ...mergedOption.title,
      left: mergedOption.title.left ?? 0,
      top: mergedOption.title.top ?? 0,
    }
  }

  if (mergedOption.legend) {
    mergedOption.legend = applyFontStylesToTargets([mergedOption.legend], themeConfig.font)[0]
    mergedOption.legend = {
      ...mergedOption.legend,
      right: mergedOption.legend.right ?? `${themeConfig.paddings}%`,
      top: mergedOption.legend.top ?? themeConfig.gapl,
    }
  }

  // 合并网格样式
  if (!mergedOption.grid) {
    mergedOption.grid = {
      left: `${themeConfig.paddings}%`,
      right: `${themeConfig.paddings}%`,
      top: '30%',
      bottom: '2%',
      backgroundColor: 'transparent',
      containLabel: true,
    }
  }

  // 合并坐标轴样式
  if (mergedOption.xAxis) {
    const xAxisArray = Array.isArray(mergedOption.xAxis) ? mergedOption.xAxis : [mergedOption.xAxis]
    const styledXAxis = applyStylesToArray(xAxisArray, (axis: any) =>
      applyAxisStyles(axis, themeConfig)
    )
    mergedOption.xAxis = Array.isArray(mergedOption.xAxis) ? styledXAxis : styledXAxis[0]
  }

  if (mergedOption.yAxis) {
    const yAxisArray = Array.isArray(mergedOption.yAxis) ? mergedOption.yAxis : [mergedOption.yAxis]
    const styledYAxis = applyStylesToArray(yAxisArray, (axis: any) =>
      applyAxisStyles(axis, themeConfig)
    )
    mergedOption.yAxis = Array.isArray(mergedOption.yAxis) ? styledYAxis : styledYAxis[0]
  }

  // 合并雷达坐标系样式（根级别的 radar 配置）
  if (mergedOption.radar) {
    const radarArray = Array.isArray(mergedOption.radar) ? mergedOption.radar : [mergedOption.radar]
    radarArray.forEach((radarConfig: any) => {
      // 指示器文字
      radarConfig.axisName = {
        ...(radarConfig.axisName || {}),
        color: radarConfig.axisName?.color ?? themeConfig.font.textColorSecondary,
        fontSize:
          radarConfig.axisName?.fontSize ??
          themeConfig.font.fontSizeSmall ??
          themeConfig.font.fontSize,
      }

      // 轴线
      radarConfig.axisLine = {
        ...(radarConfig.axisLine || {}),
        lineStyle: {
          ...(radarConfig.axisLine?.lineStyle || {}),
          color:
            radarConfig.axisLine?.lineStyle?.color ??
            withAlpha(themeConfig.textColor200 || themeConfig.bgColor200, 0.35),
        },
      }

      // 分隔线
      radarConfig.splitLine = {
        ...(radarConfig.splitLine || {}),
        lineStyle: {
          ...(radarConfig.splitLine?.lineStyle || {}),
          color:
            radarConfig.splitLine?.lineStyle?.color ??
            withAlpha(themeConfig.textColor200 || themeConfig.bgColor200, 0.25),
        },
      }

      // 分隔区域
      radarConfig.splitArea = {
        show: radarConfig.splitArea?.show ?? true,
        ...(radarConfig.splitArea || {}),
        areaStyle: {
          ...(radarConfig.splitArea?.areaStyle || {}),
          color: radarConfig.splitArea?.areaStyle?.color || [
            withAlpha(themeConfig.bgColor300 || themeConfig.bgColor200, 0.06),
            withAlpha(themeConfig.bgColor200 || themeConfig.bgColor300, 0.03),
          ],
        },
      }
    })

    mergedOption.radar = Array.isArray(mergedOption.radar) ? radarArray : radarArray[0]
  }

  // 合并系列样式
  if (mergedOption.series) {
    const seriesArray = Array.isArray(mergedOption.series)
      ? mergedOption.series
      : [mergedOption.series]

    const styledSeries = seriesArray.map((series: any, index: number) => {
      // 系列级 tooltip 样式融合
      let result = series
      if (series.tooltip) {
        result = {
          ...result,
          tooltip: applyTooltipStyles(series.tooltip, themeConfig),
        }
      }

      // 应用基础系列样式
      result = applySeriesStyles(result, index, themeConfig)

      // 根据图表类型应用特殊样式
      switch (result.type) {
        case 'pie':
          result = applyPieStyles(result, themeConfig)
          break
        case 'radar':
          result = applyRadarStyles(result, themeConfig)
          break
        case 'funnel':
          result = applyFunnelStyles(result, themeConfig)
          break
        case 'boxplot':
          result = applyBoxplotStyles(result, themeConfig)
          break
        case 'effectScatter':
          result = applyEffectScatterStyles(result, themeConfig, index)
          break
        case 'gauge':
          result = applyGaugeStyles(result, index, themeConfig)
          break
        case 'themeRiver':
          result = applyThemeRiverStyles(result, themeConfig)
          break
        case 'candlestick':
          result = applyCandlestickStyles(result, themeConfig)
          break
        case 'heatmap':
          result = applyHeatmapStyles(result, themeConfig)
          break
        case 'sankey':
          result = applySankeyStyles(result, themeConfig)
          break
        case 'sunburst':
          result = applySunburstStyles(result, themeConfig)
          break
        case 'graph':
          result = applyGraphStyles(result, themeConfig)
          break
        case 'tree':
          result = applyTreeStyles(result, themeConfig)
          break
        case 'treemap':
          result = applyTreemapStyles(result, themeConfig)
          break
        case 'parallel':
          result = applyParallelStyles(result, themeConfig)
          break
        case 'pictorialBar':
          result = applyPictorialBarStyles(result, themeConfig, index)
          break
        case 'lines':
          result = applyLinesStyles(result, themeConfig, index)
          break
        default:
          // 其他图表类型使用基础样式
          break
      }

      return result
    })

    mergedOption.series = Array.isArray(mergedOption.series) ? styledSeries : styledSeries[0]
  }

  // 合并提示框样式
  mergedOption.tooltip = applyTooltipStyles(mergedOption.tooltip, themeConfig)

  // 合并 dataZoom 样式
  if (mergedOption.dataZoom) {
    const dataZoomArray = Array.isArray(mergedOption.dataZoom)
      ? mergedOption.dataZoom
      : [mergedOption.dataZoom]
    const styledDataZoom = applyStylesToArray(dataZoomArray, (dataZoom: any) =>
      applyDataZoomStyles(dataZoom, themeConfig)
    )
    mergedOption.dataZoom = Array.isArray(mergedOption.dataZoom)
      ? styledDataZoom
      : styledDataZoom[0]
  }

  // 合并高级配置（动画、工具箱、标记点等）
  const finalOption = mergeAdvancedConfigs(mergedOption, advancedConfig)

  return finalOption
}

/**
 * useChartTheme - 响应式 Hook
 * 返回一个 computed 属性，当主题变化时自动重新计算
 */
export function useChartTheme(
  originalOption: Ref<any> | ComputedRef<any> | any,
  opacityConfig?:
    | Ref<ChartOpacityConfig | undefined>
    | ComputedRef<ChartOpacityConfig | undefined>
    | ChartOpacityConfig,
  advancedConfig?:
    | Ref<ChartAdvancedConfig | undefined>
    | ComputedRef<ChartAdvancedConfig | undefined>
    | ChartAdvancedConfig
) {
  // 将参数转换为 ref（如果还不是 ref）
  const optionRef =
    originalOption && 'value' in originalOption ? originalOption : computed(() => originalOption)
  const opacityConfigRef =
    opacityConfig && 'value' in opacityConfig ? opacityConfig : computed(() => opacityConfig)
  const advancedConfigRef =
    advancedConfig && 'value' in advancedConfig ? advancedConfig : computed(() => advancedConfig)

  // 返回响应式的 computed option
  const themedOption = computed(() => {
    const option = optionRef.value
    const opacity = opacityConfigRef?.value
    const advanced = advancedConfigRef?.value

    return applyThemeToOption(option, opacity, advanced)
  })

  return {
    themedOption,
  }
}
