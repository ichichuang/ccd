<script setup lang="tsx">
import { useGlobalSettingsDialog } from './useGlobalSettingsDialog'

const { openGlobalSettings } = useGlobalSettingsDialog()
</script>

<template>
  <div
    class="block w-full bg-transparent border-none p-0 text-left outline-none interactive-item"
    @click="openGlobalSettings"
  >
    <slot></slot>
  </div>
</template>
