<script setup lang="ts">
import ShowcaseSection from './ShowcaseSection.vue'

defineOptions({ name: 'ShowcaseDemoPanel' })

const props = defineProps<{
  title: string
  description: string
}>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <ShowcaseSection
    :title="props.title"
    :description="props.description"
  >
    <div class="demo-well col-stretch min-w-0 gap-md">
      <slot />
    </div>
  </ShowcaseSection>
</template>
