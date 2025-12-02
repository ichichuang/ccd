<script setup lang="ts">
/**
 * PrimeVue 对话框组件
 *
 * 支持的功能：
 * - hideHeader: 控制是否隐藏对话框头部（包括头部内容和关闭按钮）
 * - hideClose: 控制是否隐藏关闭按钮（不影响头部内容）
 * - hideFooter: 控制是否隐藏对话框底部按钮区域
 * - 支持自定义头部、内容、底部渲染器
 * - 支持确认对话框和动态对话框
 * - 支持拖拽、最大化、最小化等操作
 * - 支持响应式多语言：header 和 footerButtons[].label 可以是函数
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ButtonProps, DialogOptions, EventType } from './utils/types'

// 简单的 isFunction 工具函数
const isFunction = (value: any): value is (...args: any[]) => any => {
  return typeof value === 'function'
}

// 语言变化响应式触发器
const localeTrigger = ref(0)

// 监听语言变化
const handleLocaleChange = () => {
  localeTrigger.value++
}

onMounted(() => {
  window.addEventListener('locale-changed', handleLocaleChange)
  window.addEventListener('locale-store-changed', handleLocaleChange)
})

onUnmounted(() => {
  window.removeEventListener('locale-changed', handleLocaleChange)
  window.removeEventListener('locale-store-changed', handleLocaleChange)
})

// 获取响应式的 header 文本
const getHeaderText = (options: DialogOptions): string => {
  if (isFunction(options.header)) {
    // 访问 localeTrigger 以建立响应式依赖
    void localeTrigger.value
    return options.header()
  }
  return options.header || ''
}

// 获取响应式的按钮 label 文本
const getButtonLabel = (btn: ButtonProps): string => {
  if (isFunction(btn.label)) {
    // 访问 localeTrigger 以建立响应式依赖
    void localeTrigger.value
    return btn.label()
  }
  return btn.label
}

const props = withDefaults(
  defineProps<{
    dialogStore: DialogOptions[]
  }>(),
  {
    dialogStore: () => [],
  }
)

const emit = defineEmits<{
  close: [options: DialogOptions, index: number, args?: any]
  open: [options: DialogOptions, index: number]
  maximize: [options: DialogOptions, index: number]
  minimize: [options: DialogOptions, index: number]
  fullscreen: [options: DialogOptions, index: number]
}>()

const sureBtnMap = ref<Record<number, { loading: boolean }>>({})

// 默认按钮配置
const defaultButtons = computed(() => {
  return (options: DialogOptions): ButtonProps[] => {
    if (options.footerButtons && options.footerButtons.length > 0) {
      return options.footerButtons
    }

    // 访问 localeTrigger 以建立响应式依赖
    void localeTrigger.value

    return [
      {
        label: '取消',
        severity: 'secondary',
        text: true,
        btnClick: ({ dialog: { options, index } }) => {
          const done = () => {
            emit('close', options, index, { command: 'cancel' })
          }
          if (options?.beforeCancel && isFunction(options.beforeCancel)) {
            options.beforeCancel(done, { options, index })
          } else {
            done()
          }
        },
      },
      {
        label: '确定',
        severity: 'primary',
        text: true,
        btnClick: ({ dialog: { options, index } }) => {
          if (options?.sureBtnLoading && index !== undefined) {
            sureBtnMap.value[index] = Object.assign({}, sureBtnMap.value[index], {
              loading: true,
            })
          }
          const closeLoading = () => {
            if (options?.sureBtnLoading && index !== undefined) {
              sureBtnMap.value[index].loading = false
            }
          }
          const done = () => {
            closeLoading()
            emit('close', options, index, { command: 'sure' })
          }
          if (options?.beforeSure && isFunction(options.beforeSure)) {
            options.beforeSure(done, { options, index, closeLoading })
          } else {
            done()
          }
        },
      },
    ] as ButtonProps[]
  }
})

// 获取对话框在 dialogStore 中的真实索引
function getDialogStoreIndex(options: DialogOptions): number {
  return props.dialogStore.findIndex(item => item === options)
}

// 事件回调处理
function eventsCallBack(event: EventType, options: DialogOptions, index: number) {
  const eventHandler = (options as any)[event]
  if (eventHandler && isFunction(eventHandler)) {
    return eventHandler({ options, index })
  }
}

// 处理关闭事件
function handleClose(options: DialogOptions, index: number, args = { command: 'close' }) {
  emit('close', options, index, args)
  eventsCallBack('close', options, index)

  // 当通过 ESC 键或点击遮罩关闭时，需要清理索引
  // 这里我们通过 emit 事件通知父组件，让父组件处理索引清理
}

// 处理打开事件
function handleOpen(options: DialogOptions, index: number) {
  emit('open', options, index)
  eventsCallBack('open', options, index)
}

// 处理最大化事件
function handleMaximize(options: DialogOptions, index: number) {
  emit('maximize', options, index)
  eventsCallBack('maximize', options, index)
}

// 过滤不同类型的对话框
const standardDialogs = computed(() =>
  props.dialogStore.filter(item => item.type === 'dialog' || !item.type)
)

const confirmDialogs = computed(() => props.dialogStore.filter(item => item.type === 'confirm'))

const dynamicDialogs = computed(() => props.dialogStore.filter(item => item.type === 'dynamic'))
</script>

<template lang="pug">
// 标准对话框
Dialog(
  v-for='(options, index) in standardDialogs',
  :key='`dialog-${index}`',
  v-model:visible='options.visible',
  :header='options.hideHeader ? undefined : getHeaderText(options)',
  :style='options.style',
  :class='options.class',
  :maximizable='options.maximizable',
  :close-on-escape='options.closeOnEscape',
  :dismissable-mask='options.closeOnMask',
  :closable='options.hideClose ? false : options.closable',
  :modal='options.modal',
  :append-to='options.appendTo',
  :position='options.position',
  :draggable='options.draggable',
  :keep-in-viewport='options.keepInViewport',
  :breakpoints='options.breakpoints',
  @show='handleOpen(options, getDialogStoreIndex(options))',
  @hide='handleClose(options, getDialogStoreIndex(options))',
  @maximize='handleMaximize(options, getDialogStoreIndex(options))'
)
  // 自定义头部（当有自定义头部渲染器且不隐藏头部时显示）
  template(v-if='options?.headerRenderer && !options?.hideHeader', #header)
    component(
      :is='options.headerRenderer({ close: () => {}, maximize: () => {}, minimize: () => {} })'
    )

  // 默认头部（当没有自定义头部且不隐藏头部时显示）
  template(v-else-if='!options?.hideHeader', #header)
    span {{ getHeaderText(options) }}

  // 自定义内容（当有内容渲染器时显示）
  component(
    v-if='options?.contentRenderer',
    :is='options.contentRenderer({ options, index: getDialogStoreIndex(options) })',
    v-bind='options?.props',
    @close='(args: any) => handleClose(options, getDialogStoreIndex(options), args)'
  )

  // 自定义底部（当不隐藏底部时显示）
  template(v-if='!options?.hideFooter', #footer)
    template(v-if='options?.footerRenderer')
      component(:is='options.footerRenderer({ options, index: getDialogStoreIndex(options) })')
    template(v-else)
      .flex.gap-gap.justify-end
        template(v-for='(btn, key) in defaultButtons(options)', :key='key')
          Button(
            :severity='btn.severity',
            :loading='(key === 1 && sureBtnMap[getDialogStoreIndex(options)]?.loading) || btn.loading',
            :disabled='btn.disabled',
            :icon='btn.icon',
            :text='btn.text',
            :outlined='btn.outlined',
            :rounded='btn.rounded',
            :size='btn.size',
            :class='btn.class',
            :style='btn.style',
            @click='btn.btnClick?.({ dialog: { options, index: getDialogStoreIndex(options) }, button: { btn, index: key } })'
          ) {{ getButtonLabel(btn) }}

// 确认对话框
ConfirmDialog(
  v-for='(options, index) in confirmDialogs',
  :key='`confirm-${index}`',
  :group='options.confirmOptions?.group'
)

// 动态对话框
DynamicDialog(
  v-for='(options, index) in dynamicDialogs',
  :key='`dynamic-${index}`',
  :style='options.style',
  :class='options.class'
)
</template>
