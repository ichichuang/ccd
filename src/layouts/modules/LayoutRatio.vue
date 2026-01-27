<script setup lang="ts">
import { getCurrentRouteMeta } from '@/common/modules/router'
import { useDeviceStore } from '@/stores/modules/device'
import AnimateRouterView from '@&/AnimateRouterView.vue'

const deviceStore = useDeviceStore()
const width = computed(() => deviceStore.getWidth)
const height = computed(() => deviceStore.getHeight)

const routeMeta = getCurrentRouteMeta()

function parseRatioString(input?: unknown): number {
  const fallback = 16 / 9
  if (!input) {
    return fallback
  }
  const str = String(input).trim()
  const match = str.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/)
  if (match) {
    const w = parseFloat(match[1])
    const h = parseFloat(match[2])
    if (w > 0 && h > 0) {
      return w / h
    }
  }
  const n = Number(str)
  if (!Number.isNaN(n) && n > 0) {
    return n
  }
  return fallback
}

const aspectRatio = ref<number>(parseRatioString(routeMeta.ratio))

const wrapperRef = ref<HTMLDivElement>()
const ratioRef = ref<HTMLDivElement>()

const boxStyle = reactive<Record<string, string>>({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '0px',
  height: '0px',
})

let rafId = 0
let ro: ResizeObserver | null = null

function updateBoxSize() {
  const wrapper = wrapperRef.value
  if (!wrapper) {
    return
  }
  const pw = wrapper.clientWidth
  const ph = wrapper.clientHeight
  if (pw <= 0 || ph <= 0) {
    return
  }

  const r = aspectRatio.value || 16 / 9
  // contain 逻辑：在父容器内尽可能大且保持比例
  // 如果父容器更宽（宽高比更大），以高度为基准；否则以宽度为基准
  const parentRatio = pw / ph
  let w = 0
  let h = 0
  if (parentRatio > r) {
    // 以高度为基准
    h = ph
    w = Math.round(h * r)
  } else {
    // 以宽度为基准
    w = pw
    h = Math.round(w / r)
  }

  boxStyle.width = `${w}px`
  boxStyle.height = `${h}px`
}

function scheduleUpdate() {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
  rafId = requestAnimationFrame(() => {
    updateBoxSize()
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
    updateBoxSize()
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
</script>
<template>
  <div
    ref="wrapperRef"
    class="ratio-wrapper"
    :style="{ position: 'relative', width: '100%', height: '100%' }"
  >
    <div
      ref="ratioRef"
      class="ratio-box"
      :style="boxStyle"
    >
      <AnimateRouterView />
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
