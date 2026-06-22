<script setup lang="ts">
import ShowcaseCard from './ShowcaseCard.vue'

interface ShowcaseFeatureCardProps {
  icon: `i-${string}`
  title: string
  description: string
  tag?: string
}

defineOptions({ name: 'ShowcaseFeatureCard' })

const props = defineProps<ShowcaseFeatureCardProps>()
</script>

<template>
  <ShowcaseCard
    :icon="props.icon"
    :title="props.title"
    :description="props.description"
    :tag="props.tag"
  />
</template>
