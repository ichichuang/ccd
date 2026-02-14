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

const pulseStyle = reactive({
  width: `${newSize.value}px`,
  height: `${newSize.value}px`,
  [toKebabCase('pulseSize', '--')]: `${newSize.value}px`,
})

const loadingRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (loadingRef.value) {
    const width = loadingRef.value.clientWidth
    const height = loadingRef.value.clientHeight
    const min = Math.min(width, height) / Number(props.loadingSize)
    if (props.page) {
      pulseStyle.width = `${min}px`
      pulseStyle.height = `${min}px`
      pulseStyle[toKebabCase('pulseSize', '--')] = `${min}px`
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
      class="pulse-container"
      :style="pulseStyle"
    >
      <div class="pulse-ring pulse-ring-1" />
      <div class="pulse-ring pulse-ring-2" />
      <div class="pulse-ring pulse-ring-3" />
      <div class="pulse-core" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pulse-container {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  position: relative;
  width: var(--pulse-size);
  height: var(--pulse-size);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  border: 3px solid rgb(var(--primary));
  border-radius: 50%;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: translateZ(0) scale(0.5);
  -webkit-transform: translateZ(0) scale(0.5);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.pulse-ring-1 {
  animation: pulse-animation 2s infinite;
  -webkit-animation: pulse-animation 2s infinite;
}

.pulse-ring-2 {
  animation: pulse-animation 2s infinite 0.4s;
  -webkit-animation: pulse-animation 2s infinite 0.4s;
}

.pulse-ring-3 {
  animation: pulse-animation 2s infinite 0.8s;
  -webkit-animation: pulse-animation 2s infinite 0.8s;
}

.pulse-core {
  width: calc(var(--pulse-size) * 0.3);
  height: calc(var(--pulse-size) * 0.3);
  background: rgb(var(--primary));
  border-radius: 50%;
  position: relative;
  z-index: 1;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  animation: pulse-core-animation 2s infinite;
  -webkit-animation: pulse-core-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    transform: translateZ(0) scale(0.5);
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translateZ(0) scale(1.5);
    opacity: 0;
  }
}

@-webkit-keyframes pulse-animation {
  0% {
    -webkit-transform: translateZ(0) scale(0.5);
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    -webkit-transform: translateZ(0) scale(1.5);
    opacity: 0;
  }
}

@keyframes pulse-core-animation {
  0%,
  100% {
    transform: translateZ(0) scale(1);
  }
  50% {
    transform: translateZ(0) scale(1.2);
  }
}

@-webkit-keyframes pulse-core-animation {
  0%,
  100% {
    -webkit-transform: translateZ(0) scale(1);
  }
  50% {
    -webkit-transform: translateZ(0) scale(1.2);
  }
}
</style>
