<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AnimateRouterView from '@&/AnimateRouterView.vue'

const scrollbarRef = ref<InstanceType<typeof CScrollbar> | null>(null)

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
  <div class="layout-full">
    <CScrollbar
      ref="scrollbarRef"
      class="layout-full rounded-scale-md component-border"
    >
      <AnimateRouterView class="flex-1" />
    </CScrollbar>
  </div>
</template>
