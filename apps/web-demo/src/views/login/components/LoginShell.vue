<script setup lang="ts">
import type { LoginResponsiveState } from '../types'

defineOptions({ name: 'LoginShell' })

const props = defineProps<{
  responsive: LoginResponsiveState
}>()

const shellClass = computed(() => {
  const mode = props.responsive.mode

  if (mode === 'desktopLandscape') {
    return 'h-auto max-h-[calc(100dvh-var(--spacing-4xl))] w-[min(92vw,1180px)] grid-cols-[minmax(0,1fr)_minmax(390px,440px)] gap-lg p-lg'
  }

  if (mode === 'desktopPortrait') {
    return 'h-auto max-h-[calc(100dvh-var(--spacing-3xl))] w-[min(94vw,900px)] grid-cols-[minmax(0,0.72fr)_minmax(360px,410px)] gap-md p-md'
  }

  if (mode === 'tabletLandscape') {
    return 'h-auto max-h-[calc(100dvh-var(--spacing-3xl))] w-[min(94vw,960px)] grid-cols-[minmax(0,0.7fr)_minmax(340px,390px)] gap-md p-md'
  }

  if (mode === 'tabletPortrait') {
    return 'h-auto max-h-[calc(100dvh-var(--spacing-3xl))] w-[min(92vw,560px)] grid-cols-1 gap-sm p-md'
  }

  return 'h-auto max-h-[calc(100dvh-var(--spacing-3xl))] w-full max-w-[430px] grid-cols-1 gap-xs p-sm'
})
</script>

<template>
  <section
    class="grid min-w-0 items-center overflow-hidden rounded-2xl border border-solid border-border/70 bg-card/75 shadow-md"
    :class="shellClass"
    aria-labelledby="login-brand-title"
  >
    <slot />
  </section>
</template>
