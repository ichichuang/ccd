<script setup lang="ts">
interface ShowcaseFeatureCardProps {
  icon: `i-${string}`
  title: string
  description: string
  tag?: string
}

defineOptions({ name: 'ShowcaseFeatureCard' })

const props = defineProps<ShowcaseFeatureCardProps>()
</script>

<template>
  <article class="material-solid col-stretch min-w-0 gap-md p-md">
    <div class="row-between min-w-0 gap-md">
      <span class="glass-icon-box text-primary">
        <Icons
          :name="props.icon"
          size="lg"
        />
      </span>
      <Tag
        v-if="props.tag"
        :value="props.tag"
        severity="info"
      />
    </div>

    <div class="col-stretch min-w-0 gap-xs">
      <h2 class="text-lg font-semibold text-foreground m-0">
        {{ props.title }}
      </h2>
      <p class="text-sm text-muted-foreground m-0">
        {{ props.description }}
      </p>
    </div>
  </article>
</template>
