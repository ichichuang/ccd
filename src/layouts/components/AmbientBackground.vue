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
    'absolute inset-0 z-base overflow-hidden opacity-45 dark:opacity-24',
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
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_58%_42%,rgb(var(--primary)/0.34)_0%,rgb(var(--primary)/0.14)_40%,transparent_78%)] transition-opacity duration-md dark:bg-[radial-gradient(ellipse_at_58%_42%,rgb(var(--primary)/0.24)_0%,rgb(var(--primary)/0.1)_42%,transparent_80%)]"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--primary)/0.14)_0%,rgb(var(--info)/0.06)_42%,rgb(var(--help)/0.08)_100%)] opacity-42 transition-opacity duration-md dark:bg-[linear-gradient(135deg,rgb(var(--primary)/0.1)_0%,rgb(var(--info)/0.05)_42%,rgb(var(--help)/0.06)_100%)] dark:opacity-38"
        />
        <div
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_52%,rgb(var(--foreground)/0.022)_100%)] transition-opacity duration-md dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_48%,rgb(var(--foreground)/0.032)_100%)]"
        />
      </div>

      <div class="absolute inset-0 z-content overflow-hidden pointer-events-none">
        <div
          class="absolute -top-[10%] -right-[5%] h-[45vw] w-[45vw] rounded-full blur-[110px] bg-info/14 opacity-36 transition-opacity duration-md dark:bg-info/16 dark:opacity-18"
        />
        <div
          class="absolute bottom-[5%] right-[10%] h-[35vw] w-[35vw] rounded-full blur-[90px] bg-help/12 opacity-30 transition-opacity duration-md dark:bg-help/14 dark:opacity-16"
        />
        <div
          class="absolute -top-[5%] -left-[10%] h-[40vw] w-[40vw] rounded-full blur-[100px] bg-warn/10 opacity-26 transition-opacity duration-md dark:bg-warn/12 dark:opacity-12"
        />
        <div
          class="absolute bottom-[15%] -left-[5%] h-[25vw] w-[25vw] rounded-full blur-[80px] bg-danger/10 opacity-24 transition-opacity duration-md dark:bg-danger/12 dark:opacity-10"
        />
        <div
          class="absolute -bottom-[15%] left-[25%] h-[30vw] w-[30vw] rounded-full blur-[90px] bg-success/10 opacity-20 transition-opacity duration-md dark:bg-success/12 dark:opacity-10"
        />
      </div>

      <div :class="gridLayerClass" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ambient-primary-grid {
  background:
    linear-gradient(rgb(var(--primary) / 12%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(var(--primary) / 9%) 1px, transparent 1px);
  background-size: var(--spacing-xl) var(--spacing-xl);
  mask-image: radial-gradient(ellipse at center, black 78%, transparent 100%);
  mask-repeat: no-repeat;
}

:global(.dark) {
  .ambient-primary-grid {
    background:
      linear-gradient(rgb(var(--primary) / 10%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(var(--primary) / 8%) 1px, transparent 1px);
    background-size: var(--spacing-xl) var(--spacing-xl);
  }
}
</style>
