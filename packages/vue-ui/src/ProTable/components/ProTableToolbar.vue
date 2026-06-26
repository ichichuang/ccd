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

const emit = defineEmits<{
  'update:globalFilter': [val: string]
  'update:density': [mode: SizeMode]
  'update-column-settings': [orderedIds: string[], hiddenIds: string[]]
  refresh: []
  'toggle-fullscreen': []
  export: [mode: 'page' | 'selected']
  /** Whether any toolbar popover (density / column settings) is currently open. */
  'popover-toggle': [open: boolean]
}>()

const { t } = useI18n()
const densityOptions = computed(() => [
  { value: 'compact' as const, label: t('proTable.densityCompact') || '' },
  { value: 'comfortable' as const, label: t('proTable.densityComfortable') || '' },
  { value: 'loose' as const, label: t('proTable.densityLoose') || '' },
])

const densityPanel = ref<{ toggle: (e: Event) => void; hide: () => void } | null>(null)
const densityExpanded = ref(false)

function pickDensity(mode: SizeMode): void {
  emit('update:density', mode)
  densityPanel.value?.hide()
}

const filterVal = ref<string | undefined>('')
const settingsPanel = ref<{ toggle: (e: Event) => void } | null>(null)
const settingsExpanded = ref(false)
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

function handleColumnSettingsPanelShow(): void {
  settingsExpanded.value = true
  onColumnSettingsPanelShow()
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

const fullscreenControlLabel = computed(() =>
  props.isFullscreen ? t('proTable.fullscreenRestore') || '' : t('proTable.fullscreenExpand') || ''
)
const densityTogglePt = computed(() => ({
  root: {
    'aria-haspopup': 'true',
    'aria-expanded': densityExpanded.value ? 'true' : 'false',
  },
}))
const columnSettingsTogglePt = computed(() => ({
  root: {
    'aria-haspopup': 'true',
    'aria-expanded': settingsExpanded.value ? 'true' : 'false',
  },
}))

/**
 * Surface popover open/close to the host. The host (ProTable) uses this so that
 * an Escape which dismisses a popover does not also collapse region fullscreen —
 * PrimeVue's Popover closes on Escape without calling preventDefault, so the
 * host cannot rely on `event.defaultPrevented` alone.
 */
const anyPopoverOpen = computed(() => densityExpanded.value || settingsExpanded.value)
watch(anyPopoverOpen, open => emit('popover-toggle', open))

const toolbarButtonStyle = {
  minWidth: 'var(--control-action-size-sm)',
  minHeight: 'var(--control-action-size-sm)',
}

// Flat, consistent toolbar control. Hover/active visuals live in scoped CSS
// (`pro-table-toolbar-btn`) because variant utilities like `hover:bg-muted` are
// only referenced inside this dist-shipped package and the host UnoCSS pipeline
// excludes `/dist/`, so they are never generated. `text-muted-foreground`,
// `ring-focus-focus`, `rounded-md` and `p-sm` are all used in app source too,
// so they are safe to keep as utilities.
const toolbarBtnClass =
  'pro-table-toolbar-btn cursor-pointer border-none outline-none ring-focus-focus duration-sm text-muted-foreground p-sm center rounded-md'

const densityOptionRowClass = 'pro-table-density-option rounded-md px-md py-xs'
const densityOptionButtonClass = 'w-full justify-start text-left focus-visible:ring-0 outline-none'
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
        :pt="densityTogglePt"
        :style="toolbarButtonStyle"
        data-pro-table-density-toggle
        @click="densityPanel?.toggle($event)"
      >
        <Icons name="i-lucide-rows-3" />
      </Button>
      <Popover
        ref="densityPanel"
        @show="densityExpanded = true"
        @hide="densityExpanded = false"
      >
        <div
          class="col-between gap-xs"
          data-pro-table-density-menu
        >
          <div
            v-for="opt in densityOptions"
            :key="opt.value"
            :class="[
              densityOptionRowClass,
              density === opt.value ? 'pro-table-density-option--selected' : 'text-foreground',
            ]"
            :data-pro-table-density-option="opt.value"
            :data-pro-table-density-selected="density === opt.value ? 'true' : undefined"
          >
            <Button
              text
              :label="opt.label"
              :class="[
                densityOptionButtonClass,
                density === opt.value ? 'text-primary font-semibold' : 'text-foreground',
              ]"
              :aria-pressed="density === opt.value ? 'true' : 'false'"
              @click="pickDensity(opt.value)"
            />
          </div>
        </div>
      </Popover>

      <!-- Export -->
      <Button
        text
        :class="toolbarBtnClass"
        :aria-label="t('proTable.export')"
        :style="toolbarButtonStyle"
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
        :aria-label="fullscreenControlLabel"
        :aria-pressed="isFullscreen ? 'true' : 'false'"
        :title="fullscreenControlLabel"
        :style="toolbarButtonStyle"
        data-pro-table-fullscreen-toggle
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
        :style="toolbarButtonStyle"
        @click="emit('refresh')"
      >
        <Icons name="i-lucide-refresh-cw" />
      </Button>

      <!-- Column Settings -->
      <Button
        text
        :class="toolbarBtnClass"
        :aria-label="t('proTable.columnSettings')"
        :pt="columnSettingsTogglePt"
        :style="toolbarButtonStyle"
        @click="settingsPanel?.toggle($event)"
      >
        <Icons name="i-lucide-settings-2" />
      </Button>

      <Popover
        ref="settingsPanel"
        @show="handleColumnSettingsPanelShow"
        @hide="settingsExpanded = false"
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

<style scoped>
/* Flat, token-driven toolbar control. Self-contained so it ships in
   dist/vue-ui.css instead of depending on host-generated `hover:*` variants. */
.pro-table-toolbar-btn {
  color: rgb(var(--muted-foreground));
  background: transparent;
  transition:
    color var(--transition-md) ease,
    background-color var(--transition-md) ease;
}

.pro-table-toolbar-btn:hover {
  color: rgb(var(--primary));
  background: rgb(var(--muted) / 60%);
}

.pro-table-toolbar-btn:active {
  background: rgb(var(--muted));
}

.pro-table-density-option {
  transition:
    background-color var(--transition-md) ease,
    border-color var(--transition-md) ease,
    box-shadow var(--transition-md) ease,
    color var(--transition-md) ease;
}

/* Neutral non-selected density options: PrimeVue's text Button defaults to the
   primary color, which made every option read as the active/purple state. */
.pro-table-density-option :deep(.p-button),
.pro-table-density-option :deep(.p-button-label) {
  color: rgb(var(--foreground));
  font-weight: 400;
}

.pro-table-density-option--selected :deep(.p-button),
.pro-table-density-option--selected :deep(.p-button-label) {
  color: rgb(var(--primary));
  font-weight: 600;
}

.pro-table-density-option:hover {
  background: rgb(var(--muted) / 50%);
}

.pro-table-density-option:focus-within {
  box-shadow: 0 0 0 1px rgb(var(--ring));
}

.pro-table-density-option--selected {
  background: rgb(var(--primary) / 10%);
  color: rgb(var(--primary));
  box-shadow: var(--shadow-sm);
}
</style>
