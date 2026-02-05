<script setup lang="ts">
import { decideRootFontSize, applyRootFontSize } from '@/utils/theme/sizeEngine'
import LayoutManager from '@/layouts/index.vue'
import AppPrimeVueGlobals from '@/layouts/components/AppPrimeVueGlobals.vue'
import { usePermissionStore } from '@/stores/modules/permission'
import { useSizeStore } from '@/stores/modules/size'
import { useDeviceStore } from '@/stores/modules/device'

const sizeStore = useSizeStore()
const deviceStore = useDeviceStore()

let cleanupDeviceListener: (() => void) | undefined

// 根字号自适应：根据设备类型 + 断点 + 尺寸预设动态计算
watchEffect(() => {
  const decision = decideRootFontSize({
    deviceType: deviceStore.type,
    breakpoint: deviceStore.currentBreakpoint,
    preset: sizeStore.currentPreset,
  })
  applyRootFontSize(decision)
})

onMounted(() => {
  sizeStore.init()
  cleanupDeviceListener = deviceStore.init()

  const permissionStore = usePermissionStore()
  const key = new URLSearchParams(location.search).get('_windowKey')
  if (key) {
    const meta = permissionStore.getWindowByKey(key)
    if (meta) meta.isOpen = true
  }
  permissionStore.cleanupOldWindows()
})

onUnmounted(() => {
  if (cleanupDeviceListener) cleanupDeviceListener()
})
</script>

<template>
  <div class="fixed top-0 right-0 left-0 bottom-0 full bg-background text-foreground">
    <LayoutManager />
    <AppPrimeVueGlobals />
  </div>
</template>
