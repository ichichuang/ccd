import type { FieldSchema, FormSchemaNode } from './index'

export interface ProFormNodeProps {
  node: FormSchemaNode
}

export interface ProFormPrimeVueRendererProps {
  field: FieldSchema<unknown>
}
