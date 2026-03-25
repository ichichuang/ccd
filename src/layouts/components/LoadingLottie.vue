<script setup lang="ts">
/**
 * 页面级 Loading 动画（Lottie）
 * 通过 type 选择 loading-001 / 002 / 003.json；通过 size 使用 Design System 尺寸阶梯。
 * 视觉缩放由内部 LOADING_SCALE_MAP 按 type 自动决定。
 * 颜色随 --primary 主题同步（Lottie Theming Engine）。
 */
import type { SizeScaleKey } from '@/constants/sizeScale'
import { LOADING_SIZE_CSS } from '@/constants/sizeScale'
import loading001 from '@/assets/lottie/airplane.json'
import loading002 from '@/assets/lottie/loading-002.json'
import loading003 from '@/assets/lottie/loading-003.json'
import { BaseLottieLoader } from './BaseLottieLoader'
import { applyThemeToLottieJson } from '@/utils/theme/lottieThemeUtils'
import { useThemeStore } from '@/stores/modules/theme'

/** 加载动画样式：1 | 2 | 3 对应 loading-001 / 002 / 003.json */
type LoadingType = 1 | 2 | 3

interface LoadingProps {
  /** 加载动画样式，默认 1 */
  type?: LoadingType
  /** 尺寸阶梯（xs～5xl），默认 3xl；与 Design System 一致 */
  size?: SizeScaleKey
}

const props = withDefaults(defineProps<LoadingProps>(), {
  type: 1,
  size: 'md',
})

const LOADING_ANIMATION_MAP: Record<LoadingType, object> = {
  1: loading001,
  2: loading002,
  3: loading003,
}

const themeStore = useThemeStore()
const resolvedSize = computed(() => LOADING_SIZE_CSS[props.size])

const normalizedType = computed((): LoadingType => {
  const t = props.type
  if (t === 1 || t === 2 || t === 3) return t
  return 1
})

const resolvedAnimationData = computed(() => {
  const raw = LOADING_ANIMATION_MAP[normalizedType.value] as object
  void themeStore.themeName
  void themeStore.isDark
  return applyThemeToLottieJson(raw, { loadingType: normalizedType.value })
})
</script>

<template>
  <div class="layout-full flex items-center justify-center">
    <BaseLottieLoader
      :width="resolvedSize"
      :height="resolvedSize"
      :animation-data="resolvedAnimationData"
      :loop="true"
      :speed="1"
    />
  </div>
</template>
