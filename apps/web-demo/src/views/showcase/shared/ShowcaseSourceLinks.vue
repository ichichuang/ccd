<script setup lang="ts">
import type { ShowcaseCatalogItem } from '../data/types'
import ShowcaseEvidencePanel from './ShowcaseEvidencePanel.vue'

defineOptions({ name: 'ShowcaseSourceLinks' })

const props = defineProps<{
  item?: ShowcaseCatalogItem
  sourcePaths?: readonly string[]
}>()

const resolvedSourcePaths = computed(() => {
  if (props.sourcePaths?.length) return [...props.sourcePaths]
  return props.item?.sourcePaths ?? []
})
</script>

<template>
  <ShowcaseEvidencePanel
    :title="$t('showcase.shell.source.title')"
    :description="$t('showcase.shell.source.description')"
    :empty-text="$t('showcase.shell.source.empty')"
    :source-paths="resolvedSourcePaths"
  />
</template>
