<script setup lang="ts">
/**
 * 全局环境光：Z0 底色 + 主光 + 状态辅光 + 网格。
 * 目标：保持 primary 主导，同时引入多状态色氛围层，提升深色模式色彩冲击力。
 * 优化：冷暖分区，边缘溢光，极致雾化，中心留白。
 */

defineOptions({ name: 'AmbientBackground' })

interface AmbientBackgroundProps {
  variant?: LayoutMode
}

const props = withDefaults(defineProps<AmbientBackgroundProps>(), {
  variant: 'admin',
})

const layoutStore = useLayoutStore()

const showAmbientOrbs = computed<boolean>(() => !layoutStore.isLoading)

const adminClipClass = 'rounded-lg lg:rounded-l-xl'

const layer12OuterClass = computed(() => {
  const base: string[] = [
    'absolute inset-0 pointer-events-none overflow-hidden transition-all duration-md',
  ]
  if (props.variant === 'admin') {
    base.push(adminClipClass)
  }
  base.push(showAmbientOrbs.value ? 'opacity-100' : 'opacity-0')
  return base
})

const gridLayerClass = computed(() => {
  const base: string[] = [
    'transition-all duration-md',
    'absolute inset-0 z-base overflow-hidden opacity-70 dark:opacity-86',
  ]
  if (props.variant === 'admin') {
    base.push(adminClipClass)
  }
  base.push('ambient-primary-grid')
  return base
})
</script>

<template>
  <div
    class="absolute inset-0 z-base pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <div class="absolute inset-0 z-base pointer-events-none overflow-hidden">
      <div class="absolute inset-0 bg-background transition-colors duration-md" />
    </div>

    <div :class="layer12OuterClass">
      <div class="absolute inset-0 z-base overflow-hidden pointer-events-none">
        <div
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_42%,rgb(var(--primary)/0.44)_0%,rgb(var(--primary)/0.2)_40%,transparent_78%)] transition-opacity duration-md dark:bg-[radial-gradient(ellipse_at_58%_42%,rgb(var(--primary)/0.52)_0%,rgb(var(--primary)/0.26)_42%,transparent_80%)]"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--primary)/0.18)_0%,rgb(var(--info)/0.08)_42%,rgb(var(--help)/0.12)_100%)] opacity-58 transition-opacity duration-md dark:bg-[linear-gradient(135deg,rgb(var(--primary)/0.24)_0%,rgb(var(--info)/0.14)_42%,rgb(var(--help)/0.18)_100%)] dark:opacity-72"
        />
        <div
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_52%,rgb(var(--foreground)/0.026)_100%)] transition-opacity duration-md dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_48%,rgb(var(--foreground)/0.06)_100%)]"
        />
      </div>

      <div class="absolute inset-0 z-content overflow-hidden pointer-events-none">
        <div
          class="absolute -top-[10%] -right-[5%] h-[45vw] w-[45vw] rounded-full blur-[110px] bg-info/20 opacity-60 transition-opacity duration-md dark:bg-info/40 dark:opacity-85"
        />
        <div
          class="absolute bottom-[5%] right-[10%] h-[35vw] w-[35vw] rounded-full blur-[90px] bg-help/20 opacity-50 transition-opacity duration-md dark:bg-help/35 dark:opacity-80"
        />
        <div
          class="absolute -top-[5%] -left-[10%] h-[40vw] w-[40vw] rounded-full blur-[100px] bg-warn/15 opacity-50 transition-opacity duration-md dark:bg-warn/30 dark:opacity-75"
        />
        <div
          class="absolute bottom-[15%] -left-[5%] h-[25vw] w-[25vw] rounded-full blur-[80px] bg-danger/15 opacity-50 transition-opacity duration-md dark:bg-danger/25 dark:opacity-70"
        />
        <div
          class="absolute -bottom-[15%] left-[25%] h-[30vw] w-[30vw] rounded-full blur-[90px] bg-success/15 opacity-40 transition-opacity duration-md dark:bg-success/25 dark:opacity-60"
        />
      </div>

      <div :class="gridLayerClass" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ambient-primary-grid {
  background:
    linear-gradient(rgb(var(--primary) / 22%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--primary) / 16%) 1px, transparent 1px);
  background-size: var(--spacing-xl) var(--spacing-xl);
  mask-image: radial-gradient(ellipse at center, black 78%, transparent 100%);
  mask-image: radial-gradient(ellipse at center, black 78%, transparent 100%);
  mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

:global(.dark) {
  .ambient-primary-grid {
    background:
      linear-gradient(rgb(var(--primary) / 28%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(var(--primary) / 22%) 1px, transparent 1px);
    background-size: var(--spacing-xl) var(--spacing-xl);
  }
}
</style>
