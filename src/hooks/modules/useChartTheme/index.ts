/**
 * useChartTheme - 图表主题 Hook（响应式版本）
 *
 * 本模块为 ECharts option 主题化边界层。applyThemeToOption 的 option 参数与返回值因 ECharts
 * 配置结构复杂且需兼容多版本，使用宽松类型；内部在可读性允许处可逐步使用 echarts 的 SeriesOption 等类型。
 */

import { storeToRefs } from 'pinia'
import type { Ref, ComputedRef } from 'vue'
import type { EChartsOption } from 'echarts'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/modules/system'
import { useSizeStore } from '@/stores/modules/system'
import type { ChartAdvancedConfig, ChartOpacityConfig, ThemeConfig } from './types'
import { DEFAULT_OPACITY_VALUES } from './constants'
import {
  getChartSizeTokens,
  getChartSystemVariables,
  generateChartPalette,
} from '@/utils/theme/chartUtils'
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
  const v = getChartSystemVariables()
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
    fontSizeMd,
    fontSizeSm,
    ...metricRest
  } = v

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
      fontSizeMd,
      fontSizeSm,
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
    foreground,
    mutedForeground,
    background,
    card,
    border,
    accent,
    primaryForeground,
    fontSizeMd,
    fontSizeSm,
    ...metricRest,
  }
}

/**
 * 应用主题到 ECharts 配置（函数式版本）
 *
 * 边界约定：外部可以传入任意符合 EChartsOption 结构的对象，这里在入口处使用 any，
 * 立即通过类型断言收窄为 EChartsOption，防止 any 向外泄漏。
 */
function applyThemeToOption(
  rawOption: any,
  opacityConfig?: ChartOpacityConfig,
  advancedConfig?: ChartAdvancedConfig,
  t?: (key: string) => string
): EChartsOption | undefined {
  if (!rawOption || typeof rawOption !== 'object') {
    return rawOption as EChartsOption | undefined
  }

  // 轻量拷贝：主题化过程通过重新构建子结构的方式注入样式，
  // 避免每次都对整棵 option 做深度递归克隆（显著降低 CPU/GC）。
  const mergedOption = { ...(rawOption as Record<string, unknown>) } as EChartsOption

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
    lineHeight: (mergedOption.textStyle as any)?.lineHeight ?? themeConfig.size.lineHeightMd,
    textBorderColor: (mergedOption.textStyle as any)?.textBorderColor ?? 'transparent',
    textShadowColor: (mergedOption.textStyle as any)?.textShadowColor ?? 'transparent',
  } as any

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

  // 应用标题样式（ECharts title 可为 Object | Array，需要归一化处理）
  if (mergedOption.title) {
    const titleRaw: any = mergedOption.title
    const isTitleArray = Array.isArray(titleRaw)
    const titleArray: any[] = isTitleArray ? titleRaw : [titleRaw]

    const finalTitle = titleArray.map((title: any) => {
      let next = applyTitleStyles(title, themeConfig)
      next = applyFontStylesToTargets([next], themeConfig.font)[0]

      if (!next.textStyle?.fontSize) {
        next = {
          ...next,
          textStyle: {
            ...next.textStyle,
            fontSize: themeConfig.size.fontLg,
          },
        }
      }

      return {
        ...next,
        left: next.left ?? 0,
        top: next.top ?? 0,
      }
    })

    mergedOption.title = isTitleArray ? finalTitle : finalTitle[0]
  }

  // 应用图例样式
  if (mergedOption.legend) {
    const legendRaw: any = mergedOption.legend
    const isLegendArray = Array.isArray(legendRaw)
    const legendArray: any[] = isLegendArray ? legendRaw : [legendRaw]
    const styledLegend = applyStylesToArray(legendArray, (legend: any) => {
      const styled = applyLegendStyles(legend, themeConfig)
      return applyFontStylesToTargets([styled], themeConfig.font)[0]
    })
    const finalLegend = styledLegend.map((legend: any) => ({
      ...legend,
      right: legend.right ?? `${themeConfig.gapXs}%`,
      top: legend.top ?? themeConfig.gapSm,
    }))

    mergedOption.legend = isLegendArray ? finalLegend : finalLegend[0]
  }

  // 合并网格样式
  if (!mergedOption.grid) {
    mergedOption.grid = {
      left: `${themeConfig.gapXs}%`,
      right: `${themeConfig.gapXs}%`,
      top: `${themeConfig.gapMd}%`,
      bottom: `${themeConfig.gapXs}%`,
      backgroundColor: withAlpha(themeConfig.background, 0) ?? 'transparent',
      containLabel: true,
    }
  } else {
    const isGridArray = Array.isArray(mergedOption.grid)
    const gridRaw: any = mergedOption.grid
    const gridArray: any[] = isGridArray ? gridRaw : [gridRaw]
    const finalGrid = gridArray.map((g: any) => ({
      ...g,
      backgroundColor: g.backgroundColor ?? 'transparent',
    }))
    mergedOption.grid = isGridArray ? finalGrid : finalGrid[0]
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

  // 合并 parallelAxis（平行坐标维度轴）
  if (mergedOption.parallelAxis) {
    const parallelAxisArray = Array.isArray(mergedOption.parallelAxis)
      ? mergedOption.parallelAxis
      : [mergedOption.parallelAxis]
    const styled = applyStylesToArray(parallelAxisArray, (axis: any) =>
      applyAxisStyles(axis, themeConfig)
    )
    mergedOption.parallelAxis = Array.isArray(mergedOption.parallelAxis) ? styled : styled[0]
  }

  // 合并 polar（极坐标：angleAxis / radiusAxis）
  if (mergedOption.polar) {
    const polarArray = Array.isArray(mergedOption.polar) ? mergedOption.polar : [mergedOption.polar]
    polarArray.forEach((p: any) => {
      if (p?.angleAxis) p.angleAxis = applyAxisStyles(p.angleAxis, themeConfig)
      if (p?.radiusAxis) p.radiusAxis = applyAxisStyles(p.radiusAxis, themeConfig)
    })
    mergedOption.polar = Array.isArray(mergedOption.polar) ? polarArray : polarArray[0]
  }

  // 合并 singleAxis（单轴）
  if (mergedOption.singleAxis) {
    const singleAxisArray = Array.isArray(mergedOption.singleAxis)
      ? mergedOption.singleAxis
      : [mergedOption.singleAxis]
    const styled = applyStylesToArray(singleAxisArray, (axis: any) =>
      applyAxisStyles(axis, themeConfig)
    )
    mergedOption.singleAxis = Array.isArray(mergedOption.singleAxis) ? styled : styled[0]
  }

  // 合并 calendar（月/日/年标签与网格线）
  if (mergedOption.calendar) {
    const calendarArray = Array.isArray(mergedOption.calendar)
      ? mergedOption.calendar
      : [mergedOption.calendar]
    const styledCalendars = calendarArray.map((cal: any) => {
      if (!cal) return cal
      return {
        ...cal,
        itemStyle: {
          ...cal.itemStyle,
          // calendar 背景用于“格子”读感：用极弱透明卡片色避免与 canvas 融合丢层次
          color: cal.itemStyle?.color ?? withAlpha(themeConfig.card, 0.03),
          borderColor: cal.itemStyle?.borderColor ?? withAlpha(themeConfig.border, 0.22),
        },
        splitLine: {
          ...cal.splitLine,
          lineStyle: {
            ...cal.splitLine?.lineStyle,
            color: cal.splitLine?.lineStyle?.color ?? withAlpha(themeConfig.border, 0.35),
          },
        },
        dayLabel: {
          ...cal.dayLabel,
          color: cal.dayLabel?.color ?? themeConfig.foreground,
          fontSize: cal.dayLabel?.fontSize ?? themeConfig.size.fontSm,
        },
        monthLabel: {
          ...cal.monthLabel,
          color: cal.monthLabel?.color ?? themeConfig.foreground,
          fontSize: cal.monthLabel?.fontSize ?? themeConfig.size.fontSm,
        },
        yearLabel: {
          ...cal.yearLabel,
          color: cal.yearLabel?.color ?? themeConfig.foreground,
          fontSize: cal.yearLabel?.fontSize ?? themeConfig.size.fontSm,
        },
      }
    })
    mergedOption.calendar = Array.isArray(mergedOption.calendar)
      ? styledCalendars
      : styledCalendars[0]
  }

  // 合并 geo（地图组件：基础填充色与标签色）
  if (mergedOption.geo) {
    const geoArray = Array.isArray(mergedOption.geo) ? mergedOption.geo : [mergedOption.geo]
    const styledGeos = geoArray.map((g: any) => {
      if (!g) return g
      return {
        ...g,
        itemStyle: {
          ...g.itemStyle,
          areaColor: g.itemStyle?.areaColor ?? withAlpha(themeConfig.card, 0.03),
        },
        label: {
          ...g.label,
          color: g.label?.color ?? themeConfig.foreground,
          fontSize: g.label?.fontSize ?? themeConfig.size.fontSm,
        },
        regions: Array.isArray(g.regions)
          ? g.regions.map((r: any) => ({
              ...r,
              itemStyle: {
                ...r.itemStyle,
                areaColor: r.itemStyle?.areaColor ?? withAlpha(themeConfig.card, 0.03),
              },
              label: {
                ...r.label,
                color: r.label?.color ?? themeConfig.foreground,
              },
            }))
          : g.regions,
      }
    })
    mergedOption.geo = Array.isArray(mergedOption.geo) ? styledGeos : styledGeos[0]
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

  // 合并 timeline 控制器样式（统一文本、控制条、进度线与按钮风格）
  if (mergedOption.timeline) {
    const timelineArray = Array.isArray(mergedOption.timeline)
      ? mergedOption.timeline
      : [mergedOption.timeline]
    const styledTimelines = timelineArray.map((tl: any) => {
      if (!tl) return tl
      return {
        ...tl,
        backgroundColor: tl.backgroundColor ?? withAlpha(themeConfig.card, 0.02),
        borderColor: tl.borderColor ?? withAlpha(themeConfig.border, 0.35),
        borderWidth: tl.borderWidth ?? themeConfig.size.strokeHairline,
        lineStyle: {
          ...tl.lineStyle,
          color: tl.lineStyle?.color ?? withAlpha(themeConfig.mutedForeground, 0.45),
        },
        itemStyle: {
          ...tl.itemStyle,
          color: tl.itemStyle?.color ?? withAlpha(themeConfig.card, 0.05),
          borderColor: tl.itemStyle?.borderColor ?? withAlpha(themeConfig.border, 0.25),
        },
        controlStyle: {
          ...tl.controlStyle,
          color: tl.controlStyle?.color ?? withAlpha(themeConfig.accent, 0.18),
          borderColor: tl.controlStyle?.borderColor ?? withAlpha(themeConfig.accent, 0.5),
          itemSize: tl.controlStyle?.itemSize ?? themeConfig.size.symbolSm,
        },
        checkpointStyle: {
          ...tl.checkpointStyle,
          color: tl.checkpointStyle?.color ?? withAlpha(themeConfig.accent, 0.75),
          borderColor: tl.checkpointStyle?.borderColor ?? withAlpha(themeConfig.accent, 0.85),
          borderWidth: tl.checkpointStyle?.borderWidth ?? themeConfig.size.strokeHairline,
        },
        label: {
          ...tl.label,
          color: tl.label?.color ?? themeConfig.foreground,
          fontSize: tl.label?.fontSize ?? themeConfig.size.fontSm,
        },
        progress: {
          ...tl.progress,
          lineStyle: {
            ...tl.progress?.lineStyle,
            color: tl.progress?.lineStyle?.color ?? withAlpha(themeConfig.accent, 0.65),
          },
          itemStyle: {
            ...tl.progress?.itemStyle,
            borderColor: tl.progress?.itemStyle?.borderColor ?? withAlpha(themeConfig.accent, 0.65),
          },
          label: {
            ...tl.progress?.label,
            color: tl.progress?.label?.color ?? themeConfig.foreground,
            fontSize: tl.progress?.label?.fontSize ?? themeConfig.size.fontSm,
          },
        },
      }
    })

    mergedOption.timeline = Array.isArray(mergedOption.timeline)
      ? styledTimelines
      : styledTimelines[0]
  }

  // 合并根级 axisPointer（用于 axisPointer.link 联动时的统一指示器外观）
  if (mergedOption.axisPointer) {
    const ap: any = mergedOption.axisPointer
    mergedOption.axisPointer = {
      ...ap,
      lineStyle: {
        ...ap.lineStyle,
        color: ap.lineStyle?.color ?? withAlpha(themeConfig.mutedForeground, 0.5),
        width: ap.lineStyle?.width ?? themeConfig.size.strokeHairline,
        type: ap.lineStyle?.type ?? 'dashed',
      },
      crossStyle: {
        ...ap.crossStyle,
        color: ap.crossStyle?.color ?? withAlpha(themeConfig.accent, 0.6),
        width: ap.crossStyle?.width ?? themeConfig.size.strokeHairline,
      },
      shadowStyle: {
        ...ap.shadowStyle,
        color: ap.shadowStyle?.color ?? withAlpha(themeConfig.mutedForeground, 0.19),
      },
      label: {
        ...ap.label,
        backgroundColor: ap.label?.backgroundColor ?? withAlpha(themeConfig.card, 0.92),
        borderColor: ap.label?.borderColor ?? withAlpha(themeConfig.border, 0.45),
        borderWidth: ap.label?.borderWidth ?? themeConfig.size.strokeHairline,
        color: ap.label?.color ?? themeConfig.foreground,
        fontSize: ap.label?.fontSize ?? themeConfig.size.fontSm,
      },
    }
  }

  // 合并高级配置（动画、工具箱、标记点等）
  const finalOption = mergeAdvancedConfigs(
    mergedOption,
    advancedConfig,
    t,
    themeConfig
  ) as EChartsOption

  return finalOption
}

export interface UseChartThemeReturn {
  themedOption: ComputedRef<EChartsOption | undefined>
}

/**
 * useChartTheme - 响应式 Hook
 * 返回一个 computed 属性，当主题变化时自动重新计算
 */
export function useChartTheme(
  originalOption:
    | Ref<EChartsOption | undefined>
    | ComputedRef<EChartsOption | undefined>
    | EChartsOption
    | undefined,
  opacityConfig?:
    | Ref<ChartOpacityConfig | undefined>
    | ComputedRef<ChartOpacityConfig | undefined>
    | ChartOpacityConfig,
  advancedConfig?:
    | Ref<ChartAdvancedConfig | undefined>
    | ComputedRef<ChartAdvancedConfig | undefined>
    | ChartAdvancedConfig
): UseChartThemeReturn {
  // 将参数转换为 ref（如果还不是 ref）
  const optionRef: Ref<EChartsOption | undefined> | ComputedRef<EChartsOption | undefined> = isRef(
    originalOption
  )
    ? (originalOption as Ref<EChartsOption | undefined>)
    : computed<EChartsOption | undefined>(() => originalOption)
  const opacityConfigRef:
    | Ref<ChartOpacityConfig | undefined>
    | ComputedRef<ChartOpacityConfig | undefined> = isRef(opacityConfig)
    ? (opacityConfig as Ref<ChartOpacityConfig | undefined>)
    : computed<ChartOpacityConfig | undefined>(() => opacityConfig)
  const advancedConfigRef:
    | Ref<ChartAdvancedConfig | undefined>
    | ComputedRef<ChartAdvancedConfig | undefined> = isRef(advancedConfig)
    ? (advancedConfig as Ref<ChartAdvancedConfig | undefined>)
    : computed<ChartAdvancedConfig | undefined>(() => advancedConfig)

  // 显式依赖主题/尺寸 Store，使切换主题或尺寸时 themedOption 自动重新计算
  const { t } = useI18n()
  const themeStore = useThemeStore()
  const sizeStore = useSizeStore()
  const { themeName, mode } = storeToRefs(themeStore)
  const { sizeName } = storeToRefs(sizeStore)

  // 缓存上次的输入与结果，仅在依赖（引用或值）变化时重算，减轻悬停等场景下的不必要 setOption
  const cacheRef = ref<{
    option: EChartsOption | undefined
    opacity: unknown
    advanced: unknown
    theme: string
    mode: ThemeMode
    isDark: boolean
    size: string
    result: EChartsOption | undefined
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
    const result: EChartsOption | undefined = applyThemeToOption(option, opacity, advanced, t) as
      | EChartsOption
      | undefined
    cacheRef.value = { option, opacity, advanced, theme, mode: currentMode, isDark, size, result }
    return result
  }) as ComputedRef<EChartsOption | undefined>

  return {
    themedOption,
  }
}
