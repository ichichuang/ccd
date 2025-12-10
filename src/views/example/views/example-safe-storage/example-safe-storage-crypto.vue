<script setup lang="ts">
import crypto from '@/utils/modules/safeStorage/crypto'
import { computed, ref, watch } from 'vue'

// 输入文本
const inputText = ref<string>('这是一段需要加密的敏感信息')

// 密钥
const secret = ref<string>('app-crypto-secret-key')

// 同步加密结果
const encryptedSync = computed(() => {
  if (!inputText.value || !secret.value) {
    return ''
  }
  try {
    return crypto.encryptSync(inputText.value, secret.value)
  } catch {
    return ''
  }
})

const decryptedSync = computed(() => {
  if (!encryptedSync.value || !secret.value) {
    return null
  }
  try {
    return crypto.decryptSync(encryptedSync.value, secret.value)
  } catch {
    return null
  }
})

// 异步加密结果
const encryptedAsync = ref<string>('')
const decryptedAsync = ref<string | null>(null)
let taskId = 0

watch(
  [inputText, secret],
  async ([text, sec]) => {
    const id = ++taskId
    if (!text || !sec) {
      encryptedAsync.value = ''
      decryptedAsync.value = null
      return
    }
    try {
      const enc = await crypto.encrypt(text, sec)
      if (id !== taskId) {
        return
      }
      encryptedAsync.value = enc
      const dec = await crypto.decrypt(enc, sec)
      if (id !== taskId) {
        return
      }
      decryptedAsync.value = dec
    } catch {
      if (id === taskId) {
        encryptedAsync.value = ''
        decryptedAsync.value = null
      }
    }
  },
  { immediate: true }
)

// 生成密钥
const generatedSecret = ref<string>('')
const generateNewSecret = () => {
  try {
    generatedSecret.value = crypto.generateSecret(32)
  } catch (error) {
    console.error('生成密钥失败:', error)
  }
}
</script>
<template lang="pug">
.grid.grid-cols-1.gap-gapl(class='xl:grid-cols-2')
  // 输入区域
  .full.c-card.p-padding.rounded-rounded.between-col.center-start(class='xl:col-span-2')
    .center 输入内容
    p.color-text200.fs-appFontSizes 输入后自动展示同步/异步加密解密结果（不存储）
    .between-col.gap-gap.w-full
      Textarea.w-full(
        :model-value='inputText',
        @update:model-value='val => (inputText = val || "")',
        placeholder='输入要加密的文本...',
        rows='8',
        auto-resize
      )
      InputText.w-full(
        :model-value='secret',
        @update:model-value='val => (secret = val || "")',
        placeholder='输入密钥（建议 ≥16 字符）...'
      )
      .between.gap-gap
        Button(label='生成随机密钥', severity='info', outlined, @click='generateNewSecret')
        InputText.w-full(
          v-if='generatedSecret',
          :model-value='generatedSecret',
          readonly,
          placeholder='生成的密钥将显示在这里...'
        )

  // 同步版本示例
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center encryptSync / decryptSync (同步)
    p.color-text200.fs-appFontSizes 同步版本，适合小数据量，立即返回结果
    .between-col.gap-gap.w-full
      .between-col.gap-gaps.mt-gap
        .fw-bold 原始内容:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ inputText || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 加密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ encryptedSync || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 解密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ decryptedSync ?? '（空）' }}

  // 异步版本示例
  .full.c-card.p-padding.rounded-rounded.between-col.center-start
    .center encrypt / decrypt (异步)
    p.color-text200.fs-appFontSizes 异步版本，适合大数据量，不阻塞主线程
    .between-col.gap-gap.w-full
      .between-col.gap-gaps.mt-gap
        .fw-bold 原始内容:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ inputText || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 加密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ encryptedAsync || '（空）' }}
      .between-col.gap-gaps
        .fw-bold 解密后的数据:
        pre.whitespace-pre-wrap.break-all.c-card.bg-bg300.p-paddings.overflow-auto {{ decryptedAsync ?? '（空）' }}

  // API 说明
  .full.c-card.p-padding.rounded-rounded.between-col.center-start(class='xl:col-span-2')
    .center API 说明
    p.color-text200 Crypto 方法使用说明
    .between-col.gap-gaps.w-full.mt-gap
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code encrypt(plain, secret)
          |
          | - 异步加密（推荐用于大数据）
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code decrypt(encrypted, secret)
          |
          | - 异步解密
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code encryptSync(plain, secret)
          |
          | - 同步加密（适合小数据）
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code decryptSync(encrypted, secret)
          |
          | - 同步解密
      .between.gap-gaps
        .i-carbon-checkmark
        span
          code generateSecret(length?)
          |
          | - 生成安全随机密钥（默认 32 字节）
      .between.gap-gaps
        .i-carbon-checkmark
        span 使用 AES-CBC 模式，随机 IV，最高安全性
      .between.gap-gaps
        .i-carbon-checkmark
        span 异步版本返回格式：IV(Base64):密文(Base64)
      .between.gap-gaps
        .i-carbon-checkmark
        span 同步版本返回 OpenSSL 格式（兼容性更好）
</template>
