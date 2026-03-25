<script setup lang="ts">
import { useRoute } from 'vue-router'
import AnimateRouterView from '@&/AnimateRouterView.vue'
import Loading from '@&/Loading.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import { CScrollbar } from '@/components/CScrollbar'
import type CScrollbarComponent from '@/components/CScrollbar/CScrollbar.vue'

const layoutStore = useLayoutStore()
const route = useRoute()

const scrollbarRef = ref<InstanceType<typeof CScrollbarComponent> | null>(null)

const isPageLoading = computed(() => layoutStore.isPageLoading)
const isFullscreen = computed(() => route.meta?.parent === 'fullscreen')

watch(
  () => route.fullPath,
  () => {
    // 路由切换时滚动到顶部（复刻 AppContainer 的行为）
    scrollbarRef.value?.scrollTo({ top: 0, behavior: 'auto' })
  }
)
</script>

<template>
  <div class="layout-screen bg-background text-foreground flex flex-col relative">
    <CScrollbar
      ref="scrollbarRef"
      class="col-fill shadow-sm dark:shadow-md"
    >
      <!-- 让 router-view 根节点拿到 col-fill，保证子内容可安全拉伸 -->
      <AnimateRouterView class="layout-full min-h-0" />
    </CScrollbar>

    <Transition name="fade">
      <div
        v-show="isPageLoading && !isFullscreen"
        class="absolute inset-0 z-10 center backdrop-blur-sm pointer-events-auto"
      >
        <Loading size="xl" />
      </div>
    </Transition>
  </div>
</template>
