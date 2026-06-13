<script setup lang="ts">
import { useRoute } from 'vue-router'
import AnimateRouterView from '@&/AnimateRouterView.vue'
import Loading from '@&/Loading.vue'
import { useLayoutStore } from '@/stores/modules/system'
import { useLayoutRuntime } from '@/hooks/layout/useLayoutRuntime'

const layoutStore = useLayoutStore()
const runtime = useLayoutRuntime()
const isPageLoading = computed(() => layoutStore.isPageLoading)

const route = useRoute()

type RatioParsed = {
  ratio: number
  /**
   * CSS aspect-ratio 需要 <ratio>，这里统一生成成 "w / h" 格式，
   * 避免把浮点直接塞给 aspect-ratio 导致浏览器兼容问题。
   */
  ratioText: string
}

function parseRatioString(input?: unknown): RatioParsed {
  const fallbackW = 16
  const fallbackH = 9
  const fallback = fallbackW / fallbackH

  if (!input) {
    return {
      ratio: fallback,
      ratioText: `${fallbackW} / ${fallbackH}`,
    }
  }

  const str = String(input).trim()
  const match = str.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/)
  if (match) {
    const w = parseFloat(match[1])
    const h = parseFloat(match[2])
    if (w > 0 && h > 0) {
      return {
        ratio: w / h,
        ratioText: `${w} / ${h}`,
      }
    }
  }

  const n = Number(str)
  if (!Number.isNaN(n) && n > 0) {
    return {
      ratio: n,
      ratioText: `${n} / 1`,
    }
  }

  return {
    ratio: fallback,
    ratioText: `${fallbackW} / ${fallbackH}`,
  }
}

const aspectRatio = computed<RatioParsed>(() => parseRatioString(route.meta?.ratio))
</script>
<template>
  <div
    class="layout-screen text-foreground center relative"
    :style="runtime.shellSafeAreaStyle.value"
  >
    <!-- 使用 CSS aspect-ratio + max-* 做 contain，严格按路由 meta.ratio 渲染 -->
    <div
      class="relative z-content w-full max-w-full max-h-full overflow-hidden bg-transparent"
      :style="{ aspectRatio: aspectRatio.ratioText }"
    >
      <AnimateRouterView />
      <Transition name="fade">
        <div
          v-show="isPageLoading"
          class="page-loading-overlay-ratio page-loading-overlay-surface absolute inset-0 center min-w-0 min-h-0 z-overlay pointer-events-auto"
        >
          <Loading size="xl" />
        </div>
      </Transition>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
