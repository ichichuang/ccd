<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  chartHeight?: string
}>()
</script>

<template>
  <div
    class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md"
  >
    <h2 class="fs-xl font-semibold text-foreground m-0">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="text-muted-foreground fs-sm m-0"
    >
      {{ description }}
    </p>
    <div
      class="w-full min-h-[var(--spacing-4xl)]"
      :style="chartHeight ? { height: chartHeight } : undefined"
    >
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="flex flex-wrap gap-sm"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
