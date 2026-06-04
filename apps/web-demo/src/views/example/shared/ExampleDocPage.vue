<script setup lang="ts">
defineOptions({ name: 'ExampleDocPage' })

type ExampleDocBadgeSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    icon: string
    badge: string
    badgeSeverity?: ExampleDocBadgeSeverity
  }>(),
  {
    badgeSeverity: 'info',
  }
)
</script>

<template>
  <article
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  :name="props.icon"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <h1 class="text-lg font-bold text-foreground text-no-wrap m-0">
                    {{ props.title }}
                  </h1>
                  <Tag
                    :value="props.badge"
                    :severity="props.badgeSeverity"
                    rounded
                  />
                </div>
                <p class="text-sm text-muted-foreground text-ellipsis-2 m-0">
                  {{ props.description }}
                </p>
              </div>
            </div>

            <div
              v-if="$slots.actions"
              class="row-end gap-sm min-w-0 flex-wrap"
            >
              <slot name="actions" />
            </div>
          </div>

          <div
            v-if="$slots.summary"
            class="demo-well min-w-0"
          >
            <slot name="summary" />
          </div>
        </header>

        <slot />
      </div>
    </div>
  </article>
</template>
