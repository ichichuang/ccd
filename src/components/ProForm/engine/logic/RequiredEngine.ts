import type { FieldSchema } from '../types'

type ValuesRecord = Record<string, unknown>

export class RequiredEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): boolean {
    if (field.required === true) return true
    if (!field.requiredIf) return false
    return field.requiredIf({
      form: values,
      field: fieldName,
    })
  }
}
