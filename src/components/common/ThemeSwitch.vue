<script setup lang="ts">
import { useThemeSwitch } from '@/hooks'
import { useColorStore } from '@/stores'
import { computed, ref } from 'vue'

const { toggleThemeWithAnimation } = useThemeSwitch()
const colorStore = useColorStore()

const mode = computed(() => colorStore.mode)

// 处理点击事件
const isAnimating = ref(false)
const handleClick = async (event: MouseEvent) => {
  if (isAnimating.value) {
    return
  }
  isAnimating.value = true
  try {
    await toggleThemeWithAnimation(event, true)
  } finally {
    // 与动画时长对齐，略大于 400ms，避免重复触发
    setTimeout(() => {
      isAnimating.value = false
    }, 450)
  }
}

/* 动态计算高亮背景位置 */
const contentClass = computed(() => {
  return mode.value === 'auto' ? 'between-end' : mode.value === 'dark' ? 'center' : 'between'
})
</script>

<template lang="pug">
// 主题切换开关
.c-border.bg-bg100.rounded-full.c-transitions.gap-3.p-3(
  @click='handleClick',
  :class='[contentClass, isAnimating ? "pointer-events-none opacity-90" : ""]'
)
  .w-appFontSizex.h-appFontSizex.center.rounded-full.c-transitions.relative.z-2.p-3.box-content.c-cp
    .w-appFontSize.h-appFontSize(:class='{ "bg-accent100": mode === "light" }')
      OhVueIcon.w-appFontSize.h-appFontSize(name='ri-sun-line')

  .w-appFontSizex.h-appFontSizex.center.rounded-full.c-transitions.relative.z-2.p-3.box-content.c-cp
    .w-appFontSize.h-appFontSize(:class='{ "bg-accent100": mode === "dark" }')
      OhVueIcon.w-appFontSize.h-appFontSize(name='ri-moon-clear-line')

  .w-appFontSizex.h-appFontSizex.center.rounded-full.c-transitions.relative.z-2.p-3.box-content.c-cp
    .w-appFontSize.h-appFontSize(:class='{ "bg-accent100": mode === "auto" }')
      OhVueIcon.w-appFontSize.h-appFontSize(name='ri-computer-line')

  .w-appFontSizex.h-appFontSizex.center.rounded-full.c-transitions.active-blob.absolute.p-3.box-content
</template>
<style scoped lang="scss">
.active-blob {
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent100) 20%, transparent),
      color-mix(in srgb, var(--accent100) 5%, transparent)
    ),
    color-mix(in srgb, var(--bg100) 80%, transparent);

  /* 玻璃背景效果 - 使用主背景色的半透明版本 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* 多层渐变背景 - 基于主题色创建玻璃效果 */

  /* 玻璃边框 - 使用主色调的半透明 */
  border: 1px solid color-mix(in srgb, var(--accent100) 20%, transparent);
  border-top: 1px solid transparent;
  border-bottom: 1px solid color-mix(in srgb, var(--accent200) 30%, transparent);
  border-left: 1px solid color-mix(in srgb, var(--accent100) 30%, transparent);

  z-index: 1;
}
</style>
