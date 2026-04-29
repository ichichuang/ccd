import { use } from 'echarts/core'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
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
  GeoComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  PolarComponent,
  RadarComponent,
  ParallelComponent,
} from 'echarts/components'
import { LegacyGridContainLabel } from 'echarts/features'

const ADVANCED_CHART_TYPES = new Set(['gauge', 'heatmap', 'funnel'])
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
    GeoComponent,
    MarkPointComponent,
    MarkLineComponent,
    MarkAreaComponent,
    PolarComponent,
    RadarComponent,
    ParallelComponent,
    LegacyGridContainLabel,
  ])
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
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

async function registerAdvancedChartType(type: string): Promise<void> {
  if (registeredAdvancedTypes.has(type)) return

  if (type === 'gauge') {
    const { GaugeChart: gaugeChart } = await import('echarts/charts')
    use([gaugeChart])
  } else if (type === 'heatmap') {
    const { HeatmapChart: heatmapChart } = await import('echarts/charts')
    use([heatmapChart])
  } else if (type === 'funnel') {
    const { FunnelChart: funnelChart } = await import('echarts/charts')
    use([funnelChart])
  }

  registeredAdvancedTypes.add(type)
}

export async function ensureEChartsModulesForOption(option: unknown): Promise<void> {
  registerBaseEChartsModules()

  const advancedTypes = [...getEChartsSeriesTypes(option)].filter(type =>
    ADVANCED_CHART_TYPES.has(type)
  )

  await Promise.all(advancedTypes.map(type => registerAdvancedChartType(type)))
}
