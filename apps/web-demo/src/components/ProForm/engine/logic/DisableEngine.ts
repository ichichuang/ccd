import type { FieldSchema } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'

type ValuesRecord = Record<string, unknown>

export class DisableEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): boolean {
    if (!field.disabledIf) return false
    try {
      return field.disabledIf({
        form: values,
        field: fieldName,
      })
    } catch (error) {
      PRO_FORM_LOGGER.error(`disabledIf error in field "${fieldName}"`, error)
      return false
    }
  }
}
