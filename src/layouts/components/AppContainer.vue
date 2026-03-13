<script setup lang="ts">
import { useRoute } from 'vue-router'
import AnimateRouterView from '@&/AnimateRouterView.vue'
import Loading from '@&/Loading.vue'
import { useLayoutStore } from '@/stores/modules/layout'
import type CScrollbar from '@/components/CScrollbar/CScrollbar.vue'

const layoutStore = useLayoutStore()
const scrollbarRef = ref<InstanceType<typeof CScrollbar> | null>(null)

const isPageLoading = computed(() => layoutStore.isPageLoading)

const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    // 路由切换时滚动到顶部
    scrollbarRef.value?.scrollTo({ top: 0, behavior: 'auto' })
  }
)
</script>

<template>
  <div class="layout-full relative">
    <CScrollbar
      ref="scrollbarRef"
      class="layout-full rounded-scale-md shadow-soft"
    >
      <AnimateRouterView class="flex-1" />
    </CScrollbar>

    <!-- 内容区 Loading 遮罩：路由切换时显示 -->
    <Transition name="fade">
      <div
        v-show="isPageLoading"
        class="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm pointer-events-auto"
      >
        <Loading size="xl" />
      </div>
    </Transition>
  </div>
</template>
