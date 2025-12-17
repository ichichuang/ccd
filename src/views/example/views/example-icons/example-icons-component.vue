<script setup lang="ts">
import { ref } from 'vue'

// 动态图标示例
const iconName1 = ref('i-custom:juejin')
const iconName2 = ref('FcVlc')

// 模拟动态加载图标
setTimeout(() => {
  iconName1.value = 'i-language:chinese'
  iconName2.value = 'FcVip'
}, 3000)

const goToLink = () => {
  window.open('https://oh-vue-icons.js.org/', '_blank')
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 基础使用
    .color-text200.fs-appFontSizes
      Button(label='Oh, Vue Icons!', variant='link', @click='goToLink')
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin')
        .icon-label i-custom:juejin
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='FcGenealogy')
        .icon-label FcGenealogy
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='ri-home-line')
        .icon-label ri-home-line
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons.text-primaryColor(name='FcAlarmClock')
        .icon-label FcAlarmClock

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 固定尺寸 (s/m/l)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', size='s')
        .icon-label size="s"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', size='m')
        .icon-label size="m"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', size='l')
        .icon-label size="l"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin')
        .icon-label 默认尺寸

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 数字类型 (:size="100")
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', :size='24')
        .icon-label :size="24"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', :size='48')
        .icon-label :size="48"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', :size='100')
        .icon-label :size="100"

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 字符串类型 (size="100%"/"100vw"/"100vh"/"100px")
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', size='100%')
        .icon-label size="100%"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', size='8vw')
        .icon-label size="8vw"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', size='10vh')
        .icon-label size="10vh"
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(name='i-custom:juejin', size='80px')
        .icon-label size="80px"

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 颜色属性 (color)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons.color-primary100(name='i-custom:juejin')
        .icon-label color-primary100
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons.color-accent100(name='i-custom:juejin')
        .icon-label color-accent100
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons.color-primary100(name='RiAliensFill')
        .icon-label color-primary100
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons.color-accent100(name='RiAliensFill')
        .icon-label color-accent100

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 动画属性 (animation & speed)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col
        Icons(name='FcVip', :size='"l"', animation='spin', speed='slow')
        .icon-label animation="spin" speed="slow"
      .c-card-primary.between-col
        Icons(name='FcVip', :size='"l"', animation='spin-pulse', speed='fast')
        .icon-label animation="spin-pulse" speed="fast"
      .c-card-primary.between-col
        Icons(name='FcVip', :size='"l"', animation='wrench')
        .icon-label animation="wrench"
      .c-card-primary.between-col
        Icons(name='FcVip', :size='"l"', animation='ring')
        .icon-label animation="ring"
      .c-card-primary.between-col
        Icons(name='FcVip', :size='"l"', animation='pulse')
        .icon-label animation="pulse"
      .c-card-primary.between-col
        Icons(name='FcVip', :size='"l"', animation='flash')
        .icon-label animation="flash"
      .c-card-primary.between-col
        Icons(name='FcVip', :size='"l"', animation='float')
        .icon-label animation="float"

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 悬停效果 (hover)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col
        Icons(name='FcVlc', hover, animation='float', size='l')
        .icon-label hover + animation='float'

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 缩放 (scale)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col
        Icons(name='FcVip', size='l', :scale='0.5')
        .icon-label scale="0.5"
      .c-card-primary.between-col
        Icons(name='FcVip', size='l', :scale='1')
        .icon-label scale="1"
      .c-card-primary.between-col
        Icons(name='FcVip', size='l', :scale='1.5')
        .icon-label scale="1.5"
      .c-card-primary.between-col
        Icons(name='FcVip', size='l', :scale='2')
        .icon-label scale="2"

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 翻转 (flip)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l')
        .icon-label 原始
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l', flip='horizontal')
        .icon-label flip="horizontal"
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l', flip='vertical')
        .icon-label flip="vertical"
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l', flip='both')
        .icon-label flip="both"

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 旋转 (rotate)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l')
        .icon-label 0°
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l', :rotate='90')
        .icon-label rotate="90"
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l', :rotate='180')
        .icon-label rotate="180"
      .c-card-primary.between-col
        Icons(name='ri-arrow-right-line', size='l', :rotate='270')
        .icon-label rotate="270"

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 反色 (inverse)
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col.bg-primary100
        Icons(name='ri-heart-fill', size='l', color='#ff0000')
        .icon-label 正常
      .c-card-primary.between-col.bg-primary100
        Icons(name='ri-heart-fill', size='l', color='#ff0000', inverse)
        .icon-label inverse

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 动态加载
    .between-start.flex-wrap.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(:name='iconName1')
        .icon-label 动态: {{ iconName1 }}
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        Icons(:name='iconName2')
        .icon-label 动态: {{ iconName2 }}
</template>

<style lang="scss" scoped>
.icon-label {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  text-align: center;
  word-break: break-all;
  margin-top: 0.5rem;
}
</style>
