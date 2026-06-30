<script setup lang="ts" generic="T extends Record<string, unknown>">
import Column from 'primevue/column'
import type { TreeNode } from 'primevue/treenode'
import TreeTable from 'primevue/treetable'
import { computed } from 'vue'
import type {
  ProTreeTableColumn,
  ProTreeTableColumnAlign,
  ProTreeTableColumnRenderResult,
  ProTreeTableColumnSize,
  ProTreeTableExpandedKeys,
  ProTreeTableNode,
  ProTreeTableNodeEvent,
  ProTreeTableProps,
  ProTreeTableSelectionKeys,
  ProTreeTableSelectionMode,
  ProTreeTableValueEnumItem,
} from './types'

type ProTreeTableNodeEventName = 'node-expand' | 'node-collapse' | 'node-select' | 'node-unselect'

defineOptions({ name: 'ProTreeTable' })

const props = withDefaults(defineProps<ProTreeTableProps<T>>(), {
  nodes: () => [],
  columns: () => [],
  loading: false,
  disabled: false,
  selectionMode: false,
  expandedKeys: undefined,
  selectionKeys: null,
})

const emit = defineEmits<{
  (event: 'update:expandedKeys', value: ProTreeTableExpandedKeys): void
  (event: 'update:selectionKeys', value: ProTreeTableSelectionKeys): void
  (event: 'node-expand', payload: ProTreeTableNodeEvent<T>): void
  (event: 'node-collapse', payload: ProTreeTableNodeEvent<T>): void
  (event: 'node-select', payload: ProTreeTableNodeEvent<T>): void
  (event: 'node-unselect', payload: ProTreeTableNodeEvent<T>): void
}>()

const nodeByKey = computed(() => {
  const map = new Map<string, ProTreeTableNode<T>>()

  function visit(node: ProTreeTableNode<T>): void {
    map.set(node.key, node)
    node.children?.forEach(visit)
  }

  props.nodes.forEach(visit)
  return map
})

const primeNodes = computed(() => props.nodes.map(toPrimeTreeNode))
const activeSelectionMode = computed<Exclude<ProTreeTableSelectionMode, false> | undefined>(() =>
  props.disabled || props.selectionMode === false ? undefined : props.selectionMode
)
const primeSelectionKeys = computed(() => toPrimeSelectionKeys(props.selectionKeys))
const hasPinnedColumns = computed(() => props.columns.some(column => isPinnedColumn(column)))

function toPrimeTreeNode(node: ProTreeTableNode<T>): TreeNode {
  return {
    key: node.key,
    label: node.label,
    data: node.data,
    children: node.children?.map(toPrimeTreeNode),
    leaf: node.leaf,
    loading: node.loading,
    selectable: node.selectable,
  }
}

function toPrimeSelectionKeys(
  selectionKeys: ProTreeTableSelectionKeys
): Record<string, unknown> | undefined {
  if (!selectionKeys) return undefined
  if (typeof selectionKeys === 'string') return { [selectionKeys]: true }
  if (Array.isArray(selectionKeys)) {
    return Object.fromEntries(selectionKeys.map(key => [key, true]))
  }
  return selectionKeys
}

function normalizeExpandedKeys(value: unknown): ProTreeTableExpandedKeys {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, expanded]) => Boolean(expanded))
      .map(([key]) => [key, true])
  )
}

function normalizeSelectionKeys(value: unknown): ProTreeTableSelectionKeys {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.filter((key): key is string => typeof key === 'string')
  }
  if (!isRecord(value)) return null

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, normalizeSelectionEntry(entry)])
  )
}

function normalizeSelectionEntry(
  value: unknown
): boolean | { checked?: boolean; partialChecked?: boolean } {
  if (typeof value === 'boolean') return value
  if (!isRecord(value)) return Boolean(value)

  return {
    checked: Boolean(value.checked),
    partialChecked: Boolean(value.partialChecked),
  }
}

function handleExpandedKeysUpdate(value: unknown): void {
  emit('update:expandedKeys', normalizeExpandedKeys(value))
}

function handleSelectionKeysUpdate(value: unknown): void {
  emit('update:selectionKeys', normalizeSelectionKeys(value))
}

function handleNodeEvent(event: ProTreeTableNodeEventName, primeNode: TreeNode): void {
  const node = nodeByKey.value.get(primeNode.key)
  if (!node) return

  const payload = { key: node.key, node }

  if (event === 'node-expand') emit('node-expand', payload)
  if (event === 'node-collapse') emit('node-collapse', payload)
  if (event === 'node-select') emit('node-select', payload)
  if (event === 'node-unselect') emit('node-unselect', payload)
}

function getColumnStyle(column: ProTreeTableColumn<T>): Record<string, string> | undefined {
  const style: Record<string, string> = {}
  const width = normalizeColumnSize(column.width)
  const minWidth = normalizeColumnSize(column.minWidth)

  if (width) style.width = width
  if (minWidth) style.minWidth = minWidth
  return Object.keys(style).length > 0 ? style : undefined
}

function normalizeColumnSize(value: ProTreeTableColumnSize | undefined): string | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') return `${value}px`
  return value.length > 0 ? value : undefined
}

function getColumnAlignClass(column: ProTreeTableColumn<T>): string | undefined {
  return toTextAlignClass(column.align)
}

function toTextAlignClass(align: ProTreeTableColumnAlign | undefined): string | undefined {
  if (align === 'left') return 'text-left'
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return undefined
}

function isPinnedColumn(column: ProTreeTableColumn<T>): boolean {
  return column.pinned === 'left' || column.pinned === 'right'
}

function getFrozenAlign(column: ProTreeTableColumn<T>): 'left' | 'right' {
  return column.pinned === 'right' ? 'right' : 'left'
}

function resolveCellText(
  primeNode: TreeNode | undefined,
  column: ProTreeTableColumn<T>
): string | number | null {
  const node = resolveOriginalNode(primeNode)
  if (!node) return ''

  const value = resolveCellValue(node, column)
  const text = resolveCellValueText(value, column)

  if (column.render) {
    return normalizeRenderResult(
      column.render({
        value,
        text,
        node,
        row: node.data,
        column,
      })
    )
  }

  return text
}

function resolveOriginalNode(primeNode: TreeNode | undefined): ProTreeTableNode<T> | undefined {
  if (!primeNode) return undefined
  return nodeByKey.value.get(primeNode.key)
}

function resolveCellValue(node: ProTreeTableNode<T>, column: ProTreeTableColumn<T>): unknown {
  if (!column.field) return undefined
  return node.data[column.field]
}

function resolveCellValueText(value: unknown, column: ProTreeTableColumn<T>): string {
  const enumItem = column.valueEnum?.[String(value)]
  if (enumItem) return resolveValueEnumLabel(enumItem)

  return stringifyCellValue(value)
}

function normalizeRenderResult(value: ProTreeTableColumnRenderResult): string | number | null {
  return value ?? ''
}

function resolveValueEnumLabel(item: ProTreeTableValueEnumItem): string {
  if (typeof item === 'string') return item
  return item.label
}

function stringifyCellValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
</script>

<template>
  <div
    data-pro-tree-table-root
    data-pro-tree-table-experimental="true"
    :data-pro-tree-table-disabled="String(props.disabled)"
    class="pro-tree-table min-w-0"
  >
    <!--
      P2-A2 intentionally excludes lazy loading, editing, virtual scrolling, range selection,
      ProTable treeMode, server persistence, TreeTable filtering, VNode render output,
      and a headless hierarchical engine.
    -->
    <TreeTable
      :value="primeNodes"
      :expanded-keys="props.expandedKeys"
      :selection-keys="primeSelectionKeys"
      :selection-mode="activeSelectionMode"
      :loading="props.loading"
      :scrollable="hasPinnedColumns"
      class="pro-tree-table__prime min-w-0"
      @update:expanded-keys="handleExpandedKeysUpdate"
      @update:selection-keys="handleSelectionKeysUpdate"
      @node-expand="handleNodeEvent('node-expand', $event)"
      @node-collapse="handleNodeEvent('node-collapse', $event)"
      @node-select="handleNodeEvent('node-select', $event)"
      @node-unselect="handleNodeEvent('node-unselect', $event)"
    >
      <Column
        v-for="(column, index) in props.columns"
        :key="column.id"
        :field="column.field"
        :header="column.title"
        :expander="index === 0"
        :sortable="Boolean(column.sortable)"
        :frozen="isPinnedColumn(column)"
        :align-frozen="getFrozenAlign(column)"
        :style="getColumnStyle(column)"
        :header-class="getColumnAlignClass(column)"
        :body-class="getColumnAlignClass(column)"
      >
        <template #body="slotProps">
          <span class="pro-tree-table__cell-text">
            {{ resolveCellText(slotProps.node, column) }}
          </span>
        </template>
      </Column>
    </TreeTable>
  </div>
</template>
