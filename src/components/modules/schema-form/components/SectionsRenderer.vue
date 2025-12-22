<!-- @/components/schema-form/components/SectionsRenderer.vue -->
<template>
  <template
    v-for="(section, index) in sections"
    :key="index"
  >
    <div class="col-span-12">
      <div class="font-medium">{{ section.title }}</div>
    </div>
    <template
      v-for="fieldName in section.fields"
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
</template>

<script setup lang="ts">
import type { LayoutConfig, SchemaColumnsItem, SectionConfig, StyleConfig } from '../utils/types'
import SchemaFormItem from './FormItems'

defineProps<{
  sections: SectionConfig[]
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
