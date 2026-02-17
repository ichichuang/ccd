<script setup lang="ts">
/**
 * 布局层：PrimeVue 全局 UI 与 window.$toast / window.$message 挂载
 * 职责：Toast、ConfirmPopup、DynamicDialog、PrimeVueDialog；
 *       useToast 封装并挂到 window；PrimeVue locale 同步；useDialog + PrimeVueDialog
 */
import Toast from 'primevue/toast'
import CheckIcon from '@primevue/icons/check'
import InfoCircleIcon from '@primevue/icons/infocircle'
import ExclamationTriangleIcon from '@primevue/icons/exclamationtriangle'
import TimesCircleIcon from '@primevue/icons/timescircle'
import MinusIcon from '@primevue/icons/minus'
import ConfirmPopup from 'primevue/confirmpopup'
import DynamicDialog from 'primevue/dynamicdialog'
import { useToast } from 'primevue/usetoast'
import { usePrimeVue } from 'primevue/config'
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import { useLocaleStore } from '@/stores/modules/locale'
import { PrimeVueDialog } from '@/components/PrimeDialog'
import { useDialog } from '@/hooks/modules/useDialog'
import ToastMessageContent from '@/layouts/components/ToastMessageContent.vue'

const { dialogStore, closeDialog } = useDialog()
const toast = useToast()
const localeStore = useLocaleStore()
const primevue = usePrimeVue()

watch(
  () => localeStore.locale,
  locale => {
    primevue.config.locale = PRIMEVUE_LOCALE_MAP[locale] ?? PRIMEVUE_LOCALE_MAP['zh-CN']
  },
  { immediate: true }
)

const DEFAULT_LIFE = 3000

/** Toast 各 severity 对应图标（PrimeVue 未为 secondary/contrast 定义，此处补充） */
const TOAST_ICON_MAP: Record<string, object> = {
  success: CheckIcon,
  info: InfoCircleIcon,
  warn: ExclamationTriangleIcon,
  error: TimesCircleIcon,
  secondary: InfoCircleIcon,
  contrast: MinusIcon,
}

const POSITION_TO_GROUP: Record<ToastPosition, string> = {
  'top-left': 'tl',
  'top-center': 'tc',
  'top-right': 'tr',
  'bottom-left': 'bl',
  'bottom-center': 'bc',
  'bottom-right': 'br',
}

function buildToastApi() {
  const severityIn = (
    severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast',
    position: ToastPosition,
    summary: string,
    detail?: string
  ) => {
    toast.add({
      severity,
      summary,
      detail: detail ?? '',
      life: DEFAULT_LIFE,
      group: POSITION_TO_GROUP[position],
    })
  }
  const t = toast as { removeAllGroups?: () => void }
  const addWithMapping = (opts: Parameters<typeof toast.add>[0]) => {
    const mapped = opts?.severity === 'danger' ? { ...opts, severity: 'error' as const } : opts
    toast.add(mapped)
  }
  return {
    add: addWithMapping,
    dangerIn: (pos: ToastPosition, s: string, d?: string) => severityIn('error', pos, s, d),
    successIn: (pos: ToastPosition, s: string, d?: string) => severityIn('success', pos, s, d),
    infoIn: (pos: ToastPosition, s: string, d?: string) => severityIn('info', pos, s, d),
    warnIn: (pos: ToastPosition, s: string, d?: string) => severityIn('warn', pos, s, d),
    secondaryIn: (pos: ToastPosition, s: string, d?: string) => severityIn('secondary', pos, s, d),
    contrastIn: (pos: ToastPosition, s: string, d?: string) => severityIn('contrast', pos, s, d),
    remove: toast.remove.bind(toast),
    removeGroup: toast.removeGroup.bind(toast),
    clear: () => {
      t.removeAllGroups?.()
    },
  }
}

/**
 * $message：居中纯提示（正中央展示、无关闭按钮、纯提示）
 * 使用 position="center" + group="center" + closable: false
 */
function buildMessageApi() {
  const show = (
    severity: 'success' | 'info' | 'warn' | 'error', // PrimeVue 使用 error，内部映射
    message: string,
    title?: string
  ) => {
    toast.add({
      severity,
      summary: title ?? message,
      detail: title ? message : undefined,
      life: DEFAULT_LIFE,
      group: 'center',
      closable: false,
    })
  }
  return {
    success: (msg: string, title?: string) => show('success', msg, title),
    danger: (msg: string, title?: string) => show('error', msg, title),
    info: (msg: string, title?: string) => show('info', msg, title),
    warn: (msg: string, title?: string) => show('warn', msg, title),
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.$toast = buildToastApi()
    window.$message = buildMessageApi()
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.$toast = undefined
    window.$message = undefined
  }
})
</script>

<template>
  <!-- 居中纯提示 Toast，供 $message 使用（正中央、无关闭按钮） -->
  <Toast
    position="center"
    group="center"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="InfoCircleIcon"
      />
    </template>
  </Toast>
  <Toast
    position="top-left"
    group="tl"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="InfoCircleIcon"
      />
    </template>
  </Toast>
  <Toast
    position="top-center"
    group="tc"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="InfoCircleIcon"
      />
    </template>
  </Toast>
  <Toast
    position="top-right"
    group="tr"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="InfoCircleIcon"
      />
    </template>
  </Toast>
  <Toast
    position="bottom-left"
    group="bl"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="InfoCircleIcon"
      />
    </template>
  </Toast>
  <Toast
    position="bottom-center"
    group="bc"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="InfoCircleIcon"
      />
    </template>
  </Toast>
  <Toast
    position="bottom-right"
    group="br"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="InfoCircleIcon"
      />
    </template>
  </Toast>
  <ConfirmPopup />
  <DynamicDialog />
  <PrimeVueDialog
    :dialog-store="dialogStore"
    @close="(_options, index, args) => closeDialog(index, args)"
  />
</template>
<style lang="scss">
/* Message 居中 Toast：强制正中央（top/left 50% + transform 居中对齐） */
.p-toast.p-toast-center {
  top: var(--spacing-3xl) !important;
  left: 50% !important;
  right: auto !important;
  bottom: auto !important;
  transform: translate(-50%, -50%) !important;
}
/* Toast 消息基础：相对定位 + 全宽 */
.p-toast-message {
  position: relative !important;
  width: 100% !important;
  .p-toast-message-content {
    display: flex !important;
    justify-content: space-between !important;
  }
}
/* 关闭按钮贴右上角（仅对有关闭按钮的 Toast：排除 center） */
.p-toast:not(.p-toast-center) .p-toast-message .p-toast-message-content {
  padding-right: calc(var(--spacing-lg) + var(--spacing-xs)) !important;
}
.p-toast:not(.p-toast-center) .p-toast-message .p-toast-close-button {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  margin: 0 !important;
}
</style>
