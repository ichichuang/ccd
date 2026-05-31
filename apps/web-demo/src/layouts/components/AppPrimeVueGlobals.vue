<script setup lang="ts">
/**
 * 布局层：PrimeVue 全局 UI 与 window.$toast / window.$message 挂载
 * 职责：Toast、ConfirmPopup、DynamicDialog、PrimeDialog；
 *       useToast 封装并挂到 window；PrimeVue locale 同步；useDialog + PrimeDialog
 */
import Toast from 'primevue/toast'
import ConfirmPopup from 'primevue/confirmpopup'
import DynamicDialog from 'primevue/dynamicdialog'
import { useToast } from 'primevue/usetoast'
import { usePrimeVue } from 'primevue/config'
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import { useLocaleStore } from '@/stores/modules/system'
import { PrimeDialog } from '@ccd/vue-ui'
import {
  applyPrimeVueLocale,
  createPrimeVueMessageApi,
  createPrimeVueToastApi,
  PRIMEVUE_TOAST_FALLBACK_ICON,
  PRIMEVUE_TOAST_SEVERITY_ICONS,
} from '@ccd/vue-primevue-adapter'
import { useDialog } from '@/hooks/modules/useDialog'
import ToastMessageContent from '@/layouts/components/ToastMessageContent.vue'

const { dialogStore, closeDialog, removeDialog, closeAll } = useDialog()
const toast = useToast()
const localeStore = useLocaleStore()
const primevue = usePrimeVue()
const route = useRoute()

watch(
  () => localeStore.locale,
  locale => {
    applyPrimeVueLocale(primevue, locale, PRIMEVUE_LOCALE_MAP, 'zh-CN')
  },
  { immediate: true }
)

// Route transitions must not carry global dialog state across pages.
watch(
  () => route.fullPath,
  (to, from) => {
    if (!from || to === from || dialogStore.value.length === 0) return
    closeAll()
  }
)

/** Toast 各 severity 对应图标（PrimeVue 未为 secondary/contrast 定义，此处补充） */
const TOAST_ICON_MAP = PRIMEVUE_TOAST_SEVERITY_ICONS
const TOAST_FALLBACK_ICON = PRIMEVUE_TOAST_FALLBACK_ICON

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.$toast = createPrimeVueToastApi(toast) as typeof window.$toast
    window.$message = createPrimeVueMessageApi(toast)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.$toast = undefined
    window.$message = undefined
  }
  closeAll()
  ;(toast as { removeAllGroups?: () => void }).removeAllGroups?.()
})
</script>

<template>
  <Toast
    position="top-left"
    group="tl"
  >
    <template #message="{ message }">
      <ToastMessageContent
        :message="message"
        :icon-map="TOAST_ICON_MAP"
        :fallback-icon="TOAST_FALLBACK_ICON"
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
        :fallback-icon="TOAST_FALLBACK_ICON"
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
        :fallback-icon="TOAST_FALLBACK_ICON"
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
        :fallback-icon="TOAST_FALLBACK_ICON"
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
        :fallback-icon="TOAST_FALLBACK_ICON"
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
        :fallback-icon="TOAST_FALLBACK_ICON"
      />
    </template>
  </Toast>
  <ConfirmPopup />
  <DynamicDialog />
  <PrimeDialog
    :dialog-store="dialogStore"
    @close="(_options, index, args) => closeDialog(index, args)"
    @after-hide="instanceId => removeDialog(instanceId)"
  />
</template>
<style lang="scss">
/*
 * EXCEPTION: Toast close-button positioning — cannot migrate to PT (PassThrough)
 * because :not() exclusions are structural global selectors.
 */

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
