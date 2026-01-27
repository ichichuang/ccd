<script setup lang="ts">
import { useElementSize } from '@/hooks/modules/useElementSize'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AnimateRouterView from '@&/AnimateRouterView.vue'

const containerRef = ref<HTMLElement | null>(null)
const scrollbarRef = ref()

const { height: containerHeight } = useElementSize(containerRef, undefined, {
  mode: 'throttle',
  delay: 300,
})

const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    const api = scrollbarRef.value
    if (api?.scrollTo) {
      api.scrollTo({ top: 0, behavior: 'auto' })
    }
  }
)
</script>

<template>
  <div
    ref="containerRef"
    class="full relative"
  >
    <template v-if="containerHeight && containerHeight > 0">
      <AnimateRouterView :style="{ minHeight: containerHeight + 'px' }" />
    </template>
  </div>
</template>
