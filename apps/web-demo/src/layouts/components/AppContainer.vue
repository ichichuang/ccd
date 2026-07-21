<script setup lang="ts">
import { useRoute } from 'vue-router'
import { CScrollbar, scrollbarMemoryProviderKey } from '@ccd/vue-ui'
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

interface ConsoleScrollRootInstance {
  elements: () => {
    scrollOffsetElement: HTMLElement
  }
}

function markConsoleScrollRoot(instance: ConsoleScrollRootInstance): void {
  instance.elements().scrollOffsetElement.setAttribute('data-console-scroll-root', '')
}
</script>

<template>
  <div class="col-fill relative min-w-0">
    <CScrollbar
      class="col-fill"
      back-to-top
      :back-to-top-threshold="400"
      :memory-key="routeScrollMemoryKey"
      :options="{ overflow: { x: 'hidden' } }"
      @initialized="markConsoleScrollRoot"
      @updated="markConsoleScrollRoot"
    >
      <AnimateRouterView class="layout-full flex-1 min-h-0" />
    </CScrollbar>

    <!-- 内容区 Loading 遮罩：覆盖 AppContainer 内容视口；整壳阻塞由 layouts/index.vue 全局遮罩负责。 -->
    <Transition name="fade">
      <div
        v-show="layoutStore.isPageLoading && !layoutStore.isLoading && !isFullscreen"
        class="page-loading-overlay-content page-loading-overlay-surface absolute inset-0 min-w-0 min-h-0 z-content pointer-events-auto"
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
