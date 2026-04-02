<script setup lang="ts">
/**
 * 全局环境光：Z0 可过渡底色 + 四象限光球 + 点阵遮罩。
 * 由 layouts/index 单例挂载；Admin 与 FullScreen/Ratio 通过 variant 区分圆角裁剪。
 */
defineOptions({ name: 'AmbientBackground' })

interface AmbientBackgroundProps {
  variant?: LayoutMode
}

const props = withDefaults(defineProps<AmbientBackgroundProps>(), {
  variant: 'admin',
})

const layoutStore = useLayoutStore()

/** 首屏 handoff 期间淡出高饱和光球，与 LayoutAdmin 原注释一致 */
const showAmbientOrbs = computed<boolean>(() => !layoutStore.isLoading)

const adminClipClass = 'rounded-lg lg:rounded-l-xl'

const layer12OuterClass = computed(() =>
  props.variant === 'admin'
    ? [
        'absolute inset-0 pointer-events-none overflow-hidden transition-all duration-md',
        adminClipClass,
        showAmbientOrbs.value ? 'opacity-100' : 'opacity-0',
      ]
    : [
        'absolute inset-0 pointer-events-none overflow-hidden transition-all duration-md',
        showAmbientOrbs.value ? 'opacity-100' : 'opacity-0',
      ]
)

const dotLayerClass = computed(() =>
  props.variant === 'admin'
    ? [
        'transition-all duration-md',
        'absolute inset-0 z-content overflow-hidden opacity-60',
        adminClipClass,
        'bg-[radial-gradient(circle_at_center,rgba(var(--foreground),0.06)_1px,transparent_1px)] [background-size:28px_28px] bg-repeat',
        '[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]',
        '[-webkit-mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]',
        '[mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]',
      ]
    : [
        'transition-all duration-md',
        'absolute inset-0 z-content overflow-hidden opacity-60',
        'bg-[radial-gradient(circle_at_center,rgba(var(--foreground),0.06)_1px,transparent_1px)] [background-size:28px_28px] bg-repeat',
        '[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]',
        '[-webkit-mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]',
        '[mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]',
      ]
)
</script>

<template>
  <div
    class="absolute inset-0 z-base pointer-events-none overflow-hidden"
    aria-hidden="true"
  >
    <!-- Z0: Canvas base — smooth theme bg transition -->
    <div class="absolute inset-0 z-base pointer-events-none overflow-hidden">
      <div class="absolute inset-0 bg-background transition-colors duration-md" />
    </div>
    <!-- Layer 1+2: orbs + dot matrix -->
    <div :class="layer12OuterClass">
      <div class="absolute inset-0 z-base overflow-hidden pointer-events-none">
        <div
          class="ambient-orb-drift absolute -top-[10%] -left-[10%] h-[55vw] w-[55vw] transform-gpu rounded-full will-change-transform blur-[100px] bg-accent/30 transition-colors transition-opacity duration-lg ease-out opacity-50 dark:opacity-90"
        />
        <div
          class="ambient-orb-pulse absolute bottom-[5%] left-[20%] h-[45vw] w-[45vw] transform-gpu rounded-full will-change-transform blur-[90px] bg-success/25 transition-colors transition-opacity duration-lg ease-out opacity-50 dark:opacity-90"
        />
        <div
          class="ambient-orb-pulse absolute top-[15%] -right-[10%] h-[40vw] w-[40vw] transform-gpu rounded-full will-change-transform blur-[80px] bg-danger/25 transition-colors transition-opacity duration-lg ease-out opacity-50 dark:opacity-90"
        />
        <div
          class="ambient-orb-drift-alt absolute -bottom-[15%] -right-[5%] h-[50vw] w-[50vw] transform-gpu rounded-full will-change-transform blur-[100px] bg-info/30 transition-colors transition-opacity duration-lg ease-out opacity-50 dark:opacity-90"
        />
      </div>
      <div :class="dotLayerClass" />
    </div>
  </div>
</template>
