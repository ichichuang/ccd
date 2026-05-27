import type { FieldSchema, FormSchema, FormSchemaNode, GroupSchema, ResponsiveSpan } from '../types'
import { PRO_FORM_DEFAULTS } from '../config'

function normalizeField(field: FieldSchema<unknown>): FieldSchema<unknown> {
  const span: ResponsiveSpan | undefined = field.span ?? field.layout?.span

  return {
    ...field,
    component: field.component ?? 'input',
    props: field.props ?? {},
    // 保留 ResponsiveSpan 原始结构；在渲染层通过 resolveSpan 统一解析
    // 默认列数统一由 PRO_FORM_DEFAULTS.gridSpan 控制，避免魔法数
    span: span ?? PRO_FORM_DEFAULTS.gridSpan,
  }
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

function isGroupNode(node: FormSchemaNode): node is GroupSchema {
  return 'children' in node && node.children !== undefined
}

function normalizeNodes(
  nodes: FormSchemaNode[],
  parentPath: number[],
  counter: { seed: number }
): FormSchemaNode[] {
  return nodes.map((node, index) => {
    const currentPath = [...parentPath, index]
    if (isGroupNode(node)) {
      return normalizeGroup(node, currentPath, counter)
    }
    return normalizeField(node)
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
