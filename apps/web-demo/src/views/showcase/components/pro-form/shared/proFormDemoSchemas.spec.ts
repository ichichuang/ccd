import { readFileSync } from 'node:fs'
import type { FieldSchema, FormSchema, FormSchemaNode, ReactionContext } from '@ccd/vue-ui'
import { describe, expect, it, vi } from 'vitest'
import {
  createProFormDemoResolver,
  createProFormDemoSchema,
  type ProFormDemoValues,
} from './proFormDemoSchemas'

type DemoField = FieldSchema<unknown, ProFormDemoValues>
type DemoNode = FormSchemaNode<ProFormDemoValues>

const changedProFormFiles = [
  'apps/web-demo/src/views/showcase/components/pro-form/shared/ProFormDemoShell.vue',
  'e2e/phase2c-proform-ui.spec.ts',
] as const

const hardcodedColorPattern =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
const inlineStylePattern = /\b:?style=/

function t(key: string, params?: Record<string, string | number>): string {
  if (!params) return key

  return Object.entries(params).reduce(
    (message, [paramKey, paramValue]) => message.replace(`{${paramKey}}`, String(paramValue)),
    key
  )
}

function isGroupNode(node: DemoNode): node is Extract<DemoNode, { children: DemoNode[] }> {
  return 'children' in node && Array.isArray(node.children)
}

function isFieldNode(node: DemoNode): node is DemoField {
  return 'component' in node && typeof node.name === 'string'
}

function flattenFields(nodes: readonly DemoNode[]): DemoField[] {
  return nodes.flatMap(node => {
    if (isFieldNode(node)) return [node]
    if (isGroupNode(node)) return flattenFields(node.children)
    return []
  })
}

function getField(schema: FormSchema<ProFormDemoValues>, name: keyof ProFormDemoValues): DemoField {
  const field = flattenFields(schema.fields).find(candidate => candidate.name === name)
  if (!field) throw new Error(`Missing ProForm demo field: ${String(name)}`)
  return field
}

describe('ProForm demo schema behavior', () => {
  it('keeps required-field validation visible through the resolver', async () => {
    const resolver = createProFormDemoResolver(t, 'validation')
    const result = await resolver({
      requestName: '',
      summary: 'short',
      riskLevel: 'high',
      approvalNote: '',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.requestName).toContain('showcase.proForm.validation.requestNameRequired')
    expect(result.errors.summary).toContain('showcase.proForm.validation.summaryLength')
    expect(result.errors.approvalNote).toContain('showcase.proForm.validation.approvalNoteRequired')
  })

  it('keeps conditional visibility and required logic attached to approval fields', () => {
    const schema = createProFormDemoSchema(t, 'conditional-visibility')
    const approvalNote = getField(schema, 'approvalNote')

    expect(
      approvalNote.visibleIf?.({
        field: 'approvalNote',
        form: {
          needsApproval: false,
          riskLevel: 'low',
        },
      })
    ).toBe(false)
    expect(
      approvalNote.visibleIf?.({
        field: 'approvalNote',
        form: {
          needsApproval: true,
          riskLevel: 'low',
        },
      })
    ).toBe(true)
    expect(
      approvalNote.requiredIf?.({
        field: 'approvalNote',
        form: {
          riskLevel: 'high',
        },
      })
    ).toBe(true)
  })

  it('keeps dependency-driven computed values and reactions in schema data', () => {
    const dependencySchema = createProFormDemoSchema(t, 'dependencies-computed')
    const monthlyCost = getField(dependencySchema, 'monthlyCost')

    expect(
      monthlyCost.computed?.({
        field: 'monthlyCost',
        form: {
          seatCount: 10,
          seatPrice: 12,
        },
      })
    ).toBe(120)

    const reactionSchema = createProFormDemoSchema(t, 'reactions')
    const followUp = getField(reactionSchema, 'followUp')
    const setFieldValue = vi.fn()
    const reactionContext: ReactionContext<ProFormDemoValues> = {
      field: 'followUp',
      form: {
        publishReady: true,
      },
      getFieldState: () => undefined,
      setFieldProps: () => undefined,
      setFieldValue,
    }

    followUp.reactions?.[0]?.effect?.(reactionContext)

    expect(setFieldValue).toHaveBeenCalledWith(
      'followUp',
      'showcase.proForm.defaults.readyFollowUp'
    )
  })
})

describe('ProForm showcase source constraints', () => {
  it('does not introduce hardcoded colors or raw inline style bindings', () => {
    const violations = changedProFormFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: inline style` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
