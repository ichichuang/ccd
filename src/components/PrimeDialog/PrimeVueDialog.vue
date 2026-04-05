<script setup lang="ts">
/**
 * PrimeVue Dialog 封装组件
 * 支持 hideHeader/hideClose/hideFooter、自定义渲染器、拖拽、最大化、响应式多语言
 */
import type { PassThrough } from '@primevue/core'
import type { DialogPassThroughOptions } from 'primevue/dialog'
import { t } from '@/locales'
import { useDeviceStore } from '@/stores/modules/device'
import { defineComponent, type PropType } from 'vue'
import type { Component, VNode } from 'vue'
import type { ButtonProps, DialogOptions, EventType } from './utils/types'
import type { ArgsType } from './utils/types'

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

function getMemoizedVNodes(options: DialogOptions, originalIndex: number): CachedVNodes {
  const id = options._instanceId ?? String(originalIndex)

  if (!vnodeCache.has(id)) {
    vnodeCache.set(id, { header: null, content: null, footer: null })
  }

  const cache = vnodeCache.get(id)!

  if (!options.visible) {
    return cache
  }

  cache.header = options.headerRenderer
    ? options.headerRenderer({ close: () => {}, maximize: () => {}, minimize: () => {} })
    : null

  cache.content = options.contentRenderer
    ? options.contentRenderer({ options, index: originalIndex })
    : null

  cache.footer = options.footerRenderer
    ? options.footerRenderer({ options, index: originalIndex })
    : null

  return cache
}

const deviceStore = useDeviceStore()
const localeTrigger = ref(0)
const handleLocaleChange = () => {
  localeTrigger.value++
}

const effectiveDraggable = (options: DialogOptions): boolean => {
  if (options.draggable !== undefined && options.draggable !== null) {
    return options.draggable
  }
  return deviceStore.isPCLayout || deviceStore.isTabletLayout
}

const effectiveBreakpoints = (options: DialogOptions) => options.breakpoints

const getHeaderText = (options: DialogOptions): string => {
  if (isFunction(options.header)) {
    void localeTrigger.value
    return options.header()
  }
  return (options.header as string) ?? ''
}

const getButtonLabel = (btn: ButtonProps): string => {
  if (isFunction(btn.label)) {
    void localeTrigger.value
    return btn.label()
  }
  return (btn.label as string) ?? ''
}

const props = withDefaults(defineProps<{ dialogStore: readonly DialogOptions[] }>(), {
  dialogStore: () => [],
})

/** 仅最上层弹窗响应遮罩点击，避免点击一次关闭全部 */
const effectiveCloseOnMask = (options: DialogOptions, index: number): boolean =>
  options.closeOnMask !== false && index === props.dialogStore.length - 1

const emit = defineEmits<{
  close: [options: DialogOptions, index: number, args?: ArgsType]
  afterHide: [instanceId: string]
  open: [options: DialogOptions, index: number]
  maximize: [options: DialogOptions, index: number]
}>()

const sureBtnMap = ref<Record<number, { loading: boolean }>>({})
const closingIndexSet = new Set<number>()

const defaultButtons = computed(() => {
  return (options: DialogOptions): ButtonProps[] => {
    if (options.footerButtons?.length) return options.footerButtons
    void localeTrigger.value
    return [
      {
        label: () => t('common.cancel'),
        severity: 'secondary',
        text: true,
        btnClick: ({ dialog: { options: opt, index } }) => {
          const done = () => emit('close', opt, index, { command: 'cancel' })
          if (opt?.beforeCancel && isFunction(opt.beforeCancel)) {
            opt.beforeCancel(done, { options: opt, index })
          } else {
            done()
          }
        },
      },
      {
        label: () => t('common.confirm'),
        severity: 'primary',
        text: true,
        btnClick: ({ dialog: { options: opt, index } }) => {
          if (opt?.sureBtnLoading && index !== undefined) {
            sureBtnMap.value[index] = { ...sureBtnMap.value[index], loading: true }
          }
          const closeLoading = () => {
            if (opt?.sureBtnLoading && index !== undefined) {
              sureBtnMap.value[index].loading = false
            }
          }
          const done = () => {
            closeLoading()
            emit('close', opt, index, { command: 'sure' })
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

function eventsCallBack(event: EventType, options: DialogOptions, index: number) {
  const opts = options as Record<string, unknown>
  const handler = opts[event]
  if (isFunction(handler)) {
    return handler({ options, index })
  }
}

function handleClose(options: DialogOptions, index: number, args: ArgsType = { command: 'close' }) {
  if (closingIndexSet.has(index)) return
  closingIndexSet.add(index)
  emit('close', options, index, args)
  eventsCallBack('close', options, index)
  setTimeout(() => closingIndexSet.delete(index), 0)
}

function handleAfterHide(options: DialogOptions) {
  const instanceId = options._instanceId
  if (instanceId) {
    vnodeCache.delete(instanceId)
  }
  if (!instanceId) return
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

onMounted(() => {
  window.addEventListener('locale-changed', handleLocaleChange)
  window.addEventListener('locale-store-changed', handleLocaleChange)
  document.addEventListener('keydown', handleEscapeKeydown)
})
onUnmounted(() => {
  window.removeEventListener('locale-changed', handleLocaleChange)
  window.removeEventListener('locale-store-changed', handleLocaleChange)
  document.removeEventListener('keydown', handleEscapeKeydown)
  vnodeCache.clear()
})

const standardDialogs = computed(() =>
  props.dialogStore.map((options, originalIndex) => ({ options, originalIndex }))
)

type DialogPtValue = PassThrough<DialogPassThroughOptions>

/** 合并 maskClass 与 pt 时缓存引用，避免每次 render 返回新对象导致 PrimeVue 在动画期间重 Patch DOM、打断 CSS 过渡 */
const dialogPtCache = new WeakMap<DialogOptions, DialogPtValue>()

/**
 * 默认 Dialog 面板 glass 外观（mask-only）。
 * padding 仍由 PrimeVue 自己的 header/content/footer 规则控制；
 * business 侧 options.pt 的优先级高于默认值。
 */
const defaultDialogPt: DialogPtValue = {
  root: { class: 'glass-shell transform-gpu will-change-transform' },
  header: { class: 'bg-transparent' },
  content: { class: 'bg-transparent' },
  footer: { class: 'bg-transparent' },
  mask: { class: '!bg-transparent' },
}

/**
 * 将 maskClass 与既有 pt 合并。
 * V27.3：无 maskClass 时直接返回 `options.pt` 引用；有 maskClass 时对合并结果按 options 实例缓存，保证 `:pt` 引用稳定。
 */
function getDialogPt(options: DialogOptions): DialogPtValue | undefined {
  const basePt = { ...defaultDialogPt, ...(options.pt ?? {}) } as DialogPtValue
  if (!options.maskClass) return basePt
  if (!dialogPtCache.has(options)) {
    dialogPtCache.set(options, {
      ...basePt,
      mask: { class: options.maskClass },
    })
  }
  return dialogPtCache.get(options)
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
    @after-hide="handleAfterHide(options)"
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
              :loading="(key === 1 && sureBtnMap[originalIndex]?.loading) || btn.loading"
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
