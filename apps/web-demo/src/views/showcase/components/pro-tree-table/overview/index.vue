<script setup lang="ts">
import {
  ProTreeTable,
  type ProTreeTableExpandedKeys,
  type ProTreeTableLazyLoadErrorEvent,
  type ProTreeTableLazyLoadEvent,
  type ProTreeTableLoadChildren,
  type ProTreeTableNodeEvent,
  type ProTreeTableSelectionKeys,
} from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import { showcaseCatalog } from '../../../data/showcaseCatalog'
import ShowcaseDemoPanel from '../../../shared/ShowcaseDemoPanel.vue'
import ShowcaseFeatureCard from '../../../shared/ShowcaseFeatureCard.vue'
import ShowcasePageShell from '../../../shared/ShowcasePageShell.vue'
import {
  createProTreeTableDemoColumns,
  createProTreeTableDemoNodes,
  createProTreeTableLazyDemoChildren,
  type ProTreeTableDemoRow,
} from '../shared/proTreeTableDemoData'

defineOptions({ name: 'ShowcaseComponentsProTreeTableOverview' })

type ProTreeTableEventKey =
  | 'ready'
  | 'expand'
  | 'collapse'
  | 'select'
  | 'unselect'
  | 'load'
  | 'loadError'

const LAZY_DEMO_NODE_KEY = 'deferred.lazy'

const { t } = useI18n()
const item = showcaseCatalog.find(entry => entry.id === 'components-pro-tree-table-overview')

if (!item) {
  throw new Error('Missing showcase catalog item: components-pro-tree-table-overview')
}

const columns = computed(() => createProTreeTableDemoColumns(t))
const loadedLazyKeys = ref<Record<string, boolean>>({})
const lazyLoadCount = ref(0)
const lazyLoadedChildCount = ref(0)
const lazyChildren = computed(() =>
  loadedLazyKeys.value[LAZY_DEMO_NODE_KEY] ? createProTreeTableLazyDemoChildren(t) : []
)
const nodes = computed(() => createProTreeTableDemoNodes(t, lazyChildren.value))
const expandedKeys = ref<ProTreeTableExpandedKeys>({
  wrapper: true,
  deferred: true,
})
const selectionKeys = ref<ProTreeTableSelectionKeys>(null)
const lastEventKey = ref<ProTreeTableEventKey>('ready')
const lastEventNodeKey = ref('')
const loadChildren: ProTreeTableLoadChildren<ProTreeTableDemoRow> = async ({ key }) => {
  await Promise.resolve()

  return {
    children: key === LAZY_DEMO_NODE_KEY ? createProTreeTableLazyDemoChildren(t) : [],
  }
}
const selectedKeyText = computed(() => formatSelectionKeys(selectionKeys.value))
const expandedKeyText = computed(() => {
  const keys = Object.keys(expandedKeys.value).filter(key => expandedKeys.value[key])
  return keys.length > 0 ? keys.join(', ') : t('showcase.proTreeTable.state.none')
})
const selectionModeText = computed(() => t('showcase.proTreeTable.state.singleMode'))
const lazyLoadCountText = computed(() => String(lazyLoadCount.value))
const lazyLoadedChildCountText = computed(() => String(lazyLoadedChildCount.value))
const lastEventText = computed(() =>
  lastEventKey.value === 'ready'
    ? t('showcase.proTreeTable.events.ready')
    : t(`showcase.proTreeTable.events.${lastEventKey.value}`, {
        key: lastEventNodeKey.value,
      })
)

function recordTreeEvent(
  eventKey: Exclude<ProTreeTableEventKey, 'ready'>,
  payload: ProTreeTableNodeEvent<ProTreeTableDemoRow>
): void {
  lastEventKey.value = eventKey
  lastEventNodeKey.value = payload.key
}

function recordLazyLoad(payload: ProTreeTableLazyLoadEvent<ProTreeTableDemoRow>): void {
  loadedLazyKeys.value = {
    ...loadedLazyKeys.value,
    [payload.key]: true,
  }
  lazyLoadCount.value += 1
  lazyLoadedChildCount.value = payload.children.length
  lastEventKey.value = 'load'
  lastEventNodeKey.value = payload.key
}

function recordLazyLoadError(payload: ProTreeTableLazyLoadErrorEvent<ProTreeTableDemoRow>): void {
  lastEventKey.value = 'loadError'
  lastEventNodeKey.value = payload.key
}

function formatSelectionKeys(value: ProTreeTableSelectionKeys): string {
  if (!value) return t('showcase.proTreeTable.state.none')
  if (typeof value === 'string') return value || t('showcase.proTreeTable.state.none')
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : t('showcase.proTreeTable.state.none')
  }

  const keys = Object.entries(value)
    .filter(([, state]) => {
      if (typeof state === 'boolean') return state
      return Boolean(state.checked || state.partialChecked)
    })
    .map(([key]) => key)

  return keys.length > 0 ? keys.join(', ') : t('showcase.proTreeTable.state.none')
}
</script>

<template>
  <ShowcasePageShell :item="item">
    <template #demo>
      <ShowcaseDemoPanel
        :title="$t(`${item.localeBaseKey}.try`)"
        :description="$t('showcase.proTreeTable.demo.description')"
      >
        <section
          data-testid="showcase-pro-tree-table-demo"
          class="col-stretch min-w-0 gap-md"
        >
          <ProTreeTable
            v-model:expanded-keys="expandedKeys"
            v-model:selection-keys="selectionKeys"
            :nodes="nodes"
            :columns="columns"
            selection-mode="single"
            lazy
            :load-children="loadChildren"
            data-testid="showcase-pro-tree-table"
            @node-expand="recordTreeEvent('expand', $event)"
            @node-collapse="recordTreeEvent('collapse', $event)"
            @node-select="recordTreeEvent('select', $event)"
            @node-unselect="recordTreeEvent('unselect', $event)"
            @lazy-load="recordLazyLoad"
            @lazy-load-error="recordLazyLoadError"
          />

          <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-2 xl:grid-cols-6">
            <article
              data-testid="showcase-pro-tree-table-expanded"
              class="material-elevated col-stretch min-w-0 gap-xs p-md"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {{ $t('showcase.proTreeTable.state.expanded') }}
              </span>
              <span class="text-sm font-medium text-foreground text-ellipsis-2">
                {{ expandedKeyText }}
              </span>
            </article>

            <article
              data-testid="showcase-pro-tree-table-mode"
              class="material-elevated col-stretch min-w-0 gap-xs p-md"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {{ $t('showcase.proTreeTable.state.selectionMode') }}
              </span>
              <span class="text-sm font-medium text-foreground text-ellipsis-2">
                {{ selectionModeText }}
              </span>
            </article>

            <article
              data-testid="showcase-pro-tree-table-selection"
              class="material-elevated col-stretch min-w-0 gap-xs p-md"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {{ $t('showcase.proTreeTable.state.selection') }}
              </span>
              <span class="text-sm font-medium text-foreground text-ellipsis-2">
                {{ selectedKeyText }}
              </span>
            </article>

            <article
              data-testid="showcase-pro-tree-table-lazy-loads"
              class="material-elevated col-stretch min-w-0 gap-xs p-md"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {{ $t('showcase.proTreeTable.state.lazyLoads') }}
              </span>
              <span class="text-sm font-medium text-foreground text-ellipsis-2">
                {{ lazyLoadCountText }}
              </span>
            </article>

            <article
              data-testid="showcase-pro-tree-table-lazy-children"
              class="material-elevated col-stretch min-w-0 gap-xs p-md"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {{ $t('showcase.proTreeTable.state.loadedChildren') }}
              </span>
              <span class="text-sm font-medium text-foreground text-ellipsis-2">
                {{ lazyLoadedChildCountText }}
              </span>
            </article>

            <article
              data-testid="showcase-pro-tree-table-event"
              class="material-elevated col-stretch min-w-0 gap-xs p-md"
            >
              <span class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {{ $t('showcase.proTreeTable.state.lastEvent') }}
              </span>
              <span class="text-sm font-medium text-foreground text-ellipsis-2">
                {{ lastEventText }}
              </span>
            </article>
          </div>
        </section>
      </ShowcaseDemoPanel>
    </template>

    <template #features>
      <ShowcaseFeatureCard
        icon="i-lucide-list-tree"
        :title="$t('showcase.proTreeTable.cards.wrapper.title')"
        :description="$t('showcase.proTreeTable.cards.wrapper.description')"
        :tag="$t('showcase.proTreeTable.tags.experimental')"
      />
      <ShowcaseFeatureCard
        icon="i-lucide-database"
        :title="$t('showcase.proTreeTable.cards.static.title')"
        :description="$t('showcase.proTreeTable.cards.static.description')"
        :tag="$t('showcase.proTreeTable.tags.local')"
      />
      <ShowcaseFeatureCard
        icon="i-lucide-columns-3"
        :title="$t('showcase.proTreeTable.cards.columns.title')"
        :description="$t('showcase.proTreeTable.cards.columns.description')"
        :tag="$t('showcase.proTreeTable.tags.columns')"
      />
    </template>

    <template #explanation>
      <ShowcaseFeatureCard
        icon="i-lucide-split"
        :title="$t('showcase.proTreeTable.cards.boundary.title')"
        :description="$t('showcase.proTreeTable.cards.boundary.description')"
        :tag="$t('showcase.proTreeTable.tags.adr')"
      />
      <ShowcaseFeatureCard
        icon="i-lucide-clock-3"
        :title="$t('showcase.proTreeTable.cards.deferred.title')"
        :description="$t('showcase.proTreeTable.cards.deferred.description')"
        :tag="$t('showcase.proTreeTable.tags.deferred')"
      />
    </template>
  </ShowcasePageShell>
</template>
