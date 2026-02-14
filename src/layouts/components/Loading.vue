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
    loadingSize: 5,
  }
)

const newSize = computed(() => {
  return props.size ? props.size : definitely.value / Number(props.loadingSize)
})

const spinnerStyle = reactive({
  width: `${newSize.value}px`,
  height: `${newSize.value}px`,
  [toKebabCase('circleSize', '--')]: `${newSize.value * 0.24}px`,
  [toKebabCase('borderSize', '--')]: `${newSize.value / 25}px`,
})

const loadingRef = ref<HTMLElement | null>(null)

onMounted(() => {
  // 获取 loadingRef 的宽度高度提取出最短的边长
  if (loadingRef.value) {
    const width = loadingRef.value.clientWidth
    const height = loadingRef.value.clientHeight
    const min = Math.min(width, height) / Number(props.loadingSize)
    if (props.page) {
      spinnerStyle.width = `${min}px`
      spinnerStyle.height = `${min}px`
      spinnerStyle[toKebabCase('circleSize', '--')] = `${min * 0.24}px`
      spinnerStyle[toKebabCase('borderSize', '--')] = `${min / 25}px`
    }
  }
})
</script>

<template>
  <div
    ref="loadingRef"
    class="layout-full center"
  >
    <div
      class="overflow-hidden atom-spinner"
      :style="spinnerStyle"
    >
      <div class="spinner-inner">
        <div class="spinner-line" />
        <div class="spinner-line" />
        <div class="spinner-line" />
        <div class="spinner-circle">●</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.atom-spinner {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
}

.atom-spinner .spinner-inner {
  position: relative;
  display: block;
  height: 100%;
  width: 100%;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.atom-spinner .spinner-circle {
  display: block;
  position: absolute;
  color: rgb(var(--primary));
  font-size: var(--circle-size);
  top: 50%;
  left: 50%;
  transform: translateZ(0) translate(-50%, -50%);
  -webkit-transform: translateZ(0) translate(-50%, -50%);
}

.atom-spinner .spinner-line {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border-left: var(--border-size) solid rgb(var(--primary));
  border-top: var(--border-size) solid transparent;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.atom-spinner .spinner-line:nth-child(1) {
  animation: atom-spinner-animation-1 1s linear infinite;
  -webkit-animation: atom-spinner-animation-1 1s linear infinite;
  transform: translateZ(0) rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
}

.atom-spinner .spinner-line:nth-child(2) {
  animation: atom-spinner-animation-2 1s linear infinite;
  -webkit-animation: atom-spinner-animation-2 1s linear infinite;
  transform: translateZ(0) rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
}

.atom-spinner .spinner-line:nth-child(3) {
  animation: atom-spinner-animation-3 1s linear infinite;
  -webkit-animation: atom-spinner-animation-3 1s linear infinite;
  transform: translateZ(0) rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
}

@keyframes atom-spinner-animation-1 {
  0% {
    transform: translateZ(0) rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
  }
  100% {
    transform: translateZ(0) rotateZ(120deg) rotateX(66deg) rotateZ(360deg);
  }
}

@-webkit-keyframes atom-spinner-animation-1 {
  0% {
    -webkit-transform: translateZ(0) rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
  }
  100% {
    -webkit-transform: translateZ(0) rotateZ(120deg) rotateX(66deg) rotateZ(360deg);
  }
}

@keyframes atom-spinner-animation-2 {
  0% {
    transform: translateZ(0) rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
  }
  100% {
    transform: translateZ(0) rotateZ(240deg) rotateX(66deg) rotateZ(360deg);
  }
}

@-webkit-keyframes atom-spinner-animation-2 {
  0% {
    -webkit-transform: translateZ(0) rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
  }
  100% {
    -webkit-transform: translateZ(0) rotateZ(240deg) rotateX(66deg) rotateZ(360deg);
  }
}

@keyframes atom-spinner-animation-3 {
  0% {
    transform: translateZ(0) rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
  }
  100% {
    transform: translateZ(0) rotateZ(360deg) rotateX(66deg) rotateZ(360deg);
  }
}

@-webkit-keyframes atom-spinner-animation-3 {
  0% {
    -webkit-transform: translateZ(0) rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
  }
  100% {
    -webkit-transform: translateZ(0) rotateZ(360deg) rotateX(66deg) rotateZ(360deg);
  }
}
</style>
