import type { EChartsOption } from 'echarts'
import { isRecord } from './guards'

export class EChartsOptionValidationError extends Error {
  readonly details?: Record<string, unknown>

  constructor(message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'EChartsOptionValidationError'
    this.details = details
  }
}

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
    throw new EChartsOptionValidationError('ECharts adapter: input is not a plain object', {
      reason: 'expected object',
      received: typeof raw,
    })
  }

  if (!hasValidKnownOptionShapes(raw)) {
    throw new EChartsOptionValidationError('ECharts adapter: invalid option field structure', {
      reason: 'known field shape mismatch',
    })
  }

  return raw as EChartsOption
}
