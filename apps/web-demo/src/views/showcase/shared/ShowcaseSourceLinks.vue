<script setup lang="ts">
import { CScrollbar } from '@ccd/vue-ui'
import type { ShowcaseCatalogItem } from '../data/types'

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
  <section class="material-solid col-stretch min-w-0 gap-md p-md">
    <div class="col-stretch min-w-0 gap-xs">
      <h2 class="text-lg font-semibold text-foreground m-0">
        {{ $t('showcase.shell.source.title') }}
      </h2>
      <p class="text-sm text-muted-foreground m-0">
        {{ $t('showcase.shell.source.description') }}
      </p>
    </div>

    <CScrollbar
      v-if="resolvedSourcePaths.length > 4"
      class="max-h-[32vh]"
    >
      <ul class="col-stretch gap-xs m-0 p-0 list-none">
        <li
          v-for="sourcePath in resolvedSourcePaths"
          :key="sourcePath"
          class="demo-well min-w-0"
        >
          <code class="code-inline break-all">{{ sourcePath }}</code>
        </li>
      </ul>
    </CScrollbar>

    <ul
      v-else-if="resolvedSourcePaths.length"
      class="col-stretch gap-xs m-0 p-0 list-none"
    >
      <li
        v-for="sourcePath in resolvedSourcePaths"
        :key="sourcePath"
        class="demo-well min-w-0"
      >
        <code class="code-inline break-all">{{ sourcePath }}</code>
      </li>
    </ul>

    <p
      v-else
      class="text-sm text-muted-foreground m-0"
    >
      {{ $t('showcase.shell.source.empty') }}
    </p>
  </section>
</template>
