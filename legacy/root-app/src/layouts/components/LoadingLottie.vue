<script setup lang="ts">
/**
 * 页面级 Loading 动画（Lottie）
 * 通过 type 选择 loading-001 / 002 / 003.json；通过 size 使用 Design System 尺寸阶梯。
 * 视觉缩放由内部 LOADING_SCALE_MAP 按 type 自动决定。
 * 颜色随 --primary 主题同步（Lottie Theming Engine）。
 */
import type { SizeScaleKey } from '@/constants/sizeScale'
import { LOADING_SIZE_CSS } from '@/constants/sizeScale'
import { BaseLottieLoader } from './BaseLottieLoader'
import { applyThemeToLottieJson } from '@/utils/theme/lottieThemeUtils'
import { useThemeStore } from '@/stores/modules/system'

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

/** Lottie JSON 文件路径映射（public/ 目录，运行时 fetch 加载） */
const LOADING_JSON_URL: Record<LoadingType, string> = {
  1: `${import.meta.env.BASE_URL}lottie/airplane.json`,
  2: `${import.meta.env.BASE_URL}lottie/loading-002.json`,
  3: `${import.meta.env.BASE_URL}lottie/loading-003.json`,
}

/** 内存缓存：同一 type 不重复 fetch */
const jsonCache = new Map<LoadingType, object>()

const themeStore = useThemeStore()
const resolvedSize = computed(() => LOADING_SIZE_CSS[props.size])
const rawAnimationData = shallowRef<object | null>(null)

const normalizedType = computed((): LoadingType => {
  const t = props.type
  if (t === 1 || t === 2 || t === 3) return t
  return 1
})

watchEffect(async () => {
  const type = normalizedType.value
  if (jsonCache.has(type)) {
    rawAnimationData.value = jsonCache.get(type)!
    return
  }
  try {
    const res = await fetch(LOADING_JSON_URL[type])
    const json = await res.json()
    jsonCache.set(type, json)
    rawAnimationData.value = json
  } catch (e) {
    console.error(`Failed to load Lottie animation (type=${type}):`, e)
  }
})

const resolvedAnimationData = computed(() => {
  const raw = rawAnimationData.value
  if (!raw) return null
  void themeStore.themeName
  void themeStore.isDark
  return applyThemeToLottieJson(raw, { loadingType: normalizedType.value })
})
</script>

<template>
  <div class="layout-full flex items-center justify-center">
    <BaseLottieLoader
      v-if="resolvedAnimationData"
      :width="resolvedSize"
      :height="resolvedSize"
      :animation-data="resolvedAnimationData"
      :loop="true"
      :speed="1"
    />
  </div>
</template>
