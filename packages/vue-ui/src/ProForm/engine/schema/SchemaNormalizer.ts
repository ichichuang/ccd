import type {
  FieldSchema,
  FormSchema,
  FormSchemaNode,
  FormValuesRecord,
  GroupSchema,
  NormalizedFieldSchema,
  NormalizedFormSchema,
  NormalizedFormSchemaNode,
  NormalizedGroupSchema,
  ResponsiveSpan,
} from '../types'
import { PRO_FORM_DEFAULTS } from '../config'

function normalizeField<TValues extends FormValuesRecord>(
  field: FieldSchema<unknown, TValues>
): NormalizedFieldSchema<unknown, TValues> {
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

function normalizeGroup<TValues extends FormValuesRecord>(
  group: GroupSchema<TValues>,
  path: number[],
  counter: { seed: number }
): NormalizedGroupSchema<TValues> {
  const name = group.name ?? `__group_${path.join('_')}_${counter.seed++}`
  return {
    ...group,
    name,
    children: normalizeNodes(group.children, path, counter),
  }
}

function isGroupNode<TValues extends FormValuesRecord>(
  node: FormSchemaNode<TValues>
): node is GroupSchema<TValues> {
  return 'children' in node && node.children !== undefined
}

function normalizeNodes<TValues extends FormValuesRecord>(
  nodes: FormSchemaNode<TValues>[],
  parentPath: number[],
  counter: { seed: number }
): NormalizedFormSchemaNode<TValues>[] {
  return nodes.map((node, index) => {
    const currentPath = [...parentPath, index]
    if (isGroupNode(node)) {
      return normalizeGroup(node, currentPath, counter)
    }
    return normalizeField(node)
  })
}

export class SchemaNormalizer {
  static normalize<TValues extends FormValuesRecord>(
    schema: FormSchema<TValues>
  ): NormalizedFormSchema<TValues> {
    const counter: { seed: number } = { seed: 0 }
    const normalizedFields = normalizeNodes(schema.fields, [], counter)
    return {
      ...schema,
      fields: normalizedFields,
    }
  }
}
