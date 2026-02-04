<script setup lang="ts">
import Toast from 'primevue/toast'
import ConfirmPopup from 'primevue/confirmpopup'
import ConfirmDialog from 'primevue/confirmdialog'
import DynamicDialog from 'primevue/dynamicdialog'
import { usePrimeVue } from 'primevue/config'
import { PRIMEVUE_LOCALE_MAP } from '@/locales/primevue-locales'
import { usePermissionStore } from '@/stores/modules/permission'
import { useSizeStore } from '@/stores/modules/size'
import { useLocaleStore } from '@/stores/modules/locale'
import { useDeviceStore } from '@/stores/modules/device'
import { decideRootFontSize, applyRootFontSize } from '@/utils/theme/sizeEngine'
import LayoutManager from '@/layouts/index.vue'

const localeStore = useLocaleStore()
const primevue = usePrimeVue()
const sizeStore = useSizeStore()
const deviceStore = useDeviceStore()

let cleanupDeviceListener: (() => void) | undefined

watch(
  () => localeStore.locale,
  locale => {
    primevue.config.locale = PRIMEVUE_LOCALE_MAP[locale] ?? PRIMEVUE_LOCALE_MAP['zh-CN']
  },
  { immediate: true }
)

// 根字号自适应：根据设备类型 + 断点 + 尺寸预设动态计算
watchEffect(() => {
  const decision = decideRootFontSize({
    deviceType: deviceStore.type,
    breakpoint: deviceStore.currentBreakpoint,
    preset: sizeStore.currentPreset,
  })
  applyRootFontSize(decision)
})

// 组件挂载时添加全局事件监听器
onMounted(() => {
  // 初始化尺寸系统 CSS 变量
  sizeStore.init()

  // 初始化设备检测与断点系统
  cleanupDeviceListener = deviceStore.init()

  // 窗口管理初始化：当前窗口向系统声明"我活着"
  const permissionStore = usePermissionStore() as any
  const key = new URLSearchParams(location.search).get('_windowKey')

  if (key) {
    const meta = permissionStore.getWindowByKey(key)
    if (meta) {
      meta.isOpen = true
    }
  }

  permissionStore.cleanupOldWindows()
})

// 组件卸载时移除全局事件监听器
onUnmounted(() => {
  if (cleanupDeviceListener) {
    cleanupDeviceListener()
  }
})
</script>

<template>
  <div class="full bg-background text-foreground">
    <LayoutManager />
    <Toast />
    <ConfirmPopup />
    <ConfirmDialog />
    <DynamicDialog />
  </div>
</template>
