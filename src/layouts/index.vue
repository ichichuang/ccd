<script setup lang="tsx">
/**
 * 核心布局入口：根据路由 meta.parent 在 Admin / FullScreen / Ratio 间切换
 * 页面布局模式仅由路由决定，不再写入 store
 */
import type { AnimateName } from '@/components/AnimateWrapper/utils/types'
import { AnimateWrapper } from '@/components/AnimateWrapper'
import { RUNTIME_E2E_EVENTS } from '@/constants/runtime'
import AmbientBackground from '@/layouts/components/AmbientBackground.vue'
import { useLayoutStore } from '@/stores/modules/system'
import { dispatchRuntimeE2EEvent } from '@/utils/runtime/e2e'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'LayoutIndex' })

// 异步布局边界：将大体量布局模块切分为独立 chunk，避免首帧主线程长任务
const AdminLayout = defineAsyncComponent(() => import('@/layouts/modules/LayoutAdmin.tsx'))
const FullScreenLayout = defineAsyncComponent(
  () => import('@/layouts/modules/LayoutFullScreen.vue')
)
const RatioLayout = defineAsyncComponent(() => import('@/layouts/modules/LayoutRatio.vue'))

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
const runtimeLoadingState = ref<'true' | 'false'>('true')

function syncRuntimeLoadingState(loading: boolean): void {
  if (typeof document === 'undefined') return

  const nextState = loading ? 'true' : 'false'
  if (runtimeLoadingState.value === nextState) return

  runtimeLoadingState.value = nextState
  document.documentElement.dataset.runtimeLoading = nextState
  dispatchRuntimeE2EEvent(
    loading ? RUNTIME_E2E_EVENTS.runtimeLoadingStart : RUNTIME_E2E_EVENTS.runtimeLoadingIdle
  )
}

watch(
  () => isLoading.value,
  loading => {
    syncRuntimeLoadingState(loading)
    nextTick(() => {
      isLoadingRef.value = loading
    })
  },
  { immediate: true }
)

// 启动边界：首屏阶段由 index.html 原生 Loader 独占，Vue Loading 仅在首屏结束后接管运行期全局任务
const isAppBooted = ref(false)
let unwatchBoot: (() => void) | null = null
unwatchBoot = watch(
  () => isLoading.value,
  loading => {
    if (!loading) {
      isAppBooted.value = true
      nextTick(() => {
        if (unwatchBoot) {
          unwatchBoot()
          unwatchBoot = null
        }
      })
    }
  },
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
  <div
    id="app-shell"
    class="relative flex flex-col layout-full overflow-hidden"
  >
    <AmbientBackground :variant="currentLayoutMode" />
    <!-- 单所有者预加载：启动阶段仅保留 index.html 原生 loader -->
    <AnimateWrapper
      :show="!isLoadingRef"
      :enter="getLayoutEnterAnimation(currentLayoutMode)"
      :leave="isLoadingRef ? 'fadeOut' : getLayoutLeaveAnimation(previousLayout, currentLayoutMode)"
      :duration="getAnimationDuration()"
      delay="0s"
    >
      <component
        :is="currentLayoutComponent"
        class="relative z-content min-h-0"
      />
    </AnimateWrapper>

    <Transition name="fade">
      <div
        v-if="isLoading && isAppBooted"
        id="runtime-loading-overlay"
        class="runtime-loading-overlay z-toast"
      >
        <div
          class="pure-css-loader"
          role="status"
          aria-label="Loading"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.runtime-loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--background));
}

.pure-css-loader {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.pure-css-loader::before,
.pure-css-loader::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-sizing: border-box;
}

.pure-css-loader::before {
  border: 4px solid rgb(var(--primary) / 20%);
  border-top-color: rgb(var(--primary));
  animation: pure-spin 0.9s linear infinite;
}

.pure-css-loader::after {
  border: 4px solid transparent;
  border-right-color: rgb(var(--primary) / 65%);
  transform: scale(0.72);
  animation: pure-spin-reverse 1.2s linear infinite;
  opacity: 0.9;
}

@keyframes pure-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pure-spin-reverse {
  to {
    transform: scale(0.72) rotate(-360deg);
  }
}
</style>
