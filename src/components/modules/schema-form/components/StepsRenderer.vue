<!-- @/components/schema-form/components/StepsRenderer.vue -->
<template>
  <template
    v-for="fieldName in currentStep.fields"
    :key="fieldName"
  >
    <SchemaFormItem
      v-if="columnByField(fieldName)"
      :column="columnByField(fieldName)!"
      :form="form"
      :disabled="disabled"
      :options-cache-t-t-l="optionsCacheTTL"
      :global-layout="globalLayout"
      :global-style="globalStyle"
      :style="colStyle(columnByField(fieldName)?.layout)"
      :preview="preview"
    />
  </template>
</template>

<script setup lang="ts">
import type { LayoutConfig, SchemaColumnsItem, StepConfig, StyleConfig } from '../utils/types'
import SchemaFormItem from './FormItems'

defineProps<{
  currentStep: StepConfig
  columns: SchemaColumnsItem[]
  form: any
  disabled: boolean
  optionsCacheTTL: number
  globalLayout: LayoutConfig
  globalStyle?: StyleConfig
  columnByField: (field: string) => SchemaColumnsItem | undefined
  colStyle: (layout?: LayoutConfig) => Record<string, string>
  preview?: boolean
}>()
</script>
