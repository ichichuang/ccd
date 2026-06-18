<script setup lang="ts">
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
  <section class="material-elevated col-stretch min-w-0 gap-md">
    <div class="col-stretch min-w-0 gap-xs">
      <h2 class="text-lg font-semibold text-foreground m-0">
        {{ props.title }}
      </h2>
      <p class="text-sm text-muted-foreground m-0">
        {{ props.description }}
      </p>
    </div>

    <div class="demo-well col-stretch min-w-0 gap-md">
      <slot />
    </div>
  </section>
</template>
