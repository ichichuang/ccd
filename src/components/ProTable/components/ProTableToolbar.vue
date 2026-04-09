<script setup lang="ts">
import type { VNode } from 'vue'
import { TOOLBAR_DEFAULTS } from '../engine/config'

interface ColumnMeta {
  id: string
  title: string | (() => VNode)
}

const props = withDefaults(
  defineProps<{
    title?: string
    /** 是否显示表格区域尺寸密度切换（紧凑 / 适中 / 宽松），仅影响 ProTable 内容区 */
    showDensityControl?: boolean
    /** 当前表格密度（与父级 v-model 同步） */
    density?: SizeMode
    showGlobalFilter?: boolean
    columns: ColumnMeta[]
    visibleColumnIds: Set<string>
    serverMode?: boolean
    hasSelection?: boolean
  }>(),
  {
    title: undefined,
    showDensityControl: true,
    density: 'comfortable',
  }
)

const densityOptions = computed(() => [
  { value: 'compact' as SizeMode, label: ($t('proTable.densityCompact') as string) || '' },
  { value: 'comfortable' as SizeMode, label: ($t('proTable.densityComfortable') as string) || '' },
  { value: 'loose' as SizeMode, label: ($t('proTable.densityLoose') as string) || '' },
])

const densityPanel = ref<{ toggle: (e: Event) => void; hide: () => void } | null>(null)

function pickDensity(mode: SizeMode): void {
  emit('update:density', mode)
  densityPanel.value?.hide()
}

const emit = defineEmits<{
  'update:globalFilter': [val: string]
  'update:density': [mode: SizeMode]
  'toggle-column': [id: string]
  refresh: []
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
  <div class="row-between p-sm shrink-0">
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

      <!-- Table row density -->
      <Button
        v-if="showDensityControl"
        text
        :class="toolbarBtnClass"
        :aria-label="$t('proTable.densityAria')"
        @click="densityPanel?.toggle($event)"
      >
        <Icons name="i-lucide-rows-3" />
      </Button>
      <Popover ref="densityPanel">
        <div class="col-between gap-xs">
          <div
            v-for="opt in densityOptions"
            :key="opt.value"
            class="cursor-pointer px-md py-sm rounded-md hover:bg-muted transition-all duration-md"
            :class="density === opt.value ? '!bg-primary/20 text-primary font-semibold' : ''"
            @click="pickDensity(opt.value)"
          >
            <span class="text-sm">{{ opt.label }}</span>
          </div>
        </div>
      </Popover>

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
        <div class="flex flex-col gap-sm min-w-[var(--spacing-5xl)]">
          <div
            v-for="col in columns"
            :key="col.id"
            class="row-between gap-md"
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
