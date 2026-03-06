<!-- @/components/SchemaForm/components/SectionsRenderer.vue -->
<template>
  <template
    v-for="(section, index) in resolvedSections"
    :key="index"
  >
    <div class="col-span-12">
      <div class="font-medium">
        {{ section.title }}
      </div>
    </div>
    <template
      v-for="item in section.fieldColumns"
      :key="item.fieldName"
    >
      <SchemaFormItem
        v-if="!item.column.vIf || item.column.vIf(form.modelValue ?? form.values ?? {})"
        :column="item.column"
        :form="form"
        :disabled="disabled"
        :options-cache-t-t-l="optionsCacheTTL"
        :options-map="optionsMap"
        :loading-map="loadingMap"
        :error-map="errorMap"
        :retry-field="retryField"
        :global-layout="globalLayout"
        :global-style="globalStyle"
        :style="colStyle(item.column.layout)"
        :preview="preview"
      />
    </template>
  </template>
</template>

<script setup lang="ts">
import type {
  FormApiLike,
  LayoutConfig,
  SchemaColumnsItem,
  SectionConfig,
  StyleConfig,
} from '../utils/types'
import SchemaFormItem from './FormItems'

const props = defineProps<{
  sections: SectionConfig[]
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
  columnByField: (field: string) => SchemaColumnsItem | undefined
  colStyle: (layout?: LayoutConfig) => Record<string, string>
  preview?: boolean
}>()

const resolvedSections = computed(() =>
  props.sections.map(section => ({
    ...section,
    fieldColumns: section.fields
      .map(fieldName => ({ fieldName, column: props.columnByField(fieldName) }))
      .filter((item): item is { fieldName: string; column: SchemaColumnsItem } => !!item.column),
  }))
)
</script>
