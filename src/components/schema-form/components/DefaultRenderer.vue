<!-- @/components/schema-form/components/DefaultRenderer.vue -->
<template>
  <template
    v-for="column in columns"
    :key="column.field"
  >
    <SchemaFormItem
      :column="column"
      :form="form"
      :disabled="disabled"
      :options-cache-t-t-l="optionsCacheTTL"
      :global-layout="globalLayout"
      :global-style="globalStyle"
      :style="colStyle(column.layout)"
      :preview="preview"
    />
  </template>
</template>

<script setup lang="ts">
import type { FormApiLike, LayoutConfig, SchemaColumnsItem, StyleConfig } from '../utils/types'
import SchemaFormItem from './FormItems'

defineProps<{
  columns: SchemaColumnsItem[]
  form: FormApiLike
  disabled: boolean
  optionsCacheTTL: number
  globalLayout: LayoutConfig
  globalStyle?: StyleConfig
  colStyle: (layout?: LayoutConfig) => Record<string, string>
  preview?: boolean
}>()
</script>
