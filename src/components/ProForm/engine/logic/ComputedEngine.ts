import type { FieldSchema } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'

type ValuesRecord = Record<string, unknown>

export class ComputedEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): unknown {
    if (!field.computed) return undefined
    try {
      return field.computed({
        form: values,
        field: fieldName,
      })
    } catch (error) {
      PRO_FORM_LOGGER.error(`computed error in field "${fieldName}"`, error)
      return undefined
    }
  }
}
