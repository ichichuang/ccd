import type { FieldName, FieldSchema, FormFieldValue, FormValuesRecord } from '../types'
import { PRO_FORM_LOGGER } from '../utils/logger'
import { castValue } from '@ccd/shared-utils'

export class ComputedEngine<TValues extends FormValuesRecord = FormValuesRecord> {
  evaluate(
    field: FieldSchema<unknown, TValues>,
    values: TValues,
    fieldName: FieldName<TValues>
  ): FormFieldValue<TValues> {
    if (!field.computed) return undefined
    try {
      return castValue<FormFieldValue<TValues>>(
        field.computed({
          form: values,
          field: fieldName,
        })
      )
    } catch (error) {
      PRO_FORM_LOGGER.error(`computed error in field "${fieldName}"`, error)
      return undefined
    }
  }
}
