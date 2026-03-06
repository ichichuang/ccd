<!-- @/components/SchemaForm/components/DefaultRenderer.vue -->
<template>
  <template
    v-for="column in columns"
    :key="column.field"
  >
    <SchemaFormItem
      v-if="!column.vIf || column.vIf(form.modelValue ?? form.values ?? {})"
      :column="column"
      :form="form"
      :disabled="disabled"
      :options-cache-t-t-l="optionsCacheTTL"
      :options-map="optionsMap"
      :loading-map="loadingMap"
      :error-map="errorMap"
      :retry-field="retryField"
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
  optionsMap?: Record<string, import('../utils/types').OptionItem[]>
  loadingMap?: Record<string, boolean>
  errorMap?: Record<string, Error | null>
  retryField?: (field: SchemaColumnsItem) => Promise<void>
  globalLayout: LayoutConfig
  globalStyle?: StyleConfig
  colStyle: (layout?: LayoutConfig) => Record<string, string>
  preview?: boolean
}>()
</script>
