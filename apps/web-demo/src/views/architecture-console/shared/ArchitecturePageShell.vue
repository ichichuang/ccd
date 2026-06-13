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
    class="col-stretch min-w-0 gap-md p-xs sm:p-sm md:p-md lg:p-lg"
  >
    <header class="material-elevated col-stretch min-w-0 gap-md">
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
    <div
      aria-hidden="true"
      class="shrink-0 h-[calc(var(--footer-height)+var(--spacing-2xl)+var(--safe-bottom))]"
    />
  </section>
</template>
