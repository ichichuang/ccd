import type { FieldSchema } from '../types'

type ValuesRecord = Record<string, unknown>

export class ComputedEngine<TValues extends ValuesRecord = ValuesRecord> {
  evaluate(field: FieldSchema<unknown>, values: TValues, fieldName: string): unknown {
    if (!field.computed) return undefined
    return field.computed({
      form: values,
      field: fieldName,
    })
  }
}
