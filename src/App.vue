<script setup lang="ts">
import { PrimeVueDialog, closeDialog, dialogStore } from '@/components/modules/prime-dialog'
import { onMounted, onUnmounted } from 'vue'

import LayoutManager from '@/layouts/index.vue'
// 处理对话框关闭事件（包括 ESC 键和点击遮罩关闭）
const handleDialogClose = (options: any, index: number, args?: any) => {
  // 调用 closeDialog 函数来清理索引
  closeDialog(options, index, args)
}

// 全局 ESC 键处理
const handleGlobalEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && dialogStore.value.length > 0) {
    // 只关闭最上层的对话框（最后一个）
    const lastIndex = dialogStore.value.length - 1
    const lastDialog = dialogStore.value[lastIndex]

    // 检查最上层对话框是否允许通过 ESC 键关闭
    if (lastDialog.closeOnEscape === false) {
      // 如果设置为 false，则不处理 ESC 键，让对话框自己处理
      return
    }

    // 阻止默认行为
    event.preventDefault()
    event.stopPropagation()

    // 关闭最上层的对话框
    closeDialog(lastDialog, lastIndex, { command: 'close' })
  }
}

// 组件挂载时添加全局事件监听器
onMounted(() => {
  document.addEventListener('keydown', handleGlobalEscKey, true)
})

// 组件卸载时移除全局事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalEscKey, true)
})
</script>

<template lang="pug">
.fixed.left-0.top-0.bottom-0.right-0.z-0.container.fs-appFontSize
  LayoutManager
  PrimeVueDialog(:dialog-store='dialogStore', @close='handleDialogClose')
  ConfirmDialog
  DynamicDialog
  PrimeVueToast
</template>

<style lang="scss" scope></style>
