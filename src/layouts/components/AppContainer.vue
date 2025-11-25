<script setup lang="ts">
import { debounce, throttle } from '@/common'
import { INTERVAL, REMEMBER_SCROLLBAR_TOP, STRATEGY } from '@/constants/modules/layout'
import { useElementSize } from '@/hooks'
import { useLayoutStore } from '@/stores'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const layoutStore = useLayoutStore()
const currentLayoutMode = computed(() => layoutStore.getCurrentLayout)
const containerRef = ref<HTMLElement | null>(null)
const scrollbarRef = ref()

// 读取已存储的滚动位置
const layoutScrollbarTop = computed(() => layoutStore.getLayoutScrollbarTop)

// 直接使用 useElementSize 返回的响应式高度，避免手动 nextTick 和 DOM 读取
const { height: containerHeight } = useElementSize(containerRef, undefined, {
  mode: STRATEGY,
  delay: INTERVAL,
})

// 将 setLayoutScrollbarTop 包装为节流/防抖（依据全局策略）
const persistScrollTop = (() => {
  const setTop = (top: number) => layoutStore.setLayoutScrollbarTop(top)
  return STRATEGY === 'throttle' ? throttle(setTop, INTERVAL) : debounce(setTop, INTERVAL)
})()

// ScrollbarWrapper 滚动事件回调（按需存储 scrollTop）
const handleScroll = (e: { scrollTop: number }) => {
  if (!REMEMBER_SCROLLBAR_TOP) {
    return
  }
  persistScrollTop(e.scrollTop)
}

// ScrollbarWrapper 初始化后，恢复滚动位置
const handleInitialized = async () => {
  if (!REMEMBER_SCROLLBAR_TOP) {
    return
  }
  await nextTick()
  const api = scrollbarRef.value
  if (api?.scrollTo) {
    const top = layoutScrollbarTop.value || 0
    api.scrollTo({ top, behavior: 'auto' })
  }
}

// 监听路由切换：重置滚动位置为 0，并将容器滚动到顶部
const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    layoutStore.setLayoutScrollbarTop(0)
    const api = scrollbarRef.value
    if (api?.scrollTo) {
      api.scrollTo({ top: 0, behavior: 'auto' })
    }
  }
)
</script>

<template lang="pug">
.full.relative(ref='containerRef')
  template(v-if='containerHeight && containerHeight > 0')
    ScrollbarWrapper(
      ref='scrollbarRef',
      :wrapper-class='currentLayoutMode !== "fullscreen" && currentLayoutMode !== "ratio" ? "bg-bg100 rounded-rounded" : ""',
      :style='{ height: containerHeight + "px" }',
      @scroll='handleScroll',
      @initialized='handleInitialized',
      :remember-scroll-position='true'
    )
      .p-paddingx
        AnimateRouterView(:style='{ minHeight: containerHeight + "px" }')
</template>
