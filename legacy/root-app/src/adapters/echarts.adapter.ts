import type { EChartsOption } from 'echarts'
import { isRecord } from '@/utils/guards'
import { ErrorType, HttpRequestError } from '@/utils/http/errors'

/**
 * Type Boundary: ECharts Adapter
 * Validates raw input and safely narrows it to EChartsOption.
 */

function isObjectOrObjectArray(value: unknown): boolean {
  if (value === undefined) return true
  if (isRecord(value)) return true
  return Array.isArray(value) && value.every(item => isRecord(item))
}

const KNOWN_OPTION_FIELDS = [
  'title',
  'tooltip',
  'legend',
  'grid',
  'xAxis',
  'yAxis',
  'dataset',
  'series',
  'visualMap',
  'dataZoom',
] as const

function hasValidKnownOptionShapes(option: Record<string, unknown>): boolean {
  return KNOWN_OPTION_FIELDS.every(
    field => !(field in option) || isObjectOrObjectArray(option[field])
  )
}

export function parseEChartsOption(raw: unknown): EChartsOption {
  if (!isRecord(raw)) {
    throw new HttpRequestError(
      'ECharts adapter: input is not a plain object',
      ErrorType.VALIDATION,
      undefined,
      undefined,
      { reason: 'expected object', received: typeof raw },
      false
    )
  }

  if (!hasValidKnownOptionShapes(raw)) {
    throw new HttpRequestError(
      'ECharts adapter: invalid option field structure',
      ErrorType.VALIDATION,
      undefined,
      undefined,
      { reason: 'known field shape mismatch' },
      false
    )
  }

  return raw as EChartsOption
}
