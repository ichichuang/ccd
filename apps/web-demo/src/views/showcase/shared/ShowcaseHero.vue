<script setup lang="ts">
interface ShowcaseHeroAction {
  id: string
  to: string
  labelKey: `router.${string}` | `showcase.${string}`
  icon?: `i-${string}`
}

interface ShowcaseHeroProps {
  title: string
  description: string
  eyebrow?: string
  icon?: `i-${string}`
  actions?: readonly ShowcaseHeroAction[]
}

defineOptions({ name: 'ShowcaseHero' })

const props = defineProps<ShowcaseHeroProps>()
</script>

<template>
  <header class="material-elevated col-stretch min-w-0 gap-md">
    <div class="col-stretch min-w-0 gap-md lg:row-between">
      <div class="col-stretch min-w-0 gap-sm">
        <span
          v-if="props.eyebrow"
          class="text-xs font-semibold text-primary"
        >
          {{ props.eyebrow }}
        </span>
        <h1 class="text-3xl font-semibold text-foreground m-0">
          {{ props.title }}
        </h1>
        <p class="text-base text-muted-foreground m-0">
          {{ props.description }}
        </p>
      </div>

      <span
        v-if="props.icon"
        class="center rounded-lg p-md bg-primary-light text-primary"
      >
        <Icons
          :name="props.icon"
          size="3xl"
        />
      </span>
    </div>

    <nav
      v-if="props.actions?.length"
      class="row-start min-w-0 gap-sm flex-wrap"
      :aria-label="$t('showcase.shell.heroActions')"
    >
      <RouterLink
        v-for="action in props.actions"
        :key="action.id"
        :to="action.to"
        class="row-center gap-xs rounded-md p-sm bg-primary text-primary-foreground text-sm no-underline ring-focus-focus"
      >
        <Icons
          v-if="action.icon"
          :name="action.icon"
          size="sm"
          class="text-current"
        />
        <span>{{ $t(action.labelKey) }}</span>
      </RouterLink>
    </nav>
  </header>
</template>
