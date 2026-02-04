<script setup lang="ts">
/**
 * 核心布局入口：根据路由 meta.parent 在 Admin / FullScreen / Ratio 间切换
 * 页面布局模式仅由路由决定，不再写入 store
 */
import type { AnimateName } from '@&/animate-wrapper/utils/types'
import AnimateWrapper from '@&/animate-wrapper/AnimateWrapper.vue'
import LoadingWave from '@&/Loading-Wave.vue'
import AdminLayout from '@/layouts/modules/LayoutAdmin.vue'
import FullScreenLayout from '@/layouts/modules/LayoutFullScreen.vue'
import RatioLayout from '@/layouts/modules/LayoutRatio.vue'
import { useLayoutStore } from '@/stores/modules/layout'

defineOptions({ name: 'LayoutIndex' })

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
  <!-- 1. 加载层 -->
  <AnimateWrapper
    :show="isLoadingRef"
    enter="fadeIn"
    leave="fadeOut"
    duration="500ms"
    delay="0s"
  >
    <div class="container fixed center top-0 right-0 left-0 bottom-0 z-999">
      <LoadingWave :loading-size="3" />
    </div>
  </AnimateWrapper>

  <!-- 2. 主布局层 -->
  <div class="full">
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
