<script setup lang="ts">
import { computed } from 'vue'
import { defaultAnimateConfig } from './utils/constants'
import type { AnimateName, AnimateWrapperProps } from './utils/types'

const props = withDefaults(defineProps<AnimateWrapperProps>(), {
  ...defaultAnimateConfig,
})

/** 构造动画类 */
const buildClass = (name?: AnimateName) => {
  if (!name) {
    return ''
  }
  return [
    'animate__animated',
    `animate__${name}`,
    props.speed ? `animate__${props.speed}` : '',
    props.repeat && props.repeat !== 1 ? `animate__repeat-${props.repeat}` : '',
    props.repeat === 'infinite' ? 'animate__infinite' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

const enterClass = computed(() => buildClass(props.enter))
const leaveClass = computed(() => buildClass(props.leave))

/** CSS 变量 */
const styleVars = computed(() => ({
  '--animate-duration': props.duration,
  '--animate-delay': props.enterDelay || props.delay,
}))

/** 队列延迟 */
const handleBeforeEnter = (el: Element) => {
  if (props.group && props.stagger) {
    const parent = el.parentNode
    if (parent) {
      const children = Array.from(parent.children)
      const index = children.indexOf(el)
      const delay = index * props.stagger
      ;(el as HTMLElement).style.setProperty('--animate-delay', `${delay}ms`)
    }
  }
}
</script>

<template lang="pug">
Transition(
  v-if='!group',
  :enter-active-class='enterClass',
  :leave-active-class='leaveClass',
  :style='styleVars',
  :appear='appear',
  @before-enter='handleBeforeEnter'
)
  .full.center(v-if='show')
    slot
TransitionGroup(
  v-else,
  tag='div',
  :enter-active-class='enterClass',
  :leave-active-class='leaveClass',
  :style='styleVars',
  :appear='appear',
  @before-enter='handleBeforeEnter'
)
  slot
</template>

<style>
.animate__animated {
  animation-duration: var(--animate-duration, 1s);
  animation-delay: var(--animate-delay, 0s);
}
</style>

<!--
animation：动画类型（fade、slide、zoom、bounce…）

direction：方向（left、right、up、down）

duration：时长（毫秒）

delay：延迟（毫秒）

repeat：次数或 'infinite'

easing：缓动函数

play：是否播放（可配合 v-if 控制进入/离开）

事件：@start、@end
-->

<!--
# Props 配置

| 属性       | 类型            | 默认值          | 说明                                 |
| ---------- | --------------- | --------------- | ------------------------------------ |
| `show`     | `boolean`       | -               | **必需** 是否显示元素                |
| `enter`    | `AnimateName`   | `'fadeInUp'`    | 进入动画名称                         |
| `leave`    | `AnimateName`   | `'fadeOutDown'` | 离开动画名称                         |
| `duration` | `string`        | `'800ms'`       | 动画时长                             |
| `delay`    | `string`        | `'0s'`          | 动画延迟                             |
| `speed`    | `AnimateSpeed`  | `'fast'`        | 动画速度                             |
| `repeat`   | `AnimateRepeat` | `1`             | 循环次数                             |
| `appear`   | `boolean`       | `true`          | 是否初次渲染时执行动画               |
| `group`    | `boolean`       | `false`         | 是否列表模式                         |
| `stagger`  | `number`        | `120`           | 队列延迟（ms，仅 group=true 时生效） |

## 动画名称

### 基础动画

- `bounce` - 弹跳
- `flash` - 闪烁
- `pulse` - 脉冲
- `rubberBand` - 橡皮筋
- `shakeX` - 水平摇晃
- `shakeY` - 垂直摇晃
- `headShake` - 摇头
- `swing` - 摇摆
- `tada` - 欢呼
- `wobble` - 摇摆
- `jello` - 果冻
- `heartBeat` - 心跳

### 进入动画

- `fadeIn` - 淡入
- `fadeInDown` - 从下方淡入
- `fadeInUp` - 从上方淡入
- `fadeInLeft` - 从左侧淡入
- `fadeInRight` - 从右侧淡入
- `zoomIn` - 缩放进入
- `zoomInDown` - 从下方缩放进入
- `zoomInUp` - 从上方缩放进入
- `slideInUp` - 从下方滑入
- `slideInDown` - 从上方滑入
- `slideInLeft` - 从左侧滑入
- `slideInRight` - 从右侧滑入
- `bounceIn` - 弹跳进入
- `bounceInDown` - 从下方弹跳进入
- `bounceInUp` - 从上方弹跳进入
- `rotateIn` - 旋转进入
- `flipInX` - X轴翻转进入
- `flipInY` - Y轴翻转进入

### 离开动画

- `fadeOut` - 淡出
- `fadeOutDown` - 向下方淡出
- `fadeOutUp` - 向上方淡出
- `fadeOutLeft` - 向左侧淡出
- `fadeOutRight` - 向右侧淡出
- `zoomOut` - 缩放离开
- `zoomOutDown` - 向下方缩放离开
- `zoomOutUp` - 向上方缩放离开
- `slideOutUp` - 向上方滑出
- `slideOutDown` - 向下方滑出
- `slideOutLeft` - 向左侧滑出
- `slideOutRight` - 向右侧滑出
- `bounceOut` - 弹跳离开
- `bounceOutDown` - 向下方弹跳离开
- `bounceOutUp` - 向上方弹跳离开
- `rotateOut` - 旋转离开
- `flipOutX` - X轴翻转离开
- `flipOutY` - Y轴翻转离开

## 动画速度

- `''` - 默认速度
- `'slower'` - 较慢
- `'slow'` - 慢
- `'fast'` - 快
- `'faster'` - 较快

## 循环次数

- `1` - 执行一次
- `2` - 执行两次
- `3` - 执行三次
- `'infinite'` - 无限循环
-->
