<script setup lang="ts">
/**
 * PrimeVue Dialog 封装组件
 * 支持 hideHeader/hideClose/hideFooter、自定义渲染器、拖拽、最大化、响应式多语言
 */
import { useEventListener } from '@vueuse/core'
import type { PassThrough } from '@primevue/core'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import type { DialogPassThroughOptions } from 'primevue/dialog'
import { computed, defineComponent, inject, onUnmounted, ref, type PropType } from 'vue'
import type { Component, VNode } from 'vue'
import { DEFAULT_PRIME_DIALOG_RUNTIME_CONFIG, PRIME_DIALOG_RUNTIME_CONFIG_KEY } from './runtime'
import type { ButtonProps, DialogOptions, EventType } from './utils/types'
import type { ArgsType } from './utils/types'

const props = withDefaults(defineProps<{ dialogStore: readonly DialogOptions[] }>(), {
  dialogStore: () => [],
})

const emit = defineEmits<{
  close: [options: DialogOptions, index: number, args?: ArgsType]
  afterHide: [instanceId: string]
  open: [options: DialogOptions, index: number]
  maximize: [options: DialogOptions, index: number]
}>()

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

/**
 * V28.0：渲染结果类型（VNode / 组件 / null）。
 * V34.0：缓存已求值的 VNode，退场动画期间不再重新执行 render，避免重内容 thrash。
 */
type RenderFnResult = VNode | Component | null

const VNodeRenderer = defineComponent({
  name: 'PrimeDialogVNodeRenderer',
  props: {
    vnode: {
      type: [Object, Function] as PropType<RenderFnResult>,
      default: null,
    },
  },
  setup(props) {
    return () => props.vnode ?? null
  },
})

/** V34.0：按实例缓存已求值的 VNode；visible=false 时冻结上一帧，禁止重新执行 content/header/footer 渲染函数 */
type CachedVNodes = {
  header: RenderFnResult
  content: RenderFnResult
  footer: RenderFnResult
}

const vnodeCache = new Map<string, CachedVNodes>()
const getDialogInstanceId = (options: DialogOptions, index: number): string =>
  options._instanceId ?? `dialog-${index}`

function getMemoizedVNodes(options: DialogOptions, originalIndex: number): CachedVNodes {
  const id = getDialogInstanceId(options, originalIndex)

  if (!vnodeCache.has(id)) {
    vnodeCache.set(id, { header: null, content: null, footer: null })
  }

  const cache = vnodeCache.get(id)!

  if (!options.visible) {
    return cache
  }

  cache.header = options.headerRenderer
    ? options.headerRenderer({
        close: () => handleClose(options, originalIndex, { command: 'close' }),
      })
    : null

  cache.content = options.contentRenderer
    ? options.contentRenderer({ options, index: originalIndex })
    : null

  cache.footer = options.footerRenderer
    ? options.footerRenderer({ options, index: originalIndex })
    : null

  return cache
}

const runtimeConfig = inject(PRIME_DIALOG_RUNTIME_CONFIG_KEY, DEFAULT_PRIME_DIALOG_RUNTIME_CONFIG)
const localeTrigger = ref(0)
const handleLocaleChange = () => {
  localeTrigger.value++
}

const effectiveDraggable = (options: DialogOptions): boolean => {
  if (options.draggable !== undefined && options.draggable !== null) {
    return options.draggable
  }
  return (
    runtimeConfig.isDialogDraggable?.() ?? DEFAULT_PRIME_DIALOG_RUNTIME_CONFIG.isDialogDraggable()
  )
}

const translate = (key: string, fallback: string): string =>
  runtimeConfig.translate?.(key) ?? fallback

const effectiveBreakpoints = (options: DialogOptions) => options.breakpoints

const getHeaderText = (options: DialogOptions): string => {
  if (typeof options.header === 'function') {
    void localeTrigger.value
    return options.header()
  }
  return options.header ?? ''
}

const getButtonLabel = (btn: ButtonProps): string => {
  if (typeof btn.label === 'function') {
    void localeTrigger.value
    return btn.label()
  }
  return btn.label
}

/** 仅最上层弹窗响应遮罩点击，避免点击一次关闭全部 */
const effectiveCloseOnMask = (options: DialogOptions, index: number): boolean =>
  options.closeOnMask !== false && index === props.dialogStore.length - 1

const sureBtnMap = ref<Record<string, { loading: boolean }>>({})
const closingInstanceIds = new Set<string>()

function getSureButtonLoading(options: DialogOptions, index: number): boolean {
  return sureBtnMap.value[getDialogInstanceId(options, index)]?.loading === true
}

const defaultButtons = computed(() => {
  return (options: DialogOptions): ButtonProps[] => {
    if (options.footerButtons?.length) return options.footerButtons
    void localeTrigger.value
    return [
      {
        label: () => translate('common.cancel', 'Cancel'),
        severity: 'secondary',
        text: true,
        btnClick: ({ dialog: { options: opt, index } }) => {
          const done = () => handleClose(opt, index, { command: 'cancel' })
          if (opt?.beforeCancel && isFunction(opt.beforeCancel)) {
            opt.beforeCancel(done, { options: opt, index })
          } else {
            done()
          }
        },
      },
      {
        label: () => translate('common.confirm', 'Confirm'),
        severity: 'primary',
        text: true,
        btnClick: ({ dialog: { options: opt, index } }) => {
          const instanceId = getDialogInstanceId(opt, index)
          if (opt?.sureBtnLoading && index !== undefined) {
            sureBtnMap.value[instanceId] = { ...sureBtnMap.value[instanceId], loading: true }
          }
          const closeLoading = () => {
            if (opt?.sureBtnLoading && index !== undefined) {
              sureBtnMap.value[instanceId] = {
                ...sureBtnMap.value[instanceId],
                loading: false,
              }
            }
          }
          const done = () => {
            closeLoading()
            handleClose(opt, index, { command: 'sure' })
          }
          if (opt?.beforeSure && isFunction(opt.beforeSure)) {
            opt.beforeSure(done, { options: opt, index, closeLoading })
          } else {
            done()
          }
        },
      },
    ] as ButtonProps[]
  }
})

function eventsCallBack(
  event: EventType,
  options: DialogOptions,
  index: number,
  args: ArgsType = { command: 'close' }
) {
  if (event === 'open') {
    options.open?.({ options, index })
    return
  }
  if (event === 'close') {
    options.close?.({ options, index })
    options.closeCallBack?.({ options, index, args })
    return
  }
  if (event === 'maximize') {
    options.maximize?.({ options, index })
  }
}

function handleClose(options: DialogOptions, index: number, args: ArgsType = { command: 'close' }) {
  const instanceId = getDialogInstanceId(options, index)
  if (closingInstanceIds.has(instanceId)) return
  closingInstanceIds.add(instanceId)
  emit('close', options, index, args)
  eventsCallBack('close', options, index, args)
}

function handleAfterHide(options: DialogOptions, index: number) {
  const instanceId = getDialogInstanceId(options, index)
  vnodeCache.delete(instanceId)
  closingInstanceIds.delete(instanceId)
  delete sureBtnMap.value[instanceId]
  emit('afterHide', instanceId)
}

function handleVisibleUpdate(visible: boolean, options: DialogOptions, index: number) {
  // V27.2: 与 PrimeVue 内部关闭信号绝对同步，避免同一 tick 内 store 仍为 true 导致重渲染把 Dialog 拉回打开态（闪一下）
  if (!visible) {
    handleClose(options, index, { command: 'close' })
  }
}

function handleOpen(options: DialogOptions, index: number) {
  emit('open', options, index)
  eventsCallBack('open', options, index)
}

function handleMaximize(options: DialogOptions, index: number) {
  emit('maximize', options, index)
  eventsCallBack('maximize', options, index)
}

/** 全局 ESC 监听：仅关闭最上层弹窗。PrimeVue closeOnEscape 对动态 prop 不生效，故自管 ESC */
function handleEscapeKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  const store = props.dialogStore
  if (store.length === 0) return
  const topIndex = store.length - 1
  const top = store[topIndex]
  if (top?.visible && top.closeOnEscape !== false) {
    handleClose(top, topIndex, { command: 'close' })
  }
}

if (typeof window !== 'undefined') {
  useEventListener(window, 'locale-changed', handleLocaleChange)
}
if (typeof document !== 'undefined') {
  useEventListener(document, 'keydown', handleEscapeKeydown)
}
onUnmounted(() => {
  vnodeCache.clear()
})

const standardDialogs = computed(() =>
  props.dialogStore.map((options, originalIndex) => ({ options, originalIndex }))
)

type DialogPtValue = PassThrough<DialogPassThroughOptions>
type CachedDialogPt = {
  merged: DialogPtValue
  maskClass: string
  ptSource: DialogOptions['pt']
}

/** 合并 maskClass 与 pt 时缓存引用，避免每次 render 返回新对象导致 PrimeVue 在动画期间重 Patch DOM、打断 CSS 过渡 */
const dialogPtCache = new WeakMap<DialogOptions, CachedDialogPt>()

/**
 * 默认 Dialog：遮罩固定压暗，面板使用实体 card，避免全屏或面板 backdrop filter 造成暗色漂白。
 * business 侧 options.pt 覆盖在默认值之上；options.maskClass 追加在默认遮罩类之后以便覆盖。
 */
const defaultDialogPt: DialogPtValue = {
  root: {
    class:
      'ccd-dialog-panel rounded-xl p-md border border-border/35 dark:border-border/45 shadow-xl',
  },
  header: { class: 'bg-transparent px-md py-sm' },
  content: { class: 'bg-transparent overflow-y-auto px-md py-sm' },
  footer: { class: 'bg-transparent px-md py-sm' },
  mask: {
    class:
      'ccd-dialog-mask transition-opacity duration-md opacity-100 [&.p-overlay-mask-leave-active]:opacity-0',
  },
}

/**
 * 将 maskClass 与既有 pt 合并。
 * V27.3：有 maskClass 时对合并结果按 options 实例缓存，保证 `:pt` 引用稳定。
 */
function getDialogPt(options: DialogOptions): DialogPtValue | undefined {
  const basePt = { ...defaultDialogPt, ...(options.pt ?? {}) } as DialogPtValue
  const maskClassFromPt = (() => {
    const mask = (basePt as Record<string, unknown>).mask
    if (typeof mask === 'string') return mask
    if (mask && typeof mask === 'object') {
      const cls = (mask as { class?: unknown }).class
      if (typeof cls === 'string') return cls
    }
    return ''
  })()
  const mergedMaskClass = [maskClassFromPt, options.maskClass].filter(Boolean).join(' ').trim()
  const cached = dialogPtCache.get(options)
  if (cached && cached.maskClass === mergedMaskClass && cached.ptSource === options.pt) {
    return cached.merged
  }
  const mergedPt = {
    ...basePt,
    mask: { class: mergedMaskClass },
  } as DialogPtValue
  dialogPtCache.set(options, {
    merged: mergedPt,
    maskClass: mergedMaskClass,
    ptSource: options.pt,
  })
  return mergedPt
}
</script>

<template>
  <Dialog
    v-for="{ options, originalIndex } in standardDialogs"
    :key="`dialog-${options._instanceId ?? originalIndex}`"
    :visible="options.visible"
    :header="options.hideHeader ? undefined : getHeaderText(options)"
    :style="options.style"
    :class="options.class"
    :pt="getDialogPt(options)"
    :maximizable="options.maximizable"
    :close-on-escape="false"
    :dismissable-mask="effectiveCloseOnMask(options, originalIndex)"
    :closable="options.hideClose ? false : options.closable"
    :modal="options.modal"
    :append-to="options.appendTo"
    :position="options.position"
    :draggable="effectiveDraggable(options)"
    :keep-in-viewport="options.keepInViewport"
    :breakpoints="effectiveBreakpoints(options)"
    @update:visible="(visible: boolean) => handleVisibleUpdate(visible, options, originalIndex)"
    @show="handleOpen(options, originalIndex)"
    @after-hide="handleAfterHide(options, originalIndex)"
    @maximize="handleMaximize(options, originalIndex)"
  >
    <template
      v-if="options?.headerRenderer && !options?.hideHeader"
      #header
    >
      <VNodeRenderer :vnode="getMemoizedVNodes(options, originalIndex).header" />
    </template>
    <template
      v-else-if="!options?.hideHeader"
      #header
    >
      <span>{{ getHeaderText(options) }}</span>
    </template>

    <VNodeRenderer
      v-if="options?.contentRenderer"
      :vnode="getMemoizedVNodes(options, originalIndex).content"
    />

    <template
      v-if="!options?.hideFooter"
      #footer
    >
      <template v-if="options?.footerRenderer">
        <VNodeRenderer :vnode="getMemoizedVNodes(options, originalIndex).footer" />
      </template>
      <template v-else>
        <div class="flex gap-md justify-end">
          <template
            v-for="(btn, key) in defaultButtons(options)"
            :key="key"
          >
            <Button
              :severity="btn.severity"
              :loading="(key === 1 && getSureButtonLoading(options, originalIndex)) || btn.loading"
              :disabled="btn.disabled"
              :icon="btn.icon"
              :text="btn.text"
              :outlined="btn.outlined"
              :rounded="btn.rounded"
              :size="btn.size"
              :class="btn.class"
              :style="btn.style"
              @click="
                btn.btnClick?.({
                  dialog: { options, index: originalIndex },
                  button: { btn, index: key },
                })
              "
            >
              {{ getButtonLabel(btn) }}
            </Button>
          </template>
        </div>
      </template>
    </template>
  </Dialog>
</template>

<style>
.ccd-dialog-panel {
  background: rgb(var(--card)) !important;
  color: rgb(var(--card-foreground)) !important;
  backdrop-filter: none !important;
  will-change: auto !important;
}

.dark .ccd-dialog-panel {
  box-shadow:
    0 24px 70px rgb(0 0 0 / 42%),
    inset 0 1px 0 rgb(var(--foreground) / 6%) !important;
}

.ccd-dialog-mask {
  background: rgb(0 0 0 / 18%) !important;
  backdrop-filter: none !important;
  will-change: auto !important;
}

.dark .ccd-dialog-mask {
  background: rgb(0 0 0 / 48%) !important;
}
</style>
