<!--
  黄金样本：Script Setup + UnoCSS + 无 <style>
  参考自 src/components/Icons/Icons.vue
  AI 生成 UI 组件时请严格模仿：withDefaults(defineProps<Props>())、UnoCSS class、语义类 text-foreground 等。
  导入路径在实际项目中请按 src 目录结构调整。
  Vue 运行时 API（ref、computed 等）由自动导入提供，无需手写 import，见 docs/BUILD_SYSTEM.md。
-->
<script setup lang="ts">
import type { IconsProps } from '@/components/Icons/utils/types'
import { toIconName } from '@/components/Icons/utils/helper'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'
import type { SizeScaleKey } from '@/constants/sizeScale'

/**
 * Icons 组件 (UnoCSS preset-icons)
 * 尺寸：标准阶梯 xs～5xl 通过 fs-* 联动 SizeStore；数字/字符串通过内联样式。
 */
const props = withDefaults(defineProps<IconsProps>(), {
  size: 'md',
  color: undefined,
  animation: undefined,
  flip: undefined,
  rotate: undefined,
  scale: undefined,
  label: undefined,
  title: undefined,
})

// 1. 图标名称 → UnoCSS 类名
const iconClass = computed(() => {
  const n = props.name
  if (n.startsWith('i-')) return n
  if (n.includes(':')) return `i-${n.replace(':', '-')}`
  if (n.includes('-')) return `i-${n}`
  return `i-lucide-${toIconName(n)}`
})

// 2. 尺寸类名：仅标准阶梯（xs～5xl）使用 fs-*
const sizeClass = computed(() => {
  const s = props.size
  if (typeof s === 'string' && SIZE_SCALE_KEYS.includes(s as SizeScaleKey)) {
    return `fs-${s}`
  }
  return ''
})

// 3. 尺寸样式：仅数字或带单位字符串
const sizeStyle = computed(() => {
  const s = props.size
  if (typeof s === 'string' && SIZE_SCALE_KEYS.includes(s as SizeScaleKey)) {
    return {}
  }
  if (typeof s === 'number') return { fontSize: `${s}px` }
  if (typeof s === 'string' && !Number.isNaN(Number(s))) return { fontSize: `${s}px` }
  if (typeof s === 'string') return { fontSize: s }
  return {}
})

// 4. 颜色、旋转、缩放
const style = computed(() => {
  const css: Record<string, string> = {}
  if (props.color) css.color = props.color
  const transforms: string[] = []
  if (props.rotate !== undefined && props.rotate !== '') {
    transforms.push(`rotate(${props.rotate}deg)`)
  }
  if (props.scale !== undefined) transforms.push(`scale(${props.scale})`)
  if (transforms.length) css.transform = transforms.join(' ')
  return css
})

// 5. 动画、翻转
const functionalClasses = computed(() => {
  const cls: string[] = []
  if (props.animation === 'spin') cls.push('animate-spin')
  if (props.animation === 'pulse') cls.push('animate-pulse')
  if (props.animation === 'spin-pulse') {
    cls.push('animate-spin', 'animate-pulse')
  }
  if (props.flip === 'horizontal') cls.push('scale-x-[-1]')
  if (props.flip === 'vertical') cls.push('scale-y-[-1]')
  if (props.flip === 'both') cls.push('scale-[-1]')
  return cls.join(' ')
})
</script>

<template>
  <div
    :class="[iconClass, functionalClasses, sizeClass]"
    :style="{ ...style, ...sizeStyle }"
    class="inline-block align-middle text-foreground"
    role="img"
    :aria-label="label"
    :title="title"
    :aria-hidden="!label"
  />
</template>
