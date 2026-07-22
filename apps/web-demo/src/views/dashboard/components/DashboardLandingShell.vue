<script setup lang="ts">
interface DashboardLandingShellProps {
  eyebrow: string
  title: string
  description: string
  primaryActionLabel: string
  primaryActionTo: string
  secondaryActionLabel: string
  secondaryActionTo: string
}

defineOptions({ name: 'DashboardLandingShell' })

defineProps<DashboardLandingShellProps>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <section
    id="dashboard-page"
    class="col-stretch min-w-0 gap-lg p-xs sm:p-sm md:p-md lg:p-lg"
  >
    <header class="material-elevated col-stretch min-w-0 gap-lg">
      <div class="dashboard-hero-grid">
        <div class="col-stretch min-w-0 gap-md">
          <span class="text-xs font-semibold text-primary">
            {{ eyebrow }}
          </span>
          <div class="col-stretch min-w-0 gap-sm">
            <h1 class="text-3xl font-semibold text-foreground m-0">
              {{ title }}
            </h1>
            <p class="text-base text-muted-foreground m-0">
              {{ description }}
            </p>
          </div>
        </div>

        <nav
          class="dashboard-hero-actions"
          :aria-label="primaryActionLabel"
        >
          <RouterLink
            id="dashboard-start-exploring"
            :to="primaryActionTo"
            class="row-center gap-xs rounded-md p-sm bg-primary text-primary-foreground text-sm no-underline ring-focus-focus"
          >
            <Icons
              name="i-lucide-compass"
              size="sm"
              class="text-current"
            />
            <span>{{ primaryActionLabel }}</span>
          </RouterLink>

          <RouterLink
            :to="secondaryActionTo"
            class="glass-capsule row-center gap-xs text-sm text-foreground no-underline ring-focus-focus"
          >
            <Icons
              name="i-lucide-shield-check"
              size="sm"
            />
            <span>{{ secondaryActionLabel }}</span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <slot />

    <div
      aria-hidden="true"
      class="shrink-0 h-[calc(var(--footer-height)+var(--spacing-xl)+var(--safe-bottom))]"
    />
  </section>
</template>

<style scoped>
.dashboard-hero-grid {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-lg);
}

.dashboard-hero-actions {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

@media (width >= 1024px) {
  .dashboard-hero-grid {
    grid-template-columns: minmax(0, 1fr) max-content;
    align-items: center;
  }

  .dashboard-hero-actions {
    justify-content: flex-end;
  }
}
</style>
