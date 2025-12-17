<script setup lang="ts">
import { computed } from 'vue'
import {
  getCustomIconSizeClass,
  getCustomIconSizeStyle,
  getOhVueIconSizeClass,
  getOhVueIconSizeProp,
  getOhVueIconSizeStyle,
  toIconName,
} from './utils/helper'
import type { IconsProps } from './utils/types'

const props = withDefaults(defineProps<IconsProps>(), {
  size: undefined,
  color: undefined,
  animation: undefined,
  speed: undefined,
  hover: false,
  scale: undefined,
  flip: undefined,
  rotate: undefined,
  inverse: false,
  label: undefined,
  title: undefined,
  class: undefined,
})

/**
 * 判断是否为 UnoCSS 自定义图标
 */
const isCustomIcon = computed(() => props.name.startsWith('i-'))

/**
 * 转换后的图标名称（用于 OhVueIcon）
 */
const iconName = computed(() => {
  if (isCustomIcon.value) {
    return props.name
  }
  return toIconName(props.name)
})

/**
 * 合并的类名
 */
const mergedClass = computed(() => {
  const classes: string[] = []

  // 添加用户自定义类名
  if (typeof props.class === 'string') {
    classes.push(props.class)
  } else if (Array.isArray(props.class)) {
    classes.push(...props.class)
  }

  // 添加尺寸相关类名
  if (isCustomIcon.value) {
    classes.push(...getCustomIconSizeClass(props.size))
  } else {
    classes.push(...getOhVueIconSizeClass(props.size))
  }

  return classes
})

/**
 * 自定义图标的样式
 */
const customIconStyle = computed(() => {
  if (!isCustomIcon.value) {
    return undefined
  }
  const sizeStyle = getCustomIconSizeStyle(props.size)
  const scaleStyle = props.scale !== undefined ? { transform: `scale(${props.scale})` } : undefined

  if (!sizeStyle && !scaleStyle) {
    return undefined
  }

  return {
    ...sizeStyle,
    ...scaleStyle,
  }
})

/**
 * OhVueIcon 的样式
 */
const ohVueIconStyle = computed(() => {
  if (isCustomIcon.value) {
    return undefined
  }
  const sizeStyle = getOhVueIconSizeStyle(props.size)
  const scaleStyle = props.scale !== undefined ? { transform: `scale(${props.scale})` } : undefined

  if (!sizeStyle && !scaleStyle) {
    return undefined
  }

  return {
    ...sizeStyle,
    ...scaleStyle,
  }
})

/**
 * OhVueIcon 的 size prop
 */
const ohVueIconSize = computed(() => {
  if (isCustomIcon.value) {
    return undefined
  }
  return getOhVueIconSizeProp(props.size)
})
</script>

<template lang="pug">
// UnoCSS 自定义图标
div(
  v-if='isCustomIcon',
  :class='[iconName, ...mergedClass]',
  :style='customIconStyle',
  :aria-label='label',
  :title='title'
)

// OhVueIcon 图标
OhVueIcon(
  v-else,
  :name='iconName',
  :size='ohVueIconSize',
  :color='color',
  :animation='animation',
  :speed='speed',
  :hover='hover',
  :flip='flip',
  :rotate='rotate',
  :inverse='inverse',
  :label='label',
  :title='title',
  :class='mergedClass',
  :style='ohVueIconStyle'
)
</template>

<style lang="scss" scoped></style>
