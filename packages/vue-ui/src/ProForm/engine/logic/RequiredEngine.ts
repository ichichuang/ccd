import type { FieldName, FieldSchema, FormValuesRecord } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'

export class RequiredEngine<TValues extends FormValuesRecord = FormValuesRecord> {
  evaluate(
    field: FieldSchema<unknown, TValues>,
    values: TValues,
    fieldName: FieldName<TValues>
  ): boolean {
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
