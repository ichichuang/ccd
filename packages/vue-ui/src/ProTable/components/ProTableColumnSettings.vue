<script setup lang="ts">
defineOptions({ name: 'ProTableColumnSettings' })

import ToggleSwitch from 'primevue/toggleswitch'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icons } from '../../Icons'

const { t } = useI18n()

/**
 * 列设置面板：拖拽排序 + 显隐开关，变更通过 update 事件上抛。
 */
export interface ColumnSettingItem {
  id: string
  title: string
}

interface LocalRow extends ColumnSettingItem {
  visible: boolean
}

const props = defineProps<{
  items: ColumnSettingItem[]
  hiddenKeys: string[]
}>()

const emit = defineEmits<{
  update: [orderedIds: string[], hiddenIds: string[]]
}>()

const localRows = ref<LocalRow[]>([])

function buildLocal(): void {
  const hidden = new Set(props.hiddenKeys)
  localRows.value = props.items.map(it => ({
    ...it,
    visible: !hidden.has(it.id),
  }))
}

function commit(): void {
  const orderedIds = localRows.value.map(r => r.id)
  const hiddenIds = localRows.value.filter(r => !r.visible).map(r => r.id)
  emit('update', orderedIds, hiddenIds)
}

function setVisible(index: number, visible: boolean): void {
  const row = localRows.value[index]
  if (!row || row.visible === visible) return
  localRows.value = localRows.value.map((r, i) => (i === index ? { ...r, visible } : r))
  commit()
}

let dragFromIndex: number | null = null

function onDragStart(index: number, e: DragEvent): void {
  dragFromIndex = index
  e.dataTransfer?.setData('text/plain', String(index))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(_index: number, e: DragEvent): void {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDrop(index: number): void {
  if (dragFromIndex === null) return
  const from = dragFromIndex
  dragFromIndex = null
  if (from === index) return
  const next = [...localRows.value]
  const [moved] = next.splice(from, 1)
  if (moved) next.splice(index, 0, moved)
  localRows.value = next
  commit()
}

function onDragEnd(): void {
  dragFromIndex = null
}

/** Popover 打开时由父级调用，确保与 Controller 状态对齐 */
function syncFromParent(): void {
  buildLocal()
}

defineExpose({ syncFromParent })

onMounted(() => buildLocal())
</script>

<template>
  <div
    class="col-stretch gap-sm min-w-[var(--spacing-5xl)] max-w-[min(100vw-2rem,22rem)] max-h-[min(60vh,28rem)]"
  >
    <p class="text-xs text-muted-foreground leading-relaxed px-xs">
      {{ t('proTable.columnSettingsHint') }}
    </p>
    <div
      class="col-stretch overflow-y-auto overflow-x-hidden rounded-md border border-solid border-border max-h-[min(50vh,24rem)]"
    >
      <div
        v-for="(row, index) in localRows"
        :key="row.id"
        class="row-between gap-sm px-sm py-xs border-b border-solid border-border/50 last:border-b-0 bg-card hover:bg-muted/25 transition-colors duration-md"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index)"
      >
        <div class="row-start items-center gap-sm min-w-0 flex-1">
          <span
            class="inline-flex shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
            draggable="true"
            role="button"
            tabindex="0"
            :aria-label="t('proTable.columnSettingsDragHandle')"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
          >
            <Icons
              name="i-lucide-grip-vertical"
              size="sm"
            />
          </span>
          <span
            class="text-sm text-foreground truncate"
            :title="row.title"
          >
            {{ row.title }}
          </span>
        </div>
        <div
          class="shrink-0"
          role="group"
          :aria-label="t('proTable.columnSettingsToggleAria', { title: row.title })"
        >
          <ToggleSwitch
            :model-value="row.visible"
            @update:model-value="v => setVisible(index, !!v)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
