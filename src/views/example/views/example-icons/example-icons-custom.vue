<script setup lang="ts">
import { computed, ref } from 'vue'

// 动态图标示例
const iconSet = ref('custom')
const iconName = ref('')

// 模拟动态加载图标
setTimeout(() => {
  iconName.value = 'juejin'
}, 1000)

// 计算动态图标类名
const dynamicIconClass = computed(() => `i-${iconSet.value}:${iconName.value}`)
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 基础使用
    .between-start.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizel(class='i-custom:juejin')
        .icon-label i-custom:juejin
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizel(class='i-language:chinese')
        .icon-label i-language:chinese
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizel(class='i-language:english')
        .icon-label i-language:english

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 带颜色的图标
    .between-start.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        #1E80FF.fs-appFontSizel.text-(class='i-custom:juejin')
        .icon-label 掘金蓝
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizel.text-red-500(class='i-language:chinese')
        .icon-label 中文红
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizel.text-blue-500(class='i-language:english')
        .icon-label 英文蓝

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 不同尺寸
    .between-start.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizes(class='i-custom:juejin')
        .icon-label fs-appFontSizes
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSize(class='i-custom:juejin')
        .icon-label fs-appFontSize
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizex(class='i-custom:juejin')
        .icon-label fs-appFontSizex
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizel(class='i-custom:juejin')
        .icon-label fs-appFontSizel

  .between-col.justify-start.gap-gaps
    b.fs-appFontSizex 动态加载
    .between-start.gap-gap
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .fs-appFontSizel(:class='dynamicIconClass')
        .icon-label 动态加载: i-{{ iconSet }}:{{ iconName }}
      .c-card-primary.between-col(class='hover:transform-translate-y-[calc(0px-var(--gaps))]')
        .color-primaryColor.fs-appFontSizel(:class='dynamicIconClass')
        .icon-label 动态加载 + 样式
</template>
