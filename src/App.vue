<script setup lang="ts">
import { usePermissionStore } from '@/stores/modules/permission'
import LayoutManager from '@/layouts/index.vue'

// 组件挂载时添加全局事件监听器
onMounted(() => {
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
  <div class="fixed left-0 top-0 bottom-0 right-0 z-0 container fs-appFontSize">
    <LayoutManager />
  </div>
</template>

<style lang="scss" scoped></style>
