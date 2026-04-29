import type { EChartsOption } from 'echarts'

/**
 * Type Boundary: ECharts Adapter
 * Validates raw input and safely narrows it to EChartsOption.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isObjectOrObjectArray(value: unknown): boolean {
  if (value === undefined) return true
  if (isRecord(value)) return true
  return Array.isArray(value) && value.every(item => isRecord(item))
}

function hasValidKnownOptionShapes(option: Record<string, unknown>): boolean {
  return (
    isObjectOrObjectArray(option.title) &&
    isObjectOrObjectArray(option.tooltip) &&
    isObjectOrObjectArray(option.legend) &&
    isObjectOrObjectArray(option.grid) &&
    isObjectOrObjectArray(option.xAxis) &&
    isObjectOrObjectArray(option.yAxis) &&
    isObjectOrObjectArray(option.dataset) &&
    isObjectOrObjectArray(option.series) &&
    isObjectOrObjectArray(option.visualMap) &&
    isObjectOrObjectArray(option.dataZoom)
  )
}

export function parseEChartsOption(raw: unknown): EChartsOption {
  if (!isRecord(raw)) {
    console.warn('[Boundary Error] Invalid ECharts option format:', raw)
    return {}
  }

  if (!hasValidKnownOptionShapes(raw)) {
    console.warn('[Boundary Error] Invalid ECharts option structure:', raw)
    return {}
  }

  return raw as EChartsOption
}
