<script setup lang="ts">
defineOptions({ name: 'DemoSection' })

defineProps<{
  title: string
  description: string
}>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <section class="material-elevated col-stretch gap-md">
    <div class="col-stretch gap-xs">
      <h2 class="text-lg font-semibold text-foreground m-0">
        {{ title }}
      </h2>
      <p class="text-sm text-muted-foreground m-0">
        {{ description }}
      </p>
    </div>

    <slot />
  </section>
</template>
