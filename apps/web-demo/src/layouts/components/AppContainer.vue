<script setup lang="ts">
import { useRoute } from 'vue-router'
import { scrollbarMemoryProviderKey } from '@ccd/vue-ui'
import AnimateRouterView from '@&/AnimateRouterView.vue'
import Loading from '@&/Loading.vue'
import { useLayoutStore } from '@/stores/modules/system'

const layoutStore = useLayoutStore()

provide(scrollbarMemoryProviderKey, {
  get: key => layoutStore.getContentScrollMemory(key),
  set: (key, position) => layoutStore.setContentScrollMemory(key, position),
})

const route = useRoute()
const isFullscreen = computed(() => route.meta?.parent === 'fullscreen')
const routeScrollMemoryKey = computed(
  () => `layout-admin-content:${route.fullPath || String(route.name ?? '')}`
)
</script>

<template>
  <div class="col-fill relative min-w-0">
    <CScrollbar
      class="col-fill"
      back-to-top
      :back-to-top-threshold="400"
      :memory-key="routeScrollMemoryKey"
    >
      <AnimateRouterView class="layout-full flex-1 min-h-0" />
    </CScrollbar>

    <!-- 内容区 Loading 遮罩：覆盖 AppContainer 内容视口；整壳阻塞由 layouts/index.vue 全局遮罩负责。 -->
    <Transition name="fade">
      <div
        v-show="layoutStore.isPageLoading && !layoutStore.isLoading && !isFullscreen"
        class="page-loading-overlay-content absolute inset-0 min-w-0 min-h-0 z-content backdrop-blur-sm pointer-events-auto"
        data-testid="app-container-page-loading"
      >
        <Loading
          :type="1"
          class="layout-full min-h-0"
          size="xl"
        />
      </div>
    </Transition>
  </div>
</template>
