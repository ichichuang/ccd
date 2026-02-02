<script setup lang="ts">
import Toast from 'primevue/toast'
import { usePermissionStore } from '@/stores/modules/permission'
import { useSizeStore } from '@/stores/modules/size'
import LayoutManager from '@/layouts/index.vue'

// 组件挂载时添加全局事件监听器
onMounted(() => {
  // 初始化尺寸系统 CSS 变量
  const sizeStore = useSizeStore()
  sizeStore.init()

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
onUnmounted(() => {})
</script>

<template>
  <div class="full bg-background color-foreground">
    <LayoutManager />
    <Toast />
  </div>
</template>

<style lang="scss" scoped></style>
