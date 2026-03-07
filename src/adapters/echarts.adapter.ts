import type { EChartsOption } from 'echarts'

/**
 * Type Boundary: ECharts Adapter
 * Validates raw input and safely casts it to EChartsOption.
 * This is the ONLY place where raw chart data is allowed to be 'any'.
 */
export function parseEChartsOption(raw: unknown): EChartsOption {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    console.warn('[Boundary Error] Invalid ECharts option format:', raw)
    return {} as EChartsOption
  }
  // Validation passed, safe to cast
  return raw as EChartsOption
}
