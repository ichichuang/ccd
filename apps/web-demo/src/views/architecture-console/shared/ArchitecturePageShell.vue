<script setup lang="ts">
defineOptions({ name: 'ArchitecturePageShell' })

defineProps<{
  eyebrow: string
  title: string
  description: string
}>()

defineSlots<{
  status?: () => unknown
  default?: () => unknown
}>()
</script>

<template>
  <section
    data-testid="architecture-console-page"
    data-archetype="A2-sidebar-inspector"
    class="col-stretch gap-lg"
  >
    <header class="material-elevated col-stretch gap-md">
      <div class="row-between gap-md flex-wrap">
        <div class="col-stretch gap-xs min-w-0">
          <span class="text-xs font-semibold text-primary text-no-wrap">{{ eyebrow }}</span>
          <h1 class="text-2xl font-bold text-foreground m-0">
            {{ title }}
          </h1>
          <p class="text-sm text-muted-foreground m-0 text-ellipsis-2">
            {{ description }}
          </p>
        </div>

        <slot name="status" />
      </div>
    </header>

    <slot />
  </section>
</template>
