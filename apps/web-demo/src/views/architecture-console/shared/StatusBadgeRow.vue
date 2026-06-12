<script setup lang="ts">
import type { ConsoleStatusItem } from '../data/consolePages'

defineOptions({ name: 'StatusBadgeRow' })

defineProps<{
  items: ConsoleStatusItem[]
}>()
</script>

<template>
  <div class="row-end gap-sm flex-wrap">
    <Tag
      v-for="item in items"
      :key="item.label"
      :severity="item.severity"
      :value="`${item.label}: ${item.value}`"
    />
  </div>
</template>
