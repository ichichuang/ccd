<script setup lang="ts">
import { computed } from 'vue'
import type { IconsProps } from './utils/types'
import { toIconName } from './utils/helper'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'
import type { SizeScaleKey } from '@/constants/sizeScale'

/**
 * Icons 组件 (UnoCSS 纯净版)
 * 使用 UnoCSS preset-icons 渲染图标，提供统一的 name/size/animation 接口
 *
 * 尺寸系统：
 * - 兼容尺寸（s/m/l）和标准尺寸（xs-5xl）通过 UnoCSS fs-* 类名控制，联动 SizeStore
 * - 自定义尺寸（数字/字符串）通过内联样式控制
 */
const props = withDefaults(defineProps<IconsProps>(), {
  size: 'm',
  color: undefined,
  animation: undefined,
  flip: undefined,
  rotate: undefined,
  scale: undefined,
  label: undefined,
  title: undefined,
})

// 兼容性映射：旧版 's'|'m'|'l' -> 标准尺寸（与 helper.ts 保持一致）
const LEGACY_SIZE_MAP: Record<'s' | 'm' | 'l', SizeScaleKey> = {
  s: 'sm',
  m: 'md',
  l: 'xl',
}

// 1. 图标名称标准化
// - 已带 i- → 用户指定 UnoCSS 图标类，直接用
// - 含 : → 集合前缀语法（mdi:home），转换为 i-mdi-home
// - 含连字符 (ri-home-line) → 视为集合名，补 i-
// - 无前缀 (home / Home) → 默认 Lucide：i-lucide-xxx，其中 xxx 使用 toIconName 规范化
const iconClass = computed(() => {
  const n = props.name
  if (n.startsWith('i-')) return n
  if (n.includes(':')) return `i-${n.replace(':', '-')}`
  if (n.includes('-')) return `i-${n}`
  return `i-lucide-${toIconName(n)}`
})

// 2. 尺寸类名：返回 UnoCSS fs-* 类名（用于标准尺寸和兼容尺寸）
const sizeClass = computed(() => {
  const s = props.size

  // 兼容旧版：'s' | 'm' | 'l' -> 映射到标准尺寸
  if (s === 's' || s === 'm' || s === 'l') {
    return `fs-${LEGACY_SIZE_MAP[s]}`
  }

  // 标准尺寸：直接使用（xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl）
  if (typeof s === 'string' && SIZE_SCALE_KEYS.includes(s as SizeScaleKey)) {
    return `fs-${s}`
  }

  // 自定义尺寸：返回空字符串，由 sizeStyle 处理
  return ''
})

// 3. 尺寸样式：仅处理自定义尺寸（数字或带单位的字符串）
const sizeStyle = computed(() => {
  const s = props.size

  // 如果 sizeClass 有值（标准或兼容尺寸），返回空对象
  if (s === 's' || s === 'm' || s === 'l') return {}
  if (typeof s === 'string' && SIZE_SCALE_KEYS.includes(s as SizeScaleKey)) return {}

  // 自定义尺寸：数字或字符串
  if (typeof s === 'number') {
    return { fontSize: `${s}px` }
  }
  if (typeof s === 'string' && !Number.isNaN(Number(s))) {
    return { fontSize: `${s}px` }
  }
  if (typeof s === 'string') {
    return { fontSize: s }
  }

  return {}
})

// 4. 动态样式：处理颜色、旋转、缩放等（不包含 fontSize）
const style = computed(() => {
  const css: Record<string, string> = {}

  if (props.color) {
    css.color = props.color
  }

  const transforms: string[] = []
  if (props.rotate !== undefined && props.rotate !== '') {
    transforms.push(`rotate(${props.rotate}deg)`)
  }
  if (props.scale !== undefined) {
    transforms.push(`scale(${props.scale})`)
  }
  if (transforms.length) {
    css.transform = transforms.join(' ')
  }

  return css
})

// 5. 功能类名：动画、翻转等
const functionalClasses = computed(() => {
  const cls: string[] = []

  // 动画
  if (props.animation === 'spin') cls.push('animate-spin')
  if (props.animation === 'pulse') cls.push('animate-pulse')
  if (props.animation === 'spin-pulse') {
    cls.push('animate-spin', 'animate-pulse')
  }

  // 翻转
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
    class="inline-block align-middle bg-current mask-icon"
    role="img"
    :aria-label="label"
    :title="title"
    :aria-hidden="!label"
  />
</template>

<style scoped>
/* UnoCSS 图标本质是 mask-image (对于彩色图标可能是 background-image)
   preset-icons 默认会处理好 display 和 size。
   我们显式设置 inline-block 和 vertical-align 以对齐文本。

   尺寸控制：
   - 标准尺寸和兼容尺寸通过 fs-* 类名控制（联动 SizeStore）
   - 自定义尺寸通过内联样式 fontSize 控制
*/
</style>
