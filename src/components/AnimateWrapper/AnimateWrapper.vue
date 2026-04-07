<script setup lang="ts">
import { defaultAnimateConfig } from './utils/constants'
import type { AnimateName, AnimateWrapperProps } from './utils/types'

defineOptions({
  name: 'AnimateWrapper',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AnimateWrapperProps>(), {
  ...defaultAnimateConfig,
})

/** 构造动画类（根据 animate.css 规范生成类名） */
const buildClass = (name?: AnimateName) => {
  if (!name) {
    return ''
  }

  const classes: string[] = ['animate__animated', `animate__${name}`]

  if (props.speed) {
    classes.push(`animate__${props.speed}`)
  }

  // 次数循环：1 表示不额外添加 repeat 类
  if (props.repeat && props.repeat !== 1 && props.repeat !== 'infinite') {
    classes.push(`animate__repeat-${props.repeat}`)
  }

  // 无限循环使用 animate.css 官方类名
  if (props.repeat === 'infinite') {
    classes.push('animate__infinite')
  }

  return classes.join(' ')
}

const enterClass = computed(() => buildClass(props.enter))
const leaveClass = computed(() => buildClass(props.leave))

/** 基础 CSS 变量：仅负责时长，延迟按阶段分别设置 */
const styleVars = computed(() => ({
  '--animate-duration': props.duration,
}))

/** 设置当前元素的动画延迟（统一函数） */
const setElementDelay = (el: Element, delay: string | undefined) => {
  const element = el as HTMLElement
  if (delay) {
    element.style.setProperty('--animate-delay', delay)
  } else {
    element.style.setProperty('--animate-delay', '0s')
  }
}

/** 列表模式下按子元素 index 叠加（实际为覆盖）队列延迟 */
const applyGroupStaggerDelay = (el: Element): void => {
  if (!props.group || props.stagger === undefined) return

  const parent = el.parentNode
  if (!parent) return

  const children = Array.from(parent.children)
  const index = children.indexOf(el)
  if (index < 0) return

  const extraDelay = index * props.stagger
  ;(el as HTMLElement).style.setProperty('--animate-delay', `${extraDelay}ms`)
}

/** 队列延迟：进入阶段（enter/appear） */
const handleBeforeEnter = (el: Element) => {
  // 先设置进入阶段的基础延迟（优先 enterDelay，其次 delay）
  setElementDelay(el, props.enterDelay || props.delay)

  // 列表模式下应用队列延迟（覆盖语义：index*stagger 将写入 --animate-delay）
  applyGroupStaggerDelay(el)
}

/** 离开阶段延迟：使用 leaveDelay 优先，其次 delay */
const handleBeforeLeave = (el: Element) => {
  setElementDelay(el, props.leaveDelay || props.delay)

  // 列表模式下也应用队列延迟（修复：离开阶段之前未实现 stagger 错位）
  applyGroupStaggerDelay(el)
}
</script>

<template>
  <Transition
    v-if="!group"
    :enter-active-class="enterClass"
    :leave-active-class="leaveClass"
    :style="styleVars"
    :appear="appear"
    @before-enter="handleBeforeEnter"
    @before-leave="handleBeforeLeave"
  >
    <div
      v-if="show"
      :class="omitLayoutFull ? '' : 'layout-full'"
      v-bind="$attrs"
    >
      <slot />
    </div>
  </Transition>
  <TransitionGroup
    v-else
    tag="div"
    v-bind="$attrs"
    :enter-active-class="enterClass"
    :leave-active-class="leaveClass"
    :style="styleVars"
    :appear="appear"
    @before-enter="handleBeforeEnter"
    @before-leave="handleBeforeLeave"
  >
    <slot />
  </TransitionGroup>
</template>

<style>
.animate__animated {
  animation-duration: var(--animate-duration, 1s);
  animation-delay: var(--animate-delay, 0s);
}
</style>
