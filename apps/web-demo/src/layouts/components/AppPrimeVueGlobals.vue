<script setup lang="ts">
/**
 * 布局层：全局 UI 与 window.$toast / window.$message 挂载
 * PrimeVue 运行时组件与服务通过 @ccd/vue-primevue-adapter facade 注入。
 */
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import { useLocaleStore } from '@/stores/modules/system'
import { PrimeDialog } from '@ccd/vue-ui'
import {
  PrimeVueGlobalConfirmPopup,
  PrimeVueGlobalDynamicDialog,
  PrimeVueGlobalToast,
  applyPrimeVueLocale,
  clearPrimeVueGlobalMessageApis,
  clearPrimeVueToastGroups,
  mountPrimeVueGlobalMessageApis,
  PRIMEVUE_TOAST_FALLBACK_ICON,
  PRIMEVUE_TOAST_SEVERITY_ICONS,
  usePrimeVueRuntimeConfig,
  usePrimeVueToastService,
} from '@ccd/vue-primevue-adapter'
import { useDialog } from '@/hooks/modules/useDialog'
import ToastMessageContent from '@/layouts/components/ToastMessageContent.vue'

const { dialogStore, closeDialog, removeDialog, closeAll } = useDialog()
const toast = usePrimeVueToastService()
const localeStore = useLocaleStore()
const primevue = usePrimeVueRuntimeConfig()
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
    mountPrimeVueGlobalMessageApis(window, toast)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    clearPrimeVueGlobalMessageApis(window)
  }
  closeAll()
  clearPrimeVueToastGroups(toast)
})
</script>

<template>
  <PrimeVueGlobalToast
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
  </PrimeVueGlobalToast>
  <PrimeVueGlobalToast
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
  </PrimeVueGlobalToast>
  <PrimeVueGlobalToast
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
  </PrimeVueGlobalToast>
  <PrimeVueGlobalToast
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
  </PrimeVueGlobalToast>
  <PrimeVueGlobalToast
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
  </PrimeVueGlobalToast>
  <PrimeVueGlobalToast
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
  </PrimeVueGlobalToast>
  <PrimeVueGlobalConfirmPopup />
  <PrimeVueGlobalDynamicDialog />
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
