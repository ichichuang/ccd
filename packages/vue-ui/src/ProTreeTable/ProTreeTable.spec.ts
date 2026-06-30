// @vitest-environment jsdom
/// <reference types="vite/client" />
/* eslint-disable vue/one-component-per-file -- PrimeVue stubs stay local to this focused component spec. */
import { mount } from '@vue/test-utils'
import {
  computed,
  defineComponent,
  inject,
  provide,
  type Component,
  type ComputedRef,
  type PropType,
} from 'vue'
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

const treeNodesInjectionKey = vi.hoisted(() => Symbol('treeNodes'))

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

      provide(treeNodesInjectionKey, flattenedNodes)

      return { flattenedNodes }
    },
    template: `
      <section
        data-testid="prime-tree-table-stub"
        :data-loading="String(loading)"
        :data-scrollable="String(Boolean($attrs.scrollable))"
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
      sortable: {
        type: Boolean,
        default: false,
      },
      frozen: {
        type: Boolean,
        default: false,
      },
      alignFrozen: {
        type: String,
        default: undefined,
      },
      style: {
        type: Object as PropType<Record<string, string>>,
        default: undefined,
      },
      headerClass: {
        type: String,
        default: undefined,
      },
      bodyClass: {
        type: String,
        default: undefined,
      },
      filter: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const injectedNodes = inject<ComputedRef<PrimeTreeNodeStub[]>>(treeNodesInjectionKey)
      const renderedNodes = computed(() => injectedNodes?.value ?? [])

      return { renderedNodes }
    },
    template: `
      <div
        data-testid="prime-tree-column"
        :data-field="field || ''"
        :data-header="header || ''"
        :data-expander="String(Boolean(expander))"
        :data-sortable="String(Boolean(sortable))"
        :data-frozen="String(Boolean(frozen))"
        :data-align-frozen="alignFrozen || ''"
        :data-style-width="style?.width || ''"
        :data-style-min-width="style?.minWidth || ''"
        :data-header-class="headerClass || ''"
        :data-body-class="bodyClass || ''"
        :data-filter="String(Boolean(filter))"
      >
        <span
          v-for="node in renderedNodes"
          :key="node.key"
          data-testid="prime-tree-cell"
          :data-field="field || ''"
          :data-node-key="node.key"
        >
          <slot name="body" :node="node" />
        </span>
      </div>
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

  it('maps column width and minWidth to PrimeVue Column styles', () => {
    const wrapper = mountTreeTable({
      columns: [
        {
          id: 'name',
          field: 'name',
          title: 'Capability',
          width: 180,
          minWidth: '12rem',
        },
      ],
    })
    const renderedColumn = wrapper.get('[data-testid="prime-tree-column"]')

    expect(renderedColumn.attributes('data-style-width')).toBe('180px')
    expect(renderedColumn.attributes('data-style-min-width')).toBe('12rem')
  })

  it('applies column alignment to both header and body cells', () => {
    const wrapper = mountTreeTable({
      columns: [
        {
          id: 'owner',
          field: 'owner',
          title: 'Owner',
          align: 'right',
        },
      ],
    })
    const renderedColumn = wrapper.get('[data-testid="prime-tree-column"]')

    expect(renderedColumn.attributes('data-header-class')).toBe('text-right')
    expect(renderedColumn.attributes('data-body-class')).toBe('text-right')
  })

  it('maps pinned columns to PrimeVue frozen columns and enables TreeTable scrolling', () => {
    const wrapper = mountTreeTable({
      columns: [
        {
          id: 'name',
          field: 'name',
          title: 'Capability',
          pinned: 'left',
        },
        {
          id: 'status',
          field: 'status',
          title: 'Status',
          pinned: 'right',
        },
      ],
    })
    const renderedColumns = wrapper.findAll('[data-testid="prime-tree-column"]')

    expect(wrapper.get('[data-testid="prime-tree-table-stub"]').attributes('data-scrollable')).toBe(
      'true'
    )
    expect(renderedColumns[0]?.attributes('data-frozen')).toBe('true')
    expect(renderedColumns[0]?.attributes('data-align-frozen')).toBe('left')
    expect(renderedColumns[1]?.attributes('data-frozen')).toBe('true')
    expect(renderedColumns[1]?.attributes('data-align-frozen')).toBe('right')
  })

  it('maps sortable columns to PrimeVue Column sortable', () => {
    const wrapper = mountTreeTable({
      columns: [
        {
          id: 'name',
          field: 'name',
          title: 'Capability',
          sortable: true,
        },
      ],
    })

    expect(wrapper.get('[data-testid="prime-tree-column"]').attributes('data-sortable')).toBe(
      'true'
    )
  })

  it('renders valueEnum labels and text render callback output without Vue h helpers', () => {
    const wrapper = mountTreeTable({
      columns: [
        {
          id: 'status',
          field: 'status',
          title: 'Status',
          valueEnum: {
            Ready: { label: 'Ready label' },
            Preview: 'Preview label',
          },
        },
        {
          id: 'owner',
          field: 'owner',
          title: 'Owner',
          render: ({ text, node }) => `${node.key}:${text}`,
        },
      ],
    })
    const statusCells = wrapper.findAll('[data-testid="prime-tree-cell"][data-field="status"]')
    const ownerCells = wrapper.findAll('[data-testid="prime-tree-cell"][data-field="owner"]')

    expect(statusCells.map(cell => cell.text())).toEqual(['Ready label', 'Preview label'])
    expect(ownerCells.map(cell => cell.text())).toEqual([
      'operations:Runtime',
      'operations.telemetry:Runtime',
    ])
    expect(stripComments(proTreeTableSource)).not.toContain(' h(')
  })

  it('keeps filterable as a deferred column flag without wiring PrimeVue filters', () => {
    const wrapper = mountTreeTable({
      columns: [
        {
          id: 'status',
          field: 'status',
          title: 'Status',
          filterable: true,
        },
      ],
    })

    expect(wrapper.get('[data-testid="prime-tree-column"]').attributes('data-filter')).toBe('false')
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
