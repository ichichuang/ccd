<script setup lang="ts">
defineOptions({ name: 'CapabilityCard' })

defineProps<{
  title: string
  description: string
  icon: string
  status: string
  bullets: string[]
}>()
</script>

<template>
  <article class="material-elevated col-stretch gap-md">
    <div class="row-between gap-md">
      <span class="glass-icon-box">
        <Icons
          :name="icon"
          size="lg"
        />
      </span>
      <Tag
        :value="status"
        severity="info"
      />
    </div>

    <div class="col-stretch gap-xs">
      <h2 class="text-lg font-semibold text-foreground m-0">
        {{ title }}
      </h2>
      <p class="text-sm text-muted-foreground m-0">
        {{ description }}
      </p>
    </div>

    <ul class="col-stretch gap-xs m-0 p-0 list-none">
      <li
        v-for="bullet in bullets"
        :key="bullet"
        class="row-start gap-xs text-sm text-foreground"
      >
        <Icons
          name="i-lucide-check"
          size="sm"
          class="text-success"
        />
        <span>{{ bullet }}</span>
      </li>
    </ul>
  </article>
</template>
