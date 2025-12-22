<script setup lang="ts">
import { AnimateWrapper } from '@/components/layout/animate-wrapper'
import { useLayoutStore } from '@/stores'
import { env } from '@/utils'
import Image from 'primevue/image'
import { computed, nextTick, ref, watch } from 'vue'

const layoutStore = useLayoutStore()
const title = env.appTitle
const isCollapsed = computed(() => layoutStore.getSidebarCollapsed)
const flag = ref(false)

watch(
  () => isCollapsed.value,
  () => {
    flag.value = false
    nextTick(() => {
      setTimeout(() => {
        flag.value = true
      }, 0)
    })
  },
  { immediate: true }
)
</script>
<template>
  <div class="select-none h-full between-start hidden md:block">
    <AnimateWrapper
      v-if="isCollapsed"
      :show="flag"
      enter="fadeInLeft"
      leave="fadeOutLeft"
      duration="1s"
    >
      <Image
        class="w-appFontSizel h-appFontSizel"
        src="./face.png"
      />
    </AnimateWrapper>
    <AnimateWrapper
      v-else
      :show="flag"
      enter="fadeInLeft"
      leave="fadeOutLeft"
      duration="1s"
    >
      <span>{{ title }}</span>
    </AnimateWrapper>
  </div>
</template>
<style lang="scss" scoped></style>
