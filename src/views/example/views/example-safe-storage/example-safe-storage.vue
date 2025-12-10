<script setup lang="ts">
import {
  decompressAndDecrypt,
  decompressAndDecryptSync,
  encryptAndCompress,
  encryptAndCompressSync,
} from '@/utils/modules/safeStorage'
import { Textarea } from 'primevue'
import { ref, watch } from 'vue'

// 异步版本示例
const inputText = ref<string>('')
const encrypted = ref<string>('')
const decrypted = ref<string | null>(null)
let taskId = 0

watch(
  inputText,
  async val => {
    const id = ++taskId
    if (!val) {
      encrypted.value = ''
      decrypted.value = ''
      return
    }
    const enc = await encryptAndCompress(val)
    if (id !== taskId) {
      return
    }
    encrypted.value = enc
    const dec = await decompressAndDecrypt<string>(enc)
    if (id !== taskId) {
      return
    }
    decrypted.value = dec ?? ''
  },
  { immediate: true }
)

// 同步版本示例
const syncInputText = ref<string>('')
const syncEncrypted = ref<string>('')
const syncDecrypted = ref<string | null>(null)

const handleSyncEncrypt = () => {
  if (!syncInputText.value) {
    syncEncrypted.value = ''
    syncDecrypted.value = null
    return
  }
  // 同步加密
  syncEncrypted.value = encryptAndCompressSync(syncInputText.value)
  // 同步解密
  syncDecrypted.value = decompressAndDecryptSync<string>(syncEncrypted.value)
}

watch(syncInputText, handleSyncEncrypt, { immediate: true })
</script>
<template lang="pug">
.grid.grid-cols-1.gap-gapl(class='xl:grid-cols-2')
  // 异步版本示例
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center encryptAndCompress / decompressAndDecrypt (异步)
    p.color-text200.fs-appFontSizes 异步版本，适合大数据量，不阻塞主线程
    .between-col.gap-gap.w-full
      Textarea.w-full(
        :model-value='inputText',
        @update:model-value='val => (inputText = val || "")',
        placeholder='输入内容，实时异步压缩加密...',
        rows='8',
        auto-resize
      )
      .between-col.gap-gaps.mt-gap
        .fw-bold 原始内容:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ inputText || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 加密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ encrypted || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 解密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ decrypted || '（空）' }}

  // 同步版本示例
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center encryptAndCompressSync / decompressAndDecryptSync (同步)
    p.color-text200.fs-appFontSizes 同步版本，适合小数据量，立即返回结果
    .between-col.gap-gap.w-full
      Textarea.w-full(
        :model-value='syncInputText',
        @update:model-value='val => (syncInputText = val || "")',
        placeholder='输入内容，实时同步压缩加密...',
        rows='8',
        auto-resize
      )
      .between-col.gap-gaps.mt-gap
        .fw-bold 原始内容:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ syncInputText || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 加密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ syncEncrypted || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 解密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ syncDecrypted || '（空）' }}

  // API 说明
  .full.c-card.p-padding.rounded-rounded.between-col.center-start(class='xl:col-span-2')
    .center API 说明
    p.color-text200 SafeStorage 方法使用说明
    .between-col.gap-gaps.w-full.mt-gap
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code encryptAndCompress(value, secret?)
          |
          | - 异步加密压缩（推荐用于大数据）
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code decompressAndDecrypt(encrypted, secret?)
          |
          | - 异步解密解压
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code encryptAndCompressSync(value, secret?)
          |
          | - 同步加密压缩（适合小数据）
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code decompressAndDecryptSync(encrypted, secret?)
          |
          | - 同步解密解压
      .between.gap-gaps
        .i-carbon-checkmark
        span 流程：JSON.stringify → LZ 压缩 → AES 加密
      .between.gap-gaps
        .i-carbon-checkmark
        span 支持任意类型数据（对象、数组、字符串等）
</template>
