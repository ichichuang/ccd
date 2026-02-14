<!-- @/components/schema-form/components/StepsRenderer.vue -->
<template>
  <SchemaFormItem
    v-for="item in resolvedFields"
    :key="item.fieldName"
    :column="item.column"
    :form="form"
    :disabled="disabled"
    :options-cache-t-t-l="optionsCacheTTL"
    :global-layout="globalLayout"
    :global-style="globalStyle"
    :style="colStyle(item.column.layout)"
    :preview="preview"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  FormApiLike,
  LayoutConfig,
  SchemaColumnsItem,
  StepConfig,
  StyleConfig,
} from '../utils/types'
import SchemaFormItem from './FormItems'

const props = defineProps<{
  currentStep: StepConfig
  columns: SchemaColumnsItem[]
  form: FormApiLike
  disabled: boolean
  optionsCacheTTL: number
  globalLayout: LayoutConfig
  globalStyle?: StyleConfig
  columnByField: (field: string) => SchemaColumnsItem | undefined
  colStyle: (layout?: LayoutConfig) => Record<string, string>
  preview?: boolean
}>()

const resolvedFields = computed(() =>
  props.currentStep.fields
    .map(fieldName => ({ fieldName, column: props.columnByField(fieldName) }))
    .filter((item): item is { fieldName: string; column: SchemaColumnsItem } => !!item.column)
)
</script>
