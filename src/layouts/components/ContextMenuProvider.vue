<script setup lang="ts">
/**
 * ContextMenuProvider
 *
 * - 通过监听 contextmenu 事件拦截原生右键菜单，并渲染自定义菜单
 * - 菜单内容完全由 `menu` slot 自定义
 * - 支持作用域：
 *   - local：仅对 Provider 包裹的区域生效
 *   - global：对整站生效（建议挂载在 layouts/index.vue 或 App.vue 等常驻节点）
 *
 * 说明：
 * - 菜单定位依赖鼠标坐标（x/y），无法仅用 UnoCSS class 表达，因此仅在定位字段使用动态 style
 */

type ContextMenuScope = 'local' | 'global'

export interface ContextMenuOpenContext {
  event: MouseEvent
  target: HTMLElement | null
  x: number
  y: number
}

export interface ContextMenuSlotContext {
  x: number
  y: number
  event: MouseEvent
  target: HTMLElement | null
  close: () => void
}

interface Props {
  scope?: ContextMenuScope
  disabled?: boolean
  useNativeOnEditable?: boolean
  beforeOpen?: (ctx: ContextMenuOpenContext) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  scope: 'local',
  disabled: false,
  useNativeOnEditable: true,
  beforeOpen: undefined,
})

const route = useRoute()

const rootRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const visible = ref(false)
const x = ref(0)
const y = ref(0)
const triggerEvent = ref<MouseEvent | null>(null)
const targetEl = ref<HTMLElement | null>(null)

const menuStyle = computed(() => {
  // 仅用于定位，避免把颜色/间距等写成硬编码 style
  return {
    left: `${x.value}px`,
    top: `${y.value}px`,
  } as const
})

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  const tag = target.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return true
  if (target.isContentEditable) return true
  // 常见：自定义输入组件内部可能是 div[contenteditable]
  if (target.closest('[contenteditable="true"]') != null) return true

  return false
}

function close() {
  if (!visible.value) return
  visible.value = false
  triggerEvent.value = null
  targetEl.value = null
}

async function clampToViewport() {
  await nextTick()
  const el = menuRef.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  const nextX = Math.min(Math.max(0, x.value), Math.max(0, vw - rect.width))
  const nextY = Math.min(Math.max(0, y.value), Math.max(0, vh - rect.height))

  x.value = Math.round(nextX)
  y.value = Math.round(nextY)
}

async function openAt(event: MouseEvent) {
  if (props.disabled) return

  if (props.useNativeOnEditable && isEditableTarget(event.target)) return

  const target = event.target instanceof HTMLElement ? event.target : null
  const ctx: ContextMenuOpenContext = {
    event,
    target,
    x: event.clientX,
    y: event.clientY,
  }

  if (props.beforeOpen && props.beforeOpen(ctx) === false) return

  // 拦截原生菜单
  event.preventDefault()
  event.stopPropagation()

  triggerEvent.value = event
  targetEl.value = target
  x.value = Math.round(event.clientX)
  y.value = Math.round(event.clientY)
  visible.value = true

  await clampToViewport()
}

function onRootContextMenu(event: MouseEvent) {
  void openAt(event)
}

function onGlobalContextMenu(event: MouseEvent) {
  void openAt(event)
}

function onDocPointerDown(event: MouseEvent) {
  if (!visible.value) return

  const el = menuRef.value
  if (el && event.target instanceof Node && el.contains(event.target)) return
  close()
}

function onKeyDown(event: KeyboardEvent) {
  if (!visible.value) return
  if (event.key === 'Escape') close()
}

watch(
  () => route.fullPath,
  () => close()
)

onMounted(() => {
  document.addEventListener('mousedown', onDocPointerDown, true)
  window.addEventListener('keydown', onKeyDown)

  if (props.scope === 'global') {
    document.addEventListener('contextmenu', onGlobalContextMenu, true)
    return
  }

  // local scope：等待 rootRef 可用后绑定
  const el = rootRef.value
  if (el) el.addEventListener('contextmenu', onRootContextMenu as EventListener, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocPointerDown, true)
  window.removeEventListener('keydown', onKeyDown)

  document.removeEventListener('contextmenu', onGlobalContextMenu, true)

  const el = rootRef.value
  if (el) el.removeEventListener('contextmenu', onRootContextMenu as EventListener, true)
})

const slotCtx = computed<ContextMenuSlotContext | null>(() => {
  const e = triggerEvent.value
  if (!visible.value || !e) return null

  return {
    x: x.value,
    y: y.value,
    event: e,
    target: targetEl.value,
    close,
  }
})
</script>

<template>
  <div
    ref="rootRef"
    class="layout-full"
  >
    <slot />

    <Teleport to="body">
      <div
        v-if="visible"
        class="fixed inset-0 z-50"
        @contextmenu.prevent
      >
        <div
          ref="menuRef"
          class="fixed z-50 min-w-[var(--spacing-3xl)] rounded-scale-md component-border bg-background shadow-lg"
          :style="menuStyle"
          role="menu"
        >
          <slot
            v-if="slotCtx"
            name="menu"
            v-bind="slotCtx"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
