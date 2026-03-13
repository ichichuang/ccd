import type {
  FieldSchema,
  FormSchema,
  FormSchemaNode,
  GroupSchema,
  NodeLayoutSchema,
  ResponsiveSpan,
} from '../types'

type LayoutFieldSchema = FieldSchema<unknown> & {
  span?: ResponsiveSpan
  layout?: {
    span?: ResponsiveSpan
  } & Partial<NodeLayoutSchema>
}

let groupIdSeed = 0

function normalizeField(field: FieldSchema<unknown>): FieldSchema<unknown> {
  const layoutField = field as LayoutFieldSchema
  const span: ResponsiveSpan | undefined = layoutField.span ?? layoutField.layout?.span

  return {
    ...field,
    component: field.component ?? 'input',
    props: field.props ?? {},
    // 保留 ResponsiveSpan 原始结构；在渲染层通过 resolveSpan 统一解析
    span: span ?? 12,
  } as FieldSchema<unknown>
}

function normalizeGroup(group: GroupSchema, path: number[]): GroupSchema {
  const name = group.name ?? `__group_${path.join('_')}_${groupIdSeed++}`
  return {
    ...group,
    name,
    children: normalizeNodes(group.children, path),
  }
}

function normalizeNodes(nodes: FormSchemaNode[], parentPath: number[]): FormSchemaNode[] {
  return nodes.map((node, index) => {
    const currentPath = [...parentPath, index]
    if ((node as GroupSchema).children) {
      return normalizeGroup(node as GroupSchema, currentPath)
    }
    return normalizeField(node as FieldSchema<unknown>)
  })
}

export class SchemaNormalizer {
  static normalize(schema: FormSchema): FormSchema {
    groupIdSeed = 0
    const normalizedFields = normalizeNodes(schema.fields, [])
    return {
      ...schema,
      fields: normalizedFields,
    }
  }
}
