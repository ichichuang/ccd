import type { FieldName, FieldSchema, FormValuesRecord } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'

export class DisableEngine<TValues extends FormValuesRecord = FormValuesRecord> {
  evaluate(
    field: FieldSchema<unknown, TValues>,
    values: TValues,
    fieldName: FieldName<TValues>
  ): boolean {
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
