<script setup lang="ts">
/**
 * PrimeVue Dialog 封装组件
 * 支持 hideHeader/hideClose/hideFooter、自定义渲染器、拖拽、最大化、响应式多语言
 */
import { t } from '@/locales'
import { useDeviceStore } from '@/stores/modules/device'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Component, VNode } from 'vue'
import type { ButtonProps, DialogOptions, EventType } from './utils/types'
import type { ArgsType } from './utils/types'
import { DIALOG_BREAKPOINTS } from './utils/constants'

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
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

const effectiveBreakpoints = (options: DialogOptions) => options.breakpoints ?? DIALOG_BREAKPOINTS

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

function handleVisibleUpdate(visible: boolean, options: DialogOptions, index: number) {
  if (!visible) handleClose(options, index, { command: 'close' })
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
})

const standardDialogs = computed(() =>
  props.dialogStore.map((options, originalIndex) => ({ options, originalIndex }))
)

const dialogContentRenderers = computed(() => {
  const renderers: Record<number, { render: () => VNode | Component }> = {}
  props.dialogStore.forEach((options, originalIndex) => {
    if (options.contentRenderer) {
      const renderer = options.contentRenderer
      renderers[originalIndex] = {
        render: () => renderer({ options, index: originalIndex }),
      }
    }
  })
  return renderers
})

const dialogHeaderRenderers = computed(() => {
  const renderers: Record<number, { render: () => VNode | Component }> = {}
  props.dialogStore.forEach((options, originalIndex) => {
    if (options.headerRenderer && !options.hideHeader) {
      const renderer = options.headerRenderer
      renderers[originalIndex] = {
        render: () => renderer({ close: () => {}, maximize: () => {}, minimize: () => {} }),
      }
    }
  })
  return renderers
})

const dialogFooterRenderers = computed(() => {
  const renderers: Record<number, { render: () => VNode | Component }> = {}
  props.dialogStore.forEach((options, originalIndex) => {
    if (options.footerRenderer) {
      const renderer = options.footerRenderer
      renderers[originalIndex] = {
        render: () => renderer({ options, index: originalIndex }),
      }
    }
  })
  return renderers
})
</script>

<template>
  <Dialog
    v-for="{ options, originalIndex } in standardDialogs"
    :key="`dialog-${options._instanceId ?? originalIndex}`"
    :visible="options.visible"
    :header="options.hideHeader ? undefined : getHeaderText(options)"
    :style="options.style"
    :class="options.class"
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
    @hide="handleClose(options, originalIndex)"
    @maximize="handleMaximize(options, originalIndex)"
  >
    <template
      v-if="options?.headerRenderer && !options?.hideHeader"
      #header
    >
      <component :is="dialogHeaderRenderers[originalIndex]" />
    </template>
    <template
      v-else-if="!options?.hideHeader"
      #header
    >
      <span>{{ getHeaderText(options) }}</span>
    </template>

    <component
      :is="dialogContentRenderers[originalIndex]"
      v-if="options?.contentRenderer"
      v-bind="options?.props"
      @close="(args: ArgsType) => handleClose(options, originalIndex, args)"
    />

    <template
      v-if="!options?.hideFooter"
      #footer
    >
      <template v-if="options?.footerRenderer">
        <component :is="dialogFooterRenderers[originalIndex]" />
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
