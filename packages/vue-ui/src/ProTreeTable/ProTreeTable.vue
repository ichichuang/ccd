<script setup lang="ts" generic="T extends Record<string, unknown>">
import Column from 'primevue/column'
import type { TreeNode } from 'primevue/treenode'
import TreeTable from 'primevue/treetable'
import { computed } from 'vue'
import type {
  ProTreeTableColumn,
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
  if (column.width) style.width = column.width
  if (column.minWidth) style.minWidth = column.minWidth
  return Object.keys(style).length > 0 ? style : undefined
}

function getFrozenAlign(column: ProTreeTableColumn<T>): 'left' | 'right' {
  return column.pinned === 'right' ? 'right' : 'left'
}

function resolveCellText(primeNode: TreeNode | undefined, column: ProTreeTableColumn<T>): string {
  if (!primeNode || !column.field || !isRecord(primeNode.data)) return ''

  const value = primeNode.data[column.field]
  const enumItem = column.valueEnum?.[String(value)]
  if (enumItem) return resolveValueEnumLabel(enumItem)

  return stringifyCellValue(value)
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
    <!-- P2-A1 intentionally excludes lazy loading, editing, virtual scrolling, range selection, ProTable treeMode, server persistence, and a headless hierarchical engine. -->
    <TreeTable
      :value="primeNodes"
      :expanded-keys="props.expandedKeys"
      :selection-keys="primeSelectionKeys"
      :selection-mode="activeSelectionMode"
      :loading="props.loading"
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
        :sortable="column.sortable"
        :frozen="column.pinned === 'left' || column.pinned === 'right'"
        :align-frozen="getFrozenAlign(column)"
        :style="getColumnStyle(column)"
        :body-class="column.align ? `text-${column.align}` : undefined"
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
