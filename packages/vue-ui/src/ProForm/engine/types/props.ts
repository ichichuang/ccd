import type { FieldSchema, FormSchemaNode, FormValuesRecord } from './index'

export interface ProFormNodeProps<TValues extends FormValuesRecord = FormValuesRecord> {
  node: FormSchemaNode<TValues>
}

export interface ProFormPrimeVueRendererProps<TValues extends FormValuesRecord = FormValuesRecord> {
  field: FieldSchema<unknown, TValues>
}
