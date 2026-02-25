<script setup lang="ts">
defineProps<{
  selectable?: boolean
  selectionMode?: 'single' | 'multiple'
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'export-csv'): void
  (e: 'export-json'): void
  (e: 'export-xlsx'): void
  (e: 'clear-filters'): void
  (e: 'clear-sort'): void
  (e: 'select-all'): void
  (e: 'clear-selection'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-md">
    <div class="grid grid-cols-2 4xl:grid-cols-3 gap-sm">
      <Button
        label="刷新"
        icon="i-lucide-refresh-cw"
        size="small"
        severity="secondary"
        outlined
        @click="$emit('refresh')"
      />
      <Button
        label="导出 CSV"
        icon="i-lucide-download"
        size="small"
        severity="secondary"
        outlined
        @click="$emit('export-csv')"
      />
      <Button
        label="导出 JSON"
        icon="i-lucide-download"
        size="small"
        severity="secondary"
        outlined
        @click="$emit('export-json')"
      />
      <Button
        label="导出 XLSX"
        icon="i-lucide-download"
        size="small"
        severity="secondary"
        outlined
        @click="$emit('export-xlsx')"
      />
      <Button
        label="清空筛选"
        icon="i-lucide-filter-x"
        size="small"
        severity="secondary"
        outlined
        @click="$emit('clear-filters')"
      />
      <Button
        label="清空排序"
        icon="i-lucide-arrow-down-wide-narrow"
        size="small"
        severity="secondary"
        outlined
        @click="$emit('clear-sort')"
      />
      <Button
        v-if="selectable"
        label="全选"
        icon="i-lucide-check-square"
        size="small"
        severity="secondary"
        outlined
        :disabled="selectionMode === 'single'"
        @click="$emit('select-all')"
      />
      <Button
        v-if="selectable"
        label="取消全选"
        icon="i-lucide-minus-square"
        size="small"
        severity="secondary"
        outlined
        @click="$emit('clear-selection')"
      />
    </div>
  </div>
</template>
