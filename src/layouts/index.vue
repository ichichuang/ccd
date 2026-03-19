<script setup lang="tsx">
/**
 * 核心布局入口：根据路由 meta.parent 在 Admin / FullScreen / Ratio 间切换
 * 页面布局模式仅由路由决定，不再写入 store
 */
import type { AnimateName } from '@/components/AnimateWrapper/utils/types'
import { AnimateWrapper } from '@/components/AnimateWrapper'
import Loading from '@&/Loading.vue'
import AdminLayout from '@/layouts/modules/LayoutAdmin.tsx'
import FullScreenLayout from '@/layouts/modules/LayoutFullScreen.vue'
import RatioLayout from '@/layouts/modules/LayoutRatio.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import { TRANSITION_SCALE_VALUES } from '@/constants/sizeScale'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'LayoutIndex' })

/** 加载层动画时长：使用尺寸系统过渡阶梯 sm（更快的遮罩响应，减轻底层闪烁感） */
const loadingOverlayDuration = `${TRANSITION_SCALE_VALUES.sm}ms`

const layoutStore = useLayoutStore()
const isLoading = computed(() => layoutStore.isLoading)
const route = useRoute()
const router = useRouter()
const currentLayoutMode = computed<LayoutMode>(() => (route.meta?.parent as LayoutMode) || 'admin')
const previousLayout = ref<LayoutMode>(currentLayoutMode.value)

// Use beforeResolve to capture the 'from' route just before the transition
const unregisterGuard = router.beforeResolve((_to, from) => {
  previousLayout.value = (from.meta?.parent as LayoutMode) || 'admin'
})

// Prevent memory leaks if the layout component is ever hot-reloaded or unmounted
onUnmounted(() => {
  unregisterGuard()
})

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

const currentLayoutComponent = computed(() => {
  if (currentLayoutMode.value === 'fullscreen') return FullScreenLayout
  if (currentLayoutMode.value === 'ratio') return RatioLayout
  return AdminLayout
})
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
      <div class="fixed inset-0 z-[999] center bg-background w-full h-full">
        <Loading
          :type="3"
          size="5xl"
        />
      </div>
    </AnimateWrapper>

    <!-- 2. 主布局层 -->
    <AnimateWrapper
      :show="!isLoadingRef"
      :enter="getLayoutEnterAnimation(currentLayoutMode)"
      :leave="isLoadingRef ? 'fadeOut' : getLayoutLeaveAnimation(previousLayout, currentLayoutMode)"
      :duration="getAnimationDuration()"
      delay="0s"
    >
      <component :is="currentLayoutComponent" />
    </AnimateWrapper>
  </div>
</template>
