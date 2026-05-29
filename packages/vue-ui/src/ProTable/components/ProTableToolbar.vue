<script setup lang="ts">
defineOptions({ name: 'ProTableToolbar' })

import type { SizeMode } from '@ccd/design-tokens'
import { useDebounceFn } from '@vueuse/core'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Menu from 'primevue/menu'
import Popover from 'primevue/popover'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icons } from '../../Icons'
import { TOOLBAR_DEFAULTS } from '../engine/config'
import type { ColumnSettingItem } from './ProTableColumnSettings.vue'
import ProTableColumnSettings from './ProTableColumnSettings.vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    title?: string
    /** 是否显示表格区域尺寸密度切换（紧凑 / 适中 / 宽松），仅影响 ProTable 内容区 */
    showDensityControl?: boolean
    /** 当前表格密度（与父级 v-model 同步） */
    density?: SizeMode
    showGlobalFilter?: boolean
    /** 列设置面板：全量列元数据（顺序由 columnSettingsItems 表达） */
    columnSettingsItems: ColumnSettingItem[]
    columnHiddenKeys: string[]
    serverMode?: boolean
    isFullscreen?: boolean
    hasSelection?: boolean
  }>(),
  {
    title: undefined,
    showDensityControl: true,
    density: 'comfortable',
  }
)

const densityOptions = computed(() => [
  { value: 'compact' as const, label: t('proTable.densityCompact') || '' },
  { value: 'comfortable' as const, label: t('proTable.densityComfortable') || '' },
  { value: 'loose' as const, label: t('proTable.densityLoose') || '' },
])

const densityPanel = ref<{ toggle: (e: Event) => void; hide: () => void } | null>(null)

function pickDensity(mode: SizeMode): void {
  emit('update:density', mode)
  densityPanel.value?.hide()
}

const emit = defineEmits<{
  'update:globalFilter': [val: string]
  'update:density': [mode: SizeMode]
  'update-column-settings': [orderedIds: string[], hiddenIds: string[]]
  refresh: []
  'toggle-fullscreen': []
  export: [mode: 'page' | 'selected']
}>()

const filterVal = ref<string | undefined>('')
const settingsPanel = ref<{ toggle: (e: Event) => void } | null>(null)
const columnSettingsRef = ref<InstanceType<typeof ProTableColumnSettings> | null>(null)
const exportMenu = ref()
const searchPlaceholder = computed((): string => t('proTable.search') || '')

const debouncedEmitFilter = useDebounceFn((val: string) => {
  emit('update:globalFilter', val)
}, TOOLBAR_DEFAULTS.globalSearchDebounceMs)

watch(filterVal, val => debouncedEmitFilter(val ?? ''))

function onColumnSettingsPanelShow(): void {
  columnSettingsRef.value?.syncFromParent()
}

const exportMenuItems = computed(() => {
  const items = [{ label: t('proTable.exportPage'), command: () => emit('export', 'page') }]
  if (props.hasSelection) {
    items.push({
      label: t('proTable.exportSelected'),
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
        :aria-label="t('proTable.densityAria')"
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
        :aria-label="t('proTable.export')"
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
        :aria-label="t('proTable.fullscreen')"
        @click="emit('toggle-fullscreen')"
      >
        <Icons :name="isFullscreen ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'" />
      </Button>

      <!-- Refresh -->
      <Button
        v-if="serverMode"
        text
        :class="toolbarBtnClass"
        :aria-label="t('proTable.refresh')"
        @click="emit('refresh')"
      >
        <Icons name="i-lucide-refresh-cw" />
      </Button>

      <!-- Column Settings -->
      <Button
        text
        :class="toolbarBtnClass"
        :aria-label="t('proTable.columnSettings')"
        @click="settingsPanel?.toggle($event)"
      >
        <Icons name="i-lucide-settings-2" />
      </Button>

      <Popover
        ref="settingsPanel"
        @show="onColumnSettingsPanelShow"
      >
        <ProTableColumnSettings
          ref="columnSettingsRef"
          :items="columnSettingsItems"
          :hidden-keys="columnHiddenKeys"
          @update="(order, hidden) => emit('update-column-settings', order, hidden)"
        />
      </Popover>
    </div>
  </div>
</template>
