<script setup lang="ts">
interface ShowcaseSectionProps {
  eyebrow?: string
  title?: string
  description?: string
  icon?: `i-${string}`
}

defineOptions({ name: 'ShowcaseSection' })

const props = defineProps<ShowcaseSectionProps>()

defineSlots<{
  actions?: () => unknown
  default?: () => unknown
}>()

const slots = useSlots()
const hasHeading = computed(() => Boolean(props.eyebrow || props.title || props.description))
const hasHeader = computed(() => hasHeading.value || Boolean(props.icon || slots.actions))
</script>

<template>
  <section class="col-stretch min-w-0 gap-md">
    <header
      v-if="hasHeader"
      class="col-stretch min-w-0 gap-sm md:row-between"
    >
      <div
        v-if="hasHeading || props.icon"
        class="row-start min-w-0 gap-sm"
      >
        <span
          v-if="props.icon"
          class="center rounded-md p-sm bg-primary-light text-primary"
        >
          <Icons
            :name="props.icon"
            size="md"
          />
        </span>

        <div
          v-if="hasHeading"
          class="col-stretch min-w-0 gap-xs"
        >
          <span
            v-if="props.eyebrow"
            class="text-xs font-semibold text-primary"
          >
            {{ props.eyebrow }}
          </span>
          <h2
            v-if="props.title"
            class="text-lg font-semibold text-foreground m-0"
          >
            {{ props.title }}
          </h2>
          <p
            v-if="props.description"
            class="text-sm text-muted-foreground m-0"
          >
            {{ props.description }}
          </p>
        </div>
      </div>

      <div
        v-if="slots.actions"
        class="row-start min-w-0 gap-sm flex-wrap"
      >
        <slot name="actions" />
      </div>
    </header>

    <slot />
  </section>
</template>
