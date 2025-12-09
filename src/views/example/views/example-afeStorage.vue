<script setup lang="ts">
import { env } from '@/utils/modules/env'
import crypto from '@/utils/modules/safeStorage/crypto'
import lzstring from '@/utils/modules/safeStorage/lzstring'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { computed, ref, watch } from 'vue'

interface Profile {
  name: string
  age: number
  role: string
  tags: string[]
}

// 初始值
const initialProfile: Profile = {
  name: '张三',
  age: 28,
  role: '管理员',
  tags: ['VIP', 'Pro'],
}

// 使用普通 ref 存储数据（仅内存中，不存储到 localStorage）
const profile = ref<Profile>({ ...initialProfile })
const memo = ref<string>('')

// 加密后的密文（仅用于展示，不存储到 localStorage）
const encryptedProfile = ref('')
const encryptedMemo = ref('')

// 生成加密后的密文（仅用于展示）
const generateEncryptedTextSync = (value: unknown): string => {
  try {
    const json = JSON.stringify(value)
    if (!json || json === 'null' || json === 'undefined') {
      return ''
    }

    const compressed = lzstring.compress(json)
    if (!compressed) {
      return ''
    }

    const secret = env.appSecret
    const encrypted = crypto.encryptSync(compressed, secret)
    return encrypted || ''
  } catch {
    return ''
  }
}

const generateEncryptedTextAsync = async (value: unknown): Promise<string> => {
  try {
    const json = JSON.stringify(value)
    if (!json || json === 'null' || json === 'undefined') {
      return ''
    }

    const compressed = lzstring.compress(json)
    if (!compressed) {
      return ''
    }

    const secret = env.appSecret
    const encrypted = await crypto.encrypt(compressed, secret)
    return encrypted || ''
  } catch {
    return ''
  }
}

// 更新加密后的密文展示
const updateEncryptedTexts = async () => {
  encryptedProfile.value = await generateEncryptedTextAsync(profile.value)
  encryptedMemo.value = generateEncryptedTextSync(memo.value)
}

// 监听数据变化，自动更新加密后的密文展示
watch([profile, memo], updateEncryptedTexts, { deep: true, immediate: true })

// 操作方法
const randomProfile = () => {
  const names = ['李四', '王五', '赵六', '小明', '小红']
  profile.value = {
    name: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * 50) + 18,
    role: Math.random() > 0.5 ? '管理员' : '用户',
    tags: ['随机', '测试', new Date().toISOString().slice(0, 10)],
  }
}

const fillMemo = () => {
  memo.value = `这是一段自动填充的文本\n时间：${new Date().toLocaleString()}\n仅内存存储演示！`
}

const clearProfile = () => {
  profile.value = { ...initialProfile }
}

const clearMemo = () => {
  memo.value = ''
}

const clearAll = () => {
  clearProfile()
  clearMemo()
}

const fillAll = () => {
  randomProfile()
  fillMemo()
}

const profileName = computed<string | undefined>({
  get: () => profile.value.name,
  set: val => {
    profile.value = { ...profile.value, name: val ?? '' }
  },
})

const memoText = computed({
  get: () => memo.value ?? '',
  set: val => {
    memo.value = val ?? ''
  },
})
</script>
<template lang="pug">
.page-wrap.bg-bg100.color-primary100.p-gapx
  .content
    // 顶部信息区
    .hero-card
      .hero-head.between.items-start
        .between.items-center.gap-gaps
          .emoji.fs-appFontSizel 🔐
          .between-col.gap-gaps
            .fs-appFontSizex.font-bold.color-primary100 SafeStorage 加密演示
            .fs-appFontSize.color-text200 演示加密效果：对比查看加密后的密文和解密后的数据（仅展示，不存储）
        .pill.color-primary100.bg-bg200.fs-appFontSizes 仅展示 · 不存储 · 实时对比
      .hero-body.gap-gap
        .tag.fs-appFontSizes useSafeStorage(key, initialValue)
        .tag.fs-appFontSizes useSafeStorageSync(key, initialValue)
        .tag.fs-appFontSizes AES 加密 + LZ 压缩
        .tag.fs-appFontSizes 加密/解密实时对比

    // 主展示区
    .grid-layout.grid.gap-gapl(class='md:grid-cols-2 xl:grid-cols-3')
      // 基础使用 - 对象存储
      .panel
        .panel-head.between.items-center
          .between.items-center.gap-gaps
            .emoji.fs-appFontSizex 🧑‍💼
            .title.fs-appFontSizex.font-semibold.color-primary100 对象存储示例（加密）
          .fs-appFontSizes.color-text200 useSafeStorage(key, initialValue)

        .between-col.gap-gap
          InputText.input.w-full(v-model='profileName', placeholder='姓名（实时加密展示）')
          .between.gap-gap
            Button(label='-1 岁', severity='secondary', text, @click='profile.age--')
            .inline-flex.items-center.justify-center.px-paddingx.py-paddings.bg-bg200.rounded-rounded.font-mono.fs-appFontSize {{ profile.age }} 岁
            Button(label='+1 岁', severity='primary', text, @click='profile.age++')
          .between.gap-gap
            Button(label='重置 Profile', severity='danger', outlined, @click='clearProfile')
            Button(label='随机填充', severity='success', text, @click='randomProfile')

        .panel-body
          .between-col.gap-gaps
            .between-col.gap-gaps
              .fs-appFontSizes.color-text200.mb-gaps 🔓 解密后的数据（响应式）
              pre.code-block {{ JSON.stringify(profile, null, 2) }}
            .between-col.gap-gaps
              .fs-appFontSizes.color-text200.mb-gaps 🔐 加密后的密文（仅展示）
              pre.code-block(:class='encryptedProfile ? "color-primary100" : "color-text200"') {{ encryptedProfile || '（空）' }}

      // 同步字符串存储
      .panel
        .panel-head.between.items-center
          .between.items-center.gap-gaps
            .emoji.fs-appFontSizex 📝
            .title.fs-appFontSizex.font-semibold.color-primary100 字符串存储示例（加密）
          .fs-appFontSizes.color-text200 useSafeStorageSync(key, initialValue)

        .between-col.gap-gap
          Textarea.textarea.w-full.h-32(v-model='memoText', placeholder='这里输入的内容会实时加密展示（不存储）...')
          .between.gap-gap
            Button(label='清空 Memo', severity='danger', outlined, @click='clearMemo')
            Button(label='填充示例文本', severity='info', text, @click='fillMemo')

        .panel-body
          .between-col.gap-gaps
            .between-col.gap-gaps
              .fs-appFontSizes.color-text200.mb-gaps 🔓 解密后的数据
              pre.code-block {{ memo || '（空）' }}
            .between-col.gap-gaps
              .fs-appFontSizes.color-text200.mb-gaps 🔐 加密后的密文（仅展示）
              pre.code-block(:class='encryptedMemo ? "color-primary100" : "color-text200"') {{ encryptedMemo || '（空）' }}

      // API 说明
      .panel
        .panel-head.between.items-center
          .between.items-center.gap-gaps
            .emoji.fs-appFontSizex 📚
            .title.fs-appFontSizex.font-semibold.color-primary100 API 说明
          .fs-appFontSizes.color-text200 SafeStorage 方法使用说明

        .feature-list
          .feature-item
            .i-carbon-checkmark
            span useSafeStorage(key, initialValue) - 异步对象存储
          .feature-item
            .i-carbon-checkmark
            span useSafeStorageSync(key, initialValue) - 同步字符串存储
          .feature-item
            .i-carbon-checkmark
            span 返回响应式 ref，支持深度监听
          .feature-item
            .i-carbon-checkmark
            span 提供 .clear() 方法重置为初始值
          .feature-item
            .i-carbon-checkmark
            span 支持嵌套对象和数组类型

      // 一键操作区
      .panel
        .panel-head.between.items-center
          .between.items-center.gap-gaps
            .emoji.fs-appFontSizex ⚡
            .title.fs-appFontSizex.font-semibold.color-primary100 一键操作
          .fs-appFontSizes.color-text200 清空或填充演示数据

        .grid.grid-cols-2.gap-gap
          Button(label='全部清空', severity='danger', @click='clearAll')
          Button(label='填充全部示例数据', severity='success', @click='fillAll')

    // 底部提示
    .footer-tip.text-center.bg-bg200.color-primary100
      .fs-appFontSizes.font-semibold 加密效果实时对比演示
      .fs-appFontSize.mt-gaps.opacity-90 左侧展示解密后的数据，右侧展示加密后的密文 · 仅展示不存储 · 实时同步更新
</template>

<style scoped lang="scss">
.page-wrap {
  min-height: 100%;
  background: var(--bg100);
  color: var(--text100);
  padding: var(--gapx);
}

.content {
  width: 100%;
  max-width: calc(var(--gapl) * 40);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.hero-card {
  background: linear-gradient(135deg, var(--bg200), var(--bg100));
  border: 1px solid var(--primary-color-border);
  border-radius: var(--rounded);
  padding: var(--paddingl);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.hero-head .pill {
  padding: var(--paddings) var(--paddingx);
  border-radius: var(--rounded);
  border: 1px solid var(--primary-color-border);
  background: var(--bg200);
}

.hero-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gaps);
}

.tag {
  padding: var(--paddings) var(--padding);
  border-radius: var(--rounded);
  border: 1px solid var(--primary-color-border);
}

.grid-layout {
  width: 100%;
}

.panel {
  background: linear-gradient(145deg, var(--bg200), var(--bg100));
  border: 1px solid var(--secondary-color-border);
  border-radius: var(--rounded);
  padding: var(--paddingl);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.panel-head {
  padding-bottom: var(--gaps);
  border-bottom: 1px solid var(--secondary-color-border);
}

.panel-body {
  background: var(--bg200);
  border: 1px solid var(--secondary-color-border);
  border-radius: var(--rounded);
  padding: var(--padding);
}

.code-block {
  background: var(--bg300);
  color: var(--contrast-color);
  padding: var(--padding);
  border-radius: var(--rounded);
  border: 1px solid var(--secondary-color-border);
  font-size: var(--app-font-size);
  line-height: 1.4;
  max-height: 240px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.feature-list {
  display: grid;
  gap: var(--gaps);
  color: var(--text200);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--gaps);
  background: var(--bg200);
  border-radius: var(--rounded);
  padding: var(--paddings) var(--padding);
  border: 1px solid var(--secondary-color-border);
}

.footer-tip {
  padding: var(--paddingl);
  border-radius: var(--rounded);
  border: 1px solid var(--primary-color-border);
}

.emoji {
  line-height: 1;
}

.col-span-full {
  grid-column: 1 / -1;
}

.config-section {
  background: var(--bg200);
  border: 1px solid var(--secondary-color-border);
  border-radius: var(--rounded);
  padding: var(--padding);
  display: flex;
  flex-direction: column;
  gap: var(--gaps);
}

.section-title {
  padding-bottom: var(--gaps);
  border-bottom: 1px solid var(--secondary-color-border);
}

.config-item {
  padding: var(--paddings) var(--padding);
  background: var(--bg100);
  border-radius: var(--rounded);
  border: 1px solid var(--secondary-color-border);
}

.config-label {
  flex: 1;
}

.action-buttons {
  padding-top: var(--gap);
  border-top: 1px solid var(--secondary-color-border);
}
</style>
