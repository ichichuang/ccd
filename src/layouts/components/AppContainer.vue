<script setup lang="ts">
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AnimateRouterView from '@&/AnimateRouterView.vue'

const containerRef = ref<HTMLElement | null>(null)
const scrollbarRef = ref<InstanceType<typeof CScrollbar> | null>(null)

const { height: containerHeight } = useAppElementSize(containerRef, undefined, {
  mode: 'throttle',
  delay: 300,
})

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
  <CScrollbar
    ref="scrollbarRef"
    class="full"
  >
    <div
      ref="containerRef"
      class="full relative"
    >
      <template v-if="containerHeight && containerHeight > 0">
        <AnimateRouterView
          class="app-container-router-view"
          :style="{ '--app-container-min-height': `${containerHeight}px` }"
        />
      </template>
    </div>
  </CScrollbar>
</template>

<style scoped>
.app-container-router-view {
  min-height: var(--app-container-min-height, auto);
}
</style>
