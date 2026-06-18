<script setup lang="ts">
import { showcaseCatalog } from '../data/showcaseCatalog'
import type { ShowcaseCatalogItem } from '../data/types'

defineOptions({ name: 'ShowcaseRelatedLinks' })

const props = withDefaults(
  defineProps<{
    item: ShowcaseCatalogItem
    relatedIds?: readonly string[]
    limit?: number
  }>(),
  {
    relatedIds: undefined,
    limit: 4,
  }
)

const relatedItems = computed(() => {
  const explicitIds = props.relatedIds ?? props.item.relatedIds ?? []

  if (explicitIds.length) {
    const explicitItems = explicitIds
      .map(id => showcaseCatalog.find(candidate => candidate.id === id))
      .filter((candidate): candidate is ShowcaseCatalogItem => Boolean(candidate))

    return explicitItems.slice(0, props.limit)
  }

  return showcaseCatalog
    .filter(candidate => candidate.id !== props.item.id && candidate.groupId === props.item.groupId)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, props.limit)
})
</script>

<template>
  <section
    v-if="relatedItems.length"
    class="material-solid col-stretch min-w-0 gap-md p-md"
  >
    <div class="col-stretch min-w-0 gap-xs">
      <h2 class="text-lg font-semibold text-foreground m-0">
        {{ $t('showcase.shell.related.title') }}
      </h2>
      <p class="text-sm text-muted-foreground m-0">
        {{ $t('showcase.shell.related.description') }}
      </p>
    </div>

    <ul class="col-stretch gap-xs m-0 p-0 list-none">
      <li
        v-for="relatedItem in relatedItems"
        :key="relatedItem.id"
      >
        <RouterLink
          :to="relatedItem.path"
          class="interactive-item row-between min-w-0 gap-sm no-underline"
        >
          <span class="row-start min-w-0 gap-sm">
            <Icons
              :name="relatedItem.icon"
              size="sm"
              class="text-primary"
            />
            <span class="min-w-0 text-sm font-medium text-foreground">
              {{ $t(relatedItem.titleKey) }}
            </span>
          </span>
          <Icons
            name="i-lucide-arrow-right"
            size="sm"
            class="text-muted-foreground"
          />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
