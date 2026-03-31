<script setup lang="ts">
/**
 * BaseLottieLoader - 统一 Lottie 加载动画组件
 *
 * Smart Wrapper 架构：外框严格约束宽高，内部 Vue3Lottie 100% 填满 + scale 抵消 JSON 内嵌 padding。
 * 用于全局 loading、页面 loading 等场景。
 */
import loadingCircleJson from './loadingCircle.json'
import LoadingFallback from '../LoadingFallback.vue'

interface Props {
  /** Lottie 动画 JSON 数据，不传则使用默认 loading 圈 */
  animationData?: object
  /** 动画 URL，与 animationData 二选一 */
  animationLink?: string
  /** 宽度（px 或 CSS 值） */
  width?: number | string
  /** 高度（px 或 CSS 值） */
  height?: number | string
  /** 视觉缩放，用于抵消 Lottie JSON 内嵌 padding，默认 1 */
  scale?: number
  /** 是否循环 */
  loop?: boolean | number
  /** 播放速度，默认 1 */
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  animationData: undefined,
  animationLink: undefined,
  width: 120,
  height: 120,
  scale: 1,
  loop: true,
  speed: 1,
})

const resolvedAnimationData = computed(() => props.animationData ?? loadingCircleJson)
const Vue3LottieAsync = defineAsyncComponent({
  loader: async () => {
    const module = await import('vue3-lottie')
    return module.Vue3Lottie
  },
  loadingComponent: LoadingFallback,
  delay: 0,
})

const RENDERER_SETTINGS = { preserveAspectRatio: 'xMidYMid slice' as const }

const wrapperStyle = computed(() => {
  const w = props.width
  const h = props.height
  const wStr = typeof w === 'number' ? `${w}px` : String(w ?? 120)
  const hStr = typeof h === 'number' ? `${h}px` : String(h ?? 120)
  return {
    width: wStr,
    height: hStr,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }
})
</script>

<template>
  <div
    class="base-lottie-loader base-lottie-loader__wrapper"
    :style="wrapperStyle"
  >
    <Vue3LottieAsync
      v-if="animationLink"
      :animation-link="animationLink"
      width="100%"
      height="100%"
      :scale="scale"
      :loop="loop"
      :speed="speed"
      :renderer-settings="RENDERER_SETTINGS"
      class="base-lottie-loader__player"
    />
    <Vue3LottieAsync
      v-else
      :animation-data="resolvedAnimationData"
      width="100%"
      height="100%"
      :scale="scale"
      :loop="loop"
      :speed="speed"
      :renderer-settings="RENDERER_SETTINGS"
      class="base-lottie-loader__player"
    />
  </div>
</template>
