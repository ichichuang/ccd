<script setup lang="tsx">
/**
 * 核心布局入口：根据路由 meta.parent 在 Admin / FullScreen / Ratio 间切换
 * 页面布局模式仅由路由决定，不再写入 store
 */
import type { AnimateName } from '@/components/AnimateWrapper/utils/types'
import { AnimateWrapper } from '@/components/AnimateWrapper'
import LoadingWave from '@&/Loading-Wave.vue'
import AdminLayout from '@/layouts/modules/LayoutAdmin.tsx'
import FullScreenLayout from '@/layouts/modules/LayoutFullScreen.vue'
import RatioLayout from '@/layouts/modules/LayoutRatio.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import { TRANSITION_SCALE_VALUES } from '@/constants/sizeScale'

defineOptions({ name: 'LayoutIndex' })

/** 加载层动画时长：使用尺寸系统过渡阶梯 2xl（500ms） */
const loadingOverlayDuration = `${TRANSITION_SCALE_VALUES['2xl']}ms`

const layoutStore = useLayoutStore()
const isLoading = computed(() => layoutStore.isLoading)
const route = useRoute()
const currentLayoutMode = computed<LayoutMode>(() => (route.meta?.parent as LayoutMode) || 'admin')
const previousLayout = ref<LayoutMode>(currentLayoutMode.value)

watch(
  () => route.fullPath,
  () => {
    previousLayout.value = currentLayoutMode.value
  }
)

const isLoadingRef = ref(true)
watch(
  () => isLoading.value,
  loading =>
    nextTick(() => {
      isLoadingRef.value = loading
    }),
  { immediate: true }
)

const layoutAnimations: Record<
  LayoutMode,
  { enter: AnimateName; leave: AnimateName; duration: string }
> = {
  fullscreen: { enter: 'fadeIn', leave: 'fadeOut', duration: '1s' },
  admin: { enter: 'fadeIn', leave: 'fadeOut', duration: '1s' },
  ratio: { enter: 'fadeIn', leave: 'fadeOut', duration: '1s' },
}

const getLayoutEnterAnimation = (mode: LayoutMode): AnimateName =>
  layoutAnimations[mode]?.enter ?? 'fadeIn'

const getLayoutLeaveAnimation = (from: LayoutMode, to: LayoutMode): AnimateName => {
  if (from === to) return layoutAnimations[from]?.leave ?? 'fadeOut'
  const levels: Record<LayoutMode, number> = { fullscreen: 0, admin: 1, ratio: 2 }
  const fromLevel = levels[from] ?? 1
  const toLevel = levels[to] ?? 1
  if (toLevel < fromLevel) return 'fadeOutUp'
  if (toLevel > fromLevel) return 'fadeOutDown'
  return layoutAnimations[from]?.leave ?? 'fadeOut'
}

const getAnimationDuration = (): string =>
  layoutAnimations[currentLayoutMode.value]?.duration ?? '1s'
</script>

<template>
  <div class="layout-full">
    <!-- 1. 加载层 -->
    <AnimateWrapper
      :show="isLoadingRef"
      enter="fadeIn"
      leave="fadeOut"
      :duration="loadingOverlayDuration"
      delay="0s"
    >
      <div class="container fixed center top-0 right-0 left-0 bottom-0 z-[999]">
        <LoadingWave :loading-size="3" />
      </div>
    </AnimateWrapper>

    <!-- 2. 主布局层 -->
    <AnimateWrapper
      :show="!isLoadingRef"
      :enter="getLayoutEnterAnimation(currentLayoutMode)"
      :leave="getLayoutLeaveAnimation(previousLayout, currentLayoutMode)"
      :duration="getAnimationDuration()"
      delay="0s"
    >
      <template v-if="currentLayoutMode === 'fullscreen'">
        <component :is="FullScreenLayout" />
      </template>
      <template v-if="currentLayoutMode === 'admin'">
        <component :is="AdminLayout" />
      </template>
      <template v-if="currentLayoutMode === 'ratio'">
        <component :is="RatioLayout" />
      </template>
    </AnimateWrapper>
  </div>
</template>
