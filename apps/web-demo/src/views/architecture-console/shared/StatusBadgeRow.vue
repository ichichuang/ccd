<script setup lang="ts">
import type { ConsoleStatusItem } from '../data/consolePages'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'StatusBadgeRow' })

defineProps<{
  items: ConsoleStatusItem[]
}>()

const { t } = useI18n()

function getStatusLabel(item: ConsoleStatusItem): string {
  return t(`console.status.${item.key}.label`)
}

function getStatusValue(item: ConsoleStatusItem): string {
  return item.value ?? t(`console.status.${item.key}.value`)
}
</script>

<template>
  <div class="row-end gap-sm flex-wrap">
    <Tag
      v-for="item in items"
      :key="item.key"
      :severity="item.severity"
      :value="`${getStatusLabel(item)}: ${getStatusValue(item)}`"
    />
  </div>
</template>
