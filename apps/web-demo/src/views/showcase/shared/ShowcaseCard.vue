<script setup lang="ts">
type ShowcaseCardTagSeverity = 'success' | 'info' | 'secondary' | 'warn' | 'danger' | 'contrast'

interface ShowcaseCardProps {
  icon?: `i-${string}`
  title?: string
  description?: string
  tag?: string
  tagSeverity?: ShowcaseCardTagSeverity
}

defineOptions({ name: 'ShowcaseCard' })

const props = withDefaults(defineProps<ShowcaseCardProps>(), {
  icon: undefined,
  title: undefined,
  description: undefined,
  tag: undefined,
  tagSeverity: 'info',
})

defineSlots<{
  header?: () => unknown
  default?: () => unknown
  footer?: () => unknown
}>()

const slots = useSlots()
const hasHeader = computed(() => Boolean(props.icon || props.tag || slots.header))
const hasBodyCopy = computed(() => Boolean(props.title || props.description))
</script>

<template>
  <article class="material-solid col-stretch min-w-0 gap-md p-md">
    <header
      v-if="hasHeader"
      class="row-between min-w-0 gap-md"
    >
      <slot name="header">
        <span
          v-if="props.icon"
          class="center rounded-md p-sm bg-primary-light text-primary"
        >
          <Icons
            :name="props.icon"
            size="lg"
          />
        </span>
        <Tag
          v-if="props.tag"
          :value="props.tag"
          :severity="props.tagSeverity"
        />
      </slot>
    </header>

    <div
      v-if="hasBodyCopy"
      class="col-stretch min-w-0 gap-xs"
    >
      <h3
        v-if="props.title"
        class="text-base font-semibold text-foreground m-0"
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

    <slot />

    <footer
      v-if="slots.footer"
      class="row-between min-w-0 gap-sm"
    >
      <slot name="footer" />
    </footer>
  </article>
</template>
