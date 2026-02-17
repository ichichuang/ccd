<template>
  <div class="flex items-center gap-sm mt-margin-md">
    <Button
      label="提交"
      icon="pi pi-check"
      @click="$emit('submit')"
    />
    <Button
      label="重置"
      icon="pi pi-refresh"
      severity="secondary"
      outlined
      @click="$emit('reset')"
    />
    <Button
      label="清空"
      icon="pi pi-trash"
      severity="danger"
      outlined
      @click="$emit('clear')"
    />
  </div>
</template>

<script setup lang="ts">
import { Button } from 'primevue'
defineEmits<{
  (e: 'submit'): void
  (e: 'reset'): void
  (e: 'clear'): void
}>()
</script>
