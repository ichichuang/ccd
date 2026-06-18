<script setup lang="ts">
import type { ShowcaseCatalogItem } from '../data/types'
import ShowcaseHero from './ShowcaseHero.vue'
import ShowcaseRelatedLinks from './ShowcaseRelatedLinks.vue'
import ShowcaseSourceLinks from './ShowcaseSourceLinks.vue'

interface ShowcasePageShellSlotProps {
  item: ShowcaseCatalogItem
}

defineOptions({ name: 'ShowcasePageShell' })

const props = defineProps<{
  item: ShowcaseCatalogItem
  relatedIds?: readonly string[]
}>()

defineSlots<{
  hero?: (scope: ShowcasePageShellSlotProps) => unknown
  demo?: (scope: ShowcasePageShellSlotProps) => unknown
  features?: (scope: ShowcasePageShellSlotProps) => unknown
  explanation?: (scope: ShowcasePageShellSlotProps) => unknown
  technical?: (scope: ShowcasePageShellSlotProps) => unknown
  aside?: (scope: ShowcasePageShellSlotProps) => unknown
}>()

const slots = useSlots()
const shellRelatedIds = computed(() => props.relatedIds ?? props.item.relatedIds)
</script>

<template>
  <section class="col-stretch min-w-0 gap-lg">
    <slot
      name="hero"
      :item="props.item"
    >
      <ShowcaseHero
        :eyebrow="$t(`${props.item.localeBaseKey}.eyebrow`)"
        :title="$t(`${props.item.localeBaseKey}.title`)"
        :description="$t(`${props.item.localeBaseKey}.description`)"
        :icon="props.item.icon"
      />
    </slot>

    <slot
      v-if="slots.demo"
      name="demo"
      :item="props.item"
    />

    <section
      v-if="slots.features || slots.explanation"
      class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2"
    >
      <div
        v-if="slots.features"
        class="col-stretch min-w-0 gap-md"
      >
        <slot
          name="features"
          :item="props.item"
        />
      </div>

      <div
        v-if="slots.explanation"
        class="col-stretch min-w-0 gap-md"
      >
        <slot
          name="explanation"
          :item="props.item"
        />
      </div>
    </section>

    <slot
      name="aside"
      :item="props.item"
    />

    <section class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
      <slot
        name="technical"
        :item="props.item"
      >
        <ShowcaseSourceLinks :item="props.item" />
        <ShowcaseRelatedLinks
          :item="props.item"
          :related-ids="shellRelatedIds"
        />
      </slot>
    </section>
  </section>
</template>
