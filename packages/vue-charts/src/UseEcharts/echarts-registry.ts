import { use } from 'echarts/core'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import { isRecord } from '../guards'
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  RadarChart,
} from 'echarts/charts'
import {
  GridComponent,
  SingleAxisComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  GraphicComponent,
  TransformComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  BrushComponent,
  AxisPointerComponent,
  CalendarComponent,
  GeoComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  PolarComponent,
  RadarComponent,
  ParallelComponent,
  TimelineComponent,
} from 'echarts/components'
import { LegacyGridContainLabel } from 'echarts/features'

type LazyChartType =
  | 'boxplot'
  | 'candlestick'
  | 'funnel'
  | 'gauge'
  | 'graph'
  | 'heatmap'
  | 'lines'
  | 'parallel'
  | 'pictorialBar'
  | 'sankey'
  | 'sunburst'
  | 'themeRiver'
  | 'tree'
  | 'treemap'

const LAZY_CHART_LOADERS = {
  boxplot: async () => (await import('echarts/charts')).BoxplotChart,
  candlestick: async () => (await import('echarts/charts')).CandlestickChart,
  funnel: async () => (await import('echarts/charts')).FunnelChart,
  gauge: async () => (await import('echarts/charts')).GaugeChart,
  graph: async () => (await import('echarts/charts')).GraphChart,
  heatmap: async () => (await import('echarts/charts')).HeatmapChart,
  lines: async () => (await import('echarts/charts')).LinesChart,
  parallel: async () => (await import('echarts/charts')).ParallelChart,
  pictorialBar: async () => (await import('echarts/charts')).PictorialBarChart,
  sankey: async () => (await import('echarts/charts')).SankeyChart,
  sunburst: async () => (await import('echarts/charts')).SunburstChart,
  themeRiver: async () => (await import('echarts/charts')).ThemeRiverChart,
  tree: async () => (await import('echarts/charts')).TreeChart,
  treemap: async () => (await import('echarts/charts')).TreemapChart,
} satisfies Record<LazyChartType, () => Promise<unknown>>

const LAZY_CHART_TYPES = new Set<LazyChartType>(Object.keys(LAZY_CHART_LOADERS) as LazyChartType[])
let baseRegistered = false
const registeredAdvancedTypes = new Set<string>()

export function registerBaseEChartsModules(): void {
  if (baseRegistered) return
  baseRegistered = true

  use([
    CanvasRenderer,
    SVGRenderer,
    LineChart,
    BarChart,
    PieChart,
    ScatterChart,
    EffectScatterChart,
    RadarChart,
    GridComponent,
    SingleAxisComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    DatasetComponent,
    GraphicComponent,
    TransformComponent,
    ToolboxComponent,
    VisualMapComponent,
    DataZoomComponent,
    BrushComponent,
    AxisPointerComponent,
    CalendarComponent,
    GeoComponent,
    MarkPointComponent,
    MarkLineComponent,
    MarkAreaComponent,
    PolarComponent,
    RadarComponent,
    ParallelComponent,
    TimelineComponent,
    LegacyGridContainLabel,
  ])
}

function collectSeriesTypes(value: unknown, out: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach(item => collectSeriesTypes(item, out))
    return
  }

  if (!isRecord(value)) return

  if (typeof value.type === 'string') {
    out.add(value.type)
  }
}

export function getEChartsSeriesTypes(option: unknown): Set<string> {
  const types = new Set<string>()
  if (!isRecord(option)) return types
  collectSeriesTypes(option.series, types)
  return types
}

export function getMissingEChartsLazySeriesTypes(option: unknown): string[] {
  return [...getEChartsSeriesTypes(option)].filter(
    type => LAZY_CHART_TYPES.has(type as LazyChartType) && !registeredAdvancedTypes.has(type)
  )
}

async function registerAdvancedChartType(type: string): Promise<void> {
  if (registeredAdvancedTypes.has(type)) return

  if (!LAZY_CHART_TYPES.has(type as LazyChartType)) return

  const chart = await LAZY_CHART_LOADERS[type as LazyChartType]()
  use([chart])

  registeredAdvancedTypes.add(type)
}

export async function ensureEChartsModulesForOption(option: unknown): Promise<void> {
  registerBaseEChartsModules()

  const advancedTypes = [...getEChartsSeriesTypes(option)].filter(type =>
    LAZY_CHART_TYPES.has(type as LazyChartType)
  )

  await Promise.all(advancedTypes.map(type => registerAdvancedChartType(type)))
}
