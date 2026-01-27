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

const cubeStyle = reactive({
  width: `${newSize.value}px`,
  height: `${newSize.value}px`,
  [toKebabCase('cubeSize', '--')]: `${newSize.value}px`,
})

const loadingRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (loadingRef.value) {
    const width = loadingRef.value.clientWidth
    const height = loadingRef.value.clientHeight
    const min = Math.min(width, height) / Number(props.loadingSize)
    if (props.page) {
      cubeStyle.width = `${min}px`
      cubeStyle.height = `${min}px`
      cubeStyle[toKebabCase('cubeSize', '--')] = `${min}px`
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
      class="cube-container"
      :style="cubeStyle"
    >
      <div class="cube">
        <div class="cube-face cube-face-front" />
        <div class="cube-face cube-face-back" />
        <div class="cube-face cube-face-right" />
        <div class="cube-face cube-face-left" />
        <div class="cube-face cube-face-top" />
        <div class="cube-face cube-face-bottom" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cube-container {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  perspective: 1000px;
  -webkit-perspective: 1000px;
  width: var(--cube-size);
  height: var(--cube-size);
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  animation: cube-rotate 3s infinite linear;
  -webkit-animation: cube-rotate 3s infinite linear;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid var(--primary200);
  background: linear-gradient(135deg, var(--primary100), var(--primary200));
  opacity: 0.8;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.cube-face-front {
  transform: translateZ(calc(var(--cube-size) / 2));
  -webkit-transform: translateZ(calc(var(--cube-size) / 2));
}

.cube-face-back {
  transform: rotateY(180deg) translateZ(calc(var(--cube-size) / 2));
  -webkit-transform: rotateY(180deg) translateZ(calc(var(--cube-size) / 2));
}

.cube-face-right {
  transform: rotateY(90deg) translateZ(calc(var(--cube-size) / 2));
  -webkit-transform: rotateY(90deg) translateZ(calc(var(--cube-size) / 2));
}

.cube-face-left {
  transform: rotateY(-90deg) translateZ(calc(var(--cube-size) / 2));
  -webkit-transform: rotateY(-90deg) translateZ(calc(var(--cube-size) / 2));
}

.cube-face-top {
  transform: rotateX(90deg) translateZ(calc(var(--cube-size) / 2));
  -webkit-transform: rotateX(90deg) translateZ(calc(var(--cube-size) / 2));
}

.cube-face-bottom {
  transform: rotateX(-90deg) translateZ(calc(var(--cube-size) / 2));
  -webkit-transform: rotateX(-90deg) translateZ(calc(var(--cube-size) / 2));
}

@keyframes cube-rotate {
  0% {
    transform: translateZ(0) rotateX(0deg) rotateY(0deg);
  }
  100% {
    transform: translateZ(0) rotateX(360deg) rotateY(360deg);
  }
}

@-webkit-keyframes cube-rotate {
  0% {
    -webkit-transform: translateZ(0) rotateX(0deg) rotateY(0deg);
  }
  100% {
    -webkit-transform: translateZ(0) rotateX(360deg) rotateY(360deg);
  }
}
</style>
