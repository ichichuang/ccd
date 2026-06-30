// @vitest-environment jsdom
/// <reference types="vite/client" />
/* eslint-disable vue/one-component-per-file -- PrimeVue stubs stay local to this focused component spec. */
import { mount } from '@vue/test-utils'
import { computed, defineComponent, type Component, type PropType } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { ProTreeTable as RootProTreeTable } from '..'
import ProTreeTable from './ProTreeTable.vue'
import proTreeTableSource from './ProTreeTable.vue?raw'
import type {
  ProTreeTableColumn,
  ProTreeTableExpandedKeys,
  ProTreeTableNode,
  ProTreeTableSelectionKeys,
} from './types'

interface TreeDemoRow extends Record<string, unknown> {
  name: string
  owner: string
  status: string
}

interface PrimeTreeNodeStub {
  key: string
  data?: TreeDemoRow
  children?: PrimeTreeNodeStub[]
}

interface ProTreeTableTestProps {
  nodes: ProTreeTableNode<TreeDemoRow>[]
  columns: ProTreeTableColumn<TreeDemoRow>[]
  loading: boolean
  selectionMode: 'single' | 'multiple' | 'checkbox'
  expandedKeys: ProTreeTableExpandedKeys
  selectionKeys: ProTreeTableSelectionKeys
}

vi.mock('primevue/treetable', () => ({
  default: defineComponent({
    name: 'TreeTableStub',
    props: {
      value: {
        type: Array as PropType<PrimeTreeNodeStub[]>,
        default: () => [],
      },
      expandedKeys: {
        type: Object as PropType<ProTreeTableExpandedKeys>,
        default: undefined,
      },
      selectionKeys: {
        type: [String, Array, Object] as PropType<ProTreeTableSelectionKeys>,
        default: undefined,
      },
      selectionMode: {
        type: String,
        default: undefined,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    emits: [
      'update:expandedKeys',
      'update:selectionKeys',
      'node-expand',
      'node-collapse',
      'node-select',
      'node-unselect',
    ],
    setup(props) {
      function flatten(nodes: readonly PrimeTreeNodeStub[]): PrimeTreeNodeStub[] {
        return nodes.flatMap(node => [node, ...flatten(node.children ?? [])])
      }

      const flattenedNodes = computed(() => flatten(props.value))

      return { flattenedNodes }
    },
    template: `
      <section
        data-testid="prime-tree-table-stub"
        :data-loading="String(loading)"
        :data-selection-mode="selectionMode || ''"
      >
        <slot />
        <button
          type="button"
          data-testid="emit-expanded"
          @click="$emit('update:expandedKeys', { operations: true }); $emit('node-expand', value[0])"
        >
          expand
        </button>
        <button
          type="button"
          data-testid="emit-collapsed"
          @click="$emit('node-collapse', value[0])"
        >
          collapse
        </button>
        <button
          type="button"
          data-testid="emit-selection"
          @click="$emit('update:selectionKeys', { operations: true }); $emit('node-select', value[0])"
        >
          select
        </button>
        <button
          type="button"
          data-testid="emit-unselect"
          @click="$emit('node-unselect', value[0])"
        >
          unselect
        </button>
        <div
          v-for="node in flattenedNodes"
          :key="node.key"
          data-testid="tree-row"
          :data-key="node.key"
        >
          <span>{{ node.data?.name }}</span>
          <span>{{ node.data?.owner }}</span>
          <span>{{ node.data?.status }}</span>
        </div>
      </section>
    `,
  }),
}))

vi.mock('primevue/column', () => ({
  default: defineComponent({
    name: 'ColumnStub',
    props: {
      field: {
        type: String,
        default: undefined,
      },
      header: {
        type: String,
        default: undefined,
      },
      expander: {
        type: Boolean,
        default: false,
      },
    },
    template: `
      <div
        data-testid="prime-tree-column"
        :data-field="field || ''"
        :data-header="header || ''"
        :data-expander="String(Boolean(expander))"
      />
    `,
  }),
}))

const columns: ProTreeTableColumn<TreeDemoRow>[] = [
  { id: 'name', field: 'name', title: 'Capability' },
  { id: 'owner', field: 'owner', title: 'Owner' },
  { id: 'status', field: 'status', title: 'Status' },
]

const nodes: ProTreeTableNode<TreeDemoRow>[] = [
  {
    key: 'operations',
    data: {
      name: 'Operations',
      owner: 'Runtime',
      status: 'Ready',
    },
    children: [
      {
        key: 'operations.telemetry',
        data: {
          name: 'Telemetry',
          owner: 'Runtime',
          status: 'Preview',
        },
      },
    ],
  },
]

function mountTreeTable(extraProps: Partial<ProTreeTableTestProps> = {}) {
  return mount(ProTreeTable as unknown as Component, {
    props: {
      nodes,
      columns,
      selectionMode: 'checkbox',
      expandedKeys: { operations: true },
      selectionKeys: {},
      ...extraProps,
    },
  })
}

function stripComments(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
}

describe('ProTreeTable', () => {
  it('renders static tree nodes through PrimeVue TreeTable without ProTable flat data', () => {
    const wrapper = mountTreeTable()

    expect(wrapper.get('[data-testid="prime-tree-table-stub"]').attributes('data-loading')).toBe(
      'false'
    )
    expect(wrapper.text()).toContain('Operations')
    expect(wrapper.text()).toContain('Telemetry')
    expect(
      wrapper.findAll('[data-testid="tree-row"]').map(row => row.attributes('data-key'))
    ).toEqual(['operations', 'operations.telemetry'])
  })

  it('marks the first configured column as the TreeTable expander column', () => {
    const wrapper = mountTreeTable()
    const renderedColumns = wrapper.findAll('[data-testid="prime-tree-column"]')

    expect(renderedColumns).toHaveLength(columns.length)
    expect(renderedColumns[0]?.attributes('data-field')).toBe('name')
    expect(renderedColumns[0]?.attributes('data-header')).toBe('Capability')
    expect(renderedColumns[0]?.attributes('data-expander')).toBe('true')
    expect(renderedColumns[1]?.attributes('data-expander')).toBe('false')
  })

  it('emits controlled expandedKeys updates and typed node expansion payloads', async () => {
    const wrapper = mountTreeTable()

    await wrapper.get('[data-testid="emit-expanded"]').trigger('click')

    expect(wrapper.emitted('update:expandedKeys')?.[0]).toEqual([{ operations: true }])
    expect(wrapper.emitted('node-expand')?.[0]?.[0]).toMatchObject({
      key: 'operations',
      node: nodes[0],
    })
  })

  it('emits controlled selectionKeys updates and typed selection payloads', async () => {
    const wrapper = mountTreeTable({ selectionMode: 'single' })

    expect(
      wrapper.get('[data-testid="prime-tree-table-stub"]').attributes('data-selection-mode')
    ).toBe('single')

    await wrapper.get('[data-testid="emit-selection"]').trigger('click')

    expect(wrapper.emitted('update:selectionKeys')?.[0]).toEqual([{ operations: true }])
    expect(wrapper.emitted('node-select')?.[0]?.[0]).toMatchObject({
      key: 'operations',
      node: nodes[0],
    })
  })

  it('does not depend on the existing ProTable flat engine implementation', () => {
    const implementationSource = stripComments(proTreeTableSource)

    expect(implementationSource).not.toContain('TableController')
    expect(implementationSource).not.toContain('VirtualGridRenderer')
    expect(implementationSource).not.toContain('ProTable.vue')
    expect(implementationSource).not.toContain('treeMode')
    expect(proTreeTableSource).toContain('ProTable treeMode')
  })

  it('is available from the package root export with public design types', () => {
    const expanded: ProTreeTableExpandedKeys = { operations: true }
    const selection: ProTreeTableSelectionKeys = { operations: true }

    expect(RootProTreeTable).toBe(ProTreeTable)
    expect(expanded.operations).toBe(true)
    expect(selection).toEqual({ operations: true })
  })
})
