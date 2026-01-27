<script setup lang="ts">
import { computed } from 'vue'

/**
 * Icons 组件 (UnoCSS 纯净版)
 * 兼容旧版 oh-vue-icons 的部分 API，底层全部使用 UnoCSS
 */
interface Props {
  /** 图标名称。无前缀时默认 Lucide，如 'home' → i-lucide-home；亦可 'ri-home-line'、'i-mdi:home' */
  name: string
  /** 尺寸 (s, m, l 或 24, '24px') */
  size?: string | number
  /** 颜色 (e.g. 'red', '#fff') */
  color?: string
  /** 旋转动画 */
  animation?: 'spin' | 'pulse' | 'spin-pulse'
  /** 翻转 */
  flip?: 'horizontal' | 'vertical' | 'both'
  /** 旋转角度 */
  rotate?: string | number
  /** 缩放比例 */
  scale?: number
  /** 无障碍标签 */
  label?: string
  /** 标题提示 */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'm',
  color: undefined,
  animation: undefined,
  flip: undefined,
  rotate: undefined,
  scale: undefined,
  label: undefined,
  title: undefined,
})

/** PascalCase / camelCase 转 kebab-case，供 Lucide 等使用 */
function toKebab(s: string): string {
  return s
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
}

// 1. 图标名称标准化
// - 已带 i- 或 : → 用户指定库，直接用
// - 含连字符 (ri-home-line) → 视为集合名，补 i-
// - 无前缀 (home / Home) → 默认 Lucide：i-lucide-xxx
const iconClass = computed(() => {
  const n = props.name
  if (n.startsWith('i-')) return n
  if (n.includes(':')) return `i-${n.replace(':', '-')}`
  if (n.includes('-')) return `i-${n}`
  return `i-lucide-${toKebab(n)}`
})

// 2. 尺寸映射
const sizeStyle = computed(() => {
  const s = props.size
  if (s === 's') return '12px'
  if (s === 'm') return '16px' // 默认基准
  if (s === 'l') return '24px'
  if (typeof s === 'number') return `${s}px`
  if (typeof s === 'string' && !Number.isNaN(Number(s))) return `${s}px`
  return s as string
})

// 3. 动态样式
const style = computed(() => {
  const css: Record<string, string> = {
    fontSize: sizeStyle.value,
  }
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

// 4. 功能类名
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
    :class="[iconClass, functionalClasses]"
    :style="style"
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
*/
</style>
