<script setup lang="ts">
import type { VNode } from 'vue'
import { TOOLBAR_DEFAULTS } from '../engine/config'

interface ColumnMeta {
  id: string
  title: string | (() => VNode)
}

const props = defineProps<{
  title?: string
  showGlobalFilter?: boolean
  columns: ColumnMeta[]
  visibleColumnIds: Set<string>
  serverMode?: boolean
}>()

const emit = defineEmits<{
  'update:globalFilter': [val: string]
  'toggle-column': [id: string]
  refresh: []
}>()

const filterVal = ref<string | undefined>('')
const settingsPanel = ref()
const searchPlaceholder = computed((): string => ($t('proTable.search') as string) || '')

const debouncedEmitFilter = useDebounceFn((val: string) => {
  emit('update:globalFilter', val)
}, TOOLBAR_DEFAULTS.globalSearchDebounceMs)

watch(filterVal, val => debouncedEmitFilter(val ?? ''))

function isColVisible(id: string): boolean {
  return props.visibleColumnIds.has(id)
}

function toggleCol(id: string): void {
  emit('toggle-column', id)
}
</script>

<template>
  <div class="row-between pb-padding-sm border-b-default">
    <div class="row-y-center gap-md">
      <span
        v-if="title"
        class="fs-md font-semibold text-foreground"
      >
        {{ title }}
      </span>
      <InputText
        v-if="showGlobalFilter"
        v-model="filterVal"
        :placeholder="searchPlaceholder"
        class="w-full sm:w-[var(--spacing-6xl)] flex-shrink"
      />
    </div>

    <div class="row-y-center gap-xs">
      <slot name="toolbar-extra" />

      <Button
        v-if="serverMode"
        text
        class="header-icon-btn"
        :aria-label="$t('proTable.refresh')"
        @click="emit('refresh')"
      >
        <Icons name="i-lucide-refresh-cw" />
      </Button>

      <Button
        text
        class="header-icon-btn"
        :aria-label="$t('proTable.columnSettings')"
        @click="settingsPanel?.toggle($event)"
      >
        <Icons name="i-lucide-settings-2" />
      </Button>

      <Popover ref="settingsPanel">
        <div class="col-stack-xs p-padding-sm min-w-[var(--spacing-5xl)]">
          <div
            v-for="col in columns"
            :key="col.id"
            class="row-between py-padding-xs border-b-default"
          >
            <span class="fs-sm">{{ typeof col.title === 'string' ? col.title : col.id }}</span>
            <ToggleSwitch
              :model-value="isColVisible(col.id)"
              @update:model-value="toggleCol(col.id)"
            />
          </div>
        </div>
      </Popover>
    </div>
  </div>
</template>
