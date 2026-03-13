import type { FieldSchema } from '../types'

type ValuesRecord = Record<string, unknown>

export class DisableEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): boolean {
    if (!field.disabledIf) return false
    return field.disabledIf({
      form: values,
      field: fieldName,
    })
  }
}
