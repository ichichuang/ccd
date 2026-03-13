import type { FieldSchema } from '../types'

type ValuesRecord = Record<string, unknown>

export class VisibilityEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): boolean {
    if (!field.visibleIf) return true
    return field.visibleIf({
      form: values,
      field: fieldName,
    })
  }
}
