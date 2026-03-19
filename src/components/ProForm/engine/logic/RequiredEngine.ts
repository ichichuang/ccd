import type { FieldSchema } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'

type ValuesRecord = Record<string, unknown>

export class RequiredEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): boolean {
    if (field.required === true) return true
    if (!field.requiredIf) return false
    try {
      return field.requiredIf({
        form: values,
        field: fieldName,
      })
    } catch (error) {
      PRO_FORM_LOGGER.error(`requiredIf error in field "${fieldName}"`, error)
      return false
    }
  }
}
