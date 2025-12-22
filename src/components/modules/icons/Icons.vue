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
})

/**
 * 判断是否为 UnoCSS 自定义图标
 */
const isCustomIcon = computed(() => props.name.startsWith('i-'))

/**
 * UnoCSS 自定义图标相关属性
 */
const customIconAttrs = computed(() => {
  if (!isCustomIcon.value) {
    return null
  }

  const sizeClass = getCustomIconSizeClass(props.size)
  const sizeStyle = getCustomIconSizeStyle(props.size)
  const scaleStyle = props.scale !== undefined ? { transform: `scale(${props.scale})` } : undefined

  return {
    class: sizeClass,
    style: sizeStyle || scaleStyle ? { ...sizeStyle, ...scaleStyle } : undefined,
  }
})

/**
 * OhVueIcon 相关属性
 */
const ohVueIconAttrs = computed(() => {
  if (isCustomIcon.value) {
    return null
  }

  const sizeClass = getOhVueIconSizeClass(props.size)
  const sizeStyle = getOhVueIconSizeStyle(props.size)
  const scaleStyle = props.scale !== undefined ? { transform: `scale(${props.scale})` } : undefined

  return {
    name: toIconName(props.name),
    size: getOhVueIconSizeProp(props.size),
    class: sizeClass,
    style: sizeStyle || scaleStyle ? { ...sizeStyle, ...scaleStyle } : undefined,
  }
})
</script>

<template lang="pug">
// UnoCSS 自定义图标
div(
  v-if='isCustomIcon',
  :class='[props.name, ...(customIconAttrs?.class ?? [])]',
  :style='customIconAttrs?.style',
  :aria-label='label',
  :title='title'
)

// OhVueIcon 图标
OhVueIcon(
  v-else,
  :name='ohVueIconAttrs?.name',
  :size='ohVueIconAttrs?.size',
  :color='color',
  :animation='animation',
  :speed='speed',
  :hover='hover',
  :flip='flip',
  :rotate='rotate',
  :inverse='inverse',
  :label='label',
  :title='title',
  :class='ohVueIconAttrs?.class',
  :style='ohVueIconAttrs?.style'
)
</template>

<style lang="scss" scoped></style>
