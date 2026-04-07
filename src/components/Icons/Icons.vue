<script setup lang="ts">
import type { IconsProps } from './utils/types'
import { toIconName } from './utils/helper'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'
import type { SizeScaleKey } from '@/constants/sizeScale'

const SIZE_CLASS_MAP: Record<SizeScaleKey, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-md',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
}

const ALLOWED_SIZE_UNIT_PATTERN = /^-?\d+(\.\d+)?(px|%|vw|vh)$/
const CSS_VAR_PATTERN = /^var\(--[a-zA-Z0-9-_]+\)$/
const UNO_TEXT_COLOR_CLASS_PATTERN = /^!?text-[a-zA-Z0-9_:/.[\]-]+$/
const HARDCODED_COLOR_PATTERN = /^#|^rgb\(|^rgba\(|^hsl\(|^hsla\(/i
const warnedMessages = new Set<string>()

function warnDev(message: string): void {
  if (!import.meta.env.DEV) return
  if (warnedMessages.has(message)) return
  warnedMessages.add(message)
  console.warn(`[Icons] ${message}`)
}

function isSizeScaleKey(value: string): value is SizeScaleKey {
  return (SIZE_SCALE_KEYS as readonly string[]).includes(value)
}

function isAllowedSizeString(value: string): boolean {
  return ALLOWED_SIZE_UNIT_PATTERN.test(value) || CSS_VAR_PATTERN.test(value)
}

/**
 * Icons 组件 (UnoCSS preset-icons)
 * 尺寸：标准阶梯 xs～5xl 通过 text-* 联动 SizeStore；数字/字符串通过内联样式。
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

// 1. 图标名称 → UnoCSS 类名（custom 集合保留冒号 i-custom:name，其余集合 : 转 -）
const iconClass = computed(() => {
  const n = props.name
  if (n.startsWith('i-')) return n
  if (n.includes(':')) {
    return n.startsWith('custom:') ? `i-${n}` : `i-${n.replace(':', '-')}`
  }
  if (n.includes('-')) return `i-${n}`
  return `i-lucide-${toIconName(n)}`
})

// 2. 尺寸类名：仅标准阶梯（xs～5xl）使用 text-*
const sizeClass = computed(() => {
  const s = props.size
  if (typeof s === 'string' && isSizeScaleKey(s)) {
    return SIZE_CLASS_MAP[s]
  }
  return ''
})

// 3. 尺寸样式：仅数字或带单位字符串
const sizeStyle = computed(() => {
  const s = props.size
  if (typeof s === 'string' && isSizeScaleKey(s)) {
    return {}
  }
  // 数字或纯数字字符串统一按 px 处理，避免 rem/em 心智负担
  if (typeof s === 'number') {
    const px = Math.round(s)
    return { fontSize: `${px}px` }
  }
  if (typeof s === 'string' && !Number.isNaN(Number(s))) {
    const numeric = Number(s)
    const px = Math.round(numeric)
    return { fontSize: `${px}px` }
  }
  if (typeof s === 'string') {
    if (isAllowedSizeString(s)) return { fontSize: s }
    warnDev(`Invalid size "${s}". Allowed units: px, %, vw, vh, var(--*).`)
  }
  return {}
})

// 4. 颜色、旋转、缩放
const colorClass = computed(() => {
  if (!props.color) return ''
  const colorValue = props.color.trim()
  if (UNO_TEXT_COLOR_CLASS_PATTERN.test(colorValue)) return colorValue
  return ''
})

const colorStyle = computed(() => {
  const css: Record<string, string> = {}
  if (!props.color) return css

  const colorValue = props.color.trim()
  if (colorClass.value) return css

  if (CSS_VAR_PATTERN.test(colorValue)) {
    css.color = colorValue
    return css
  }

  if (HARDCODED_COLOR_PATTERN.test(colorValue)) {
    warnDev(`Hardcoded color "${colorValue}" is forbidden. Use semantic tokens or text-* class.`)
    return css
  }

  warnDev(`Invalid color "${colorValue}". Use var(--*) or UnoCSS text-* color class.`)
  return css
})

const style = computed(() => {
  const css: Record<string, string> = { ...colorStyle.value }
  const transforms: string[] = []
  if (props.rotate !== undefined && props.rotate !== '') {
    transforms.push(`rotate(${props.rotate}deg)`)
  }
  if (props.scale !== undefined) transforms.push(`scale(${props.scale})`)
  if (transforms.length) css.transform = transforms.join(' ')
  return css
})

// 4b. 父级传入 text-current 时不追加 text-foreground，避免颜色冲突
const attrs = useAttrs()
function hasTextCurrent(cls: unknown): boolean {
  if (typeof cls === 'string') return cls.includes('text-current')
  if (Array.isArray(cls)) return cls.some(c => hasTextCurrent(c))
  if (cls && typeof cls === 'object') return Object.keys(cls).some(k => k.includes('text-current'))
  return false
}
const defaultColorClass = computed(() => {
  if (colorClass.value || colorStyle.value.color) return ''
  if (hasTextCurrent(attrs.class)) return ''
  return 'text-foreground'
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
    :class="[iconClass, functionalClasses, sizeClass, colorClass, defaultColorClass]"
    :style="{ ...style, ...sizeStyle }"
    class="inline-block align-middle text-inherit"
    role="img"
    :aria-label="props.label"
    :title="props.title"
    :aria-hidden="!props.label"
  />
</template>
