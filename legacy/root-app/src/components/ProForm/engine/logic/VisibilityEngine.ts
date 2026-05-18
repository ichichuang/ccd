import type { FieldSchema } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'

type ValuesRecord = Record<string, unknown>

export class VisibilityEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): boolean {
    if (!field.visibleIf) return true
    try {
      return field.visibleIf({
        form: values,
        field: fieldName,
      })
    } catch (error) {
      PRO_FORM_LOGGER.error(`visibleIf error in field "${fieldName}"`, error)
      return true
    }
  }
}
