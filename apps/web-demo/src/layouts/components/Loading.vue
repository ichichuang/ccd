<script setup lang="ts">
/**
 * 页面级 Loading 动画（异步 Shell）
 *
 * 轻量包装层：通过 defineAsyncComponent 延迟加载 Lottie 动画系统（LoadingLottie.vue）。
 * 首屏即刻显示纯 CSS 旋转指示器，Lottie chunk 加载完成后无缝升级为动画。
 *
 * 外部 API 不变：接受 type (1|2|3) 和 size (SizeScaleKey)。
 */
import type { SizeScaleKey } from '@ccd/design-tokens'
import LoadingFallback from './LoadingFallback.vue'

/** 加载动画样式：1 | 2 | 3 对应 loading-001 / 002 / 003.json */
type LoadingType = 1 | 2 | 3

interface LoadingProps {
  /** 加载动画样式，默认 1 */
  type?: LoadingType
  /** 尺寸阶梯（xs～5xl），默认 md；与 Design System 一致 */
  size?: SizeScaleKey
}

const props = withDefaults(defineProps<LoadingProps>(), {
  type: 1,
  size: 'md',
})

const LoadingLottie = defineAsyncComponent({
  loader: () => import('./LoadingLottie.vue'),
  loadingComponent: LoadingFallback,
  delay: 0,
})
</script>

<template>
  <LoadingLottie
    :type="props.type"
    :size="props.size"
  />
</template>
