<script setup lang="ts">
defineOptions({ name: 'ArchitectureControlCenter' })

defineProps<{
  eyebrow: string
  title: string
  description: string
  actionLabel: string
}>()

const emit = defineEmits<{
  action: []
}>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <section
    id="dashboard-page"
    data-archetype="A1-toolbar-content"
    class="col-stretch min-w-0 gap-md p-xs sm:p-sm md:p-md lg:p-lg"
  >
    <header class="material-elevated col-stretch min-w-0 gap-md">
      <div class="row-between gap-md flex-wrap">
        <div class="col-stretch gap-xs min-w-0 max-w-960px">
          <span class="text-xs font-semibold text-primary text-no-wrap">{{ eyebrow }}</span>
          <h1 class="text-2xl font-bold text-foreground m-0">
            {{ title }}
          </h1>
          <p class="text-sm text-muted-foreground m-0 text-ellipsis-2">
            {{ description }}
          </p>
        </div>

        <Button
          id="dashboard-quick-action"
          :label="actionLabel"
          icon="i-lucide-shield-check"
          @click="emit('action')"
        />
      </div>
    </header>

    <slot />
    <div
      aria-hidden="true"
      class="shrink-0 h-[calc(var(--footer-height)+var(--spacing-2xl)+var(--safe-bottom))]"
    />
  </section>
</template>
