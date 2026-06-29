<script setup lang="ts">
defineOptions({ name: 'ProTableColumnSettings' })

import ToggleSwitch from 'primevue/toggleswitch'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 列设置面板：拖拽排序 + 显隐开关，变更通过 update 事件上抛。
 *
 * 视觉/尺寸/分隔线/拖拽手柄全部以组件自带 scoped CSS（编译进 dist/vue-ui.css）
 * 表达，而不是依赖宿主应用生成原子类 —— 宿主 UnoCSS 的 content pipeline 会
 * 排除 `/dist/`，仅在 vue-ui 模板里出现的工具类（如 `border-b`、`border-border/50`、
 * `max-w-[…]`）与 `i-lucide-grip-vertical` 图标不会被生成，会回退成浏览器默认的
 * 3px / currentColor 边框与不可见手柄。token 一律走 `rgb(var(--token))`。
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

const { t } = useI18n()
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

/** 把第 from 行移动到第 to 行的位置，越界则忽略；拖拽与键盘排序共用。 */
function moveRow(from: number, to: number): void {
  if (from === to) return
  if (from < 0 || to < 0 || from >= localRows.value.length || to >= localRows.value.length) return
  const next = [...localRows.value]
  const [moved] = next.splice(from, 1)
  if (!moved) return
  next.splice(to, 0, moved)
  localRows.value = next
  commit()
}

// ── 指针拖拽（HTML5 DnD，鼠标）─────────────────────────────────────────────
const dragFromIndex = ref<number | null>(null)
/** 当前 dragover 命中的目标行；用于渲染落点指示线。 */
const dropTargetIndex = ref<number | null>(null)

function onDragStart(index: number, e: DragEvent): void {
  dragFromIndex.value = index
  e.dataTransfer?.setData('text/plain', String(index))
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(index: number, e: DragEvent): void {
  if (dragFromIndex.value === null) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dropTargetIndex.value = index
}

function onDrop(index: number): void {
  if (dragFromIndex.value === null) return
  const from = dragFromIndex.value
  resetDragState()
  moveRow(from, index)
}

function onDragEnd(): void {
  resetDragState()
}

function resetDragState(): void {
  dragFromIndex.value = null
  dropTargetIndex.value = null
}

// ── 键盘排序（无障碍：让手柄 role=button 真正可操作）──────────────────────────
function onHandleKeydown(index: number, e: KeyboardEvent): void {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveRow(index, index - 1)
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveRow(index, index + 1)
  } else if (e.key === 'Home') {
    e.preventDefault()
    moveRow(index, 0)
  } else if (e.key === 'End') {
    e.preventDefault()
    moveRow(index, localRows.value.length - 1)
  }
  // keyed v-for：重排后 Vue 会移动同一个 DOM 节点，焦点随手柄保留，无需手动 refocus。
}

/** Popover 打开时由父级调用，确保与 Controller 状态对齐 */
function syncFromParent(): void {
  resetDragState()
  buildLocal()
}

onMounted(() => buildLocal())

defineExpose({ syncFromParent })
</script>

<template>
  <div class="pcs-root col-stretch gap-sm">
    <p class="pcs-hint text-xs leading-relaxed px-xs">
      {{ t('proTable.columnSettingsHint') }}
    </p>
    <ul class="pcs-list col-stretch">
      <li
        v-for="(row, index) in localRows"
        :key="row.id"
        class="pcs-row relative row-between gap-sm px-sm py-xs"
        :class="{
          'pcs-row--dragging': dragFromIndex === index,
          'pcs-row--drop': dropTargetIndex === index && dragFromIndex !== index,
        }"
        @dragover="onDragOver(index, $event)"
        @drop="onDrop(index)"
      >
        <div class="row-start items-center gap-sm min-w-0 flex-1">
          <span
            class="pcs-handle inline-flex shrink-0 center"
            draggable="true"
            role="button"
            tabindex="0"
            :aria-label="t('proTable.columnSettingsDragHandle')"
            @dragstart="onDragStart(index, $event)"
            @dragend="onDragEnd"
            @keydown="onHandleKeydown(index, $event)"
          >
            <svg
              class="pcs-handle-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <circle
                cx="9"
                cy="6"
                r="1.4"
              />
              <circle
                cx="9"
                cy="12"
                r="1.4"
              />
              <circle
                cx="9"
                cy="18"
                r="1.4"
              />
              <circle
                cx="15"
                cy="6"
                r="1.4"
              />
              <circle
                cx="15"
                cy="12"
                r="1.4"
              />
              <circle
                cx="15"
                cy="18"
                r="1.4"
              />
            </svg>
          </span>
          <span
            class="pcs-title text-sm truncate"
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
            :aria-label="t('proTable.columnSettingsToggleAria', { title: row.title })"
            @update:model-value="v => setVisible(index, !!v)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* 组件自带样式 —— 全部编译进 dist/vue-ui.css，不依赖宿主生成原子类。
   token 统一走 rgb(var(--token))，与 ProTableToolbar 的密度面板保持同一套写法。 */
.pcs-root {
  /* 尺寸约束此前写在 max-w-[…]/min-w-[…]/max-h-[…] 任意值工具类里，
     这些只在 vue-ui 模板出现 → 宿主不生成 → 之前完全失效（弹层过宽）。 */
  min-width: var(--spacing-5xl);
  max-width: min(100vw - 2rem, 20rem);
}

.pcs-hint {
  color: rgb(var(--muted-foreground));
}

.pcs-list {
  max-height: min(50vh, 22rem);
  overflow: hidden auto;
  border: 1px solid rgb(var(--border));
  border-radius: var(--radius-md);

  /* 行间距用容器内的分隔线表达，避免外层再叠一圈重边框。 */
  background: transparent;
}

.pcs-row {
  background: transparent;
  transition:
    background-color var(--transition-md) ease,
    opacity var(--transition-md) ease;
}

/* 行分隔：1px 半透明 token 细线（替代回退出来的 3px / #333 currentColor 粗黑线）。 */
.pcs-row + .pcs-row {
  border-top: 1px solid rgb(var(--border) / 50%);
}

.pcs-row:hover {
  background: rgb(var(--muted) / 40%);
}

.pcs-row--dragging {
  opacity: 0.45;
}

/* 拖拽落点指示线：贴在目标行顶部的一条 primary 强调线。 */
.pcs-row--drop::before {
  content: '';
  position: absolute;
  left: var(--spacing-xs);
  right: var(--spacing-xs);
  top: -1px;
  height: 2px;
  border-radius: 999px;
  background: rgb(var(--primary));
}

.pcs-handle {
  width: var(--control-action-size-sm);
  height: var(--control-action-size-sm);
  color: rgb(var(--muted-foreground));
  border-radius: var(--radius-sm);
  cursor: grab;
  touch-action: none;
  transition:
    color var(--transition-md) ease,
    background-color var(--transition-md) ease,
    box-shadow var(--transition-md) ease;
}

.pcs-handle:hover {
  color: rgb(var(--foreground));
  background: rgb(var(--muted) / 50%);
}

.pcs-handle:active {
  cursor: grabbing;
}

.pcs-handle:focus-visible {
  outline: none;
  color: rgb(var(--foreground));
  box-shadow: 0 0 0 2px rgb(var(--ring));
}

.pcs-title {
  color: rgb(var(--foreground));
}
</style>
