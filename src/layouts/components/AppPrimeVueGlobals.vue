<script setup lang="ts">
/**
 * 布局层：PrimeVue 全局 UI 与 window.$toast / window.$message 挂载
 * 职责：Toast、ConfirmPopup、ConfirmDialog、DynamicDialog、PrimeVueDialog；
 *       useToast 封装并挂到 window；PrimeVue locale 同步；useDialog + PrimeVueDialog
 */
import Toast from 'primevue/toast'
import ConfirmPopup from 'primevue/confirmpopup'
import ConfirmDialog from 'primevue/confirmdialog'
import DynamicDialog from 'primevue/dynamicdialog'
import { useToast } from 'primevue/usetoast'
import { usePrimeVue } from 'primevue/config'
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import { useLocaleStore } from '@/stores/modules/locale'
import { PrimeVueDialog } from '@/components/prime-dialog'
import { useDialog } from '@/hooks/modules/useDialog'

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
    severity: 'success' | 'info' | 'warn' | 'error',
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
  return {
    add: toast.add.bind(toast),
    errorIn: (pos: ToastPosition, s: string, d?: string) => severityIn('error', pos, s, d),
    successIn: (pos: ToastPosition, s: string, d?: string) => severityIn('success', pos, s, d),
    infoIn: (pos: ToastPosition, s: string, d?: string) => severityIn('info', pos, s, d),
    warnIn: (pos: ToastPosition, s: string, d?: string) => severityIn('warn', pos, s, d),
    remove: toast.remove.bind(toast),
    removeGroup: toast.removeGroup.bind(toast),
    clear: () => {
      t.removeAllGroups?.()
    },
  }
}

function buildMessageApi() {
  const show = (
    severity: 'success' | 'info' | 'warn' | 'error',
    message: string,
    title?: string
  ) => {
    toast.add({
      severity,
      summary: title ?? message,
      detail: title ? message : undefined,
      life: DEFAULT_LIFE,
    })
  }
  return {
    success: (msg: string, title?: string) => show('success', msg, title),
    error: (msg: string, title?: string) => show('error', msg, title),
    info: (msg: string, title?: string) => show('info', msg, title),
    warning: (msg: string, title?: string) => show('warn', msg, title),
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
  <!-- 无 group 的默认 Toast，供 $message 使用 -->
  <Toast />
  <Toast
    position="top-left"
    group="tl"
  />
  <Toast
    position="top-center"
    group="tc"
  />
  <Toast
    position="top-right"
    group="tr"
  />
  <Toast
    position="bottom-left"
    group="bl"
  />
  <Toast
    position="bottom-center"
    group="bc"
  />
  <Toast
    position="bottom-right"
    group="br"
  />
  <ConfirmPopup />
  <ConfirmDialog />
  <DynamicDialog />
  <PrimeVueDialog
    :dialog-store="dialogStore"
    @close="(_options, index, args) => closeDialog(index, args)"
  />
</template>
