<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { IconsProps } from './utils/types'
import { toIconName } from './utils/helper'
import { SIZE_SCALE_KEYS } from '@ccd/design-tokens'
import type { SizeScaleKey } from '@ccd/design-tokens'

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
const RGB_CHANNEL_CSS_VAR_PATTERN =
  /^var\(--(?:primary|primary-foreground|foreground|muted-foreground|info|success|warn|danger)\)$/
const SEMANTIC_TEXT_COLOR_CLASSES = new Set([
  'text-current',
  'text-primary',
  'text-primary-foreground',
  'text-foreground',
  'text-muted-foreground',
  'text-popover-foreground',
  'text-info',
  'text-success',
  'text-warn',
  'text-danger',
])
const HARDCODED_COLOR_PATTERN = /^#|^rgb\(|^rgba\(|^hsl\(|^hsla\(/i
const warnedMessages = new Set<string>()

function warnDev(message: string): void {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string } }
  }
  if (runtime.process?.env?.NODE_ENV === 'production') {
    return
  }
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
  if (SEMANTIC_TEXT_COLOR_CLASSES.has(colorValue)) return colorValue
  if (colorValue.startsWith('text-')) {
    warnDev(`Unsupported color class "${colorValue}". Use a generated semantic text-* class.`)
  }
  return ''
})

const colorStyle = computed(() => {
  const css: Record<string, string> = {}
  if (!props.color) return css

  const colorValue = props.color.trim()
  if (colorClass.value) return css

  if (CSS_VAR_PATTERN.test(colorValue)) {
    css.color = RGB_CHANNEL_CSS_VAR_PATTERN.test(colorValue) ? `rgb(${colorValue})` : colorValue
    return css
  }

  if (HARDCODED_COLOR_PATTERN.test(colorValue)) {
    warnDev(`Hardcoded color "${colorValue}" is forbidden. Use semantic tokens or text-* class.`)
    return css
  }

  warnDev(`Invalid color "${colorValue}". Use var(--*) or a generated semantic text-* color class.`)
  return css
})

const accessibleLabel = computed(() => props.label ?? props.title ?? undefined)

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

const attrs = useAttrs()
const PARENT_TEXT_COLOR_CLASS_PATTERN =
  /^(?:(?:group-)?hover|focus|focus-visible|active|data-\[state=(?:active|open|highlighted)\]):!?text-(?:current|primary|primary-foreground|foreground|muted-foreground|popover-foreground|info|success|warn|danger)(?:\/\d+)?!?$|^!?text-(?:current|primary|primary-foreground|foreground|muted-foreground|popover-foreground|info|success|warn|danger)(?:\/\d+)?!?$/

function hasTextColorClass(cls: unknown): boolean {
  if (typeof cls === 'string') {
    return cls.split(/\s+/).some(token => PARENT_TEXT_COLOR_CLASS_PATTERN.test(token))
  }
  if (Array.isArray(cls)) return cls.some(c => hasTextColorClass(c))
  if (cls && typeof cls === 'object')
    return Object.keys(cls).some(key => PARENT_TEXT_COLOR_CLASS_PATTERN.test(key))
  return false
}
const defaultColorClass = computed(() => {
  if (colorClass.value || colorStyle.value.color) return ''
  if (hasTextColorClass(attrs.class)) return ''
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
  <span
    :class="[iconClass, functionalClasses, sizeClass, colorClass, defaultColorClass]"
    :style="{ ...style, ...sizeStyle }"
    class="inline-block align-middle"
    :role="accessibleLabel ? 'img' : undefined"
    :aria-label="accessibleLabel"
    :title="props.title"
    :aria-hidden="!accessibleLabel"
  />
</template>
