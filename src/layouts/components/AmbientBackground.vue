<script setup lang="ts">
/**
 * 全局环境光：Z0 底色 + 径向晕影 + mesh + Primary 柔光 + 四象限光球 + 点阵。
 * 浅色：mesh 补左下薄弱区、角球略大略实、边缘晕影略收；中央柔光略降以突出四角。深色仍克制。
 */
import { useDeviceStore } from '@/stores/modules/device'

defineOptions({ name: 'AmbientBackground' })

interface AmbientBackgroundProps {
  variant?: LayoutMode
}

const props = withDefaults(defineProps<AmbientBackgroundProps>(), {
  variant: 'admin',
})

const layoutStore = useLayoutStore()
const deviceStore = useDeviceStore()

/** 仅非 Mobile 挂载高成本 blur 光球（设备类型判定，避免横屏误伤与 PC 窄窗误卸） */
const allowHeavyOrbs = computed(() => deviceStore.type !== 'Mobile')

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

const dotLayerClass = computed(() => {
  const base: string[] = [
    'transition-all duration-md',
    'absolute inset-0 z-content overflow-hidden opacity-26 dark:opacity-48',
  ]
  if (props.variant === 'admin') {
    base.push(adminClipClass)
  }
  base.push(
    'bg-[radial-gradient(circle_at_center,rgba(var(--foreground),0.05)_1px,transparent_1px)] [background-size:28px_28px] bg-repeat',
    '[mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]',
    '[-webkit-mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]',
    '[mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]'
  )
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
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.22)_0%,rgba(var(--primary),0.11)_40%,transparent_76%)] transition-opacity duration-md dark:bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.07)_0%,rgba(var(--primary),0.035)_36%,transparent_74%)]"
        />
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/24 via-primary/10 to-info/28 opacity-58 transition-opacity duration-md dark:from-primary/10 dark:via-transparent dark:to-info/16 dark:opacity-40"
        />
        <div
          class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_46%,rgba(var(--foreground),0.032)_100%)] transition-opacity duration-md dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_44%,rgba(var(--foreground),0.07)_100%)]"
        />
      </div>
      <div
        v-if="allowHeavyOrbs"
        class="absolute left-1/2 top-[16%] z-base h-[min(44vw,460px)] w-[min(72vw,720px)] -translate-x-1/2 pointer-events-none"
      >
        <div
          class="ambient-orb-pulse h-full w-full transform-gpu rounded-full blur-[62px] bg-primary/34 opacity-72 transition-opacity duration-md ease-out will-change-transform dark:blur-[96px] dark:bg-primary/16 dark:opacity-60"
        />
      </div>
      <div
        v-if="allowHeavyOrbs"
        class="absolute inset-0 z-base overflow-hidden pointer-events-none"
      >
        <div
          class="ambient-orb-drift absolute -top-[10%] -left-[10%] h-[58vw] w-[58vw] transform-gpu rounded-full will-change-transform blur-[72px] bg-primary/56 saturate-[1.14] transition-colors transition-opacity duration-lg ease-out opacity-84 dark:blur-[100px] dark:bg-primary/42 dark:opacity-92 dark:saturate-100"
        />
        <div
          class="ambient-orb-pulse absolute bottom-[2%] left-[12%] h-[50vw] w-[50vw] transform-gpu rounded-full will-change-transform blur-[66px] saturate-[1.1] bg-success/36 transition-colors transition-opacity duration-lg ease-out opacity-62 dark:bottom-[5%] dark:left-[20%] dark:h-[45vw] dark:w-[45vw] dark:blur-[90px] dark:bg-success/28 dark:opacity-92 dark:saturate-100"
        />
        <div
          class="ambient-orb-pulse absolute top-[12%] -right-[12%] h-[48vw] w-[48vw] transform-gpu rounded-full will-change-transform blur-[60px] saturate-[1.1] bg-danger/36 transition-colors transition-opacity duration-lg ease-out opacity-62 dark:top-[15%] dark:-right-[10%] dark:h-[40vw] dark:w-[40vw] dark:blur-[80px] dark:bg-danger/28 dark:opacity-92 dark:saturate-100"
        />
        <div
          class="ambient-orb-drift-alt absolute -bottom-[15%] -right-[5%] h-[52vw] w-[52vw] transform-gpu rounded-full will-change-transform blur-[72px] bg-info/34 saturate-[1.1] transition-colors transition-opacity duration-lg ease-out opacity-56 dark:blur-[100px] dark:bg-info/34 dark:opacity-92 dark:saturate-100"
        />
      </div>
      <div :class="dotLayerClass" />
    </div>
  </div>
</template>
