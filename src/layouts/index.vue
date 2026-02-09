<script setup lang="tsx">
/**
 * 核心布局入口：根据路由 meta.parent 在 Admin / FullScreen / Ratio 间切换
 * 页面布局模式仅由路由决定，不再写入 store
 */
import type { AnimateName } from '@/components/animate-wrapper/utils/types'
import { AnimateWrapper } from '@/components/animate-wrapper'
import LoadingWave from '@&/Loading-Wave.vue'
import AdminLayout from '@/layouts/modules/LayoutAdmin.tsx'
import FullScreenLayout from '@/layouts/modules/LayoutFullScreen.vue'
import RatioLayout from '@/layouts/modules/LayoutRatio.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import ContextMenuProvider from '@/layouts/components/ContextMenuProvider.vue'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { refreshCurrentRoute } from '@/router/utils/helper'
import { useDialog } from '@/hooks/modules/useDialog'
import SettingsContent from '@/layouts/components/GlobalSetting/SettingsContent.vue'

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

// ===== 全局右键菜单逻辑 =====
const { isDark, isAnimating, toggleThemeWithAnimation } = useThemeSwitch()
const { openDialog } = useDialog()

const contextThemeToggleLabel = computed(() => (isDark.value ? '切换为浅色模式' : '切换为深色模式'))

const onContextReload = () => {
  refreshCurrentRoute()
}

const openGlobalSettings = () => {
  openDialog({
    header: '全局配置 (Global Settings)',
    position: 'right',
    width: 'auto',
    contentRenderer: () => <SettingsContent />,
  })
}

const onContextToggleTheme = (event: MouseEvent) => {
  if (isAnimating.value) return
  void toggleThemeWithAnimation(event)
}
</script>

<template>
  <div class="full">
    <!-- 自定义右键菜单 -->
    <ContextMenuProvider scope="global">
      <template #menu="{ close, event }">
        <div class="c-card c-border bg-muted p-padding-sm">
          <div class="full between-start flex-col gap-gap-sm fs-sm font-medium">
            <!-- 重新载入 -->
            <div
              class="full between-start rounded-scale-md px-padding-sm py-padding-xs transition-all duration-scale hover:bg-accent hover:text-accent-foreground active:scale-105"
              @click="
                () => {
                  onContextReload()
                  close()
                }
              "
            >
              <span class="c-cp">重新载入</span>
            </div>

            <!-- 设置：打开全局配置抽屉（SettingsContent） -->
            <div
              class="full between-start rounded-scale-md px-padding-sm py-padding-xs transition-all duration-scale hover:bg-accent hover:text-accent-foreground active:scale-105"
              @click="
                () => {
                  openGlobalSettings()
                  close()
                }
              "
            >
              <span class="c-cp">设置</span>
            </div>

            <!-- 动态切换深/浅色模式 -->
            <div
              class="full between-start rounded-scale-md px-padding-sm py-padding-xs transition-all duration-scale hover:bg-accent hover:text-accent-foreground active:scale-105"
              @click="
                () => {
                  onContextToggleTheme(event)
                  close()
                }
              "
            >
              <span class="c-cp">{{ contextThemeToggleLabel }}</span>
            </div>
          </div>
        </div>
      </template>

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
    </ContextMenuProvider>
  </div>
</template>
