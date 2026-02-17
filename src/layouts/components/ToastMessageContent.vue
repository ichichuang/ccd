<script setup lang="ts">
/**
 * Toast 消息内容（用于 #message slot）
 * 结构与 PrimeVue 默认一致：p-toast-message-content / p-toast-message-icon / p-toast-message-text
 * 补充 secondary/contrast 的图标（PrimeVue 未定义）
 */
import type { Component } from 'vue'

defineProps<{
  message: { severity?: string; summary?: string; detail?: string }
  iconMap: Record<string, Component | object>
  fallbackIcon: Component | object
}>()
</script>

<template>
  <div class="p-toast-message-content">
    <component
      :is="iconMap[message.severity ?? ''] ?? fallbackIcon"
      class="p-toast-message-icon"
    />
    <div class="p-toast-message-text">
      <span class="p-toast-summary">{{ message.summary }}</span>
      <div
        v-if="message.detail"
        class="p-toast-detail"
      >
        {{ message.detail }}
      </div>
    </div>
  </div>
</template>
