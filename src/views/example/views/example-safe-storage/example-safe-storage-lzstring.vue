<script setup lang="ts">
import lzstring from '@/utils/modules/safeStorage/lzstring'
import { computed, ref } from 'vue'

// 输入文本
const inputText = ref<string>('这是一段需要压缩的文本内容，可以包含中文、英文、数字和特殊字符！')

// 压缩结果（UTF-16）
const compressed = computed(() => {
  if (!inputText.value) {
    return ''
  }
  return lzstring.compress(inputText.value)
})

// 解压结果（UTF-16）
const decompressed = computed(() => {
  if (!compressed.value) {
    return null
  }
  return lzstring.decompress(compressed.value)
})

// 压缩结果（Base64）
const compressedBase64 = computed(() => {
  if (!inputText.value) {
    return ''
  }
  return lzstring.compressToBase64(inputText.value)
})

// 解压结果（Base64）
const decompressedBase64 = computed(() => {
  if (!compressedBase64.value) {
    return null
  }
  return lzstring.decompressFromBase64(compressedBase64.value)
})
</script>
<template lang="pug">
.grid.grid-cols-1.gap-gapl(class='xl:grid-cols-2')
  // 输入区域
  .full.c-card.p-padding.rounded-rounded.between-col.center-start(class='xl:col-span-2')
    .center 输入内容
    p.color-text200.fs-appFontSizes 输入后自动展示压缩/解压结果（不存储）
    Textarea.w-full(
      :model-value='inputText',
      @update:model-value='val => (inputText = val || "")',
      placeholder='输入要压缩的文本...',
      rows='8',
      auto-resize
    )

  // UTF-16 压缩示例
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center compress / decompress (UTF-16)
    p.color-text200.fs-appFontSizes UTF-16 格式，推荐用于 localStorage 存储（压缩比最高）
    .between-col.gap-gap.w-full
      .between-col.gap-gaps.mt-gap
        .fw-bold 原始内容:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ inputText || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 压缩后:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ compressed || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 解压后:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ decompressed ?? '（空）' }}

  // Base64 压缩示例
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center compressToBase64 / decompressFromBase64 (Base64)
    p.color-text200.fs-appFontSizes Base64 格式，适合 URL 传参或嵌入 HTML
    .between-col.gap-gap.w-full
      .between-col.gap-gaps.mt-gap
        .fw-bold 原始内容:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ inputText || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 压缩后:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ compressedBase64 || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 解压后:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ decompressedBase64 ?? '（空）' }}

  // API 说明
  .full.c-card.p-padding.rounded-rounded.between-col.center-start(class='xl:col-span-2')
    .center API 说明
    p.color-text200 LZString 方法使用说明
    .between-col.gap-gaps.w-full.mt-gap
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code compress(str)
          |
          | - 压缩为 UTF-16 格式（推荐用于 localStorage）
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code decompress(compressed)
          |
          | - 解压 UTF-16 格式
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code compressToBase64(str)
          |
          | - 压缩为 Base64 格式（适合 URL 传参）
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code decompressFromBase64(base64)
          |
          | - 解压 Base64 格式
      .between.gap-gaps
        .i-carbon-checkmark
        span 所有方法均为同步、零依赖、SSR 安全
      .between.gap-gaps
        .i-carbon-checkmark
        span 专为 localStorage / IndexedDB / URL 传参设计，压缩比极高
</template>
