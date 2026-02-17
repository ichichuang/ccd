/**
 * useChartTheme - 图表主题 Hook（响应式版本）
 *
 * 本模块为 ECharts option 主题化边界层。applyThemeToOption 的 option 参数与返回值因 ECharts
 * 配置结构复杂且需兼容多版本，使用宽松类型；内部在可读性允许处可逐步使用 echarts 的 SeriesOption 等类型。
 */

import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { Ref, ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/modules/theme'
import { useSizeStore } from '@/stores/modules/size'
import type { ChartAdvancedConfig, ChartOpacityConfig, ThemeConfig } from './types'
import { DEFAULT_OPACITY_VALUES } from './constants'
import {
  getChartSizeTokens,
  getChartSystemVariables,
  generateChartPalette,
} from '@/utils/theme/chartUtils'
import { deepCloneWithFunctions } from './utils'
import { applyFontStylesToTargets } from './applyFontStyles'
import { applySeriesStyles } from './applySeriesStyles'
import { applyAxisStyles } from './applyAxisStyles'
import { applyTooltipStyles } from './applyTooltipStyles'
import { applyDataZoomStyles } from './applyDataZoomStyles'
import { applyTitleStyles } from './applyTitleStyles'
import { applyLegendStyles } from './applyLegendStyles'
import { applyVisualMapStyles } from './applyVisualMapStyles'
import { applyToolboxStyles } from './applyToolboxStyles'
import { applyBrushStyles } from './applyBrushStyles'
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
import { applyStylesToArray, withAlpha } from './utils'
import { mergeAdvancedConfigs } from './mergeAdvancedConfigs'

/**
 * 构建主题配置对象
 */
function buildThemeConfig(): ThemeConfig {
  const {
    foreground,
    mutedForeground,
    background,
    card,
    border,
    primary,
    primaryForeground,
    accent,
    secondary,
    success,
    warn,
    danger,
    info,
    help,
    paddings,
    gap,
    gapl,
    fontSize,
    fontSizeSmall,
  } = getChartSystemVariables()

  const size = getChartSizeTokens()

  const primaryColors = [primary, primary, primary, primary]
  const successColors = [success, success, success, success]
  const infoColors = [info, info, info, info]
  const warnColors = [warn, warn, warn, warn]
  const dangerColors = [danger, danger, danger, danger]
  const helpColors = [help, help, help, help]
  const contrastColors = [
    primaryForeground,
    primaryForeground,
    primaryForeground,
    primaryForeground,
  ]
  const secondaryColors = [secondary, secondary, secondary, secondary]

  const colors = generateChartPalette(primary, 24)

  return {
    font: {
      textColor: foreground,
      textColorSecondary: mutedForeground,
      fontSize,
      fontSizeSmall,
    },
    size,
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
    foreground,
    mutedForeground,
    background,
    card,
    border,
    accent,
    primaryForeground,
  }
}

/**
 * 应用主题到 ECharts 配置（函数式版本）
 */
function applyThemeToOption(
  option: any,
  opacityConfig?: ChartOpacityConfig,
  advancedConfig?: ChartAdvancedConfig,
  t?: (key: string) => string
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

  // 设置全局背景色
  if (!mergedOption.backgroundColor) {
    mergedOption.backgroundColor = themeConfig.background
  }

  // 设置全局文本样式
  mergedOption.textStyle = {
    ...mergedOption.textStyle,
    color: mergedOption.textStyle?.color ?? themeConfig.foreground,
    fontSize: mergedOption.textStyle?.fontSize ?? themeConfig.size.fontMd,
    lineHeight: mergedOption.textStyle?.lineHeight ?? themeConfig.size.lineHeightMd,
    textBorderColor: mergedOption.textStyle?.textBorderColor ?? 'transparent',
    textShadowColor: mergedOption.textStyle?.textShadowColor ?? 'transparent',
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

  // 应用标题样式
  if (mergedOption.title) {
    mergedOption.title = applyTitleStyles(mergedOption.title, themeConfig)
    mergedOption.title = applyFontStylesToTargets([mergedOption.title], themeConfig.font)[0]
    if (!mergedOption.title.textStyle?.fontSize) {
      mergedOption.title = {
        ...mergedOption.title,
        textStyle: {
          ...mergedOption.title.textStyle,
          fontSize: themeConfig.size.fontLg,
        },
      }
    }
    mergedOption.title = {
      ...mergedOption.title,
      left: mergedOption.title.left ?? 0,
      top: mergedOption.title.top ?? 0,
    }
  }

  // 应用图例样式
  if (mergedOption.legend) {
    const legendArray = Array.isArray(mergedOption.legend)
      ? mergedOption.legend
      : [mergedOption.legend]
    const styledLegend = applyStylesToArray(legendArray, (legend: any) => {
      const styled = applyLegendStyles(legend, themeConfig)
      return applyFontStylesToTargets([styled], themeConfig.font)[0]
    })
    mergedOption.legend = Array.isArray(mergedOption.legend) ? styledLegend : styledLegend[0]
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
      top: '16%',
      bottom: '4%',
      backgroundColor: 'transparent',
      containLabel: true,
    }
  } else {
    // 如果用户提供了 grid，确保 backgroundColor 使用架构配色
    mergedOption.grid = {
      ...mergedOption.grid,
      backgroundColor: mergedOption.grid.backgroundColor ?? 'transparent',
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
          radarConfig.axisName?.fontSize ?? themeConfig.size.fontSm ?? themeConfig.size.fontMd,
      }

      // 轴线
      radarConfig.axisLine = {
        ...(radarConfig.axisLine || {}),
        lineStyle: {
          ...(radarConfig.axisLine?.lineStyle || {}),
          color:
            radarConfig.axisLine?.lineStyle?.color ??
            withAlpha(themeConfig.mutedForeground || themeConfig.background, 0.35),
        },
      }

      // 分隔线
      radarConfig.splitLine = {
        ...(radarConfig.splitLine || {}),
        lineStyle: {
          ...(radarConfig.splitLine?.lineStyle || {}),
          color:
            radarConfig.splitLine?.lineStyle?.color ??
            withAlpha(themeConfig.mutedForeground || themeConfig.background, 0.25),
        },
      }

      // 分隔区域
      radarConfig.splitArea = {
        show: radarConfig.splitArea?.show ?? true,
        ...(radarConfig.splitArea || {}),
        areaStyle: {
          ...(radarConfig.splitArea?.areaStyle || {}),
          color: radarConfig.splitArea?.areaStyle?.color || [
            withAlpha(themeConfig.card || themeConfig.background, 0.06),
            withAlpha(themeConfig.background || themeConfig.card, 0.03),
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

  // 合并 visualMap 样式
  if (mergedOption.visualMap) {
    const visualMapArray = Array.isArray(mergedOption.visualMap)
      ? mergedOption.visualMap
      : [mergedOption.visualMap]
    const styledVisualMap = applyStylesToArray(visualMapArray, (visualMap: any) =>
      applyVisualMapStyles(visualMap, themeConfig)
    )
    mergedOption.visualMap = Array.isArray(mergedOption.visualMap)
      ? styledVisualMap
      : styledVisualMap[0]
  }

  // 合并 toolbox 样式
  if (mergedOption.toolbox) {
    mergedOption.toolbox = applyToolboxStyles(mergedOption.toolbox, themeConfig)
  }

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

  // 合并 brush 样式
  if (mergedOption.brush) {
    mergedOption.brush = applyBrushStyles(mergedOption.brush, themeConfig)
  }

  // 合并高级配置（动画、工具箱、标记点等）
  const finalOption = mergeAdvancedConfigs(mergedOption, advancedConfig, t)

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

  // 显式依赖主题/尺寸 Store，使切换主题或尺寸时 themedOption 自动重新计算
  const { t } = useI18n()
  const themeStore = useThemeStore()
  const sizeStore = useSizeStore()
  const { themeName, mode } = storeToRefs(themeStore)
  const { sizeName } = storeToRefs(sizeStore)

  // 缓存上次的输入与结果，仅在依赖（引用或值）变化时重算，减轻悬停等场景下的不必要 setOption
  const cacheRef = ref<{
    option: unknown
    opacity: unknown
    advanced: unknown
    theme: string
    mode: ThemeMode
    isDark: boolean
    size: string
    result: any
  } | null>(null)

  const themedOption = computed(() => {
    const theme = themeName.value
    const currentMode = mode.value
    const isDark = themeStore.isDark // 读取 isDark getter，Vue 会自动追踪 mode 和系统主题变化
    const size = sizeName.value
    const option = optionRef.value
    const opacity = opacityConfigRef?.value
    const advanced = advancedConfigRef?.value

    const c = cacheRef.value
    if (
      c &&
      c.option === option &&
      c.opacity === opacity &&
      c.advanced === advanced &&
      c.theme === theme &&
      c.mode === currentMode &&
      c.isDark === isDark &&
      c.size === size
    ) {
      return c.result
    }
    const result = applyThemeToOption(option, opacity, advanced, t)
    cacheRef.value = { option, opacity, advanced, theme, mode: currentMode, isDark, size, result }
    return result
  })

  return {
    themedOption,
  }
}
