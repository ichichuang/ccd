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
    data-archetype="A3-stats-grid"
    class="architecture-console-shell col-stretch min-w-0 gap-lg p-xs sm:p-sm md:p-md lg:p-lg"
  >
    <div
      role="group"
      class="architecture-console-hero material-elevated min-w-0"
    >
      <div class="architecture-console-hero__copy col-stretch gap-sm min-w-0">
        <span class="glass-capsule text-xs font-semibold text-primary text-no-wrap">
          {{ eyebrow }}
        </span>
        <div class="col-stretch gap-xs min-w-0">
          <h1 class="text-2xl font-bold text-foreground m-0">
            {{ title }}
          </h1>
          <p class="text-sm text-muted-foreground m-0 text-ellipsis-2">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="architecture-console-hero__status">
        <slot name="status" />
      </div>
    </div>

    <slot />
    <div
      aria-hidden="true"
      class="shrink-0 h-[calc(var(--footer-height)+var(--spacing-2xl)+var(--safe-bottom))]"
    />
  </section>
</template>

<style scoped>
.architecture-console-shell {
  background-image:
    linear-gradient(rgb(var(--border) / 10%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--border) / 10%) 1px, transparent 1px);
  background-size: var(--spacing-2xl) var(--spacing-2xl);
}

.architecture-console-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--spacing-lg);
  align-items: start;
  min-height: max-content;
  overflow: hidden;
}

.architecture-console-hero::after {
  position: absolute;
  right: var(--spacing-md);
  bottom: 0;
  left: var(--spacing-md);
  height: 1px;
  pointer-events: none;
  content: '';
  background: linear-gradient(90deg, transparent, rgb(var(--primary) / 38%), transparent);
}

.architecture-console-hero__copy {
  max-width: min(78ch, 100%);
}

.architecture-console-hero__status {
  min-width: 0;
  justify-self: end;
}

@media (width < 768px) {
  .architecture-console-hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .architecture-console-hero__status {
    justify-self: start;
  }
}
</style>
