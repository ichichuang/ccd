<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useDeviceStore } from '@/stores/modules/device'
import AnimateRouterView from '@&/AnimateRouterView.vue'
import Loading from '@&/Loading.vue'
import { useLayoutStore } from '@/stores/modules/layout'

const deviceStore = useDeviceStore()
const layoutStore = useLayoutStore()
const isPageLoading = computed(() => layoutStore.isPageLoading)
const width = computed(() => deviceStore.getWidth)
const height = computed(() => deviceStore.getHeight)

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

const wrapperRef = ref<HTMLDivElement>()

/**
 * 基于“最大化高度 + 按宽度缩放”的 contain 逻辑：
 * - 基础画布高度固定为父容器高度（h-full）
 * - 宽度由 aspect-ratio 推导：baseWidth = parentHeight * ratio
 * - 若 baseWidth 超出可用宽度，则对画布缩放：scale = parentWidth / baseWidth
 */
const scale = ref<number>(1)

const ratioCanvasStyle = computed<Record<string, string>>(() => ({
  aspectRatio: aspectRatio.value.ratioText,
  transform: `scale(${scale.value})`,
}))

let rafId = 0
let ro: ResizeObserver | null = null

function updateScale() {
  const wrapper = wrapperRef.value
  if (!wrapper) {
    return
  }
  const pw = wrapper.clientWidth
  const ph = wrapper.clientHeight
  if (pw <= 0 || ph <= 0) {
    return
  }

  const r = aspectRatio.value.ratio
  if (r <= 0) {
    scale.value = 1
    return
  }

  // baseWidth 对应“以高度为基准”的画布宽度（由 aspect-ratio 推导）
  const baseWidth = ph * r
  if (baseWidth <= 0) {
    scale.value = 1
    return
  }

  const nextScale = Math.min(1, pw / baseWidth)
  scale.value = Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1
}

function scheduleUpdate() {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  rafId = requestAnimationFrame(() => {
    updateScale()
    rafId = 0
  })
}

onMounted(() => {
  // 使用 ResizeObserver 监听父容器尺寸变化，避免仅依赖全局宽高导致的时序误差
  nextTick(() => {
    const wrapper = wrapperRef.value
    if (wrapper) {
      ro = new ResizeObserver(() => {
        scheduleUpdate()
      })
      ro.observe(wrapper)
    }
    // 初始计算
    updateScale()
  })
})

onUnmounted(() => {
  if (ro) {
    ro.disconnect()
    ro = null
  }
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
})

// 使用全局布局 store 的宽高变更来驱动重新计算
watch(
  [width, height],
  () => {
    scheduleUpdate()
  },
  { immediate: false }
)

watch(
  () => route.meta?.ratio,
  () => {
    scheduleUpdate()
  }
)
</script>
<template>
  <div
    ref="wrapperRef"
    class="layout-screen bg-background text-foreground relative"
  >
    <!-- translate 由 absolute-center 负责；scale 由内层 transform 负责 -->
    <div class="absolute-center layout-full">
      <div
        class="h-full flex flex-col overflow-hidden min-w-0 relative"
        :style="ratioCanvasStyle"
      >
        <AnimateRouterView />
        <Transition name="fade">
          <div
            v-show="isPageLoading"
            class="absolute inset-0 z-10 center backdrop-blur-sm bg-background/60 pointer-events-auto"
          >
            <Loading
              :type="2"
              size="lg"
            />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
