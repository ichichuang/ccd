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
  isFullscreen?: boolean
  hasSelection?: boolean
}>()

const emit = defineEmits<{
  'update:globalFilter': [val: string]
  'toggle-column': [id: string]
  refresh: []
  'toggle-fullscreen': []
  export: [mode: 'page' | 'selected']
}>()

const filterVal = ref<string | undefined>('')
const settingsPanel = ref()
const exportMenu = ref()
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

const exportMenuItems = computed(() => {
  const items = [{ label: $t('proTable.exportPage'), command: () => emit('export', 'page') }]
  if (props.hasSelection) {
    items.push({
      label: $t('proTable.exportSelected'),
      command: () => emit('export', 'selected'),
    })
  }
  return items
})

const toolbarBtnClass =
  'cursor-pointer border-none outline-none duration-sm hover:scale-110 active:scale-100 shadow-sm hover:shadow-md dark:hover:shadow-lg hover:text-primary p-sm center rounded-sm bg-sidebar'
</script>

<template>
  <div class="row-between py-md shrink-0">
    <div class="flex items-center gap-md min-w-0">
      <span
        v-if="title"
        class="text-md font-semibold text-foreground"
      >
        {{ title }}
      </span>
      <InputText
        v-if="showGlobalFilter"
        v-model="filterVal"
        :placeholder="searchPlaceholder"
        class="w-full sm:w-[var(--spacing-6xl)] shrink"
      />
    </div>

    <div class="flex items-center gap-xs flex-nowrap shrink-0">
      <slot name="toolbar-extra" />

      <!-- Export -->
      <Button
        text
        :class="toolbarBtnClass"
        :aria-label="$t('proTable.export')"
        @click="hasSelection ? exportMenu?.toggle($event) : emit('export', 'page')"
      >
        <Icons name="i-lucide-download" />
      </Button>
      <Menu
        v-if="hasSelection"
        ref="exportMenu"
        :model="exportMenuItems"
        popup
      />

      <!-- Fullscreen -->
      <Button
        text
        :class="toolbarBtnClass"
        :aria-label="$t('proTable.fullscreen')"
        @click="emit('toggle-fullscreen')"
      >
        <Icons :name="isFullscreen ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'" />
      </Button>

      <!-- Refresh -->
      <Button
        v-if="serverMode"
        text
        :class="toolbarBtnClass"
        :aria-label="$t('proTable.refresh')"
        @click="emit('refresh')"
      >
        <Icons name="i-lucide-refresh-cw" />
      </Button>

      <!-- Column Settings -->
      <Button
        text
        :class="toolbarBtnClass"
        :aria-label="$t('proTable.columnSettings')"
        @click="settingsPanel?.toggle($event)"
      >
        <Icons name="i-lucide-settings-2" />
      </Button>

      <Popover ref="settingsPanel">
        <div class="flex flex-col gap-xs p-sm min-w-[var(--spacing-5xl)]">
          <div
            v-for="col in columns"
            :key="col.id"
            class="row-between py-xs"
          >
            <span class="text-sm">{{ typeof col.title === 'string' ? col.title : col.id }}</span>
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
