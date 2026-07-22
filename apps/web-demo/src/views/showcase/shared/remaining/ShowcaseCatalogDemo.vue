<script setup lang="ts">
import { showcaseCatalog, showcaseCatalogGroups } from '../../data/showcaseCatalog'
import type { ShowcaseCatalogGroup, ShowcaseCatalogItem } from '../../data/types'
import ShowcaseCatalogGrid from '../ShowcaseCatalogGrid.vue'

defineOptions({ name: 'ShowcaseCatalogDemo' })

const props = defineProps<{
  item: ShowcaseCatalogItem
  kind: string
}>()

const catalogItems = computed<ShowcaseCatalogItem[]>(() => {
  if (props.kind === 'catalog-overview') {
    return showcaseCatalog.filter(
      candidate => candidate.dashboardLink || candidate.kind === 'overview'
    )
  }

  return showcaseCatalog.filter(
    candidate => candidate.groupId === props.item.groupId && candidate.id !== props.item.id
  )
})

const catalogGroups = computed<ShowcaseCatalogGroup[]>(() => {
  const groupIds = new Set(catalogItems.value.map(candidate => candidate.groupId))
  return showcaseCatalogGroups.filter(group => groupIds.has(group.id))
})
</script>

<template>
  <ShowcaseCatalogGrid
    :items="catalogItems"
    :groups="catalogGroups"
    :active-id="props.item.id"
  />
</template>
