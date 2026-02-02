<script setup lang="ts">
import { useDeviceStore } from '@/stores/modules/device'

const deviceStore = useDeviceStore()
const definitely = computed(() => deviceStore.getDefinitely)
const props = withDefaults(
  defineProps<{
    size?: number
    page?: boolean
    loadingSize?: number
  }>(),
  {
    size: undefined,
    loadingSize: 8,
  }
)

const newSize = computed(() => {
  return props.size ? props.size : definitely.value / Number(props.loadingSize)
})

const waveStyle = reactive({
  [toKebabCase('barWidth', '--')]: `${newSize.value * 0.12}px`,
  [toKebabCase('barHeight', '--')]: `${newSize.value * 0.8}px`,
  [toKebabCase('spinnerWidth', '--')]: `${newSize.value}px`,
  [toKebabCase('spinnerHeight', '--')]: `${newSize.value * 0.8}px`,
})

const loadingRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (loadingRef.value) {
    const width = loadingRef.value.clientWidth
    const height = loadingRef.value.clientHeight
    const min = Math.min(width, height) / Number(props.loadingSize)
    if (props.page) {
      waveStyle[toKebabCase('barWidth', '--')] = `${min * 0.12}px`
      waveStyle[toKebabCase('barHeight', '--')] = `${min * 0.8}px`
      waveStyle[toKebabCase('spinnerWidth', '--')] = `${min}px`
      waveStyle[toKebabCase('spinnerHeight', '--')] = `${min * 0.8}px`
    }
  }
})
</script>

<template>
  <div
    ref="loadingRef"
    class="full center"
  >
    <div
      class="spinner"
      :style="waveStyle"
    >
      <div class="rect1" />
      <div class="rect2" />
      <div class="rect3" />
      <div class="rect4" />
      <div class="rect5" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.spinner {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  width: var(--spinner-width);
  height: var(--spinner-height);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--bar-width) * 0.5);
}

.spinner > div {
  background-color: red;
  height: 100%;
  width: var(--bar-width);
  display: inline-block;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  animation: sk-stretchdelay 1.2s infinite ease-in-out;
  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
}

.spinner .rect2 {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}

.spinner .rect3 {
  -webkit-animation-delay: -1s;
  animation-delay: -1s;
}

.spinner .rect4 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

.spinner .rect5 {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}

@-webkit-keyframes sk-stretchdelay {
  0%,
  40%,
  100% {
    -webkit-transform: translateZ(0) scaleY(0.4);
  }
  20% {
    -webkit-transform: translateZ(0) scaleY(1);
  }
}

@keyframes sk-stretchdelay {
  0%,
  40%,
  100% {
    transform: translateZ(0) scaleY(0.4);
    -webkit-transform: translateZ(0) scaleY(0.4);
  }
  20% {
    transform: translateZ(0) scaleY(1);
    -webkit-transform: translateZ(0) scaleY(1);
  }
}
</style>
