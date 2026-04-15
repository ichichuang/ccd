<script setup lang="ts">
import {
  decideRootFontSize,
  decideLayoutDimensions,
  applyRuntimeSizeUpdate,
} from '@/utils/theme/sizeEngine'
import LayoutManager from '@/layouts/index.vue'
import AppPrimeVueGlobals from '@/layouts/components/AppPrimeVueGlobals.vue'
import { usePermissionStore } from '@/stores/modules/session'

const sizeStore = useSizeStore()
const deviceStore = useDeviceStore()
const themeStore = useThemeStore()

let cleanupDeviceListener: (() => void) | undefined

// 提前检测设备，确保 watchEffect 首帧使用正确断点，避免字体闪动
// 提前检测设备，确保 watchEffect 首帧使用正确断点，避免字体闪动
if (typeof window !== 'undefined') {
  deviceStore.initHardwareInfo()
  deviceStore.detectViewportInfo()
}

// 根字号与布局尺寸双轨自适应：根据设备类型 + 断点 + 尺寸预设动态计算
// 使用 applyRuntimeSizeUpdate 合并字体 + 布局变量为单次 cssText 写入，
// 避免 ~16 次独立 setProperty 导致的多次 style recalc
watchEffect(() => {
  const ctx = {
    deviceType: deviceStore.type,
    breakpoint: deviceStore.currentBreakpoint,
    preset: sizeStore.currentPreset,
    pixelRatio: deviceStore.pixelRatio,
  }
  const decision = decideRootFontSize(ctx)
  const layoutDimensions = decideLayoutDimensions(ctx)
  applyRuntimeSizeUpdate(decision, layoutDimensions)
})

// Resize 期间在 <html> 上挂 class，供 CSS 压制过渡
watch(
  () => deviceStore.isResizing,
  resizing => {
    document.documentElement.classList.toggle('app-resizing', resizing)
  }
)

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
  document.documentElement.classList.remove('app-resizing')
  themeStore.dispose()
})
</script>

<template>
  <div class="layout-screen text-foreground font-sans antialiased">
    <LayoutManager />
    <AppPrimeVueGlobals />
  </div>
</template>
