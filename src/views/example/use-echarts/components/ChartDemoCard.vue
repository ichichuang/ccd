<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  chartHeight?: string
}>()
</script>

<template>
  <div class="material-elevated col-stretch gap-md p-lg">
    <h2 class="text-xl font-semibold text-foreground m-0">
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="text-muted-foreground text-sm m-0"
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
      class="row-start flex-wrap gap-sm"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
