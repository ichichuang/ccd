import { describe, expect, it, vi } from 'vitest'
import { use } from 'echarts/core'
import { ensureEChartsModulesForOption, getEChartsSeriesTypes } from './echarts-registry'

vi.mock('echarts/core', () => ({
  use: vi.fn(),
}))

vi.mock('echarts/renderers', () => ({
  CanvasRenderer: { id: 'CanvasRenderer' },
  SVGRenderer: { id: 'SVGRenderer' },
}))

vi.mock('echarts/charts', () => ({
  LineChart: { id: 'LineChart' },
  BarChart: { id: 'BarChart' },
  PieChart: { id: 'PieChart' },
  ScatterChart: { id: 'ScatterChart' },
  EffectScatterChart: { id: 'EffectScatterChart' },
  RadarChart: { id: 'RadarChart' },
  GaugeChart: { id: 'GaugeChart' },
  HeatmapChart: { id: 'HeatmapChart' },
  FunnelChart: { id: 'FunnelChart' },
}))

vi.mock('echarts/components', () => ({
  GridComponent: { id: 'GridComponent' },
  SingleAxisComponent: { id: 'SingleAxisComponent' },
  TooltipComponent: { id: 'TooltipComponent' },
  LegendComponent: { id: 'LegendComponent' },
  TitleComponent: { id: 'TitleComponent' },
  DatasetComponent: { id: 'DatasetComponent' },
  GraphicComponent: { id: 'GraphicComponent' },
  TransformComponent: { id: 'TransformComponent' },
  ToolboxComponent: { id: 'ToolboxComponent' },
  VisualMapComponent: { id: 'VisualMapComponent' },
  DataZoomComponent: { id: 'DataZoomComponent' },
  BrushComponent: { id: 'BrushComponent' },
  GeoComponent: { id: 'GeoComponent' },
  MarkPointComponent: { id: 'MarkPointComponent' },
  MarkLineComponent: { id: 'MarkLineComponent' },
  MarkAreaComponent: { id: 'MarkAreaComponent' },
  PolarComponent: { id: 'PolarComponent' },
  RadarComponent: { id: 'RadarComponent' },
  ParallelComponent: { id: 'ParallelComponent' },
}))

vi.mock('echarts/features', () => ({
  LegacyGridContainLabel: { id: 'LegacyGridContainLabel' },
}))

const mockedUse = vi.mocked(use)

describe('echarts-registry', () => {
  it('collects chart series types from single and array series options', () => {
    expect([...getEChartsSeriesTypes({ series: [{ type: 'bar' }, { type: 'gauge' }] })]).toEqual([
      'bar',
      'gauge',
    ])
    expect([...getEChartsSeriesTypes({ series: { type: 'line' } })]).toEqual(['line'])
  })

  it('registers advanced chart modules only when the option needs them', async () => {
    await ensureEChartsModulesForOption({ series: [{ type: 'line' }] })

    expect(mockedUse).toHaveBeenCalledTimes(1)
    expect(mockedUse.mock.calls[0][0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'LineChart' })])
    )
    expect(mockedUse.mock.calls[0][0]).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'GaugeChart' })])
    )

    await ensureEChartsModulesForOption({ series: [{ type: 'gauge' }] })
    await ensureEChartsModulesForOption({ series: [{ type: 'gauge' }] })

    expect(mockedUse).toHaveBeenCalledTimes(2)
    expect(mockedUse.mock.calls[1][0]).toEqual([{ id: 'GaugeChart' }])
  })
})
