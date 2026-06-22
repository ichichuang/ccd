<script setup lang="ts">
interface ShowcaseToolbarProps {
  title?: string
  description?: string
  summary?: string
}

defineOptions({ name: 'ShowcaseToolbar' })

const props = defineProps<ShowcaseToolbarProps>()

defineSlots<{
  actions?: () => unknown
  default?: () => unknown
}>()

const slots = useSlots()
const hasCopy = computed(() => Boolean(props.title || props.description))
const hasHeader = computed(() => hasCopy.value || Boolean(slots.actions))
</script>

<template>
  <section
    class="demo-well col-stretch min-w-0 gap-sm"
    role="group"
  >
    <div
      v-if="hasHeader"
      class="col-stretch min-w-0 gap-sm lg:row-between"
    >
      <div
        v-if="hasCopy"
        class="col-stretch min-w-0 gap-xs"
      >
        <h3
          v-if="props.title"
          class="text-sm font-semibold text-foreground m-0"
        >
          {{ props.title }}
        </h3>
        <p
          v-if="props.description"
          class="text-sm text-muted-foreground m-0"
        >
          {{ props.description }}
        </p>
      </div>

      <div
        v-if="slots.actions"
        class="row-start min-w-0 gap-sm flex-wrap"
      >
        <slot name="actions" />
      </div>
    </div>

    <p
      v-if="props.summary"
      class="text-sm text-muted-foreground m-0"
    >
      {{ props.summary }}
    </p>

    <slot />
  </section>
</template>
