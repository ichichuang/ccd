<script setup lang="ts" generic="T extends Record<string, unknown>">
import Column from 'primevue/column'
import type { TreeNode } from 'primevue/treenode'
import TreeTable from 'primevue/treetable'
import { computed, shallowRef } from 'vue'
import type {
  ProTreeTableCheckboxSelectionState,
  ProTreeTableColumn,
  ProTreeTableColumnAlign,
  ProTreeTableColumnRenderResult,
  ProTreeTableColumnSize,
  ProTreeTableExpandedKeys,
  ProTreeTableLazyLoadErrorEvent,
  ProTreeTableLazyLoadEvent,
  ProTreeTableNode,
  ProTreeTableNodeEvent,
  ProTreeTableProps,
  ProTreeTableSelectionKeys,
  ProTreeTableSelectionMode,
  ProTreeTableValueEnumItem,
} from './types'

type ActiveSelectionMode = Exclude<ProTreeTableSelectionMode, false>
type ProTreeTableNodeEventName = 'node-expand' | 'node-collapse' | 'node-select' | 'node-unselect'
type PrimeSelectionKeys = Record<string, boolean | ProTreeTableCheckboxSelectionState>

defineOptions({ name: 'ProTreeTable' })

const props = withDefaults(defineProps<ProTreeTableProps<T>>(), {
  nodes: () => [],
  columns: () => [],
  loading: false,
  disabled: false,
  selectionMode: false,
  expandedKeys: undefined,
  selectionKeys: null,
  lazy: false,
  loadChildren: undefined,
})

const emit = defineEmits<{
  (event: 'update:expandedKeys', value: ProTreeTableExpandedKeys): void
  (event: 'update:selectionKeys', value: ProTreeTableSelectionKeys): void
  (event: 'node-expand', payload: ProTreeTableNodeEvent<T>): void
  (event: 'node-collapse', payload: ProTreeTableNodeEvent<T>): void
  (event: 'node-select', payload: ProTreeTableNodeEvent<T>): void
  (event: 'node-unselect', payload: ProTreeTableNodeEvent<T>): void
  (event: 'lazy-load', payload: ProTreeTableLazyLoadEvent<T>): void
  (event: 'lazy-load-error', payload: ProTreeTableLazyLoadErrorEvent<T>): void
}>()

const loadedLazyChildrenByKey = shallowRef<Record<string, ProTreeTableNode<T>[]>>({})
const loadingLazyNodeKeys = shallowRef<ReadonlySet<string>>(new Set())
const displayNodes = computed(() => props.nodes.map(resolveDisplayNode))
const nodeByKey = computed(() => {
  const map = new Map<string, ProTreeTableNode<T>>()

  function visit(node: ProTreeTableNode<T>): void {
    map.set(node.key, node)
    node.children?.forEach(visit)
  }

  displayNodes.value.forEach(visit)
  return map
})

const primeNodes = computed(() => displayNodes.value.map(toPrimeTreeNode))
const activeSelectionMode = computed<ActiveSelectionMode | undefined>(() =>
  props.disabled || props.selectionMode === false ? undefined : props.selectionMode
)
const primeExpandedKeys = computed(() => normalizeExpandedKeys(props.expandedKeys))
const primeSelectionKeys = computed(() => {
  const mode = activeSelectionMode.value
  return mode ? toPrimeSelectionKeys(props.selectionKeys, mode) : undefined
})
const hasPinnedColumns = computed(() => props.columns.some(column => isPinnedColumn(column)))

function resolveDisplayNode(node: ProTreeTableNode<T>): ProTreeTableNode<T> {
  const loadedChildren = getLoadedLazyChildren(node.key)
  const sourceChildren = loadedChildren ?? node.children
  const children = sourceChildren ? resolveDisplayNodeList(sourceChildren) : undefined
  const loading = node.loading || isLazyNodeLoading(node.key)

  if (!loadedChildren && !loading && children === node.children) return node

  return {
    ...node,
    children,
    leaf: loadedChildren ? loadedChildren.length === 0 : node.leaf,
    loading,
  }
}

function resolveDisplayNodeList(nodes: ProTreeTableNode<T>[]): ProTreeTableNode<T>[] {
  let changed = false
  const resolvedNodes = nodes.map(node => {
    const resolvedNode = resolveDisplayNode(node)
    if (resolvedNode !== node) changed = true
    return resolvedNode
  })

  return changed ? resolvedNodes : nodes
}

function getLoadedLazyChildren(key: string): ProTreeTableNode<T>[] | undefined {
  return loadedLazyChildrenByKey.value[key]
}

function hasLoadedLazyChildren(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(loadedLazyChildrenByKey.value, key)
}

function isLazyNodeLoading(key: string): boolean {
  return loadingLazyNodeKeys.value.has(key)
}

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
  selectionKeys: ProTreeTableSelectionKeys,
  mode: ActiveSelectionMode
): PrimeSelectionKeys | undefined {
  const normalized = normalizeSelectionKeysForMode(selectionKeys, mode)

  if (!normalized) return undefined
  if (typeof normalized === 'string') return { [normalized]: true }
  if (Array.isArray(normalized)) {
    return normalized.length > 0
      ? Object.fromEntries(normalized.map(key => [key, true]))
      : undefined
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

function normalizeExpandedKeys(value: unknown): ProTreeTableExpandedKeys {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, expanded]) => Boolean(expanded))
      .map(([key]) => [key, true])
  )
}

function normalizeSelectionKeysForMode(
  value: unknown,
  mode: ActiveSelectionMode
): ProTreeTableSelectionKeys {
  if (mode === 'single') return normalizeSingleSelectionKey(value)
  if (mode === 'multiple') return normalizeMultipleSelectionKeys(value)
  return normalizeCheckboxSelectionKeys(value)
}

function normalizeSingleSelectionKey(value: unknown): string | null {
  if (typeof value === 'string') return normalizeKey(value)
  if (Array.isArray(value)) {
    return value.find((key): key is string => typeof key === 'string' && key.length > 0) ?? null
  }
  if (!isRecord(value)) return null

  return Object.entries(value).find(([, entry]) => isSelectedEntry(entry))?.[0] ?? null
}

function normalizeMultipleSelectionKeys(value: unknown): string[] {
  if (typeof value === 'string') return normalizeKey(value) ? [value] : []
  if (Array.isArray(value)) {
    return uniqueKeys(value.filter((key): key is string => typeof key === 'string'))
  }
  if (!isRecord(value)) return []

  return Object.entries(value)
    .filter(([, entry]) => isSelectedEntry(entry))
    .map(([key]) => key)
}

function normalizeCheckboxSelectionKeys(value: unknown): PrimeSelectionKeys {
  if (typeof value === 'string') return normalizeKey(value) ? { [value]: true } : {}
  if (Array.isArray(value)) {
    const keys = value.filter((key): key is string => typeof key === 'string')
    return Object.fromEntries(uniqueKeys(keys).map(key => [key, true]))
  }
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      const normalized = normalizeCheckboxSelectionEntry(entry)
      return normalized === undefined ? [] : [[key, normalized]]
    })
  )
}

function normalizeCheckboxSelectionEntry(
  value: unknown
): boolean | ProTreeTableCheckboxSelectionState | undefined {
  if (typeof value === 'boolean') return value ? true : undefined
  if (!isRecord(value)) return value ? true : undefined

  const checked = Boolean(value.checked)
  const partialChecked = Boolean(value.partialChecked)

  return checked || partialChecked ? { checked, partialChecked } : undefined
}

function isSelectedEntry(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (!isRecord(value)) return Boolean(value)
  return value.checked === true
}

function uniqueKeys(keys: readonly string[]): string[] {
  return Array.from(new Set(keys.filter(key => key.length > 0)))
}

function normalizeKey(key: string): string | null {
  return key.length > 0 ? key : null
}

function handleExpandedKeysUpdate(value: unknown): void {
  emit('update:expandedKeys', normalizeExpandedKeys(value))
}

function handleSelectionKeysUpdate(value: unknown): void {
  const mode = activeSelectionMode.value
  if (!mode) return

  emit('update:selectionKeys', normalizeSelectionKeysForMode(value, mode))
}

function handleNodeEvent(event: ProTreeTableNodeEventName, primeNode: TreeNode): void {
  if (isSelectionEvent(event) && !activeSelectionMode.value) return

  const node = nodeByKey.value.get(primeNode.key)
  if (!node) return

  const payload = { key: node.key, node }

  if (event === 'node-expand') {
    emit('node-expand', payload)
    void loadChildrenForNode(node)
  }
  if (event === 'node-collapse') emit('node-collapse', payload)
  if (event === 'node-select') emit('node-select', payload)
  if (event === 'node-unselect') emit('node-unselect', payload)
}

function isSelectionEvent(event: ProTreeTableNodeEventName): boolean {
  return event === 'node-select' || event === 'node-unselect'
}

async function loadChildrenForNode(node: ProTreeTableNode<T>): Promise<void> {
  const loadChildren = props.loadChildren
  if (!canLoadChildren(node, loadChildren)) return

  addLoadingLazyNodeKey(node.key)

  try {
    const result = await loadChildren({
      key: node.key,
      node,
      expandedKeys: primeExpandedKeys.value,
      selectionKeys: getCurrentSelectionKeys(),
    })
    loadedLazyChildrenByKey.value = {
      ...loadedLazyChildrenByKey.value,
      [node.key]: result.children,
    }
    emit('lazy-load', {
      key: node.key,
      node,
      children: result.children,
    })
  } catch (error: unknown) {
    emit('lazy-load-error', {
      key: node.key,
      node,
      error,
    })
  } finally {
    removeLoadingLazyNodeKey(node.key)
  }
}

function canLoadChildren(
  node: ProTreeTableNode<T>,
  loadChildren: ProTreeTableProps<T>['loadChildren']
): loadChildren is NonNullable<ProTreeTableProps<T>['loadChildren']> {
  return Boolean(
    props.lazy &&
    loadChildren &&
    node.leaf !== true &&
    !node.children &&
    !hasLoadedLazyChildren(node.key) &&
    !isLazyNodeLoading(node.key)
  )
}

function getCurrentSelectionKeys(): ProTreeTableSelectionKeys {
  const mode = activeSelectionMode.value
  return mode
    ? normalizeSelectionKeysForMode(props.selectionKeys, mode)
    : (props.selectionKeys ?? null)
}

function addLoadingLazyNodeKey(key: string): void {
  loadingLazyNodeKeys.value = new Set([...loadingLazyNodeKeys.value, key])
}

function removeLoadingLazyNodeKey(key: string): void {
  loadingLazyNodeKeys.value = new Set([...loadingLazyNodeKeys.value].filter(item => item !== key))
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
      P2-A4 intentionally excludes editing, virtual scrolling, range selection,
      ProTable treeMode, server persistence, TreeTable filtering, VNode render output,
      and a headless hierarchical engine.
    -->
    <TreeTable
      :value="primeNodes"
      :expanded-keys="primeExpandedKeys"
      :selection-keys="primeSelectionKeys"
      :selection-mode="activeSelectionMode"
      :lazy="props.lazy"
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
