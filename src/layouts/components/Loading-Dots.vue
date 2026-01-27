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

const flowerStyle = reactive({
  width: `${newSize.value}px`,
  height: `${newSize.value}px`,
  [toKebabCase('containerSize', '--')]: `${newSize.value}px`,
  [toKebabCase('dotSize', '--')]: `${newSize.value / 7}px`,
  [toKebabCase('biggerOffset', '--')]: `${(newSize.value * 26) / 70}px`,
  [toKebabCase('smallerOffset', '--')]: `${(newSize.value * 14) / 70}px`,
  [toKebabCase('diagonalOffset', '--')]: `${(newSize.value * 19) / 70}px`,
  [toKebabCase('smallerDiagonalOffset', '--')]: `${(newSize.value * 10) / 70}px`,
})

const loadingRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (loadingRef.value) {
    const width = loadingRef.value.clientWidth
    const height = loadingRef.value.clientHeight
    const min = Math.min(width, height) / Number(props.loadingSize)
    if (props.page) {
      flowerStyle.width = `${min}px`
      flowerStyle.height = `${min}px`
      flowerStyle[toKebabCase('containerSize', '--')] = `${min}px`
      flowerStyle[toKebabCase('dotSize', '--')] = `${min / 7}px`
      flowerStyle[toKebabCase('biggerOffset', '--')] = `${(min * 26) / 70}px`
      flowerStyle[toKebabCase('smallerOffset', '--')] = `${(min * 14) / 70}px`
      flowerStyle[toKebabCase('diagonalOffset', '--')] = `${(min * 19) / 70}px`
      flowerStyle[toKebabCase('smallerDiagonalOffset', '--')] = `${(min * 10) / 70}px`
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
      class="flower-spinner"
      :style="flowerStyle"
    >
      <div class="dots-container">
        <div class="bigger-dot">
          <div class="smaller-dot" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flower-spinner,
.flower-spinner * {
  box-sizing: border-box;
}

.flower-spinner {
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
  height: var(--container-size);
  width: var(--container-size);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.flower-spinner .dots-container {
  height: var(--dot-size);
  width: var(--dot-size);
}

.flower-spinner .smaller-dot {
  background: var(--primary100);
  height: 100%;
  width: 100%;
  border-radius: 50%;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  animation: flower-spinner-smaller-dot-animation 2.5s 0s infinite both;
  -webkit-animation: flower-spinner-smaller-dot-animation 2.5s 0s infinite both;
}

.flower-spinner .bigger-dot {
  background: var(--primary100);
  height: 100%;
  width: 100%;
  padding: 10%;
  border-radius: 50%;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  animation: flower-spinner-bigger-dot-animation 2.5s 0s infinite both;
  -webkit-animation: flower-spinner-bigger-dot-animation 2.5s 0s infinite both;
}

@keyframes flower-spinner-bigger-dot-animation {
  0% {
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
  50% {
    transform: translateZ(0) rotate(180deg);
  }
  25%,
  75% {
    box-shadow:
      var(--primary100) var(--bigger-offset) 0px 0px,
      var(--primary100) calc(var(--bigger-offset) * -1) 0px 0px,
      var(--primary100) 0px var(--bigger-offset) 0px,
      var(--primary100) 0px calc(var(--bigger-offset) * -1) 0px,
      var(--primary100) var(--diagonal-offset) calc(var(--diagonal-offset) * -1) 0px,
      var(--primary100) var(--diagonal-offset) var(--diagonal-offset) 0px,
      var(--primary100) calc(var(--diagonal-offset) * -1) calc(var(--diagonal-offset) * -1) 0px,
      var(--primary100) calc(var(--diagonal-offset) * -1) var(--diagonal-offset) 0px;
  }
  100% {
    transform: translateZ(0) rotate(360deg);
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
}

@-webkit-keyframes flower-spinner-bigger-dot-animation {
  0% {
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
  50% {
    -webkit-transform: translateZ(0) rotate(180deg);
  }
  25%,
  75% {
    box-shadow:
      var(--primary100) var(--bigger-offset) 0px 0px,
      var(--primary100) calc(var(--bigger-offset) * -1) 0px 0px,
      var(--primary100) 0px var(--bigger-offset) 0px,
      var(--primary100) 0px calc(var(--bigger-offset) * -1) 0px,
      var(--primary100) var(--diagonal-offset) calc(var(--diagonal-offset) * -1) 0px,
      var(--primary100) var(--diagonal-offset) var(--diagonal-offset) 0px,
      var(--primary100) calc(var(--diagonal-offset) * -1) calc(var(--diagonal-offset) * -1) 0px,
      var(--primary100) calc(var(--diagonal-offset) * -1) var(--diagonal-offset) 0px;
  }
  100% {
    -webkit-transform: translateZ(0) rotate(360deg);
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
}

@keyframes flower-spinner-smaller-dot-animation {
  0% {
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
  25%,
  75% {
    box-shadow:
      var(--primary200) var(--smaller-offset) 0px 0px,
      var(--primary200) calc(var(--smaller-offset) * -1) 0px 0px,
      var(--primary200) 0px var(--smaller-offset) 0px,
      var(--primary200) 0px calc(var(--smaller-offset) * -1) 0px,
      var(--primary200) var(--smaller-diagonal-offset) calc(var(--smaller-diagonal-offset) * -1) 0px,
      var(--primary200) var(--smaller-diagonal-offset) var(--smaller-diagonal-offset) 0px,
      var(--primary200) calc(var(--smaller-diagonal-offset) * -1)
        calc(var(--smaller-diagonal-offset) * -1) 0px,
      var(--primary200) calc(var(--smaller-diagonal-offset) * -1) var(--smaller-diagonal-offset) 0px;
  }
  100% {
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
}

@-webkit-keyframes flower-spinner-smaller-dot-animation {
  0% {
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
  25%,
  75% {
    box-shadow:
      var(--primary200) var(--smaller-offset) 0px 0px,
      var(--primary200) calc(var(--smaller-offset) * -1) 0px 0px,
      var(--primary200) 0px var(--smaller-offset) 0px,
      var(--primary200) 0px calc(var(--smaller-offset) * -1) 0px,
      var(--primary200) var(--smaller-diagonal-offset) calc(var(--smaller-diagonal-offset) * -1) 0px,
      var(--primary200) var(--smaller-diagonal-offset) var(--smaller-diagonal-offset) 0px,
      var(--primary200) calc(var(--smaller-diagonal-offset) * -1)
        calc(var(--smaller-diagonal-offset) * -1) 0px,
      var(--primary200) calc(var(--smaller-diagonal-offset) * -1) var(--smaller-diagonal-offset) 0px;
  }
  100% {
    box-shadow:
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px,
      var(--primary100) 0px 0px 0px;
  }
}
</style>
