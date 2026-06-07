import type { FieldName, FieldSchema, FormValuesRecord } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'

export class VisibilityEngine<TValues extends FormValuesRecord = FormValuesRecord> {
  evaluate(
    field: FieldSchema<unknown, TValues>,
    values: TValues,
    fieldName: FieldName<TValues>
  ): boolean {
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
