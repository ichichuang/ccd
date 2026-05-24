<script setup lang="ts">
import type { LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginShell' })

defineProps<{
  responsive: LoginResponsiveState
}>()
</script>

<template>
  <section
    id="login-shell"
    class="relative w-[min(92vw,420px)] max-h-[88vh] overflow-hidden rounded-2xl border border-solid border-border/60 bg-card/96 p-lg shadow-lg backdrop-blur-md"
    :class="responsive.isMobile ? 'p-md' : ''"
    aria-labelledby="login-brand-title"
  >
    <div
      class="absolute inset-x-[18%] top-[-14%] z-base h-[20%] rounded-full bg-primary/12 blur-2xl"
    />
    <div
      class="absolute inset-0 z-base pointer-events-none bg-[linear-gradient(180deg,rgb(var(--foreground)/0.05),transparent_30%,rgb(var(--primary)/0.025))]"
    />
    <div class="relative z-content col-stretch gap-md">
      <slot />
    </div>
  </section>
</template>
