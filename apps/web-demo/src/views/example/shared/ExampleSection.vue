<script setup lang="ts">
defineOptions({ name: 'ExampleSection' })

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    gap?: 'md' | 'lg'
  }>(),
  {
    title: '',
    description: '',
    gap: 'md',
  }
)
</script>

<template>
  <section
    class="material-elevated col-stretch min-w-0"
    :class="props.gap === 'lg' ? 'gap-lg' : 'gap-md'"
  >
    <div
      v-if="props.title || props.description || $slots.actions"
      class="row-between gap-md min-w-0 flex-wrap"
    >
      <div class="col-stretch gap-xs min-w-0">
        <h2
          v-if="props.title"
          class="text-md font-semibold text-foreground m-0"
        >
          {{ props.title }}
        </h2>
        <p
          v-if="props.description"
          class="text-xs text-muted-foreground m-0"
        >
          {{ props.description }}
        </p>
      </div>

      <div
        v-if="$slots.actions"
        class="row-end gap-sm min-w-0 flex-wrap"
      >
        <slot name="actions" />
      </div>
    </div>

    <slot />
  </section>
</template>
