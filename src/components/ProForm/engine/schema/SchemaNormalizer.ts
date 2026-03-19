import type {
  FieldSchema,
  FormSchema,
  FormSchemaNode,
  GroupSchema,
  NodeLayoutSchema,
  ResponsiveSpan,
} from '../types'
import { PRO_FORM_DEFAULTS } from '../config'

type LayoutFieldSchema = FieldSchema<unknown> & {
  span?: ResponsiveSpan
  layout?: {
    span?: ResponsiveSpan
  } & Partial<NodeLayoutSchema>
}

function normalizeField(field: FieldSchema<unknown>): FieldSchema<unknown> {
  const layoutField = field as LayoutFieldSchema
  const span: ResponsiveSpan | undefined = layoutField.span ?? layoutField.layout?.span

  return {
    ...field,
    component: field.component ?? 'input',
    props: field.props ?? {},
    // 保留 ResponsiveSpan 原始结构；在渲染层通过 resolveSpan 统一解析
    // 默认列数统一由 PRO_FORM_DEFAULTS.gridSpan 控制，避免魔法数
    span: span ?? PRO_FORM_DEFAULTS.gridSpan,
  } as FieldSchema<unknown>
}

function normalizeGroup(
  group: GroupSchema,
  path: number[],
  counter: { seed: number }
): GroupSchema {
  const name = group.name ?? `__group_${path.join('_')}_${counter.seed++}`
  return {
    ...group,
    name,
    children: normalizeNodes(group.children, path, counter),
  }
}

function normalizeNodes(
  nodes: FormSchemaNode[],
  parentPath: number[],
  counter: { seed: number }
): FormSchemaNode[] {
  return nodes.map((node, index) => {
    const currentPath = [...parentPath, index]
    if ((node as GroupSchema).children) {
      return normalizeGroup(node as GroupSchema, currentPath, counter)
    }
    return normalizeField(node as FieldSchema<unknown>)
  })
}

export class SchemaNormalizer {
  static normalize(schema: FormSchema): FormSchema {
    const counter: { seed: number } = { seed: 0 }
    const normalizedFields = normalizeNodes(schema.fields, [], counter)
    return {
      ...schema,
      fields: normalizedFields,
    }
  }
}
